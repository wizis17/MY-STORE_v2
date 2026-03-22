-- =====================================================
-- COMPLETE MIGRATION: Setup Profiles with Role ENUM
-- Date: 2026-03-06
-- =====================================================
-- This script handles both scenarios:
-- 1. Fresh database (no profiles table)
-- 2. Existing database (profiles table with TEXT role)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM type for user roles (if not exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'user_role type already exists, skipping...';
END $$;

-- =====================================================
-- SCENARIO 1: Profiles table doesn't exist yet
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer'::user_role,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SCENARIO 2: Profiles table exists but role is TEXT
-- =====================================================
-- Check if role column exists and is TEXT type
DO $$ 
DECLARE
  role_column_type TEXT;
BEGIN
  -- Get the current data type of the role column
  SELECT data_type INTO role_column_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role';
  
  -- If role column exists and is TEXT, convert it to ENUM
  IF role_column_type = 'text' THEN
    RAISE NOTICE 'Converting role column from TEXT to user_role ENUM...';
    
    -- CRITICAL: Drop policies FIRST (they depend on the role column)
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
    DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
    
    -- Drop CHECK constraint if exists
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    
    -- Drop default
    ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
    
    -- Convert column type
    ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::text::user_role;
    
    -- Re-add default
    ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'customer'::user_role;
    
    RAISE NOTICE 'Successfully converted role column to ENUM!';
  ELSIF role_column_type = 'USER-DEFINED' THEN
    RAISE NOTICE 'Role column is already a user_role ENUM, skipping conversion...';
    -- Still need to drop policies to recreate them
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
    DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
  ELSIF role_column_type IS NULL THEN
    RAISE NOTICE 'Role column does not exist yet, it will be created by CREATE TABLE IF NOT EXISTS...';
  END IF;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Note: Policies are dropped in the conversion step above if needed
-- Now create fresh policies

-- Users can view their own profile or if they're admin
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile INCLUDING their role
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (needed for signup trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$ 
DECLARE
  role_type TEXT;
  role_default TEXT;
BEGIN
  -- Check the role column configuration
  SELECT data_type, column_default INTO role_type, role_default
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role';
  
  RAISE NOTICE '✓ Migration complete!';
  RAISE NOTICE '  - Role column type: %', role_type;
  RAISE NOTICE '  - Role default value: %', role_default;
  RAISE NOTICE '  - Any authenticated user can change their own role';
END $$;
