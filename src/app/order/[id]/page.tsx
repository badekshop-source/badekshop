// src/app/order/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, products, reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyOrderToken } from "@/lib/token";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { KycUploadSection } from "@/components/order/KycUploadSection";
import { QRCodeDisplay } from "@/components/order/QRCodeDisplay";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    redirect("/track-order" as any);
  }

  // Verify the token
  const payload = verifyOrderToken(token);
  if (!payload || payload.orderId !== id) {
    redirect("/track-order?error=invalid-token" as any);
  }

  // Fetch order with product info
  const orderResult = await db
    .select({
      order: orders,
      product: products,
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!orderResult.length) {
    notFound();
  }

  const { order, product } = orderResult[0];

  // Check if user has already submitted a review
  const existingReview = await db
    .select()
    .from(reviews)
    .where(eq(reviews.orderId, id))
    .limit(1);

  const hasReviewed = existingReview.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Order Details</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">Order Number: {order.orderNumber}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Order Status Tracker */}
          <div className="mb-8">
            <OrderStatusTracker
              orderStatus={order.orderStatus}
              kycStatus={order.kycStatus}
              kycAttempts={order.kycAttempts}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* KYC Section - Show after payment success */}
            {(order.orderStatus === "paid" || 
              order.orderStatus === "processing" || 
              order.orderStatus === "approved" ||
              (order.orderStatus !== "cancelled" && order.orderStatus !== "expired")) && (
              <KycUploadSection
                orderId={order.id}
                kycStatus={order.kycStatus}
                kycAttempts={order.kycAttempts}
                passportUrl={order.passportUrl}
                imeiNumber={order.imeiNumber}
                hasToken={!!token}
                token={token}
              />
            )}

            {/* QR Code Section - Only show when approved */}
            {order.kycStatus === "approved" && order.qrCodeData && (
              <QRCodeDisplay
                qrCodeData={order.qrCodeData}
                orderStatus={order.orderStatus}
                activationOutlet={order.activationOutlet}
              />
            )}

            {/* Review Section - Only show for completed orders */}
            {order.orderStatus === "completed" && !hasReviewed && (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Share Your Experience
                </h3>
                <p className="text-gray-600 mb-4">
                  We hope you enjoyed using our eSIM/SIM card service! Please take a moment to share your feedback.
                </p>
                <Link
                  href={`/order/${order.id}/review?token=${token}` as any}
                  className="inline-block bg-yellow-500 text-white px-6 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors"
                >
                  Write a Review
                </Link>
              </div>
            )}

            {hasReviewed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-800">
                  Thank you for your review! We appreciate your feedback.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {product && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.category === "esim" ? "eSIM" : "SIM Card"}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 block">Full Name</span>
                  <span className="font-medium">{order.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Email</span>
                  <span className="font-medium">{order.customerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Phone</span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Nationality</span>
                  <span className="font-medium">{order.nationality}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Arrival Date</span>
                  <span className="font-medium">{formatDate(order.arrivalDate)}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Flight Number</span>
                  <span className="font-medium">{order.flightNumber}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 block">Location</span>
                  <span className="font-medium">{order.activationOutlet}</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Please show your QR code and passport at the pickup counter.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}