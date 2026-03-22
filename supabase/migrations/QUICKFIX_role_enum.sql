-- =====================================================
-- QUICK FIX: Convert role column to ENUM
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create ENUM type (skip error if exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'user_role type already exists, skipping...';
END $$;

-- 2. Drop CHECK constraint if exists
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Drop default
ALTER TABLE profiles 
  ALTER COLUMN role DROP DEFAULT;

-- 4. Convert column type
ALTER TABLE profiles 
  ALTER COLUMN role TYPE user_role 
  USING role::text::user_role;

-- 5. Re-add default with ENUM type
ALTER TABLE profiles 
  ALTER COLUMN role SET DEFAULT 'customer'::user_role;

-- 6. Verify the change
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';

-- Success message
DO $$ BEGIN
  RAISE NOTICE 'Successfully converted role column to user_role ENUM type!';
END $$;
