#!/bin/bash

# Test Backend Connection Script
# Usage: bash test-connection.sh <backend-url>

if [ -z "$1" ]; then
    echo "❌ Please provide your backend URL"
    echo "Usage: bash test-connection.sh https://your-backend.railway.app"
    exit 1
fi

BACKEND_URL=$1

echo "=========================================="
echo "Testing Backend Connection"
echo "=========================================="
echo "Backend URL: $BACKEND_URL"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health check passed (HTTP 200)"
    echo ""
    echo "Response:"
    curl -s "$BACKEND_URL/api/health" | python3 -m json.tool 2>/dev/null || curl -s "$BACKEND_URL/api/health"
else
    echo "❌ Health check failed (HTTP $HEALTH_RESPONSE)"
fi
echo ""

# Test 2: CORS Headers
echo "Test 2: CORS Configuration"
echo "-------------------------"
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/health" \
  -H "Origin: https://client-chi-lilac.vercel.app" \
  -H "Access-Control-Request-Method: GET" | grep -i "access-control")

if [ -n "$CORS_RESPONSE" ]; then
    echo "✅ CORS headers present"
    echo "$CORS_RESPONSE"
else
    echo "⚠️  CORS headers not found (may still work)"
fi
echo ""

# Test 3: Products Endpoint (Public)
echo "Test 3: Products Endpoint"
echo "------------------------"
PRODUCTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/products")
if [ "$PRODUCTS_RESPONSE" = "200" ]; then
    echo "✅ Products endpoint accessible (HTTP 200)"
else
    echo "⚠️  Products endpoint returned HTTP $PRODUCTS_RESPONSE"
fi
echo ""

# Test 4: Market Prices Endpoint (Public)
echo "Test 4: Market Prices Endpoint"
echo "-----------------------------"
PRICES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/market-prices")
if [ "$PRICES_RESPONSE" = "200" ]; then
    echo "✅ Market prices endpoint accessible (HTTP 200)"
else
    echo "⚠️  Market prices endpoint returned HTTP $PRICES_RESPONSE"
fi
echo ""

# Test 5: Auth Endpoint (Should exist)
echo "Test 5: Auth Endpoint"
echo "--------------------"
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}')
if [ "$AUTH_RESPONSE" = "401" ] || [ "$AUTH_RESPONSE" = "400" ]; then
    echo "✅ Auth endpoint exists (expected error: HTTP $AUTH_RESPONSE)"
else
    echo "⚠️  Auth endpoint returned HTTP $AUTH_RESPONSE"
fi
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "If all tests passed, your backend is ready!"
echo "Next step: Update VITE_API_URL in Vercel settings"
echo ""
echo "Frontend URL: https://client-chi-lilac.vercel.app"
echo "Backend URL:  $BACKEND_URL"
echo ""
