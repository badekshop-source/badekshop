// tests/integration/admin-flow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { orders, products, profiles, kycDocuments, adminLogs, refundPolicies, reviews } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { generateOrderToken } from '@/lib/token';
import { cleanupAllTables } from '../setup';

describe('Admin Flow Integration Tests', () => {
  beforeEach(async () => {
    // Clear test data before each test using centralized cleanup
    await cleanupAllTables();
  });

  afterEach(async () => {
    // Clean up after each test using centralized cleanup
    await cleanupAllTables();
  });

  it('should handle admin KYC approval workflow', async () => {
    // Use unique identifiers to avoid constraint violations
    const uniqueId = Date.now();
    
    // Step 1: Create admin profile
    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `admin-${uniqueId}@example.com`,
        name: 'Admin User',
        role: 'admin',
      })
      .returning();

    // Step 2: Create product
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

    // Step 3: Create order with under_review KYC status
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Test Customer',
        customerEmail,
        customerPhone: '+6281234567890',
        nationality: 'US',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'GA123',
        productId: product.id,
        subtotal: 150000,
        total: 150000,
        orderStatus: 'paid',
        paymentStatus: 'paid',
        paymentGatewayId: 'midtrans_txn_123',
        paymentMethod: 'visa',
        kycStatus: 'under_review', // Needs manual review
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Step 4: Create KYC document for admin review
    const [kycDoc] = await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_for_review_123',
        documentType: 'passport',
        verificationStatus: 'under_review',
        verificationNotes: 'Third attempt, requires manual review',
      })
      .returning();

    // Step 5: Admin approves the KYC
    const [updatedOrder] = await db
      .update(orders)
      .set({
        kycStatus: 'approved',
        orderStatus: 'approved',
        passportPublicId: 'passport_for_review_123',
        passportUrl: 'https://res.cloudinary.com/demo/image/upload/passport_for_review_123.jpg',
        imeiNumber: '123456789012345',
        qrCodeData: `badekshop:${orderNumber}:${order.id}`, // Generate QR code
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify the KYC approval
    expect(updatedOrder.kycStatus).toBe('approved');
    expect(updatedOrder.orderStatus).toBe('approved');
    expect(updatedOrder.qrCodeData).toContain('badekshop:');
    expect(updatedOrder.imeiNumber).toBe('123456789012345');

    // Update KYC document to reflect approval
    const [updatedKycDoc] = await db
      .update(kycDocuments)
      .set({
        verificationStatus: 'approved',
        verifiedBy: adminProfile.id,
        verificationNotes: 'Manually approved by admin',
      })
      .where(eq(kycDocuments.id, kycDoc.id))
      .returning();

    // Verify KYC doc was updated
    expect(updatedKycDoc.verificationStatus).toBe('approved');
    expect(updatedKycDoc.verifiedBy).toBe(adminProfile.id);
    expect(updatedKycDoc.verificationNotes).toBe('Manually approved by admin');

    // Step 6: Log admin action
    const [adminLog] = await db
      .insert(adminLogs)
      .values({
        adminId: adminProfile.id,
        action: 'approve_kyc',
        targetId: order.id,
        targetType: 'order',
        details: {
          orderId: order.id,
          previousStatus: 'under_review',
          newStatus: 'approved',
        },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      })
      .returning();

    // Verify admin log was created
    expect(adminLog.adminId).toBe(adminProfile.id);
    expect(adminLog.action).toBe('approve_kyc');
    expect(adminLog.targetId).toBe(order.id);
    expect(adminLog.targetType).toBe('order');
    expect(adminLog.details).toEqual({
      orderId: order.id,
      previousStatus: 'under_review',
      newStatus: 'approved',
    });
  });

  it('should handle admin KYC rejection workflow', async () => {
    const uniqueId = Date.now();
    // Step 1: Create admin profile
    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `moderator-${uniqueId}@example.com`,
        name: 'Moderator User',
        role: 'admin',
      })
      .returning();

    // Step 2: Create product
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

    // Step 3: Create order with under_review KYC status
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Rejected Customer',
        customerEmail: `rejected-${uniqueId}@example.com`,
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
        kycStatus: 'under_review',
        accessToken: generateOrderToken('test-order-id', `rejected-${uniqueId}@example.com`, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Step 4: Create KYC document for admin review
    const [kycDoc] = await db
      .insert(kycDocuments)
      .values({
        orderId: order.id,
        passportPublicId: 'passport_rejected_456',
        documentType: 'passport',
        verificationStatus: 'under_review',
        verificationNotes: 'Document appears fake',
      })
      .returning();

    // Step 5: Admin rejects the KYC
    const [updatedOrder] = await db
      .update(orders)
      .set({
        kycStatus: 'rejected',
        orderStatus: 'rejected',
        refundStatus: 'requested', // Trigger refund process
        refundReason: 'Fake document detected',
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify the KYC rejection
    expect(updatedOrder.kycStatus).toBe('rejected');
    expect(updatedOrder.orderStatus).toBe('rejected');
    expect(updatedOrder.refundStatus).toBe('requested');
    expect(updatedOrder.refundReason).toBe('Fake document detected');

    // Update KYC document to reflect rejection
    const [updatedKycDoc] = await db
      .update(kycDocuments)
      .set({
        verificationStatus: 'rejected',
        verifiedBy: adminProfile.id,
        verificationNotes: 'Fake document detected, rejected by admin',
      })
      .where(eq(kycDocuments.id, kycDoc.id))
      .returning();

    // Verify KYC doc was updated
    expect(updatedKycDoc.verificationStatus).toBe('rejected');
    expect(updatedKycDoc.verifiedBy).toBe(adminProfile.id);
    expect(updatedKycDoc.verificationNotes).toBe('Fake document detected, rejected by admin');

    // Step 6: Log admin action
    const [adminLog] = await db
      .insert(adminLogs)
      .values({
        adminId: adminProfile.id,
        action: 'reject_kyc',
        targetId: order.id,
        targetType: 'order',
        details: {
          orderId: order.id,
          previousStatus: 'under_review',
          newStatus: 'rejected',
          reason: 'Fake document detected',
        },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      })
      .returning();

    // Verify admin log was created
    expect(adminLog.adminId).toBe(adminProfile.id);
    expect(adminLog.action).toBe('reject_kyc');
    expect(adminLog.targetId).toBe(order.id);
    expect(adminLog.targetType).toBe('order');
    expect(adminLog.details).toEqual({
      orderId: order.id,
      previousStatus: 'under_review',
      newStatus: 'rejected',
      reason: 'Fake document detected',
    });
  });

  it('should handle admin product CRUD operations', async () => {
    const uniqueId = Date.now();
    // Step 1: Create admin profile
    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `product-admin-${uniqueId}@example.com`,
        name: 'Product Admin',
        role: 'admin',
      })
      .returning();

    // Step 2: Admin creates a new product
    const [createdProduct] = await db
      .insert(products)
      .values({
        name: 'Deluxe eSIM 10 Days',
        description: '10 days premium unlimited data',
        category: 'esim',
        duration: 10,
        price: 200000,
        discountPercentage: 10,
        discountStart: new Date(Date.now() + 86400000), // Starts tomorrow
        discountEnd: new Date(Date.now() + 86400000 * 7), // Ends in 7 days
        stock: 50,
        isActive: true,
      })
      .returning();

    // Verify product was created
    expect(createdProduct.name).toBe('Deluxe eSIM 10 Days');
    expect(createdProduct.category).toBe('esim');
    expect(createdProduct.duration).toBe(10);
    expect(createdProduct.price).toBe(200000);
    expect(createdProduct.discountPercentage).toBe(10);
    expect(createdProduct.isActive).toBe(true);

    // Step 3: Admin updates the product
    const [updatedProduct] = await db
      .update(products)
      .set({
        price: 180000, // Apply discount permanently
        discountPercentage: 0, // Remove discount
        stock: 45, // Update stock after sales
      })
      .where(eq(products.id, createdProduct.id))
      .returning();

    // Verify product was updated
    expect(updatedProduct.price).toBe(180000);
    expect(updatedProduct.discountPercentage).toBe(0);
    expect(updatedProduct.stock).toBe(45);

    // Step 4: Log admin action
    const [adminLog] = await db
      .insert(adminLogs)
      .values({
        adminId: adminProfile.id,
        action: 'update_product',
        targetId: createdProduct.id,
        targetType: 'product',
        details: {
          productId: createdProduct.id,
          fieldName: 'price',
          oldValue: 200000,
          newValue: 180000,
        },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      })
      .returning();

    // Verify admin log was created
    expect(adminLog.adminId).toBe(adminProfile.id);
    expect(adminLog.action).toBe('update_product');
    expect(adminLog.targetId).toBe(createdProduct.id);
    expect(adminLog.targetType).toBe('product');
    expect(adminLog.details).toEqual({
      productId: createdProduct.id,
      fieldName: 'price',
      oldValue: 200000,
      newValue: 180000,
    });

    // Step 5: Admin deactivates the product
    const [deactivatedProduct] = await db
      .update(products)
      .set({
        isActive: false,
      })
      .where(eq(products.id, createdProduct.id))
      .returning();

    // Verify product was deactivated
    expect(deactivatedProduct.isActive).toBe(false);

    // Step 6: Verify product can't be queried when inactive (depending on filter)
    const activeProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true)))
      .execute();

    // Should not include the deactivated product
    const includesDeactivated = activeProducts.some(p => p.id === deactivatedProduct.id);
    expect(includesDeactivated).toBe(false);
  });

  it('should handle admin refund policy configuration', async () => {
    const uniqueId = Date.now();
    // Step 1: Create admin profile
    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `policy-admin-${uniqueId}@example.com`,
        name: 'Policy Admin',
        role: 'admin',
      })
      .returning();

    // Step 2: Admin creates a refund policy
    const [refundPolicy] = await db
      .insert(refundPolicies)
      .values({
        name: 'auto_refund_on_rejection',
        description: 'Auto-process refund when KYC is rejected',
        isEnabled: true,
        adminFeeType: 'percentage',
        adminFeeValue: 5, // 5% admin fee
        autoRefundOnRejection: true,
        autoRefundOnExpiry: false,
        autoRefundOnCancellation: false,
      })
      .returning();

    // Verify refund policy was created
    expect(refundPolicy.name).toBe('auto_refund_on_rejection');
    expect(refundPolicy.isEnabled).toBe(true);
    expect(refundPolicy.adminFeeType).toBe('percentage');
    expect(refundPolicy.adminFeeValue).toBe(5);
    expect(refundPolicy.autoRefundOnRejection).toBe(true);

    // Step 3: Admin updates the policy
    const [updatedPolicy] = await db
      .update(refundPolicies)
      .set({
        adminFeeValue: 10, // Increase admin fee to 10%
        autoRefundOnExpiry: true, // Also enable expiry refunds
      })
      .where(eq(refundPolicies.id, refundPolicy.id))
      .returning();

    // Verify policy was updated
    expect(updatedPolicy.adminFeeValue).toBe(10);
    expect(updatedPolicy.autoRefundOnExpiry).toBe(true);

    // Step 4: Log admin action
    const [adminLog] = await db
      .insert(adminLogs)
      .values({
        adminId: adminProfile.id,
        action: 'update_refund_policy',
        targetId: refundPolicy.id,
        targetType: 'refund_policy',
        details: {
          policyId: refundPolicy.id,
          fieldName: 'adminFeeValue',
          oldValue: 5,
          newValue: 10,
        },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      })
      .returning();

    // Verify admin log was created
    expect(adminLog.adminId).toBe(adminProfile.id);
    expect(adminLog.action).toBe('update_refund_policy');
    expect(adminLog.targetId).toBe(refundPolicy.id);
    expect(adminLog.targetType).toBe('refund_policy');
    expect(adminLog.details).toEqual({
      policyId: refundPolicy.id,
      fieldName: 'adminFeeValue',
      oldValue: 5,
      newValue: 10,
    });

    // Step 5: Test policy application on an order
    // Create product
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

    // Create order that will be rejected
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Refund Customer',
        customerEmail: `refund-${uniqueId}@example.com`,
        customerPhone: '+6281234567892',
        nationality: 'GB',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'BA249',
        productId: product.id,
        subtotal: 250000,
        total: 250000,
        orderStatus: 'paid',
        paymentStatus: 'paid',
        paymentGatewayId: 'midtrans_txn_789',
        paymentMethod: 'amex',
        kycStatus: 'rejected', // This should trigger refund per policy
        accessToken: generateOrderToken('test-order-id', `refund-${uniqueId}@example.com`, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Apply refund based on policy (would normally happen in workflow)
    const adminFee = Math.round((order.total * updatedPolicy.adminFeeValue) / 100);
    const refundAmount = order.total - adminFee;

    const [updatedOrderWithRefund] = await db
      .update(orders)
      .set({
        kycStatus: 'rejected',
        orderStatus: 'rejected',
        refundStatus: 'processed',
        refundAmount: refundAmount,
        refundReason: 'KYC rejected, policy: auto_refund_on_rejection',
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Verify refund calculation based on policy
    expect(updatedOrderWithRefund.refundStatus).toBe('processed');
    expect(updatedOrderWithRefund.refundAmount).toBe(refundAmount);
    expect(updatedOrderWithRefund.refundReason).toContain('policy: auto_refund_on_rejection');
    
    // Verify admin fee was calculated correctly
    expect(adminFee).toBe(Math.round((250000 * 10) / 100)); // 10% of 250,000 = 25,000
    expect(refundAmount).toBe(250000 - adminFee); // 225,000
  });

  it('should maintain audit trail for all admin actions', async () => {
    const uniqueId = Date.now();
    // Step 1: Create admin profile
    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `auditor-${uniqueId}@example.com`,
        name: 'Auditor User',
        role: 'admin',
      })
      .returning();

    // Step 2: Perform multiple admin actions to test audit trail
    // Create product
    const [product] = await db
      .insert(products)
      .values({
        name: 'Test eSIM',
        description: 'Test product',
        category: 'esim',
        price: 100000,
        isActive: true,
      })
      .returning();

    // Log product creation
    await db.insert(adminLogs).values({
      adminId: adminProfile.id,
      action: 'create_product',
      targetId: product.id,
      targetType: 'product',
      details: { productName: product.name },
      ip: '127.0.0.1',
      userAgent: 'Test Agent',
    });

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Audit Test Customer',
        customerEmail: `audit-${uniqueId}@example.com`,
        customerPhone: '+6281234567893',
        nationality: 'AU',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'QF437',
        productId: product.id,
        subtotal: 100000,
        total: 100000,
        orderStatus: 'paid',
        paymentStatus: 'paid',
        accessToken: generateOrderToken('test-order-id', `audit-${uniqueId}@example.com`, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Log order view
    await db.insert(adminLogs).values({
      adminId: adminProfile.id,
      action: 'view_order',
      targetId: order.id,
      targetType: 'order',
      details: { orderId: order.id, orderNumber: order.orderNumber },
      ip: '127.0.0.1',
      userAgent: 'Test Agent',
    });

    // Update product
    await db
      .update(products)
      .set({ price: 95000 })
      .where(eq(products.id, product.id));

    // Log product update
    await db.insert(adminLogs).values({
      adminId: adminProfile.id,
      action: 'update_product',
      targetId: product.id,
      targetType: 'product',
      details: { productId: product.id, field: 'price', newValue: 95000 },
      ip: '127.0.0.1',
      userAgent: 'Test Agent',
    });

    // Step 3: Verify audit trail
    const auditTrail = await db
      .select({
        log: adminLogs,
        admin: profiles,
      })
      .from(adminLogs)
      .leftJoin(profiles, eq(adminLogs.adminId, profiles.id))
      .where(eq(profiles.id, adminProfile.id))
      .orderBy(desc(adminLogs.createdAt))
      .execute();

    // Should have 3 audit records
    expect(auditTrail).toHaveLength(3);

    // Verify each action was logged correctly
    const actions = auditTrail.map(log => log.log.action);
    expect(actions).toContain('create_product');
    expect(actions).toContain('view_order');
    expect(actions).toContain('update_product');

    // Verify admin info is linked correctly
    for (const log of auditTrail) {
      expect(log.admin?.name).toBe('Auditor User');
      expect(log.admin?.email).toBe(`auditor-${uniqueId}@example.com`);
      expect(log.log.ip).toBe('127.0.0.1');
      expect(log.log.userAgent).toBe('Test Agent');
    }

    // Verify details are preserved
    const createLog = auditTrail.find(l => l.log.action === 'create_product');
    expect(createLog?.log.details).toEqual({ productName: 'Test eSIM' });

    const viewLog = auditTrail.find(l => l.log.action === 'view_order');
    expect(viewLog?.log.details).toEqual({ 
      orderId: order.id, 
      orderNumber: order.orderNumber 
    });

    const updateLog = auditTrail.find(l => l.log.action === 'update_product');
    expect(updateLog?.log.details).toEqual({ 
      productId: product.id, 
      field: 'price', 
      newValue: 95000 
    });
  });
});