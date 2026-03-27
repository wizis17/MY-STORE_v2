# Cart & Checkout Integration Guide

## Overview

This document explains the cart and checkout implementation with Stripe integration.

## Features Implemented

### 1. **Cart Page** (`/src/app/cart/page.tsx`)

- Displays all items in the shopping bag
- Quantity controls (increase/decrease)
- Remove item functionality
- Order summary with subtotal, shipping ($50), and total
- Links to continue shopping or checkout

### 2. **Checkout Page** (`/src/app/checkout/page.tsx`)

- Shipping information form (email, name, address, city, postal code, country)
- Order summary sidebar
- **Stripe Payment Integration** - Creates payment intent and redirects to Stripe Checkout

### 3. **Order Success Page** (`/src/app/order-success/page.tsx`)

- Confirmation page after successful payment
- Clears the cart automatically
- Shows next steps

### 4. **Product Detail Page Updates** (`/src/app/products/[slug]/page.tsx`)

- "Add to Cart" button now fully functional
- Shows toast notification on item added
- Respects selected size and color
- Tracks quantity

### 5. **Toast Notifications** (`/src/components/ui/Toast.tsx`)

- Success/error messages on cart actions
- Auto-dismisses after 3 seconds
- Closeable manually

### 6. **Header Updates**

- Cart icon displays item count badge
- Click to reveal slide-out cart (via `openCart()`)

## Environment Variables Required

Add these to your `.env.local` file:

```
# Stripe Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Workflow

### Adding Items to Cart

1. User browses products
2. Selects size/color/quantity
3. Clicks "Add to Cart"
4. Toast notification confirms the action
5. Item count badge updates in header

### Checkout

1. User views cart (click cart icon in header)
2. Clicks "Proceed to Checkout"
3. Fills in shipping information
4. Clicks "Place Order"
5. `POST /api/stripe/payment-intent` creates payment intent
6. Redirected to Stripe Checkout page
7. User completes payment
8. Success page confirms order

## API Endpoints

### `POST /api/stripe/payment-intent`

Creates a Stripe payment intent for checkout.

**Request:**

```json
{
  "items": [
    {
      "id": "item-1",
      "product": { ... },
      "price": 10000,
      "quantity": 2,
      ...
    }
  ],
  "customerEmail": "user@example.com",
  "shippingInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "...",
    "city": "...",
    "postalCode": "...",
    "country": "..."
  }
}
```

**Response:**

```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

## Important Notes

1. **Cart Store** (`/src/store/cart.ts`)
   - Uses Zustand for state management
   - Persists to localStorage
   - Methods: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`

2. **Stripe Checkout**
   - Currently uses `redirectToCheckout()` which redirects to Stripe Hosted Checkout
   - For embedded payment form, see Stripe Elements setup

3. **Shipping Cost**
   - Currently fixed at $50 per order
   - Can be made dynamic based on location or cart weight

4. **Cart Item ID**
   - Temporarily uses `temp-${Date.now()}` format
   - Should be persisted to database via `/api/cart` endpoint once user is authenticated

## Testing

### Test Card Numbers (Stripe)

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0027 6000 3184`

## Future Enhancements

1. Persist cart items to database (currently client-side only)
2. Discount code/coupon support
3. Dynamic shipping calculation
4. Gift cards
5. Order tracking
6. Email order confirmation
7. Payment method alternatives (PayPal, Apple Pay, etc.)
