import 'dotenv/config';
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('🔄 Running migration: Adding "data" column to products table...\n');
    
    // Add data column
    await db.execute(sql`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "data" TEXT;
    `);
    console.log('✅ Added "data" column\n');
    
    // Add comment
    await db.execute(sql`
      COMMENT ON COLUMN "products"."data" IS 'Data allowance: Unlimited, 1GB, 3GB, 5GB, 10GB, 20GB, 50GB, 100GB';
    `);
    console.log('✅ Added column comment\n');
    
    // Verify
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'data';
    `);
    
    console.log('✅ Verification:');
    console.log(result.rows);
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();