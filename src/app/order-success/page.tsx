'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';
import { CheckCircle2, Mail, Package, Truck, MessageSquare } from 'lucide-react';
import { useCartStore } from '@/store/cart';

const sansFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export default function OrderSuccessPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the cart after successful purchase
    clearCart();
  }, [clearCart]);

  return (
    <div className={`min-h-screen bg-[#F2EFE9] text-[#141414] ${sansFont.className}`}>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Success Message Section */}
        <div className="text-center mb-16">
          
          {/* Animated Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center border-2 border-green-200">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-light italic tracking-widest mb-3 text-[#141414]">
            Order Confirmed
          </h1>

          {/* Subheading */}
          <p className="text-xl font-light text-[#141414]/70 mb-2">
            Thank you for your purchase!
          </p>
          <p className="text-sm font-light text-[#141414]/60">
            Your order has been successfully placed and is being processed.
          </p>
        </div>

        {/* Main Info Card */}
        <div className="bg-white rounded-lg border border-[#141414]/10 p-8 shadow-sm mb-8">
          
          {/* Email Confirmation */}
          <div className="border-b border-[#141414]/10 pb-6 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#141414] mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#141414] mb-1">Confirmation Email Sent</p>
                <p className="text-xs font-light text-[#141414]/70">
                  Check your inbox for order details, invoice, and tracking information. Check your spam folder if you don&apos;t see it within a few minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline of What Happens Next */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#141414]/60">What happens next</h2>
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div className="w-0.5 h-12 bg-[#141414]/10 my-2" />
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-[#141414] mb-1">Preparing Your Order</p>
                <p className="text-xs font-light text-[#141414]/70">We&apos;re carefully preparing your items for shipment. This usually takes 1-2 business days.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-[#F2EFE9] border border-[#141414]/20 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-[#141414]/60" />
                </div>
                <div className="w-0.5 h-12 bg-[#141414]/10 my-2" />
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-[#141414]/70 mb-1">Shipped</p>
                <p className="text-xs font-light text-[#141414]/70">You&apos;ll receive a tracking number via email so you can follow your package.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-[#F2EFE9] border border-[#141414]/20 flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-[#141414]/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#141414]/70 mb-1">Delivered</p>
                <p className="text-xs font-light text-[#141414]/70">Your order will arrive within 5-7 business days. We appreciate your patience!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-gradient-to-br from-[#141414]/5 to-transparent border border-[#141414]/10 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-[#141414] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#141414] mb-2">Need Help?</p>
              <p className="text-xs font-light text-[#141414]/70 mb-3">
                Our team is here to help with any questions about your order.
              </p>
              <Link
                href="/contact"
                className="inline-block text-xs font-light text-[#141414] underline underline-offset-2 hover:text-[#141414]/70 transition-colors"
              >
                Get in touch &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex justify-center items-center px-8 py-4 bg-[#141414] text-[#F2EFE9] text-sm font-light tracking-widest uppercase hover:bg-[#141414]/90 transition-all duration-300 rounded-sm shadow-lg hover:shadow-xl"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="inline-flex justify-center items-center px-8 py-4 border border-[#141414]/20 text-[#141414] text-sm font-light tracking-widest uppercase hover:bg-[#141414]/5 transition-colors rounded-sm"
          >
            Back Home
          </Link>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 pt-8 border-t border-[#141414]/10 text-center">
          <p className="text-xs font-light text-[#141414]/60">
            ✓ Secure payment • ✓ Money-back guarantee • ✓ 2-day preparation
          </p>
        </div>
      </div>
    </div>
  );
}
