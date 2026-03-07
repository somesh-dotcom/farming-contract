# Configuration Management Quick Guide

## 🎯 Overview

Your project now has a **Configuration Management System** that allows you to:
- Store all data in separate JSON files
- Control everything through the `.env` file
- Easily switch between file-based and database storage
- Manage data without touching the database

## 📁 New Files Added

```
server/
├── .env                          ← Updated with configuration options
├── config/                       ← NEW: Data storage directory
│   ├── products.json            ← Product catalog
│   ├── marketPrices.json        ← Market price data
│   └── locations.json           ← Location information
├── CONFIGURATION.md             ← NEW: Detailed documentation
└── src/
    ├── config/
    │   └── index.js             ← NEW: Configuration manager
    └── configUsageExample.js    ← NEW: Demo script
```

## ⚡ Quick Start (3 Steps)

### Step 1: Edit Your .env File

Open `server/.env` and set these flags:

```bash
# To load data from JSON files instead of database:
LOAD_PRODUCTS_FROM_FILE=true
LOAD_PRICES_FROM_FILE=true
LOAD_LOCATIONS_FROM_FILE=true
```

### Step 2: Edit Data Files

Modify the JSON files in `server/config/`:

**Example: Add a new product**
```json
// server/config/products.json
[
  {
    "id": "prod_006",
    "name": "Corn",
    "category": "GRAINS",
    "unit": "kg",
    "description": "Sweet corn",
    "minQuantity": 100,
    "active": true
  }
]
```

**Example: Add a new location**
```json
// server/config/locations.json
[
  {
    "id": "loc_009",
    "city": "Bangalore",
    "area": "Electronic City",
    "state": "Karnataka",
    "pincode": "560100",
    "isActive": true,
    "isDefault": false
  }
]
```

### Step 3: Restart Your Server

```bash
cd server
npm run dev
```

That's it! Your data is now loaded from the JSON files.

## 🔧 Common Tasks

### Task 1: Add New Products

1. Open `server/config/products.json`
2. Add your product following the format
3. Save the file
4. Restart the server

### Task 2: Update Market Prices

1. Open `server/config/marketPrices.json`
2. Add or update price entries
3. Save the file
4. Restart the server

### Task 3: Add New Locations

1. Open `server/config/locations.json`
2. Add your location with all details
3. Save the file
4. Restart the server

### Task 4: Test Configuration

Run the demo script anytime:

```bash
cd server
node src/configUsageExample.js
```

This will show you:
- Current configuration from .env
- What data is loaded from files
- How to use it in your code

## 📊 All Configuration Options

### Application Settings
```bash
APP_NAME="Agricultural Commodity Trading Platform"
DEFAULT_CURRENCY=INR
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,kn
```

### Contract Settings
```bash
CONTRACT_AUTO_COMPLETE=true          # Auto-complete contracts when paid
ADMIN_ONLY_STATUS_CHANGE=true        # Only admins can change COMPLETED status
```

### Transaction Settings
```bash
BUYER_TRANSACTION_VISIBILITY=true    # Buyers see all their contract transactions
ADMIN_DELETE_TRANSACTIONS=true       # Admins can delete transactions
```

### Market Price Settings
```bash
PRICE_UPDATE_INTERVAL=3600000        # Update interval in ms (1 hour)
PRICE_HISTORY_DAYS=180               # Keep 180 days of history
ANALYZE_PRICE_TRENDS=true            # Enable trend analysis
```

## 💡 Usage in Code

### Example 1: Get Configuration Values

```javascript
const { config } = require('./config/index');

const port = config.server.port;              // 5004
const currency = config.app.defaultCurrency;   // 'INR'
const autoComplete = config.contract.autoCompleteEnabled; // true
```

### Example 2: Load Data from Files

```javascript
const { loadDataFromFile } = require('./config/index');

const products = loadDataFromFile('products');
const prices = loadDataFromFile('marketPrices');
const locations = loadDataFromFile('locations');
```

### Example 3: Conditional Loading

```javascript
let products;

if (process.env.LOAD_PRODUCTS_FROM_FILE === 'true') {
  // Load from JSON file
  products = loadDataFromFile('products');
} else {
  // Load from database
  products = await prisma.product.findMany();
}
```

## 🎛️ Environment Variable Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `LOAD_PRODUCTS_FROM_FILE` | Load products from JSON | `false` |
| `LOAD_PRICES_FROM_FILE` | Load prices from JSON | `false` |
| `LOAD_LOCATIONS_FROM_FILE` | Load locations from JSON | `false` |
| `CONTRACT_AUTO_COMPLETE` | Auto-complete contracts | `true` |
| `BUYER_TRANSACTION_VISIBILITY` | Show transactions to buyers | `true` |
| `PRICE_UPDATE_INTERVAL` | Price update frequency (ms) | `3600000` |

## 🐛 Troubleshooting

### Problem: Data not loading
**Solution:** Check that:
1. The `LOAD_*_FROM_FILE` flag is set to `true` in `.env`
2. The JSON file exists in `server/config/` directory
3. JSON syntax is valid (use a JSON validator)

### Problem: Changes not appearing
**Solution:** 
1. Save the JSON file after making changes
2. Restart the development server
3. Clear browser cache if needed

### Problem: Want to use both file and database
**Solution:** Use the merge function:

```javascript
const { mergeData } = require('./config/index');

const dbProducts = await prisma.product.findMany();
const allProducts = mergeData('products', dbProducts);
```

## 📝 Best Practices

1. ✅ **Always backup** your JSON files before major changes
2. ✅ **Use meaningful IDs** (e.g., `prod_001`, `price_001`)
3. ✅ **Keep JSON files valid** - use a JSON validator
4. ✅ **Document custom fields** in CONFIGURATION.md
5. ✅ **Test changes** with the demo script first

## 🚀 Next Steps

1. **Try it out**: Run `node src/configUsageExample.js`
2. **Add your data**: Edit the JSON files in `server/config/`
3. **Configure options**: Update settings in `.env`
4. **Read more**: Check `server/CONFIGURATION.md` for detailed docs

## 📞 Need Help?

1. Run the demo: `node src/configUsageExample.js`
2. Read the full docs: `server/CONFIGURATION.md`
3. Check the source: `server/src/config/index.js`

---

**Happy Configuring! 🎉**
