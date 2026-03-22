# Project Architecture Overview

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  Zustand     │  │  Stripe.js   │     │
│  │  Components  │  │   (State)    │  │   (Client)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 14 (App Router)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  App Pages   │  │  API Routes  │  │  Middleware  │     │
│  │   (SSR/SSG)  │  │   (Server)   │  │    (Auth)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                   ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   Supabase      │ │   Stripe     │ │  File Storage    │
│   (Database     │ │  (Payments)  │ │   (Images)       │
│    & Auth)      │ │              │ │                  │
└─────────────────┘ └──────────────┘ └──────────────────┘
```

---

## 📂 Folder Structure Explained

### `/src/app` - Next.js App Router

**Purpose**: Page routes and API endpoints

```
app/
├── (auth)/              # Authentication group
│   ├── login/          # Login page
│   └── signup/         # Signup page
├── admin/              # Admin dashboard (protected)
│   ├── layout.tsx      # Admin layout with sidebar
│   ├── page.tsx        # Dashboard home
│   ├── products/       # Product management
│   └── orders/         # Order management
├── api/                # API routes
│   ├── products/       # Product endpoints
│   ├── cart/           # Cart operations
│   ├── orders/         # Order processing
│   └── stripe/         # Payment processing
├── products/           # Product pages
│   ├── page.tsx        # Product listing
│   └── [slug]/         # Product detail
├── layout.tsx          # Root layout
└── page.tsx            # Homepage
```

### `/src/components` - React Components

**Purpose**: Reusable UI components

```
components/
├── ui/                 # Base UI components
│   ├── Button.tsx      # Button component
│   ├── Input.tsx       # Form input
│   ├── Card.tsx        # Card container
│   └── ...
├── layout/             # Layout components
│   ├── Header.tsx      # Site header with nav
│   └── Footer.tsx      # Site footer
└── products/           # Product components
    ├── ProductCard.tsx # Product preview card
    └── ProductGrid.tsx # Product grid layout
```

### `/src/lib` - Utility Functions

**Purpose**: Helper functions and configurations

```
lib/
├── supabase/
│   ├── client.ts       # Browser Supabase client
│   ├── server.ts       # Server Supabase client
│   └── middleware.ts   # Auth middleware
├── auth.ts             # Authentication helpers
├── stripe.ts           # Stripe configuration
├── utils.ts            # General utilities
└── validations.ts      # Zod schemas
```

### `/src/types` - TypeScript Types

**Purpose**: Type definitions for type safety

```
types/
├── index.ts            # Main type exports
├── database.ts         # Database helper types
└── supabase.ts         # Supabase generated types
```

---

## 🔄 Data Flow

### Product Browsing Flow

```
1. User visits /products
   ↓
2. Server Component fetches products from Supabase
   ↓
3. Products rendered with SSR
   ↓
4. Client-side filtering updates via URL params
   ↓
5. API route returns filtered products
```

### Authentication Flow

```
1. User enters credentials
   ↓
2. Client calls Supabase Auth
   ↓
3. Supabase returns JWT token
   ↓
4. Token stored in httpOnly cookie
   ↓
5. Middleware validates token on each request
   ↓
6. Server Components access user info
```

### Checkout Flow

```
1. User adds items to cart (Zustand store)
   ↓
2. Cart synced to Supabase database
   ↓
3. User proceeds to checkout
   ↓
4. Order created in database
   ↓
5. Stripe Payment Intent created
   ↓
6. User enters payment details
   ↓
7. Stripe processes payment
   ↓
8. Webhook confirms payment
   ↓
9. Order status updated
   ↓
10. Cart cleared
```

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
profiles (users)
    │
    ├── addresses (1:many)
    │
    ├── orders (1:many)
    │   └── order_items (1:many)
    │
    ├── cart (1:1)
    │   └── cart_items (1:many)
    │
    ├── wishlist (many:many with products)
    │
    └── reviews (1:many)


categories
    │
    └── products (1:many)
        ├── product_images (1:many)
        └── product_variants (1:many)
```

### Key Tables

