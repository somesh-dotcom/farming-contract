# 🚀 Vercel Deployment Guide - Final Steps

## ✅ What's Already Done

1. **Prisma singleton pattern** - Implemented to prevent connection leaks
2. **Postinstall script** - Added to generate Prisma client on Vercel
3. **Serverless export** - App properly exported for Vercel
4. **Code pushed to GitHub** - All fixes committed

## 🔧 What You Need To Do Next

### Option 1: Use PostgreSQL (Recommended for Production)

#### Step 1: Create Free PostgreSQL Database on Neon

```bash
# 1. Go to https://neon.tech
# 2. Sign up with GitHub
# 3. Create a new project called "farming-contract"
# 4. Copy the connection string (looks like):
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# 5. Add ?connection_limit=1 at the end:
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=1
```

#### Step 2: Set Environment Variables on Vercel Backend

```bash
cd server

# Set DATABASE_URL
vercel env add DATABASE_URL production
# Paste your Neon connection string when prompted

# Set USE_FILE_DATABASE to false
vercel env add USE_FILE_DATABASE production
# Type: false

# Set JWT_SECRET
vercel env add JWT_SECRET production
# Type: mySuperSecretKey123!@#random

# Set JWT_EXPIRES_IN
vercel env add JWT_EXPIRES_IN production
# Type: 7d

# Set NODE_ENV
vercel env add NODE_ENV production
# Type: production
```

#### Step 3: Run Database Migrations Locally

```bash
cd server

# Set the DATABASE_URL in your terminal
export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=1"

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed sample data
npm run seed
```

#### Step 4: Set Frontend Environment Variable

```bash
cd client

# Set VITE_API_URL
vercel env add VITE_API_URL production
# Type: https://server-theta-lime-34.vercel.app
```

#### Step 5: Redeploy Both

```bash
# Redeploy backend
cd server
vercel --prod

# Redeploy frontend
cd ../client
vercel --prod
```

---

### Option 2: Keep Using File Database (Not Recommended for Vercel)

⚠️ **Warning**: Vercel is serverless - files don't persist between deployments. The JSON database will reset on each deployment.

If you still want to try:

```bash
cd server

# Set environment variables
vercel env add USE_FILE_DATABASE production
# Type: true

vercel env add FILE_DATABASE_AUTO_SAVE production
# Type: true

vercel env add JWT_SECRET production
# Type: mySuperSecretKey123!@#random

# Redeploy
vercel --prod
```

---

## 📋 Current Deployment URLs

- **Backend API**: https://server-theta-lime-34.vercel.app
- **Frontend**: https://client-opal-beta-80.vercel.app
- **GitHub**: https://github.com/somesh-dotcom/farming-contract.git

---

## 🧪 Test After Deployment

```bash
# Test health endpoint
curl https://server-theta-lime-34.vercel.app/api/health

# Expected response:
{"status":"ok","message":"Contract Farming API is running"}

# Test login (after seeding)
curl -X POST https://server-theta-lime-34.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@contractfarming.com","password":"admin123"}'
```

---

## 🐛 Troubleshooting

### FUNCTION_INVOCATION_FAILED Error
- Check if DATABASE_URL is set correctly
- Verify migrations have been run
- Check Vercel function logs: `vercel logs`

### CORS Errors
- Make sure CLIENT_URL env var is set on backend
- Should match your frontend URL exactly (no trailing slash)

### Prisma Errors
- Ensure postinstall script runs: Check Vercel build logs
- Verify schema.prisma is in server/prisma/ folder
- Check that node_modules/.prisma/client exists after build

---

## 📝 Default Login Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@contractfarming.com | admin123 |
| Farmer | farmer@example.com | password123 |
| Buyer | buyer@example.com | password123 |
