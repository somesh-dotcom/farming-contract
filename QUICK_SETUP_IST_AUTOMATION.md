# Quick Setup Guide: IST Daily Automation

## 🎯 What This Does

Automatically updates all market prices to the current IST date **every day at midnight IST (00:00 IST = 18:30 UTC)**.

---

## ✅ Setup Complete!

The automation system has been set up with the following components:

### 1. **Server-Based Automation** (For Local Development)
- ✅ Created: `server/src/istDailyAutomation.ts`
- ✅ Integrated: `server/src/server.ts`
- ✅ Starts automatically when you run `npm run dev`

### 2. **Manual Script** (For Cron Jobs / Vercel)
- ✅ Created: `server/scripts/updatePricesToISTDaily.js`
- ✅ Added npm script: `npm run update-ist-daily`

### 3. **GitHub Actions Workflow** (For Vercel Deployments)
- ✅ Created: `.github/workflows/daily-ist-update.yml`
- ⚠️ **Action Required:** Add `DATABASE_URL` secret to GitHub repository

---

## 🚀 How to Use

### For Local Development

Just start your server as usual:

```bash
cd server
npm run dev
```

You'll see logs like:
```
🚀 [IST Automation] Starting IST-based daily market price date updates...
🔄 [IST Automation] Updating all market prices to current IST date...
⏰ [IST Automation] Next update scheduled at midnight IST (X hours from now)
✅ [IST Automation] Daily automation scheduler initialized successfully
```

**That's it!** The server will automatically update prices every day at midnight IST.

---

### For Vercel Deployment (Production)

Since Vercel is serverless, you need to use an external scheduler. Choose **ONE** of these options:

#### Option 1: GitHub Actions (Recommended) ✅

**Setup Steps:**

1. **Add Database URL to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `DATABASE_URL`
   - Value: Your database connection string (same as in Vercel)
   - Click "Add secret"

2. **Push the Workflow File:**
   ```bash
   git add .github/workflows/daily-ist-update.yml
   git commit -m "Add IST daily automation workflow"
   git push origin main
   ```

3. **Verify Workflow:**
   - Go to GitHub repository → Actions tab
   - You should see "Daily IST Market Price Update" workflow
   - It will run automatically every day at 00:00 IST
   - You can also trigger it manually by clicking "Run workflow"

**Schedule:** Daily at 00:00 IST (18:30 UTC)

---

#### Option 2: External Cron Service

Use a free cron service to call the API endpoint:

