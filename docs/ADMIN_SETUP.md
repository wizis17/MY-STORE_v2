# Admin Dashboard and Role Management

This guide explains how the admin dashboard works and how users can manage their roles.

## Overview

The application now allows **any authenticated user** to change their own role between 'customer' and 'admin'. This provides flexibility for users to access admin features when needed.

⚠️ **Security Note**: This configuration allows any user to make themselves an admin. This is suitable for development, small teams, or trusted user bases. For production environments with untrusted users, consider implementing stricter role management.

## How to Change Your Role

### Option 1: Profile Settings Page (Recommended)

1. **Log in** to your account
2. Click on your **profile menu** in the header
3. Select **"Profile Settings"**
4. In the "Account Role" section, you'll see:
   - Your current role
   - Descriptions of Customer and Admin roles
   - Buttons to switch between roles
5. Click **"Switch to Admin"** or **"Switch to Customer"**
6. Confirm the action
7. The page will reload with your new role active

### Option 2: Admin Customers Page

If you're already an admin, you can also manage user roles from:

- Go to `/admin/customers`
- Click the "Make Admin" or "Make Customer" button next to any user
  The Next.js middleware checks every request to `/admin/*` routes:

- Redirects unauthenticated users to `/login`
- Redirects non-admin users to the home page (`/`)

### Server-Side Protection

The admin layout uses `requireAdmin()` function that:

- Verifies user authentication
- Checks user role in the database
- Redirects non-admin users before rendering admin pages

## Database Configuration

### User Role ENUM Type

The application uses a PostgreSQL **ENUM type** called `user_role` for better type safety and performance:

```sql
CREATE TYPE user_role AS ENUM ('customer', 'admin');
```

This is more efficient and type-safe than using TEXT with CHECK constraints.

📖 **See also**: [ROLE_ENUM_MIGRATION.md](./ROLE_ENUM_MIGRATION.md) for detailed information about the ENUM implementation.

### RLS Policies

The Supabase database uses Row Level Security (RLS) with the following policies:

1. \*\*Users can view tset up the role management policies:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration file manually in Supabase SQL Editor
# File: supabase/migrations/20260306_secure_role_changes.sql
```

### Step 2: Create Your Account

1. Sign up at `/signup`
2. Complete the registration process
3. You'll start with the 'customer' role by default

### Step 3: Change Your Role

Once logged in, you can change your role to admin:

1. Go to `/profile` or click "Profile Settings" in the header menu
2. Use the role switcher to change from "customer" to "admin"
3. Confirm the action
4. Your session will reload with admin access

## API Endpoints

### User Profile Role Update

**Endpoint**: `POST /api/profile/update-role`

Allows the current user to change their own role.

```bash
POST /api/profile/update-role
Content-Type: application/json

{
  "role": "admin" | "customer"
}
```

**Response:**

```json
{
  "message": "Role updated successfully",
  "profile": { ... }
}
```

1. Log out and log back in (to refresh your session)
2. Navigate to `/admin` in your browser
3. You should now have access to the admin dashboard

## Managing User Roles

Once you have admin access, you can manage user roles through the admin interface:

1. Go to `/admin/customers` in your application
2. You'll see a list of all users with their current roles
3. Click the **Make Admin** or **Make Customer** button to change a user's role
4. Confirm the action in the popup dialog

### Admin User Role Management

**Endpoint**: `PATCH /api/admin/users/role`

Allows admins to change any user's role.

```bash
PATCH /api/admin/users/role
Content-Type: application/json

{
  "userId": "user-uuid-here",
  "role": "admin" | "customer"
}
```

## Troubleshooting

### Can't Access Admin Dashboard

1. Make sure you're logged in
2. Check your current role at `/profile`
3. If you're a customer, switch to admin role
4. Log out and log back in if needed

### Role Change Not Working

1. Check browser console for errors
2. Verify you're authenticated
3. Try refreshing the page
4. Clear browser cache and cookies

### Page Keeps Redirecting

1. Ensure your session is valid
2. Log out and log in again
3. Check that the middleware is properly configured
4. Verify database connection is working

- All customer permissions, plus:
- Access admin dashboard at `/admin`
- Manage products (create, edit, delete)
- Manage categories
- View and process orders
- Manage user accounts and roles
- Access analytics and reports

## Security Considerations

### Current Configuration (Development/Small Teams)

**Pros:**

- Easy role switching for development
- Flexible for small, trusted teams
- No manual database intervention needed
- Quick testing of admin features

**Cons:**Reference

### Database Files

- `supabase/schema.sql` - Main database schema with RLS policies
- `supabase/migrations/20260306_secure_role_changes.sql` - Role management migration

### Backend Files

- `src/middleware.ts` - Route protection middleware
- `src/lib/auth.ts` - Authentication helpers
- `src/app/api/profile/update-role/route.ts` - User self-role update endpoint
- `src/app/api/admin/users/role/route.ts` - Admin role management endpoint

### Frontend Files

- `src/app/profile/page.tsx` - Profile settings page
- `src/components/profile/ProfileRoleSelector.tsx` - Role switcher component
- `src/app/admin/customers/page.tsx` - User management page
- `src/components/admin/CustomersTable.tsx` - User table with role management
- `src/components/layout/Header.tsx` - Navigation header with profile menu

1. **Modify RLS Policies**: Update the policies to prevent self-role changes
2. **Add Invite System**: Implement an invite-only admin system
3. **Implement Audit Logging**: Track all role changes
4. **Add Email Verification**: Require email verification for role changes
5. **Multi-Factor Authentication**: Add MFA for admin accounts

## Switching to Secure Mode

If you want to prevent users from self-promoting to admin, you can run this SQL in Supabase:

```sql
-- Drop the current policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a restricted policy that prevents role changes
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND (
      -- User cannot change their own role
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      OR
      -- Unless they are an admin
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
```

After applying this, only existing admins can change user roles.

Admin can also programmatically change roles using the API:

```bash
POST /api/admin/users/role
Content-Type: application/json

{
  "userId": "user-uuid-here",
  "role": "admin" | "customer"
}
```

**Note**: This endpoint requires admin authentication and will return a 403 error for non-admin users.

## Security Best Practices

1. **Limit Admin Accounts**: Only create admin accounts for trusted team members
2. **Regular Audits**: Periodically review the list of admin users in `/admin/customers`
3. **Secure Credentials**: Use strong passwords for admin accounts
4. **Monitor Activity**: Check the Supabase logs for suspicious activity
5. **Revoke Access**: Immediately demote former team members to 'customer' role

## Troubleshooting

### "Forbidden: Admin access required" Error

- Ensure your account has the 'admin' role in the database
- Try logging out and logging back in
- Check the browser console for any errors

### Can't Access Admin Pages

- Verify the middleware is properly configured
- Check that your session is active
- Ensure the database connection is working

### Role Changes Not Taking Effect

- Refresh the page after changing roles
- The user whose role was changed needs to log out and log back in
- Check the browser console for API errors

## Files Modified

- `supabase/schema.sql` - Updated RLS policies
- `supabase/migrations/20260306_secure_role_changes.sql` - Migration file
- `src/middleware.ts` - Added admin route protection
- `src/app/api/admin/users/role/route.ts` - API endpoint for role changes
- `src/app/admin/customers/page.tsx` - User management page
- `src/components/admin/CustomersTable.tsx` - Client component for role management
