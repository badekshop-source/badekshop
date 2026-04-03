import { db } from '@/lib/db';
import { adminLogs, profiles } from '@/lib/db/schema';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { desc, eq, like } from 'drizzle-orm';
import { cleanupAllTables } from '../../setup';

describe('Admin Logs API', () => {
  beforeEach(async () => {
    // Clear test data before each test using centralized cleanup
    await cleanupAllTables();
  });

  afterEach(async () => {
    // Clean up after each test using centralized cleanup
    await cleanupAllTables();
  });

  it('should create and retrieve admin logs with pagination', async () => {
    // Create admin profile
    const [adminProfile] = await db.insert(profiles).values({
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin',
    }).returning();

    // Insert test logs with delay to ensure different timestamps
    await db.insert(adminLogs).values({
      adminId: adminProfile.id,
      action: 'view_order',
      targetId: 'order-1',
      targetType: 'order',
      details: { orderId: 'order-1' },
      ip: '127.0.0.1',
      userAgent: 'Test Agent',
    });

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));

    await db.insert(adminLogs).values({
      adminId: adminProfile.id,
      action: 'approve_kyc',
      targetId: 'order-1',
      targetType: 'order',
      details: { orderId: 'order-1', status: 'approved' },
      ip: '127.0.0.1',
      userAgent: 'Test Agent',
    });

    // Simulate pagination query (page 1, limit 10)
    const page = 1;
    const limit = 10;
    const logs = await db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    expect(logs).toHaveLength(2);
    expect(logs[0].action).toBe('approve_kyc'); // Most recent first
    expect(logs[1].action).toBe('view_order');
  });

  it('should filter admin logs by action', async () => {
    // Create admin profile
    const [adminProfile] = await db.insert(profiles).values({
      email: 'admin2@test.com',
      name: 'Test Admin 2',
      role: 'admin',
    }).returning();

    // Insert test logs with different actions
    await db.insert(adminLogs).values([
      {
        adminId: adminProfile.id,
        action: 'view_order',
        targetId: 'order-1',
        targetType: 'order',
        details: { orderId: 'order-1' },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      },
      {
        adminId: adminProfile.id,
        action: 'delete_product',
        targetId: 'product-1',
        targetType: 'product',
        details: { productId: 'product-1' },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      },
    ]);

    // Filter by action containing 'view'
    const filteredLogs = await db
      .select()
      .from(adminLogs)
      .where(like(adminLogs.action, '%view%'))
      .orderBy(desc(adminLogs.createdAt));

    expect(filteredLogs).toHaveLength(1);
    expect(filteredLogs[0].action).toBe('view_order');
  });

  it('should count total admin logs', async () => {
    // Create admin profile
    const [adminProfile] = await db.insert(profiles).values({
      email: 'admin3@test.com',
      name: 'Test Admin 3',
      role: 'admin',
    }).returning();

    // Insert test logs
    await db.insert(adminLogs).values([
      {
        adminId: adminProfile.id,
        action: 'create_product',
        targetId: 'product-1',
        targetType: 'product',
        details: { productId: 'product-1' },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      },
      {
        adminId: adminProfile.id,
        action: 'update_product',
        targetId: 'product-1',
        targetType: 'product',
        details: { productId: 'product-1' },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      },
    ]);

    // Count total logs
    const result = await db.select({ count: db.$count(adminLogs) }).from(adminLogs);
    const totalCount = result[0]?.count ?? 0;

    expect(totalCount).toBe(2);
  });

  it('should handle pagination correctly', async () => {
    // Create admin profile
    const [adminProfile] = await db.insert(profiles).values({
      email: 'admin4@test.com',
      name: 'Test Admin 4',
      role: 'admin',
    }).returning();

    // Insert 5 test logs
    for (let i = 1; i <= 5; i++) {
      await db.insert(adminLogs).values({
        adminId: adminProfile.id,
        action: `action_${i}`,
        targetId: `target-${i}`,
        targetType: 'order',
        details: { index: i },
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      });
    }

    // Test page 1 with limit 2
    const page1 = await db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(2)
      .offset(0);

    expect(page1).toHaveLength(2);
    expect(page1[0].action).toBe('action_5'); // Most recent
    expect(page1[1].action).toBe('action_4');

    // Test page 2 with limit 2
    const page2 = await db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(2)
      .offset(2);

    expect(page2).toHaveLength(2);
    expect(page2[0].action).toBe('action_3');
    expect(page2[1].action).toBe('action_2');

    // Test page 3 with limit 2 (should only have 1 result)
    const page3 = await db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(2)
      .offset(4);

    expect(page3).toHaveLength(1);
    expect(page3[0].action).toBe('action_1');
  });
});