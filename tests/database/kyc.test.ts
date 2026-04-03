// tests/database/kyc.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { orders, kycDocuments, profiles, products, reviews, adminLogs, refundPolicies } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { generateOrderToken } from '@/lib/token';
import { cleanupAllTables } from '../setup';

describe('KYC Documents Database Tests', () => {
  beforeEach(async () => {
    // Clear test data before each test using centralized cleanup
    await cleanupAllTables();
  });

  afterEach(async () => {
    // Clean up after each test using centralized cleanup
    await cleanupAllTables();
  });

  it('should create a new KYC document linked to an order', async () => {
    const uniqueId = Date.now();
    
    // Create a test product
    const [testProduct] = await db
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

    // Create an order first
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [testOrder] = await db
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
        subtotal: 150000,
        total: 150000,
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Create a test profile for the admin
    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `admin-${uniqueId}@example.com`,
        name: 'Admin User',
        role: 'admin',
      })
      .returning();

    // Create a KYC document
    const [newKycDoc] = await db
      .insert(kycDocuments)
      .values({
        orderId: testOrder.id,
        passportPublicId: 'passport_test_abc123',
        documentType: 'passport',
        verificationStatus: 'pending',
        verifiedBy: adminProfile.id,
        verificationNotes: 'Initial upload',
      })
      .returning();

    // Verify the KYC document was created
    expect(newKycDoc).toBeDefined();
    expect(newKycDoc.orderId).toBe(testOrder.id);
    expect(newKycDoc.passportPublicId).toBe('passport_test_abc123');
    expect(newKycDoc.documentType).toBe('passport');
    expect(newKycDoc.verificationStatus).toBe('pending');
    expect(newKycDoc.verifiedBy).toBe(adminProfile.id);
    expect(newKycDoc.verificationNotes).toBe('Initial upload');
  });

  it('should update KYC verification status correctly', async () => {
    const uniqueId = Date.now();
    
    // Create test data
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

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [testOrder] = await db
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

    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `admin-${uniqueId}@example.com`,
        name: 'Admin User',
        role: 'admin',
      })
      .returning();

    // Create initial KYC document
    const [initialKycDoc] = await db
      .insert(kycDocuments)
      .values({
        orderId: testOrder.id,
        passportPublicId: 'passport_initial',
        documentType: 'passport',
        verificationStatus: 'pending',
        verifiedBy: adminProfile.id,
      })
      .returning();

    // Update the KYC status
    const [updatedKycDoc] = await db
      .update(kycDocuments)
      .set({
        verificationStatus: 'auto_approved',
        verifiedBy: adminProfile.id,
        verificationNotes: 'Clear photo detected',
      })
      .where(eq(kycDocuments.id, initialKycDoc.id))
      .returning();

    // Verify the update worked
    expect(updatedKycDoc.verificationStatus).toBe('auto_approved');
    expect(updatedKycDoc.verificationNotes).toBe('Clear photo detected');
    expect(updatedKycDoc.verifiedBy).toBe(adminProfile.id);
  });

  it('should handle KYC retry scenarios', async () => {
    const uniqueId = Date.now();
    
    // Create test data
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

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [testOrder] = await db
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
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `admin-${uniqueId}@example.com`,
        name: 'Admin User',
        role: 'admin',
      })
      .returning();

    // Create initial KYC document with retry_1 status
    const [kycRetry1] = await db
      .insert(kycDocuments)
      .values({
        orderId: testOrder.id,
        passportPublicId: 'passport_retry1',
        documentType: 'passport',
        verificationStatus: 'retry_1',
        verifiedBy: adminProfile.id,
        verificationNotes: 'Blurry image, please retry',
      })
      .returning();

    // Verify the retry status
    expect(kycRetry1.verificationStatus).toBe('retry_1');
    expect(kycRetry1.verificationNotes).toBe('Blurry image, please retry');

    // Update to retry_2 status
    const [kycRetry2] = await db
      .update(kycDocuments)
      .set({
        verificationStatus: 'retry_2',
        verificationNotes: 'Still unclear, please try again',
      })
      .where(eq(kycDocuments.id, kycRetry1.id))
      .returning();

    // Verify the retry_2 status
    expect(kycRetry2.verificationStatus).toBe('retry_2');
    expect(kycRetry2.verificationNotes).toBe('Still unclear, please try again');
  });

  it('should retrieve KYC documents with related order data', async () => {
    const uniqueId = Date.now();
    
    // Create test data
    const [testProduct] = await db
      .insert(products)
      .values({
        name: 'Bali eSIM 10 Days',
        description: '10 days unlimited data',
        category: 'esim',
        duration: 10,
        price: 200000,
        isActive: true,
      })
      .returning();

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [testOrder] = await db
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
        subtotal: 200000,
        total: 200000,
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `admin-${uniqueId}@example.com`,
        name: 'Admin User',
        role: 'admin',
      })
      .returning();

    // Create a KYC document
    await db
      .insert(kycDocuments)
      .values({
        orderId: testOrder.id,
        passportPublicId: 'passport_with_order',
        documentType: 'passport',
        verificationStatus: 'under_review',
        verifiedBy: adminProfile.id,
      });

    // Query KYC documents with related order data
    const kycWithOrder = await db
      .select({
        kycDoc: kycDocuments,
        order: orders,
      })
      .from(kycDocuments)
      .leftJoin(orders, eq(kycDocuments.orderId, orders.id))
      .where(eq(kycDocuments.passportPublicId, 'passport_with_order'))
      .execute();

    // Verify the join worked
    expect(kycWithOrder).toHaveLength(1);
    expect(kycWithOrder[0].kycDoc.passportPublicId).toBe('passport_with_order');
    expect(kycWithOrder[0].order?.orderNumber).toBe(orderNumber);
    expect(kycWithOrder[0].order?.fullName).toBe('Test Customer');
  });

  it('should link KYC document to admin who verified', async () => {
    const uniqueId = Date.now();
    
    // Create test data
    const [testProduct] = await db
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

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [testOrder] = await db
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
        subtotal: 250000,
        total: 250000,
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    const [adminProfile] = await db
      .insert(profiles)
      .values({
        email: `verifier-${uniqueId}@example.com`,
        name: 'KYC Verifier',
        role: 'admin',
      })
      .returning();

    // Create KYC document linked to the admin
    const [kycDoc] = await db
      .insert(kycDocuments)
      .values({
        orderId: testOrder.id,
        passportPublicId: 'passport_verified_by_admin',
        documentType: 'passport',
        verificationStatus: 'approved',
        verifiedBy: adminProfile.id,
        verificationNotes: 'Approved by admin',
      })
      .returning();

    // Verify the document was linked to the correct admin
    expect(kycDoc.verifiedBy).toBe(adminProfile.id);
    expect(kycDoc.verificationStatus).toBe('approved');
    expect(kycDoc.verificationNotes).toBe('Approved by admin');

    // Query with admin details
    const kycWithAdmin = await db
      .select({
        kycDoc: kycDocuments,
        admin: profiles,
      })
      .from(kycDocuments)
      .leftJoin(profiles, eq(kycDocuments.verifiedBy, profiles.id))
      .where(eq(kycDocuments.id, kycDoc.id))
      .execute();

    expect(kycWithAdmin).toHaveLength(1);
    expect(kycWithAdmin[0].admin?.name).toBe('KYC Verifier');
    expect(kycWithAdmin[0].admin?.email).toBe(`verifier-${uniqueId}@example.com`);
  });
});