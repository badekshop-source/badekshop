import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function pushSchema() {
  try {
    console.log('Pushing schema changes...');
    
    // Add 'data' column to products table
    await db.execute(sql`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "data" TEXT;
    `);
    
    console.log('Schema pushed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  }
}

pushSchema();