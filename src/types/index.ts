// =====================================================
// DATABASE TYPES
// =====================================================
// These types match the Supabase database schema

export type UserRole = 'customer' | 'admin';

export type ProductStatus = 'draft' | 'active' | 'archived';

export type ProductGender = 'men' | 'women' | 'unisex';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '28' | '30' | '32' | '34' | '36' | '38' | '40' | '42';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'paypal' | 'stripe';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

// =====================================================
// PROFILE / USER TYPES
// =====================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// PRODUCT TYPES
// =====================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  cost_per_item: number | null;
  sku: string | null;
  barcode: string | null;
  stock: number;
  track_quantity: boolean;
  continue_selling: boolean;
  status: ProductStatus;
  featured: boolean;
  gender: ProductGender | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: ProductSize;
  color: string;
  sku: string | null;
  quantity: number;
  price_adjustment: number;
  created_at: string;
  updated_at: string;
}

// Extended product with relations
export interface ProductWithDetails extends Product {
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
}

// =====================================================
// CART TYPES
// =====================================================

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
  variant: ProductVariant | null;
  product_image: string | null;
}

// =====================================================
// ORDER TYPES
// =====================================================

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  
  // Pricing
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  
  // Status
  status: OrderStatus;
  payment_status: PaymentStatus;
  
  // Payment
  payment_method: PaymentMethod | null;
  stripe_payment_intent_id: string | null;
  
  // Shipping Address
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  
  // Billing Address
  billing_full_name: string | null;
  billing_address_line1: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  
  // Tracking
  tracking_number: string | null;
  carrier: string | null;
  
  // Notes
  customer_notes: string | null;
  admin_notes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  
  // Snapshot data
  product_name: string;
  product_slug: string;
  variant_size: string | null;
  variant_color: string | null;
  
  quantity: number;
  price: number;
  subtotal: number;
  
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  user: Pick<Profile, 'email' | 'full_name'>;
}

// =====================================================
// REVIEW TYPES
// =====================================================

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  verified_purchase: boolean;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithUser extends Review {
  user: Pick<Profile, 'full_name' | 'avatar_url'>;
}

// =====================================================
// WISHLIST TYPES
// =====================================================

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface WishlistItemWithProduct extends Wishlist {
  product: ProductWithDetails;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  full_name: string;
  confirmPassword: string;
}

export interface AddressFormData {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description?: string;
  category_id: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  track_quantity: boolean;
  continue_selling: boolean;
  status: ProductStatus;
  featured: boolean;
  gender?: ProductGender;
}

export interface CheckoutFormData {
  email: string;
  shipping_address: AddressFormData;
  billing_same_as_shipping: boolean;
  billing_address?: AddressFormData;
  customer_notes?: string;
}

export interface ReviewFormData {
  rating: number;
  title?: string;
  comment?: string;
}

// =====================================================
// FILTER & SEARCH TYPES
// =====================================================

export interface ProductFilters {
  category?: string;
  gender?: ProductGender;
  minPrice?: number;
  maxPrice?: number;
  sizes?: ProductSize[];
  colors?: string[];
  search?: string;
  featured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface OrderFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: OrderWithItems[];
  topProducts: Array<{
    product: Product;
    totalSold: number;
    revenue: number;
  }>;
}

export interface InventoryAlert {
  product: Product;
  variant: ProductVariant;
  currentStock: number;
  threshold: number;
}

// =====================================================
// STRIPE TYPES
// =====================================================

export interface StripeMetadata {
  order_id: string;
  user_id: string;
  cart_id?: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  metadata: StripeMetadata;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}
