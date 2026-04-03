// src/app/api/orders/[id]/payment/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { core } from "@/lib/midtrans";
import crypto from "crypto";

// Verify Midtrans webhook signature
function verifyMidtransSignature(
  notificationPayload: any,
  serverKey: string
): boolean {
  const { order_id, status_code, gross_amount, signature_key } = notificationPayload;
  
  if (!signature_key || !order_id || !status_code || !gross_amount) {
    return false;
  }

  // Create signature hash: order_id + status_code + gross_amount + server_key
  const payload = order_id + status_code + gross_amount + serverKey;
  const computedSignature = crypto
    .createHash('sha512')
    .update(payload)
    .digest('hex');

  return computedSignature === signature_key;
}

export async function POST(request: NextRequest) {
  try {
    // Get notification payload from Midtrans
    const notificationPayload = await request.json();

    // Verify webhook signature for security
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const isSignatureValid = verifyMidtransSignature(notificationPayload, serverKey);
    if (!isSignatureValid) {
      console.error("Invalid Midtrans signature", {
        orderId: notificationPayload.order_id,
        signature: notificationPayload.signature_key,
      });
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Validate transaction with Midtrans
    const transactionStatus = await core.transaction.status(notificationPayload.order_id);
    
    const orderId = transactionStatus.order_id;
    const transactionStatusValue = transactionStatus.transaction_status;
    const fraudStatus = transactionStatus.fraud_status || 'accept';

    // Find order by order number
    const orderResult = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        paymentGatewayId: orders.paymentGatewayId,
        paymentStatus: orders.paymentStatus,
        orderStatus: orders.orderStatus,
      })
      .from(orders)
      .where(eq(orders.orderNumber, orderId))
      .limit(1);

    if (!orderResult.length) {
      console.error(`Order with order number ${orderId} not found`);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Update order based on transaction status
    let newPaymentStatus = order.paymentStatus;
    let newOrderStatus = order.orderStatus;

    switch (transactionStatusValue) {
      case "capture":
      case "settlement":
        // Payment successful
        if (fraudStatus === "challenge") {
          newPaymentStatus = "pending";
          newOrderStatus = "pending";
        } else if (fraudStatus === "accept") {
          newPaymentStatus = "paid";
          newOrderStatus = "paid";
        }
        break;
      case "pending":
        newPaymentStatus = "pending";
        newOrderStatus = "pending";
        break;
      case "deny":
      case "expire":
        newPaymentStatus = "failed";
        newOrderStatus = "expired";
        break;
      case "cancel":
        newPaymentStatus = "failed";
        newOrderStatus = "cancelled";
        break;
      case "refund":
      case "partial_refund":
        newPaymentStatus = "refunded";
        newOrderStatus = "cancelled";
        break;
      default:
        console.warn(`Unknown transaction status: ${transactionStatusValue}`);
        return NextResponse.json(
          { success: false, error: "Unknown transaction status" },
          { status: 400 }
        );
    }

    // Get current order status before update
    const currentOrder = await db
      .select({
        orderStatus: orders.orderStatus,
      })
      .from(orders)
      .where(eq(orders.id, order.id))
      .limit(1);

    const oldStatus = currentOrder[0]?.orderStatus || 'pending';

    // Update order in database
    await db
      .update(orders)
      .set({
        paymentStatus: newPaymentStatus,
        orderStatus: newOrderStatus,
        paymentGatewayId: transactionStatus.transaction_id,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    console.log(
      `Order ${order.id} payment status updated to ${newPaymentStatus}, order status to ${newOrderStatus}`
    );

    // Trigger workflow if status changed
    if (oldStatus !== newOrderStatus) {
      import('@/lib/workflows').then(workflows => {
        workflows.processOrderStatusUpdate(order.id, newOrderStatus, oldStatus).catch(console.error);
      });
    }

    // Return success response to Midtrans
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Midtrans callback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payment callback" },
      { status: 500 }
    );
  }
}
