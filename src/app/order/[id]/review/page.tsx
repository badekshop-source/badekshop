// src/app/order/[id]/review/page.tsx
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyOrderToken } from "@/lib/token";
import { ReviewForm } from "@/components/reviews/ReviewForm";

interface ReviewPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
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

  // Fetch order
  const orderResult = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      orderStatus: orders.orderStatus,
      customerEmail: orders.customerEmail,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!orderResult.length) {
    notFound();
  }

  const order = orderResult[0];

  // Only allow reviews for completed orders
  if (order.orderStatus !== "completed") {
    redirect(`/order/${id}?token=${token}&error=order-not-completed` as any);
  }

  // Check if already reviewed
  const existingReview = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.orderId, id))
    .limit(1);

  if (existingReview.length > 0) {
    redirect(`/order/${id}?token=${token}&error=already-reviewed` as any);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Experience</h1>
            <p className="text-gray-600">
              Thank you for choosing badekshop! We&apos;d love to hear about your experience.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Order: {order.orderNumber}
            </p>
          </div>

          <ReviewForm
            orderId={id}
            token={token}
            customerEmail={order.customerEmail}
          />
        </div>
      </div>
    </div>
  );
}