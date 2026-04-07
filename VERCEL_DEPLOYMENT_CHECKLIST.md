# 🚀 Vercel Deployment Checklist

## Current Status
✅ **Local environment is complete** - All variables set in `.env.local`
✅ **Database migrated** - `data` column added successfully
✅ **Code deployed** - Payment error handling improved

❌ **Vercel environment needs setup** - Missing environment variables

---

## Step-by-Step Fix

### Step 1: Copy Environment Variables from Local

Your `.env.local` file has all required values. Let's copy them to Vercel.

#### Option A: Manual Copy (Recommended)

Open your `.env.local` file and copy each value:

```bash
# View your .env.local
cat .env.local
```

You'll see:
```bash
DATABASE_URL="postgresql://neondb_owner:..."
BETTER_AUTH_SECRET="kv06b8ODY0KuFa5k7Jf..."
BETTER_AUTH_URL="http://localhost:3000"
MIDTRANS_SERVER_KEY="SB-Mid-server-Hc4J4ZVaA..."
MIDTRANS_CLIENT_KEY="SB-Mid-client-L4o7Zas3m..."
MIDTRANS_MODE="sandbox"
CLOUDINARY_CLOUD_NAME="badekshop"
CLOUDINARY_API_KEY="174635284156651"
CLOUDINARY_API_SECRET="WDoCnaTYcpZmb80vXgO..."
RESEND_API_KEY="re_ZJ1rSzbA_5R2Fuzg..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
KV_URL="..."
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
```

**⚠️ IMPORTANT:** Change `http://localhost:3000` to `https://badekshop.vercel.app` for production!

---

### Step 2: Add Variables to Vercel

1. **Open Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your `badekshop` project
   - Go to **Settings** → **Environment Variables**

2. **Add Each Variable:**

For **each** variable, do this:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_Nywz40BXKTuk@...` | Production, Preview, Development |
| `BETTER_AUTH_SECRET` | `kv06b8ODY0KuFa5k7Jf...` | Production, Preview, Development |
| `BETTER_AUTH_URL` | `https://badekshop.vercel.app` | Production |
| `BETTER_AUTH_URL` | `http://localhost:3000` | Preview, Development |
| `MIDTRANS_SERVER_KEY` | `SB-Mid-server-Hc4J4ZVaA...` | Production, Preview, Development |
| `MIDTRANS_CLIENT_KEY` | `SB-Mid-client-L4o7Zas3m...` | Production, Preview, Development |
| `MIDTRANS_MODE` | `sandbox` | Production, Preview, Development |
| `CLOUDINARY_CLOUD_NAME` | `badekshop` | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | `174635284156651` | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | `WDoCnaTYcpZmb80vXgO...` | Production, Preview, Development |
| `RESEND_API_KEY` | `re_ZJ1rSzbA_5R2Fuzg...` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://badekshop.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |

**Note about `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`:**
- For **Production**: Use your Vercel domain (e.g., `https://badekshop.vercel.app`)
- For **Development/Preview**: Use `http://localhost:3000`

3. **⏺️ How to Add Variable:**
   - Enter Name: `DATABASE_URL`
   - Enter Value: paste from `.env.local`
   - Select Environments: **Production**, **Preview**, **Development**
   - Click **Add**

4. **Repeat for all 13 variables**

---

### Step 3: Redeploy Vercel

After adding all variables:

1. **Option A: Trigger Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

2. **Option B: Push New Commit**
   ```bash
   git commit --allow-empty -m "trigger redeploy after env vars"
   git push
   ```

---

### Step 4: Verify Deployment

1. **Check Deployment Status**
   - Wait for deployment to complete (2-3 minutes)
   - Status should change to "Ready"

2. **Test API Endpoints**
   - Visit: `https://badekshop.vercel.app/api/products?active=true`
   - Should return JSON with products
   - No more 500 errors

3. **Test Payment Flow**
   - Go to your site
   - Try checkout
   - Should redirect to Midtrans payment page

4. **Check Vercel Logs**
   - Go to deployment → **Functions** tab
   - Look for: `[Midtrans] Creating transaction...`
   - No more generic error messages

---

## Quick Commands

### Get Values from .env.local
```bash
# Show all values (masked for security)
grep "=" .env.local

# Copy for Vercel
cat .env.local
```

### Test Local API
```bash
# Start dev server
npm run dev

# In another terminal, test API
node scripts/test-api.js
```

### Check Production Database
```bash
npx tsx scripts/check-production-db.ts
```

---

## Checklist Before Redeploying

- [ ] DATABASE_URL added to Vercel
- [ ] BETTER_AUTH_SECRET added to Vercel
- [ ] BETTER_AUTH_URL set to `https://badekshop.vercel.app` (Production)
- [ ] MIDTRANS_SERVER_KEY added to Vercel
- [ ] MIDTRANS_CLIENT_KEY added to Vercel
- [ ] MIDTRANS_MODE set to `sandbox`
- [ ] CLOUDINARY_CLOUD_NAME added to Vercel
- [ ] CLOUDINARY_API_KEY added to Vercel
- [ ] CLOUDINARY_API_SECRET added to Vercel
- [ ] RESEND_API_KEY added to Vercel
- [ ] NEXT_PUBLIC_APP_URL set to `https://badekshop.vercel.app` (Production)
- [ ] All variables set for Production, Preview, Development
- [ ] Redeployed Vercel project
- [ ] Tested `/api/products` endpoint
- [ ] Tested payment flow

---

## Common Issues

### Issue 1: "500 Internal Server Error" on all APIs
**Cause:** Missing `DATABASE_URL`
**Fix:** Add `DATABASE_URL` to Vercel env vars

### Issue 2: "Payment gateway configuration error"
**Cause:** Missing Midtrans keys
**Fix:** Add all three: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_MODE`

### Issue 3: Still seeing errors after adding vars
**Cause:** Didn't redeploy
**Fix:** Trigger new deployment in Vercel

### Issue 4: Works locally but not on Vercel
**Cause:** `BETTER_AUTH_URL` or `NEXT_PUBLIC_APP_URL` pointing to localhost on production
**Fix:** Set to `https://badekshop.vercel.app` for Production environment

---

## Need Help?

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Your Project → Deployments → [Latest] → Functions
   - Look for error messages with `[Midtrans]` prefix

2. **Test Individual Endpoints:**
   - Visit `/api/products?active=true` in browser
   - Should return JSON, not 500 error

3. **Share Error Logs:**
   - Copy specific error message from Vercel logs
   - I can help identify the missing variable

---

## 📊 Expected Results After Fix

✅ `/api/products?active=true` returns product list
✅ `/api/orders/[id]/payment` redirects to Midtrans
✅ No more 500 errors
✅ Vercel logs show `[Midtrans] Creating transaction...`
✅ Payment flow works end-to-end