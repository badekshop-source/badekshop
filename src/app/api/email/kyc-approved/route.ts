// src/app/api/email/kyc-approved/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendKycApprovedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { to, orderNumber, productName, qrCodeUrl, activationOutlet, token, orderId } = await request.json();

    // Validate required fields
    if (!to || !orderNumber || !productName || !qrCodeUrl || !activationOutlet || !token || !orderId) {
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

    const emailSent = await sendKycApprovedEmail({
      to,
      orderNumber,
      productName,
      qrCodeUrl,
      activationOutlet,
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
      message: "KYC approved email sent successfully"
    });
  } catch (error) {
    console.error("Error sending KYC approved email:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}