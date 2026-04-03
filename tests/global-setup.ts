// tests/global-setup.ts
// Note: This file runs before tests, so we can't use path aliases here
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config({ path: '.env.local' });

// Set up database connection (same as in setup.ts)
const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or TEST_DATABASE_URL must be set for tests');
}

const sql = neon(connectionString);
const db = drizzle(sql);

// Import schema directly (need to use dynamic import or require for ESM compatibility)
import * as schema from '../src/lib/db/schema';

/**
 * Global setup - runs once before all test files
 * Cleans all tables to ensure fresh state
 */
export async function setup() {
  console.log('🧹 Global setup: Cleaning database...');
  
  try {
    // Clean in correct order (children before parents)
    await db.delete(schema.adminLogs);
    await db.delete(schema.reviews);
    await db.delete(schema.kycDocuments);
    await db.delete(schema.orders);
    await db.delete(schema.refundPolicies);
    await db.delete(schema.profiles);
    await db.delete(schema.products);
    
    console.log('✅ Database cleaned successfully');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    // Don't throw - let tests continue even if cleanup fails
    console.log('⚠️ Continuing with tests despite cleanup error');
  }
}

/**
 * Global teardown - runs once after all test files
 * Cleans up any remaining test data
 */
export async function teardown() {
  console.log('🧹 Global teardown: Cleaning database...');
  
  try {
    // Clean in correct order (children before parents)
    await db.delete(schema.adminLogs);
    await db.delete(schema.reviews);
    await db.delete(schema.kycDocuments);
    await db.delete(schema.orders);
    await db.delete(schema.refundPolicies);
    await db.delete(schema.profiles);
    await db.delete(schema.products);
    
    console.log('✅ Database cleaned successfully');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    // Don't throw on teardown to allow cleanup to continue
  }
}