#!/bin/bash

# Test script pour vérifier le déploiement Railway
BACKEND_URL="https://ton-backend.railway.app"

echo "🧪 Test du déploiement IntoWork Backend"
echo "======================================"

# Test 1: Health Check
echo "1️⃣  Test Health Check..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/ping)
if [ "$response" = "200" ]; then
    echo "✅ Health Check: OK"
    curl -s $BACKEND_URL/api/ping | jq .
else
    echo "❌ Health Check: FAILED (HTTP $response)"
fi

echo ""

# Test 2: Database Connection
echo "2️⃣  Test Database Connection..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/users)
if [ "$response" = "200" ]; then
    echo "✅ Database: Connected"
else
    echo "❌ Database: Connection Failed (HTTP $response)"
fi

echo ""

# Test 3: API Documentation
echo "3️⃣  Test API Documentation..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/docs)
if [ "$response" = "200" ]; then
    echo "✅ API Docs: Available at $BACKEND_URL/docs"
else
    echo "❌ API Docs: Not accessible (HTTP $response)"
fi

echo ""
echo "🎯 Remplace 'ton-backend.railway.app' par ton vraie URL Railway"
