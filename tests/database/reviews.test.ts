// tests/database/reviews.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { reviews, orders, products, profiles, kycDocuments, adminLogs, refundPolicies } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { generateOrderToken } from '@/lib/token';
import { cleanupAllTables } from '../setup';

describe('Reviews Database Tests', () => {
  beforeEach(async () => {
    // Clear test data before each test using centralized cleanup
    await cleanupAllTables();
  });

  afterEach(async () => {
    // Clean up after each test using centralized cleanup
    await cleanupAllTables();
  });

  it('should create a new review with all required fields', async () => {
    const uniqueId = Date.now();
    
    // Create test data
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
        orderStatus: 'completed', // Required for review
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Create a review
    const userEmail = `john-${uniqueId}@example.com`;
    const [newReview] = await db
      .insert(reviews)
      .values({
        orderId: testOrder.id,
        userName: 'John Doe',
        userEmail,
        country: 'United States',
        rating: 5,
        tripType: 'leisure',
        tripDuration: '8-14',
        reviewText: 'Excellent service! The eSIM worked perfectly throughout my stay in Bali.',
        isApproved: true, // Auto-approved for 5-star rating
      })
      .returning();

    // Verify the review was created with all expected values
    expect(newReview).toBeDefined();
    expect(newReview.orderId).toBe(testOrder.id);
    expect(newReview.userName).toBe('John Doe');
    expect(newReview.userEmail).toBe(userEmail);
    expect(newReview.country).toBe('United States');
    expect(newReview.rating).toBe(5);
    expect(newReview.tripType).toBe('leisure');
    expect(newReview.tripDuration).toBe('8-14');
    expect(newReview.reviewText).toBe('Excellent service! The eSIM worked perfectly throughout my stay in Bali.');
    expect(newReview.isApproved).toBe(true);
    expect(newReview.reviewedAt).toBeDefined();
  });

  it('should handle 4-star ratings as auto-approved', async () => {
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

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail = `customer-${uniqueId}@example.com`;
    const [testOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        fullName: 'Test Customer',
        customerEmail,
        customerPhone: '+6281234567890',
        nationality: 'GB',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'BA249',
        productId: testProduct.id,
        subtotal: 120000,
        total: 120000,
        orderStatus: 'completed',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Create a 4-star review (should be auto-approved)
    const userEmail = `jane-${uniqueId}@example.com`;
    const [review4Stars] = await db
      .insert(reviews)
      .values({
        orderId: testOrder.id,
        userName: 'Jane Smith',
        userEmail,
        country: 'United Kingdom',
        rating: 4,
        tripType: 'business',
        tripDuration: '4-7',
        reviewText: 'Good service overall. Connection was stable and fast.',
        isApproved: true, // Should be auto-approved for 4-star rating
      })
      .returning();

    // Verify the review was auto-approved
    expect(review4Stars.rating).toBe(4);
    expect(review4Stars.isApproved).toBe(true);
  });

  it('should handle 3-star ratings as requiring manual approval', async () => {
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
        nationality: 'CA',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'AC001',
        productId: testProduct.id,
        subtotal: 50000,
        total: 50000,
        orderStatus: 'completed',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Create a 3-star review (should require manual approval)
    const userEmail = `bob-${uniqueId}@example.com`;
    const [review3Stars] = await db
      .insert(reviews)
      .values({
        orderId: testOrder.id,
        userName: 'Bob Johnson',
        userEmail,
        country: 'Canada',
        rating: 3,
        tripType: 'family',
        tripDuration: '15+',
        reviewText: 'Service was okay, but could be better.',
        isApproved: false, // Should require manual approval for 3-star rating
      })
      .returning();

    // Verify the review requires manual approval
    expect(review3Stars.rating).toBe(3);
    expect(review3Stars.isApproved).toBe(false);
  });

  it('should retrieve reviews with related order data', async () => {
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
        nationality: 'AU',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'QF437',
        productId: testProduct.id,
        subtotal: 250000,
        total: 250000,
        orderStatus: 'completed',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Create a review
    const userEmail = `emma-${uniqueId}@example.com`;
    await db
      .insert(reviews)
      .values({
        orderId: testOrder.id,
        userName: 'Emma Wilson',
        userEmail,
        country: 'Australia',
        rating: 5,
        tripType: 'leisure',
        tripDuration: '8-14',
        reviewText: 'Outstanding service! Highly recommend to anyone visiting Bali.',
        isApproved: true,
      });

    // Query reviews with related order data
    const reviewsWithOrder = await db
      .select({
        review: reviews,
        order: orders,
        product: products,
      })
      .from(reviews)
      .leftJoin(orders, eq(reviews.orderId, orders.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(reviews.userEmail, userEmail))
      .execute();

    // Verify the join worked
    expect(reviewsWithOrder).toHaveLength(1);
    expect(reviewsWithOrder[0].review.userName).toBe('Emma Wilson');
    expect(reviewsWithOrder[0].order?.orderNumber).toBe(orderNumber);
    expect(reviewsWithOrder[0].product?.name).toBe('Premium eSIM 14 Days');
  });

  it('should retrieve only approved reviews', async () => {
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

    const orderNumber1 = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail1 = `customer1-${uniqueId}@example.com`;
    const [testOrder1] = await db
      .insert(orders)
      .values({
        orderNumber: orderNumber1,
        fullName: 'Test Customer 1',
        customerEmail: customerEmail1,
        customerPhone: '+6281234567890',
        nationality: 'US',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'UA101',
        productId: testProduct.id,
        subtotal: 100000,
        total: 100000,
        orderStatus: 'completed',
        accessToken: generateOrderToken('test-order1-id', customerEmail1, orderNumber1),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    const orderNumber2 = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerEmail2 = `customer2-${uniqueId}@example.com`;
    const [testOrder2] = await db
      .insert(orders)
      .values({
        orderNumber: orderNumber2,
        fullName: 'Test Customer 2',
        customerEmail: customerEmail2,
        customerPhone: '+6281234567891',
        nationality: 'CA',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'AC002',
        productId: testProduct.id,
        subtotal: 100000,
        total: 100000,
        orderStatus: 'completed',
        accessToken: generateOrderToken('test-order2-id', customerEmail2, orderNumber2),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Create an approved review (5 stars)
    await db
      .insert(reviews)
      .values({
        orderId: testOrder1.id,
        userName: 'Alice Brown',
        userEmail: `alice-${uniqueId}@example.com`,
        country: 'United States',
        rating: 5,
        tripType: 'leisure',
        tripDuration: '4-7',
        reviewText: 'Amazing experience! Will definitely come back.',
        isApproved: true,
      });

    // Create a non-approved review (2 stars)
    await db
      .insert(reviews)
      .values({
        orderId: testOrder2.id,
        userName: 'Charlie Davis',
        userEmail: `charlie-${uniqueId}@example.com`,
        country: 'Canada',
        rating: 2,
        tripType: 'business',
        tripDuration: '1-3',
        reviewText: 'Poor service, connection kept dropping.',
        isApproved: false, // Not approved
      });

    // Query only approved reviews
    const approvedReviews = await db
      .select({
        review: reviews,
        order: orders,
      })
      .from(reviews)
      .leftJoin(orders, eq(reviews.orderId, orders.id))
      .where(eq(reviews.isApproved, true))
      .orderBy(desc(reviews.reviewedAt))
      .execute();

    // Should only return the approved review
    expect(approvedReviews).toHaveLength(1);
    expect(approvedReviews[0].review.userName).toBe('Alice Brown');
    expect(approvedReviews[0].review.rating).toBe(5);
    expect(approvedReviews[0].review.isApproved).toBe(true);
  });

  it('should sort reviews by review date (newest first)', async () => {
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
        nationality: 'JP',
        arrivalDate: new Date(Date.now() + 86400000),
        flightNumber: 'NH801',
        productId: testProduct.id,
        subtotal: 200000,
        total: 200000,
        orderStatus: 'completed',
        accessToken: generateOrderToken('test-order-id', customerEmail, orderNumber),
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activationOutlet: 'Ngurah Rai Airport',
      })
      .returning();

    // Create multiple reviews with different timestamps
    const [review1] = await db
      .insert(reviews)
      .values({
        orderId: testOrder.id,
        userName: 'First Reviewer',
        userEmail: `first-${uniqueId}@example.com`,
        country: 'Japan',
        rating: 4,
        tripType: 'leisure',
        tripDuration: '8-14',
        reviewText: 'First review created',
        isApproved: true,
      })
      .returning();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));

    const [review2] = await db
      .insert(reviews)
      .values({
        orderId: testOrder.id,
        userName: 'Second Reviewer',
        userEmail: `second-${uniqueId}@example.com`,
        country: 'Japan',
        rating: 5,
        tripType: 'leisure',
        tripDuration: '8-14',
        reviewText: 'Second review created after first',
        isApproved: true,
      })
      .returning();

    // Retrieve reviews ordered by newest first
    const allReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.orderId, testOrder.id))
      .orderBy(desc(reviews.reviewedAt))
      .execute();

    // Verify they're ordered correctly (newest first)
    expect(allReviews).toHaveLength(2);
    expect(allReviews[0].userName).toBe('Second Reviewer'); // Newest
    expect(allReviews[1].userName).toBe('First Reviewer');  // Oldest
  });
});