# Deployment Instructions

## Phase 1 Critical Features - Deployment Guide

### ✅ Code Already Deployed

The code has been committed and pushed to GitHub:
- **Commit:** `4e062964`
- **Message:** "feat: implement Phase 1 critical features for launch readiness"
- **Status:** Pushed to `main` branch ✅

---

## Required: Database Migration

### Option A: Using Neon Console (Recommended)

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Open SQL Editor
4. Run this migration:

```sql
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "data" TEXT;
```

5. Verify the column was added:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'data';
```

### Option B: Using Drizzle Kit Locally

If you have DATABASE_URL set up in your local `.env.local`:

```bash
# Install dotenv-cli (if not installed)
npm install -g dotenv-cli

# Run migration with env loaded
dotenv -e .env.local -- npx drizzle-kit push
```

### Option C: Using SQL Script Directly

1. Connect to your Neon database:
```bash
psql $DATABASE_URL
```

2. Run the migration:
```sql
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "data" TEXT;
```

---

## Post-Deployment Testing Checklist

### 1. Stock Management Testing

#### Test Out-of-Stock Blocking

```bash
# Via Neon Console or psql:
UPDATE products SET stock = 0 WHERE name = 'Test Product';

# Then try to checkout this product
# Expected: Error "Product is currently out of stock"
```

#### Test Low Stock Alert

1. Login to admin panel: `https://your-domain.com/admin/login`
2. Create/edit products with stock ≤ 10
3. Verify low stock alert appears on dashboard
4. Check color coding in products table:
   - Red: stock = 0
   - Orange: stock ≤ 5
   - Black: stock > 5

#### Test Stock Decrement

1. Create product with stock = 5
2. Place an order for this product
3. Check stock decreased to 4 in database:
```sql
SELECT name, stock FROM products WHERE id = 'product-id';
```

### 2. Product Data Field Testing

#### Add Data Allowance to Product

1. Go to Admin Panel > Products > Add New
2. Fill in product details
3. Select "Data Allowance":
   - Unlimited
   - 1GB, 3GB, 5GB, 10GB, 20GB, 50GB, 100GB
4. Save product
5. Verify on landing page:
   - Product card shows: "14 Days • Unlimited"
   - Or: "7 Days • 5GB"

#### Edit Existing Product

1. Go to Admin Panel > Products > Edit
2. Update data field
3. Save changes
4. Verify change reflects on storefront

### 3. Legal Pages Testing

#### Terms of Service

1. Visit: `https://your-domain.com/terms`
2. Verify content is complete and readable
3. Check all sections are displayed:
   - Service Description
   - Eligibility
   - Ordering & Payment
   - KYC Requirements
   - etc.

#### Privacy Policy

1. Visit: `https://your-domain.com/privacy-policy`
2. Verify content is complete
3. Check GDPR compliance sections:
   - Data Collection
   - Data Usage
   - Data Storage & Security
   - Your Rights (GDPR)

#### Footer Links

1. Scroll to footer
2. Click "Privacy Policy" link
3. Verify it navigates to `/privacy-policy`
4. Click "Terms of Service" link
5. Verify it navigates to `/terms`

---

## Vercel Deployment (If Not Auto-Deployed)

### Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? Yes
# - Select your badekshop project
# - Confirm deployment
```

### Deploy via GitHub Integration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `badekshop` project
3. Settings > Git > Production Branch: `main`
4. Deployments will auto-trigger on git push ✅

---

## Environment Variables Checklist

Ensure these are set in Vercel Dashboard:

- `DATABASE_URL` - Neon PostgreSQL connection string ✅
- `BETTER_AUTH_SECRET` - Auth secret ✅
- `BETTER_AUTH_URL` - Your domain URL
- `MIDTRANS_SERVER_KEY` - Midtrans server key ✅
- `MIDTRANS_CLIENT_KEY` - Midtrans client key ✅
- `MIDTRANS_MODE` - `sandbox` or `production`
- `CLOUDINARY_CLOUD_NAME` - Cloudinary credentials ✅
- `CLOUDINARY_API_KEY` ✅
- `CLOUDINARY_API_SECRET` ✅
- `RESEND_API_KEY` - Email API key ✅
- `NEXT_PUBLIC_APP_URL` - Your production URL ✅
- `CRON_SECRET` - For cron endpoint auth ✅

---

## Verification Commands

### Check Deployment Status

```bash
# Via Vercel CLI
vercel ls

# Or visit: https://vercel.com/dashboard
```

### Check Database Connection

```sql
-- Verify products table has 'data' column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Should include:
-- | data        | text            | YES |
```

### Test Stock Query

```sql
-- Find products with low stock
SELECT name, stock 
FROM products 
WHERE stock <= 10 AND is_active = true 
ORDER BY stock ASC 
LIMIT 5;
```

---

## Rollback Plan (If Issues Arise)

### Remove 'data' Column (Migration Rollback)

```sql
-- Only if needed to rollback
ALTER TABLE "products" DROP COLUMN IF EXISTS "data";
```

### Revert Code Changes

```bash
# Rollback to previous commit
git revert 4e062964
git push origin main
```

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Neon database logs
3. Verify environment variables in Vercel dashboard
4. Test locally with `npm run dev`
5. Check browser console for errors

---

## Next Steps After Deployment

1. ✅ Run database migration (add 'data' column)
2. ✅ Verify Vercel deployment successful
3. ✅ Test stock management features
4. ✅ Test product data field
5. ✅ Verify legal pages accessible
6. ✅ Monitor for errors in Vercel logs
7. ✅ Test production checkout flow
8. ✅ Verify low stock alerts work

**Priority:** Run database migration first before testing features!