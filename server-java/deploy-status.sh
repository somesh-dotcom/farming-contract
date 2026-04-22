#!/bin/bash

# Railway Deployment Helper Script
# This script helps you complete the Railway deployment

echo "🚂 Railway Deployment - Next Steps"
echo "=================================="
echo ""

# Check current status
echo "Checking deployment status..."
railway service status
echo ""

# Check if build is complete
STATUS=$(railway service status 2>&1 | grep "Status:" | awk '{print $2}')

if [ "$STATUS" = "DEPLOYED" ]; then
    echo "✅ Backend is deployed!"
    echo ""
    echo "Getting your backend URL..."
    railway domain
    echo ""
else
    echo "⏳ Backend is still building or needs configuration..."
    echo ""
    echo "📋 NEXT STEPS (You need to do these in Railway Dashboard):"
    echo ""
    echo "1. Add PostgreSQL Database:"
    echo "   👉 Open: https://railway.com/project/d3c2ebda-1a14-4451-bddf-d79b0299f2ed"
    echo "   👉 Click '+' → Database → PostgreSQL"
    echo ""
    echo "2. Set Environment Variables:"
    echo "   👉 Go to your service → Variables tab"
    echo "   👉 Add these variables:"
    echo ""
    echo "      JWT_SECRET=agri-trading-super-secret-key-2024-production"
    echo "      CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://client-chi-lilac.vercel.app"
    echo "      PORT=8080"
    echo ""
    echo "3. After adding database and variables, the service will auto-redeploy"
    echo ""
fi

echo ""
echo "📊 Monitor Deployment:"
echo "   View Logs: railway logs --follow"
echo "   Check Status: railway service status"
echo "   Get URL: railway domain"
echo ""
echo "🌐 Railway Dashboard:"
echo "   https://railway.com/dashboard"
echo ""
