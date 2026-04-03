// src/app/api/email/order-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { to, orderNumber, productName, token, orderId } = await request.json();

    // Validate required fields
    if (!to || !orderNumber || !productName || !token || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const emailSent = await sendOrderConfirmationEmail({
      to,
      orderNumber,
      productName,
      token,
      orderId
    });

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order confirmation email sent successfully"
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}