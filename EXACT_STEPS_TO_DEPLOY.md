# 🎯 EXACT STEPS TO DEPLOY - Follow This Guide

## Your Current Status
✅ Frontend: Deployed on Vercel (https://client-chi-lilac.vercel.app)  
❌ Backend: NOT deployed  
❌ Connection: NOT working  

## What I Fixed For You
✅ CORS now uses environment variables (was hardcoded to localhost)  
✅ Added health check endpoint  
✅ Updated deployment configuration files  
✅ Created comprehensive guides  

---

## 🚀 FOLLOW THESE EXACT STEPS (Railway - Recommended)

### STEP 1: Push Code to GitHub (2 minutes)

Open terminal and run:
```bash
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated"
git add .
git commit -m "Configure backend for cloud deployment with dynamic CORS"
git push origin main
```

---

### STEP 2: Deploy to Railway (5 minutes)

1. **Open Railway**
   - Go to: https://railway.app/
   - Login with GitHub

2. **Create New Project**
   - Click "New Project" button
   - Select "Deploy from GitHub repo"
   - Find and select your repository

3. **Add PostgreSQL Database**
   - In your project, click "+ New" button
   - Select "Database"
   - Click "Add PostgreSQL"
   - Wait 1-2 minutes for it to provision

4. **Configure Backend Service**
   - Click on your backend service (should be auto-detected)
   - Go to "Variables" tab
   - Add these variables one by one:

   ```
   Variable: JWT_SECRET
   Value: mysupersecretkey123456789012345678
   ```
   (Make it at least 32 characters - use any random string)

   ```
   Variable: CORS_ALLOWED_ORIGINS
   Value: https://client-chi-lilac.vercel.app
   ```
   (NO spaces, exact URL)

   ```
   Variable: PORT
   Value: 8080
   ```

   ```
   Variable: JAVA_VERSION
   Value: 17
   ```

5. **Link Database**
   - Click on PostgreSQL service
   - Go to "Variables" tab
   - Find and copy the `DATABASE_URL` value
   - Go back to backend service → Variables tab
   - Add:
   ```
   Variable: DATABASE_URL
   Value: <paste the DATABASE_URL you copied>
   ```

6. **Wait for Deployment**
   - Railway will automatically build and deploy
   - Takes 3-5 minutes
   - Watch the "Deployments" tab for progress
   - Wait until you see "Deployed"

7. **Get Your Backend URL**
   - Click on backend service
   - Go to "Settings" tab
   - Scroll to "Domains" section
   - Copy the URL (looks like: `https://agri-trading-backend-production.up.railway.app`)

---

### STEP 3: Update Vercel Frontend (2 minutes)

1. **Open Vercel**
   - Go to: https://vercel.com/
   - Select your frontend project

2. **Add Environment Variable**
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar
   - Find `VITE_API_URL` (or create new if doesn't exist)
   - Set value to your backend URL:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (Replace with your actual Railway URL)
   - Click "Save"

3. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Click "..." (three dots)
   - Select "Redeploy"
   - Wait for deployment to complete (1-2 minutes)

---

### STEP 4: Test Everything (2 minutes)

1. **Test Backend Health**
   - Open browser
   - Visit: `https://your-backend-url.railway.app/api/health`
   - Should show:
   ```json
   {
     "status": "UP",
     "message": "Agricultural Trading Platform Backend is running",
     "timestamp": "..."
   }
   ```

2. **Test Frontend Connection**
   - Visit: https://client-chi-lilac.vercel.app
   - Open browser console (F12 or right-click → Inspect)
   - Check for errors in Console tab
   - Should see NO CORS errors
   - Try logging in

3. **Run Automated Test** (Optional)
   ```bash
   bash test-backend-connection.sh https://your-backend-url.railway.app
   ```

---

## ✅ SUCCESS CHECKLIST

After completing all steps, verify:

- [ ] Backend deployed to Railway (status shows "Deployed")
- [ ] Health endpoint shows "UP" status
- [ ] `VITE_API_URL` set in Vercel
- [ ] Frontend redeployed with new env variable
- [ ] Frontend loads without errors
- [ ] Can login on production
- [ ] No CORS errors in browser console
- [ ] All features work (products, contracts, etc.)

If ALL checkboxes are ✅ → **YOU'RE DONE! 🎉**

---

## ❌ TROUBLESHOOTING

### Problem: Backend won't deploy
**Solution:**
1. Check "Deployments" tab for build logs
2. Look for error messages
3. Verify all environment variables are set
4. Make sure `PORT=8080` is configured

### Problem: Database connection error
**Solution:**
1. Copy `DATABASE_URL` from PostgreSQL service (not from somewhere else)
2. Make sure PostgreSQL status shows "Running"
3. Verify the URL format: `postgresql://user:password@host:port/db`

### Problem: CORS error in browser
**Solution:**
1. Check `CORS_ALLOWED_ORIGINS` in Railway
2. Must be EXACTLY: `https://client-chi-lilac.vercel.app`
3. NO spaces before or after
4. Redeploy backend after fixing

### Problem: Frontend shows network error
**Solution:**
1. Verify `VITE_API_URL` is correct in Vercel
2. Test backend URL directly in browser
3. Make sure you redeployed frontend after adding env variable
4. Check browser console for specific error messages

### Problem: Can't login
**Solution:**
1. Check if backend is running (test health endpoint)
2. Check browser console for errors
3. Verify database has users (might need to register first)
4. Check network tab in browser DevTools

---

## 📞 NEED MORE HELP?

### Read These Guides (in order):
1. `START_HERE.md` - Quick overview
2. `QUICK_DEPLOY.md` - Detailed steps
3. `BACKEND_DEPLOYMENT_GUIDE.md` - Complete reference

### Run Helper Scripts:
```bash
# Interactive deployment guide
bash deploy-backend.sh

# Test backend connection
bash test-backend-connection.sh <your-backend-url>
```

### Check Logs:
- **Railway**: Dashboard → Backend Service → "Deployments" → View logs
- **Vercel**: Dashboard → Project → "Deployments" → View logs
- **Browser**: F12 → Console tab

---

## 🎓 WHAT CHANGED IN YOUR CODE

### Files Modified:
1. `server-java/src/main/java/com/agri/trading/config/SecurityConfig.java`
   - Changed: CORS now reads from environment variable
   - Before: Hardcoded to localhost
   - After: Reads `CORS_ALLOWED_ORIGINS` from env

2. `server-java/src/main/java/com/agri/trading/controller/HealthController.java`
   - New file: Health check endpoint
   - URL: `/api/health`
   - Used by Railway to monitor your app

3. `railway.json` and `render.yaml`
   - Updated with health check configuration

### Files Created:
- Documentation files (guides you're reading now)
- Helper scripts (deploy-backend.sh, test-backend-connection.sh)
- `.env.production` for client

---

## 💡 IMPORTANT NOTES

1. **Environment Variables are Case-Sensitive**
   - `CORS_ALLOWED_ORIGINS` (not `cors_allowed_origins`)
   - `VITE_API_URL` (not `vite_api_url`)

2. **URLs Must Be Exact**
   - Include `https://`
   - No trailing slashes
   - No spaces

3. **Redeploy After Changes**
   - Backend: Change env variable → Automatic redeploy
   - Frontend: Change env variable → Manual redeploy required

4. **Free Tier Limits**
   - Railway: 500 hours/month (enough for 24/7 for most of month)
   - Render: 750 hours/month
   - Vercel: Unlimited

---

## 🎯 YOUR ACTION PLAN

**Right now, do this:**

1. Open terminal
2. Run the git commands from STEP 1
3. Open Railway in browser
4. Follow STEP 2 carefully
5. Update Vercel (STEP 3)
6. Test (STEP 4)
7. Done! 🎉

**Time needed: ~10 minutes total**

---

**Good luck! You've got this! 🚀**

If you get stuck, check the troubleshooting section or read the detailed guides.
