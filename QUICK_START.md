# 🚀 Quick Start Guide

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
cd "/Users/somesh/Desktop/major project"
npm run install:all
```

This installs dependencies for root, server, and client.

### 2️⃣ Set Up Database

#### Option A: Using PostgreSQL (Recommended)

1. **Start PostgreSQL** (if not running):
   ```bash
   # On macOS with Homebrew
   brew services start postgresql
   ```

2. **Create the database**:
   ```bash
   createdb contract_farming
   # OR using psql:
   psql postgres -c "CREATE DATABASE contract_farming;"
   ```

3. **Configure environment variables**:
   Edit `server/.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/contract_farming?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   NODE_ENV=development
   ```

   **Default PostgreSQL credentials** (if you haven't changed them):
   - Username: `postgres` (or your macOS username)
   - Password: (leave blank if no password set)
   - Example: `postgresql://postgres@localhost:5432/contract_farming?schema=public`

4. **Run database migrations**:
   ```bash
   cd server
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Seed initial data** (optional but recommended):
   ```bash
   npm run seed
   ```
   
   This creates:
   - An admin user: `admin@contractfarming.com` / `admin123`
   - Sample products (Wheat, Rice, Tomato, Potato, Mango, etc.)

### 3️⃣ Start the Application

#### Option A: Run Both Server and Client Together (Recommended)

From the **root directory**:
```bash
cd "/Users/somesh/Desktop/major project"
npm run dev
```

This starts:
- ✅ Backend API on `http://localhost:5000`
- ✅ Frontend app on `http://localhost:3000`

#### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
cd "/Users/somesh/Desktop/major project/server"
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/somesh/Desktop/major project/client"
npm start
```

### 4️⃣ Access the Application

1. Open your browser and go to: **http://localhost:3000**
2. You'll see the login page

### 5️⃣ First Login

**If you ran the seed script:**
- **Admin Account:**
  - Email: `admin@contractfarming.com`
  - Password: `admin123`

**To create new accounts:**
1. Click "Sign up" on the login page
2. Choose your role:
   - **Farmer**: Can create contracts
   - **Buyer**: Can accept contracts
3. Fill in your details and register

## 📋 Complete Setup Commands (Copy & Paste)

```bash
# 1. Navigate to project
cd "/Users/somesh/Desktop/major project"

# 2. Install all dependencies
npm run install:all

# 3. Create database (if PostgreSQL is installed)
createdb contract_farming

# 4. Configure database URL in server/.env
# Edit server/.env and set your DATABASE_URL

# 5. Setup database schema
cd server
npm run prisma:generate
npm run prisma:migrate
npm run seed  # Optional: adds sample data

# 6. Go back to root and start everything
cd ..
npm run dev
```

## 🔍 Verify Installation

Check that everything is working:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"ok","message":"Contract Farming API is running"}`

2. **Frontend:**
   - Open http://localhost:3000
   - Should see the login page

## 🐛 Troubleshooting

### Database Connection Issues

**Error: `Environment variable not found: DATABASE_URL`**
- Make sure `server/.env` file exists
- Check that DATABASE_URL is set correctly

**Error: `Can't reach database server`**
- Make sure PostgreSQL is running: `brew services start postgresql`
- Verify database exists: `psql -l | grep contract_farming`
- Check your connection string in `.env`

### Port Already in Use

**Error: `Port 5000 already in use`**
- Change PORT in `server/.env` to a different port (e.g., 5001)
- Update proxy in `client/vite.config.ts` if needed

**Error: `Port 3000 already in use`**
- Vite will automatically use the next available port

### Module Not Found Errors

```bash
# Reinstall dependencies
cd "/Users/somesh/Desktop/major project"
rm -rf node_modules server/node_modules client/node_modules
npm run install:all
```

## 📱 Using the Application

1. **Register/Login**: Create an account or login
2. **Create Contract** (Farmer): 
   - Go to "Create Contract" from sidebar
   - Select buyer and product
   - Enter contract details
   - Submit

3. **View Contracts**: See all your contracts on the Contracts page
4. **Track Prices**: Check market prices and trends
5. **View Transactions**: See all payment transactions

## 🎯 Next Steps

- Register as a Farmer to create contracts
- Register as a Buyer to accept contracts
- View market prices and trends
- Manage your contracts and transactions

---

**Need Help?** Check the main README.md for more detailed documentation.

