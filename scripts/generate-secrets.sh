#!/bin/bash
# Script pour générer tous les secrets nécessaires au déploiement

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}║     🔐 Générateur de Secrets - IntoWork Dashboard     ║${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Ce script génère tous les secrets nécessaires pour :${NC}"
echo "  • Backend (Railway)"
echo "  • Frontend (Vercel)"
echo ""

# Generate secrets
echo -e "${BLUE}🔑 Génération des secrets sécurisés...${NC}"
echo ""

NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
SECRET_KEY=$(openssl rand -base64 32)

# Display secrets
echo -e "${GREEN}✅ Secrets générés avec succès !${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}NEXTAUTH_SECRET:${NC}"
echo "$NEXTAUTH_SECRET"
echo ""
echo -e "${YELLOW}⚠️  Ce secret DOIT être identique sur Backend ET Frontend${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}JWT_SECRET:${NC}"
echo "$JWT_SECRET"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}SECRET_KEY:${NC}"
echo "$SECRET_KEY"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Save to file
SECRETS_FILE="deployment-secrets.txt"
cat > "$SECRETS_FILE" << EOF
# IntoWork Dashboard - Secrets de Production
# Généré le: $(date)
# ⚠️  NE JAMAIS COMMITTER CE FICHIER DANS GIT !

# ============================================
# Backend (Railway)
# ============================================

NEXTAUTH_SECRET=$NEXTAUTH_SECRET
JWT_SECRET=$JWT_SECRET
JWT_ALGORITHM=HS256
SECRET_KEY=$SECRET_KEY

# Configuration Railway:
railway variables --set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables --set JWT_SECRET="$JWT_SECRET"
railway variables --set JWT_ALGORITHM="HS256"
railway variables --set SECRET_KEY="$SECRET_KEY"

# ============================================
# Frontend (Vercel)
# ============================================

NEXTAUTH_SECRET=$NEXTAUTH_SECRET
AUTH_SECRET=$NEXTAUTH_SECRET

# Configuration Vercel:
cd frontend
vercel env add NEXTAUTH_SECRET production
# Valeur: $NEXTAUTH_SECRET

vercel env add AUTH_SECRET production
# Valeur: $NEXTAUTH_SECRET

# ============================================
# Vérification
# ============================================

# Railway:
railway variables | grep NEXTAUTH_SECRET

# Vercel:
vercel env ls | grep NEXTAUTH_SECRET

# ⚠️  Les deux DOIVENT afficher la même valeur !
EOF

echo ""
echo -e "${GREEN}💾 Secrets sauvegardés dans: ${SECRETS_FILE}${NC}"
echo ""

# Add to gitignore
if ! grep -q "deployment-secrets.txt" .gitignore 2>/dev/null; then
    echo "deployment-secrets.txt" >> .gitignore
    echo -e "${GREEN}✅ Ajouté à .gitignore${NC}"
fi

echo ""
echo -e "${BLUE}📋 Prochaines étapes:${NC}"
echo ""
echo -e "${YELLOW}1. SAUVEGARDEZ ces secrets dans un endroit sûr !${NC}"
echo "   • Gestionnaire de mots de passe (1Password, LastPass, etc.)"
echo "   • Fichier chiffré sur votre machine"
echo "   • Vault secret manager"
echo ""
echo -e "${YELLOW}2. Pour Railway (Backend):${NC}"
echo "   railway variables --set NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
echo "   railway variables --set JWT_SECRET=\"$JWT_SECRET\""
echo "   railway variables --set JWT_ALGORITHM=\"HS256\""
echo "   railway variables --set SECRET_KEY=\"$SECRET_KEY\""
echo ""
echo -e "${YELLOW}3. Pour Vercel (Frontend):${NC}"
echo "   cd frontend"
echo "   vercel env add NEXTAUTH_SECRET"
echo "   # Coller: $NEXTAUTH_SECRET"
echo "   vercel env add AUTH_SECRET"
echo "   # Coller: $NEXTAUTH_SECRET"
echo ""
echo -e "${YELLOW}4. Vérifier que les secrets correspondent:${NC}"
echo "   railway variables | grep NEXTAUTH_SECRET"
echo "   vercel env ls | grep NEXTAUTH_SECRET"
echo ""
echo -e "${GREEN}✨ Terminé !${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "  • Ne partagez JAMAIS ces secrets"
echo "  • Ne commitez JAMAIS ces secrets dans Git"
echo "  • Utilisez des secrets différents pour dev/staging/production"
echo "  • Changez les secrets régulièrement (tous les 6-12 mois)"
echo ""
