# 🚀 START HERE - Backend Deployment

## Your Current Situation
✅ Frontend is deployed on Vercel: https://client-chi-lilac.vercel.app  
❌ Backend is NOT deployed yet  
❌ Frontend and Backend are NOT connected  

## What Has Been Fixed
✅ Backend CORS now uses environment variables (was hardcoded)  
✅ Health check endpoint added (`/api/health`)  
✅ Deployment configuration files updated (railway.json, render.yaml)  
✅ Complete deployment guides created  

---

## 🎯 Quick Start (Choose One Platform)

### Option 1: Railway ⭐ (Easiest - 5 minutes)

**Run this command for step-by-step guidance:**
```bash
bash deploy-backend.sh
```

**Or follow these steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare backend for deployment"
   git push origin main
   ```

2. **Deploy to Railway**
   - Visit: https://railway.app/
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Add Database**
   - Click "+ New" → "Database" → "Add PostgreSQL"

4. **Set Variables** (in Railway dashboard)
   ```
   DATABASE_URL=<copy from PostgreSQL service>
   JWT_SECRET=my-secret-key-at-least-32-characters-long
   CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app
   PORT=8080
   ```

5. **Get URL & Connect to Vercel**
   - Copy backend URL from Railway (e.g., `https://your-app.railway.app`)
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-app.railway.app`
   - Redeploy frontend

---

### Option 2: Render (7 minutes)

1. **Push to GitHub** (same as above)

2. **Create Web Service on Render**
   - Visit: https://render.com/
   - New + → Web Service
   - Root Directory: `server-java`
   - Build: `mvn clean package -DskipTests`
   - Start: `java -jar target/*.jar`

3. **Add PostgreSQL**
   - New + → PostgreSQL
   - Database Name: `contract_farming`

4. **Set Variables**
   ```
   DATABASE_URL=<copy from PostgreSQL>
   JWT_SECRET=my-secret-key-at-least-32-characters-long
   CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app
   PORT=8080
   JAVA_VERSION=17
   ```

5. **Connect to Vercel** (same as Railway)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **QUICK_DEPLOY.md** | Step-by-step deployment guide (detailed) |
| **BACKEND_DEPLOYMENT_GUIDE.md** | Complete deployment reference |
| **DEPLOYMENT_ARCHITECTURE.md** | System architecture diagram |
| **deploy-backend.sh** | Interactive deployment helper |
| **test-backend-connection.sh** | Test backend after deployment |

---

## ✅ After Deployment - Test It

**Run this command:**
```bash
bash test-backend-connection.sh https://your-backend-url.railway.app
```

**Or manually test:**
1. Visit: `https://your-backend-url.railway.app/api/health`
2. Should show: `{"status": "UP", "message": "..."}`
3. Visit your frontend: `https://client-chi-lilac.vercel.app`
4. Try logging in
5. Check browser console (F12) - should have NO CORS errors

---

## 🔧 Files That Were Changed

### Backend (server-java/)
- ✅ `src/main/java/com/agri/trading/config/SecurityConfig.java` - Now uses env vars for CORS
- ✅ `src/main/java/com/agri/trading/controller/HealthController.java` - New health endpoint
- ✅ `railway.json` - Updated with health check timeout
- ✅ `render.yaml` - Updated with health check path

### Client (client/)
- ✅ `.env.production` - Added production environment template

### Root
- ✅ `railway.json` - Updated
- ✅ `render.yaml` - Updated

---

## 🆘 Common Problems

### "CORS error" in browser
**Fix**: Make sure `CORS_ALLOWED_ORIGINS` exactly matches your Vercel URL (no spaces!)

### "Database connection failed"
**Fix**: Copy the correct `DATABASE_URL` from your PostgreSQL service

### Backend won't start
**Fix**: Check logs in Railway/Render dashboard, verify all environment variables

### Frontend can't connect
**Fix**: Update `VITE_API_URL` in Vercel settings and redeploy

---

## 🎯 Your Next Steps

1. [ ] Choose platform (Railway recommended)
2. [ ] Push code to GitHub
3. [ ] Deploy backend (follow guide)
4. [ ] Set environment variables
5. [ ] Update VITE_API_URL in Vercel
6. [ ] Test connection
7. [ ] Done! 🎉

---

## 💡 Need Help?

1. Check logs in Railway/Render dashboard
2. Run `bash test-backend-connection.sh <your-backend-url>`
3. Read `QUICK_DEPLOY.md` for detailed steps
4. Read `BACKEND_DEPLOYMENT_GUIDE.md` for troubleshooting

---

## 📊 Environment Variables Summary

### Backend (Railway/Render)
```
DATABASE_URL=postgresql://...
JWT_SECRET=minimum-32-characters-secret
CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app
PORT=8080
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.railway.app
```

---

**Ready? Run `bash deploy-backend.sh` and follow the prompts!** 🚀
