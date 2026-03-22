# Database Schema Simplification for Cambodia Store

## Changes Made

### ✅ Removed

- **Addresses table** - Not needed for Cambodia local delivery
- Complex shipping/billing address fields in orders
- Address-related policies and triggers

### ✅ Updated

#### Product Images

- Now supports exactly **3 images per product**
- Positions: 0 (primary), 1 (secondary), 2 (tertiary)
- Unique constraint ensures no duplicate positions

#### Orders Table - Simplified

**Old fields (removed):**

- `shipping_full_name`, `shipping_phone`, `shipping_address_line1`, etc.
- `billing_full_name`, `billing_address_line1`, etc.
- `carrier`

**New fields (Cambodia style):**

- `customer_name` - Customer's name
- `customer_phone` - Contact phone number
- `delivery_address` - Simple address text field
- `delivery_notes` - Additional delivery instructions
- `payment_method` - Now includes 'cash' option

## How to Apply Migration

### Step 1: Connect to Supabase

Go to your Supabase project dashboard → SQL Editor

### Step 2: Run Migration

Execute the migration file:

```sql
-- Copy and paste the content from:
supabase/migrations/20260310_simplify_cambodia_schema.sql
```

### Step 3: Verify Changes

```sql
-- Check product_images constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE table_name = 'product_images';

-- Check orders table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Verify addresses table is gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'addresses';
-- Should return no rows
```

### Step 4: Update TypeScript Types (Optional)

If you're using Supabase CLI:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

## What This Means for Your App

### Product Images

- Upload exactly 3 images per product
- Position 0 = Main product image
- Position 1 = Second view
- Position 2 = Third view

### Orders

- Customers provide name, phone, and simple address
- No complex address validation needed
- Perfect for local Cambodia delivery
- Cash payment option available

### Removed Features

- User saved addresses (profile management simplified)
- Complex multi-field address forms
- State/Province/Postal code validation

## Migration Safety

✅ **Data Preserved**: Existing orders are migrated to the new format
✅ **Backward Compatible**: The migration handles existing data gracefully
✅ **Rollback Ready**: Keep a database backup before running

---

**Note**: After running this migration, you'll need to update your frontend forms to use the simplified order fields.
