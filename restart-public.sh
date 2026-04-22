#!/bin/bash

# Simple Restart Script - Just run this and follow the prompts

echo "🚀 Restarting Public Access"
echo "==========================="
echo ""

# Step 1: Kill old tunnels
echo "🧹 Stopping old tunnels..."
pkill -f "cloudflared tunnel --url" 2>/dev/null
sleep 2

# Step 2: Start backend tunnel
echo ""
echo "📡 Step 1: Creating backend tunnel..."
echo "⏳ Waiting 10 seconds for tunnel to start..."
cloudflared tunnel --url http://localhost:5004 &
BACKEND_PID=$!
sleep 10

echo ""
echo "📝 Look at the terminal output above for a URL like:"
echo "   https://something.trycloudflare.com"
echo ""
read -p "👉 Paste the BACKEND URL here: " BACKEND_URL

# Step 3: Stop the background tunnel process
kill $BACKEND_PID 2>/dev/null
wait $BACKEND_PID 2>/dev/null

# Step 4: Kill old frontend
echo ""
echo "🔄 Restarting frontend..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 2

# Step 5: Start frontend with backend URL
echo "🚀 Starting frontend with backend URL..."
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated/client"
VITE_API_URL=$BACKEND_URL npm run dev &
sleep 5

# Step 6: Create frontend tunnel
echo ""
echo "📡 Step 2: Creating frontend tunnel..."
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated"
cloudflared tunnel --url http://localhost:3001
