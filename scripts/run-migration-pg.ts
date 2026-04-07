import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔄 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected\n');

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
      console.log('✅ Added "data" column\n');
    }
    
    // Verify
    const verifyResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'data';
    `);
    
    console.log('✅ Verification:');
    console.table(verifyResult.rows);
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run: npm run build');
    console.log('2. Deploy to Vercel: vercel --prod');
    console.log('3. Test features on production');
    console.log('4. Check admin dashboard for low stock alerts');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();