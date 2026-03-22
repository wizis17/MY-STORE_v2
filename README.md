# 🛍️ Modern E-Commerce Store

A production-ready, full-stack e-commerce application built with Next.js 14, TypeScript, Supabase, and Stripe.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

## ✨ Features

### 🛒 Customer Features

- **Product Browsing**: Browse products with advanced filtering (category, gender, price, size, color)
- **Search**: Fast product search functionality
- **Product Details**: Detailed product pages with multiple images and variants
- **Shopping Cart**: Persistent cart with Zustand state management
- **Checkout**: Secure checkout with Stripe payment processing
- **User Authentication**: Email/Password and Google OAuth login
- **Order History**: Track past orders and order status
- **Wishlist**: Save favorite products
- **Reviews**: Rate and review purchased products
- **Responsive Design**: Mobile-first, fully responsive UI

### 👨‍💼 Admin Features

- **Dashboard**: Overview of sales, orders, and customers
- **Product Management**: CRUD operations for products, variants, and images
- **Order Management**: View and update order status
- **Customer Management**: View customer information
- **Inventory Tracking**: Monitor stock levels
- **Role-Based Access**: Secure admin-only routes

### 🔐 Security

- Row Level Security (RLS) with Supabase
- Server-side authentication validation
- Secure payment processing with Stripe
- Environment variable protection
- CSRF protection
- Input validation with Zod

### ⚡ Performance

- Server-side rendering (SSR)
- Image optimization with Next.js Image
- API route caching
- Database indexes for fast queries
- Optimistic UI updates

## 🏗️ Tech Stack

| Category             | Technology              |
| -------------------- | ----------------------- |
| **Framework**        | Next.js 14 (App Router) |
| **Language**         | TypeScript              |
| **Styling**          | TailwindCSS             |
| **Database**         | Supabase (PostgreSQL)   |
| **Authentication**   | Supabase Auth           |
| **Storage**          | Supabase Storage        |
| **Payments**         | Stripe                  |
| **State Management** | Zustand                 |
| **Form Validation**  | Zod + React Hook Form   |
| **Icons**            | Lucide React            |
| **Notifications**    | Sonner                  |

## 📁 Project Structure

```
MY_STORE/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth routes (login, signup)
│   │   ├── (customer)/        # Customer pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   │   ├── products/      # Product endpoints
│   │   │   ├── cart/          # Cart endpoints
│   │   │   ├── categories/    # Category endpoints
│   │   │   └── stripe/        # Stripe webhooks
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   └── products/          # Product-specific components
│   ├── lib/                   # Utility functions
│   │   ├── supabase/          # Supabase clients
│   │   ├── auth.ts            # Auth helpers
│   │   ├── stripe.ts          # Stripe client
│   │   ├── utils.ts           # General utilities
│   │   └── validations.ts     # Zod schemas
│   ├── store/                 # Zustand stores
│   │   └── cart.ts            # Cart state
│   ├── types/                 # TypeScript types
│   │   ├── index.ts           # Main types
│   │   ├── database.ts        # Database types
│   │   └── supabase.ts        # Supabase generated types
│   └── middleware.ts          # Next.js middleware
├── supabase/
│   ├── schema.sql             # Database schema
│   └── README.md              # Supabase setup guide
├── .env.example               # Environment variables template
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Stripe account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd MY_STORE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
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
ADMIN_EMAIL=admin@yourstore.com
```

### 4. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and run the SQL from `supabase/schema.sql`
4. Follow the detailed setup guide in `supabase/README.md`

### 5. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set up webhooks pointing to `your-domain/api/stripe/webhook`
4. Add webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Create Admin User

1. Sign up through the app
2. Go to Supabase Dashboard > Authentication > Users
3. Copy your user UUID
4. Run in SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';
```

## 📚 Documentation

- **[Database Schema](./supabase/README.md)** - Database structure and RLS policies
- **[API Documentation](./docs/API.md)** - API endpoints and usage
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - How to deploy to production
- **[Security Best Practices](./docs/SECURITY.md)** - Security guidelines

## 🎨 Design Philosophy

This application follows modern e-commerce design patterns inspired by:

- **Nike**: Clean, minimal product layouts
- **Zara**: Modern typography and spacing
- **Uniqlo**: Simple, functional UI

### Design Principles

1. **Mobile-First**: Optimized for mobile shopping experience
2. **Fast Loading**: Optimized images and lazy loading
3. **Accessibility**: WCAG compliant components
4. **Intuitive Navigation**: Easy product discovery
5. **Trust Signals**: Clear pricing, shipping info, and secure checkout

## 🔧 Key Features Implementation

### Authentication Flow

```typescript
// Server-side auth check
import { requireAuth } from "@/lib/auth";

export default async function ProtectedPage() {
  const user = await requireAuth(); // Redirects if not authenticated
  // Your protected content
}
```

### Cart Management

```typescript
// Using Zustand store
import { useCartStore } from "@/store/cart";

const { items, addItem, removeItem, totalItems, subtotal } = useCartStore();
```

### Product Filtering

```typescript
// API endpoint with filters
GET /api/products?category=t-shirts&gender=men&minPrice=20&maxPrice=50&sortBy=price_asc
```

### Payment Processing

```typescript
// Create payment intent
const response = await fetch("/api/stripe/create-payment-intent", {
  method: "POST",
  body: JSON.stringify({ amount, orderId }),
});
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

- **Netlify**: Supports Next.js
- **Railway**: Full-stack deployment
- **AWS/GCP/Azure**: Custom deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security Considerations

- ✅ Always use server-side validation
- ✅ Never expose service role keys to client
- ✅ Enable RLS on all Supabase tables
- ✅ Use HTTPS in production
- ✅ Validate all user inputs
- ✅ Sanitize data before rendering
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting on API routes

## 🚀 Performance Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatic with Next.js App Router
3. **Database Indexes**: Created for common queries
4. **Caching**: Implement Redis for session storage (optional)
5. **CDN**: Use Vercel Edge Network or Cloudflare

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Stripe](https://stripe.com/) - Payment processing
- [Vercel](https://vercel.com/) - Hosting platform
- [TailwindCSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

For questions or issues:

- Open an issue on GitHub
- Email: support@yourstore.com

## 🗺️ Roadmap

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Order tracking
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Discount codes and promotions
- [ ] Product recommendations
- [ ] Social media integration
- [ ] PWA support

---

**Built with ❤️ using Next.js, TypeScript, Supabase, and Stripe**
