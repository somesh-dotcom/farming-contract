# 🚀 Quick Deploy to Vercel

## Option 1: Automatic (Recommended)

Run the deployment script:

```bash
./deploy-vercel.sh
```

Follow the prompts and it will guide you through the deployment.

---

## Option 2: Manual Deployment

### Step 1: Deploy Backend to Railway

1. Push code to GitHub:
```bash
git add .
git commit -m "Deploy backend"
git push origin main
```

2. Railway auto-deploys from GitHub
3. Get your backend URL: `https://your-app.railway.app`

### Step 2: Configure Frontend

Update `client/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-RAILWAY-URL.railway.app/api/:path*"
    }
  ]
}
```

### Step 3: Deploy Frontend to Vercel

```bash
cd client
vercel --prod
```

---

## Environment Variables

### Vercel (Frontend)
```
VITE_API_URL=https://your-backend.railway.app
```

### Railway (Backend)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=8080
```

---

## URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Health Check**: `https://your-app.railway.app/api/health`

---

## Test Payment Feature

1. Login to your app
2. Go to Contracts
3. Click Credit Card icon on an ACTIVE contract
4. Test payment at: `https://your-app.vercel.app/payment/{contract-id}`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Update CORS in SecurityConfig.java |
| Payment fails | Check Railway backend logs |
| Build fails | Run `npm run build` locally first |
| API not found | Verify VITE_API_URL in Vercel |

---

## Need Help?

📖 Full guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
