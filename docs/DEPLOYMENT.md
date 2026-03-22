# Deployment Guide

This guide covers deploying your e-commerce application to production.

## 🚀 Deployment Platforms

### Vercel (Recommended)

Vercel is the easiest option for Next.js applications.

#### Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)

#### Steps

1. **Push to Git**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: .next

3. **Environment Variables**

   Add all environment variables from `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

5. **Custom Domain** (Optional)
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records

#### Vercel Features

✅ Automatic HTTPS  
✅ Edge Network (Global CDN)  
✅ Preview deployments for PRs  
✅ Automatic CI/CD  
✅ Web Analytics  
✅ Zero configuration

---

## 🔧 Environment Setup

### Production Environment Variables

#### Supabase Production

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project (separate from development)
   - Run production schema from `supabase/schema.sql`

2. **Get Production Keys**
   - Project Settings > API
   - Copy production URL and keys

#### Stripe Production

1. **Switch to Live Mode**
   - Toggle "Test Mode" to "Live Mode" in Stripe Dashboard
   - Get live API keys
   - **Important**: Never use test keys in production!

2. **Setup Production Webhook**
   - Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook signing secret

### Security Checklist

Before going live:

- [ ] Use production database
- [ ] Use live Stripe keys
- [ ] Enable Stripe live mode
- [ ] Configure production webhooks
- [ ] Update `NEXT_PUBLIC_APP_URL`
- [ ] Enable HTTPS
- [ ] Set secure CORS policies
- [ ] Configure domain allowlist
- [ ] Review RLS policies
- [ ] Enable rate limiting

---

## 🗄️ Database Migration

### Migrate from Development to Production

1. **Export Development Data** (Optional)

   ```bash
   # Backup products, categories, etc.
   pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres --table=categories > categories.sql
   ```

2. **Run Schema on Production**
   - Copy `supabase/schema.sql`
   - Run in production Supabase SQL Editor

3. **Import Data** (If needed)
   - Import products, categories
   - **Don't** import test users/orders

---

## 📦 Storage Configuration

### Supabase Storage

1. **Create Production Buckets**

   ```sql
   -- Create product-images bucket
   -- Set to public
   ```

2. **Upload Existing Images**
   - Manually upload or use script
   - Update image URLs in database

3. **Configure CDN** (Optional)
   - Use Cloudflare or similar
   - Cache static assets

---

## 🔐 Stripe Configuration

### Live Mode Setup

1. **Activate Stripe Account**
   - Complete business verification
   - Add bank account for payouts

2. **Configure Checkout**
   - Stripe Dashboard > Settings > Checkout
   - Add business details
   - Upload logo

3. **Test Payments**

   ```bash
   # Use real test cards before going live
   # Card: 4242 4242 4242 4242
   # Expiry: Any future date
   # CVC: Any 3 digits
   ```

4. **Enable 3D Secure**
   - Payment methods > Cards
   - Enable SCA compliance

---

## 🌐 Custom Domain

### DNS Configuration

Point your domain to Vercel:

```
A Record:    @ -> 76.76.21.21
CNAME:       www -> cname.vercel-dns.com
```

### SSL Certificate

- Vercel provides automatic SSL
- Certificate renews automatically
- HTTPS enforced by default

---

## 📊 Monitoring & Analytics

### Set Up Monitoring

1. **Vercel Analytics** (Built-in)
   - Automatic Web Vitals
   - Performance metrics
   - Deploy analytics

2. **Supabase Observability**
   - Database > Logs
   - Monitor queries
   - Track errors

3. **Stripe Dashboard**
   - Monitor payments
   - Track revenue
   - View webhooks

### Error Tracking

Add Sentry or similar:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🚦 Health Checks

### Create Health Endpoint

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check database
    const { error } = await supabase.from("products").select("id").limit(1);

    if (error) throw error;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Database connection failed",
      },
      { status: 503 },
    );
  }
}
```

### Monitor Health

Set up uptime monitoring:

- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)
- Vercel's built-in monitoring

---

## 📈 Performance Optimization

### Before Launch

1. **Enable Caching**

   ```typescript
   // next.config.mjs
   const nextConfig = {
     images: {
       deviceSizes: [640, 750, 828, 1080, 1200],
       imageSizes: [16, 32, 48, 64, 96],
     },
   };
   ```

2. **Optimize Images**
   - Use WebP format
   - Proper sizing
   - Lazy loading

3. **Database Indexes**
   - Already created in schema.sql
   - Monitor slow queries

4. **API Routes**
   - Add caching headers
   - Implement rate limiting

### Rate Limiting

Add to API routes:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Handle request
}
```

---

## 🔒 Security Headers

Configure in `next.config.mjs`:

```typescript
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 📋 Post-Deployment Checklist

After deployment:

- [ ] Test all authentication flows
- [ ] Make a test purchase (refund immediately)
- [ ] Verify webhook delivery
- [ ] Test admin dashboard
- [ ] Check mobile responsiveness
- [ ] Verify email notifications
- [ ] Test cart persistence
- [ ] Monitor error logs
- [ ] Set up backups
- [ ] Configure alerts
- [ ] Document admin procedures

---

## 🆘 Troubleshooting

### Common Issues

**Build Fails**

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Environment Variables Not Working**

- Check spelling
- Rebuild after adding new variables
- Verify in Vercel dashboard

**Database Connection Errors**

- Check Supabase project status
- Verify connection string
- Check RLS policies

**Stripe Webhook Fails**

- Verify webhook secret
- Check endpoint URL
- Review webhook logs in Stripe

### Support

- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Stripe: [stripe.com/docs](https://stripe.com/docs)

---

## 🎉 You're Live!

Your e-commerce store is now deployed and ready to accept orders!

**Next Steps:**

1. Add products to your store
2. Test the complete checkout flow
3. Set up email notifications
4. Market your store
5. Monitor performance and sales

---

**Need help? Check the [Security Guide](./SECURITY.md) and main [README](../README.md)**
