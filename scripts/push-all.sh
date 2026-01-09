#!/bin/bash
# Script to push to GitHub repositories

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Pushing to GitHub repositories...${NC}"
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

# Push to GitHub (old-origin)
echo ""
echo -e "${BLUE}📤 Pushing to GitHub (old-origin)...${NC}"
if git push old-origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub (old-origin)${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub (old-origin)${NC}"
    exit 1
fi

# Push to GitHub (github)
echo ""
echo -e "${BLUE}📤 Pushing to GitHub (github)...${NC}"
if git push github "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub (github)${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub (github)${NC}"
    exit 1
fi

# Push tags
echo ""
echo -e "${BLUE}🏷️  Pushing tags to GitHub remotes...${NC}"
git push old-origin --tags 2>/dev/null || echo -e "${YELLOW}⚠️  No new tags for old-origin${NC}"
git push github --tags 2>/dev/null || echo -e "${YELLOW}⚠️  No new tags for github${NC}"

echo ""
echo -e "${GREEN}✨ All done! Your code is synced on GitHub! ✨${NC}"
echo ""
echo -e "${BLUE}📊 Repository URLs:${NC}"
echo -e "  • GitHub (old-origin): https://github.com/Intowork-Search/IntoWork-Dashboard"
echo -e "  • GitHub (github): https://github.com/badalot/IntoWork-Dashboard.git"
