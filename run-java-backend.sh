#!/bin/bash

# Java Spring Boot Backend - Build and Run Script

echo "🚀 Building Agricultural Trading Platform - Java Spring Boot Backend"
echo "=================================================================="

# Change to server-java directory
cd "$(dirname "$0")/server-java"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    echo "   Download from: https://maven.apache.org/download.cgi"
    exit 1
fi

echo "✅ Maven found: $(mvn --version)"
echo ""

# Clean and build
echo "🔨 Cleaning and building project..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting Spring Boot application..."
    echo "   Server will run on: http://localhost:5000"
    echo "   API endpoints available at: http://localhost:5000/api/*"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    # Run the application
    mvn spring-boot:run
else
    echo "❌ Build failed!"
    exit 1
fi
