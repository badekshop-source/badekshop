// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import { generateOrderToken, getTokenExpiryDate } from '@/lib/token';

// Zod schema for order validation
const orderSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(1, 'Phone number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  arrivalDate: z.string().min(1, 'Arrival date is required'),
  flightNumber: z.string().min(1, 'Flight number is required'),
  productId: z.string().uuid('Valid product ID is required'),
  quantity: z.number().positive('Quantity must be positive').default(1),
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
  total: z.number().nonnegative('Total must be non-negative'),
  paymentMethod: z.enum(['visa', 'mastercard', 'jcb', 'amex', 'unionpay']).optional(),
  orderStatus: z.enum(['pending', 'paid', 'processing', 'approved', 'rejected', 'expired', 'cancelled', 'completed']).default('pending'),
  kycStatus: z.enum(['pending', 'auto_approved', 'retry_1', 'retry_2', 'under_review', 'approved', 'rejected']).default('pending'),
  passportPublicId: z.string().optional(),
  passportUrl: z.string().url().optional(),
});

export async function GET() {
  if (!db) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database not connected' 
      }, 
      { status: 500 }
    );
  }
  
  try {
    const ordersList = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    
    return NextResponse.json({ 
      success: true, 
      orders: ordersList 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database not connected' 
      }, 
      { status: 500 }
    );
  }
  
  try {
    const data = await request.json();
    
    // Validate with Zod
    const validatedData = orderSchema.parse(data);

    // Calculate payment expiration time (2 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Insert order first without token to get the ID
    const [tempOrder] = await db
      .insert(orders)
      .values({
        ...validatedData,
        orderNumber,
        expiresAt,
        accessToken: '', // Will be updated
        tokenExpiresAt: getTokenExpiryDate(),
      })
      .returning();

    // Generate JWT token for order access
    const accessToken = generateOrderToken(
      tempOrder.id,
      validatedData.customerEmail,
      orderNumber
    );

    // Update order with the generated token
    const [newOrder] = await db
      .update(orders)
      .set({
        accessToken,
      })
      .where(eq(orders.id, tempOrder.id))
      .returning();

    // Trigger order confirmation workflow
    import('@/lib/workflows').then(workflows => {
      workflows.sendOrderConfirmation(newOrder.id).catch(console.error);
    });

    return NextResponse.json({ 
      success: true, 
      order: newOrder 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.issues 
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order' 
      }, 
      { status: 500 }
    );
  }
}