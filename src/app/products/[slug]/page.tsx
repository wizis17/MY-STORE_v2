'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Playfair_Display, Space_Grotesk } from 'next/font/google';
import { formatPrice } from '@/lib/utils';
import { getColorHex } from '@/lib/colorMap';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { useCartStore } from '@/store/cart';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import type { ProductWithDetails, CartItemWithProduct } from '@/types';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const sansFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { toasts, remove, success: showSuccess, error: showError } = useToast();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      setProduct(data.product);
      
      // Initialize with first available size and color
      if (data.product.available_sizes?.length > 0) {
        setSelectedSize(data.product.available_sizes[0]);
      }
      if (data.product.available_colors?.length > 0) {
        setSelectedColor(data.product.available_colors[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${sansFont.className} bg-[#ece9e3] min-h-screen flex items-center justify-center`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`${sansFont.className} bg-[#ece9e3] min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`${displayFont.className} text-3xl italic text-black mb-4`}>Product not found</h1>
          <Link href="/products" className="text-black/60 hover:text-black italic underline">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImage]?.image_url || '/placeholder-product.png';

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // Create a cart item
      const cartItem: CartItemWithProduct = {
        id: `temp-${Date.now()}`, // Temporary ID, will be replaced by server
        cart_id: '',
        product_id: product.id,
        variant_id: selectedColor && selectedSize ? `${selectedColor}-${selectedSize}` : null,
        quantity,
        price: product.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product,
        variant: null,
        product_image: product.images?.[0]?.image_url || null,
      };

      // Add to store
      addItem(cartItem);

      // Show success message
      showSuccess(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to bag`);

      // Reset quantity
      setQuantity(1);
    } catch (err) {
      console.error('Error adding to cart:', err);
      showError('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className={`${sansFont.className} bg-[#ece9e3] text-[#141414]`}>
      {/* Breadcrumb */}
      <div className="container-padding mx-auto py-4 md:py-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase italic tracking-[0.25em] text-black/50 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Products
        </Link>
      </div>

      {/* Product Content */}
      <div className="container-padding mx-auto py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Images Section */}
          <div className="md:col-span-1">
            <div className=" relative aspect-[2/3] overflow-hidden bg-[#f3f1ed] rounded-lg mb-3">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded border-2 transition-colors overflow-hidden ${
                      selectedImage === idx ? 'border-black' : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:col-span-2">
            <p className="text-[10px] font-semibold uppercase italic tracking-[0.38em] text-black/45 mb-2">
              {product.category?.name || 'Product'}
            </p>
            <h1 className="font-gveret text-4xl md:text-5xl italic leading-tight text-black mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-black/10">
              <p className="text-2xl md:text-3xl font-bold text-black">
                {formatPrice(product.price)}
              </p>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <p className="text-sm text-black/50 line-through mt-1">
                  {formatPrice(product.compare_at_price)}
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6 pb-6 border-b border-black/10">
                <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/40 mb-3">
                  Description
                </p>
                <p className="text-sm text-black/75 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Size Selection */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div className="mb-6 pb-6 border-b border-black/10">
                <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/40 mb-3">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm border rounded transition-colors ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.available_colors && product.available_colors.length > 0 && (
              <div className="mb-6 pb-6 border-b border-black/10">
                <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/40 mb-3">
                  Color: {selectedColor}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.available_colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition-colors ${
                        selectedColor === color ? 'border-black ring-2 ring-black/30' : 'border-black/20 hover:border-black'
                      }`}
                      style={{
                        backgroundColor: getColorHex(color)
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-semibold uppercase italic tracking-[0.35em] text-black/40">
                  Quantity
                </p>
                <div className="flex items-center border border-black/10 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-sm hover:bg-black/5 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center py-2 bg-transparent border-x border-black/10 text-sm"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-sm hover:bg-black/5 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  disabled={addingToCart}
                  onClick={handleAddToCart}
                  isLoading={addingToCart}
                  className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase italic tracking-[0.25em] px-6 py-4 bg-black text-white hover:bg-black/80 disabled:opacity-50 transition-colors rounded"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                  {!addingToCart && <ArrowUpRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Product Info */}
            {product.sku && (
              <div className="mt-8 pt-8 border-t border-black/10 space-y-2 text-xs text-black/60">
                <p><span className="font-semibold text-black/80">SKU:</span> {product.sku}</p>
                {product.status && (
                  <p><span className="font-semibold text-black/80">Availability:</span> {product.status}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => remove(toast.id)}
        />
      ))}
    </div>
  );
}
