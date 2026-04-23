# Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                                                               │
│  FRONTEND (Vercel)                                           │
│  ┌─────────────────────────────────────────────────┐        │
│  │  https://client-chi-lilac.vercel.app            │        │
│  │  - React + TypeScript                           │        │
│  │  - Vite                                         │        │
│  │  - Environment: VITE_API_URL                    │        │
│  └────────────────────────┬────────────────────────┘        │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                          │ API Calls (Axios)
                          │
┌─────────────────────────▼─────────────────────────────────────┐
│                                                                 │
│  BACKEND (Railway or Render)                                   │
│  ┌───────────────────────────────────────────────────┐        │
│  │  https://your-backend.railway.app                 │        │
│  │  OR                                               │        │
│  │  https://agri-trading-backend.onrender.com        │        │
│  │                                                   │        │
│  │  Spring Boot 3.2.0 (Java 17)                     │        │
│  │  - JWT Authentication                             │        │
│  │  - REST API                                       │        │
│  │  - CORS Enabled (configured via env vars)         │        │
│  │                                                   │        │
│  │  Environment Variables:                          │        │
│  │  - DATABASE_URL                                  │        │
│  │  - JWT_SECRET                                    │        │
│  │  - CORS_ALLOWED_ORIGINS                          │        │
│  │  - PORT=8080                                     │        │
│  └──────────────────────────┬────────────────────────┘        │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ JDBC
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                                                                   │
│  DATABASE (Railway/Render PostgreSQL)                            │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  PostgreSQL Database                                │        │
│  │  - Database: contract_farming                       │        │
│  │  - Tables: users, products, contracts, etc.         │        │
│  │  - Auto-created via JPA/Hibernate                   │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Access Frontend
```
User Browser → https://client-chi-lilac.vercel.app
```

### 2. Frontend Makes API Call
```javascript
// Axios configured with:
axios.defaults.baseURL = import.meta.env.VITE_API_URL
// Example: https://your-backend.railway.app

// API call:
axios.post('/api/auth/login', { email, password })
// → POST https://your-backend.railway.app/api/auth/login
```

### 3. Backend Processes Request
```
Request → Spring Boot Controller → Service → Repository → Database
                                                    ↓
Response ← JSON Data ← Serialize ← Process ← Query Result
```

### 4. CORS Handling
```
Browser sends request with Origin: https://client-chi-lilac.vercel.app
                ↓
Backend checks CORS_ALLOWED_ORIGINS environment variable
                ↓
If origin matches → Allow request
If origin doesn't match → Block request
```

## Deployment Platforms

### Frontend: Vercel
- **URL**: https://client-chi-lilac.vercel.app
- **Framework**: React + Vite
- **Build**: Automatic on git push
- **Environment**: VITE_API_URL

### Backend Options:

#### Option A: Railway (Recommended)
- **URL**: https://your-app.railway.app
- **Framework**: Spring Boot 3.2.0
- **Build**: Maven (railway.json)
- **Database**: PostgreSQL add-on
- **Free Tier**: 500 hours/month

#### Option B: Render
- **URL**: https://agri-trading-backend.onrender.com
- **Framework**: Spring Boot 3.2.0
- **Build**: Maven (render.yaml)
- **Database**: PostgreSQL add-on
- **Free Tier**: 750 hours/month

## Environment Configuration

### Production Environment Variables

#### Backend (Railway/Render)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-min-32-chars
CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app
PORT=8080
```

#### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend.railway.app
```

## API Endpoints

### Public Endpoints (No Auth)
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/products/**` - Product listing
- `GET /api/market-prices/**` - Market prices
- `POST /api/payments/**` - Payment processing

### Protected Endpoints (Requires JWT)
- `GET /api/users/**` - User management
- `POST /api/contracts/**` - Contract creation
- `GET /api/transactions/**` - Transaction history
- All other endpoints

## Security Features

1. **JWT Authentication**: Stateless token-based auth
2. **CORS Protection**: Only allows requests from Vercel frontend
3. **Password Encryption**: BCrypt hashing
4. **HTTPS Only**: All communication encrypted
5. **SQL Injection Protection**: JPA/Hibernate ORM

## Monitoring & Debugging

### Check Backend Status
```bash
# Health check
curl https://your-backend.railway.app/api/health

# Test connection
bash test-backend-connection.sh https://your-backend.railway.app
```

### View Logs
- **Railway**: Dashboard → Service → Logs
- **Render**: Dashboard → Service → Logs
- **Vercel**: Dashboard → Deployments → View logs

### Browser Console
- Open DevTools (F12)
- Check Console for CORS errors
- Check Network tab for API calls

## Scaling Options

### Current Setup (Free Tier)
- Frontend: Vercel (unlimited bandwidth)
- Backend: Railway/Render (500-750 hours/month)
- Database: PostgreSQL (1GB storage)

### Upgrade Path
1. **Railway Pro**: $5/month → Unlimited hours
2. **Render Pro**: $7/month → Better performance
3. **Database**: Upgrade storage as needed
4. **CDN**: Vercel provides global CDN automatically

## Backup & Recovery

### Database Backup
- Railway: Automatic daily backups
- Render: Automatic daily backups
- Manual: Use `pg_dump` command

### Code Backup
- All code in GitHub
- Automatic deployments on push
- Easy rollback via platform dashboards
