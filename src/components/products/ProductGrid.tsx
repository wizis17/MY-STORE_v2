import { ProductCard } from './ProductCard';
import { ProductWithDetails } from '@/types';

interface ProductGridProps {
  products: ProductWithDetails[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/40">
          No result
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
