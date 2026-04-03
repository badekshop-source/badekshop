// scripts/create-tables.ts
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(connectionString);

const createTables = async () => {
  console.log('Creating tables...');
  
  // Profiles table
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      email_verified TIMESTAMP,
      name TEXT,
      phone TEXT,
      address TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ profiles table created');

  // Products table
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      duration INTEGER,
      size TEXT,
      price INTEGER NOT NULL,
      discount_percentage INTEGER DEFAULT 0,
      discount_start TIMESTAMP,
      discount_end TIMESTAMP,
      stock INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ products table created');

  // Orders table
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      user_id UUID REFERENCES profiles(id),
      full_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      nationality TEXT NOT NULL,
      arrival_date TIMESTAMP NOT NULL,
      flight_number TEXT NOT NULL,
      product_id UUID REFERENCES products(id),
      quantity INTEGER DEFAULT 1,
      subtotal INTEGER NOT NULL,
      discount INTEGER DEFAULT 0,
      tax INTEGER DEFAULT 0,
      total INTEGER NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      payment_gateway_id TEXT,
      order_status TEXT DEFAULT 'pending',
      kyc_status TEXT DEFAULT 'pending',
      kyc_attempts INTEGER DEFAULT 0,
      imei_number TEXT,
      access_token TEXT NOT NULL,
      token_expires_at TIMESTAMP,
      qr_code_data TEXT,
      passport_public_id TEXT,
      passport_url TEXT,
      refund_amount INTEGER,
      refund_reason TEXT,
      refund_status TEXT,
      activation_outlet TEXT DEFAULT 'Ngurah Rai Airport',
      notes TEXT,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ orders table created');

  // KYC Documents table
  await sql`
    CREATE TABLE IF NOT EXISTS kyc_documents (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      order_id UUID NOT NULL REFERENCES orders(id),
      passport_public_id TEXT NOT NULL,
      document_type TEXT DEFAULT 'passport',
      verification_status TEXT DEFAULT 'pending',
      verified_by UUID REFERENCES profiles(id),
      verification_notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ kyc_documents table created');

  // Reviews table
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      order_id UUID NOT NULL REFERENCES orders(id),
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      country TEXT NOT NULL,
      rating INTEGER NOT NULL,
      trip_type TEXT NOT NULL,
      trip_duration TEXT NOT NULL,
      review_text TEXT NOT NULL,
      is_approved BOOLEAN DEFAULT false,
      reviewed_at TIMESTAMP DEFAULT NOW() NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ reviews table created');

  // Admin logs table
  await sql`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      admin_id UUID NOT NULL REFERENCES profiles(id),
      action TEXT NOT NULL,
      target_id TEXT,
      target_type TEXT,
      details JSONB,
      ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ admin_logs table created');

  // Refund policies table
  await sql`
    CREATE TABLE IF NOT EXISTS refund_policies (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_enabled BOOLEAN DEFAULT true,
      admin_fee_type TEXT DEFAULT 'percentage',
      admin_fee_value INTEGER DEFAULT 0,
      auto_refund_on_expiry BOOLEAN DEFAULT false,
      auto_refund_on_rejection BOOLEAN DEFAULT false,
      auto_refund_on_cancellation BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✓ refund_policies table created');

  console.log('\n✅ All tables created successfully!');
};

createTables().catch(console.error);
