-- This script updates the orders table to allow Guest checkouts.
-- Run this in your Supabase SQL Editor:

-- 1. Make user_id optional (so guests can check out without logging in)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop the old foreign key constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- 3. Add the new foreign key constraint that allows null
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
