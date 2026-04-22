# Vercel Deployment Guide

## 📋 Overview

This guide will help you deploy your Agri Trading Contract Farming System to Vercel (frontend) and Railway (backend).

### Architecture
- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Java Spring Boot)
- **Database**: PostgreSQL (Railway or external)

---

## 🚀 Step 1: Deploy Backend to Railway

### 1.1 Prepare Your Backend

Your Java backend is already configured for Railway deployment (`server-java/railway.json`).

### 1.2 Deploy to Railway

1. **Go to [Railway](https://railway.app/)**
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Configure the service**:
   - Root directory: `server-java`
   - Build command: `mvn clean package -DskipTests`
   - Start command: `java -jar target/*.jar`

### 1.3 Add PostgreSQL Database

1. In your Railway project, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically provision a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service

### 1.4 Set Environment Variables

In Railway, go to your Java service → **Variables** → Add:

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8080
JWT_SECRET=your-secret-key-here
```

### 1.5 Get Your Backend URL

After deployment, Railway will provide you with a URL like:
```
https://your-app-name.railway.app
```

**Copy this URL** - you'll need it for the frontend configuration.

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com/)**
2. **Sign in** with GitHub
3. **Click "Add New..."** → **"Project"**
4. **Import your repository**
5. **Configure the project**:

   **Project Name**: `agri-trading-frontend`
   
   **Framework Preset**: `Vite`
   
   **Root Directory**: `client`
   
   **Build Command**: `npm run build`
   
   **Output Directory**: `dist`
   
   **Install Command**: `npm install`

### 2.3 Set Environment Variables

In Vercel, go to **Project Settings** → **Environment Variables** → Add:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

Replace `your-backend-url.railway.app` with your actual Railway backend URL.

### 2.4 Deploy

Click **"Deploy"** and wait for the build to complete.

Vercel will provide you with a URL like:
```
https://your-app-name.vercel.app
```

---

## 🔗 Step 3: Connect Frontend to Backend

### 3.1 Update vercel.json

Open `client/vercel.json` and update the backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.railway.app/api/:path*"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

Replace `https://your-backend-url.railway.app` with your actual Railway URL.

### 3.2 Commit and Push

```bash
git add client/vercel.json
git commit -m "Update backend URL for production"
git push origin main
```

Vercel will automatically redeploy with the new configuration.

---

## 🔧 Step 4: Configure CORS on Backend

Your Java backend needs to allow requests from your Vercel frontend.

### 4.1 Update SecurityConfig.java

Open `server-java/src/main/java/com/agri/trading/config/SecurityConfig.java` and update CORS:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "https://your-app-name.vercel.app",
        "http://localhost:3000"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

Replace `https://your-app-name.vercel.app` with your actual Vercel URL.

### 4.2 Commit and Deploy Backend

```bash
cd server-java
git add .
git commit -m "Update CORS configuration for Vercel frontend"
git push origin main
```

Railway will automatically redeploy.

---

## ✅ Step 5: Test Your Deployment

### 5.1 Verify Backend

Visit: `https://your-backend-url.railway.app/api/health`

You should see:
```json
{
  "status": "ok",
  "message": "Contract Farming API is running"
}
```

### 5.2 Verify Frontend

Visit: `https://your-app-name.vercel.app`

Test the following:
- ✅ Login/Register
- ✅ Create contracts
- ✅ View contracts
- ✅ **Payment page** (`/payment/{contract-id}`)
- ✅ Transactions page
- ✅ Market prices

---

## 🔐 Security Checklist

- [ ] Set strong `JWT_SECRET` environment variable
- [ ] Enable HTTPS (Vercel and Railway do this automatically)
- [ ] Configure CORS to only allow your frontend domain
- [ ] Use environment variables for sensitive data
- [ ] Enable database backups on Railway
- [ ] Set up monitoring and alerts

---

## 📊 Monitoring

### Vercel Dashboard
- Visit: `https://vercel.com/dashboard`
- Monitor deployments, analytics, and errors

### Railway Dashboard
- Visit: `https://railway.app/dashboard`
- Monitor backend logs, database, and resource usage

---

## 🔄 Continuous Deployment

Both Vercel and Railway automatically deploy when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

- **Vercel**: Deploys the frontend automatically
- **Railway**: Deploys the backend automatically

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Problem**: API calls fail with CORS errors

**Solution**:
1. Check CORS configuration in `SecurityConfig.java`
2. Ensure your Vercel URL is in the allowed origins
3. Redeploy backend to Railway

### Payment page not working

**Problem**: Payment API returns errors

**Solution**:
1. Check backend logs on Railway
2. Verify `/api/payments/process` endpoint exists
3. Ensure database is connected
4. Check frontend environment variable `VITE_API_URL`

### Build fails on Vercel

**Problem**: Vercel build fails

**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure `client/package.json` has correct scripts
3. Verify all dependencies are installed
4. Try building locally: `cd client && npm run build`

---

## 💰 Cost Estimate

### Vercel (Frontend)
- **Hobby Plan**: FREE
  - Unlimited deployments
  - Serverless functions
  - Automatic HTTPS

### Railway (Backend + Database)
- **Hobby Plan**: $5/month
  - 512MB RAM
  - PostgreSQL database
  - Automatic deployments

**Total**: ~$5/month

---

## 📞 Support

If you encounter issues:
1. Check deployment logs (Vercel & Railway dashboards)
2. Review environment variables
3. Test API endpoints directly
4. Check browser console for frontend errors

---

## 🎉 You're Done!

Your Agri Trading Contract Farming System is now live on:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-backend-url.railway.app`

Share your app with users and enjoy! 🚀
