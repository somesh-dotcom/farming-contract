# 🚂 Railway Deployment Guide

## Quick Deployment Steps

### Step 1: Push Code to GitHub

```bash
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated"
git add .
git commit -m "Configure backend for Railway deployment"
git push origin main
```

### Step 2: Deploy to Railway

1. **Go to [Railway](https://railway.app/)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose**: `assured-contract-farming`
6. **Configure**:
   - **Root Directory**: `server-java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+"** (New)
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will provision the database automatically
4. Wait for it to be ready (~1 minute)

### Step 4: Set Environment Variables

In Railway dashboard, go to your Java service → **Variables** tab → Add:

```env
PORT=8080
DATABASE_URL=postgresql://postgres:password@host:port/railway  # Railway auto-fills this
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://client-chi-lilac.vercel.app
```

**Important**: Railway automatically provides `DATABASE_URL` when you add PostgreSQL. Just copy it from the database service.

### Step 5: Deploy

Railway will automatically build and deploy when you push to GitHub.

**Build logs**: Check in Railway dashboard
**Status**: Should show "Deployed" with a green checkmark

---

## After Deployment

### Get Your Backend URL

1. Go to Railway dashboard
2. Click on your service
3. Go to **"Settings"** tab
4. Find **"Domains"** section
5. Copy the URL: `https://your-app-name.up.railway.app`

### Test Your Backend

Visit: `https://your-app-name.up.railway.app/api/health`

You should see:
```json
{
  "status": "ok",
  "message": "Contract Farming API is running"
}
```

### Update Frontend (Vercel)

Once you have the Railway URL, update your Vercel frontend:

1. Go to your Vercel project
2. Go to **Settings** → **Environment Variables**
3. Add/Update: `VITE_API_URL=https://your-app-name.up.railway.app`
4. Redeploy from Vercel dashboard

OR update `client/vercel.json` and push to GitHub:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-app-name.up.railway.app/api/:path*"
    }
  ]
}
```

---

## Troubleshooting

### Build Fails

**Error**: `mvn command not found`
**Solution**: Railway uses Nixpacks by default, which includes Maven

**Error**: `Compilation failed`
**Solution**: Check build logs in Railway dashboard

### App Crashes on Start

**Error**: `Database connection failed`
**Solution**: 
1. Verify `DATABASE_URL` is set correctly
2. Make sure PostgreSQL service is running
3. Check database credentials

**Error**: `Port already in use`
**Solution**: Set `PORT=8080` in environment variables

### CORS Errors

**Problem**: Frontend can't connect to backend
**Solution**: Update `CORS_ALLOWED_ORIGINS` to include your Vercel URL

---

## Database Management

### Access Database

1. In Railway dashboard, click on PostgreSQL service
2. Click **"Data"** tab
3. Use the built-in database browser
4. Or connect with any PostgreSQL client using the connection string

### Backup Database

Railway automatically backs up your database daily.

To manually backup:
1. Go to PostgreSQL service
2. Click **"Backups"** tab
3. Click **"Create Backup"**

---

## Monitoring

### View Logs

1. Go to Railway dashboard
2. Click on your Java service
3. Click **"Logs"** tab
4. View real-time logs

### Resource Usage

1. Go to **"Metrics"** tab
2. View CPU, Memory, and Network usage
3. Monitor for performance issues

---

## Cost

**Railway Hobby Plan**: $5/month
- 512MB RAM
- 1GB storage
- PostgreSQL included
- Automatic deployments

---

## Security Checklist

- [ ] Set strong `JWT_SECRET` (at least 32 characters)
- [ ] Use Railway's private database (not publicly accessible)
- [ ] Configure CORS to only allow your frontend domains
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Regular database backups

---

## Custom Domain (Optional)

1. Go to your service in Railway
2. Click **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Add Custom Domain"**
5. Follow DNS configuration instructions

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: Check Railway dashboard logs
