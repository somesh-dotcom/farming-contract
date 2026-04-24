# Automatic Daily Date Update Setup (IST Timezone)

## Overview
The system now automatically updates all Bangalore area market prices to the current IST (UTC+5:30) date every day at midnight IST.

## How It Works

### API Endpoint
- **URL**: `https://server-theta-lime-34.vercel.app/api/auto-update-dates`
- **Method**: GET
- **Function**: Updates all Bangalore area prices to today's IST date (keeps prices same, only changes date)
- **Timezone**: Automatically calculates IST (UTC+5:30)

### Manual Trigger
You can manually trigger the update by visiting:
```
https://server-theta-lime-34.vercel.app/api/auto-update-dates
```

### Automatic Daily Trigger (Setup Required)

To automate this to run every day at midnight IST, use one of these free cron services:

#### Option 1: Cron-Job.org (Recommended - Free)
1. Go to https://cron-job.org
2. Sign up for a free account
3. Click "Create Cron Job"
4. Configure:
   - **Title**: Market Prices Daily Update
   - **URL**: `https://server-theta-lime-34.vercel.app/api/auto-update-dates`
   - **Schedule**: 
     - Select "Every day"
     - Set time to: `00:00` (midnight)
     - Timezone: Select `Asia/Kolkata (IST, UTC+5:30)`
   - **Execution Timezone**: Asia/Kolkata
5. Save and activate

#### Option 2: UptimeRobot (Free)
1. Go to https://uptimerobot.com
2. Sign up for free account
3. Add New Monitor
4. Configure:
   - **Friendly Name**: Market Prices Auto Update
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://server-theta-lime-34.vercel.app/api/auto-update-dates`
   - **Monitoring Interval**: Every 1440 minutes (24 hours)
   - **Advanced**: Set custom time to 00:00 IST
5. Create Monitor

#### Option 3: GitHub Actions (Free)
1. Create a file `.github/workflows/daily-update.yml` in any repository
2. Add this content:

```yaml
name: Daily Market Price Update

on:
  schedule:
    # Runs at 18:30 UTC = 00:00 IST (next day)
    - cron: '30 18 * * *'

jobs:
  trigger-update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger IST Date Update
        run: |
          curl -X GET https://server-theta-lime-34.vercel.app/api/auto-update-dates
```

## Response Format

Success response:
```json
{
  "message": "Daily IST date update completed successfully",
  "timestamp": "2026-04-24T18:30:00.000Z",
  "istTime": "2026-04-25T00:00:00.000Z",
  "updated": 160,
  "skipped": 0,
  "total": 160
}
```

## What Gets Updated

- **20 Bangalore areas** × **8 products** = **160 entries**
- **Prices**: Stay the same (no change)
- **Dates**: Updated to current IST date (midnight)
- **Locations**: All Bangalore areas including:
  - Indiranagar, Koramangala, Whitefield, HSR Layout, BTM Layout
  - Jayanagar, Malleshwaram, Electronic City, Marathahalli, Bannerghatta
  - Hebbal, Yelahanka, Frazer Town, RT Nagar, Peenya
  - Banashankari, Basavanagudi, Wilson Garden, Ulsoor, KR Puram

## Timezone Handling

The system automatically:
1. Gets current UTC time
2. Converts to IST (UTC + 5:30)
3. Creates entries at start of IST day (00:00 IST)
4. Stores in database as UTC

## Testing

To test the endpoint:
```bash
curl https://server-theta-lime-34.vercel.app/api/auto-update-dates
```

To check if dates are updated:
```bash
curl https://server-theta-lime-34.vercel.app/api/market-prices?latest=true
```

## Notes

- The endpoint can be called multiple times per day (it skips if already updated)
- No authentication required (public endpoint for cron jobs)
- Idempotent: Safe to call multiple times
- Takes ~2-3 seconds to complete
- Updates all 160 Bangalore area price entries

## Troubleshooting

If dates are not updating:
1. Check the endpoint manually: Visit the URL in browser
2. Check Vercel logs: https://vercel.com/dashboard → server project → Logs
3. Verify database connection is working
4. Ensure cron job is configured with IST timezone
