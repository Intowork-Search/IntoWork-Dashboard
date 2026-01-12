#!/bin/bash

# ============================================================================
# Railway Environment Variables Setup Script
# ============================================================================
# This script sets all required environment variables for the INTOWORK
# backend service on Railway.
#
# Project: Backend (717dcb80-672a-4ffa-9913-fbb295fa460c)
# Service: determined-heart
# ============================================================================

set -e  # Exit on any error

echo "=========================================="
echo "  INTOWORK Backend - Railway Variables"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Link to correct project
echo -e "${YELLOW}Step 1: Linking to Backend project...${NC}"
echo "Project ID: 717dcb80-672a-4ffa-9913-fbb295fa460c"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   Run this command manually (requires interactive prompt):"
echo ""
echo "   cd /home/jdtkd/IntoWork-Dashboard/backend"
echo "   railway link"
echo "   # Select: Backend project"
echo ""
read -p "Press Enter once you've linked to the Backend project..."
echo ""

# Verify link
echo "Verifying project link..."
CURRENT_PROJECT=$(railway status 2>&1 | grep "Project:" | awk '{print $2}')
echo "Currently linked to: $CURRENT_PROJECT"
echo ""

if [[ "$CURRENT_PROJECT" != *"Backend"* ]] && [[ "$CURRENT_PROJECT" != *"determined"* ]]; then
    echo -e "${RED}❌ Error: Not linked to Backend project${NC}"
    echo "   Current project: $CURRENT_PROJECT"
    echo "   Expected: Backend or similar"
    echo ""
    echo "Please run 'railway link' manually and select the Backend project"
    exit 1
fi

echo -e "${GREEN}✅ Linked to correct project${NC}"
echo ""

# Step 2: Set all environment variables
echo -e "${YELLOW}Step 2: Setting environment variables...${NC}"
echo ""

# Critical variables from the Postgres service
# These values are taken from the triumphant-embrace/Postgres service
VARIABLES=(
    "NEXTAUTH_SECRET=SgY7swlXrMEbVg1BKx61RRqYVfEAZntvep42bXVcNfY="
    "JWT_SECRET=bm8R9x5j7Wc6YuLrNOI7OrW/HW8bIosmhtLTAusiG0s="
    "JWT_ALGORITHM=HS256"
    "DATABASE_URL=postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@postgres.railway.internal:5432/railway"
    "RESEND_API_KEY=re_NNPZmCzV_4dRo7ks6GYXoatjG5KUjbv5N"
    "FROM_EMAIL=INTOWORK <noreply@intowork.com>"
    "FRONTEND_URL=https://www.intowork.co"
    "ALLOWED_ORIGINS=https://intowork.co,https://www.intowork.co"
    "ENVIRONMENT=production"
    "RAILWAY_ENVIRONMENT=production"
    "SECRET_KEY=uU3FCk6IjsOOfENPiYj+hAtsBpsMp9KRq8IJnxVDPm4="
    "LOG_LEVEL=INFO"
)

# Set each variable
for var in "${VARIABLES[@]}"; do
    VAR_NAME=$(echo "$var" | cut -d'=' -f1)
    VAR_VALUE=$(echo "$var" | cut -d'=' -f2-)

    echo "Setting $VAR_NAME..."

    # Use railway variables set
    if railway variables set "$var" 2>&1; then
        echo -e "${GREEN}✅ $VAR_NAME set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set $VAR_NAME${NC}"
        echo "   You may need to set this manually in Railway Dashboard"
    fi

    echo ""
done

echo ""
echo -e "${YELLOW}Step 3: Verifying variables...${NC}"
echo ""

# List all variables
echo "Current variables in Backend service:"
railway variables

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check deployment logs: railway logs"
echo "2. Verify service is running: railway status"
echo "3. Test health endpoint: curl https://determined-heart-production.up.railway.app/health"
echo ""
echo "If you see errors, check the deployment logs and the debug report:"
echo "   /home/jdtkd/IntoWork-Dashboard/backend/RAILWAY_DEPLOYMENT_DEBUG_REPORT.md"
echo ""
