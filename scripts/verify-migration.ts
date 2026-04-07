import { config } from 'dotenv';
import { resolve } from 'path';
import pkg from 'pg';
const { Client } = pkg;

config({ path: resolve(process.cwd(), '.env.local') });

async function verify() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Verify data column exists
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `);

    console.log('📋 Products table structure:\n');
    console.table(columns.rows);

    // Check stock column
    const stockCheck = await client.query(`
      SELECT name, stock, data
      FROM products
      LIMIT 5;
    `);

    if (stockCheck.rows.length > 0) {
      console.log('\n📊 Sample products with stock and data:\n');
      console.table(stockCheck.rows);
    } else {
      console.log('\n⚠️  No products found in database');
      console.log('Run seed script: npm run db:seed\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verify();