// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, orders } from "@/lib/db/schema";
import { eq, and, desc, gte, isNull, count } from "drizzle-orm";
import { verifyOrderToken } from "@/lib/token";
import { z } from "zod";

const reviewSchema = z.object({
  orderId: z.string().uuid(),
  token: z.string(),
  userName: z.string().min(2).max(100),
  userEmail: z.string().email(),
  country: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  tripType: z.enum(["business", "leisure", "family", "solo"]),
  tripDuration: z.enum(["1-3", "4-7", "8-14", "15+"]),
  reviewText: z.string().min(10).max(1000),
});

// GET /api/reviews - Get approved reviews for landing page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const minRating = parseInt(searchParams.get("minRating") || "0");
    const offset = (page - 1) * limit;

    // Build where clause
    const conditions = [eq(reviews.isApproved, true), isNull(reviews.deletedAt)];
    
    if (minRating > 0) {
      conditions.push(gte(reviews.rating, minRating));
    }

    const approvedReviews = await db
      .select({
        id: reviews.id,
        userName: reviews.userName,
        country: reviews.country,
        rating: reviews.rating,
        tripType: reviews.tripType,
        tripDuration: reviews.tripDuration,
        reviewText: reviews.reviewText,
        reviewedAt: reviews.reviewedAt,
      })
      .from(reviews)
      .where(and(...conditions))
      .orderBy(desc(reviews.reviewedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: approvedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { orderId, token, ...reviewData } = validation.data;

    // Verify token
    const payload = verifyOrderToken(token);
    if (!payload || payload.orderId !== orderId) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if order exists and is completed
    const orderResult = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        customerEmail: orders.customerEmail,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    if (order.orderStatus !== "completed") {
      return NextResponse.json(
        { success: false, error: "Only completed orders can be reviewed" },
        { status: 400 }
      );
    }

    // Verify email matches
    if (order.customerEmail.toLowerCase() !== reviewData.userEmail.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Email does not match order" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.orderId, orderId))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { success: false, error: "You have already submitted a review for this order" },
        { status: 400 }
      );
    }

    // Auto-approve 4-5 star reviews, require manual review for 1-3 stars
    const isApproved = reviewData.rating >= 4;

    // Insert review
    const [newReview] = await db
      .insert(reviews)
      .values({
        orderId,
        ...reviewData,
        isApproved,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newReview.id,
        isApproved,
        message: isApproved
          ? "Thank you for your review! It has been published."
          : "Thank you for your review! It will be reviewed by our team before publishing.",
      },
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}