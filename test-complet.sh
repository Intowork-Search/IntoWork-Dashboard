#!/bin/bash

# Tests Complets - IntoWork Dashboard
# Résout les problèmes détectés et exécute tous les tests

set +e  # Continue on error

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:8001/api"
FRONTEND_URL="http://localhost:3000"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "🧪 TESTS COMPLETS - INTOWORK DASHBOARD"
echo "======================================"
echo ""

# Fonction de test
test_endpoint() {
    local name="$1"
    local command="$2"
    local expected="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Test $TOTAL_TESTS: $name... "

    if eval "$command" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSÉ${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ ÉCHOUÉ${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "📋 PHASE 1: INFRASTRUCTURE"
echo "=========================="
echo ""

# Test PostgreSQL
test_endpoint \
    "PostgreSQL running" \
    "docker ps" \
    "postgres"

echo ""
echo "🔧 PHASE 2: BACKEND API"
echo "======================="
echo ""

# Test Health
test_endpoint \
    "API Health Check" \
    "curl -s $API_URL/ping" \
    "pong"

# Test Swagger
test_endpoint \
    "Swagger Documentation" \
    "curl -s http://localhost:8001/docs" \
    "swagger"

# Test Signin (avec fichier JSON pour éviter problèmes encoding)
cat > /tmp/test_signin.json << 'EOFJ'
{"email":"software@hcexecutive.net","password":"TestResetPass789!"}
EOFJ

echo -n "Test 4: Signin Endpoint... "
SIGNIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d @/tmp/test_signin.json)

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if echo "$SIGNIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ PASSÉ${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TOKEN=$(echo "$SIGNIN_RESPONSE" | jq -r '.access_token')
else
    echo -e "${RED}❌ ÉCHOUÉ${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOKEN=""
fi

# Test Get Current User
if [ ! -z "$TOKEN" ]; then
    test_endpoint \
        "Get Current User (authenticated)" \
        "curl -s $API_URL/auth/me -H 'Authorization: Bearer $TOKEN'" \
        "software@hcexecutive.net"
fi

# Test List Jobs (avec -L pour suivre les redirections)
test_endpoint \
    "List Jobs" \
    "curl -sL '$API_URL/jobs?limit=5'" \
    "jobs"

# Test Get Single Job
test_endpoint \
    "Get Job by ID" \
    "curl -sL '$API_URL/jobs/3'" \
    "title"

# Test Create Signup
cat > /tmp/test_signup.json << 'EOFJ'
{
  "email": "testuser-local-1736086000@example.com",
  "password": "TestPassword123!",
  "first_name": "Test",
  "last_name": "User",
  "role": "candidate"
}
EOFJ

test_endpoint \
    "Signup Endpoint" \
    "curl -s -X POST '$API_URL/auth/signup' -H 'Content-Type: application/json' -d @/tmp/test_signup.json" \
    "access_token\|already registered"

echo ""
echo "🎨 PHASE 3: FRONTEND"
echo "===================="
echo ""

# Test Page d'accueil
test_endpoint \
    "Page d'accueil" \
    "curl -s $FRONTEND_URL" \
    "IntoWork"

# Test Page Signin
test_endpoint \
    "Page Signin" \
    "curl -s $FRONTEND_URL/auth/signin" \
    "Connexion\|connexion\|Se connecter"

# Test Page Signup
test_endpoint \
    "Page Signup" \
    "curl -s $FRONTEND_URL/auth/signup" \
    "Créer un compte\|Créer mon compte"

# Test Page Dashboard
test_endpoint \
    "Page Dashboard" \
    "curl -s $FRONTEND_URL/dashboard" \
    "Dashboard"

echo ""
echo "⚡ PHASE 4: PERFORMANCE"
echo "======================="
echo ""

# Test Temps de Réponse
echo -n "Test $((TOTAL_TESTS + 1)): Temps de réponse API Ping... "
START=$(date +%s%N)
curl -s $API_URL/ping > /dev/null
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ $DURATION -lt 500 ]; then
    echo -e "${GREEN}✅ PASSÉ (${DURATION}ms)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  LENT (${DURATION}ms)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test Indexes Database
echo -n "Test $((TOTAL_TESTS + 1)): Vérification Indexes DB... "
cd /home/jdtkd/IntoWork-Dashboard/backend
source venv/bin/activate

INDEX_COUNT=$(python3 << 'EOFP'
import asyncio
import sys
sys.path.insert(0, '/home/jdtkd/IntoWork-Dashboard/backend')

from dotenv import load_dotenv
load_dotenv()

from app.database import AsyncSessionLocal
from sqlalchemy import text

async def count_indexes():
    async with AsyncSessionLocal() as session:
        # Count ALL performance indexes (idx_* and unique_*)
        result = await session.execute(text("""
            SELECT COUNT(*) FROM pg_indexes
            WHERE schemaname = 'public'
            AND (indexname LIKE 'idx_%' OR indexname LIKE 'unique_%')
        """))
        return result.scalar()

count = asyncio.run(count_indexes())
print(count)
EOFP
)

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$INDEX_COUNT" -ge 15 ]; then
    echo -e "${GREEN}✅ PASSÉ ($INDEX_COUNT indexes)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ ÉCHOUÉ (seulement $INDEX_COUNT indexes, attendu >= 15)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "📊 RÉSULTATS FINAUX"
echo "==================="
echo ""
echo "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}✅ Réussis: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Échoués: $FAILED_TESTS${NC}"

SUCCESS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
echo "Taux de réussite: $SUCCESS_RATE%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS !${NC}"
    echo "✅ Le projet est prêt pour le déploiement"
    exit 0
else
    echo -e "${YELLOW}⚠️  $FAILED_TESTS test(s) ont échoué${NC}"
    echo "Vérifiez les détails ci-dessus"
    exit 1
fi
