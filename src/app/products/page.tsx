'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Playfair_Display, Space_Grotesk } from 'next/font/google';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProductWithDetails } from '@/types';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const sansFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [featuredByCategory, setFeaturedByCategory] = useState<Record<string, ProductWithDetails[]>>({});
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchFeaturedByCategory();
  }, [searchParams, page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      // Handle both array and object responses
      const categoryList = Array.isArray(data) ? data : data.categories || [];
      setCategories(categoryList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchFeaturedByCategory = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=100');
      const data = await response.json();
      const featured = data.products || [];

      // Group by category
      const grouped: Record<string, ProductWithDetails[]> = {};
      featured.forEach((product: ProductWithDetails) => {
        const categoryName = product.category?.name || 'Other';
        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push(product);
      });

      setFeaturedByCategory(grouped);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      params.set('sortBy', sortBy);
      if (categoryFilter) {
        params.set('category', categoryFilter);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1); // Reset page to 1 when changing category
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Clear page param so it defaults to 1
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className={`${sansFont.className} bg-[#ece9e3] text-[#141414]`}>
      {/* Header Section */}
      <section className="relative overflow-hidden border-b border-black/10 bg-[#f3f1ed]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 14% 18%, rgba(0,0,0,0.10), transparent 42%), radial-gradient(circle at 84% 82%, rgba(0,0,0,0.08), transparent 36%)',
          }}
        />
        <div className="container-padding mx-auto relative z-10 py-12 md:py-10">
          <p className="text-[10px] font-semibold uppercase italic tracking-[0.38em] text-black/45 mb-3">
            Shop / Collection
          </p>
          <h1
            className="font-gveret text-4xl md:text-5xl italic leading-tight text-black mb-2"
          >
            All Products
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-padding mx-auto py-12 md:py-16">
        {/* Featured by Category */}
        {Object.keys(featuredByCategory).length > 0 && (
          <div className="mb-16 space-y-12">
            <div>
              <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/40 mb-3">
                Featured Collections
              </p>
              <h2 className="font-gveret text-3xl md:text-4xl italic leading-none text-black">
                Shop by Category
              </h2>
            </div>

            <div className="space-y-10">
              {Object.entries(featuredByCategory).map(([category, categoryProducts]) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`${displayFont.className} text-2xl italic text-black`}>
                      {category}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/40">
                      {categoryProducts.length} Items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {categoryProducts.slice(0, 4).map((product) => {
                      const mainImage = product.images[0]?.image_url || '/placeholder-product.png';

                      return (
                        <a
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="group border border-black/10 bg-white/70 p-3 backdrop-blur-[2px] transition-colors hover:bg-white"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#efede8]">
                            <Image
                              src={mainImage}
                              alt={product.name}
                              fill
                              sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                              className="object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                            />
                            {product.featured && (
                              <span className="absolute left-2 top-2 border border-black/15 bg-[#f5f3ef]/90 px-2 py-1 text-[9px] font-semibold uppercase italic tracking-[0.2em] text-black/55">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="mt-4">
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
                              {product.category?.name ?? 'Studio Essentials'}
                            </p>
                            <h4 className={`${displayFont.className} mt-1 text-lg italic leading-tight text-black transition-transform group-hover:translate-x-0.5`}>
                              {product.name}
                            </h4>
                            <div className="mt-3 flex items-center justify-between">
                              <p className="text-sm font-semibold text-black/75">{formatPrice(product.price)}</p>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 transition-colors group-hover:text-black">
                                View
                                <ArrowUpRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black/10 pt-8" />
          </div>
        )}

        {/* Filters */}
        <div className="mb-10">
          <div className="mb-6 space-y-4">
            <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/40 mb-4">
              Filter & Search
            </p>
            <form onSubmit={handleSearch} className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  type="search"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border border-black/10 bg-white/70 px-4 py-3 text-sm rounded-full"
                />
                <Button 
                  type="submit"
                  className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase italic tracking-[0.25em] px-8 py-3 bg-black text-white hover:bg-black/80 transition-colors whitespace-nowrap rounded-full"
                >
                  Search
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('')}
                  className={`flex-shrink-0 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] rounded-full transition-all border ${
                    categoryFilter === ''
                      ? 'bg-black text-white border-black'
                      : 'bg-white/60 text-black/60 border-black/10 hover:border-black/30 hover:text-black hover:bg-white'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex-shrink-0 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] rounded-full transition-all border ${
                      categoryFilter === cat.id
                        ? 'bg-black text-white border-black'
                        : 'bg-white/60 text-black/60 border-black/10 hover:border-black/30 hover:text-black hover:bg-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Results Counter */}
        {!loading && (
          <p className="text-[10px] font-medium uppercase italic tracking-[0.28em] text-black/45 mb-6">
            {products.length} of {total} items
          </p>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : products.length > 0 ? (
          <>
            <ProductGrid products={products} />

            {/* Pagination */}
            {total > 12 && (
              <div className="mt-12 flex justify-center gap-3">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="text-[11px] font-semibold uppercase italic tracking-[0.25em] px-5 py-2 border border-black/15 bg-white/70 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </Button>
                <div className="px-4 py-2 text-[11px] font-medium uppercase italic text-black/50">
                  Page {page } of {Math.ceil(total / 12)}
                </div>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page * 12 >= total}
                  className="text-[11px] font-semibold uppercase italic tracking-[0.25em] px-5 py-2 border border-black/15 bg-white/70 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/40">
              No result
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
