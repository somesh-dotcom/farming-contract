# Bangalore Market Price Updater - Quick Guide

## 🎯 Purpose

This tool updates **real-time market prices for Bangalore areas only** without modifying any project files except `config/marketPrices.json`.

---

## 📁 Files Created

1. **updateBangalorePrices.js** - Manual price updater
2. **autoUpdatePrices.js** - Automatic price updater (runs continuously)

---

## ⚡ Quick Start

### Option 1: Manual Update (One-time)

```bash
cd server

# Append new prices (keeps old ones)
node updateBangalorePrices.js

# OR replace old Bangalore prices
node updateBangalorePrices.js --replace
```

### Option 2: Auto Update (Continuous)

```bash
cd server

# Run auto-updater (updates every 60 minutes by default)
node autoUpdatePrices.js
```

---

## 🎛️ Configuration

Edit `.env` to customize auto-updater:

```bash
# Enable/disable auto-update
ENABLE_AUTO_UPDATE=true

# Update interval in minutes (default: 60)
PRICE_UPDATE_INTERVAL=60
```

---

## 📊 What Gets Updated

### Bangalore Areas (12 locations):
- Yeshwanthpur
- KR Market
- Majestic
- Jayanagar
- Indiranagar
- Koramangala
- Whitefield
- HSR Layout
- Electronic City
- Malleshwaram
- Rajajinagar
- BTM Layout

### Products (8-10 commodities):
- Wheat (₹2,500/kg base)
- Rice (₹3,500/kg base)
- Tomato (₹40/kg base)
- Potato (₹30/kg base)
- Mango (₹150/kg base)
- Onion (₹35/kg base)
- Chilli (₹120/kg base)
- Carrot (₹50/kg base)
- Beans (₹60/kg base)
- Cabbage (₹35/kg base)

---

## 🔧 How It Works

### Manual Updater (`updateBangalorePrices.js`)

1. Loads existing prices from `config/marketPrices.json`
2. Generates realistic price variations (±10-15%)
3. Creates new price entries for all Bangalore areas
4. Saves updated prices back to JSON file
5. **Does NOT modify**: Database, routes, components, or any other files

### Auto Updater (`autoUpdatePrices.js`)

1. Runs continuously in background
2. Updates prices at specified interval (default: 60 min)
3. Removes old prices (>1 hour old)
4. Generates time-based prices (peak hours slightly higher)
5. Only touches `config/marketPrices.json`

---

## 📝 Example Output

```
========================================
Bangalore Market Price Updater
========================================

📊 Price Update Summary:
----------------------------------------
Areas Updated: 12
Products per Area: 8
Total New Prices: 96
Total Prices in File: 96

Last Updated: 2026-03-07T08:44:42.907Z

📋 Sample Updated Prices:
----------------------------------------
Wheat      in Yeshwanthpur        : ₹2,346 per kg
Rice       in Yeshwanthpur        : ₹3,196 per kg
Tomato     in Yeshwanthpur        : ₹44 per kg
Potato     in Yeshwanthpur        : ₹29 per kg
Mango      in Yeshwanthpur        : ₹154 per kg

✅ Bangalore market prices updated successfully!
```

---

## 🎯 Key Features

✅ **No Project Changes**
- Only updates `config/marketPrices.json`
- No database modifications
- No route changes
- No component updates

✅ **Realistic Pricing**
- Random variations (±10-15% from base)
- Peak hour adjustments (9 AM-12 PM, 5 PM-8 PM)
- Area-specific pricing

✅ **Flexible Operation**
- Manual one-time updates
- Automatic continuous updates
- Configurable intervals

✅ **Bangalore-Focused**
- 12 major vegetable markets
- All products relevant to Bangalore
- Local pricing patterns

---

## 🕐 Auto-Update Schedule

By default, updates every **60 minutes**:

```
00:00 → Update
01:00 → Update
02:00 → Update
...
23:00 → Update
```

Change interval in `.env`:
```bash
PRICE_UPDATE_INTERVAL=30  # Update every 30 minutes
```

---

## 💾 Data Location

All updated prices are stored in:
```
server/config/marketPrices.json
```

Format:
```json
[
  {
    "id": "price_prod_001_Yeshwanthpur_1741334682907",
    "productId": "prod_001",
    "productName": "Wheat",
    "price": 2346,
    "currency": "INR",
    "unit": "kg",
    "location": "Bangalore",
    "area": "Yeshwanthpur",
    "timestamp": "2026-03-07T08:44:42.907Z"
  }
]
```

---

## 🚀 Usage Examples

### Example 1: Quick Manual Update

```bash
cd server
node updateBangalorePrices.js
```

### Example 2: Replace Old Prices

```bash
cd server
node updateBangalorePrices.js --replace
```

### Example 3: Run Auto-Updater

```bash
cd server
# Set interval to 30 minutes
export PRICE_UPDATE_INTERVAL=30
node autoUpdatePrices.js
```

### Example 4: Background Auto-Update

```bash
cd server
nohup node autoUpdatePrices.js > price_updates.log 2>&1 &
```

---

## 📊 Monitoring

### Check Last Update

View the JSON file:
```bash
cat config/marketPrices.json | grep timestamp | tail -1
```

### View Log (if running in background)

```bash
tail -f price_updates.log
```

---

## ⚠️ Important Notes

1. **File Location**: Prices are saved to `config/marketPrices.json` (not `src/config/`)
2. **No Database Changes**: This script does NOT touch the PostgreSQL database
3. **No Route Changes**: API routes remain unchanged
4. **Append Mode**: By default, keeps old prices and adds new ones
5. **Replace Mode**: Use `--replace` flag to remove old Bangalore prices first

---

## 🐛 Troubleshooting

### Error: "ENOENT: no such file or directory"

The config directory doesn't exist. Create it:
```bash
mkdir -p server/config
```

### Prices Not Updating

Check file permissions:
```bash
ls -la config/marketPrices.json
chmod 644 config/marketPrices.json
```

### Want Different Base Prices?

Edit `updateBangalorePrices.js` and modify the `PRODUCTS` object:
```javascript
const PRODUCTS = {
  'prod_001': { name: 'Wheat', basePrice: 2600, variance: 10 },
  // ... more products
};
```

---

## ✅ Summary

**What this does:**
- ✅ Updates Bangalore market prices in real-time
- ✅ Covers 12 major Bangalore areas
- ✅ Handles 8-10 agricultural products
- ✅ Generates realistic price variations
- ✅ Saves to `config/marketPrices.json` only

**What this DOESN'T do:**
- ❌ Modify database
- ❌ Change API routes
- ❌ Update React components
- ❌ Touch any other project files
- ❌ Require server restart

---

**Last Updated**: March 7, 2026

**Note**: This tool is standalone and only modifies the marketPrices.json file.
