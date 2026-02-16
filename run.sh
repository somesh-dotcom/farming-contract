#!/bin/bash

# Contract Farming System - Run Script
# This script helps you run the application

echo "🚀 Contract Farming System - Setup & Run"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  Warning: server/.env file not found"
    echo "Creating default .env file..."
    cat > server/.env << 'EOF'
DATABASE_URL="postgresql://postgres@localhost:5432/contract_farming?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
EOF
    echo "✅ Created server/.env file"
    echo "⚠️  Please edit server/.env with your database credentials before continuing"
    echo ""
fi

# Check if dependencies are installed
if [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
    echo ""
fi

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Setup database (run migrations)"
echo "2) Seed database (add sample data)"
echo "3) Start the application"
echo "4) Do everything (setup + seed + start)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "📊 Setting up database..."
        cd server
        npm run prisma:generate
        npm run prisma:migrate
        cd ..
        ;;
    2)
        echo "🌱 Seeding database..."
        cd server
        npm run seed
        cd ..
        ;;
    3)
        echo "🚀 Starting application..."
        npm run dev
        ;;
    4)
        echo "📊 Setting up database..."
        cd server
        npm run prisma:generate
        npm run prisma:migrate
        echo ""
        echo "🌱 Seeding database..."
        npm run seed
        cd ..
        echo ""
        echo "🚀 Starting application..."
        npm run dev
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

