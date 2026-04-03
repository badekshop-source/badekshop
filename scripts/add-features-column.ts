// scripts/add-features-column.ts
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(connectionString);

const productFeatures = [
  "Speed: 4G/LTE/5G",
  "Valid for 30 Days", 
  "Free Activation at Our Counter"
];

const addFeatures = async () => {
  console.log('Adding features column and updating products...\n');

  try {
    // Check if features column exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'features'
    `;

    if (columnExists.length === 0) {
      // Add features column
      await sql`ALTER TABLE products ADD COLUMN features JSONB`;
      console.log('✓ Features column added');
    } else {
      console.log('✓ Features column already exists');
    }

    // Update all products with features
    const products = await sql`SELECT id, name FROM products`;
    
    for (const product of products) {
      await sql`
        UPDATE products 
        SET features = ${JSON.stringify(productFeatures)}
        WHERE id = ${product.id}
      `;
      console.log(`✓ Updated: ${product.name}`);
    }

    console.log('\n✅ All products updated with features!');
    console.log('\nFeatures added:');
    productFeatures.forEach(f => console.log(`  • ${f}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addFeatures();