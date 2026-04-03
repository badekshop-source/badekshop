// tests/database/orders.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { orders, products, profiles, reviews, kycDocuments, adminLogs, refundPolicies } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { generateOrderToken } from '@/lib/token';
import { cleanupAllTables } from '../setup';

describe('Orders Database Tests', () => {
  beforeEach(async () => {
    // Clear test data before each test using centralized cleanup
    await cleanupAllTables();
  });

  afterEach(async () => {
    // Clean up after each test using centralized cleanup
    await cleanupAllTables();
  });

  it('should create a new order with all required fields', async () => {
    const uniqueId = Date.now();
    
    // Create a test product first
    const [testProduct] = await db
      .insert(products)
      .values({
        name: 'Bali eSIM 7 Days',
        description: '7 days unlimited data',
        category: 'esim',
        duration: 7,
        price: 150000, // 150,000 IDR in cents
        isActive: true,
      })
      .returning();

    // Create a test profile
    const [testProfile] = await db
      .insert(profiles)
      .values({
        email: `test-${uniqueId}@example.com`,
        name: 'Test User',
        role: 'customer',
      })
      .returning();

    // Generate a unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;

    // Create an order
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: testProfile.id,
        fullName: 'Test Customer',
        customerEmail,
        customerPhone: '+6281234567890',
        nationality: 'US',
        arrivalDate: new Date(Date.now() + 86400000), // Tomorrow
        flightNumber: 'GA123',
        productId: testProduct.id,
        subtotal: 150000,
        total: 150000,
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Verify the order was created with all expected values
    expect(newOrder).toBeDefined();
    expect(newOrder.orderNumber).toBe(orderNumber);
    expect(newOrder.fullName).toBe('Test Customer');
    expect(newOrder.customerEmail).toBe(customerEmail);
    expect(newOrder.customerPhone).toBe('+6281234567890');
    expect(newOrder.nationality).toBe('US');
    expect(newOrder.flightNumber).toBe('GA123');
    expect(newOrder.productId).toBe(testProduct.id);
    expect(newOrder.subtotal).toBe(150000);
    expect(newOrder.total).toBe(150000);
    expect(newOrder.accessToken).toBeDefined();
    expect(newOrder.activationOutlet).toBe('Ngurah Rai Airport');
    
    // Verify default values
    expect(newOrder.orderStatus).toBe('pending');
    expect(newOrder.kycStatus).toBe('pending');
    expect(newOrder.kycAttempts).toBe(0);
    expect(newOrder.paymentStatus).toBe('pending');
    expect(newOrder.quantity).toBe(1);
  });

  it('should update order status correctly', async () => {
    const uniqueId = Date.now();
    
    // Create a test product first
    const [testProduct] = await db
      .insert(products)
      .values({
        name: 'Bali eSIM 3 Days',
        description: '3 days unlimited data',
        category: 'esim',
        duration: 3,
        price: 100000,
        isActive: true,
      })
      .returning();

    // Create an order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [initialOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Test Customer',
        customerEmail,
        customerPhone: '+6281234567890',
        nationality: 'US',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'GA123',
        productId: testProduct.id,
        subtotal: 100000,
        total: 100000,
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Update the order status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        orderStatus: 'paid',
        paymentStatus: 'paid',
        paymentGatewayId: 'midtrans-12345',
        paymentMethod: 'visa',
      })
      .where(eq(orders.id, initialOrder.id))
      .returning();

    // Verify the update worked
    expect(updatedOrder.orderStatus).toBe('paid');
    expect(updatedOrder.paymentStatus).toBe('paid');
    expect(updatedOrder.paymentGatewayId).toBe('midtrans-12345');
    expect(updatedOrder.paymentMethod).toBe('visa');
  });

  it('should handle IMEI number in orders', async () => {
    const uniqueId = Date.now();
    
    // Create a test product
    const [testProduct] = await db
      .insert(products)
      .values({
        name: 'Physical SIM Card',
        description: 'Standard SIM card',
        category: 'sim_card',
        price: 50000,
        isActive: true,
      })
      .returning();

    // Create an order with IMEI
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [orderWithImei] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Test Customer',
        customerEmail,
        customerPhone: '+6281234567890',
        nationality: 'US',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'GA123',
        productId: testProduct.id,
        subtotal: 50000,
        total: 50000,
        imeiNumber: '123456789012345', // 15-digit IMEI
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Verify the IMEI was saved
    expect(orderWithImei.imeiNumber).toBe('123456789012345');
  });

  it('should retrieve orders with related product and profile data', async () => {
    const uniqueId = Date.now();
    
    // Create test data
    const [testProduct] = await db
      .insert(products)
      .values({
        name: 'Bali eSIM 5 Days',
        description: '5 days unlimited data',
        category: 'esim',
        duration: 5,
        price: 120000,
        isActive: true,
      })
      .returning();

    const [testProfile] = await db
      .insert(profiles)
      .values({
        email: `test-${uniqueId}@example.com`,
        name: 'Test User',
        role: 'customer',
      })
      .returning();

    // Create an order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    await db
      .insert(orders)
      .values({
        orderNumber,
        userId: testProfile.id,
        fullName: 'Test Customer',
        customerEmail,
        customerPhone: '+6281234567890',
        nationality: 'US',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'GA123',
        productId: testProduct.id,
        subtotal: 120000,
        total: 120000,
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      });

    // Query the order with related data
    const orderWithRelations = await db
      .select({
        order: orders,
        product: products,
        profile: profiles,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(profiles, eq(orders.userId, profiles.id))
      .where(eq(orders.orderNumber, orderNumber))
      .execute();

    // Verify the join worked
    expect(orderWithRelations).toHaveLength(1);
    expect(orderWithRelations[0].order.orderNumber).toBe(orderNumber);
    expect(orderWithRelations[0].product?.name).toBe('Bali eSIM 5 Days');
    expect(orderWithRelations[0].profile?.name).toBe('Test User');
  });
});