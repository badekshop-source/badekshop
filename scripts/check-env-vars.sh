#!/bin/bash

# Vercel Environment Variables Checker
# Run this script to verify all required variables

echo "🔍 Checking Environment Variables..."
echo ""

# Required variables
declare -a required_vars=(
    "DATABASE_URL"
    "BETTER_AUTH_SECRET"
    "BETTER_AUTH_URL"
    "MIDTRANS_SERVER_KEY"
    "MIDTRANS_CLIENT_KEY"
    "MIDTRANS_MODE"
    "CLOUDINARY_CLOUD_NAME"
    "CLOUDINARY_API_KEY"
    "CLOUDINARY_API_SECRET"
    "RESEND_API_KEY"
    "NEXT_PUBLIC_APP_URL"
)

# Optional variables
declare -a optional_vars=(
    "KV_URL"
    "KV_REST_API_URL"
    "KV_REST_API_TOKEN"
)

echo "📋 Checking .env.local file..."
echo ""

if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "   Create one with: cp .env.example .env.local"
    exit 1
fi

echo "✅ .env.local file found"
echo ""

echo "🔍 Checking required variables:"
echo ""

missing_required=()
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env.local; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2-)
        # Check if value is empty or placeholder
        if [ -z "$value" ] || [[ "$value" == *"your-"* ]] || [[ "$value" == *"xxxx"* ]]; then
            echo "⚠️  $var - FOUND but value looks like placeholder"
            missing_required+=("$var")
        else
            # Mask sensitive values
            if [[ "$var" == *"KEY"* ]] || [[ "$var" == *"SECRET"* ]] || [[ "$var" == *"URL"* ]]; then
                echo "✅ $var = ${value:0:20}... (masked)"
            else
                echo "✅ $var = $value"
            fi
        fi
    else
        echo "❌ $var - MISSING"
        missing_required+=("$var")
    fi
done

echo ""
echo "🔍 Checking optional variables:"
echo ""

for var in "${optional_vars[@]}"; do
    if grep -q "^${var}=" .env.local; then
        echo "✅ $var - Found (optional)"
    else
        echo "⚪ $var - Missing (optional)"
    fi
done

echo ""
echo "================================"
if [ ${#missing_required[@]} -eq 0 ]; then
    echo "✅ All required variables are set!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy these variables to Vercel Dashboard"
    echo "2. Go to: Settings → Environment Variables"
    echo "3. Add each variable"
    echo "4. Redeploy your Vercel project"
    echo ""
    echo "🚀 To test locally:"
    echo "   npm run dev"
    echo "   Then try the payment flow"
else
    echo "❌ Missing ${#missing_required[@]} required variable(s):"
    echo ""
    for var in "${missing_required[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📋 To fix:"
    echo "1. Add missing variables to .env.local"
    echo "2. Get values from your service dashboards:"
    echo "   - DATABASE_URL: Neon Dashboard"
    echo "   - BETTER_AUTH_SECRET: Generate with: openssl rand -hex 32"
    echo "   - MIDTRANS_KEYS: Midtrans Dashboard"
    echo "   - CLOUDINARY_KEYS: Cloudinary Dashboard"
    echo "   - RESEND_API_KEY: Resend Dashboard"
    echo ""
fi
echo "================================"