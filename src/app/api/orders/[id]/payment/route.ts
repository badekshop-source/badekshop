// src/app/api/orders/[id]/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { snap } from "@/lib/midtrans";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  try {
    // Validate Midtrans configuration
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const mode = process.env.MIDTRANS_MODE;

    if (!serverKey || !clientKey) {
      console.error("[Midtrans] Configuration error: Missing server key or client key");
      return NextResponse.json(
        { 
          success: false, 
          error: "Payment gateway configuration error. Please contact support.",
          details: process.env.NODE_ENV === 'development' ? 'Midtrans keys not configured' : undefined
        },
        { status: 500 }
      );
    }

    if (!mode || (mode !== 'sandbox' && mode !== 'production')) {
      console.error(`[Midtrans] Configuration error: Invalid mode '${mode}'. Must be 'sandbox' or 'production'`);
      return NextResponse.json(
        { 
          success: false, 
          error: "Payment gateway configuration error. Please contact support.",
          details: process.env.NODE_ENV === 'development' ? `Invalid Midtrans mode: ${mode}` : undefined
        },
        { status: 500 }
      );
    }

    // Check rate limit (3 checkout attempts per hour per order)
    const rateLimitResult = await rateLimit.checkout(orderId);
    if (!rateLimitResult.success) {
      const minutesLeft = Math.ceil((rateLimitResult.reset - Date.now()) / 60000);
      return NextResponse.json(
        { success: false, error: `Too many payment attempts. Please try again in ${minutesLeft} minutes.` },
        { status: 429 }
      );
    }

    // Fetch order details
    const orderResult = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerEmail: orders.customerEmail,
        fullName: orders.fullName,
        total: orders.total,
        orderStatus: orders.orderStatus,
        paymentStatus: orders.paymentStatus,
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

    // Check if order already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { success: false, error: "Order already paid" },
        { status: 400 }
      );
    }

    // Check if order has expired
    if (order.orderStatus === "expired") {
      return NextResponse.json(
        { success: false, error: "Order has expired" },
        { status: 400 }
      );
    }

    // Validate order total
    if (!order.total || order.total <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order total amount" },
        { status: 400 }
      );
    }

    // Prepare transaction details for Midtrans
    const transactionDetails = {
      order_id: order.orderNumber,
      gross_amount: Math.round(order.total),
    };

    const customerDetails = {
      first_name: order.fullName.split(" ")[0],
      last_name: order.fullName.split(" ").slice(1).join(" ") || order.fullName,
      email: order.customerEmail,
    };

    const creditCard = {
      secure: true,
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const finishUrl = `${appUrl}/order-success?id=${orderId}`;
    const errorUrl = `${appUrl}/payment-failed?order=${orderId}`;

    // Create transaction payload
    const transaction = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      credit_card: creditCard,
      callbacks: {
        finish: finishUrl,
        error: errorUrl,
      },
    };

    console.log(`[Midtrans] Creating transaction for order: ${order.orderNumber}, amount: ${transactionDetails.gross_amount}`);

    // Call Midtrans Snap API
    const transactionToken = await snap.createTransaction(transaction);

    console.log(`[Midtrans] Transaction created successfully: ${transactionToken.token_id}`);

    // Return redirect URL to client
    return NextResponse.json({
      success: true,
      redirect_url: transactionToken.redirect_url,
      token: transactionToken.token_id,
    });
  } catch (error: any) {
    // Log detailed error for debugging
    console.error("[Midtrans] Error creating transaction:", error);
    
    // Extract Midtrans-specific error details
    let errorMessage = "Failed to initiate payment. Please try again.";
    let statusCode = 500;

    if (error?.response) {
      // Midtrans API returned an error response
      const midtransError = error.response.data || error.response;
      console.error("[Midtrans] API Error Response:", JSON.stringify(midtransError, null, 2));
      
      const midtransMessage = midtransError.status_message || midtransError.message || midtransError.error_messages;
      
      if (midtransMessage) {
        errorMessage = `Payment error: ${midtransMessage}`;
      }

      // Check for specific Midtrans error codes
      if (midtransError.status_code === '401' || midtransError.status_code === '403') {
        errorMessage = "Payment gateway authentication error. Please contact support.";
        console.error("[Midtrans] Authentication failed - check your server key");
      } else if (midtransError.status_code === '400') {
        errorMessage = `Invalid payment request: ${midtransMessage}`;
      }
    } else if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      errorMessage = "Cannot connect to payment gateway. Please try again later.";
      console.error("[Midtrans] Network error:", error.message);
    } else if (error?.message) {
      // Use the error message if available
      errorMessage = `Payment error: ${error.message}`;
    }

    // In development, show more details
    if (process.env.NODE_ENV === 'development') {
      errorMessage = error?.message || errorMessage;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          response: error?.response?.data || null
        } : undefined
      },
      { status: statusCode }
    );
  }
}