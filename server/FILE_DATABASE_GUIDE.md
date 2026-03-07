# File-Based Database System

## 🎯 Overview

Your project now supports **complete file-based database storage**! You can store ALL your data in JSON files instead of using PostgreSQL. This is perfect for:

- ✅ Development and testing
- ✅ Small deployments
- ✅ Quick prototyping
- ✅ Offline demos
- ✅ Easy backups and migrations

## 📁 Complete File Structure

```
server/
├── .env                          ← Configuration flags
├── config/                       ← ALL DATABASE DATA STORED HERE
│   ├── users.json               ← User accounts (farmers, buyers, admins)
│   ├── products.json            ← Product catalog
│   ├── marketPrices.json        ← Market price data
│   ├── locations.json           ← Location information
│   ├── contracts.json           ← Contract agreements
│   └── transactions.json        ← Transaction records
├── src/
│   ├── config/
│   │   ├── index.js             ← Config manager
│   │   └── dbFileManager.js     ← File-based database engine
│   ├── fileDatabaseDemo.js      ← Demo script
│   └── configUsageExample.js    ← Config example
└── CONFIGURATION.md             ← Documentation
```

## ⚡ Quick Start (2 Options)

### Option 1: Pure File-Based Database (No PostgreSQL)

**Step 1:** Edit `server/.env`

```bash
# Disable PostgreSQL, use JSON files
USE_FILE_DATABASE=true
FILE_DATABASE_AUTO_SAVE=true
```

**Step 2:** Edit your data files in `server/config/`

**Step 3:** Restart server

```bash
cd server
npm run dev
```

That's it! No database needed!

### Option 2: Hybrid Mode (Files + Database)

```bash
# Use database but load some data from files
USE_FILE_DATABASE=false
LOAD_PRODUCTS_FROM_FILE=true
LOAD_LOCATIONS_FROM_FILE=true
```

This loads products and locations from files, other data from database.

## 🔧 Database Operations

The file-based system supports all standard database operations:

### Create (Insert)

```javascript
const { dbFileManager } = require('./config/dbFileManager');

// Create a new user
const user = dbFileManager.create('users', {
  name: 'John Farmer',
  email: 'john@example.com',
  role: 'FARMER',
  phone: '+919876543210',
  location: 'Bangalore'
});

console.log(`Created user with ID: ${user.id}`);
```

### Read (Query)

```javascript
// Get all users
const allUsers = dbFileManager.findMany('users');

// Get users with filter
const farmers = dbFileManager.findMany('users', { role: 'FARMER' });

// Get single user
const admin = dbFileManager.findFirst('users', { role: 'ADMIN' });

// Get by ID
const user = dbFileManager.findUnique('users', 'user_001');
```

### Update

```javascript
// Update single record
const updated = dbFileManager.update(
  'users',
  { email: 'john@example.com' },
  { phone: '+919999999999' }
);

// Update many records
const result = dbFileManager.updateMany(
  'contracts',
  { status: 'PENDING' },
  { status: 'ACTIVE' }
);
```

### Delete

```javascript
// Delete single record
const deleted = dbFileManager.delete('users', { 
  email: 'john@example.com' 
});

// Delete many records
const result = dbFileManager.deleteMany('contracts', {
  status: 'CANCELLED'
});
```

### Advanced Queries

```javascript
// Count records
const farmerCount = dbFileManager.count('users', { role: 'FARMER' });

// Complex filters
const activeContracts = dbFileManager.findMany('contracts', {
  status: 'ACTIVE',
  location: 'Bangalore'
});

// Range queries
const largeContracts = dbFileManager.findMany('contracts', {
  totalPrice: { gte: 1000000 }  // greater than or equal
});
```

## 📊 Supported Models

| Model | File Name | Description |
|-------|-----------|-------------|
| `users` | users.json | User accounts (all roles) |
| `products` | products.json | Agricultural products |
| `marketPrices` | marketPrices.json | Real-time price data |
| `locations` | locations.json | Delivery locations |
| `contracts` | contracts.json | Contract agreements |
| `transactions` | transactions.json | Payment records |

## 💡 Usage in API Routes

### Example: Users Controller

```javascript
// server/src/routes/users.js
const express = require('express');
const { dbFileManager } = require('../config/dbFileManager');
const router = express.Router();

// GET /api/users - Get all users
router.get('/', (req, res) => {
  const users = dbFileManager.findMany('users');
  res.json(users);
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const user = dbFileManager.findUnique('users', req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// POST /api/users - Create user
router.post('/', (req, res) => {
  try {
    const user = dbFileManager.create('users', req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => {
  const user = dbFileManager.update(
    'users',
    { id: req.params.id },
    req.body
  );
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const user = dbFileManager.delete('users', { id: req.params.id });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ message: 'User deleted successfully' });
});

module.exports = router;
```

### Example: Contracts Controller

