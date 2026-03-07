# Configuration Management System

This document explains how to use the configuration management system to store and manage data in separate files.

## 📁 Overview

The configuration system allows you to:
- Store application data in separate JSON files
- Control behavior through environment variables in `.env`
- Load data from files or database dynamically
- Merge file-based data with database data

## 🗂️ File Structure

```
server/
├── .env                          # Environment variables configuration
├── config/                       # Data storage directory
│   ├── products.json            # Product catalog
│   ├── marketPrices.json        # Market price data
│   ├── locations.json           # Location information
│   ├── users.json               # User accounts (optional)
│   └── contracts.json           # Contract data (optional)
└── src/
    └── config/
        └── index.js             # Configuration management module
```

## ⚙️ Environment Variables (.env)

### Application Settings
```bash
APP_NAME="Agricultural Commodity Trading Platform"
DEFAULT_CURRENCY=INR
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,kn
CORS_ORIGIN=*
DB_SCHEMA=public
```

### Bangalore Location Settings
```bash
BANGALORE_LOCATIONS_ENABLED=true
DEFAULT_CITY=Bangalore
DEFAULT_STATE=Karnataka
```

### Contract Settings
```bash
CONTRACT_AUTO_COMPLETE=true
ADMIN_ONLY_STATUS_CHANGE=true
CONTRACT_STATUSES=DRAFT,PENDING,ACTIVE,COMPLETED,CANCELLED
```

### Transaction Settings
```bash
BUYER_TRANSACTION_VISIBILITY=true
ADMIN_DELETE_TRANSACTIONS=true
PAYMENT_TYPES=ADVANCE,PARTIAL,FINAL,REFUND,OTHER
```

### Market Price Settings
```bash
PRICE_UPDATE_INTERVAL=3600000          # 1 hour in milliseconds
PRICE_HISTORY_DAYS=180                  # Days of history to keep
ANALYZE_PRICE_TRENDS=true
```

### Data File Loading Flags
```bash
LOAD_PRODUCTS_FROM_FILE=false      # Set to 'true' to load products from config/products.json
LOAD_PRICES_FROM_FILE=false        # Set to 'true' to load prices from config/marketPrices.json
LOAD_LOCATIONS_FROM_FILE=false     # Set to 'true' to load locations from config/locations.json
LOAD_USERS_FROM_FILE=false         # Set to 'true' to load users from config/users.json
LOAD_CONTRACTS_FROM_FILE=false     # Set to 'true' to load contracts from config/contracts.json
```

## 📊 Data File Formats

### products.json
```json
[
  {
    "id": "prod_001",
    "name": "Wheat",
    "category": "GRAINS",
    "unit": "kg",
    "description": "High quality wheat grains",
    "minQuantity": 100,
    "active": true
  }
]
```

### marketPrices.json
```json
[
  {
    "id": "price_001",
    "productId": "prod_001",
    "productName": "Wheat",
    "price": 2500,
    "currency": "INR",
    "unit": "kg",
    "location": "Bangalore",
    "area": "Yeshwanthpur",
    "timestamp": "2025-02-17T10:00:00Z"
  }
]
```

### locations.json
```json
[
  {
    "id": "loc_001",
    "city": "Bangalore",
    "area": "Yeshwanthpur",
    "state": "Karnataka",
    "pincode": "560022",
    "isActive": true,
    "isDefault": true
  }
]
```

## 🔧 Usage Examples

### 1. Loading Configuration in Routes

```javascript
const { config, loadDataFromFile } = require('../config/index');

// Get configuration values
const port = config.server.port;
const currency = config.app.defaultCurrency;
const autoComplete = config.contract.autoCompleteEnabled;

// Load data from file
const products = loadDataFromFile('products');
const locations = loadDataFromFile('locations');
```

### 2. Merging File Data with Database Data

```javascript
const { config } = require('../config/index');

// Get data from database
const dbProducts = await prisma.product.findMany();

// Merge with file data (file data takes precedence)
const allProducts = config.mergeData('products', dbProducts);
```

### 3. Saving Data to Files

