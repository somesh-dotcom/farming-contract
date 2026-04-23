#!/bin/bash

# Backend Deployment Helper Script
# This script helps you deploy your backend to Railway or Render

echo "=========================================="
echo "Backend Deployment Helper"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized"
    echo "Run: git init"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes."
    echo ""
    read -p "Do you want to commit them? (y/n): " commit_choice
    
    if [ "$commit_choice" = "y" ]; then
        read -p "Commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
    fi
fi

echo ""
echo "Choose deployment platform:"
echo "1. Railway (Recommended)"
echo "2. Render"
echo "3. Just show me what to do"
echo ""
read -p "Select option (1/2/3): " platform_choice

echo ""
case $platform_choice in
    1)
        echo "🚀 Railway Deployment Steps:"
        echo ""
        echo "1. Push your code to GitHub:"
        echo "   git push origin main"
        echo ""
        echo "2. Go to https://railway.app/"
        echo "   - Click 'New Project'"
        echo "   - Select 'Deploy from GitHub repo'"
        echo "   - Choose your repository"
        echo ""
        echo "3. Add PostgreSQL database in Railway:"
        echo "   - Click '+ New' → 'Database' → 'Add PostgreSQL'"
        echo ""
        echo "4. Set environment variables in Railway:"
        echo "   - JWT_SECRET=your-secret-key-min-32-chars"
        echo "   - CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app"
        echo "   - PORT=8080"
        echo "   - DATABASE_URL=<copy from your PostgreSQL service>"
        echo ""
        echo "5. Railway will auto-deploy using railway.json"
        echo ""
        echo "6. After deployment, copy your backend URL"
        echo "   Example: https://your-app.railway.app"
        echo ""
        echo "7. Update Vercel environment variable:"
        echo "   VITE_API_URL=https://your-app.railway.app"
        echo ""
        ;;
    2)
        echo "🚀 Render Deployment Steps:"
        echo ""
        echo "1. Push your code to GitHub:"
        echo "   git push origin main"
        echo ""
        echo "2. Go to https://render.com/"
        echo "   - Click 'New +' → 'Web Service'"
        echo "   - Connect your repository"
        echo ""
        echo "3. Configure service:"
        echo "   - Name: agri-trading-backend"
        echo "   - Root Directory: server-java"
        echo "   - Environment: Java"
        echo "   - Build Command: mvn clean package -DskipTests"
        echo "   - Start Command: java -jar target/*.jar"
        echo ""
        echo "4. Add PostgreSQL database:"
        echo "   - Click 'New +' → 'PostgreSQL'"
        echo "   - Database Name: contract_farming"
        echo ""
        echo "5. Set environment variables:"
        echo "   - JAVA_VERSION=17"
        echo "   - JWT_SECRET=your-secret-key-min-32-chars"
        echo "   - CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app"
        echo "   - PORT=8080"
        echo "   - DATABASE_URL=<copy from your PostgreSQL database>"
        echo ""
        echo "6. Render will auto-deploy"
        echo ""
        echo "7. After deployment, copy your backend URL"
        echo "   Example: https://agri-trading-backend.onrender.com"
        echo ""
        echo "8. Update Vercel environment variable:"
        echo "   VITE_API_URL=https://your-app.onrender.com"
        echo ""
        ;;
    3)
        echo "📋 Manual Deployment Instructions:"
        echo ""
        echo "Backend Configuration (Already Done):"
        echo "✅ CORS configured with environment variables"
        echo "✅ Health check endpoint added at /api/health"
        echo "✅ railway.json and render.yaml configured"
        echo ""
        echo "What you need to do:"
        echo ""
        echo "1. Choose a platform: Railway or Render"
        echo "2. Create account and connect GitHub repo"
        echo "3. Provision PostgreSQL database"
        echo "4. Set environment variables:"
        echo "   - DATABASE_URL (from your database)"
        echo "   - JWT_SECRET (generate a strong key)"
        echo "   - CORS_ALLOWED_ORIGINS (your Vercel URL)"
        echo "   - PORT=8080"
        echo "5. Deploy (platform will use railway.json or render.yaml)"
        echo "6. Copy backend URL"
        echo "7. Update VITE_API_URL in Vercel settings"
        echo "8. Redeploy frontend"
        echo ""
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo "=========================================="
echo "Environment Variables Summary"
echo "=========================================="
echo ""
echo "Backend (Railway/Render):"
echo "  DATABASE_URL=<postgresql-connection-string>"
echo "  JWT_SECRET=your-secret-key-min-32-chars"
echo "  CORS_ALLOWED_ORIGINS=https://client-chi-lilac.vercel.app"
echo "  PORT=8080"
echo ""
echo "Frontend (Vercel):"
echo "  VITE_API_URL=https://your-backend-url.railway.app"
echo ""
echo "=========================================="
echo "Good luck with your deployment! 🎉"
echo "=========================================="
