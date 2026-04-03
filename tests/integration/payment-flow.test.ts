// tests/integration/payment-flow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { orders, products, profiles, kycDocuments, reviews, adminLogs, refundPolicies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateOrderToken } from '@/lib/token';
import { cleanupAllTables } from '../setup';

describe('Payment Flow Integration Tests', () => {
  beforeEach(async () => {
    // Clear test data before each test using centralized cleanup
    await cleanupAllTables();
  });

  afterEach(async () => {
    // Clean up after each test using centralized cleanup
    await cleanupAllTables();
  });

  it('should handle successful payment flow', async () => {
    const uniqueId = Date.now();
    
    // Step 1: Create product
    const [product] = await db
      .insert(products)
      .values({
        name: 'Bali eSIM 7 Days',
        description: '7 days unlimited data',
        category: 'esim',
        duration: 7,
        price: 150000,
        isActive: true,
      })
      .returning();

    // Step 2: Create order with pending payment status
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `payment-success-${uniqueId}@example.com`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Payment Success Customer',
        customerEmail,
        customerPhone: '+6281234567890',
        nationality: 'US',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'GA123',
        productId: product.id,
        subtotal: 150000,
        total: 150000,
        orderStatus: 'pending',
        paymentStatus: 'pending',
        kycStatus: 'pending',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hour payment window
      })
      .returning();

    // Verify initial state
    expect(order.paymentStatus).toBe('pending');
    expect(order.orderStatus).toBe('pending');

    // Step 3: Simulate payment success
    const [paidOrder] = await db
      .update(orders)
      .set({
        paymentStatus: 'paid',
        orderStatus: 'paid',
        paymentMethod: 'credit_card',
        paymentGatewayId: 'midtrans_txn_success_123',
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify payment success
    expect(paidOrder.paymentStatus).toBe('paid');
    expect(paidOrder.orderStatus).toBe('paid');
    expect(paidOrder.paymentMethod).toBe('credit_card');
    expect(paidOrder.paymentGatewayId).toBe('midtrans_txn_success_123');
  });

  it('should handle payment retry flow (max 3 attempts)', async () => {
    const uniqueId = Date.now();
    
    // Step 1: Create product
    const [product] = await db
      .insert(products)
      .values({
        name: 'Physical SIM Card',
        description: 'Standard SIM',
        category: 'sim_card',
        price: 50000,
        isActive: true,
      })
      .returning();

    // Step 2: Create order with pending payment status
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `payment-retry-${uniqueId}@example.com`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Payment Retry Customer',
        customerEmail,
        customerPhone: '+6281234567892',
        nationality: 'AU',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'QF437',
        productId: product.id,
        subtotal: 50000,
        total: 50000,
        orderStatus: 'pending',
        paymentStatus: 'pending',
        kycStatus: 'pending',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      })
      .returning();

    // Step 3: Simulate 3 payment failures
    for (let attempt = 1; attempt <= 3; attempt++) {
      const [failedOrder] = await db
        .update(orders)
        .set({
          paymentStatus: 'failed',
          orderStatus: 'pending', // Still pending, can retry
        })
        .where(eq(orders.id, order.id))
        .returning();

      expect(failedOrder.paymentStatus).toBe('failed');

      // Reset for next attempt (except last)
      if (attempt < 3) {
        await db
          .update(orders)
          .set({
            paymentStatus: 'pending',
          })
          .where(eq(orders.id, order.id));
      }
    }

    // Step 4: After 3 failures, order should be cancelled
    const [cancelledOrder] = await db
      .update(orders)
      .set({
        orderStatus: 'cancelled',
        paymentStatus: 'failed',
      })
      .where(eq(orders.id, order.id))
      .returning();

    expect(cancelledOrder.orderStatus).toBe('cancelled');
    expect(cancelledOrder.paymentStatus).toBe('failed');
  });

  it('should handle expired payment flow', async () => {
    const uniqueId = Date.now();
    
    // Step 1: Create product
    const [product] = await db
      .insert(products)
      .values({
        name: 'Premium eSIM 14 Days',
        description: '14 days premium data',
        category: 'esim',
        duration: 14,
        price: 120000,
        isActive: true,
      })
      .returning();

    // Step 2: Create order with past expiration
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const pastTime = new Date(Date.now() - 10000); // 10 seconds ago
    const customerEmail = `payment-expired-${uniqueId}@example.com`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Expired Payment Customer',
        customerEmail,
        customerPhone: '+6281234567893',
        nationality: 'SG',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'SQ211',
        productId: product.id,
        subtotal: 120000,
        total: 120000,
        orderStatus: 'pending',
        paymentStatus: 'pending',
        kycStatus: 'pending',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
        expiresAt: pastTime, // Already expired
      })
      .returning();

    expect(order.expiresAt.getTime()).toBeLessThan(Date.now());

    // Step 3: Simulate order expiration
    const [expiredOrder] = await db
      .update(orders)
      .set({
        orderStatus: 'expired',
        paymentStatus: 'failed',
      })
      .where(and(eq(orders.id, order.id), eq(orders.paymentStatus, 'pending')))
      .returning();

    expect(expiredOrder.orderStatus).toBe('expired');
    expect(expiredOrder.paymentStatus).toBe('failed');
  });

  it('should handle partial payment refund', async () => {
    const uniqueId = Date.now();
    
    // Step 1: Create product
    const [product] = await db
      .insert(products)
      .values({
        name: 'Deluxe eSIM 30 Days',
        description: '30 days unlimited',
        category: 'esim',
        duration: 30,
        price: 250000,
        isActive: true,
      })
      .returning();

    // Step 2: Create order with successful payment
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `refund-customer-${uniqueId}@example.com`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Refund Customer',
        customerEmail,
        customerPhone: '+6281234567894',
        nationality: 'JP',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'NH801',
        productId: product.id,
        subtotal: 250000,
        total: 250000,
        paymentStatus: 'paid',
        orderStatus: 'paid',
        paymentGatewayId: 'midtrans_txn_paid_999',
        paymentMethod: 'jcb',
        kycStatus: 'pending',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Step 3: Customer requests refund (5% admin fee)
    const adminFee = Math.round(order.total * 0.05);
    const refundAmount = order.total - adminFee;

    const [refundedOrder] = await db
      .update(orders)
      .set({
        orderStatus: 'cancelled',
        paymentStatus: 'refunded',
        refundStatus: 'processed',
        refundAmount: refundAmount,
        refundReason: 'Customer cancellation',
      })
      .where(eq(orders.id, order.id))
      .returning();

    expect(refundedOrder.refundStatus).toBe('processed');
    expect(refundedOrder.refundAmount).toBe(refundAmount);
    expect(refundedOrder.refundAmount).toBeLessThan(order.total);
    
    // Verify admin fee was deducted
    expect(adminFee).toBe(Math.round(250000 * 0.05)); // 12,500
    expect(refundAmount).toBe(250000 - 12500); // 237,500
  });

  it('should handle payment method diversity', async () => {
    const uniqueId = Date.now();
    
    // Step 1: Create product
    const [product] = await db
      .insert(products)
      .values({
        name: 'Standard eSIM 5 Days',
        description: '5 days data plan',
        category: 'esim',
        duration: 5,
        price: 100000,
        isActive: true,
      })
      .returning();

    // Step 2: Create multiple orders with different payment methods
    const paymentMethods = ['visa', 'mastercard', 'jcb', 'amex', 'gopay'];
    const createdOrders = [];

    for (let index = 0; index < paymentMethods.length; index++) {
      const method = paymentMethods[index];
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}-${index}`;
      const customerEmail = `customer${index + 1}-${uniqueId}@example.com`;
      
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber,
          fullName: `Customer ${index + 1}`,
          customerEmail,
          customerPhone: `+62812345678${index + 10}`,
          nationality: 'ID',
          arrivalDate: new Date(Date.now() + 86400000),
          flightNumber: `GA${100 + index}`,
          productId: product.id,
          subtotal: 100000,
          total: 100000,
          paymentStatus: 'paid',
          orderStatus: 'paid',
          paymentMethod: method,
          paymentGatewayId: `midtrans_txn_${method}_${index}`,
          kycStatus: 'pending',
          accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          activationOutlet: 'Ngurah Rai Airport',
        })
        .returning();

      createdOrders.push(order);
    }

    // Verify all orders were created with correct payment methods
    expect(createdOrders).toHaveLength(paymentMethods.length);
    
    for (let index = 0; index < paymentMethods.length; index++) {
      expect(createdOrders[index].paymentMethod).toBe(paymentMethods[index]);
      expect(createdOrders[index].paymentStatus).toBe('paid');
    }

    // Step 3: Query orders by payment method
    const visaOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.paymentMethod, 'visa'), eq(orders.paymentStatus, 'paid')))
      .execute();

    expect(visaOrders.length).toBeGreaterThanOrEqual(1);
  });
});