#!/bin/bash

# Test Production Endpoints - Verify Railway & Vercel Deployments
# Usage: ./test-production.sh

echo "🔍 Testing INTOWORK Production Deployment"
echo "=========================================="
echo ""

API_URL="https://intowork-dashboard-production-1ede.up.railway.app"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend is healthy (HTTP $HEALTH_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $HEALTH_RESPONSE)${NC}"
fi
echo ""

# Test 2: Root Endpoint
echo "2️⃣  Testing Root Endpoint..."
ROOT_RESPONSE=$(curl -s "$API_URL/")
if [[ $ROOT_RESPONSE == *"intowork-backend"* ]]; then
    echo -e "${GREEN}✅ Root endpoint working${NC}"
    echo "   Response: $ROOT_RESPONSE"
else
    echo -e "${RED}❌ Root endpoint failed${NC}"
fi
echo ""

# Test 3: CORS Headers on Static Files (Image)
echo "3️⃣  Testing CORS Headers on Static Files..."
UPLOAD_URL="$API_URL/uploads/company_logos/test.jpeg"
CORS_HEADERS=$(curl -sI "$UPLOAD_URL" 2>/dev/null | grep -i "access-control\|cross-origin" || echo "NONE")
if [[ $CORS_HEADERS == *"access-control-allow-origin"* ]]; then
    echo -e "${GREEN}✅ CORS headers present on static files${NC}"
    echo "$CORS_HEADERS" | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  CORS headers missing on static files${NC}"
    echo "   Note: Railway may not have redeployed yet (~5 min after push)"
    echo "   Expected headers:"
    echo "   - access-control-allow-origin: *"
    echo "   - cross-origin-resource-policy: cross-origin"
fi
echo ""

# Test 4: Integrations Endpoint (Previously returning 500)
echo "4️⃣  Testing Integrations Status Endpoint..."
# Need authentication token for this test
echo -e "${YELLOW}⚠️  Skipped (requires authentication token)${NC}"
echo "   Test manually: Login → /dashboard/integrations"
echo "   Expected: No CORS 500 errors in console"
echo ""

# Test 5: Check Latest Deployment Time
echo "5️⃣  Checking Railway Deployment Status..."
echo -e "${YELLOW}ℹ️  Check Railway Dashboard:${NC}"
echo "   https://railway.app/dashboard"
echo "   → Backend Service → Deployments → Latest"
echo "   → Status should be 'Success' with recent timestamp"
echo ""

# Test 6: Mixed Content Check
echo "6️⃣  Checking for Mixed Content Issues..."
echo -e "${YELLOW}ℹ️  This must be tested in browser:${NC}"
echo "   1. Open www.intowork.co"
echo "   2. Press F12 → Console"
echo "   3. Check for 'Mixed Content' errors"
echo "   4. All API requests should be HTTPS (not HTTP)"
echo ""

# Summary
echo "=========================================="
echo "📋 SUMMARY"
echo "=========================================="
echo ""
echo "Backend Health:"
if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    echo -e "  ${GREEN}✅ Railway backend is running${NC}"
else
    echo -e "  ${RED}❌ Railway backend has issues${NC}"
fi
echo ""
echo "Next Steps:"
echo "  1. ⚙️  Fix Vercel env var (see FIX_VERCEL_ENV_VAR.md)"
echo "  2. ⏳ Wait for Railway redeploy (~5 min from last push)"
echo "  3. 🧪 Test in browser (F12 Console)"
echo ""
echo "Last Push: $(git log -1 --format='%h - %s (%cr)')"
echo ""
