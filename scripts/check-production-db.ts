import { config } from 'dotenv';
import { resolve } from 'path';
import pkg from 'pg';
const { Client } = pkg;

config({ path: resolve(process.cwd(), '.env.local') });

async function checkDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    console.log('\n📋 To fix:');
    console.log('1. Check your .env.local file has DATABASE_URL');
    console.log('2. For Vercel: Add DATABASE_URL to Environment Variables');
    process.exit(1);
  }

  console.log('✓ DATABASE_URL found:', databaseUrl.substring(0, 50) + '...\n');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: true }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Check products table structure
    const tableCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Products table columns:');
    console.table(tableCheck.rows);

    // Check for 'data' column specifically
    const dataColumn = tableCheck.rows.find(col => col.column_name === 'data');
    if (dataColumn) {
      console.log('✅ "data" column exists in products table');
    } else {
      console.error('❌ "data" column NOT found in products table');
      console.log('\n📋 Migration required! Run:');
      console.log('ALTER TABLE "products" ADD COLUMN "data" TEXT;');
    }

    // Check for 'badge' column
    const badgeColumn = tableCheck.rows.find(col => col.column_name === 'badge');
    if (badgeColumn) {
      console.log('✅ "badge" column exists in products table');
    } else {
      console.error('❌ "badge" column NOT found in products table');
    }

    // Check for 'stock' column
    const stockColumn = tableCheck.rows.find(col => col.column_name === 'stock');
    if (stockColumn) {
      console.log('✅ "stock" column exists in products table');
    } else {
      console.error('❌ "stock" column NOT found in products table');
    }

    // Check sample products
    const productsSample = await client.query(`
      SELECT name, stock, data, badge FROM products LIMIT 5;
    `);

    console.log('\n📦 Sample products:');
    console.table(productsSample.rows);

  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.log('\n📋 Common fixes:');
    console.log('1. Check DATABASE_URL is correct');
    console.log('2. Check Neon database is not paused');
    console.log('3. Check network/firewall allows connection');
  } finally {
    await client.end();
  }
}

checkDatabase();