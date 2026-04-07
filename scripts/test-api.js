// Quick API Test for Local/Production
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 Testing API endpoints...\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  // Test 1: Products API
  console.log('📦 Test 1: Products API');
  try {
    const productsRes = await fetch(`${API_URL}/api/products?active=true`);
    const productsData = await productsRes.json();
    
    if (productsRes.ok) {
      console.log(`✅ Products API working - Found ${productsData.products?.length || 0} products`);
    } else {
      console.log(`❌ Products API failed - Status: ${productsRes.status}`);
      console.log(`   Error: ${productsData.error || 'Unknown error'}`);
      if (productsData.details) {
        console.log(`   Details: ${JSON.stringify(productsData.details)}`);
      }
    }
  } catch (err) {
    console.log(`❌ Products API failed - ${err.message}`);
  }

  console.log('');

  // Test 2: Check Environment
  console.log('🔧 Test 2: Environment Check');
  console.log('Checking if running locally or production...');
  if (API_URL.includes('localhost')) {
    console.log('✅ Running locally (development)');
    console.log('   Make sure: npm run dev is running');
  } else {
    console.log('✅ Running in production');
    console.log('   Make sure: Environment variables are set in Vercel');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Payment API (requires order)
  console.log('💳 Test 3: Payment API Test');
  console.log('ℹ️  Payment API requires an order ID');
  console.log('   Skipping direct payment test');
  console.log('   To test payment:');
  console.log('   1. Create an order via checkout');
  console.log('   2. Use the returned order ID');
  console.log('   3. Call POST /api/orders/{orderId}/payment');

  console.log('\n' + '='.repeat(50) + '\n');

  console.log('✨ Quick Test Summary:\n');
  console.log('If Products API failed with "Database not connected":');
  console.log('  → Check DATABASE_URL in Vercel env vars\n');
  console.log('If Products API failed with other error:');
  console.log('  → Check Vercel function logs for details\n');
  console.log('If Products API succeeded:');
  console.log('  → Database connection is working');
  console.log('  → Check payment errors separately\n');
}

testAPIs().catch(console.error);

// Usage:
// Local: node scripts/test-api.js
// With production URL: NEXT_PUBLIC_APP_URL=https://your-domain.com node scripts/test-api.js