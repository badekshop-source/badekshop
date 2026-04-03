// tests/integration/user-flow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { orders, products, profiles, kycDocuments, reviews, adminLogs, refundPolicies } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { generateOrderToken } from '@/lib/token';
import { cleanupAllTables } from '../setup';

describe('Complete User Flow Integration Tests', () => {
  beforeEach(async () => {
    // Clear test data before each test using centralized cleanup
    await cleanupAllTables();
  });

  afterEach(async () => {
    // Clean up after each test using centralized cleanup
    await cleanupAllTables();
  });

  it('should handle complete flow: order → payment → kyc → approval → qr code → review', async () => {
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

    // Step 2: Create order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `john-${uniqueId}@example.com`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'John Doe',
        customerEmail,
        customerPhone: '+6281234567890',
        nationality: 'US',
        arrivalDate: new Date(Date.now() + 86400000), // Tomorrow
        flightNumber: 'GA123',
        productId: product.id,
        subtotal: 150000,
        total: 150000,
        orderStatus: 'paid', // Simulate successful payment
        paymentStatus: 'paid',
        paymentGatewayId: 'midtrans_txn_123',
        paymentMethod: 'visa',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Verify order creation
    expect(order.orderNumber).toBe(orderNumber);
    expect(order.orderStatus).toBe('paid');
    expect(order.paymentStatus).toBe('paid');
    expect(order.paymentGatewayId).toBe('midtrans_txn_123');

    // Step 3: Simulate KYC upload (passport + IMEI)
    const [kycDoc] = await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_john_doe_123',
        documentType: 'passport',
        verificationStatus: 'auto_approved', // Clear photo detected
      })
      .returning();

    // Update order with KYC info
    const [updatedOrderAfterKyc] = await db
      .update(orders)
      .set({
        kycStatus: 'auto_approved',
        orderStatus: 'processing',
        passportPublicId: 'passport_john_doe_123',
        passportUrl: 'https://res.cloudinary.com/demo/image/upload/passport_john_doe_123.jpg',
        imeiNumber: '123456789012345', // 15-digit IMEI
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify KYC update
    expect(updatedOrderAfterKyc.kycStatus).toBe('auto_approved');
    expect(updatedOrderAfterKyc.orderStatus).toBe('processing');
    expect(updatedOrderAfterKyc.passportPublicId).toBe('passport_john_doe_123');
    expect(updatedOrderAfterKyc.imeiNumber).toBe('123456789012345');

    // Step 4: Generate QR code (simulating approval process)
    const [orderWithQr] = await db
      .update(orders)
      .set({
        orderStatus: 'approved', // KYC approved
        kycStatus: 'approved',
        qrCodeData: `badekshop:${orderNumber}:${order.id}`, // QR code contains order info
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify QR code generation
    expect(orderWithQr.orderStatus).toBe('approved');
    expect(orderWithQr.kycStatus).toBe('approved');
    expect(orderWithQr.qrCodeData).toContain('badekshop:');
    expect(orderWithQr.qrCodeData).toContain(orderNumber);

    // Step 5: Customer completes order (arrives, picks up, becomes completed)
    const [completedOrder] = await db
      .update(orders)
      .set({
        orderStatus: 'completed',
        kycStatus: 'approved',
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify completion
    expect(completedOrder.orderStatus).toBe('completed');
    expect(completedOrder.kycStatus).toBe('approved');

    // Step 6: Customer submits review
    const [review] = await db
      .insert(reviews)
      .values({
        orderId: order.id,
        userName: 'John Doe',
        userEmail: customerEmail,
        country: 'United States',
        rating: 5,
        tripType: 'leisure',
        tripDuration: '8-14',
        reviewText: 'Excellent service! The eSIM worked perfectly throughout my stay in Bali.',
        isApproved: true, // Auto-approved for 5-star rating
      })
      .returning();

    // Verify review creation
    expect(review.userName).toBe('John Doe');
    expect(review.rating).toBe(5);
    expect(review.isApproved).toBe(true);
    expect(review.reviewText).toContain('service');

    // Step 7: Validate complete flow by querying all related data
    const completeFlowData = await db
      .select({
        order: orders,
        product: products,
        kyc: kycDocuments,
        review: reviews,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(kycDocuments, eq(orders.id, kycDocuments.orderId))
      .leftJoin(reviews, eq(orders.id, reviews.orderId))
      .where(eq(orders.id, order.id))
      .execute();

    // Verify entire flow is connected
    expect(completeFlowData).toHaveLength(1);
    expect(completeFlowData[0].order.orderNumber).toBe(orderNumber);
    expect(completeFlowData[0].product?.name).toBe('Bali eSIM 7 Days');
    expect(completeFlowData[0].kyc?.passportPublicId).toBe('passport_john_doe_123');
    expect(completeFlowData[0].review?.rating).toBe(5);
  });

  it('should handle KYC retry scenario', async () => {
    const uniqueId = Date.now();
    
    // Step 1: Create product
    const [product] = await db
      .insert(products)
      .values({
        name: 'Physical SIM Card',
        description: 'Standard SIM card',
        category: 'sim_card',
        price: 50000,
        isActive: true,
      })
      .returning();

    // Step 2: Create order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `sarah-${uniqueId}@example.com`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Sarah Johnson',
        customerEmail,
        customerPhone: '+6281234567891',
        nationality: 'CA',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'AC001',
        productId: product.id,
        subtotal: 50000,
        total: 50000,
        orderStatus: 'paid',
        paymentStatus: 'paid',
        paymentGatewayId: 'midtrans_txn_456',
        paymentMethod: 'mastercard',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Step 3: First KYC attempt (blurry image)
    const [kycAttempt1] = await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_sarah_1',
        documentType: 'passport',
        verificationStatus: 'retry_1', // First retry
        verificationNotes: 'Blurry image, please retake',
      })
      .returning();

    // Update order to reflect first attempt
    await db
      .update(orders)
      .set({
        kycStatus: 'retry_1',
        kycAttempts: 1,
      })
      .where(eq(orders.id, order.id));

    // Verify first attempt
    const orderAfterAttempt1 = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order.id));
    expect(orderAfterAttempt1[0].kycStatus).toBe('retry_1');
    expect(orderAfterAttempt1[0].kycAttempts).toBe(1);

    // Step 4: Second KYC attempt (still blurry)
    const [kycAttempt2] = await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_sarah_2',
        documentType: 'passport',
        verificationStatus: 'retry_2', // Second retry
        verificationNotes: 'Image still unclear, please try again',
      })
      .returning();

    // Update order to reflect second attempt
    await db
      .update(orders)
      .set({
        kycStatus: 'retry_2',
        kycAttempts: 2,
      })
      .where(eq(orders.id, order.id));

    // Verify second attempt
    const orderAfterAttempt2 = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order.id));
    expect(orderAfterAttempt2[0].kycStatus).toBe('retry_2');
    expect(orderAfterAttempt2[0].kycAttempts).toBe(2);

    // Step 5: Third KYC attempt (clear image)
    const [kycAttempt3] = await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_sarah_3',
        documentType: 'passport',
        verificationStatus: 'auto_approved', // Third attempt worked
        verificationNotes: 'Clear image, auto-approved',
      })
      .returning();

    // Update order to reflect successful third attempt
    const [successfulOrder] = await db
      .update(orders)
      .set({
        kycStatus: 'auto_approved',
        orderStatus: 'processing',
        kycAttempts: 3,
        passportPublicId: 'passport_sarah_3',
        passportUrl: 'https://res.cloudinary.com/demo/image/upload/passport_sarah_3.jpg',
        imeiNumber: '543210987654321', // 15-digit IMEI
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify final state after successful KYC
    expect(successfulOrder.kycStatus).toBe('auto_approved');
    expect(successfulOrder.orderStatus).toBe('processing');
    expect(successfulOrder.kycAttempts).toBe(3);
    expect(successfulOrder.imeiNumber).toBe('543210987654321');
  });

  it('should handle KYC rejection after 3 attempts', async () => {
    const uniqueId = Date.now();
    
    // Step 1: Create product
    const [product] = await db
      .insert(products)
      .values({
        name: 'Premium eSIM 14 Days',
        description: '14 days premium data',
        category: 'esim',
        duration: 14,
        price: 250000,
        isActive: true,
      })
      .returning();

    // Step 2: Create order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `mike-${uniqueId}@example.com`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Mike Wilson',
        customerEmail,
        customerPhone: '+6281234567892',
        nationality: 'AU',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'QF437',
        productId: product.id,
        subtotal: 250000,
        total: 250000,
        orderStatus: 'paid',
        paymentStatus: 'paid',
        paymentGatewayId: 'midtrans_txn_789',
        paymentMethod: 'amex',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Step 3: Three failed KYC attempts
    await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_mike_1',
        documentType: 'passport',
        verificationStatus: 'retry_1',
      });

    await db
      .update(orders)
      .set({
        kycStatus: 'retry_1',
        kycAttempts: 1,
      })
      .where(eq(orders.id, order.id));

    await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_mike_2',
        documentType: 'passport',
        verificationStatus: 'retry_2',
      });

    await db
      .update(orders)
      .set({
        kycStatus: 'retry_2',
        kycAttempts: 2,
      })
      .where(eq(orders.id, order.id));

    await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_mike_3',
        documentType: 'passport',
        verificationStatus: 'under_review', // After 3rd attempt goes to manual review
      });

    const [orderAfter3Attempts] = await db
      .update(orders)
      .set({
        kycStatus: 'under_review',
        kycAttempts: 3,
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify after 3 attempts, goes to under_review
    expect(orderAfter3Attempts.kycStatus).toBe('under_review');
    expect(orderAfter3Attempts.kycAttempts).toBe(3);

    // Step 4: Admin rejects the KYC after manual review
    const [rejectedKyc] = await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_mike_rejected',
        documentType: 'passport',
        verificationStatus: 'rejected',
        verificationNotes: 'Document appears fake',
      })
      .returning();

    const [rejectedOrder] = await db
      .update(orders)
      .set({
        kycStatus: 'rejected',
        orderStatus: 'rejected', // Order also gets rejected
        refundStatus: 'requested', // Refund process initiated
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify rejection
    expect(rejectedOrder.kycStatus).toBe('rejected');
    expect(rejectedOrder.orderStatus).toBe('rejected');
    expect(rejectedOrder.refundStatus).toBe('requested');
  });

  it('should verify token-based access works throughout flow', async () => {
    const uniqueId = Date.now();
    
    // Create product
    const [product] = await db
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

    // Create order with access token
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `token-${uniqueId}@example.com`;
    const accessToken = generateOrderToken('test-order-id', customerEmail, orderNumber);
    
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Token Test User',
        customerEmail,
        customerPhone: '+6281234567893',
        nationality: 'SG',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'SQ211',
        productId: product.id,
        subtotal: 120000,
        total: 120000,
        orderStatus: 'paid',
        paymentStatus: 'paid',
        paymentGatewayId: 'midtrans_txn_999',
        paymentMethod: 'jcb',
        accessToken, // Token stored in DB
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Verify token is stored and accessible
    expect(order.accessToken).toBe(accessToken);
    expect(order.tokenExpiresAt).toBeDefined();

    // Verify we can retrieve the order using the token
    const orderWithToken = await db
      .select()
      .from(orders)
      .where(eq(orders.accessToken, accessToken))
      .execute();

    expect(orderWithToken).toHaveLength(1);
    expect(orderWithToken[0].orderNumber).toBe(orderNumber);
    expect(orderWithToken[0].customerEmail).toBe(customerEmail);

    // Simulate progressing through the flow
    const [kycDoc] = await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_token_test',
        documentType: 'passport',
        verificationStatus: 'auto_approved',
      })
      .returning();

    const [updatedOrder] = await db
      .update(orders)
      .set({
        kycStatus: 'auto_approved',
        orderStatus: 'processing',
        passportPublicId: 'passport_token_test',
        imeiNumber: '111111111111111',
      })
      .where(eq(orders.accessToken, accessToken))
      .returning();

    // Verify token-based update worked
    expect(updatedOrder.kycStatus).toBe('auto_approved');
    expect(updatedOrder.orderStatus).toBe('processing');
    expect(updatedOrder.imeiNumber).toBe('111111111111111');
  });
});