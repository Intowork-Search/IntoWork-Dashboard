#!/bin/bash
# Script to commit and push to both GitHub and GitLab in one command

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

echo -e "${BLUE}🚀 Commit and Push to Both Repositories${NC}"
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

# Push to GitLab
echo ""
echo -e "${BLUE}📤 Pushing to GitLab...${NC}"
if git push origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ GitLab sync complete${NC}"
else
    echo -e "${RED}❌ GitLab push failed${NC}"
    exit 1
fi

# Push to GitHub
echo ""
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
if git push old-origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ GitHub sync complete${NC}"
else
    echo -e "${RED}❌ GitHub push failed${NC}"
    exit 1
fi

# Success summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Success! Your changes are now on:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  🐙 GitHub:  https://github.com/Intowork-Search/IntoWork-Dashboard"
echo -e "  🦊 GitLab:  https://gitlab.com/badalot/intowork-dashboard"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Latest commit:${NC}"
git log -1 --oneline
