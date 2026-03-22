import Link from 'next/link';
import Image from 'next/image';
import { Playfair_Display, Space_Grotesk } from 'next/font/google';
import { createClient } from '@/lib/supabase/server';
import { HeroCarousel } from '@/components/HeroCarousel';
import { EditorialCarousel } from '@/components/EditorialCarousel';
import { ArrowUpRight, Eye, ShoppingBag, Truck } from 'lucide-react';
import type { ProductWithDetails } from '@/types';

export const dynamic = 'force-dynamic';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const sansFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const valueProps = [
  {
    title: 'Find Your Vibe',
    description: 'Open product details, check size and color options, then choose your favorite item.',
    icon: Eye,
    coverPosition: '0% 50%',
  },
  {
    title: 'Purchase',
    description: 'Add to cart, enter shipping information, and complete payment in secure checkout.',
    icon: ShoppingBag,
    coverPosition: '50% 50%',
  },
  {
    title: 'Delivery',
    description: 'We prepare and ship your order quickly, then deliver it straight to your address.',
    icon: Truck,
    coverPosition: '100% 50%',
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  let products: ProductWithDetails[] = [];

  try {
    const supabase = await createClient();
    const { data: featuredProducts } = await supabase
      .from('products')
      .select(`*, category:categories(*), images:product_images(*), variants:product_variants(*)`)
      .eq('status', 'active')
      .eq('featured', true)
      .limit(8);

    products = ((featuredProducts ?? []) as ProductWithDetails[]).map((product) => ({
      ...product,
      images: [...(product.images ?? [])].sort((a, b) => a.position - b.position),
    }));
  } catch {
    // Supabase not configured yet — render page without products
    products = [];
  }

  return (
    <div className={`${sansFont.className} bg-[#ece9e3] text-[#141414]`}>
      <HeroCarousel />

      <section className="relative overflow-hidden border-y border-black/10 bg-[#f3f1ed]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 14% 18%, rgba(0,0,0,0.10), transparent 42%), radial-gradient(circle at 84% 82%, rgba(0,0,0,0.08), transparent 36%)',
          }}
        />
        <div className="container-padding mx-auto">
          <div className="relative grid grid-cols-1 gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
            <div>
              <p className="text-[10px] font-semibold uppercase italic tracking-[0.38em] text-black/45">
                Home / Products
              </p>
              <h2
                className={`${displayFont.className} mt-4 max-w-2xl text-4xl italic leading-[0.92] text-black md:text-6xl`}
              >
                Dressed for the journey, wherever it leads.
              </h2>
            </div>
            <EditorialCarousel />
          </div>
        </div>
      </section>

      <section className="bg-[#ece9e3] py-16 md:py-24">
        <div className="container-padding mx-auto">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/40">
                Featured Selection
              </p>
              <h2 className={`${displayFont.className} mt-3 text-4xl italic leading-none text-black md:text-5xl`}>
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase italic tracking-[0.28em] text-black/65 transition-colors hover:text-black"
            >
              View All Products
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => {
                const mainImage = product.images[0]?.image_url || '/images/shirt1.png';

                return (
                  <Link
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
                      {product.featured ? (
                        <span className="absolute left-2 top-2 border border-black/15 bg-[#f5f3ef]/90 px-2 py-1 text-[9px] font-semibold uppercase italic tracking-[0.2em] text-black/55">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
                        {product.category?.name ?? 'Studio Essentials'}
                      </p>
                      <h3
                        className={`${displayFont.className} mt-1 text-2xl italic leading-tight text-black transition-transform group-hover:translate-x-0.5`}
                      >
                        {product.name}
                      </h3>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-black/75">{formatPrice(product.price)}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 transition-colors group-hover:text-black">
                          View
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="border border-black/15 bg-[#f4f2ee] px-6 py-14 text-center md:px-10">
              <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/45">
                Catalogue Pending
              </p>
              <h3 className={`${displayFont.className} mt-3 text-3xl italic text-black md:text-4xl`}>
                Products Coming Soon
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm text-black/60 md:text-base">
                Once inventory is published, this space will automatically populate with featured
                pieces from your store.
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="border-y border-black/10 bg-[#e9e6e0] py-16 md:py-24">
        <div className="container-padding mx-auto">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/40">
                Purchase Process
              </p>
              <h2 className={`${displayFont.className} mt-3 text-4xl italic leading-none text-black md:text-5xl`}>
                Grab & Go
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {valueProps.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group relative min-h-[300px] overflow-hidden border border-black/15 bg-black p-7"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-no-repeat grayscale transition duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
                    style={{
                      backgroundImage: "url('/images/cover.png')",
                      backgroundSize: '300% 100%',
                      backgroundPosition: item.coverPosition,
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-black/45 transition-colors duration-300 group-hover:bg-black/35"
                  />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <p className="text-[10px] font-semibold uppercase italic tracking-[0.3em] text-white/70">
                      0{index + 1}
                    </p>

                    <div>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-black/30 transition-transform duration-300 group-hover:-translate-y-0.5">
                        <Icon className="h-5 w-5 text-white/85" />
                      </div>
                      <h3 className={`${displayFont.className} text-3xl italic text-white`}>
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">{item.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
