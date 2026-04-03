// src/app/api/email/follow-up/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendFollowUpEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { to, orderNumber, productName, reviewLink } = await request.json();

    // Validate required fields
    if (!to || !orderNumber || !productName || !reviewLink) {
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

    const emailSent = await sendFollowUpEmail({
      to,
      orderNumber,
      productName,
      reviewLink
    });

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Follow-up email sent successfully"
    });
  } catch (error) {
    console.error("Error sending follow-up email:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}