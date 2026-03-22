# Database Role ENUM Migration Guide

## Overview

The `role` field in the `profiles` table has been updated from a `TEXT` type with CHECK constraint to a proper PostgreSQL `user_role` ENUM type.

## Why ENUM Instead of TEXT?

### Benefits of ENUM:

✅ **Type Safety**: Database-level enforcement of valid values  
✅ **Performance**: ENUMs are stored as integers internally (more efficient)  
✅ **Clarity**: Explicit definition of allowed values  
✅ **IDE Support**: Better autocomplete and type checking  
✅ **Less Storage**: ENUMs use less disk space than TEXT

### Previous Implementation (TEXT):

```sql
role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin'))
```

### New Implementation (ENUM):

```sql
-- Define the ENUM type
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- Use it in the table
role user_role NOT NULL DEFAULT 'customer'
```

## Migration Steps

### Common Error

If you see this error:

```
ERROR: default for column "role" cannot be cast automatically to type user_role
```

This happens because PostgreSQL can't automatically cast the TEXT default to ENUM. Use the fix below.

### Step 1: Apply the Migration

**Option A: Quick Fix (Recommended)**

Copy and paste this into your Supabase SQL Editor:

```sql
-- Create ENUM type (skip if exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop CHECK constraint if exists
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Drop default
ALTER TABLE profiles
  ALTER COLUMN role DROP DEFAULT;

-- Convert column type
ALTER TABLE profiles
  ALTER COLUMN role TYPE user_role
  USING role::text::user_role;

-- Re-add default with ENUM type
ALTER TABLE profiles
  ALTER COLUMN role SET DEFAULT 'customer'::user_role;
```

**Option B: Use Migration File**

```bash
# Using Supabase CLI
supabase db push
```

Or run the migration file:

```bash
psql -f supabase/migrations/QUICKFIX_role_enum.sql
```

### Step 2: Verify the Change

Check that the ENUM type exists:

```sql
-- View all ENUM types
SELECT typname, typtype
FROM pg_type
WHERE typtype = 'e';

-- View ENUM values
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'user_role'::regtype
ORDER BY enumsortorder;
```

### Step 3: Test Role Changes

1. Log in to your application
2. Go to `/profile`
3. Try switching between customer and admin roles
4. Verify the changes persist in the database

## Adding New Roles (Future)

If you need to add more roles in the future:

```sql
-- Add a new role to the ENUM
ALTER TYPE user_role ADD VALUE 'moderator';
ALTER TYPE user_role ADD VALUE 'super_admin';
```

**Note**: You can only add new values, not remove them. If you need to remove a value, you'll need to:

1. Migrate all users away from that role
2. Drop and recreate the ENUM type
3. Reapply it to the table

## TypeScript Types

The TypeScript types are already configured to match:

```typescript
// In src/types/supabase.ts
export interface Database {
  public: {
    Enums: {
      user_role: "customer" | "admin";
      // ... other enums
    };
    Tables: {
      profiles: {
        Row: {
          role: "customer" | "admin"; // Maps to user_role ENUM
          // ... other fields
        };
      };
    };
  };
}
```

## Rollback (If Needed)

If you need to roll back to TEXT:

```sql
-- Convert ENUM back to TEXT
ALTER TABLE profiles
  ALTER COLUMN role TYPE TEXT
  USING role::TEXT;

-- Add CHECK constraint
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin'));

-- Drop the ENUM type (if no longer used)
DROP TYPE IF EXISTS user_role;
```

## Troubleshooting

### Error: "default for column 'role' cannot be cast automatically to type user_role"

**Cause**: PostgreSQL can't automatically convert the TEXT default value to ENUM type.

**Solution**: Run the Quick Fix SQL above which:

1. Drops the CHECK constraint
2. Drops the default value
3. Converts the column type
4. Re-adds the default with proper ENUM casting

### Error: "type user_role already exists"

This is normal if you run the migration multiple times. The `DO $$ BEGIN ... EXCEPTION` block handles this.

### Error: "cannot cast type text to user_role"

Make sure all existing role values are either 'customer' or 'admin'. Check with:

```sql
SELECT DISTINCT role FROM profiles;
```

If you have invalid values, fix them first:

```sql
-- Update any invalid roles
UPDATE profiles SET role = 'customer' WHERE role NOT IN ('customer', 'admin');
```

### Error: "column role is of type user_role but expression is of type text"

Update your queries to cast properly:

```sql
-- Wrong
UPDATE profiles SET role = 'admin' WHERE id = '...';

-- Correct (though explicit cast usually not needed)
UPDATE profiles SET role = 'admin'::user_role WHERE id = '...';
```

## Database Schema

The complete ENUM definition in the schema:

```sql
-- =====================================================
-- ENUMS
-- =====================================================
-- User role enum
CREATE TYPE user_role AS ENUM ('customer', 'admin');
```

This ENUM is now used across:

- ✅ `profiles` table
- ✅ RLS policies
- ✅ API endpoints
- ✅ TypeScript types

## References

- [PostgreSQL ENUM Types](https://www.postgresql.org/docs/current/datatype-enum.html)
- [Supabase Database Types](https://supabase.com/docs/guides/database/database-types)
