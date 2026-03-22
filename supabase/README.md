# Supabase Setup Guide

This document explains how to set up your Supabase backend for the e-commerce application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: MY_STORE (or your preferred name)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Click "Create new project"

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute

This will create:

- All database tables
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers and functions
- Initial seed data

## Step 3: Configure Storage for Product Images

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Create a bucket named `product-images`
4. Set it to **Public** (so images can be viewed without authentication)
5. Click **Save**

### Storage Policies

Add these policies to the `product-images` bucket:

**Policy 1: Public Read**

```sql
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

**Policy 2: Authenticated Upload**

```sql
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Admin Delete**

```sql
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

## Step 4: Get Your API Keys

1. Go to **Project Settings** > **API**
2. Copy these values:
   - **Project URL**: Your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: Your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to **Project Settings** > **API** > **Service Role**
4. Copy the **service_role key**: Your `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Warning**: Never expose the service role key on the client side!

## Step 5: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=your-admin-email@example.com
```

## Step 6: Create Your First Admin User

1. Sign up through your application's signup page
2. Go to Supabase Dashboard > **Authentication** > **Users**
3. Find your user and copy the UUID
4. Go to **SQL Editor** and run:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'your-user-uuid-here';
```

Now you can log in with admin privileges!

## Step 7: Enable Authentication Providers

### Email/Password (Already Enabled)

This is enabled by default.

### Google OAuth

1. Go to **Authentication** > **Providers**
2. Click on **Google**
3. Enable it
4. Follow the instructions to:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret
5. Save the configuration

## Database Structure Overview

### Core Tables

- **profiles**: User profiles (extends auth.users)
- **addresses**: User shipping/billing addresses
- **categories**: Product categories (T-Shirts, Pants)
- **products**: Product information
- **product_images**: Product image URLs
- **product_variants**: Size and color variations with inventory
- **carts**: Shopping carts
- **cart_items**: Items in shopping carts
- **orders**: Customer orders
- **order_items**: Line items in orders
- **reviews**: Product reviews
- **wishlist**: User wishlists

### Security Features

✅ Row Level Security (RLS) enabled on all tables
✅ Customers can only access their own data
✅ Admins have full access
✅ Public can view active products
✅ Secure payment processing

## Testing Your Setup

Run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see all the tables listed above.

## Next Steps

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Create your first admin account
4. Start adding products!

## Troubleshooting

**Issue**: RLS policies preventing actions

- Check that policies are created correctly
- Verify user role in profiles table
- Use Supabase SQL logs to debug

**Issue**: Storage upload fails

- Verify bucket exists and is public
- Check storage policies
- Ensure file size is within limits

**Issue**: Authentication not working

- Verify environment variables
- Check Supabase URL and keys
- Review auth provider settings

## Backup and Migrations

To backup your database:

```bash
supabase db dump > backup.sql
```

To restore:

```bash
supabase db reset < backup.sql
```

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