```javascript
// server/src/routes/contracts.js
const { dbFileManager } = require('../config/dbFileManager');

// GET /api/contracts - Get all contracts
router.get('/', async (req, res) => {
  let contracts = dbFileManager.findMany('contracts');
  
  // Filter by user role if needed
  if (req.user.role === 'FARMER') {
    contracts = contracts.filter(c => c.farmerId === req.user.id);
  } else if (req.user.role === 'BUYER') {
    contracts = contracts.filter(c => c.buyerId === req.user.id);
  }
  
  res.json(contracts);
});

// POST /api/contracts - Create contract
router.post('/', async (req, res) => {
  const contract = dbFileManager.create('contracts', {
    ...req.body,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });
  res.status(201).json(contract);
});
```

## 🔄 Migration from Database

### Export Existing Data

```javascript
const { dbFileManager } = require('./config/dbFileManager');

// Export all data to backup file
dbFileManager.exportAll('./config/backup_from_database.json');
console.log('✓ All data exported!');
```

### Import to Files

```javascript
// If you have existing data in database, export it first
// Then import to file system
dbFileManager.importAll('./config/backup_from_database.json');
console.log('✓ All data imported to files!');
```

## 📦 Backup & Restore

### Manual Backup

```bash
# Just copy the config folder
cp -r server/config server/config_backup_$(date +%Y%m%d)
```

### Programmatic Backup

```javascript
const { dbFileManager } = require('./config/dbFileManager');

// Create timestamped backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = `./config/backup_${timestamp}.json`;
dbFileManager.exportAll(backupPath);
console.log(`Backup saved to: ${backupPath}`);
```

### Restore from Backup

```javascript
const { dbFileManager } = require('./config/dbFileManager');

// Restore from specific backup
dbFileManager.importAll('./config/backup_20250217.json');
console.log('✓ Data restored from backup!');
```

## 🎛️ Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_FILE_DATABASE` | Enable file-based database | `false` |
| `FILE_DATABASE_AUTO_SAVE` | Auto-save changes to files | `true` |
| `FILE_DATABASE_BACKUP_PATH` | Default backup file path | `./config/backup_all_data.json` |

## 🚀 Testing the System

Run the interactive demo:

```bash
cd server
node src/fileDatabaseDemo.js
```

This will:
- ✅ Create sample data
- ✅ Demonstrate all CRUD operations
- ✅ Show query examples
- ✅ Create a backup file
- ✅ Display statistics

## 📝 Sample Data Files

### users.json

```json
[
  {
    "id": "user_001",
    "name": "Admin User",
    "email": "admin@contractfarming.com",
    "password": "$2b$10$HashedPassword",
    "role": "ADMIN",
    "phone": "+919876543210",
    "location": "Bangalore",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  {
    "id": "user_002",
    "name": "Farmer John",
    "email": "john@farmer.com",
    "password": "$2b$10$HashedPassword",
    "role": "FARMER",
    "phone": "+919876543211",
    "location": "Bangalore",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### contracts.json

```json
[
  {
    "id": "contract_001",
    "farmerId": "user_002",
    "buyerId": "user_003",
    "productId": "prod_001",
    "quantity": 500,
    "pricePerUnit": 2500,
    "totalPrice": 1250000,
    "unit": "kg",
    "startDate": "2025-02-01",
    "deliveryDate": "2025-03-01",
    "location": "Bangalore",
    "area": "Yeshwanthpur",
    "status": "ACTIVE",
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

## ⚠️ Important Notes

1. **Passwords**: Always hash passwords before storing (use bcrypt)
2. **IDs**: Let the system auto-generate unique IDs
3. **Timestamps**: `createdAt` and `updatedAt` are auto-managed
4. **Validation**: Add your own validation before saving
5. **Indexes**: For large datasets, consider adding search indexes

## 🐛 Troubleshooting

### Data not persisting
- Check `USE_FILE_DATABASE=true` in `.env`
- Verify file permissions in `config/` directory
- Check `FILE_DATABASE_AUTO_SAVE=true`

### Cannot find records
- Ensure data files exist in `server/config/`
- Check JSON syntax is valid
- Run `node src/fileDatabaseDemo.js` to test

### Performance issues with large files
- Consider splitting into multiple smaller files
- Use database for production with large datasets
- Implement caching layer

## 🎯 When to Use File Database

✅ **Good for:**
- Development and testing
- Small-scale applications (< 10,000 records)
- Prototyping and demos
- Offline applications
- Easy data portability

❌ **Not ideal for:**
- Large-scale production (> 100,000 records)
- High-concurrency applications
- Complex transactions
- Real-time analytics

## 📞 Support

For issues or questions:
1. Run the demo: `node src/fileDatabaseDemo.js`
2. Check CONFIGURATION.md
3. Review source code in `src/config/dbFileManager.js`

---

**Last Updated**: February 17, 2025
