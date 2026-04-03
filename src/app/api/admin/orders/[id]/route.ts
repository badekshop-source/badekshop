// src/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, products, kycDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch order with product details
    const orderResult = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        fullName: orders.fullName,
        customerEmail: orders.customerEmail,
        customerPhone: orders.customerPhone,
        nationality: orders.nationality,
        arrivalDate: orders.arrivalDate,
        flightNumber: orders.flightNumber,
        quantity: orders.quantity,
        subtotal: orders.subtotal,
        discount: orders.discount,
        tax: orders.tax,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        paymentGatewayId: orders.paymentGatewayId,
        orderStatus: orders.orderStatus,
        kycStatus: orders.kycStatus,
        kycAttempts: orders.kycAttempts,
        imeiNumber: orders.imeiNumber,
        passportUrl: orders.passportUrl,
        passportPublicId: orders.passportPublicId,
        qrCodeData: orders.qrCodeData,
        refundAmount: orders.refundAmount,
        refundReason: orders.refundReason,
        refundStatus: orders.refundStatus,
        activationOutlet: orders.activationOutlet,
        notes: orders.notes,
        expiresAt: orders.expiresAt,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
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

    // Fetch product details
    const productResult = await db
      .select()
      .from(products)
      .where(eq(products.id, order.productId || ""))
      .limit(1);

    // Fetch KYC documents
    const kycResult = await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.orderId, id));

    return NextResponse.json({
      success: true,
      data: {
        order,
        product: productResult[0] || null,
        kycDocuments: kycResult,
      },
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
