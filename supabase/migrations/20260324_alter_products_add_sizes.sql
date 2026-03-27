-- =====================================================
-- ALTER PRODUCTS TABLE - ADD SIZE INFORMATION
-- =====================================================
-- This migration adds capability to track available sizes on products

-- Add column to store available sizes as JSON (for quick queries without joins)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS available_sizes TEXT[] DEFAULT '{}'::TEXT[];

-- Add column to store available colors as JSON
ALTER TABLE products
ADD COLUMN IF NOT EXISTS available_colors TEXT[] DEFAULT '{}'::TEXT[];

-- =====================================================
-- UPDATE FUNCTION: Sync sizes and colors from variants
-- =====================================================
-- This function automatically updates available_sizes and available_colors
-- whenever a variant is added/updated/deleted

CREATE OR REPLACE FUNCTION update_product_available_sizes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update available_sizes and available_colors from variants
  UPDATE products
  SET 
    available_sizes = ARRAY(
      SELECT DISTINCT size 
      FROM product_variants 
      WHERE product_id = NEW.product_id 
      ORDER BY size
    ),
    available_colors = ARRAY(
      SELECT DISTINCT color 
      FROM product_variants 
      WHERE product_id = NEW.product_id 
      ORDER BY color
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on product_variants to update products table
DROP TRIGGER IF EXISTS trigger_update_product_sizes ON product_variants;
CREATE TRIGGER trigger_update_product_sizes
AFTER INSERT OR UPDATE OR DELETE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_available_sizes();

-- =====================================================
-- INITIAL DATA SYNC: Populate available_sizes and available_colors
-- =====================================================
-- Run this once to populate existing products with their sizes/colors

UPDATE products
SET 
  available_sizes = COALESCE(
    ARRAY(
      SELECT DISTINCT size 
      FROM product_variants 
      WHERE product_id = products.id 
      ORDER BY size
    ),
    '{}'::TEXT[]
  ),
  available_colors = COALESCE(
    ARRAY(
      SELECT DISTINCT color 
      FROM product_variants 
      WHERE product_id = products.id 
      ORDER BY color
    ),
    '{}'::TEXT[]
  );

-- =====================================================
-- VERIFY THE CHANGES
-- =====================================================
SELECT 
  id,
  name,
  available_sizes,
  available_colors,
  stock
FROM products
WHERE status = 'active'
ORDER BY name;
