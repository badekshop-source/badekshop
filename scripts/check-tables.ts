// scripts/check-tables.ts
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(connectionString);

const checkTables = async () => {
  console.log('Checking database tables...\n');

  // List all tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  
  console.log('Tables found:');
  tables.forEach((t: any) => console.log(`  - ${t.table_name}`));
  
  // Check products columns
  console.log('\nProducts table columns:');
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'products'
  `;
  columns.forEach((c: any) => console.log(`  - ${c.column_name}: ${c.data_type}`));
};

checkTables().catch(console.error);
