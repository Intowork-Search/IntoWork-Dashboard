#!/bin/bash
# Script de déploiement automatisé pour Vercel (Frontend Next.js)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Déploiement Vercel - IntoWork Dashboard Frontend${NC}"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI n'est pas installé${NC}"
    echo -e "${BLUE}Installation de Vercel CLI...${NC}"
    npm install -g vercel
fi

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

echo -e "${BLUE}📦 Installation des dépendances...${NC}"
npm install

echo -e "${BLUE}🧪 Vérification du build local...${NC}"
npm run build

echo -e "${GREEN}✅ Build local réussi${NC}"
echo ""

# Deployment options
echo -e "${YELLOW}Choisissez le type de déploiement:${NC}"
echo "  1. Production (--prod)"
echo "  2. Preview (défaut)"
echo ""
read -p "Votre choix (1/2) [2]: " choice
choice=${choice:-2}

echo ""
if [ "$choice" -eq 1 ]; then
    echo -e "${BLUE}🚀 Déploiement en PRODUCTION...${NC}"
    vercel --prod
else
    echo -e "${BLUE}🚀 Déploiement en PREVIEW...${NC}"
    vercel
fi

echo ""
echo -e "${GREEN}✨ Déploiement Vercel terminé !${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes:${NC}"
echo "  1. Vérifiez l'URL de déploiement dans la console"
echo "  2. Configurez les variables d'environnement sur Vercel:"
echo "     - NEXTAUTH_URL=<votre-url-vercel>"
echo "     - NEXTAUTH_SECRET=<32+ caractères>"
echo "     - AUTH_SECRET=<même que NEXTAUTH_SECRET>"
echo "     - NEXT_PUBLIC_API_URL=<url-railway-backend>/api"
echo "  3. Testez l'application déployée"
echo ""
echo -e "${YELLOW}💡 Configuration des variables:${NC}"
echo "  vercel env add NEXTAUTH_URL"
echo "  vercel env add NEXTAUTH_SECRET"
echo "  vercel env add AUTH_SECRET"
echo "  vercel env add NEXT_PUBLIC_API_URL"
echo ""
