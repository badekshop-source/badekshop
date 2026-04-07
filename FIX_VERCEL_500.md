# 🚨 URGENT: Fix Vercel 500 Errors

## Problem

All API endpoints are returning 500 errors in production:
- `/api/products?active=true` - 500
- `/api/orders/[id]/payment` - 500

This is caused by **missing or incorrect environment variables in Vercel**.

---

## ✅ Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard

1. Open https://vercel.com/dashboard
2. Select your **badekshop** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add All Required Variables

Copy these from your `.env.local` file:

#### **Required for Database:**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_Nywz40BXKTuk@ep-frosty-mode-a7clcor8-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### **Required for Authentication:**
```bash
BETTER_AUTH_SECRET=<your-secret-key>
BETTER_AUTH_URL=https://badekshop.vercel.app
```

#### **Required for Payments:**
```bash
MIDTRANS_SERVER_KEY=SB-Mid-server-Hc4J4ZVaA-SR_xK00KzgBBZg
MIDTRANS_CLIENT_KEY=SB-Mid-client-L4o7Zas3m95PJ2ck
MIDTRANS_MODE=sandbox
```

#### **Required for File Upload:**
```bash
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

#### **Required for Email:**
```bash
RESEND_API_KEY=<your-resend-key>
```

#### **Required for App:**
```bash
NEXT_PUBLIC_APP_URL=https://badekshop.vercel.app
```

#### **Optional for Rate Limiting:**
```bash
KV_URL=<your-kv-url>
KV_REST_API_URL=<your-kv-rest-api>
KV_REST_API_TOKEN=<your-kv-token>
```

---

### Step 3: Set Environment for Each Variable

For each variable:
1. **Name**: `<KEY>` (e.g., `DATABASE_URL`)
2. **Value**: `<value>` (copy from `.env.local`)
3. **Environment**: Select **Production**, **Preview**, and **Development**

---

### Step 4: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Select **Redeploy**

OR trigger a new deployment:
```bash
git commit --allow-empty -m "trigger redeploy" && git push
```

---

## 🔍 How to Verify

### Check Vercel Logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click on latest deployment
4. Go to **Functions** tab
5. Look for your API calls
6. Check for error messages

### Expected Logs After Fix:
```
[Midtrans] Creating transaction for order: ORD-123, amount: 500000
[Midtrans] Transaction created successfully: abc123
```

### If Still Getting 500:

Check Vercel function logs for:
1. `❌ DATABASE_URL not found` → Add DATABASE_URL
2. `❌ Midtrans keys not configured` → Add MIDTRANS_SERVER_KEY, CLIENT_KEY, MODE
3. `Database not connected` → Check DATABASE_URL format

---

## 🧪 Test Locally

To ensure your local setup works:

```bash
# Start dev server
npm run dev

# In another terminal, test API:
curl http://localhost:3000/api/products?active=true

# Should return:
{
  "success": true,
  "products": [...]
}
```

---

## 📋 Environment Variables Checklist

Print and check off each:

- [ ] `DATABASE_URL` ✅ (Required)
- [ ] `BETTER_AUTH_SECRET` ✅ (Required)
- [ ] `BETTER_AUTH_URL` ✅ (Required)
- [ ] `MIDTRANS_SERVER_KEY` ✅ (Required)
- [ ] `MIDTRANS_CLIENT_KEY` ✅ (Required)
- [ ] `MIDTRANS_MODE` ✅ (Required)
- [ ] `CLOUDINARY_CLOUD_NAME` ✅ (Required)
- [ ] `CLOUDINARY_API_KEY` ✅ (Required)
- [ ] `CLOUDINARY_API_SECRET` ✅ (Required)
- [ ] `RESEND_API_KEY` ✅ (Required)
- [ ] `NEXT_PUBLIC_APP_URL` ✅ (Required)
- [ ] `KV_URL` ⚪ (Optional - for rate limiting)

---

## 🚨 Common Issues

### Issue 1: "Database not connected"
**Cause**: Missing DATABASE_URL
**Fix**: Add DATABASE_URL to Vercel env vars

### Issue 2: "Payment gateway configuration error"
**Cause**: Missing MIDTRANS keys
**Fix**: Add all three: SERVER_KEY, CLIENT_KEY, MODE

### Issue 3: "Authentication failed"
**Cause**: Missing BETTER_AUTH_SECRET or wrong URL
**Fix**: Add AUTH_SECRET and set URL to your Vercel domain

### Issue 4: "File upload failed"
**Cause**: Missing CLOUDINARY credentials
**Fix**: Add all three: CLOUD_NAME, API_KEY, API_SECRET

---

## 🎯 Quick Fix Commands

### Copy .env.local Values:
```bash
# Get your .env.local values
cat .env.local

# You'll see all values like:
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
# etc.
```

### Then in Vercel Dashboard:
1. Settings → Environment Variables
2. Add each KEY=VALUE pair
3. Select all three environments (Production, Preview, Development)
4. Save

---

## ✅ After Adding Variables

1. **Redeploy** your Vercel project
2. **Test** the payment flow
3. **Check logs** for success messages

---

## 📞 Need Help?

If you see specific error messages in Vercel logs:
1. Copy the full error stack trace
2. Check which variable is missing or incorrect
3. Update the environment variable
4. Redeploy

The most common issue is **DATABASE_URL** or **MIDTRANS** keys not being set in Vercel!