**profiles**: User information and roles  
**products**: Product catalog  
**product_variants**: Size/color variations  
**orders**: Customer orders  
**order_items**: Line items in orders  
**cart**: Shopping cart  
**cart_items**: Items in cart

---

## 🔐 Security Layers

### 1. Row Level Security (RLS)

Database-level access control:

```sql
-- Users can only see their own orders
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

### 2. Middleware Authentication

Route-level protection:

```typescript
// Validates auth on every request
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

### 3. API Authorization

Endpoint-level checks:

```typescript
// Check user is authenticated
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) return unauthorized();
```

### 4. Role-Based Access

Feature-level restrictions:

```typescript
// Check user is admin
if (user.role !== "admin") return forbidden();
```

---

## ⚡ Performance Optimizations

### 1. Server-Side Rendering (SSR)

- Homepage pre-rendered with featured products
- Product pages generated on-demand
- Fast initial page load

### 2. Image Optimization

```typescript
<Image
  src={imageUrl}
  alt={alt}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 3. Database Indexes

```sql
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### 4. API Response Caching

```typescript
export const revalidate = 3600; // Cache for 1 hour
```

---

## 🧩 State Management

### Client State (Zustand)

**Cart Store**: Manages shopping cart

```typescript
const { items, addItem, removeItem } = useCartStore();
```

### Server State (Supabase)

Persistent data stored in PostgreSQL

### URL State

Filters and pagination in URL params:

```
/products?category=t-shirts&sortBy=price_asc&page=2
```

---

## 🎨 Styling Architecture

### TailwindCSS Utility Classes

```tsx
<button className="bg-primary-600 hover:bg-primary-700 px-4 py-2">
  Click me
</button>
```

### Custom Components

Reusable styled components:

```tsx
<Button variant="primary" size="lg">
  Shop Now
</Button>
```

### Responsive Design

Mobile-first approach:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

---

## 🚀 Deployment Architecture

### Vercel Edge Network

```
User Request
    ↓
Vercel Edge (CDN)
    ↓
Next.js Server
    ↓
┌─────────┬─────────┬─────────┐
│ Supabase│ Stripe  │ Storage │
└─────────┴─────────┴─────────┘
```

### Environment Separation

- **Development**: Local + Supabase Dev
- **Staging**: Vercel Preview + Supabase Staging
- **Production**: Vercel Production + Supabase Prod

---

## 📊 Monitoring & Logging

### Application Logs

```typescript
console.log("Order created", { orderId, userId });
console.error("Payment failed", { error, orderId });
```

### Supabase Logs

- Database queries
- Authentication events
- RLS violations

### Stripe Dashboard

- Payment success/failure
- Webhook deliveries
- Revenue metrics

### Vercel Analytics

- Page views
- Core Web Vitals
- API response times

---

## 🔄 Development Workflow

```
1. Feature Development
   ↓
2. Local Testing
   ↓
3. Git Commit
   ↓
4. Push to GitHub
   ↓
5. Vercel Preview Deploy
   ↓
6. Review & Test
   ↓
7. Merge to Main
   ↓
8. Production Deploy
```

---

## 📦 Dependencies Overview

### Core Dependencies

- **next**: React framework
- **react**: UI library
- **typescript**: Type safety
- **@supabase/supabase-js**: Database client
- **stripe**: Payment processing
- **zustand**: State management
- **zod**: Schema validation
- **tailwindcss**: Styling

### Development Dependencies

- **eslint**: Code linting
- **prettier**: Code formatting
- **@types/**: TypeScript definitions

---

## 🎯 Best Practices Implemented

✅ **Type Safety**: Full TypeScript coverage  
✅ **Security**: RLS + middleware + validation  
✅ **Performance**: SSR + caching + optimization  
✅ **Scalability**: Modular architecture  
✅ **Maintainability**: Clean code + documentation  
✅ **Testing**: Type checking + linting  
✅ **SEO**: SSR + metadata + sitemap  
✅ **Accessibility**: Semantic HTML + ARIA

---

For more details, see:

- [README.md](../README.md) - Full project documentation
- [SECURITY.md](./SECURITY.md) - Security guidelines
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [API.md](./API.md) - API documentation