**Recommended Services:**
- [Cron-job.org](https://cron-job.org) (Free)
- [EasyCron](https://www.easycron.com) (Free tier)
- [UptimeRobot](https://uptimerobot.com) (Free tier)

**Setup with Cron-job.org:**

1. Create account at [cron-job.org](https://cron-job.org)
2. Click "Create Cronjob"
3. Configure:
   - **Title:** IST Daily Price Update
   - **URL:** `https://your-backend.vercel.app/api/auto-update-dates`
   - **Schedule:** 
     - Hour: 18
     - Minute: 30
     - (This is 00:00 IST)
   - **Timezone:** UTC
4. Save and enable

**Verification:**
- Check the execution history in cron-job.org dashboard
- Verify database entries have correct dates

---

#### Option 3: Manual Daily Execution

Run the script manually each day:

```bash
cd server
npm run update-ist-daily
```

---

## 🧪 Testing

### Test the Automation Now

You can test it immediately without waiting for midnight:

```bash
cd server
npm run update-ist-daily
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════╗
║     IST Daily Market Price Date Update                   ║
╚══════════════════════════════════════════════════════════╝

🕐 Current IST time: 2026-04-25T...
📅 Target IST date: 2026-04-25
📊 Fetching market prices...

📊 Found 120 total price records

📦 Found 60 unique product-location combinations

✅ product1 @ Bangalore - Indiranagar - Updated to IST date (₹1500)
✅ product2 @ Bangalore - Koramangala - Updated to IST date (₹2000)
...

╔══════════════════════════════════════════════════════════╗
║                    Update Summary                        ║
╚══════════════════════════════════════════════════════════╝
✅ Successfully updated: 60
⏭️  Skipped (already exists): 0
❌ Errors: 0
📊 Total processed: 60
📅 Date set to IST: 2026-04-25

🎉 IST daily date update completed successfully!
```

### Verify in Database

Check that prices have today's IST date:

```bash
cd server
npm run prisma:studio
```

Navigate to `MarketPrice` table and check the `date` column.

---

## 📊 Monitoring

### Check Server Logs (Local Development)

```bash
cd server
npm run dev
```

Look for `[IST Automation]` logs.

### Check GitHub Actions (Production)

1. Go to GitHub repository → Actions tab
2. Click on "Daily IST Market Price Update" workflow
3. View execution history and logs
4. Check for success/failure status

### Check Vercel Logs (If using API endpoint)

1. Go to Vercel dashboard
2. Select your backend project
3. Navigate to Logs tab
4. Filter for "auto-update-dates"

---

## ⏰ Schedule Information

| Timezone | Time | Notes |
|----------|------|-------|
| **IST** | 00:00 (midnight) | ✅ Indian Standard Time |
| **UTC** | 18:30 (previous day) | Coordinated Universal Time |
| **EST** | 13:30 (previous day) | Eastern Standard Time |
| **PST** | 10:30 (previous day) | Pacific Standard Time |

**Cron Expression:** `30 18 * * *` (18:30 UTC = 00:00 IST)

---

## 🔧 Configuration

### Change Update Time

If you want to update at a different IST time (e.g., 6:00 AM IST instead of midnight):

1. **For GitHub Actions:**
   - Edit `.github/workflows/daily-ist-update.yml`
   - Change cron expression:
     - 6:00 AM IST = 00:30 UTC
     - New cron: `30 0 * * *`

2. **For Server Automation:**
   - Edit `server/src/istDailyAutomation.ts`
   - Modify `getMsUntilMidnightIST()` function
   - Change target hour from 0 to 6

3. **For External Cron:**
   - Update the schedule in your cron service
   - 6:00 AM IST = 00:30 UTC

---

## ❓ Troubleshooting

### Server automation not running?

**Check:**
1. Server is running (`npm run dev`)
2. Look for `[IST Automation]` logs on startup
3. Verify no errors in console

### GitHub Actions workflow failed?

**Check:**
1. `DATABASE_URL` secret is added to GitHub repository
2. Workflow file is pushed to main branch
3. Check workflow logs for specific errors

### Wrong date in database?

**Check:**
1. Server timezone settings
2. IST offset is correct (5.5 hours = 19,800,000 ms)
3. Database stores UTC timestamps

### Updates running twice?

**Possible Causes:**
- Both server automation AND external cron are running
- Multiple server instances running

**Solution:**
- Use ONLY ONE method for production
- For local dev: server automation is fine
- For Vercel: use external cron or GitHub Actions

---

## 📝 Important Notes

1. **Server-Based Automation:**
   - ✅ Works in local development
   - ❌ Does NOT work on Vercel (serverless)
   - Requires server to be running 24/7

2. **GitHub Actions / External Cron:**
   - ✅ Works on Vercel (serverless)
   - ✅ More reliable for production
   - Independent of server runtime

3. **Duplicate Prevention:**
   - System automatically checks for existing entries
   - Won't create duplicates if run multiple times
   - Safe to test multiple times

4. **Database:**
   - Dates stored in UTC
   - Displayed in IST to users
   - Midnight IST = 18:30 UTC previous day

---

## 🎉 You're All Set!

The IST automation system is now configured and ready to use.

**Next Steps:**
1. ✅ Test it now: `cd server && npm run update-ist-daily`
2. ✅ For production: Add `DATABASE_URL` to GitHub secrets
3. ✅ Monitor logs to ensure it's working
4. ✅ Verify database has correct dates

**Questions?** Check the full documentation: `server/IST_AUTOMATION.md`

---

**Last Updated:** April 25, 2026  
**Timezone:** IST (UTC+5:30)  
**Schedule:** Daily at midnight IST (00:00 IST = 18:30 UTC)
