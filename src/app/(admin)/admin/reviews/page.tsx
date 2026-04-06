import { db } from "@/lib/db";
import { reviews, orders } from "@/lib/db/schema";
import { desc, isNull, eq } from "drizzle-orm";
import { ReviewsClientPage } from "./reviews-client-page";

export default async function AdminReviewsPage() {
  if (!db) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Database Connection Error</p>
        <p className="text-sm mt-1">Please check your environment variables.</p>
      </div>
    );
  }

  // Fetch all reviews with order info
  const reviewsList = await db
    .select({
      id: reviews.id,
      orderId: reviews.orderId,
      orderNumber: orders.orderNumber,
      userName: reviews.userName,
      userEmail: reviews.userEmail,
      country: reviews.country,
      rating: reviews.rating,
      tripType: reviews.tripType,
      tripDuration: reviews.tripDuration,
      reviewText: reviews.reviewText,
      isApproved: reviews.isApproved,
      reviewedAt: reviews.reviewedAt,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .leftJoin(orders, eq(reviews.orderId, orders.id))
    .where(isNull(reviews.deletedAt))
    .orderBy(desc(reviews.createdAt));

  // Count pending reviews
  const pendingCount = reviewsList.filter((r: typeof reviewsList[0]) => !r.isApproved).length;

  return <ReviewsClientPage initialReviews={reviewsList} pendingCount={pendingCount} />;
}