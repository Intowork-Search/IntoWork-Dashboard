#!/bin/bash
# Script to commit and push to GitHub repositories in one command

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if commit message was provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Commit message required${NC}"
    echo -e "${YELLOW}Usage: $0 \"Your commit message\"${NC}"
    echo -e "${YELLOW}Example: $0 \"feat: Add new feature\"${NC}"
    exit 1
fi

COMMIT_MSG="$1"
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${BLUE}🚀 Commit and Push to GitHub Repositories${NC}"
echo -e "${YELLOW}Branch: ${CURRENT_BRANCH}${NC}"
echo -e "${YELLOW}Message: ${COMMIT_MSG}${NC}"
echo ""

# Check for changes
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    echo -e "${BLUE}Pushing existing commits...${NC}"
else
    # Stage all changes
    echo -e "${BLUE}📝 Staging changes...${NC}"
    git add .

    # Show what will be committed
    echo -e "${BLUE}📋 Files to be committed:${NC}"
    git status --short
    echo ""

    # Commit
    echo -e "${BLUE}💾 Creating commit...${NC}"
    git commit -m "$COMMIT_MSG

🤖 Generated with automation script
Co-Authored-By: IntoWork Team <team@intowork.com>"

    echo -e "${GREEN}✅ Commit created${NC}"
fi

# Push to GitHub (old-origin)
echo ""
echo -e "${BLUE}📤 Pushing to GitHub (old-origin)...${NC}"
if git push old-origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ GitHub (old-origin) sync complete${NC}"
else
    echo -e "${RED}❌ GitHub (old-origin) push failed${NC}"
    exit 1
fi

# Push to GitHub (github)
echo ""
echo -e "${BLUE}📤 Pushing to GitHub (github)...${NC}"
if git push github "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ GitHub (github) sync complete${NC}"
else
    echo -e "${RED}❌ GitHub (github) push failed${NC}"
    exit 1
fi

# Success summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Success! Your changes are now on:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  🐙 GitHub (old-origin): https://github.com/Intowork-Search/IntoWork-Dashboard"
echo -e "  🐙 GitHub (github): https://github.com/badalot/IntoWork-Dashboard.git"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Latest commit:${NC}"
git log -1 --oneline
