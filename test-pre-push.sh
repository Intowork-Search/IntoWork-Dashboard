#!/bin/bash

# Script de test rapide des fonctionnalités critiques
# À exécuter AVANT le git push

echo "======================================================"
echo "🔬 TEST RAPIDE PRÉ-PUSH - IntoWork Dashboard"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8001"
FRONTEND_URL="http://localhost:3000"

echo "📋 Checklist de tests manuels:"
echo ""

# Test 1: API Health
echo -n "1️⃣  API accessible (ping)... "
if curl -s "$API_URL/ping" > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ ÉCHEC${NC}"
    exit 1
fi

# Test 2: Frontend accessible
echo -n "2️⃣  Frontend accessible... "
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ ÉCHEC${NC}"
    exit 1
fi

echo ""
echo "======================================================"
echo "📝 TESTS MANUELS REQUIS (à faire dans le navigateur)"
echo "======================================================"
echo ""

echo "${YELLOW}TEST A: Filtrage Jobs Employeur${NC}"
echo "  1. Créer un compte employeur (email: test-emp1@test.com)"
echo "  2. Compléter l'onboarding avec une entreprise"
echo "  3. Créer 2 offres d'emploi"
echo "  4. Aller dans 'Mes Offres d'emploi' → Vérifier badge = 2"
echo "  5. Aller dans 'Recherche d'emplois' → Vérifier seulement vos 2 offres"
echo "  6. Créer un 2e compte employeur (email: test-emp2@test.com)"
echo "  7. Créer 1 offre d'emploi"
echo "  8. Vérifier employeur #2 ne voit QUE sa 1 offre"
echo "  9. Créer un compte candidat"
echo " 10. Vérifier candidat voit les 3 offres (2+1)"
echo ""

echo "${YELLOW}TEST B: Persistance Entreprise${NC}"
echo "  1. Login en tant qu'employeur"
echo "  2. Aller dans 'Mon Entreprise'"
echo "  3. Modifier: Nom, Industrie, Taille, Description"
echo "  4. Cliquer 'Enregistrer' → Vérifier toast succès"
echo "  5. Actualiser la page (F5)"
echo "  6. Vérifier que TOUTES les modifications sont conservées"
echo "  7. Logout puis re-login"
echo "  8. Aller dans 'Mon Entreprise' → Vérifier encore les modifications"
echo ""

echo "${YELLOW}TEST C: Notifications${NC}"
echo "  1. Ouvrir 2 navigateurs (ou 1 normal + 1 incognito)"
echo "  2. Browser 1: Login candidat"
echo "  3. Browser 2: Login employeur"
echo "  4. Browser 1: Postuler à une offre de l'employeur"
echo "  5. Browser 2: Cliquer l'icône 🔔 → Vérifier notification '📝 Nouvelle candidature'"
echo "  6. Browser 2: Changer statut candidature → 'Présélectionné'"
echo "  7. Browser 1: Cliquer l'icône 🔔 → Vérifier notification '⭐ Présélectionné(e)'"
echo "  8. Attendre 30s → Vérifier auto-refresh"
echo ""

echo "${YELLOW}TEST D: Mobile UI${NC}"
echo "  1. Ouvrir DevTools (F12)"
echo "  2. Mode responsive → iPhone/Android"
echo "  3. Vérifier UNE SEULE icône notification visible"
echo "  4. Ouvrir menu hamburger → Vérifier overlay TRANSPARENT"
echo "  5. Aller dans 'Mon Entreprise'"
echo "  6. Vérifier texte VISIBLE dans tous les champs"
echo ""

echo "======================================================"
echo "✅ Si TOUS les tests passent:"
echo "======================================================"
echo ""
echo "  git add ."
echo "  git commit -m \"feat: employer job filtering + NextAuth migration\""
echo "  git push origin feature/migrate-to-nextauth"
echo ""
echo "======================================================"
echo "📊 Puis vérifier les déploiements:"
echo "======================================================"
echo ""
echo "  - Railway (Backend): https://railway.app/..."
echo "  - Vercel (Frontend): https://vercel.com/..."
echo "  - Faire un smoke test en production"
echo ""
