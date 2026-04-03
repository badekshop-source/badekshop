// src/app/api/admin/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, adminLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const statusUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "approved", "rejected", "expired", "cancelled", "completed"]),
  notes: z.string().optional(),
  adminId: z.string().uuid(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, adminId } = statusUpdateSchema.parse(body);

    // Check if order exists
    const orderResult = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        customerEmail: orders.customerEmail,
      })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!orderResult.length) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Prevent invalid status transitions
    const finalStatuses = ["completed", "cancelled", "expired"];
    if (finalStatuses.includes(order.orderStatus)) {
      return NextResponse.json(
        { success: false, error: "Cannot modify order with final status" },
        { status: 400 }
      );
    }

    // Update order status
    await db
      .update(orders)
      .set({
        orderStatus: status,
        notes: notes || undefined,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    // Log admin action
    await db.insert(adminLogs).values({
      adminId,
      action: "update_order_status",
      targetId: id,
      targetType: "order",
      details: { previousStatus: order.orderStatus, newStatus: status, notes },
      createdAt: new Date(),
    });

    // Trigger workflow
    const { processOrderStatusUpdate } = await import("@/lib/workflows");
    await processOrderStatusUpdate(id, status, order.orderStatus);

    return NextResponse.json({
      success: true,
      data: {
        message: "Order status updated successfully",
        orderId: id,
        previousStatus: order.orderStatus,
        newStatus: status,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
