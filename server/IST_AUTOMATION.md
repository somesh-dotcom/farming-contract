# IST Daily Automation System

This document explains the IST (Indian Standard Time, UTC+5:30) based daily automation system for updating market price dates.

## Overview

The system automatically updates all market prices to the current IST date every day at **midnight IST (00:00 IST = 18:30 UTC previous day)**.

## How It Works

### Timezone Handling
- **IST = UTC + 5:30**
- The system calculates the correct IST time and schedules updates accordingly
- All dates are stored in UTC in the database but displayed in IST to users
- Midnight IST triggers the daily update

### Automation Methods

The system provides **three methods** for daily updates:

#### 1. **Server-based Automation (Primary)**
- Runs automatically when the server starts
- Updates immediately on startup
- Schedules daily updates at midnight IST
- Works in local development mode

**Files:**
- `server/src/istDailyAutomation.ts` - Main automation logic
- `server/src/server.ts` - Integrates and starts the automation

**How it works:**
```typescript
// Calculates time until next midnight IST
const msUntilMidnight = getMsUntilMidnightIST();

// Schedules first update at midnight IST
setTimeout(() => {
  updateAllPricesToISTDate();
  
  // Then repeats every 24 hours
  setInterval(updateAllPricesToISTDate, 24 * 60 * 60 * 1000);
}, msUntilMidnight);
```

#### 2. **Manual Script (For Cron Jobs / Manual Execution)**
- Can be run manually anytime
- Perfect for external cron job schedulers
- Works on Vercel serverless deployments

**File:**
- `server/scripts/updatePricesToISTDaily.js`

**Usage:**
```bash
# Using npm script
npm run update-ist-daily

# Or directly
node scripts/updatePricesToISTDaily.js
```

#### 3. **Vercel API Endpoint (For External Triggers)**
- HTTP endpoint that can be called by external cron services
- Perfect for Vercel deployments

**File:**
- `server/api/auto-update-dates.ts`

**Endpoint:**
```
GET /api/auto-update-dates
```

**Example:**
```bash
curl https://your-domain.vercel.app/api/auto-update-dates
```

## Setup & Configuration

### For Local Development

The server-based automation starts automatically when you run:

```bash
cd server
npm run dev
```

You'll see logs like:
```
🚀 [IST Automation] Starting IST-based daily market price date updates...
🔄 [IST Automation] Updating all market prices to current IST date...
⏰ [IST Automation] Next update scheduled at midnight IST (X hours / Y minutes from now)
✅ [IST Automation] Daily automation scheduler initialized successfully
```

### For Vercel Deployment

Since Vercel is serverless, the server doesn't run continuously. Use one of these approaches:

#### Option 1: External Cron Service (Recommended)

