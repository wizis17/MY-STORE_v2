import Link from 'next/link';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { ProductWithDetails } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ArrowUpRight } from 'lucide-react';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.compare_at_price
    ? calculateDiscount(product.price, product.compare_at_price)
    : 0;

  const mainImage = product.images[0]?.image_url || '/placeholder-product.png';

  return (
    <Link href={`/products/${product.slug}`} className="group border border-black/10 bg-white/70 p-2 backdrop-blur-[2px] transition-colors hover:bg-white">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#efede8] rounded-md">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-[1.03]"
        />
        {product.featured && (
          <span className="absolute left-1.5 top-1.5 border border-black/15 bg-[#f5f3ef]/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase italic tracking-[0.15em] text-black/55">
            Featured
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-1.5 top-1.5 border border-black/15 bg-[#f5f3ef]/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase italic tracking-[0.15em] text-black/55">
            -{discount}%
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-black/40">
          {product.category?.name ?? 'Studio Essentials'}
        </p>
        <h3 className={`${displayFont.className} mt-0.5 text-lg italic leading-tight text-black transition-transform group-hover:translate-x-0.5`}>
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-black/75">{formatPrice(product.price)}</p>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-black/50 transition-colors group-hover:text-black">
            View
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="mt-3 space-y-2">
            {/* Sizes */}
            <div className="flex flex-wrap gap-1.5">
              {Array.from(new Set(product.variants.map((v) => v.size)))
                .sort()
                .map((size) => (
                  <span
                    key={size}
                    className="text-[8px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 border border-black/20 rounded bg-white/50 text-black/70"
                  >
                    {size}
                  </span>
                ))}
            </div>
            {/* Colors */}
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(product.variants.map((v) => v.color)))
                .slice(0, 5)
                .map((color) => (
                  <div
                    key={color}
                    className="h-2.5 w-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
