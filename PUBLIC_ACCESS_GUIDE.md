# 🌐 Public Access Guide

## Quick Start - After Closing Qoder or When Tunnels Stop

### Option 1: One-Command Restart (Recommended)

Open **Terminal** (not Qoder) and run:

```bash
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated"
./restart-tunnels.sh
```

This script will automatically:
- ✅ Start backend if not running
- ✅ Create backend tunnel
- ✅ Start frontend with correct backend URL
- ✅ Create frontend tunnel
- ✅ Give you the new public URL

---

### Option 2: Manual Restart (4 Steps)

If the script doesn't work, open **4 separate Terminal windows** and run:

**Terminal 1 - Backend:**
```bash
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated/server"
npm run dev
```

**Terminal 2 - Frontend:** (Wait for backend to start, then run this)
```bash
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated/client"
npm run dev
```

**Terminal 3 - Backend Tunnel:**
```bash
cloudflared tunnel --url http://localhost:5004
```
*Note the URL it gives you (e.g., https://xxx.trycloudflare.com)*

**Terminal 4 - Frontend Tunnel:** (Replace URL with your backend URL from Terminal 3)
```bash
# First, kill the frontend and restart with backend URL
# Press Ctrl+C in Terminal 2, then run:
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated/client"
VITE_API_URL=https://YOUR-BACKEND-URL.trycloudflare.com npm run dev
```

Then create a new frontend tunnel:
```bash
cloudflared tunnel --url http://localhost:3001
```

---

## Important Notes

⚠️ **Why URLs Change Every Time:**
- Cloudflare Quick Tunnels are FREE and temporary
- Each time you restart, you get a NEW random URL
- This is normal and expected

⚠️ **Keep Terminals Open:**
- As long as the Terminal windows stay open, the URLs work
- Closing Terminals = URLs stop working
- Just run the restart script again to get new URLs

---

## Current Public URL

After running the restart script, you'll see your new public URL in the terminal.
It will look like: `https://something-random.trycloudflare.com`

---

## Troubleshooting

**Problem:** Port already in use
**Solution:** 
```bash
lsof -ti:5004 | xargs kill -9  # For backend
lsof -ti:3001 | xargs kill -9  # For frontend
```

**Problem:** cloudflared not found
**Solution:** 
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Problem:** Need to restart everything
**Solution:** 
```bash
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated"
./restart-tunnels.sh
```

---

## Need Help?

Just run the restart script - it handles everything automatically!

```bash
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated"
./restart-tunnels.sh
```