```javascript
const { saveDataToFile } = require('../config/index');

const newProduct = {
  id: 'prod_006',
  name: 'Corn',
  category: 'GRAINS',
  unit: 'kg',
  minQuantity: 100,
  active: true
};

const currentProducts = loadDataFromFile('products') || [];
currentProducts.push(newProduct);

const success = saveDataToFile('products', currentProducts);
```

### 4. Conditional Loading Based on Environment

```javascript
const { config, loadDataFromFile } = require('../config/index');

let products = [];

// If LOAD_PRODUCTS_FROM_FILE is enabled, load from file
if (process.env.LOAD_PRODUCTS_FROM_FILE === 'true') {
  products = loadDataFromFile('products');
} else {
  // Otherwise, load from database
  products = await prisma.product.findMany();
}
```

## 🚀 Quick Start

### Step 1: Configure Environment Variables

Edit `server/.env` and set the desired flags:

```bash
# Enable loading products from file
LOAD_PRODUCTS_FROM_FILE=true

# Enable loading locations from file
LOAD_LOCATIONS_FROM_FILE=true
```

### Step 2: Edit Data Files

Modify the JSON files in `server/config/` directory:
- `products.json` - Add/edit products
- `marketPrices.json` - Add/edit prices
- `locations.json` - Add/edit locations

### Step 3: Test Configuration

Run the example script to verify your configuration:

```bash
cd server
node src/configUsageExample.js
```

### Step 4: Integrate into Routes

Update your route files to use the configuration system:

```javascript
// Example: src/routes/products.ts
import { Request, Response } from 'express';
const { config, loadDataFromFile } = require('../config/index');

export const getProducts = async (req: Request, res: Response) => {
  let products;
  
  if (process.env.LOAD_PRODUCTS_FROM_FILE === 'true') {
    products = loadDataFromFile('products');
  } else {
    products = await prisma.product.findMany();
  }
  
  res.json(products);
};
```

## 📝 Best Practices

1. **Version Control**: Commit your config files to Git for easy deployment
2. **Environment Separation**: Use different config files for dev/staging/production
3. **Data Validation**: Always validate data before saving to files
4. **Backup**: Keep backups of important configuration data
5. **Documentation**: Document any custom fields or changes to data structure

## 🔒 Security Considerations

- Never store sensitive data (passwords, API keys) in JSON files
- Use environment variables for secrets (JWT_SECRET, DATABASE_URL)
- Set appropriate file permissions on config files
- Validate all data before loading

## 🐛 Troubleshooting

### Config not loading
- Check that the file exists in `server/config/` directory
- Verify JSON syntax is valid
- Ensure environment variable flags are set correctly

### Data not appearing
- Check that `LOAD_*_FROM_FILE` is set to `true` in `.env`
- Verify data file format matches the expected structure
- Restart the server after making changes

### Merge conflicts
- File data takes precedence over database data
- Use unique IDs to avoid conflicts
- Review merge logic in `config/index.js`

## 📋 Available Methods

```javascript
const { 
  config,                    // Configuration object from environment variables
  loadDataFromFile,          // Load data from JSON files
  saveDataToFile,            // Save data to JSON files
  getAvailableDataTypes,     // Get list of available data types
  dataFileExists,            // Check if a data file exists
  deleteDataFile,            // Delete a data file
  mergeData,                 // Merge file data with runtime data
  DATA_FILES,                // Map of data type to file path
  CONFIG_DIR                 // Path to config directory
} = require('./config/index');
```

## 🎯 Use Cases

### 1. Development Environment
Load sample data from files for quick testing without database setup.

### 2. Production Deployment
Use database for main data, but override specific items via config files.

### 3. Data Migration
Export database data to JSON files, then import to new system.

### 4. Multi-tenant Setup
Different tenants can have different config files with customized data.

## 📞 Support

For issues or questions about the configuration system:
1. Check this documentation
2. Run the example script: `node src/configUsageExample.js`
3. Review the source code in `src/config/index.js`

---

**Last Updated**: February 17, 2025
