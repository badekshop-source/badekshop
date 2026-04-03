// src/app/api/kyc/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, kycDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyOrderToken } from "@/lib/token";
import { uploadPassport } from "@/lib/cloudinary";
import { validatePassportPhoto, determineKycStatus } from "@/lib/kyc-validation";

// Rate limiting: 5 uploads per hour per order
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(orderId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 5;

  const record = uploadAttempts.get(orderId);

  if (!record || now > record.resetTime) {
    uploadAttempts.set(orderId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const orderId = formData.get("orderId") as string;
    const token = formData.get("token") as string;
    const imei = formData.get("imei") as string;

    // Validate inputs
    if (!file || !orderId || !token) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate IMEI if provided
    if (imei && !/^\d{15}$/.test(imei)) {
      return NextResponse.json(
        { success: false, error: "IMEI must be exactly 15 digits" },
        { status: 400 }
      );
    }

    // Verify token
    const payload = verifyOrderToken(token);
    if (!payload || payload.orderId !== orderId) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(orderId)) {
      return NextResponse.json(
        { success: false, error: "Too many upload attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Fetch order
    const orderResult = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        kycStatus: orders.kycStatus,
        kycAttempts: orders.kycAttempts,
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

    // Check if order can accept uploads
    if (order.orderStatus === "cancelled" || order.orderStatus === "expired") {
      return NextResponse.json(
        { success: false, error: "Order is no longer active" },
        { status: 400 }
      );
    }

    if (order.kycStatus === "approved") {
      return NextResponse.json(
        { success: false, error: "KYC already approved" },
        { status: 400 }
      );
    }

    if (order.kycAttempts >= 3) {
      return NextResponse.json(
        { success: false, error: "Maximum upload attempts reached" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    let uploadResult;
    let validationResult; // Declare outside try block
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Validate the passport photo before uploading
      validationResult = await validatePassportPhoto(buffer);
      
      if (!validationResult.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid passport photo", 
            issues: validationResult.issues 
          },
          { status: 400 }
        );
      }

      uploadResult = await uploadPassport(buffer, 'badekshop/kyc');
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload image to cloud storage" },
        { status: 500 }
      );
    }

    // Determine new KYC status based on validation
    let newKycStatus = order.kycStatus;
    let newOrderStatus = order.orderStatus;

    // Increment attempts
    const newAttempts = order.kycAttempts + 1;

    // Determine status based on validation results
    const statusResult = determineKycStatus(validationResult, order.kycAttempts);
    newKycStatus = statusResult.status;

    // Set order status based on KYC status
    if (newKycStatus === 'auto_approved') {
      newOrderStatus = "processing";
    } else if (newKycStatus === 'under_review') {
      newOrderStatus = "processing"; // Still processing but needs review
    } else {
      // For retry statuses, keep the order in paid status until resolved
      newOrderStatus = order.orderStatus; // Preserve current status
    }

    // Get current order status before update
    const currentOrder = await db
      .select({
        orderStatus: orders.orderStatus,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const oldStatus = currentOrder[0]?.orderStatus || 'pending';

    // Update order
    await db
      .update(orders)
      .set({
        kycStatus: newKycStatus,
        kycAttempts: newAttempts,
        orderStatus: newOrderStatus,
        passportUrl: uploadResult.secure_url,
        passportPublicId: uploadResult.public_id,
        imeiNumber: imei, // Save IMEI to order
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Create KYC document record
    await db.insert(kycDocuments).values({
      orderId,
      passportPublicId: uploadResult.public_id,
      verificationStatus: newKycStatus,
    });

    // Trigger workflow if status changed
    if (oldStatus !== newOrderStatus) {
      import('@/lib/workflows').then(workflows => {
        workflows.processOrderStatusUpdate(orderId, newOrderStatus, oldStatus).catch(console.error);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        kycStatus: newKycStatus,
        kycAttempts: newAttempts,
        message:
          newKycStatus === "auto_approved"
            ? "Document uploaded and approved successfully!"
            : newKycStatus === "under_review"
            ? "Document uploaded and sent for manual review. You'll receive an update soon."
            : `Document uploaded. Attempt ${newAttempts} of 3. ${validationResult.issues.join(', ')}`,
      },
    });
  } catch (error) {
    console.error("Error uploading KYC document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    );
  }
}