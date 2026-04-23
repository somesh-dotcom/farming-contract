# Backend Deployment Guide - Railway & Render

## Overview
This guide will help you deploy your Java Spring Boot backend to either Railway or Render and connect it with your Vercel-deployed frontend.

## Prerequisites
- GitHub account
- Railway or Render account
- Your frontend already deployed on Vercel (https://client-chi-lilac.vercel.app)

---

## Option 1: Deploy to Railway (Recommended)

### Step 1: Prepare Your Repository
1. Push your code to GitHub:
```bash
git add .
git commit -m "Prepare for backend deployment"
git push origin main
```

### Step 2: Create Railway Project
1. Go to [Railway](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 3: Configure Railway Environment Variables
In your Railway project dashboard, add these environment variables:

```
DATABASE_URL=postgresql://postgres:password@postgres-IFzD.railway.internal:5432/railway
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-for-security
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://client-chi-lilac.vercel.app
PORT=8080
```

**Important**: Replace `https://client-chi-lilac.vercel.app` with your actual Vercel URL if different.

### Step 4: Add PostgreSQL Database
1. In Railway, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically provision a database
4. Copy the `DATABASE_URL` from the database service
5. Update the `DATABASE_URL` environment variable in your backend service

### Step 5: Deploy
Railway will automatically build and deploy your backend using the `railway.json` configuration.

### Step 6: Get Your Backend URL
After deployment, Railway will provide you with a public URL like:
```
https://your-backend-app.railway.app
```

---

## Option 2: Deploy to Render

### Step 1: Push to GitHub
Make sure your code is pushed to GitHub.

### Step 2: Create Render Web Service
1. Go to [Render](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: agri-trading-backend
   - **Root Directory**: server-java
   - **Environment**: Java
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`

### Step 3: Add PostgreSQL Database
1. In Render, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: agri-trading-db
   - **Database Name**: contract_farming
   - **User**: agri_admin
3. Click "Create Database"

### Step 4: Configure Environment Variables
In your web service settings, add these environment variables:

```
JAVA_VERSION=17
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-for-security
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://client-chi-lilac.vercel.app
PORT=8080
DATABASE_URL=<copy from your PostgreSQL database>
```

### Step 5: Deploy
Click "Create Web Service" and Render will build and deploy your backend.

### Step 6: Get Your Backend URL
After deployment, you'll get a URL like:
```
https://agri-trading-backend.onrender.com
```

---

## Connect Frontend to Backend

### Step 1: Update Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Add or update:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (Replace with your actual backend URL from Railway or Render)

### Step 2: Redeploy Frontend
Trigger a new deployment on Vercel to apply the environment variable changes:
```bash
cd client
git add .
git commit -m "Update API URL for production"
git push origin main
```

### Step 3: Verify Connection
1. Visit your Vercel frontend URL
2. Open browser console (F12)
3. Check for CORS errors
4. Try logging in or accessing any API feature

---

## Testing Your Deployment

### Test Health Endpoint
Visit: `https://your-backend-url.railway.app/api/health`

You should see:
```json
{
  "status": "UP",
  "message": "Agricultural Trading Platform Backend is running",
  "timestamp": "2026-04-23T12:00:00.000Z"
}
```

### Test API Endpoints
- **Login**: `POST https://your-backend-url.railway.app/api/auth/login`
- **Products**: `GET https://your-backend-url.railway.app/api/products`
- **Market Prices**: `GET https://your-backend-url.railway.app/api/market-prices`

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Verify `CORS_ALLOWED_ORIGINS` includes your Vercel URL
2. Make sure there are no spaces in the CORS_ALLOWED_ORIGINS value
3. Redeploy your backend after changing environment variables

### Database Connection Errors
1. Verify `DATABASE_URL` is correct
2. Check that PostgreSQL database is running
3. Ensure database credentials are correct

### Backend Not Starting
1. Check logs in Railway/Render dashboard
2. Verify all environment variables are set
3. Ensure `PORT` environment variable is set to 8080

### Frontend Can't Connect
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check that backend URL is accessible (test in browser)
3. Redeploy frontend after updating environment variables

---

## Production Checklist

- [ ] Backend deployed to Railway/Render
- [ ] PostgreSQL database provisioned and connected
- [ ] `CORS_ALLOWED_ORIGINS` includes Vercel frontend URL
- [ ] `JWT_SECRET` is a strong, unique value
- [ ] Frontend `VITE_API_URL` points to backend URL
- [ ] Health endpoint returns "UP" status
- [ ] Login/registration works
- [ ] All API endpoints accessible
- [ ] No CORS errors in browser console

---

## Quick Commands

### Local Testing
```bash
# Start backend
cd server-java
mvn spring-boot:run

# Start frontend
cd client
npm run dev
```

### Deploy
```bash
git add .
git commit -m "Update deployment configuration"
git push origin main
```

---

## Support

If you encounter issues:
1. Check Railway/Render logs for error messages
2. Verify all environment variables are set correctly
3. Test backend endpoints directly using Postman or browser
4. Check browser console for CORS or network errors

Your backend is now configured to work with dynamic CORS origins from environment variables, making it easy to deploy to any cloud platform!
