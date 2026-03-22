# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

Most endpoints require authentication via Supabase Auth. Include the session token in requests:

```typescript
const supabase = createClient();
const {
  data: { session },
} = await supabase.auth.getSession();

fetch("/api/endpoint", {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
```

---

## Products

### GET /api/products

Retrieve a list of products with filtering and pagination.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category slug
- `gender` (string): Filter by gender (men/women/unisex)
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `search` (string): Search product names
- `featured` (boolean): Show only featured products
- `sortBy` (string): Sort order (newest/price_asc/price_desc)

**Response:**

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "price": 29.99,
      "category": {
        "id": "uuid",
        "name": "T-Shirts"
      },
      "images": [
        {
          "image_url": "https://...",
          "position": 0
        }
      ],
      "variants": [
        {
          "id": "uuid",
          "size": "M",
          "color": "Blue",
          "quantity": 10
        }
      ]
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 12,
  "totalPages": 4
}
```

**Example:**

```bash
GET /api/products?category=t-shirts&gender=men&sortBy=price_asc&page=1
```

---

### GET /api/products/[slug]

Get a single product by slug.

**Response:**

```json
{
  "product": {
    "id": "uuid",
    "name": "Classic White T-Shirt",
    "slug": "classic-white-t-shirt",
    "description": "Premium cotton t-shirt...",
    "price": 29.99,
    "compare_at_price": 39.99,
    "category": { ... },
    "images": [ ... ],
    "variants": [ ... ]
  }
}
```

---

## Categories

### GET /api/categories

Get all categories.

**Response:**

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "T-Shirts",
      "slug": "t-shirts",
      "description": "Comfortable t-shirts"
    }
  ]
}
```

### POST /api/categories

Create a new category (Admin only).

**Request Body:**

```json
{
  "name": "Category Name",
  "slug": "category-name",
  "description": "Category description"
}
```

**Authorization:** Admin role required

---

## Cart

### GET /api/cart

Get current user's cart with items.

**Authorization:** Required

**Response:**

```json
{
  "cart": {
    "id": "uuid",
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "variant_id": "uuid",
      "quantity": 2,
      "price": 29.99,
      "product": { ... },
      "variant": { ... },
      "product_image": "https://..."
    }
  ]
}
```

---

### POST /api/cart

Add item to cart.

**Authorization:** Required

**Request Body:**

```json
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "quantity": 1
}
```

**Response:**

```json
{
  "item": {
    "id": "uuid",
    "cart_id": "uuid",
    "product_id": "uuid",
    "quantity": 1,
    "price": 29.99
  }
}
```

---

### DELETE /api/cart?itemId=uuid

Remove item from cart.

**Authorization:** Required

**Response:**

```json
{
  "success": true
}
```

---

## Orders

### GET /api/orders

Get user's order history (or all orders for admin).

**Authorization:** Required

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response:**

```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-20240101-1234",
      "total": 89.97,
      "status": "processing",
      "payment_status": "paid",
      "created_at": "2024-01-01T00:00:00Z",
      "items": [ ... ]
    }
  ],
  "total": 15,
  "page": 1
}
```

---

### POST /api/orders

Create a new order.

**Authorization:** Required

**Request Body:**

```json
{
  "shipping_address": {
    "full_name": "John Doe",
    "phone": "1234567890",
    "address_line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "billing_same_as_shipping": true,
  "customer_notes": "Please ring doorbell"
}
```

**Response:**

```json
{
  "order": {
    "id": "uuid",
    "order_number": "ORD-20240101-1234",
    "total": 89.97,
    "status": "pending"
  }
}
```

---

### PATCH /api/orders/[id]

Update order status (Admin only).

**Authorization:** Admin required

**Request Body:**

```json
{
  "status": "shipped",
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS"
}
```

---

## Stripe

### POST /api/stripe/create-payment-intent

Create a Stripe payment intent.

**Authorization:** Required

**Request Body:**

```json
{
  "amount": 89.97,
  "orderId": "uuid"
}
```

**Response:**

```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx"
}
```

---

### POST /api/stripe/webhook

Stripe webhook endpoint (handles payment events).

**No manual calls** - This is called by Stripe automatically.

**Events Handled:**

- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## User Profile

### GET /api/profile

Get current user's profile.

**Authorization:** Required

**Response:**

```json
{
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "phone": "1234567890"
  }
}
```

---

### PATCH /api/profile

Update user profile.

**Authorization:** Required

**Request Body:**

```json
{
  "full_name": "John Doe",
  "phone": "1234567890"
}
```

---

## Addresses

### GET /api/addresses

Get user's saved addresses.

**Authorization:** Required

**Response:**

```json
{
  "addresses": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "address_line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "is_default": true
    }
  ]
}
```

---

### POST /api/addresses

Add new address.

**Authorization:** Required

**Request Body:**

```json
{
  "full_name": "John Doe",
  "phone": "1234567890",
  "address_line1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "US",
  "is_default": false
}
```

---

## Error Responses

All endpoints follow this error format:

```json
{
  "error": "Error message",
  "details": { ... }
}
```

**Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

API routes are rate limited:

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 200 requests per minute
- **Admin endpoints**: 500 requests per minute

---

## Webhooks

### Stripe Webhook

**Endpoint:** `POST /api/stripe/webhook`

**Events:**

- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed

**Setup:**

1. Go to Stripe Dashboard
2. Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events listed above
4. Copy webhook signing secret to `.env`

---

## Testing

### Development

```bash
# Start development server
npm run dev

# Test API endpoint
curl http://localhost:3000/api/products
```

### Stripe Testing

Use test card numbers:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

## Additional Notes

- All datetime values are in ISO 8601 format
- Prices are in USD (can be configured)
- UUIDs use version 4
- Pagination uses 1-based indexing
- Maximum page size: 100 items

---

For more details, see the [README](../README.md) and [Security Guide](./SECURITY.md).
