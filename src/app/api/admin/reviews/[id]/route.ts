// src/app/api/admin/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, profiles, adminLogs } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET /api/admin/reviews/[id] - Get single review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const adminUser = await db
      .select({ role: profiles.role, id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, session.user.email))
      .limit(1);

    if (!adminUser.length || adminUser[0].role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id: reviewId } = await params;

    const review = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), isNull(reviews.deletedAt)))
      .limit(1);

    if (!review.length) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: review[0] });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reviews/[id] - Update review (approve/reject/edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const adminUser = await db
      .select({ role: profiles.role, id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, session.user.email))
      .limit(1);

    if (!adminUser.length || adminUser[0].role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id: reviewId } = await params;
    const body = await request.json();

    // Validate input
    const updateSchema = z.object({
      isApproved: z.boolean().optional(),
      reviewText: z.string().min(10).max(1000).optional(),
      tripType: z.enum(["business", "leisure", "family", "solo"]).optional(),
      tripDuration: z.enum(["1-3", "4-7", "8-14", "15+"]).optional(),
    });

    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if review exists
    const existing = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), isNull(reviews.deletedAt)))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    // Update review
    const [updated] = await db
      .update(reviews)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    // Log action
    await db.insert(adminLogs).values({
      adminId: adminUser[0].id,
      action: validation.data.isApproved !== undefined 
        ? (validation.data.isApproved ? "approve_review" : "reject_review")
        : "edit_review",
      targetId: reviewId,
      targetType: "review",
      details: { changes: validation.data },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Soft delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const adminUser = await db
      .select({ role: profiles.role, id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, session.user.email))
      .limit(1);

    if (!adminUser.length || adminUser[0].role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id: reviewId } = await params;

    // Check if review exists
    const existing = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), isNull(reviews.deletedAt)))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    // Soft delete
    await db
      .update(reviews)
      .set({
        deletedAt: new Date(),
        deletedBy: adminUser[0].id,
      })
      .where(eq(reviews.id, reviewId));

    // Log action
    await db.insert(adminLogs).values({
      adminId: adminUser[0].id,
      action: "delete_review",
      targetId: reviewId,
      targetType: "review",
      details: { reviewText: existing[0].reviewText },
    });

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    );
  }
}