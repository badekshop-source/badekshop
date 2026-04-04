// src/app/checkout/checkout-content.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Wifi, Clock, MapPin, Check, Lock } from 'lucide-react';
import { Product } from '@/types';

export default function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    arrivalDate: '',
    flightNumber: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) {
      setError('No product selected. Please select a product first.');
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required';
    if (!formData.nationality) return 'Nationality is required';
    if (!formData.arrivalDate) return 'Arrival date is required';
    if (!formData.flightNumber.trim()) return 'Flight number is required';
    if (new Date(formData.arrivalDate) < new Date(new Date().toDateString())) return 'Arrival date must be in the future';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!productId || !product) {
      setError('No product selected');
      setIsSubmitting(false);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const hasActiveDiscount = product.discountPercentage && 
        product.discountPercentage > 0 &&
        (!product.discountStart || new Date(product.discountStart) <= new Date()) &&
        (!product.discountEnd || new Date(product.discountEnd) >= new Date());
      
      const discountPct = product.discountPercentage ?? 0;
      const discountAmount = hasActiveDiscount ? Math.round(product.price * (discountPct / 100)) : 0;
      const subtotal = product.price - discountAmount;
      const tax = Math.round(subtotal * 0.11);
      const total = subtotal + tax;

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          customerEmail: formData.email.trim().toLowerCase(),
          customerPhone: formData.phone.trim(),
          nationality: formData.nationality,
          arrivalDate: formData.arrivalDate,
          flightNumber: formData.flightNumber.trim().toUpperCase(),
          productId,
          quantity: 1,
          subtotal,
          discount: discountAmount,
          tax,
          total,
          notes: formData.notes.trim(),
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.order.id;

      const paymentResponse = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Failed to initiate payment');
      }

      const paymentData = await paymentResponse.json();
      
      if (paymentData.redirect_url) {
        window.location.href = paymentData.redirect_url;
      } else {
        throw new Error('Payment redirect URL not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const originalPrice = product?.price || 0;
  const hasActiveDiscount = product && 
    product.discountPercentage && 
    product.discountPercentage > 0 &&
    (!product.discountStart || new Date(product.discountStart) <= new Date()) &&
    (!product.discountEnd || new Date(product.discountEnd) >= new Date());
  
  const discountAmount = hasActiveDiscount ? Math.round(originalPrice * ((product?.discountPercentage ?? 0) / 100)) : 0;
  const subtotal = originalPrice - discountAmount;
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Checkout</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">Complete your order and get connected in Bali</p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 max-w-6xl py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your order and get connected in Bali</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="As shown in passport"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone/WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+62 xxx xxxx xxxx"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality *</label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="">Select country</option>
                    <option value="Afghanistan">🇦🇫 Afghanistan</option>
                    <option value="Albania">🇦🇱 Albania</option>
                    <option value="Algeria">🇩🇿 Algeria</option>
                    <option value="Argentina">🇦🇷 Argentina</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="Austria">🇦🇹 Austria</option>
                    <option value="Bangladesh">🇧🇩 Bangladesh</option>
                    <option value="Belgium">🇧🇪 Belgium</option>
                    <option value="Brazil">🇧🇷 Brazil</option>
                    <option value="Brunei">🇧🇳 Brunei</option>
                    <option value="Cambodia">🇰🇭 Cambodia</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Chile">🇨🇱 Chile</option>
                    <option value="China">🇨🇳 China</option>
                    <option value="Colombia">🇨🇴 Colombia</option>
                    <option value="Denmark">🇩🇰 Denmark</option>
                    <option value="Egypt">🇪🇬 Egypt</option>
                    <option value="Finland">🇫🇮 Finland</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="Greece">🇬🇷 Greece</option>
                    <option value="Hong Kong">🇭🇰 Hong Kong</option>
                    <option value="Hungary">🇭🇺 Hungary</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="Indonesia">🇮🇩 Indonesia</option>
                    <option value="Iran">🇮🇷 Iran</option>
                    <option value="Iraq">🇮🇶 Iraq</option>
                    <option value="Ireland">🇮🇪 Ireland</option>
                    <option value="Israel">🇮🇱 Israel</option>
                    <option value="Italy">🇮🇹 Italy</option>
                    <option value="Japan">🇯🇵 Japan</option>
                    <option value="Jordan">🇯🇴 Jordan</option>
                    <option value="Kenya">🇰🇪 Kenya</option>
                    <option value="Kuwait">🇰🇼 Kuwait</option>
                    <option value="Laos">🇱🇦 Laos</option>
                    <option value="Lebanon">🇱🇧 Lebanon</option>
                    <option value="Libya">🇱🇾 Libya</option>
                    <option value="Luxembourg">🇱🇺 Luxembourg</option>
                    <option value="Macau">🇲🇴 Macau</option>
                    <option value="Malaysia">🇲🇾 Malaysia</option>
                    <option value="Maldives">🇲🇻 Maldives</option>
                    <option value="Mexico">🇲🇽 Mexico</option>
                    <option value="Mongolia">🇲🇳 Mongolia</option>
                    <option value="Morocco">🇲🇦 Morocco</option>
                    <option value="Myanmar">🇲🇲 Myanmar</option>
                    <option value="Nepal">🇳🇵 Nepal</option>
                    <option value="Netherlands">🇳🇱 Netherlands</option>
                    <option value="New Zealand">🇳🇿 New Zealand</option>
                    <option value="Nigeria">🇳🇬 Nigeria</option>
                    <option value="Norway">🇳🇴 Norway</option>
                    <option value="Oman">🇴🇲 Oman</option>
                    <option value="Pakistan">🇵🇰 Pakistan</option>
                    <option value="Palestine">🇵🇸 Palestine</option>
                    <option value="Peru">🇵🇪 Peru</option>
                    <option value="Philippines">🇵🇭 Philippines</option>
                    <option value="Poland">🇵🇱 Poland</option>
                    <option value="Portugal">🇵🇹 Portugal</option>
                    <option value="Qatar">🇶🇦 Qatar</option>
                    <option value="Romania">🇷🇴 Romania</option>
                    <option value="Russia">🇷🇺 Russia</option>
                    <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                    <option value="Singapore">🇸🇬 Singapore</option>
                    <option value="South Africa">🇿🇦 South Africa</option>
                    <option value="South Korea">🇰🇷 South Korea</option>
                    <option value="Spain">🇪🇸 Spain</option>
                    <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                    <option value="Sweden">🇸🇪 Sweden</option>
                    <option value="Switzerland">🇨🇭 Switzerland</option>
                    <option value="Syria">🇸🇾 Syria</option>
                    <option value="Taiwan">🇹🇼 Taiwan</option>
                    <option value="Thailand">🇹🇭 Thailand</option>
                    <option value="Timor-Leste">🇹🇱 Timor-Leste</option>
                    <option value="Tunisia">🇹🇳 Tunisia</option>
                    <option value="Turkey">🇹🇷 Turkey</option>
                    <option value="UAE">🇦🇪 United Arab Emirates</option>
                    <option value="Ukraine">🇺🇦 Ukraine</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="United States">🇺🇸 United States</option>
                    <option value="Uruguay">🇺🇾 Uruguay</option>
                    <option value="Uzbekistan">🇺🇿 Uzbekistan</option>
                    <option value="Venezuela">🇻🇪 Venezuela</option>
                    <option value="Vietnam">🇻🇳 Vietnam</option>
                    <option value="Yemen">🇾🇪 Yemen</option>
                    <option value="Other">🌍 Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Travel Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                Travel Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Arrival Date *</label>
                  <input
                    type="date"
                    name="arrivalDate"
                    value={formData.arrivalDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Flight Number *</label>
                  <input
                    type="text"
                    name="flightNumber"
                    value={formData.flightNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., GA123"
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                Additional Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Any special requests..."
                />
              </div>
            </div>
          </div>

          {/* Right: Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Product Card */}
              {product && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Order</h2>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                      <Wifi className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {product.duration ? `${product.duration} Days` : 'Varies'}
                      </div>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        {product.category === 'esim' ? 'eSIM' : 'Physical SIM'}
                      </span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-4 space-y-2">
                    {discountAmount > 0 ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Original Price</span>
                          <span className="line-through text-gray-400">{formatPrice(originalPrice)}</span>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                                {product.discountPercentage}% OFF
                              </span>
                              <span className="text-sm text-green-700 font-medium">You save</span>
                            </div>
                            <span className="text-sm font-bold text-green-700">-{formatPrice(discountAmount)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">{formatPrice(subtotal)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price</span>
                        <span className="font-medium">{formatPrice(originalPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (11%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-end">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-xl text-gray-900">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {isSubmitting ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Pickup Location */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 text-sm">Pickup Location</h3>
                    <p className="text-blue-700 text-sm mt-1">Ngurah Rai International Airport, Arrival Hall</p>
                    <p className="text-blue-600 text-xs mt-1">SIM card ready after KYC approval</p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Secure payment via Midtrans</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Lock className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>2-hour payment window</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Instant activation at outlet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
