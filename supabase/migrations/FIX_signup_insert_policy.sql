-- =====================================================
-- QUICK FIX: Add INSERT policy for profile creation
-- =====================================================
-- This fixes the issue where profiles can't be created
-- during signup because the INSERT policy is missing
-- =====================================================

-- Add INSERT policy for profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✓ INSERT policy added! Users can now create profiles on signup.';
END $$;
