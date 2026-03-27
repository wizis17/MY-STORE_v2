'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';
import { useCartStore } from '@/store/cart';
import { Spinner } from '@/components/ui/Spinner';
import { Toast, useToast } from '@/components/ui/Toast';
import { ChevronRight, CheckCircle2, ChevronDown, Search, X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const CAMBODIA_PROVINCES = [
  "Banteay Meanchey", "Battambang", "Kampong Cham", "Kampong Chhnang",
  "Kampong Speu", "Kampong Thom", "Kampot", "Kandal", "Kep",
  "Koh Kong", "Kratie", "Mondulkiri", "Oddar Meanchey", "Pailin",
  "Phnom Penh", "Preah Sihanouk", "Preah Vihear", "Prey Veng",
  "Pursat", "Ratanakiri", "Siem Reap", "Stung Treng", "Svay Rieng",
  "Takeo", "Tboung Khmum", "Other Province"
];

const sansFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

export default function CheckoutPage() {
  const { items } = useCartStore();
  const { toasts, remove, error: showError } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Phnom Penh',
  });
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success'>('pending');
  const [qrString, setQrString] = useState<string>('');
  const [md5Hash, setMd5Hash] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const filteredProvinces = CAMBODIA_PROVINCES.filter(p => 
    p.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simulate polling for Bakong continuous transaction check
  useEffect(() => {
    let cancelPolling = false;
    let pollInterval: NodeJS.Timeout;

    if (showQR && paymentStatus === 'pending' && md5Hash) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/bakong/check-status?md5Hash=${encodeURIComponent(md5Hash)}`);
          if (!res.ok) return;
          const data = await res.json();
          
          if (data.status === 'paid' && !cancelPolling) {
            setPaymentStatus('success');

            // Save the order to Supabase Database
            try {
              await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  items,
                  customerInfo: formData,
                  total,
                  paymentStatus: 'paid'
                })
              });
            } catch (err) {
              console.error('Failed to save order to database:', err);
            }

            setTimeout(() => {
              window.location.href = '/order-success';
            }, 1500);
          }
        } catch (err) {
          console.error('Failed to check payment status:', err);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      cancelPolling = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [showQR, paymentStatus, md5Hash, items, formData, total]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setIsGeneratingQR(true);
      // Fetch dynamic QR string and md5Hash from official Bakong API mock
      const res = await fetch('/api/bakong/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      
      if (!res.ok) throw new Error('Failed to generate Bakong QR');
      
      const { qrString, md5Hash } = await res.json();
      setQrString(qrString);
      setMd5Hash(md5Hash);

      // Show Bakong QR Popup
      setShowQR(true);
      setPaymentStatus('pending');
    } catch (err) {
      console.error(err);
      showError('Failed to generate payment QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-[#F2EFE9] text-[#141414] ${sansFont.className} py-32`}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-light italic mb-4 text-[#141414]">Your cart is empty</h1>
          <p className="text-[#141414]/60 font-light mb-8">Add items to continue</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-[#141414] text-[#F2EFE9] text-sm font-light tracking-widest uppercase hover:bg-[#141414]/80 transition-colors rounded-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F2EFE9] text-[#141414] ${sansFont.className}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header with Back Link */}
        <div className="mb-12">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-xs font-light text-[#141414]/60 hover:text-[#141414] transition-colors underline underline-offset-2 mb-4"
          >
            ← Back to Cart
          </Link>
          <h1 className="text-5xl md:text-6xl font-light italic tracking-widest text-[#141414]">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Main Form - Left Side */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Contact & Delivery Section */}
              <div className="bg-white rounded-lg border border-[#141414]/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-full bg-[#141414] text-[#F2EFE9] flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <h2 className="text-lg font-light italic tracking-wide">Contact & Delivery</h2>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-[#141414]/15 rounded bg-[#F2EFE9] placeholder-[#141414]/40 focus:outline-none focus:border-[#141414] transition-colors"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number (Telegram / WhatsApp)"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-[#141414]/15 rounded bg-[#F2EFE9] placeholder-[#141414]/40 focus:outline-none focus:border-[#141414] transition-colors"
                  />
                  
                  <div className="pt-4 pb-2">
                    <h3 className="text-sm font-medium text-[#141414] mb-3">Delivery Address</h3>
                    <textarea
                      name="address"
                      placeholder="House No., Street, Khan/Sangkat"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 text-sm border border-[#141414]/15 rounded bg-[#F2EFE9] placeholder-[#141414]/40 focus:outline-none focus:border-[#141414] transition-colors resize-none mb-4"
                    />
                    {/* Custom Searchable Province Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsProvinceOpen(!isProvinceOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm border border-[#141414]/15 rounded bg-[#F2EFE9] text-[#141414] focus:outline-none focus:border-[#141414] transition-colors"
                      >
                        <span className={formData.city ? "text-[#141414]" : "text-[#141414]/40"}>
                          {formData.city || "Select Province/City"}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-[#141414]/60 transition-transform ${isProvinceOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isProvinceOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-[#141414]/15 rounded-md shadow-lg overflow-hidden">
                          <div className="flex items-center px-3 border-b border-[#141414]/10 bg-gray-50/50">
                            <Search className="h-4 w-4 text-[#141414]/40" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search province..."
                              value={provinceSearch}
                              onChange={(e) => setProvinceSearch(e.target.value)}
                              className="w-full px-2 py-3 text-sm bg-transparent focus:outline-none text-[#141414]"
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto w-full">
                            {filteredProvinces.length > 0 ? (
                              filteredProvinces.map((province) => (
                                <button
                                  key={province}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, city: province }));
                                    setIsProvinceOpen(false);
                                    setProvinceSearch('');
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F2EFE9] transition-colors ${formData.city === province ? 'bg-[#141414]/5 font-medium' : ''}`}
                                >
                                  {province}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-[#141414]/50 text-center">
                                No provinces found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-gradient-to-br from-[#141414] to-[#2a2a2a] rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-full bg-[#F2EFE9] text-[#141414] flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <h2 className="text-lg font-light italic tracking-wide text-[#F2EFE9]">Payment</h2>
                </div>
                <p className="text-xs font-light text-[#F2EFE9]/70 mb-4">
                  Pay securely with ABA PayWay. After submitting, scan the QR code with your aba app. The page will complete automatically once paid.
                </p>
                <button
                  type="submit"
                  disabled={isGeneratingQR}
                  className="w-full bg-[#F2EFE9] text-[#141414] py-4 text-sm font-semibold tracking-widest uppercase hover:bg-white transition-all duration-300 rounded-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingQR ? (
                    <>
                      <Spinner size="sm" />
                      <span>Generating Bakong QR...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Pay with Bakong (KHQR)</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Security Info */}
              <div className="flex items-start gap-3 text-xs font-light text-[#141414]/60">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span>Bakong is Cambodia&apos;s leading secure payment gateway. Your transaction is verified in real-time.</span>
              </div>
            </form>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-lg border border-[#141414]/10 p-8 shadow-sm">
              
              {/* Title */}
              <h2 className="text-lg font-light italic tracking-wide text-[#141414] mb-6">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-64 overflow-y-auto mb-6 pb-6 border-b border-[#141414]/10">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm font-light">
                    <span className="text-[#141414]/70 flex-1">
                      {item.product.name}
                    </span>
                    <div className="text-right">
                      <div className="text-[#141414]/60 text-xs mb-1">Qty: {item.quantity}</div>
                      <span className="text-[#141414] font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-light">
                  <span className="text-[#141414]/70">Subtotal</span>
                  <span className="text-[#141414]">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#141414]/10 mb-6" />

              {/* Total */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#141414]/70">Total</span>
                <span className="text-3xl font-light text-[#141414]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bakong KHQR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/90 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in fade-in duration-200">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-[#141414]/60 hover:text-[#141414] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="flex justify-center mb-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${paymentStatus === 'success' ? 'bg-green-100' : 'bg-[#E3000F]/10'}`}>
                  {paymentStatus === 'success' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <QrCode className="h-6 w-6 text-[#E3000F]" />
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-light italic tracking-widest text-[#141414] mb-2">
                {paymentStatus === 'success' ? 'Payment Verified!' : 'Pay with Bakong'}
              </h3>
              <p className="text-sm font-light text-[#141414]/70">
                {paymentStatus === 'success' 
                  ? 'Redirecting you to your order confirmation...'
                  : 'Scan this KHQR code with any supported banking app.'}
              </p>
            </div>
            
            <div className="aspect-square bg-white rounded-xl mb-6 flex items-center justify-center shadow-inner relative overflow-hidden p-4">
              {qrString ? (
                <QRCodeSVG 
                  value={qrString} 
                  size={256}
                  level="M"
                  includeMargin={false}
                  className="w-full h-full"
                />
              ) : (
                <div className="text-[#141414]/40 text-sm flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span>Loading KHQR...</span>
                </div>
              )}
              
              {paymentStatus === 'success' && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-y border-[#141414]/10">
                <span className="text-sm font-medium text-[#141414]/70">Total Amount</span>
                <span className="text-xl font-semibold text-[#141414]">{formatPrice(total)}</span>
              </div>

              {/* Loader or Simulate test button */}
              {paymentStatus === 'pending' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-[#141414]/60">
                    <Spinner size="sm" />
                    <span>Listening for payment...</span>
                  </div>
                  {/* Remove this button in production! It's just to let you test the completion flow. */}
                  <button
                    onClick={() => {
                      setPaymentStatus('success');
                      setTimeout(() => window.location.href = '/order-success', 1500);
                    }}
                    className="w-full bg-[#141414]/5 text-[#141414] py-2 text-xs font-medium uppercase hover:bg-[#141414]/10 transition-colors rounded-sm"
                  >
                    (Dev) Simulate Success
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                  Payment Successful!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
