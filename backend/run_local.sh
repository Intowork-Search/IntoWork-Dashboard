#!/bin/bash

# Script pour lancer le backend en local avec Railway
# Ce script charge les variables d'environnement Railway et active le venv

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Démarrage du backend IntoWork avec Railway...${NC}"

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI n'est pas installé${NC}"
    exit 1
fi

# Vérifier que Railway CLI est configuré
if [ ! -f "$HOME/.railway/config.json" ]; then
    echo -e "${RED}❌ Railway CLI non configuré${NC}"
    echo -e "${YELLOW}💡 Exécutez : railway login && railway link${NC}"
    exit 1
fi

# Activer le venv
if [ -d "venv" ]; then
    echo -e "${GREEN}✅ Activation de l'environnement virtuel...${NC}"
    source venv/bin/activate
else
    echo -e "${RED}❌ Environnement virtuel non trouvé${NC}"
    exit 1
fi

# Lancer uvicorn avec les variables Railway
echo -e "${GREEN}🚂 Injection des variables Railway...${NC}"
echo -e "${GREEN}🌐 Backend disponible sur http://0.0.0.0:8001${NC}"
echo -e "${YELLOW}📝 Appuyez sur Ctrl+C pour arrêter${NC}"
echo ""

exec railway run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
