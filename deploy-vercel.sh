#!/bin/bash

# Vercel Deployment Helper Script
# This script helps you deploy your application

echo "🚀 Agri Trading System - Deployment Helper"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi

echo "✅ Vercel CLI detected"
echo ""

# Ask user what they want to deploy
echo "What do you want to deploy?"
echo "1) Frontend only (to Vercel)"
echo "2) Backend only (to Railway)"
echo "3) Both"
echo ""
read -p "Enter your choice (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "🎨 Deploying Frontend to Vercel..."
        echo ""
        cd client
        echo "📦 Building frontend..."
        npm run build
        echo ""
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        echo ""
        echo "✅ Frontend deployed!"
        ;;
    2)
        echo ""
        echo "🔧 Backend Deployment"
        echo ""
        echo "Railway deployment is automatic when you push to GitHub."
        echo ""
        echo "Steps to deploy backend:"
        echo "1. Push your code to GitHub:"
        echo "   git add ."
        echo "   git commit -m 'Update backend'"
        echo "   git push origin main"
        echo ""
        echo "2. Railway will automatically build and deploy"
        echo ""
        echo "3. Get your backend URL from Railway dashboard"
        echo ""
        ;;
    3)
        echo ""
        echo "🚀 Deploying Both Frontend and Backend..."
        echo ""
        echo "Step 1: Deploy Backend to Railway"
        echo "-----------------------------------"
        echo "Push your code to GitHub:"
        echo "  git add ."
        echo "  git commit -m 'Deploy to production'"
        echo "  git push origin main"
        echo ""
        echo "Railway will automatically deploy the backend."
        echo ""
        read -p "Press Enter after Railway deployment is complete..."
        echo ""
        
        echo "Step 2: Get Backend URL from Railway"
        echo "--------------------------------------"
        echo "Go to: https://railway.app/dashboard"
        echo "Copy your backend URL (e.g., https://your-app.railway.app)"
        echo ""
        read -p "Enter your Railway backend URL: " backend_url
        echo ""
        
        echo "Step 3: Update Frontend Configuration"
        echo "---------------------------------------"
        echo "Updating client/vercel.json with backend URL..."
        
        # Update vercel.json with the backend URL
        cd client
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|https://your-backend-url.railway.app|${backend_url}|g" vercel.json
        else
            # Linux
            sed -i "s|https://your-backend-url.railway.app|${backend_url}|g" vercel.json
        fi
        
        echo "✅ Updated vercel.json"
        echo ""
        
        echo "Step 4: Deploy Frontend to Vercel"
        echo "-----------------------------------"
        echo "📦 Building frontend..."
        npm run build
        echo ""
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        echo ""
        
        echo "Step 5: Commit Changes"
        echo "-----------------------"
        cd ..
        git add client/vercel.json
        git commit -m "Update backend URL for production deployment"
        git push origin main
        echo ""
        
        echo "✅ Both frontend and backend deployed!"
        echo ""
        echo "Frontend: Check Vercel dashboard for URL"
        echo "Backend: $backend_url"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Test your application"
echo "2. Check logs in Vercel and Railway dashboards"
echo "3. Configure custom domain (optional)"
echo ""
