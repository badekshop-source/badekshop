// src/app/api/admin/orders/[id]/refund/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, adminLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const refundSchema = z.object({
  reason: z.string().min(1, "Refund reason is required"),
  refundAmount: z.number().positive(),
  adminFee: z.number().nonnegative(),
  adminId: z.string().uuid().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const validatedData = refundSchema.parse(body);

    const orderResult = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        paymentStatus: orders.paymentStatus,
        total: orders.total,
        refundStatus: orders.refundStatus,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const order = orderResult[0];

    if (order.paymentStatus !== "paid") {
      return NextResponse.json({ success: false, error: "Cannot refund unpaid order" }, { status: 400 });
    }

    if (order.refundStatus === "processed") {
      return NextResponse.json({ success: false, error: "Refund already processed" }, { status: 400 });
    }

    await db
      .update(orders)
      .set({
        refundAmount: validatedData.refundAmount,
        refundReason: validatedData.reason,
        refundStatus: "processed",
        orderStatus: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    if (validatedData.adminId) {
      await db.insert(adminLogs).values({
        adminId: validatedData.adminId,
        action: "process_refund",
        targetId: orderId,
        targetType: "order",
        details: {
          reason: validatedData.reason,
          refundAmount: validatedData.refundAmount,
          adminFee: validatedData.adminFee,
          orderTotal: order.total,
        },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Refund processed successfully",
        refundAmount: validatedData.refundAmount,
        adminFee: validatedData.adminFee,
      },
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid request", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to process refund" }, { status: 500 });
  }
}
