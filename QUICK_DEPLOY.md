# Quick Deployment Guide

## 🚀 Deploy Backend & Connect to Vercel Frontend

### Current Status
- ✅ Frontend deployed on Vercel: https://client-chi-lilac.vercel.app
- ⚠️ Backend needs deployment to Railway or Render
- ⚠️ Frontend needs to be connected to backend

---

## Option 1: Railway Deployment (Recommended - Easiest)

### Step-by-Step (5 minutes):

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy backend to Railway"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to https://railway.app/
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Add PostgreSQL Database**
   - In Railway project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Wait for it to provision (1-2 minutes)

4. **Set Environment Variables**
   Click on your backend service → Variables tab:
   ```
   JWT_SECRET=my-super-secret-key-min-32-characters-long
   CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app
   PORT=8080
   ```
   
   Then add the DATABASE_URL:
   - Click on PostgreSQL service
   - Copy the `DATABASE_URL` variable
   - Go back to backend service and add it as a variable

5. **Get Backend URL**
   - Click on backend service
   - Click "Settings" tab
   - Find "Domains" section
   - Copy the URL (e.g., `https://agri-trading-backend-production.up.railway.app`)

6. **Update Vercel Frontend**
   - Go to https://vercel.com/
   - Select your frontend project
   - Go to "Settings" → "Environment Variables"
   - Add or update:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
   - Click "Save"

7. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click on latest deployment
   - Click "..." → "Redeploy"

8. **Test It Works**
   Visit: `https://your-backend-url.railway.app/api/health`
   
   Should show:
   ```json
   {
     "status": "UP",
     "message": "Agricultural Trading Platform Backend is running"
   }
   ```

---

## Option 2: Render Deployment

### Step-by-Step (7 minutes):

1. **Push code to GitHub** (same as above)

2. **Create Web Service**
   - Go to https://render.com/
   - Click "New +" → "Web Service"
   - Connect repository
   - Configure:
     - **Name**: agri-trading-backend
     - **Root Directory**: `server-java`
     - **Environment**: Java
     - **Build Command**: `mvn clean package -DskipTests`
     - **Start Command**: `java -jar target/*.jar`

3. **Add PostgreSQL**
   - Click "New +" → "PostgreSQL"
   - Name: `agri-trading-db`
   - Database Name: `contract_farming`
   - Wait for provisioning

4. **Set Environment Variables**
   In web service → Environment:
   ```
   JAVA_VERSION=17
   JWT_SECRET=my-super-secret-key-min-32-characters-long
   CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app
   PORT=8080
   DATABASE_URL=<copy from PostgreSQL>
   ```

5. **Deploy & Get URL**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Copy the URL (e.g., `https://agri-trading-backend.onrender.com`)

6. **Update Vercel** (same as Railway step 6)

7. **Redeploy Frontend** (same as Railway step 7)

---

## Verify Everything Works

### 1. Test Backend
```
https://your-backend-url/api/health
```

### 2. Test Frontend
```
https://client-chi-lilac.vercel.app
```

### 3. Check Browser Console
- Open your frontend
- Press F12 → Console tab
- Should see NO CORS errors
- Try logging in

---

## Common Issues & Solutions

### ❌ CORS Error in Browser
**Solution**: 
- Verify `CORS_ALLOWED_ORIGINS` includes your exact Vercel URL
- No spaces allowed in the variable
- Redeploy backend after fixing

### ❌ Database Connection Failed
**Solution**:
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Verify credentials

### ❌ Frontend Can't Connect
**Solution**:
- Verify `VITE_API_URL` in Vercel is correct
- Test backend URL directly in browser
- Redeploy frontend

### ❌ Backend Not Starting
**Solution**:
- Check logs in Railway/Render
- Verify all environment variables
- Ensure PORT=8080

---

## Environment Variables Reference

### Backend (Railway/Render)
| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://...` | ✅ Yes |
| `JWT_SECRET` | Min 32 characters | ✅ Yes |
| `CORS_ALLOWED_ORIGINS` | Your Vercel URL | ✅ Yes |
| `PORT` | `8080` | ✅ Yes |
| `JAVA_VERSION` | `17` | Render only |

### Frontend (Vercel)
| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_URL` | Backend URL | ✅ Yes |

---

## Need Help?

1. Check full guide: `BACKEND_DEPLOYMENT_GUIDE.md`
2. Run helper script: `bash deploy-backend.sh`
3. Check logs in Railway/Render dashboard
4. Test endpoints with Postman or browser

---

## Quick Test Commands

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/api/health

# Test login endpoint
curl -X POST https://your-backend-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway/Render
- [ ] PostgreSQL database connected
- [ ] All environment variables set
- [ ] Backend URL accessible
- [ ] Health endpoint returns "UP"
- [ ] VITE_API_URL set in Vercel
- [ ] Frontend redeployed
- [ ] No CORS errors in browser
- [ ] Login works on production

🎉 **You're done! Your app is fully deployed and connected!**
