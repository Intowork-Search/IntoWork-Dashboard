#!/bin/bash
# Script de déploiement automatisé pour Railway (Backend FastAPI + PostgreSQL)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Déploiement Railway - IntoWork Dashboard Backend${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI n'est pas installé${NC}"
    echo -e "${BLUE}Installation de Railway CLI...${NC}"

    # Install Railway CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install railway
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        bash <(curl -fsSL cli.new)
    else
        echo -e "${RED}❌ OS non supporté pour l'installation automatique${NC}"
        echo -e "${YELLOW}Installez Railway CLI manuellement: https://docs.railway.app/develop/cli${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}🔐 Authentification Railway...${NC}"
railway login

echo ""
echo -e "${YELLOW}Choisissez le mode de déploiement:${NC}"
echo "  1. Créer un nouveau projet Railway"
echo "  2. Déployer sur un projet existant"
echo ""
read -p "Votre choix (1/2) [1]: " project_choice
project_choice=${project_choice:-1}

if [ "$project_choice" -eq 1 ]; then
    echo ""
    echo -e "${BLUE}📦 Création d'un nouveau projet Railway...${NC}"
    railway init

    echo ""
    echo -e "${BLUE}🗄️  Ajout de la base de données PostgreSQL...${NC}"
    railway add --database postgres

    echo -e "${GREEN}✅ PostgreSQL ajouté${NC}"
else
    echo ""
    echo -e "${BLUE}🔗 Liaison avec un projet existant...${NC}"
    railway link
fi

echo ""
echo -e "${BLUE}⚙️  Configuration des variables d'environnement...${NC}"
echo -e "${YELLOW}Configurer les variables maintenant ? (y/n) [y]:${NC}"
read -p "" configure_env
configure_env=${configure_env:-y}

if [ "$configure_env" = "y" ]; then
    echo ""
    echo -e "${BLUE}📝 Ajout des variables d'environnement...${NC}"

    # Database URL is auto-configured by Railway
    echo -e "${GREEN}✅ DATABASE_URL (auto-configuré par Railway)${NC}"

    # JWT Configuration
    echo ""
    echo -e "${YELLOW}NEXTAUTH_SECRET (32+ caractères):${NC}"
    read -p "Valeur: " nextauth_secret
    railway variables --set NEXTAUTH_SECRET="$nextauth_secret"

    echo ""
    echo -e "${YELLOW}JWT_SECRET (32+ caractères):${NC}"
    read -p "Valeur: " jwt_secret
    railway variables --set JWT_SECRET="$jwt_secret"

    railway variables --set JWT_ALGORITHM="HS256"

    # Email Configuration
    echo ""
    echo -e "${YELLOW}RESEND_API_KEY (optionnel pour emails):${NC}"
    read -p "Valeur (Enter pour ignorer): " resend_key
    if [ -n "$resend_key" ]; then
        railway variables --set RESEND_API_KEY="$resend_key"
        railway variables --set FROM_EMAIL="INTOWORK <noreply@intowork.com>"
    fi

    # Frontend URL
    echo ""
    echo -e "${YELLOW}FRONTEND_URL (URL Vercel):${NC}"
    read -p "Valeur: " frontend_url
    railway variables --set FRONTEND_URL="$frontend_url"

    # Security
    echo ""
    echo -e "${YELLOW}SECRET_KEY (clé sécurisée):${NC}"
    read -p "Valeur: " secret_key
    railway variables --set SECRET_KEY="$secret_key"

    railway variables --set RAILWAY_ENVIRONMENT="production"

    echo -e "${GREEN}✅ Variables d'environnement configurées${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Déploiement en cours...${NC}"
railway up

echo ""
echo -e "${BLUE}⏳ Attente du déploiement...${NC}"
sleep 10

echo ""
echo -e "${BLUE}🔍 Récupération de l'URL de déploiement...${NC}"
railway domain

echo ""
echo -e "${GREEN}✨ Déploiement Railway terminé !${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes:${NC}"
echo "  1. Vérifiez que le service est en ligne: railway status"
echo "  2. Consultez les logs: railway logs"
echo "  3. Testez l'API: curl <votre-url>/api/ping"
echo "  4. Exécutez les migrations si nécessaire:"
echo "     railway run alembic upgrade head"
echo "  5. Créez un utilisateur admin:"
echo "     railway run python create_admin.py"
echo ""
echo -e "${YELLOW}💡 Commandes utiles:${NC}"
echo "  railway logs           # Voir les logs"
echo "  railway status         # Statut du déploiement"
echo "  railway domain         # URL publique"
echo "  railway variables      # Voir les variables"
echo "  railway run <cmd>      # Exécuter une commande"
echo ""
