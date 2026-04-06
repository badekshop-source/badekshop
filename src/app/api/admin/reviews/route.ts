// src/app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, orders, profiles, adminLogs } from "@/lib/db/schema";
import { eq, and, desc, isNull, gte, lte, inArray, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET /api/admin/reviews - List all reviews with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const adminUser = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.email, session.user.email))
      .limit(1);

    if (!adminUser.length || adminUser[0].role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const rating = searchParams.get("rating");
    const status = searchParams.get("status"); // "approved", "pending", "all"
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [isNull(reviews.deletedAt)];

    if (rating && ["1", "2", "3", "4", "5"].includes(rating)) {
      conditions.push(eq(reviews.rating, parseInt(rating)));
    }

    if (status === "approved") {
      conditions.push(eq(reviews.isApproved, true));
    } else if (status === "pending") {
      conditions.push(eq(reviews.isApproved, false));
    }

    // Get reviews with order info
    let query = db
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
      .where(and(...conditions))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    const reviewList = await query;

    // Filter by search if provided
    let filteredReviews = reviewList;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReviews = reviewList.filter((r: typeof reviewList[0]) =>
        r.userName.toLowerCase().includes(searchLower) ||
        r.userEmail.toLowerCase().includes(searchLower) ||
        r.country.toLowerCase().includes(searchLower) ||
        r.reviewText.toLowerCase().includes(searchLower)
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    // Get pending count for badge
    const pendingCount = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.isApproved, false), isNull(reviews.deletedAt)));

    return NextResponse.json({
      success: true,
      data: filteredReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      pendingCount: pendingCount[0]?.count || 0,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}