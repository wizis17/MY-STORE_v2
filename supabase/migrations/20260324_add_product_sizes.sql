-- =====================================================
-- ADD PRODUCT SIZES/VARIANTS
-- =====================================================
-- This migration adds size variants to products
-- Supports: XS, S, M, L, XL, XXL for apparel
-- Also numeric sizes for pants: 28, 30, 32, 34, 36, 38, 40, 42

-- First, get a sample product ID to add variants to
-- SELECT id, name FROM products WHERE status = 'active' LIMIT 1;

-- =====================================================
-- INSERT SAMPLE VARIANTS FOR EACH PRODUCT
-- =====================================================
-- This adds size/color combinations to your products

DO $$ 
DECLARE
  product_id_var UUID;
BEGIN
  -- Get the first active product
  SELECT id INTO product_id_var FROM products WHERE status = 'active' LIMIT 1;
  
  IF product_id_var IS NOT NULL THEN
    -- Insert size variants (S, M, L, XL) with multiple colors
    INSERT INTO product_variants (product_id, size, color, quantity, price_adjustment)
    VALUES
      (product_id_var, 'S', 'Black', 10, 0),
      (product_id_var, 'S', 'White', 8, 0),
      (product_id_var, 'S', 'Navy', 6, 0),
      (product_id_var, 'M', 'Black', 15, 0),
      (product_id_var, 'M', 'White', 12, 0),
      (product_id_var, 'M', 'Navy', 10, 0),
      (product_id_var, 'L', 'Black', 12, 0),
      (product_id_var, 'L', 'White', 10, 0),
      (product_id_var, 'L', 'Navy', 8, 0),
      (product_id_var, 'XL', 'Black', 8, 0),
      (product_id_var, 'XL', 'White', 6, 0),
      (product_id_var, 'XL', 'Navy', 5, 0)
    ON CONFLICT (product_id, size, color) DO UPDATE 
    SET quantity = EXCLUDED.quantity;
    
    RAISE NOTICE 'Added size variants to product: %', product_id_var;
  ELSE
    RAISE WARNING 'No active products found to add variants to';
  END IF;
END $$;

-- =====================================================
-- VERIFY THE VARIANTS WERE ADDED
-- =====================================================
SELECT 
  p.name,
  COUNT(DISTINCT pv.size) as total_sizes,
  COUNT(DISTINCT pv.color) as total_colors,
  STRING_AGG(DISTINCT pv.size, ', ' ORDER BY pv.size) as available_sizes,
  STRING_AGG(DISTINCT pv.color, ', ' ORDER BY pv.color) as available_colors
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
GROUP BY p.id, p.name
ORDER BY p.name;
