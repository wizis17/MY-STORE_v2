-- =====================================================
-- SIMPLIFY SCHEMA FOR CAMBODIA STORE
-- =====================================================
-- Remove addresses table (not needed for Cambodia)
-- Ensure product images limited to 3 per product
-- Simplify orders table
-- =====================================================

-- Drop addresses table and related objects (if they exist)
DROP TRIGGER IF EXISTS ensure_default_address ON addresses;
DROP FUNCTION IF EXISTS ensure_single_default_address();
DROP TABLE IF EXISTS addresses CASCADE;

-- Update product_images to support max 3 images
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_position_check;
ALTER TABLE product_images ADD CONSTRAINT product_images_position_check CHECK (position >= 0 AND position <= 2);

-- Add unique constraint to ensure each position is unique per product
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_position_key;
ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_position_key UNIQUE(product_id, position);

-- Alter orders table to simplify address fields
-- First, check if we need to migrate existing data
DO $$ 
BEGIN
  -- Add new simplified columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
    ALTER TABLE orders ADD COLUMN customer_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE orders ADD COLUMN customer_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
    ALTER TABLE orders ADD COLUMN delivery_address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'delivery_notes') THEN
    ALTER TABLE orders ADD COLUMN delivery_notes TEXT;
  END IF;
END $$;

-- Migrate existing order data to new format
UPDATE orders 
SET 
  customer_name = COALESCE(shipping_full_name, ''),
  customer_phone = COALESCE(shipping_phone, ''),
  delivery_address = COALESCE(
    shipping_address_line1 || ' ' || 
    COALESCE(shipping_address_line2, '') || ', ' || 
    COALESCE(shipping_city, '') || ', ' || 
    COALESCE(shipping_state, ''),
    ''
  )
WHERE customer_name IS NULL;

-- Now drop old address columns
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_full_name CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_phone CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address_line1 CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address_line2 CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_city CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_state CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_postal_code CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_country CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS billing_full_name CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS billing_address_line1 CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS billing_city CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS billing_state CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS billing_postal_code CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS billing_country CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS carrier CASCADE;

-- Make new columns NOT NULL after data migration (only if they have data)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
    ALTER TABLE orders ALTER COLUMN customer_name SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE orders ALTER COLUMN customer_phone SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
    ALTER TABLE orders ALTER COLUMN delivery_address SET NOT NULL;
  END IF;
END $$;

-- Add 'cash' as payment method option
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('card', 'paypal', 'stripe', 'cash'));

-- Drop indexes related to addresses (if they exist)
DROP INDEX IF EXISTS idx_addresses_user_id;
DROP INDEX IF EXISTS idx_addresses_is_default;

COMMENT ON TABLE product_images IS 'Product images - maximum 3 per product (positions 0, 1, 2)';
COMMENT ON TABLE orders IS 'Orders with simplified Cambodia-style delivery info';
