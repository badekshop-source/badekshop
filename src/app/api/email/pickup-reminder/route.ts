// src/app/api/email/pickup-reminder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendPickupReminderEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { to, orderNumber, productName, arrivalDate, flightNumber, activationOutlet } = await request.json();

    // Validate required fields
    if (!to || !orderNumber || !productName || !arrivalDate || !flightNumber || !activationOutlet) {
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

    const emailSent = await sendPickupReminderEmail({
      to,
      orderNumber,
      productName,
      arrivalDate: new Date(arrivalDate),
      flightNumber,
      activationOutlet
    });

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pickup reminder email sent successfully"
    });
  } catch (error) {
    console.error("Error sending pickup reminder email:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}