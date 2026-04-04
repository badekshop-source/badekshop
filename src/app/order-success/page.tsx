// src/app/order-success/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, FileText, MapPin, Clock, Smartphone, Upload, Loader2, Shield, AlertCircle, QrCode, Download, Camera } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

interface OrderInfo {
  id: string;
  orderNumber: string;
  fullName: string;
  customerEmail: string;
  productName: string;
  total: number;
  imeiNumber: string | null;
  paymentStatus: string;
  kycStatus: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // KYC form state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imei, setImei] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [consent, setConsent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!orderId) {
      console.log('No orderId in URL');
      setLoading(false);
      return;
    }

    console.log('Fetching order with ID:', orderId);

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        const foundOrder = data.orders?.find((o: any) => o.id === orderId);
        console.log('Found order:', foundOrder?.id, 'Payment:', foundOrder?.paymentStatus);

        if (!foundOrder) {
          console.error('Order not found with ID:', orderId);
          return;
        }

        let productName = 'Unknown';
        if (foundOrder.productId) {
          try {
            const prodRes = await fetch(`/api/products/${foundOrder.productId}`);
            if (prodRes.ok) {
              const prodData = await prodRes.json();
              productName = prodData.product?.name || 'Unknown';
            }
          } catch { /* ignore */ }
        }

        setOrder({
          id: foundOrder.id,
          orderNumber: foundOrder.orderNumber,
          fullName: foundOrder.fullName,
          customerEmail: foundOrder.customerEmail,
          productName,
          total: foundOrder.total,
          imeiNumber: foundOrder.imeiNumber,
          paymentStatus: foundOrder.paymentStatus,
          kycStatus: foundOrder.kycStatus,
        });

        if (foundOrder.imeiNumber) {
          setImei(foundOrder.imeiNumber);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const isPaid = order?.paymentStatus === 'paid';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log('File selected:', selectedFile?.name, selectedFile?.type, selectedFile?.size);
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      console.log('Preview URL set:', objectUrl);
      setPreview(objectUrl);
      setError(null);
    }
  };

  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImei(e.target.value.replace(/\D/g, '').slice(0, 15));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !order) {
      setError('Please select a passport photo');
      return;
    }
    if (imei.length !== 15) {
      setError('Valid 15-digit IMEI is required');
      return;
    }
    if (!consent) {
      setError('Please consent to data processing');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: { 'X-Order-Id': order.id, 'X-IMEI': imei },
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Fetch updated order to get the new KYC status
      const updatedOrderResponse = await fetch(`/api/orders`);
      if (updatedOrderResponse.ok) {
        const updatedData = await updatedOrderResponse.json();
        const updatedOrder = updatedData.orders?.find((o: any) => o.id === order.id);
        if (updatedOrder) {
          setOrder(prev => prev ? {
            ...prev,
            kycStatus: updatedOrder.kycStatus,
          } : null);
        }
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LandingHeader />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading order details...</p>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LandingHeader />
        <main className="flex-1 pt-20 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-500 mb-6">We couldn&apos;t find your order details.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Go to Homepage
            </Link>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  if (success) {
    const isAutoApproved = order?.kycStatus === 'auto_approved';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`badekshop:${order?.id}`)}`;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LandingHeader />
      <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Success Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isAutoApproved ? 'KYC Approved!' : 'Passport Submitted!'}
              </h1>
              <p className="text-gray-500 mb-2">
                {isAutoApproved
                  ? 'Your passport has been verified automatically.'
                  : 'Your passport has been submitted for review.'}
              </p>
            </div>

            {/* QR Code - Show only if auto-approved */}
            {isAutoApproved && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Your Activation QR Code</h2>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm">
                    Show this QR code and your passport at <strong>Ngurah Rai International Airport, Arrival Hall</strong> to collect your SIM card.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200">
                    <img
                      src={qrCodeUrl}
                      alt="Activation QR Code"
                      className="w-64 h-64"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCodeUrl;
                      link.download = `badekshop-qr-${order?.orderNumber}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Screenshot or save this QR code for easy access</li>
                    <li>Bring your passport for verification at pickup</li>
                    <li>Operating hours: 24/7 at Ngurah Rai International Airport</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Under Review Message */}
            {!isAutoApproved && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Under Review</h3>
                    <p className="text-sm text-amber-700">
                      Your passport is being reviewed by our team. You will receive a QR code via email once approved.
                      This usually takes 1-2 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/track-order"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Track Your Order
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LandingHeader />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Order Confirmed</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">Your payment has been received. Complete identity verification to activate your SIM card.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Number</span>
                <span className="font-mono font-medium text-gray-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Product</span>
                <span className="font-medium text-gray-900">{order.productName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-900">Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium text-green-600">Confirmed</span>
              </div>
            </div>
          </div>

          {/* KYC Upload Form */}
          {isPaid && !success && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Identity Verification</h2>
              <p className="text-sm text-gray-500 mb-6">Upload your passport photo and confirm your IMEI number to activate your SIM card.</p>

              {/* Government Regulation Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 text-sm mb-1">Required by Indonesian Government Regulations</h3>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      According to Indonesian telecommunications regulations (Kominfo), all SIM card and eSIM activations require identity verification. 
                      Your passport photo and IMEI number are mandatory to comply with these regulations. Your data is securely stored and automatically deleted after 30 days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Quality Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">Photo Tips for Faster Activation</h3>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Ensure text is clear and readable</li>
                      <li>• Avoid glare or reflections on the passport</li>
                      <li>• Include all four corners of the passport page</li>
                      <li>• Good lighting helps speed up verification at the outlet</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Passport Upload */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Passport Photo *</p>
                  <p className="text-xs text-gray-500 mb-3">Ensure text is clear, avoid glare, and do not crop the document.</p>

                  {preview ? (
                    <div className="border-2 border-green-500 bg-green-50 rounded-xl p-6 text-center">
                      <img src={preview} alt="Passport preview" className="mx-auto max-h-48 object-contain mb-3 rounded-lg" />
                      <p className="text-green-600 font-medium text-sm mb-3">Photo uploaded successfully</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Change photo
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center transition-colors">
                      <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium text-sm mb-1">Click to upload passport photo</p>
                      <p className="text-xs text-gray-500 mb-3">JPG, PNG up to 5MB</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </button>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                </div>

                {/* IMEI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IMEI Number * <span className="text-gray-400 font-normal">(15 digits)</span>
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={imei}
                      onChange={handleImeiChange}
                      required
                      maxLength={15}
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      placeholder="15-digit IMEI number"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-gray-500">{imei.length}/15 digits</p>
                    {imei.length === 15 && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Valid
                      </p>
                    )}
                  </div>
                </div>

                {/* Consent */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700">
                    I consent to the processing of my personal data for SIM card activation in accordance with Indonesian regulations
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!file || isUploading || imei.length !== 15 || !consent}
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit Passport & IMEI
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Pickup Location</h4>
              </div>
              <p className="text-sm text-gray-500">Ngurah Rai International Airport, Arrival Hall</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Activation</h4>
              </div>
              <p className="text-sm text-gray-500">SIM card ready after KYC approval</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/track-order" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Track Order
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
