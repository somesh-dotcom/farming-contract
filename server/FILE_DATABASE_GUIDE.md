# File-Based Database Setup Guide

## Overview

This project now supports storing all data in a **single JSON file** (`database.json`) instead of using PostgreSQL. This is perfect for development, testing, or lightweight deployments.

## Configuration

### Environment Variables (`.env` file)

```bash
# Enable file-based database
USE_FILE_DATABASE=true

# Auto-save changes to file
FILE_DATABASE_AUTO_SAVE=true

# Main database file location
FILE_DATABASE_PATH=./config/database.json

# Backup file location
FILE_DATABASE_BACKUP_PATH=./config/backup_all_data.json
```

## Data Storage Location

All your data is stored in: **`/server/config/database.json`**

This single file contains:
- `users` - User accounts (admin, farmers, buyers)
- `products` - Agricultural products
- `contracts` - Farming contracts
- `marketPrices` - Market price data
- `transactions` - Payment transactions
- `notifications` - User notifications
- `locations` - Geographic locations

## Default Sample Data

The database comes pre-loaded with:

### Users (3 default accounts)
1. **Admin**: `admin@contractfarming.com` / password: *(see configuration)*
2. **Farmer**: `farmer@example.com` / password: `password123`
3. **Buyer**: `buyer@example.com` / password: `password123`

### Products (5 items)
- Tomato, Potato, Onion (Vegetables)
- Rice, Wheat (Grains)

### Sample Data
- 1 active contract
- 3 market price entries
- 1 transaction

## How It Works

### Reading Data
When `USE_FILE_DATABASE=true`, the system reads from `database.json` instead of PostgreSQL:

```javascript
// Example: Load users
const users = dbFileManager.findMany('users');

// Example: Find user by email
const user = dbFileManager.findFirst('users', { email: 'test@example.com' });
```

### Writing Data
All changes are automatically saved to `database.json`:

```javascript
// Example: Create new user
const newUser = dbFileManager.create('users', {
  email: 'newuser@example.com',
  name: 'John Doe',
  role: 'FARMER',
  // ... other fields
});

// Example: Update user
dbFileManager.update('users', 
  { id: 'user_001' },
  { phone: '+91 9876543210' }
);

// Example: Delete user
dbFileManager.delete('users', { id: 'user_001' });
```

## Switching Between PostgreSQL and File Database

### Use File Database (Development/Testing)
```bash
USE_FILE_DATABASE=true
```

### Use PostgreSQL (Production)
```bash
USE_FILE_DATABASE=false
```

## Managing Your Data

### View/Edit Data
You can directly edit `database.json` in any text editor, or use the application UI.

### Backup Data
```bash
# The backup is automatically created at:
/server/config/backup_all_data.json
```

### Reset to Default Data
1. Delete `database.json`
2. Restart the server - it will create a new one with sample data

### Import/Export Data

**Export:**
```javascript
const { dbFileManager } = require('./src/config/dbFileManager');
dbFileManager.exportAll('./config/my_backup.json');
```

**Import:**
```javascript
dbFileManager.importAll('./config/my_backup.json');
```

## API Endpoints (Work the Same Way)

All existing API endpoints work without any changes:

```bash
# Register new user
POST /api/auth/register

# Get all products
GET /api/products

# Create contract
POST /api/contracts

# Get market prices
GET /api/market-prices
```

## Advantages

✅ **No Database Setup** - No need to install PostgreSQL  
✅ **Portable** - Easy to share/copy data  
✅ **Version Control** - Can track changes in Git  
✅ **Simple Backup** - Single file backup  
✅ **Easy Testing** - Quick to reset/reload data  
✅ **Offline Ready** - Works without database server  

## Limitations

⚠️ **Not for Production** - Use PostgreSQL for production  
⚠️ **No Transactions** - Limited ACID compliance  
⚠️ **File Size** - Not suitable for very large datasets (>100MB)  
⚠️ **Concurrency** - Limited support for multiple writers  

## Troubleshooting

### Data Not Saving
Check that:
- `USE_FILE_DATABASE=true` in `.env`
- File permissions allow writing to `database.json`
- Server has write access to `/server/config/` directory

### Corrupted Data
If `database.json` gets corrupted:
1. Restore from `backup_all_data.json`
2. Or delete and restart server to get default data

### Switching Back to PostgreSQL
1. Set `USE_FILE_DATABASE=false`
2. Ensure PostgreSQL is running
3. Run migrations: `npx prisma migrate dev`

## File Structure

```
server/
├── config/
│   ├── database.json          # Main database file (ALL data)
│   ├── backup_all_data.json   # Automatic backup
│   ├── products.json          # Individual files (optional)
│   ├── users.json
│   └── ...
├── src/
│   ├── config/
│   │   ├── index.js           # Configuration loader
│   │   └── dbFileManager.js   # File operations
│   └── routes/                # API routes
└── .env                       # Configuration
```

## Example: Adding a New User via API

```bash
curl -X POST http://localhost:5004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Farmer",
    "email": "farmer2@example.com",
    "password": "password123",
    "role": "FARMER",
    "phone": "+91 9876543210",
    "city": "Bangalore"
  }'
```

The new user will be immediately saved to `database.json`!

## Next Steps

1. ✅ Start the server: `npm run dev`
2. ✅ Login with default admin account
3. ✅ Create contracts, products, transactions
4. ✅ Watch `database.json` update in real-time!

---

**Need Help?** Check the main README.md or contact the development team.
