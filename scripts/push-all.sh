#!/bin/bash
# Script to push to both GitHub and GitLab repositories

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Pushing to both GitHub and GitLab...${NC}"
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📍 Current branch: ${CURRENT_BRANCH}${NC}"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}⚠️  You have uncommitted changes!${NC}"
    echo -e "${YELLOW}Would you like to commit them now? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Enter commit message:${NC}"
        read -r commit_msg
        git add .
        git commit -m "$commit_msg"
    else
        echo -e "${RED}❌ Aborting push. Please commit your changes first.${NC}"
        exit 1
    fi
fi

# Push to GitLab (origin)
echo ""
echo -e "${BLUE}📤 Pushing to GitLab (origin)...${NC}"
if git push origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Successfully pushed to GitLab${NC}"
else
    echo -e "${RED}❌ Failed to push to GitLab${NC}"
    exit 1
fi

# Push to GitHub (old-origin)
echo ""
echo -e "${BLUE}📤 Pushing to GitHub (old-origin)...${NC}"
if git push old-origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    exit 1
fi

# Push tags
echo ""
echo -e "${BLUE}🏷️  Pushing tags to both remotes...${NC}"
git push origin --tags 2>/dev/null || echo -e "${YELLOW}⚠️  No new tags for GitLab${NC}"
git push old-origin --tags 2>/dev/null || echo -e "${YELLOW}⚠️  No new tags for GitHub${NC}"

echo ""
echo -e "${GREEN}✨ All done! Your code is synced on GitHub and GitLab! ✨${NC}"
echo ""
echo -e "${BLUE}📊 Repository URLs:${NC}"
echo -e "  • GitHub: https://github.com/Intowork-Search/IntoWork-Dashboard"
echo -e "  • GitLab: https://gitlab.com/badalot/intowork-dashboard"
