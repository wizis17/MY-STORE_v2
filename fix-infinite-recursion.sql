-- ==========================================
-- FIX FOR PROFILES INFINITE RECURSION
-- ==========================================

-- 1. Create a secure function to check admin status
-- The SECURITY DEFINER flag makes it bypass RLS so it doesn't loop infinitely
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Drop the recursive policies on the profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- 3. Recreate them using our safe function
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR is_admin()
  );

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    is_admin()
  );
