#!/bin/bash

# 🧪 Script de test INTOWORK - Clerk + Microsoft

echo "🚀 Test de configuration INTOWORK Search"
echo "========================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour vérifier un service
check_service() {
    local service_name=$1
    local url=$2
    local expected_text=$3
    
    echo -e "${BLUE}🔍 Test $service_name...${NC}"
    
    if curl -s "$url" | grep -q "$expected_text"; then
        echo -e "${GREEN}✅ $service_name fonctionne${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name ne répond pas correctement${NC}"
        return 1
    fi
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire INTOWORK racine${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Vérification des fichiers de configuration...${NC}"

# Vérifier les fichiers .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env trouvé${NC}"
    if grep -q "CLERK_SECRET" backend/.env; then
        echo -e "${GREEN}✅ CLERK_SECRET configuré dans backend${NC}"
    else
        echo -e "${YELLOW}⚠️  CLERK_SECRET manquant dans backend/.env${NC}"
    fi
else
    echo -e "${RED}❌ backend/.env manquant${NC}"
    echo -e "${BLUE}💡 Copiez backend/.env.example vers backend/.env${NC}"
fi

if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✅ frontend/.env.local trouvé${NC}"
    if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" frontend/.env.local; then
        echo -e "${GREEN}✅ Clés Clerk configurées dans frontend${NC}"
    else
        echo -e "${YELLOW}⚠️  Clés Clerk manquantes dans frontend/.env.local${NC}"
    fi
else
    echo -e "${RED}❌ frontend/.env.local manquant${NC}"
    echo -e "${BLUE}💡 Créez frontend/.env.local avec vos clés Clerk${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 Test des services...${NC}"

# Test PostgreSQL
echo -e "${BLUE}🐘 Test PostgreSQL...${NC}"
if docker ps | grep -q postgres; then
    echo -e "${GREEN}✅ PostgreSQL container actif${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL container non trouvé${NC}"
    echo -e "${BLUE}💡 Démarrez avec: docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15${NC}"
fi

# Test Backend API
echo -e "${BLUE}🔧 Test Backend API...${NC}"
backend_running=false
if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API répond${NC}"
    backend_running=true
    
    # Test des endpoints spécifiques
    check_service "Endpoint Ping" "http://localhost:8001/api/ping" "pong"
    check_service "Endpoint Status" "http://localhost:8001/api/status" "Phase 1"
    check_service "Database Status" "http://localhost:8001/api/db-status" "connected"
else
    echo -e "${RED}❌ Backend API ne répond pas sur le port 8001${NC}"
    echo -e "${BLUE}💡 Démarrez avec: cd backend && uvicorn app.main:app --reload --port 8001${NC}"
fi

# Test Frontend
echo -e "${BLUE}⚛️  Test Frontend...${NC}"
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend Next.js répond${NC}"
    
    # Vérifier que les pages Clerk existent
    if curl -s http://localhost:3000/sign-in | grep -q "Clerk"; then
        echo -e "${GREEN}✅ Pages d'authentification Clerk configurées${NC}"
    else
        echo -e "${YELLOW}⚠️  Pages d'authentification peut-être non configurées${NC}"
    fi
else
    echo -e "${RED}❌ Frontend ne répond pas sur le port 3000${NC}"
    echo -e "${BLUE}💡 Démarrez avec: cd frontend && npm run dev${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Résumé des tests...${NC}"

# Résumé
services_ok=0
total_services=4

if docker ps | grep -q postgres; then ((services_ok++)); fi
if $backend_running; then ((services_ok++)); fi
if curl -s http://localhost:3000 >/dev/null 2>&1; then ((services_ok++)); fi
if [ -f "backend/.env" ] && [ -f "frontend/.env.local" ]; then ((services_ok++)); fi

echo -e "${BLUE}Services fonctionnels: $services_ok/$total_services${NC}"

if [ $services_ok -eq $total_services ]; then
    echo -e "${GREEN}🎉 Tous les services sont opérationnels !${NC}"
    echo -e "${GREEN}👉 Vous pouvez tester l'authentification Microsoft sur http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Certains services nécessitent une attention${NC}"
    echo -e "${BLUE}📖 Consultez GUIDE_CLERK_MICROSOFT.md pour la configuration complète${NC}"
fi

echo ""
echo -e "${BLUE}🔗 URLs importantes:${NC}"
echo -e "   • Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   • Backend API: ${GREEN}http://localhost:8001${NC}"
echo -e "   • API Docs: ${GREEN}http://localhost:8001/docs${NC}"
echo -e "   • Clerk Dashboard: ${GREEN}https://dashboard.clerk.com${NC}"

echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo -e "   1. Suivez GUIDE_CLERK_MICROSOFT.md pour configurer Microsoft"
echo -e "   2. Testez l'inscription avec Microsoft"
echo -e "   3. Vérifiez la synchronisation avec le backend"
echo -e "   4. Testez les rôles candidat/employeur"

echo ""
echo -e "${GREEN}✨ Test terminé !${NC}"
