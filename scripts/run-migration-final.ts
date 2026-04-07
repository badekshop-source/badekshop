import { config } from 'dotenv';
import { resolve } from 'path';
import pkg from 'pg';
const { Client } = pkg;

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.log('\n📋 To run migration manually:');
    console.log('1. Go to https://console.neon.tech');
    console.log('2. Select your database');
    console.log('3. Open SQL Editor');
    console.log('4. Run: ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "data" TEXT;');
    process.exit(1);
  }

  console.log('DATABASE_URL found:', databaseUrl.substring(0, 50) + '...\n');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: true,
    }
  });

  try {
    console.log('🔄 Connecting to Neon database...\n');
    await client.connect();
    console.log('✅ Connected successfully\n');

    console.log('🔄 Running migration: Adding "data" column to products table...\n');
    
    // Check if column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'data';
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Column "data" already exists in products table\n');
    } else {
      // Add data column
      await client.query(`ALTER TABLE "products" ADD COLUMN "data" TEXT;`);
      console.log('✅ Added "data" column to products table\n');
    }
    
    // Verify
    const verifyResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'data';
    `);
    
    console.log('✅ Verification successful:');
    console.table(verifyResult.rows);
    console.log('\n🎉 Migration completed successfully!\n');
    
    console.log('📋 Next Steps:');
    console.log('1. ✅ Migration complete - column added');
    console.log('2. Run: npm run build');
    console.log('3. Deploy: vercel --prod (or push to GitHub for auto-deploy)');
    console.log('4. Test features:');
    console.log('   - Add product with data allowance');
    console.log('   - Test stock management');
    console.log('   - Check low stock alerts in admin');
    console.log('\n🚀 Ready for production!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📋 You can run this migration manually via Neon Console:');
    console.log('1. Go to https://console.neon.tech');
    console.log('2. Select your database');
    console.log('3. Open SQL Editor');
    console.log('4. Run: ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "data" TEXT;');
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

migrate();