# Security Best Practices

This document outlines security best practices for the e-commerce application.

## 🔐 Authentication & Authorization

### Server-Side Validation

**Always validate authentication on the server:**

```typescript
// ✅ Good - Server-side validation
import { requireAuth } from "@/lib/auth";

export default async function ProtectedPage() {
  const user = await requireAuth();
  // User is guaranteed to be authenticated
}
```

```typescript
// ❌ Bad - Client-side only
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const router = useRouter();
  // User could bypass this by disabling JavaScript
  useEffect(() => {
    if (!user) router.push("/login");
  }, []);
}
```

### Role-Based Access Control

Use the `requireAdmin()` helper for admin routes:

```typescript
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin(); // Throws and redirects if not admin
  // Admin-only content
}
```

## 🔑 Environment Variables

### Never Expose Secrets

**Public (NEXT*PUBLIC*) vs Private:**

```env
# ✅ Safe to expose (client-side)
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test...

# ❌ NEVER expose (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
STRIPE_SECRET_KEY=sk_test...
STRIPE_WEBHOOK_SECRET=whsec...
```

### .gitignore Configuration

Ensure `.env.local` is in `.gitignore`:

```gitignore
# Environment variables
.env*.local
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## 🛡️ Row Level Security (RLS)

### Supabase RLS Policies

All tables have RLS enabled. Key policies:

**Products**: Public can read active products, admins can manage:

```sql
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'active' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

**Orders**: Users can only see their own orders:

```sql
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

### Testing RLS Policies

Test policies in Supabase SQL Editor:

```sql
-- Test as authenticated user
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM orders; -- Should only return user's orders

-- Test as anonymous
RESET request.jwt.claim.sub;
SELECT * FROM products; -- Should only return active products
```

## 🔒 API Route Security

### Validate User Authentication

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Proceed with authenticated request
}
```

### Validate Admin Role

```typescript
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with admin action
}
```

## 🧪 Input Validation

### Use Zod Schemas

Always validate user inputs:

```typescript
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().min(0).max(10000),
  status: z.enum(["draft", "active", "archived"]),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate input
  const result = productSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error },
      { status: 400 },
    );
  }

  // Use validated data
  const validatedData = result.data;
}
```

## 💳 Payment Security

### Stripe Best Practices

1. **Never store card details**: Let Stripe handle all sensitive data
2. **Use Payment Intents**: For 3D Secure and SCA compliance
3. **Verify webhooks**: Always verify webhook signatures

```typescript
// Verify webhook signature
const signature = headers.get("stripe-signature");
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

4. **Server-side only**: Process payments only on server
5. **Idempotency**: Use idempotency keys for payment retries

### PCI Compliance

- ✅ Use Stripe Elements for card input
- ✅ Never log card numbers
- ✅ Use HTTPS in production
- ✅ Keep Stripe SDK updated

## 🚫 Common Vulnerabilities

### SQL Injection Prevention

**Supabase automatically protects against SQL injection**, but be careful:

```typescript
// ✅ Safe - Parameterized query
const { data } = await supabase
  .from("products")
  .select("*")
  .eq("slug", userInput);

// ❌ Dangerous - Raw SQL with user input
const { data } = await supabase.rpc("raw_sql", {
  query: `SELECT * FROM products WHERE slug = '${userInput}'`,
});
```

### XSS Prevention

Next.js automatically escapes JSX, but be careful with:

```typescript
// ✅ Safe - React escapes by default
<div>{userContent}</div>

// ❌ Dangerous - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Safe with sanitization
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### CSRF Protection

Next.js API routes are protected by default. For forms:

```typescript
// Use Next.js built-in CSRF protection
// Server Actions automatically include CSRF tokens
```

## 🔐 Password Security

### Password Requirements

Enforce strong passwords:

```typescript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");
```

### Password Storage

- ✅ Supabase handles password hashing with bcrypt
- ✅ Never log passwords
- ✅ Don't send passwords in URLs or query params

## 📝 Logging & Monitoring

### What to Log

```typescript
// ✅ Log security events
console.log("Failed login attempt", { email, ip, timestamp });
console.log("Admin action", { admin_id, action, resource });

// ❌ Never log sensitive data
console.log("User password", password); // NEVER!
console.log("Credit card", cardNumber); // NEVER!
```

### Monitoring

Set up monitoring for:

- Failed authentication attempts
- Admin actions
- Payment failures
- API errors
- Unusual patterns

## 🔄 Session Management

### Supabase Session Security

```typescript
// Sessions are automatically managed by Supabase
// Refresh tokens are securely stored in httpOnly cookies

// Logout
await supabase.auth.signOut();
```

### Session Duration

Configure in Supabase Dashboard:

- JWT expiry: 1 hour (default)
- Refresh token expiry: 30 days
- Session timeout: Based on activity

## 🌐 HTTPS

### Production Requirements

- ✅ Always use HTTPS in production
- ✅ Enable HSTS headers
- ✅ Use secure cookies

### Next.js Security Headers

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

## 🚨 Incident Response

### If Credentials Are Leaked

1. **Immediately rotate** all API keys
2. **Revoke** compromised tokens
3. **Notify users** if personal data was accessed
4. **Review logs** for unauthorized access
5. **Update** security measures

### Key Rotation Checklist

- [ ] Supabase service role key
- [ ] Stripe secret key
- [ ] Database password
- [ ] OAuth client secrets
- [ ] JWT secret (if custom)

## ✅ Security Checklist

Before deploying to production:

- [ ] All environment variables are secure
- [ ] RLS is enabled on all tables
- [ ] Admin routes require authentication
- [ ] Input validation on all forms
- [ ] Rate limiting on API routes
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include sensitive data
- [ ] Dependencies are up to date
- [ ] Stripe webhook signature verification
- [ ] Regular security audits scheduled

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Security](https://stripe.com/docs/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

---

**Stay secure! Regular security audits and updates are essential.**
