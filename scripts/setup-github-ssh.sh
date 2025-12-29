#!/bin/bash
# Script pour configurer SSH GitHub rapidement

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║      🔐 Configuration SSH pour GitHub                     ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if SSH key exists
if [ -f ~/.ssh/id_ed25519.pub ] || [ -f ~/.ssh/id_rsa.pub ]; then
    echo -e "${GREEN}✅ Clé SSH détectée${NC}"
    echo ""
    echo -e "${YELLOW}Votre clé publique SSH :${NC}"
    if [ -f ~/.ssh/id_ed25519.pub ]; then
        cat ~/.ssh/id_ed25519.pub
        KEY_FILE="~/.ssh/id_ed25519"
    else
        cat ~/.ssh/id_rsa.pub
        KEY_FILE="~/.ssh/id_rsa"
    fi
else
    echo -e "${YELLOW}⚠️  Aucune clé SSH détectée${NC}"
    echo ""
    read -p "Voulez-vous en générer une? (y/n) [y]: " generate
    generate=${generate:-y}

    if [ "$generate" = "y" ]; then
        echo ""
        read -p "Votre email GitHub: " email

        echo ""
        echo -e "${BLUE}🔑 Génération de la clé SSH...${NC}"
        ssh-keygen -t ed25519 -C "$email" -f ~/.ssh/id_ed25519 -N ""

        eval "$(ssh-agent -s)"
        ssh-add ~/.ssh/id_ed25519

        echo -e "${GREEN}✅ Clé SSH générée${NC}"
        KEY_FILE="~/.ssh/id_ed25519"

        echo ""
        echo -e "${YELLOW}Votre clé publique :${NC}"
        cat ~/.ssh/id_ed25519.pub
    else
        echo -e "${RED}❌ Configuration SSH annulée${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 Prochaines étapes :${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. ${GREEN}Copiez la clé publique ci-dessus${NC}"
echo ""
echo "2. ${GREEN}Allez sur GitHub :${NC}"
echo "   https://github.com/settings/keys"
echo ""
echo "3. ${GREEN}Cliquez sur 'New SSH key'${NC}"
echo ""
echo "4. ${GREEN}Collez votre clé publique${NC}"
echo ""
echo "5. ${GREEN}Testez la connexion :${NC}"
echo "   ssh -T git@github.com"
echo ""
echo "6. ${GREEN}Mettez à jour le remote :${NC}"
echo "   git remote remove new-github"
echo "   git remote add new-github git@github.com:badalot/IntoWork-Dashboard.git"
echo ""
echo "7. ${GREEN}Poussez le code :${NC}"
echo "   git push -u new-github main"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Copy to clipboard if possible
if command -v xclip &> /dev/null; then
    if [ -f ~/.ssh/id_ed25519.pub ]; then
        cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
    else
        cat ~/.ssh/id_rsa.pub | xclip -selection clipboard
    fi
    echo -e "${GREEN}✅ Clé copiée dans le presse-papier !${NC}"
    echo ""
elif command -v pbcopy &> /dev/null; then
    if [ -f ~/.ssh/id_ed25519.pub ]; then
        cat ~/.ssh/id_ed25519.pub | pbcopy
    else
        cat ~/.ssh/id_rsa.pub | pbcopy
    fi
    echo -e "${GREEN}✅ Clé copiée dans le presse-papier !${NC}"
    echo ""
fi

echo -e "${YELLOW}💡 Pour tester la connexion SSH :${NC}"
echo "   ssh -T git@github.com"
echo ""
echo -e "${YELLOW}💡 Résultat attendu :${NC}"
echo "   Hi badalot! You've successfully authenticated..."
echo ""
