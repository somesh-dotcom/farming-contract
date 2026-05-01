# 🔧 Fix Vercel Login Issue - SSO Protection

## Problem:
The backend API has **Vercel Authentication (SSO)** enabled, which prevents the frontend from making API calls.

## Solution: Disable Deployment Protection

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your team: `mounikaramavathi90-2042s-projects`

2. **Open Backend Project Settings**
   - Click on the `server` project
   - Go to **Settings** tab (top navigation)
   - Click on **Deployment Protection** in the left sidebar

3. **Disable Protection**
   - Find **"Vercel Authentication"** or **"Deployment Protection"**
   - Toggle it to **OFF**
   - Or select **"None"** from the protection level dropdown
   - Click **Save**

4. **Test the API**
   - Visit: https://server-theta-lime-34.vercel.app/api/health
   - You should see: `{"status":"ok","message":"Contract Farming API is running"}`

### Option 2: Use Protection Bypass Token

If you want to keep protection but allow API access:

1. **Get Bypass Token**
   - Go to: https://vercel.com/dashboard
   - Select `server` project → Settings → Deployment Protection
   - Find **"Protection Bypass"** section
   - Copy the bypass token

2. **Update Frontend .env**
   ```
   VITE_API_URL=https://server-theta-lime-34.vercel.app?x-vercel-protection-bypass=YOUR_TOKEN_HERE
   ```

### Option 3: Use Railway or Render (Alternative)

If Vercel SSO keeps causing issues, deploy the backend to:
- **Railway**: https://railway.app (free tier available)
- **Render**: https://render.com (free tier available)
- These platforms don't have SSO protection by default

## After Disabling SSO:

1. **Test Backend API**:
   ```bash
   curl https://server-theta-lime-34.vercel.app/api/health
   ```

2. **Test Login**:
   ```bash
   curl -X POST https://server-theta-lime-34.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo.buyer@test.com","password":"demo123"}'
   ```

3. **Frontend URLs**:
   - Production: https://client-opal-beta-80.vercel.app
   - It will automatically connect to the backend

## Current URLs:
- **Frontend**: https://client-opal-beta-80.vercel.app ✅
- **Backend**: https://server-theta-lime-34.vercel.app ⚠️ (SSO Protected)

## Quick Fix Steps:
1. ✅ Login to https://vercel.com
2. ✅ Go to `server` project settings
3. ✅ Disable "Deployment Protection"
4. ✅ Test login on frontend

---

**Note**: The SSO protection was enabled automatically by Vercel. This is common for new deployments. Disabling it is safe for production APIs that have their own authentication (JWT tokens).
