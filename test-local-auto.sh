#!/bin/bash

# Script de Test Automatisé - IntoWork Dashboard
# Teste automatiquement les endpoints critiques

set -e  # Exit on error

echo "🧪 TESTS AUTOMATISÉS - INTOWORK DASHBOARD"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction pour tester
test_endpoint() {
    local test_name="$1"
    local command="$2"
    local expected="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Test $TOTAL_TESTS: $test_name... "

    if eval "$command" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Variables
API_URL="http://localhost:8001/api"
FRONTEND_URL="http://localhost:3000"

echo "📋 PHASE 1: VÉRIFICATIONS PRÉALABLES"
echo "======================================"
echo ""

# Test 1: PostgreSQL
echo -n "Test 1: PostgreSQL running... "
if docker ps | grep -q postgres; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "   Démarrage de PostgreSQL..."
    docker start postgres
    sleep 3
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo "🔧 PHASE 2: TESTS BACKEND API"
echo "=============================="
echo ""

# Test 2: API Health Check
test_endpoint \
    "API Health Check" \
    "curl -s $API_URL/ping" \
    "ok"

# Test 3: Swagger Documentation
test_endpoint \
    "Swagger Documentation" \
    "curl -s http://localhost:8001/docs" \
    "swagger"

# Test 4: Signup Endpoint (avec email temporaire)
TEMP_EMAIL="test-$(date +%s)@example.com"
echo ""
echo "Test 4: Signup Endpoint (email: $TEMP_EMAIL)... "
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  --data-raw "{
    \"email\": \"$TEMP_EMAIL\",
    \"password\": \"TestPassword123!\",
    \"first_name\": \"Auto\",
    \"last_name\": \"Test\",
    \"role\": \"candidate\"
  }")

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if echo "$SIGNUP_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.access_token')
    echo "   Token: ${ACCESS_TOKEN:0:30}..."
else
    echo -e "${RED}❌ FAILED${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "   Response: $SIGNUP_RESPONSE"
fi
echo ""

# Test 5: Signin Endpoint
echo "Test 5: Signin Endpoint... "
SIGNIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/signin" \
  -H "Content-Type: application/json" \
  --data-raw "{
    \"email\": \"software@hcexecutive.net\",
    \"password\": \"TestResetPass789!\"
  }")

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if echo "$SIGNIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    ADMIN_TOKEN=$(echo "$SIGNIN_RESPONSE" | jq -r '.access_token')
else
    echo -e "${RED}❌ FAILED${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "   Response: $SIGNIN_RESPONSE"
fi
echo ""

# Test 6: Get Current User (avec token)
if [ ! -z "$ADMIN_TOKEN" ]; then
    test_endpoint \
        "Get Current User (authenticated)" \
        "curl -s $API_URL/users/me -H 'Authorization: Bearer $ADMIN_TOKEN'" \
        "software@hcexecutive.net"
fi

# Test 7: List Jobs
test_endpoint \
    "List Jobs" \
    "curl -s '$API_URL/jobs?limit=5'" \
    "jobs"

echo ""
echo "🎨 PHASE 3: TESTS FRONTEND"
echo "=========================="
echo ""

# Test 8: Page d'accueil
test_endpoint \
    "Page d'accueil accessible" \
    "curl -s $FRONTEND_URL" \
    "IntoWork"

# Test 9: Page Signin
test_endpoint \
    "Page Signin accessible" \
    "curl -s $FRONTEND_URL/auth/signin" \
    "Se connecter"

# Test 10: Page Dashboard
test_endpoint \
    "Page Dashboard accessible" \
    "curl -s $FRONTEND_URL/dashboard" \
    "Dashboard"

echo ""
echo "⚡ PHASE 4: TESTS PERFORMANCE"
echo "=============================="
echo ""

# Test 11: Temps de réponse API
echo -n "Test 11: Temps de réponse API Ping... "
START_TIME=$(date +%s%N)
curl -s $API_URL/ping > /dev/null
END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))  # Convert to ms

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ $DURATION -lt 500 ]; then
    echo -e "${GREEN}✅ PASSED${NC} (${DURATION}ms)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${DURATION}ms > 500ms)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 12: Vérifier Indexes Database
echo ""
echo "Test 12: Vérifier Indexes Database... "
cd /home/jdtkd/IntoWork-Dashboard/backend
source venv/bin/activate

INDEX_CHECK=$(python3 << 'EOF'
import asyncio
import sys
sys.path.insert(0, '/home/jdtkd/IntoWork-Dashboard/backend')

from dotenv import load_dotenv
load_dotenv()

from app.database import AsyncSessionLocal
from sqlalchemy import text

async def check_indexes():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("""
            SELECT COUNT(*) FROM pg_indexes
            WHERE tablename IN ('jobs', 'job_applications', 'candidates')
            AND indexname LIKE 'idx_%'
        """))
        count = result.scalar()
        return count

count = asyncio.run(check_indexes())
print(count)
EOF
)

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$INDEX_CHECK" -ge 10 ]; then
    echo -e "${GREEN}✅ PASSED${NC} ($INDEX_CHECK indexes trouvés)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ FAILED${NC} (seulement $INDEX_CHECK indexes)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "📊 RÉSULTATS FINAUX"
echo "==================="
echo ""
echo "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}✅ Passed: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Failed: $FAILED_TESTS${NC}"
echo ""

# Calcul pourcentage
SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
echo "Taux de réussite: $SUCCESS_RATE%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS !${NC}"
    echo "✅ Le projet est prêt pour le déploiement"
    exit 0
else
    echo -e "${YELLOW}⚠️  CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo "Consultez les logs ci-dessus pour plus de détails"
    exit 1
fi
