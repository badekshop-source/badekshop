// src/lib/email.ts
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface OrderConfirmationEmailProps {
  to: string;
  orderNumber: string;
  productName: string;
  token: string;
  orderId: string;
}

interface KycApprovedEmailProps {
  to: string;
  orderNumber: string;
  productName: string;
  qrCodeUrl: string;
  activationOutlet: string;
  token: string;
  orderId: string;
}

interface PickupReminderEmailProps {
  to: string;
  orderNumber: string;
  productName: string;
  arrivalDate: Date;
  flightNumber: string;
  activationOutlet: string;
}

interface FollowUpEmailProps {
  to: string;
  orderNumber: string;
  productName: string;
  reviewLink: string;
}

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  productName,
  token,
  orderId
}: OrderConfirmationEmailProps): Promise<boolean> {
  try {
    // Check if Resend is initialized
    if (!resend) {
      console.warn('Resend is not initialized. Skipping email send.');
      return false;
    }

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}?token=${token}`;
    
    await resend.emails.send({
      from: 'badekshop@resend.dev', // Replace with your domain
      to: [to],
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af; text-align: center;">Order Confirmation</h1>
          <p>Hello,</p>
          <p>Your order <strong>${orderNumber}</strong> for <strong>${productName}</strong> has been received and is being processed.</p>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Next Steps:</h2>
            <ol>
              <li>Complete your identity verification (KYC) at the link below</li>
              <li>Upload your passport and IMEI number</li>
              <li>Receive your activation QR code</li>
              <li>Pick up at Ngurah Rai Airport</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete KYC Verification
            </a>
          </div>
          
          <p>You can also track your order status at any time using the link above.</p>
          
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #64748b;">
            Having trouble? Contact us at support@badekshop.com<br>
            badekshop - Your trusted eSIM provider in Bali
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

export async function sendKycApprovedEmail({
  to,
  orderNumber,
  productName,
  qrCodeUrl,
  activationOutlet,
  token,
  orderId
}: KycApprovedEmailProps): Promise<boolean> {
  try {
    // Check if Resend is initialized
    if (!resend) {
      console.warn('Resend is not initialized. Skipping email send.');
      return false;
    }

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}?token=${token}`;
    
    await resend.emails.send({
      from: 'badekshop@resend.dev', // Replace with your domain
      to: [to],
      subject: `KYC Approved - Your QR Code for ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981; text-align: center;">KYC Approved!</h1>
          <p>Hello,</p>
          <p>Your identity verification for order <strong>${orderNumber}</strong> has been approved.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #d1d5db; padding: 10px;">
          </div>
          
          <p style="text-align: center; font-weight: bold; font-size: 18px;">${orderNumber}</p>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Pickup Instructions:</h2>
            <ul>
              <li><strong>Location:</strong> ${activationOutlet}</li>
              <li><strong>Process:</strong> Show this email and QR code to staff</li>
              <li><strong>Required:</strong> Original passport for verification</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>
          
          <p>We look forward to serving you at ${activationOutlet}!</p>
          
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #64748b;">
            Having trouble? Contact us at support@badekshop.com<br>
            badekshop - Your trusted eSIM provider in Bali
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending KYC approved email:', error);
    return false;
  }
}

export async function sendPickupReminderEmail({
  to,
  orderNumber,
  productName,
  arrivalDate,
  flightNumber,
  activationOutlet
}: PickupReminderEmailProps): Promise<boolean> {
  try {
    // Check if Resend is initialized
    if (!resend) {
      console.warn('Resend is not initialized. Skipping email send.');
      return false;
    }

    await resend.emails.send({
      from: 'badekshop@resend.dev', // Replace with your domain
      to: [to],
      subject: `Reminder: Pickup Today - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b; text-align: center;">Pickup Reminder</h1>
          <p>Hello,</p>
          <p>This is a reminder that your <strong>${productName}</strong> order (<strong>${orderNumber}</strong>) is ready for pickup today.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h2 style="margin-top: 0;">Pickup Details:</h2>
            <ul>
              <li><strong>Flight:</strong> ${flightNumber}</li>
              <li><strong>Date:</strong> ${arrivalDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
              <li><strong>Location:</strong> ${activationOutlet}</li>
            </ul>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h2 style="margin-top: 0;">What to Bring:</h2>
            <ul>
              <li>Original passport</li>
              <li>Printed or digital copy of this email</li>
              <li>Know your order number: ${orderNumber}</li>
            </ul>
          </div>
          
          <p>Please visit us at ${activationOutlet} upon arrival to collect your SIM card.</p>
          
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #64748b;">
            Having trouble? Contact us at support@badekshop.com<br>
            badekshop - Your trusted eSIM provider in Bali
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending pickup reminder email:', error);
    return false;
  }
}

export async function sendFollowUpEmail({
  to,
  orderNumber,
  productName,
  reviewLink
}: FollowUpEmailProps): Promise<boolean> {
  try {
    // Check if Resend is initialized
    if (!resend) {
      console.warn('Resend is not initialized. Skipping email send.');
      return false;
    }

    await resend.emails.send({
      from: 'badekshop@resend.dev', // Replace with your domain
      to: [to],
      subject: `How was your experience with ${productName}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6; text-align: center;">We Value Your Feedback</h1>
          <p>Hello,</p>
          <p>Thank you for choosing badekshop for your connectivity needs in Bali. We hope your <strong>${productName}</strong> has served you well during your stay.</p>
          
          <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 15px 0;">Would you mind sharing your experience with us?</p>
            <a href="${reviewLink}" 
               style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Leave a Review
            </a>
          </div>
          
          <p>Your feedback helps us improve our service and assist future travelers in Bali. It only takes a minute!</p>
          
          <p>Order: ${orderNumber}</p>
          
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #64748b;">
            Having trouble? Contact us at support@badekshop.com<br>
            badekshop - Your trusted eSIM provider in Bali
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    return false;
  }
}