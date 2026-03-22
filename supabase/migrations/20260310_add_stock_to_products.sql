-- =====================================================
-- Add stock field to products table
-- =====================================================
-- Migration Date: 2026-03-10
-- Description: Adds a stock quantity field to track inventory directly on products

-- Add stock column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);

-- Add comment to the column
COMMENT ON COLUMN products.stock IS 'Current stock quantity available for this product';

-- Optional: Update existing products to have stock = 0 if not set
UPDATE products SET stock = 0 WHERE stock IS NULL;
