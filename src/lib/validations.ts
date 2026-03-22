import { z } from 'zod';
import { ProductSize, ProductGender, ProductStatus } from '@/types';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Address Schema
export const addressSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(5, 'Postal code is required'),
  country: z.string().default('US'),
  is_default: z.boolean().optional(),
});

// Product Schema
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().optional(),
  category_id: z.string().uuid('Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  compare_at_price: z.number().min(0).optional(),
  cost_per_item: z.number().min(0).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  track_quantity: z.boolean().default(true),
  continue_selling: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'archived'] as const),
  featured: z.boolean().default(false),
  gender: z.enum(['men', 'women', 'unisex'] as const).optional(),
});

// Product Variant Schema
export const productVariantSchema = z.object({
  product_id: z.string().uuid(),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'] as const),
  color: z.string().min(1, 'Color is required'),
  sku: z.string().optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  price_adjustment: z.number().default(0),
});

// Cart Item Schema
export const addToCartSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Maximum quantity is 99'),
});

// Checkout Schema
export const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  shipping_address: addressSchema,
  billing_same_as_shipping: z.boolean().default(true),
  billing_address: addressSchema.optional(),
  customer_notes: z.string().max(500).optional(),
});

// Review Schema
export const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Valid phone number is required').optional(),
  avatar_url: z.string().url().optional(),
});

// Order Update Schema (Admin)
export const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded'] as const).optional(),
  tracking_number: z.string().optional(),
  carrier: z.string().optional(),
  admin_notes: z.string().max(1000).optional(),
});

// Password Reset Schema
export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const passwordUpdateSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Search Schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  gender: z.enum(['men', 'women', 'unisex'] as const).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular'] as const).optional(),
});
