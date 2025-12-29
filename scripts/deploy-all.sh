#!/bin/bash
# Script master de déploiement complet - IntoWork Dashboard
# Déploie le backend sur Railway ET le frontend sur Vercel

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║         🚀 IntoWork Dashboard - Déploiement Complet       ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║         Backend (Railway) + Frontend (Vercel)             ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}📁 Répertoire du projet: ${PROJECT_ROOT}${NC}"
echo ""

# Step 1: Prerequisites check
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Étape 1/4: Vérification des prérequis${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installé: ${NODE_VERSION}${NC}"
else
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installé: ${NPM_VERSION}${NC}"
else
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

# Check git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✅ Git installé${NC}"
else
    echo -e "${RED}❌ Git n'est pas installé${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  Assurez-vous d'avoir:${NC}"
echo "  • Un compte Vercel (https://vercel.com)"
echo "  • Un compte Railway (https://railway.app)"
echo "  • Vos clés API prêtes (Resend optionnel)"
echo ""
read -p "Continuer? (y/n) [y]: " continue_deploy
continue_deploy=${continue_deploy:-y}

if [ "$continue_deploy" != "y" ]; then
    echo -e "${YELLOW}Déploiement annulé${NC}"
    exit 0
fi

# Step 2: Deploy Backend to Railway
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Étape 2/4: Déploiement Backend (Railway)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Déployer le backend sur Railway? (y/n) [y]: " deploy_backend
deploy_backend=${deploy_backend:-y}

if [ "$deploy_backend" = "y" ]; then
    echo -e "${CYAN}🚂 Lancement du déploiement Railway...${NC}"
    bash "$SCRIPT_DIR/deploy-railway.sh"

    echo ""
    echo -e "${YELLOW}📝 Notez l'URL de votre backend Railway:${NC}"
    read -p "URL du backend (ex: https://intowork-backend-production.up.railway.app): " BACKEND_URL
    BACKEND_URL=${BACKEND_URL%/}  # Remove trailing slash

    echo -e "${GREEN}✅ Backend URL enregistrée: ${BACKEND_URL}${NC}"
else
    echo -e "${YELLOW}⏭️  Déploiement backend ignoré${NC}"
    echo -e "${YELLOW}Entrez l'URL de votre backend existant:${NC}"
    read -p "URL du backend: " BACKEND_URL
    BACKEND_URL=${BACKEND_URL%/}
fi

# Step 3: Deploy Frontend to Vercel
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Étape 3/4: Déploiement Frontend (Vercel)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Déployer le frontend sur Vercel? (y/n) [y]: " deploy_frontend
deploy_frontend=${deploy_frontend:-y}

if [ "$deploy_frontend" = "y" ]; then
    echo -e "${CYAN}▲ Lancement du déploiement Vercel...${NC}"

    # Set environment variable for API URL
    export NEXT_PUBLIC_API_URL="${BACKEND_URL}/api"

    bash "$SCRIPT_DIR/deploy-vercel.sh"

    echo ""
    echo -e "${YELLOW}📝 Notez l'URL de votre frontend Vercel:${NC}"
    read -p "URL du frontend (ex: https://intowork.vercel.app): " FRONTEND_URL
    FRONTEND_URL=${FRONTEND_URL%/}

    echo -e "${GREEN}✅ Frontend URL enregistrée: ${FRONTEND_URL}${NC}"
else
    echo -e "${YELLOW}⏭️  Déploiement frontend ignoré${NC}"
    echo -e "${YELLOW}Entrez l'URL de votre frontend existant:${NC}"
    read -p "URL du frontend: " FRONTEND_URL
    FRONTEND_URL=${FRONTEND_URL%/}
fi

# Step 4: Post-Deployment Configuration
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Étape 4/4: Configuration Post-Déploiement${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📋 Résumé de la configuration:${NC}"
echo ""
echo -e "${CYAN}Backend (Railway):${NC}"
echo "  URL: ${BACKEND_URL}"
echo "  API: ${BACKEND_URL}/api"
echo ""
echo -e "${CYAN}Frontend (Vercel):${NC}"
echo "  URL: ${FRONTEND_URL}"
echo ""

echo -e "${YELLOW}⚠️  Actions nécessaires:${NC}"
echo ""
echo -e "${CYAN}1. Sur Railway (Backend):${NC}"
echo "   • Mettre à jour FRONTEND_URL=${FRONTEND_URL}"
echo "   • Commande: railway variables --set FRONTEND_URL=${FRONTEND_URL}"
echo ""
echo -e "${CYAN}2. Sur Vercel (Frontend):${NC}"
echo "   • Mettre à jour NEXTAUTH_URL=${FRONTEND_URL}"
echo "   • Mettre à jour NEXT_PUBLIC_API_URL=${BACKEND_URL}/api"
echo "   • Commande: vercel env add (pour chaque variable)"
echo ""
echo -e "${CYAN}3. Tests à effectuer:${NC}"
echo "   • Backend health: curl ${BACKEND_URL}/api/ping"
echo "   • Frontend: ouvrir ${FRONTEND_URL}"
echo "   • Tester signup/login"
echo "   • Vérifier la connexion frontend ↔ backend"
echo ""

# Save configuration
CONFIG_FILE="$PROJECT_ROOT/deployment-config.txt"
cat > "$CONFIG_FILE" << EOF
# IntoWork Dashboard - Configuration de Déploiement
# Généré le: $(date)

BACKEND_URL=${BACKEND_URL}
FRONTEND_URL=${FRONTEND_URL}
API_URL=${BACKEND_URL}/api

# Commandes de mise à jour
# Railway:
railway variables --set FRONTEND_URL=${FRONTEND_URL}

# Vercel:
cd frontend
vercel env add NEXTAUTH_URL
vercel env add NEXT_PUBLIC_API_URL

# Tests
curl ${BACKEND_URL}/api/ping
curl ${BACKEND_URL}/health
EOF

echo -e "${GREEN}✅ Configuration sauvegardée dans: ${CONFIG_FILE}${NC}"

# Final summary
echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║              ✨ Déploiement Terminé ! ✨                   ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🎉 Votre application IntoWork Dashboard est déployée !${NC}"
echo ""
echo -e "${CYAN}🌐 URLs:${NC}"
echo -e "   Frontend: ${GREEN}${FRONTEND_URL}${NC}"
echo -e "   Backend:  ${GREEN}${BACKEND_URL}${NC}"
echo -e "   API:      ${GREEN}${BACKEND_URL}/api${NC}"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "   • Guide complet: docs/deployment/DEPLOYMENT_GUIDE_COMPLETE.md"
echo "   • Configuration: deployment-config.txt"
echo "   • Troubleshooting: docs/deployment/TROUBLESHOOTING.md"
echo ""
echo -e "${BLUE}💡 Prochaines étapes:${NC}"
echo "   1. Configurez les variables d'environnement finales"
echo "   2. Testez l'application complète"
echo "   3. Configurez CI/CD (optionnel)"
echo "   4. Configurez le monitoring (optionnel)"
echo ""
echo -e "${CYAN}Besoin d'aide? Consultez la documentation dans docs/deployment/${NC}"
echo ""
