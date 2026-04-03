// src/app/api/admin/orders/[id]/kyc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, kycDocuments, adminLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const kycUpdateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
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
    const { status, notes, adminId } = kycUpdateSchema.parse(body);

    // Check if order exists
    const orderResult = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        kycStatus: orders.kycStatus,
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

    // Validate KYC can be updated
    if (order.kycStatus === "approved" && status === "approved") {
      return NextResponse.json(
        { success: false, error: "KYC is already approved" },
        { status: 400 }
      );
    }

    // Update order KYC status
    const newOrderStatus = status === "approved" ? "processing" : "rejected";
    
    await db
      .update(orders)
      .set({
        kycStatus: status,
        orderStatus: newOrderStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    // Update KYC document record
    await db
      .update(kycDocuments)
      .set({
        verificationStatus: status,
        verifiedBy: adminId,
        verificationNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(kycDocuments.orderId, id));

    // Log admin action
    await db.insert(adminLogs).values({
      adminId,
      action: status === "approved" ? "approve_kyc" : "reject_kyc",
      targetId: id,
      targetType: "order",
      details: { previousStatus: order.kycStatus, newStatus: status, notes },
      createdAt: new Date(),
    });

    // Trigger workflow for approved KYC
    if (status === "approved") {
      const { processOrderStatusUpdate } = await import("@/lib/workflows");
      await processOrderStatusUpdate(id, newOrderStatus, order.orderStatus);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `KYC ${status} successfully`,
        orderId: id,
        newStatus: status,
      },
    });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to update KYC status" },
      { status: 500 }
    );
  }
}
