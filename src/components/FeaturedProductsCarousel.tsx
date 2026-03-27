'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { ProductWithDetails } from '@/types';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

interface FeaturedProductsCarouselProps {
  products: ProductWithDetails[];
}

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (products.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  // Get 5 products for carousel: 2 before, 1 center, 2 after
  const getProduct = (offset: number) => {
    return products[(currentIndex + offset + products.length) % products.length];
  };

  const carouselProducts = [
    { product: getProduct(-2), position: 'left-far' },
    { product: getProduct(-1), position: 'left' },
    { product: getProduct(0), position: 'center' },
    { product: getProduct(1), position: 'right' },
    { product: getProduct(2), position: 'right-far' },
  ];

  return (
    <div className="space-y-6">
      {/* Carousel Container */}
      <div className="relative overflow-hidden py-8">
        <div className="flex items-center justify-center gap-2">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="flex-shrink-0 rounded-full bg-black/20 p-2 hover:bg-black/40 transition-colors z-10"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>

          {/* Carousel Track */}
          <div className="flex items-center justify-center gap-3 flex-1">
            {carouselProducts.map(({ product, position }, idx) => {
              const mainImage = product.images[0]?.image_url || '/images/shirt1.png';
              const isCenter = position === 'center';

              let sizeClasses = '';
              let opacityClasses = '';

              if (isCenter) {
                sizeClasses = 'w-80 h-auto';
                opacityClasses = 'opacity-100 scale-100';
              } else if (position === 'left' || position === 'right') {
                sizeClasses = 'w-40 h-auto';
                opacityClasses = 'opacity-60 scale-90';
              } else {
                sizeClasses = 'w-32 h-auto';
                opacityClasses = 'opacity-30 scale-75 hidden md:flex';
              }

              return (
                <Link
                  key={`${product.id}-${idx}`}
                  href={`/products/${product.slug}`}
                  className={`flex-shrink-0 border border-black/10 bg-white/70 p-3 backdrop-blur-[2px] transition-all duration-300 ${sizeClasses} ${opacityClasses}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#efede8]">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                    />
                    {product.featured ? (
                      <span className="absolute left-2 top-2 border border-black/15 bg-[#f5f3ef]/90 px-2 py-1 text-[9px] font-semibold uppercase italic tracking-[0.2em] text-black/55">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  {isCenter && (
                    <div className="mt-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
                        {product.category?.name ?? 'Studio Essentials'}
                      </p>
                      <h3 className={`${displayFont.className} mt-1 text-2xl italic leading-tight text-black`}>
                        {product.name}
                      </h3>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-black/75">{formatPrice(product.price)}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50">
                          View
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handleNext}
            className="flex-shrink-0 rounded-full bg-black/20 p-2 hover:bg-black/40 transition-colors z-10"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Indicator Dots */}
      {products.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: products.length }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all ${
                idx === currentIndex
                  ? 'h-2 w-6 bg-black'
                  : 'h-2 w-2 bg-black/20 hover:bg-black/40'
              }`}
              aria-label={`Go to product ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
