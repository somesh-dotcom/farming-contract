#!/bin/bash

# Quick Restart Script for Agricultural Trading Platform
# Run this script whenever tunnels stop or after closing Qoder

echo "🚀 Restarting Agricultural Trading Platform with Public URLs"
echo "=============================================================="
echo ""

# Kill any existing cloudflared processes
echo "🧹 Cleaning up old tunnels..."
pkill -f "cloudflared tunnel --url" 2>/dev/null
sleep 2

# Check if backend is running
if lsof -i:5004 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 5004"
else
    echo "❌ Backend is NOT running! Starting it..."
    cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated/server"
    npm run dev &
    sleep 5
    cd ..
fi

# Check if frontend is running
if lsof -i:3001 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3001"
else
    echo "❌ Frontend is NOT running! Starting it..."
    # We'll start it after getting the backend URL
fi

echo ""
echo "🌐 Creating backend tunnel..."
# Create backend tunnel and capture the URL
BACKEND_OUTPUT=$(timeout 15 cloudflared tunnel --url http://localhost:5004 2>&1 || true)
BACKEND_URL=$(echo "$BACKEND_OUTPUT" | grep -o 'https://[^"]*trycloudflare\.com' | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Failed to create backend tunnel. Trying again..."
    cloudflared tunnel --url http://localhost:5004 &
    BACKEND_PID=$!
    sleep 10
    # Kill the background process
    kill $BACKEND_PID 2>/dev/null
    echo "Please manually check the backend tunnel URL from the terminal above"
    read -p "Enter backend URL: " BACKEND_URL
fi

echo "✅ Backend URL: $BACKEND_URL"
echo ""

# Kill existing frontend if running
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "🔄 Restarting frontend with new backend URL..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start frontend with the backend URL
echo "🚀 Starting frontend..."
cd "/Users/somesh/Desktop/Final Year project/major project 2(java) updated/client"
VITE_API_URL=$BACKEND_URL npm run dev &
FRONTEND_PID=$!
sleep 5
cd ..

echo ""
echo "🌐 Creating frontend tunnel..."
cloudflared tunnel --url http://localhost:3001

echo ""
echo "🎉 Done! Your application is now publicly accessible!"
