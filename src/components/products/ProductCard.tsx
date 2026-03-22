import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { ProductWithDetails } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.compare_at_price
    ? calculateDiscount(product.price, product.compare_at_price)
    : 0;

  const mainImage = product.images[0]?.image_url || '/placeholder-product.png';

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <Badge variant="error" className="absolute top-2 left-2">
            -{discount}%
          </Badge>
        )}
        {product.featured && (
          <Badge variant="info" className="absolute top-2 right-2">
            Featured
          </Badge>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(product.variants.map((v) => v.color)))
              .slice(0, 5)
              .map((color) => (
                <div
                  key={color}
                  className="h-4 w-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
          </div>
        )}
      </div>
    </Link>
  );
}