Use a free cron service like:
- **Cron-job.org** (https://cron-job.org)
- **EasyCron** (https://www.easycron.com)
- **GitHub Actions** (with scheduled workflows)

**Setup with Cron-job.org:**
1. Create account at cron-job.org
2. Create new cron job
3. Set URL: `https://your-backend.vercel.app/api/auto-update-dates`
4. Schedule: Every day at 00:00 IST (18:30 UTC)
5. Enable the cron job

#### Option 2: GitHub Actions Scheduled Workflow

Create `.github/workflows/update-prices-daily.yml`:

```yaml
name: Daily IST Price Update

on:
  schedule:
    # Runs at 18:30 UTC = 00:00 IST
    - cron: '30 18 * * *'

jobs:
  update-prices:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger IST Update
        run: |
          curl -X GET https://your-backend.vercel.app/api/auto-update-dates
```

#### Option 3: Manual Daily Execution

Run the script manually each day:
```bash
cd server
npm run update-ist-daily
```

## Scheduling Details

### IST Midnight Schedule

| Timezone | Time | Notes |
|----------|------|-------|
| **IST** | 00:00 (midnight) | Indian Standard Time |
| **UTC** | 18:30 (previous day) | Coordinated Universal Time |
| **EST** | 13:30 (previous day) | Eastern Standard Time |
| **PST** | 10:30 (previous day) | Pacific Standard Time |

### Cron Expression

For external schedulers, use this cron expression:
```
30 18 * * *
```
This means: "At 18:30 UTC (00:00 IST) every day"

## Features

### Smart Duplicate Prevention
- Checks if an entry already exists for today's IST date
- Skips updates for product-location combinations that are already updated
- Prevents duplicate entries

### Comprehensive Logging
```
╔══════════════════════════════════════════════════════════╗
║     IST Daily Market Price Date Update                   ║
╚══════════════════════════════════════════════════════════╝

🕐 Current IST time: 2026-04-25T00:00:00.000Z
📅 Target IST date: 2026-04-25
📊 Found 120 total price records

📦 Found 60 unique product-location combinations

✅ product1 @ Bangalore - Indiranagar - Updated to IST date (₹1500)
✅ product2 @ Bangalore - Koramangala - Updated to IST date (₹2000)
⏭️  product3 @ Bangalore - Whitefield - Already updated for today

╔══════════════════════════════════════════════════════════╗
║                    Update Summary                        ║
╚══════════════════════════════════════════════════════════╝
✅ Successfully updated: 58
⏭️  Skipped (already exists): 2
❌ Errors: 0
📊 Total processed: 60
📅 Date set to IST: 2026-04-25

🎉 IST daily date update completed successfully!
```

### Error Handling
- Graceful error handling for each product-location combination
- Continues processing even if individual updates fail
- Provides detailed error counts in summary

## Architecture

### Data Flow

```
┌─────────────────────┐
│   Server Startup    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  Initialize IST Automation  │
│  (istDailyAutomation.ts)    │
└──────────┬──────────────────┘
           │
           ├──────────────────────────┐
           │                          │
           ▼                          ▼
┌──────────────────────┐    ┌────────────────────────┐
│ Immediate Update     │    │ Schedule Next Update   │
│ (Run Now)            │    │ (Midnight IST)         │
└──────────────────────┘    └──────────┬─────────────┘
                                       │
                                       ▼
                            ┌────────────────────────┐
                            │ Calculate Time Until   │
                            │ Next Midnight IST      │
                            └──────────┬─────────────┘
                                       │
                                       ▼
                            ┌────────────────────────┐
                            │ setTimeout → Update    │
                            │ Every 24 Hours         │
                            └────────────────────────┘
```

### Update Logic

```
1. Get current IST time
2. Calculate target date (midnight IST in UTC)
3. Fetch all market prices from database
4. Extract unique product-location combinations
5. For each combination:
   a. Check if today's entry exists
   b. If yes → Skip
   c. If no → Create new entry with today's IST date
6. Log summary statistics
```

## API Functions

### `getCurrentISTTime(): Date`
Returns the current date/time in IST (UTC+5:30)

### `getStartOfISTDay(): Date`
Returns the UTC timestamp representing midnight IST (00:00:00.000 IST)

### `getEndOfISTDay(): Date`
Returns the UTC timestamp representing end of IST day (23:59:59.999 IST)

### `getMsUntilMidnightIST(): number`
Returns milliseconds until the next midnight IST

### `updateAllPricesToISTDate(): Promise<number>`
Updates all market prices to current IST date. Returns count of updated records.

### `startISTDailyAutomation(): void`
Initializes the daily automation system. Called on server startup.

## Testing

### Test the Script Manually

```bash
cd server
npm run update-ist-daily
```

### Check Server Logs

Start the server and watch for IST automation logs:
```bash
cd server
npm run dev
```

### Verify Database Entries

Use Prisma Studio to check the dates:
```bash
cd server
npm run prisma:studio
```

Check that `marketPrices` table has entries with today's IST date.

## Troubleshooting

### Updates Not Running

**Issue:** Server automation not triggering

**Solution:**
1. Check server logs for IST automation initialization
2. Verify server is running continuously (not serverless)
3. For Vercel, use external cron service instead

### Wrong Date in Database

**Issue:** Dates showing previous day or wrong timezone

**Solution:**
1. Verify server timezone settings
2. Check IST offset calculation (5.5 hours = 19,800,000 ms)
3. Ensure database stores UTC timestamps

### Duplicate Entries

**Issue:** Multiple entries for same day

**Solution:**
The system already has duplicate prevention. If duplicates occur:
1. Check the `getStartOfISTDay()` and `getEndOfISTDay()` functions
2. Verify date range query in `updateAllPricesToISTDate()`

### Serverless Deployment (Vercel)

**Issue:** Automation not working on Vercel

**Solution:**
Vercel is serverless, so `setTimeout`/`setInterval` won't work. Use:
1. External cron service calling `/api/auto-update-dates`
2. GitHub Actions scheduled workflow
3. Manual script execution

## Best Practices

1. **Monitor Logs:** Check server logs regularly to ensure updates are running
2. **Verify Dates:** Periodically check database for correct dates
3. **Use External Cron for Production:** Don't rely on server-based automation for production
4. **Keep Server Running:** For local development, ensure server stays running
5. **Error Alerts:** Set up alerts for failed updates (can be added to API endpoint)

## Future Enhancements

- [ ] Add email notifications for failed updates
- [ ] Add retry mechanism for failed updates
- [ ] Add admin dashboard to view update history
- [ ] Support for multiple timezones
- [ ] Price fluctuation during updates (currently keeps same prices)
- [ ] Webhook notifications after successful updates

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Test with manual script execution
4. Verify database entries in Prisma Studio

---

**Last Updated:** April 25, 2026  
**Timezone:** IST (UTC+5:30)  
**Schedule:** Daily at midnight IST (00:00 IST = 18:30 UTC)
