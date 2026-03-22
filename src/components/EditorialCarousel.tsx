'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const carouselProducts = [
  // { id: 1, image: '/images/shirt1.png', label: '01' },
  { id: 1, image: '/images/shirt3.png', label: '01' },
  { id: 2, image: '/images/shirt4.jpg', label: '02' },
  { id: 3, image: '/images/shirt2.jpg', label: '03' },
  { id: 4, image: '/images/shirt5.jpg', label: '04' },
];

export function EditorialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? carouselProducts.length - 2 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === carouselProducts.length - 2 ? 0 : prev + 1));
  };

  const visibleProducts = carouselProducts.slice(currentIndex, currentIndex + 2);

  return (
    <div className="flex flex-col gap-6">
      {/* Product Grid - 2 cards side by side */}
      <div className="grid grid-cols-2 gap-4">
        {visibleProducts.map((product) => (
          <div
            key={product.id}
            className="group relative h-[100px] md:h-[270px] rounded-[0.5rem] overflow-hidden bg-[#f3f1ed] border border-black/10 cursor-pointer"
          >
            <Image
              src={product.image}
              alt={`Product ${product.label}`}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
            <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-[9px] md:text-[11px] font-semibold uppercase italic tracking-[0.25em] text-black/70">
              {product.label}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPrevious}
          className="h-4 w-4 md:h-5 md:w-5 rounded-full border border-black/30 flex items-center justify-center hover:border-black/60 transition-colors hover:bg-black/5"
          aria-label="Previous products"
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-black/60" />
        </button>

        {/* Counter */}
        <div className="text-center text-[9px] md:text-[10px] font-semibold italic tracking-widest text-black/35 min-w-[60px]">
          {(currentIndex + 1).toString().padStart(2, '0')}
          <br />
          {(carouselProducts.length - 1).toString().padStart(2, '0')}
        </div>

        <button
          onClick={goToNext}
          className="h-4 w-4 md:h-5 md:w-5 rounded-full border border-black/30 flex items-center justify-center hover:border-black/60 transition-colors hover:bg-black/5"
          aria-label="Next products"
        >
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-black/60" />
        </button>
      </div>
    </div>
  );
}
