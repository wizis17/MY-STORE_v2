'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const hero = {
  eyebrow: 'FLUX STUDIO x ESSENTIALS',
  bigText: 'FLUX7',
  image: '/images/shirt1.png',
  buttonLink: '/products',
};

export function HeroCarousel() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <section className="relative h-[calc(100svh-4rem)] min-h-[600px] bg-[#eeece8] overflow-hidden select-none">
      {/* Giant bottom text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 overflow-hidden leading-none"
      >
        <span
          className="block w-full text-center font-black uppercase italic text-black"
          style={{
            fontSize: 'clamp(5rem, 23vw, 22rem)',
            lineHeight: 0.82,
            letterSpacing: '-0.03em',
          }}
        >
          {hero.bigText}
        </span>
      </div>

      {/* Left overlay text */}
      <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-5">
        <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/45">
          {hero.eyebrow}
        </p>
        <p className="text-[11px] font-bold uppercase italic leading-[1.7] tracking-widest text-black/70">
          SCROLL TO<br />LOOK THROUGH<br />THE IMAGE
        </p>
        <Link
          href={hero.buttonLink}
          className="mt-2 inline-block text-[18px] font-semibold uppercase italic tracking-[0.35em] text-black/50 hover:text-black transition-colors border-b border-black/20 hover:border-black pb-px"
        >
          Shop Now
        </Link>
      </div>

      {/* Right slide counter */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
        <span className="block rounded-full bg-black w-[2px] h-8" />
        <span className="mt-1 text-[9px] font-medium italic tracking-widest text-black/35">
          00<br />01
        </span>
      </div>

      {/* Central product image */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className="relative"
          style={{
            width: 'clamp(220px, 34vw, 460px)',
            height: 'clamp(360px, 70vh, 800px)',
          }}
        >
          <div
            aria-hidden="true"
            className={`absolute inset-0 rounded-[2.25rem] border border-black/10 bg-[#f3f1ed] transition-opacity duration-500 ${
              isImageLoaded && !hasImageError ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="absolute inset-0 rounded-[2.25rem] opacity-45 [background:repeating-linear-gradient(130deg,rgba(0,0,0,0.05)_0,rgba(0,0,0,0.05)_2px,transparent_2px,transparent_11px)]" />
            <div className="absolute left-4 top-4 border border-black/20 px-3 py-1 text-[9px] font-semibold uppercase italic tracking-[0.28em] text-black/45">
              Image Placeholder
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[11px] font-medium uppercase italic tracking-[0.35em] text-black/35">
                Editorial Frame
              </p>
            </div>
          </div>

          {!hasImageError ? (
            <Image
              src={hero.image}
              alt={hero.eyebrow}
              fill
              className="object-contain drop-shadow-[0_32px_56px_rgba(0,0,0,0.18)]"
              style={{
                filter: 'grayscale(100%) contrast(1.08)',
              }}
              onLoadingComplete={() => setIsImageLoaded(true)}
              onError={() => {
                setHasImageError(true);
                setIsImageLoaded(false);
              }}
              priority
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
