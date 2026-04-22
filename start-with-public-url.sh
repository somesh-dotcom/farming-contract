#!/bin/bash

# Start Agricultural Trading Platform with Public URLs
# This script restarts the frontend to use the public backend URL

echo "🚀 Starting Agricultural Trading Platform with Public Access"
echo "============================================================"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ Error: cloudflared is not installed"
    echo "Install it with: brew install cloudflare/cloudflare/cloudflared"
    exit 1
fi

echo "✅ cloudflared is installed"
echo ""

# Kill any existing cloudflared processes
echo "🧹 Cleaning up existing tunnels..."
pkill -f "cloudflared tunnel --url" 2>/dev/null
sleep 2

# Backend is already running on port 5004
echo "✅ Backend server should be running on port 5004"
echo ""

# Create tunnel for backend
echo "🌐 Creating public URL for backend..."
BACKEND_TUNNEL=$(cloudflared tunnel --url http://localhost:5004 --log-level fatal 2>&1 & )
sleep 5

# Extract the backend URL (this is tricky, so we'll do it manually)
echo ""
echo "⏳ Waiting for backend tunnel to be created..."
echo "Please wait 10 seconds..."
sleep 10

echo ""
echo "📝 Backend tunnel created!"
echo ""

# For now, we need to manually set the backend URL
# In a real scenario, you'd parse the cloudflared output
echo "🔧 Please provide your backend public URL"
echo "   (It should look like: https://something.trycloudflare.com)"
read -p "Enter backend URL: " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

echo ""
echo "✅ Backend URL: $BACKEND_URL"
echo ""

# Kill existing frontend process
echo "🧹 Stopping existing frontend server..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 2

# Start frontend with public API URL
echo "🚀 Starting frontend with public API URL..."
cd client
VITE_API_URL=$BACKEND_URL npm run dev &
FRONTEND_PID=$!
cd ..

sleep 5

# Create tunnel for frontend
echo ""
echo "🌐 Creating public URL for frontend..."
cloudflared tunnel --url http://localhost:3001

echo ""
echo "🎉 Setup Complete!"
echo "Your application is now publicly accessible!"
