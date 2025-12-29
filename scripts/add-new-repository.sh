#!/bin/bash
# Script pour ajouter et pousser vers un nouveau repository

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

clear
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║      📦 Ajouter un Nouveau Repository Git                 ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show current remotes
echo -e "${BLUE}📊 Repositories actuels :${NC}"
git remote -v
echo ""

# Choose platform
echo -e "${YELLOW}Choisissez la plateforme :${NC}"
echo "  1. GitHub"
echo "  2. GitLab"
echo "  3. Autre (Bitbucket, etc.)"
echo ""
read -p "Votre choix (1/2/3) [1]: " platform_choice
platform_choice=${platform_choice:-1}

case $platform_choice in
    1)
        PLATFORM="GitHub"
        PLATFORM_URL="github.com"
        ;;
    2)
        PLATFORM="GitLab"
        PLATFORM_URL="gitlab.com"
        ;;
    3)
        PLATFORM="Custom"
        echo ""
        read -p "URL du serveur Git (ex: bitbucket.org): " PLATFORM_URL
        ;;
esac

echo ""
echo -e "${BLUE}📝 Configuration du nouveau repository ${PLATFORM}${NC}"
echo ""

# Get repository details
read -p "Nom d'utilisateur/organisation: " username
read -p "Nom du repository: " repo_name
read -p "Nom du remote (ex: origin, new-origin, backup) [new-repo]: " remote_name
remote_name=${remote_name:-new-repo}

# Choose protocol
echo ""
echo -e "${YELLOW}Protocole de connexion :${NC}"
echo "  1. HTTPS (recommandé pour débuter)"
echo "  2. SSH (recommandé si configuré)"
echo ""
read -p "Votre choix (1/2) [1]: " protocol_choice
protocol_choice=${protocol_choice:-1}

if [ "$protocol_choice" -eq 2 ]; then
    REPO_URL="git@${PLATFORM_URL}:${username}/${repo_name}.git"
else
    REPO_URL="https://${PLATFORM_URL}/${username}/${repo_name}.git"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Configuration :${NC}"
echo "  Plateforme : ${PLATFORM}"
echo "  Remote     : ${remote_name}"
echo "  URL        : ${REPO_URL}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Confirmer? (y/n) [y]: " confirm
confirm=${confirm:-y}

if [ "$confirm" != "y" ]; then
    echo -e "${YELLOW}Opération annulée${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔗 Ajout du remote...${NC}"

# Check if remote already exists
if git remote | grep -q "^${remote_name}$"; then
    echo -e "${YELLOW}⚠️  Le remote '${remote_name}' existe déjà${NC}"
    read -p "Voulez-vous le remplacer? (y/n) [n]: " replace
    replace=${replace:-n}

    if [ "$replace" = "y" ]; then
        git remote remove ${remote_name}
        echo -e "${GREEN}✅ Ancien remote supprimé${NC}"
    else
        echo -e "${YELLOW}Utilisez un autre nom de remote${NC}"
        exit 1
    fi
fi

# Add remote
git remote add ${remote_name} ${REPO_URL}
echo -e "${GREEN}✅ Remote ajouté${NC}"

# Verify
echo ""
echo -e "${BLUE}📊 Nouveaux remotes :${NC}"
git remote -v
echo ""

# Push options
echo -e "${YELLOW}Options de push :${NC}"
echo "  1. Push toutes les branches"
echo "  2. Push uniquement la branche actuelle"
echo "  3. Ne pas pousser maintenant (juste ajouter le remote)"
echo ""
read -p "Votre choix (1/2/3) [2]: " push_choice
push_choice=${push_choice:-2}

case $push_choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Push de toutes les branches...${NC}"

        # Get current branch
        CURRENT_BRANCH=$(git branch --show-current)

        # Push all branches
        git push -u ${remote_name} --all

        echo -e "${GREEN}✅ Toutes les branches poussées${NC}"

        # Push tags
        echo ""
        echo -e "${BLUE}🏷️  Push des tags...${NC}"
        git push ${remote_name} --tags
        echo -e "${GREEN}✅ Tags poussés${NC}"
        ;;
    2)
        CURRENT_BRANCH=$(git branch --show-current)
        echo ""
        echo -e "${BLUE}🚀 Push de la branche ${CURRENT_BRANCH}...${NC}"

        git push -u ${remote_name} ${CURRENT_BRANCH}

        echo -e "${GREEN}✅ Branche ${CURRENT_BRANCH} poussée${NC}"
        ;;
    3)
        echo -e "${YELLOW}⏭️  Push ignoré${NC}"
        echo ""
        echo -e "${BLUE}Pour pousser plus tard :${NC}"
        echo "  git push -u ${remote_name} $(git branch --show-current)"
        ;;
esac

echo ""
echo -e "${GREEN}✨ Configuration terminée !${NC}"
echo ""

# Update dual-repo scripts?
if [ -f "scripts/push-all.sh" ]; then
    echo -e "${YELLOW}💡 Voulez-vous mettre à jour les scripts dual-repo?${NC}"
    echo "   (Ajouter '${remote_name}' aux scripts de push automatique)"
    echo ""
    read -p "Mettre à jour? (y/n) [n]: " update_scripts
    update_scripts=${update_scripts:-n}

    if [ "$update_scripts" = "y" ]; then
        echo ""
        echo -e "${BLUE}🔧 Mise à jour des scripts...${NC}"

        # Backup
        cp scripts/push-all.sh scripts/push-all.sh.backup

        # Add new remote to push-all.sh
        # (This is a simple example, you may need to adjust)
        echo ""
        echo -e "${YELLOW}⚠️  Veuillez mettre à jour manuellement :${NC}"
        echo "   scripts/push-all.sh"
        echo "   scripts/commit-and-push-all.sh"
        echo ""
        echo "   Ajoutez ces lignes :"
        echo -e "${GREEN}"
        cat << 'SCRIPT_EXAMPLE'
# Push to new-repo
echo ""
echo -e "${BLUE}📤 Pushing to New Repo (new-repo)...${NC}"
if git push new-repo "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Successfully pushed to New Repo${NC}"
else
    echo -e "${RED}❌ Failed to push to New Repo${NC}"
    exit 1
fi
SCRIPT_EXAMPLE
        echo -e "${NC}"
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 Résumé :${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  🌐 Nouveau remote : ${remote_name}"
echo "  📦 URL          : ${REPO_URL}"
echo "  🔗 Plateforme   : ${PLATFORM}"
echo ""
echo -e "${BLUE}Commandes utiles :${NC}"
echo ""
echo "  # Push vers le nouveau repo"
echo "  git push ${remote_name} $(git branch --show-current)"
echo ""
echo "  # Push toutes les branches"
echo "  git push ${remote_name} --all"
echo ""
echo "  # Push les tags"
echo "  git push ${remote_name} --tags"
echo ""
echo "  # Voir tous les remotes"
echo "  git remote -v"
echo ""
echo "  # Supprimer le remote"
echo "  git remote remove ${remote_name}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
