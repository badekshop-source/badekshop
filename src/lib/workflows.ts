// src/lib/workflows.ts
import { db } from '@/lib/db';
import { orders, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendOrderConfirmationEmail, sendKycApprovedEmail, sendPickupReminderEmail, sendFollowUpEmail } from '@/lib/email';
import { generateOrderToken } from '@/lib/token';

// Send order confirmation email after order creation
export async function sendOrderConfirmation(orderId: string): Promise<boolean> {
  try {
    const orderResult = await db
      .select({
        order: orders,
        product: products,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      console.error(`Order ${orderId} not found for confirmation email`);
      return false;
    }

    const { order, product } = orderResult[0];

    // Generate a token for this order
    const token = generateOrderToken(order.id, order.customerEmail, order.orderNumber);

    const emailSent = await sendOrderConfirmationEmail({
      to: order.customerEmail,
      orderNumber: order.orderNumber,
      productName: product?.name || 'Product',
      token,
      orderId: order.id
    });

    return emailSent;
  } catch (error) {
    console.error('Error in sendOrderConfirmation workflow:', error);
    return false;
  }
}

// Send KYC approved email after verification
export async function sendKycApprovedNotification(orderId: string): Promise<boolean> {
  try {
    const orderResult = await db
      .select({
        order: orders,
        product: products,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      console.error(`Order ${orderId} not found for KYC approved email`);
      return false;
    }

    const { order, product } = orderResult[0];

    // Generate QR code URL for the order
    const qrCodeData = `badekshop:${order.orderNumber}:${order.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`;

    // Generate a token for this order
    const token = generateOrderToken(order.id, order.customerEmail, order.orderNumber);

    const emailSent = await sendKycApprovedEmail({
      to: order.customerEmail,
      orderNumber: order.orderNumber,
      productName: product?.name || 'Product',
      qrCodeUrl,
      activationOutlet: order.activationOutlet,
      token,
      orderId: order.id
    });

    return emailSent;
  } catch (error) {
    console.error('Error in sendKycApprovedNotification workflow:', error);
    return false;
  }
}

// Send pickup reminder 24 hours before arrival
export async function schedulePickupReminder(orderId: string): Promise<NodeJS.Timeout | null> {
  try {
    const orderResult = await db
      .select({
        order: orders,
        product: products,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      console.error(`Order ${orderId} not found for pickup reminder`);
      return null;
    }

    const { order, product } = orderResult[0];

    // Calculate time difference between now and arrival date
    const arrivalTime = new Date(order.arrivalDate).getTime();
    const currentTime = Date.now();
    const timeUntilArrival = arrivalTime - currentTime;

    // Schedule email to be sent 24 hours before arrival (if arrival is in the future)
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const scheduledTime = timeUntilArrival - twentyFourHours;

    if (scheduledTime > 0) {
      // Set timeout to send the email
      const timeoutId = setTimeout(async () => {
        try {
          await sendPickupReminderEmail({
            to: order.customerEmail,
            orderNumber: order.orderNumber,
            productName: product?.name || 'Product',
            arrivalDate: order.arrivalDate,
            flightNumber: order.flightNumber,
            activationOutlet: order.activationOutlet,
          });
          console.log(`Pickup reminder email sent for order ${order.id}`);
        } catch (error) {
          console.error(`Error sending pickup reminder for order ${order.id}:`, error);
        }
      }, scheduledTime);

      return timeoutId;
    } else {
      // Arrival date is in the past or less than 24 hours away, send immediately
      await sendPickupReminderEmail({
        to: order.customerEmail,
        orderNumber: order.orderNumber,
        productName: product?.name || 'Product',
        arrivalDate: order.arrivalDate,
        flightNumber: order.flightNumber,
        activationOutlet: order.activationOutlet,
      });
      console.log(`Pickup reminder email sent immediately for order ${order.id}`);
      return null;
    }
  } catch (error) {
    console.error('Error scheduling pickup reminder:', error);
    return null;
  }
}

// Send follow-up email after order completion
export async function scheduleFollowUpEmail(orderId: string): Promise<NodeJS.Timeout | null> {
  try {
    const orderResult = await db
      .select({
        order: orders,
        product: products,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      console.error(`Order ${orderId} not found for follow-up email`);
      return null;
    }

    const { order, product } = orderResult[0];

    // Generate a token for review access
    const token = generateOrderToken(order.id, order.customerEmail, order.orderNumber);
    const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}/review?token=${token}`;

    // Schedule email to be sent 3 days after completion
    const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    const timeoutId = setTimeout(async () => {
      try {
        await sendFollowUpEmail({
          to: order.customerEmail,
          orderNumber: order.orderNumber,
          productName: product?.name || 'Product',
          reviewLink,
        });
        console.log(`Follow-up email sent for order ${order.id}`);
      } catch (error) {
        console.error(`Error sending follow-up email for order ${order.id}:`, error);
      }
    }, threeDays);

    return timeoutId;
  } catch (error) {
    console.error('Error scheduling follow-up email:', error);
    return null;
  }
}

// Process order status updates to trigger appropriate emails
export async function processOrderStatusUpdate(orderId: string, newStatus: string, oldStatus: string): Promise<void> {
  try {
    // Send order confirmation when status changes to 'paid' (payment successful)
    if (newStatus === 'paid' && oldStatus !== 'paid') {
      await sendOrderConfirmation(orderId);
    }
    
    // Send KYC approved email when status changes to 'approved' or 'auto_approved'
    if ((newStatus === 'approved' || newStatus === 'auto_approved') && oldStatus !== 'approved' && oldStatus !== 'auto_approved') {
      // Update order with QR code data
      const qrCodeData = `badekshop:${orderId}`;
      
      await db.update(orders)
        .set({
          qrCodeData,
          orderStatus: newStatus === 'auto_approved' ? 'processing' : 'completed',
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));
      
      await sendKycApprovedNotification(orderId);
    }
    
    // Handle under_review status - notify admin for manual review
    if (newStatus === 'under_review' && oldStatus !== 'under_review') {
      console.log(`Order ${orderId} requires manual KYC review`);
    }
    
    // Schedule pickup reminder when status changes to 'approved' or 'auto_approved'
    if ((newStatus === 'approved' || newStatus === 'auto_approved') && oldStatus !== 'approved' && oldStatus !== 'auto_approved') {
      await schedulePickupReminder(orderId);
    }
    
    // Schedule follow-up email when order is completed
    if (newStatus === 'completed' && oldStatus !== 'completed') {
      await scheduleFollowUpEmail(orderId);
    }
  } catch (error) {
    console.error('Error processing order status update:', error);
  }
}