import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-coral">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          <p className="mt-3 text-gray-600">
            Save products you love and find them here quickly.
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-coral px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
