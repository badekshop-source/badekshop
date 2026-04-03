// tests/setup.ts
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { db } from '@/lib/db';
import { 
  adminLogs, 
  reviews, 
  kycDocuments, 
  orders, 
  refundPolicies, 
  profiles, 
  products 
} from '@/lib/db/schema';

// Load environment variables
config({ path: '.env.local' });

// Set up test database connection
const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or TEST_DATABASE_URL must be set for tests');
}

const sql = neon(connectionString);
export const testDb = drizzle(sql);

/**
 * Cleans all tables in the correct order to avoid foreign key constraint violations
 * Order: child tables first, then parent tables
 * Uses try-catch to handle any tables that might already be empty
 */
export async function cleanupAllTables() {
  const errors: string[] = [];
  
  try {
    // Delete in order: child tables with foreign keys first, then parent tables
    try { await db.delete(adminLogs); } catch (e) { errors.push('adminLogs'); }
    try { await db.delete(reviews); } catch (e) { errors.push('reviews'); }
    try { await db.delete(kycDocuments); } catch (e) { errors.push('kycDocuments'); }
    try { await db.delete(orders); } catch (e) { errors.push('orders'); }
    try { await db.delete(refundPolicies); } catch (e) { errors.push('refundPolicies'); }
    try { await db.delete(profiles); } catch (e) { errors.push('profiles'); }
    try { await db.delete(products); } catch (e) { errors.push('products'); }
    
    if (errors.length > 0) {
      console.log(`⚠️ Some tables had cleanup issues (may be empty): ${errors.join(', ')}`);
    } else {
      console.log('✅ All tables cleaned successfully');
    }
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    // Don't throw - let tests continue
  }
}

console.log('Test environment set up successfully');