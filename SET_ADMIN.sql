-- =====================================================
-- MAKE YOUR ACCOUNT ADMIN
-- =====================================================
-- Run this in Supabase SQL Editor to make yourself admin
-- Replace the email with your actual email address
-- =====================================================

-- Step 1: Check your current role
SELECT email, role, created_at 
FROM profiles 
WHERE email = 'kimtheng324283@gmail.com';

-- Step 2: Update your role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'kimtheng324283@gmail.com';

-- Step 3: Verify the change
SELECT email, role, created_at 
FROM profiles 
WHERE email = 'kimtheng324283@gmail.com';

-- You should see: role = 'admin'
-- Now refresh your browser and the Admin Dashboard link will appear!
