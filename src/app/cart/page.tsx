'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Space_Grotesk } from 'next/font/google';
import { useCartStore } from '@/store/cart';
import { CartItemWithProduct } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { Toast, useToast } from '@/components/ui/Toast';
import { X, Plus, Minus, ShoppingBag, Lock } from 'lucide-react';

const sansFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity } = useCartStore();
  const { toasts, remove } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2EFE9]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F2EFE9] text-[#141414] ${sansFont.className}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="h-8 w-8" />
            <h1 className="text-5xl md:text-6xl font-light italic tracking-widest text-[#141414]">
              Shopping Bag
            </h1>
          </div>
          <p className="text-[#141414]/60 font-light text-base">
            {items.length} {items.length === 1 ? 'item' : 'items'} • {formatPrice(subtotal)}
          </p>
        </div>

        {items.length === 0 ? (
          // Empty Cart State
          <div className="border border-[#141414]/10 rounded-lg bg-white/50 backdrop-blur py-32 text-center">
            <div className="mb-6 flex justify-center">
              <ShoppingBag className="h-16 w-16 text-[#141414]/30" />
            </div>
            <h2 className="text-2xl font-light italic mb-3 text-[#141414]">
              Your bag is empty
            </h2>
            <p className="text-[#141414]/60 font-light mb-8 text-sm max-w-md mx-auto">
              Discover our curated collection of essentials and start building your wardrobe.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-[#141414] text-[#F2EFE9] text-sm font-light tracking-widest uppercase hover:bg-[#141414]/80 transition-all duration-300 rounded-sm shadow-sm"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Items List - Left Column */}
            <div className="lg:col-span-2">
              <div className="space-y-6 border-b border-[#141414]/10 pb-8 mb-8">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Recommendations or messaging */}
              <div className="bg-gradient-to-br from-[#141414]/5 to-transparent border border-[#141414]/10 rounded-lg p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#141414]/60 mb-2">Pro Tip</p>
                <p className="text-sm font-light text-[#141414]/70">
                  Free shipping on all orders. Enjoy worldwide delivery at no cost!
                </p>
              </div>
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6 bg-white rounded-lg border border-[#141414]/10 p-8 shadow-sm">
                
                {/* Title */}
                <h2 className="text-lg font-light italic tracking-wide text-[#141414]">
                  Order Summary
                </h2>

                {/* Divider */}
                <div className="h-px bg-[#141414]/10" />

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-light">
                    <span className="text-[#141414]/70">Subtotal</span>
                    <span className="text-[#141414]">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {/* Promo code input (optional) */}
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="w-full px-3 py-2 text-xs border border-[#141414]/10 rounded bg-[#F2EFE9] text-[#141414] placeholder-[#141414]/40 focus:outline-none focus:border-[#141414] transition-colors"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#141414]/10" />

                {/* Total */}
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-light text-[#141414]/70">Total</span>
                  <span className="text-2xl font-light text-[#141414]">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-gradient-to-r from-[#141414] to-[#2a2a2a] text-[#F2EFE9] py-4 text-sm font-light tracking-widest uppercase hover:from-[#0a0a0a] hover:to-[#1a1a1a] transition-all duration-300 rounded-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <Lock className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Proceed to Checkout
                </button>

                {/* Continue Shopping Link */}
                <Link
                  href="/products"
                  className="block text-center text-[#141414]/70 text-xs font-light tracking-widest uppercase hover:text-[#141414] transition-colors underline underline-offset-4"
                >
                  Continue Shopping
                </Link>

                {/* Security badge */}
                <div className="pt-4 border-t border-[#141414]/10 flex items-center justify-center gap-2 text-xs text-[#141414]/60">
                  <Lock className="h-3 w-3" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => remove(toast.id)}
        />
      ))}
    </div>
  );
}

// Cart Item Row Component
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItemWithProduct;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  const itemTotal = item.price * item.quantity;

  return (
    <div className="pb-6 border-b border-[#141414]/10 last:border-b-0 flex gap-6">
      
      {/* Product Image */}
      <div className="flex-shrink-0 w-24 h-32">
        {item.product_image ? (
          <Image
            src={item.product_image}
            alt={item.product.name}
            width={96}
            height={128}
            className="w-full h-full aspect-[3/4] object-cover rounded border border-[#141414]/10"
          />
        ) : (
          <div className="w-full h-full bg-[#141414]/5 rounded border border-[#141414]/10" />
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link
            href={`/products/${item.product.slug}`}
            className="block text-base font-light italic tracking-wide hover:underline mb-2 text-[#141414]"
          >
            {item.product.name}
          </Link>
          
          {item.variant && (
            <div className="text-xs font-light text-[#141414]/60 space-y-0.5 mb-3">
              {item.variant.color && (
                <p>Color: <span className="font-medium text-[#141414]/80">{item.variant.color}</span></p>
              )}
              {item.variant.size && (
                <p>Size: <span className="font-medium text-[#141414]/80">{item.variant.size}</span></p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Row: Price, Quantity, Remove */}
        <div className="flex items-center justify-between pt-3 border-t border-[#141414]/10">
          <div className="text-sm font-light text-[#141414]/70">
            {item.quantity} × {formatPrice(item.price)}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3 border border-[#141414]/15 rounded py-1 px-2">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="text-[#141414]/60 hover:text-[#141414] transition-colors p-0.5"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-xs font-light">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="text-[#141414]/60 hover:text-[#141414] transition-colors p-0.5"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Total & Remove */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-light text-[#141414] min-w-16 text-right">
              {formatPrice(itemTotal)}
            </p>
            <button
              onClick={() => onRemove(item.id)}
              className="text-[#141414]/50 hover:text-[#141414] transition-colors p-0.5 hover:bg-[#141414]/5 rounded"
              aria-label="Remove item"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
