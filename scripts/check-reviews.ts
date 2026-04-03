// scripts/check-reviews.ts
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(connectionString);

const checkReviews = async () => {
  try {
    const reviews = await sql`SELECT * FROM reviews LIMIT 5`;
    console.log('Reviews found:', reviews.length);
    console.log(JSON.stringify(reviews, null, 2));
  } catch (error) {
    console.error('Error checking reviews:', error);
  }
};

checkReviews();
