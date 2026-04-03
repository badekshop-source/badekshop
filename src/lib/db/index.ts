// src/lib/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

// Initialize database connection only if connectionString is available
const initializeDb = () => {
  if (!connectionString) {
    // During build or if no connection string, return undefined
    // This allows TypeScript to work but will cause runtime errors if used without DB
    return undefined as any;
  }
  
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
};

export const db = initializeDb();