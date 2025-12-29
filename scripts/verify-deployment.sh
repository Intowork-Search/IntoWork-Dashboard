#!/bin/bash

# ============================================================================
# Railway Deployment Verification Script
# ============================================================================
# Verifies that all necessary files and configurations are in place
# before deploying to Railway
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

check_file_exists() {
    local file=$1
    local description=$2

    if [ -f "$PROJECT_ROOT/$file" ]; then
        print_pass "$description found: $file"
    else
        print_fail "$description missing: $file"
    fi
}

check_directory_exists() {
    local dir=$1
    local description=$2

    if [ -d "$PROJECT_ROOT/$dir" ]; then
        print_pass "$description found: $dir"
    else
        print_fail "$description missing: $dir"
    fi
}

# ============================================================================
# CHECKS START
# ============================================================================

print_header "Railway Configuration Files"

check_file_exists "railway.json" "Railway JSON config"
check_file_exists "railway.toml" "Railway TOML config"
check_file_exists "Dockerfile.railway" "Railway Dockerfile"
check_file_exists "railway.env.example" "Railway env example"

print_header "Backend Structure"

check_directory_exists "backend" "Backend directory"
check_file_exists "backend/requirements.txt" "Python dependencies"
check_file_exists "backend/start.sh" "Backend start script"
check_directory_exists "backend/app" "Backend app directory"
check_directory_exists "backend/alembic" "Alembic migrations"

# Check if start.sh is executable
if [ -f "$PROJECT_ROOT/backend/start.sh" ]; then
    if [ -x "$PROJECT_ROOT/backend/start.sh" ]; then
        print_pass "Backend start script is executable"
    else
        print_warning "Backend start script is not executable (chmod +x recommended)"
        echo "  Run: chmod +x $PROJECT_ROOT/backend/start.sh"
    fi
fi

print_header "Frontend Structure"

check_directory_exists "frontend" "Frontend directory"
check_file_exists "frontend/package.json" "Frontend package.json"
check_directory_exists "frontend/src" "Frontend src directory"
check_file_exists "frontend/tsconfig.json" "Frontend TypeScript config"
check_file_exists "frontend/next.config.js" "Frontend Next.js config"

print_header "Git Configuration"

if [ -d "$PROJECT_ROOT/.git" ]; then
    print_pass "Git repository initialized"

    # Check if connected to GitHub
    if git -C "$PROJECT_ROOT" remote get-url origin > /dev/null 2>&1; then
        ORIGIN=$(git -C "$PROJECT_ROOT" remote get-url origin)
        print_pass "GitHub remote configured: $ORIGIN"
    else
        print_warning "No GitHub remote configured (needed for CI/CD)"
    fi

    # Check for uncommitted changes
    if git -C "$PROJECT_ROOT" diff-index --quiet HEAD -- ; then
        print_pass "No uncommitted changes"
    else
        print_warning "Uncommitted changes detected (commit before deploying)"
    fi
else
    print_fail "Not a git repository"
fi

print_header "Backend Configuration"

if [ -f "$PROJECT_ROOT/backend/app/main.py" ]; then
    print_pass "FastAPI main.py found"

    # Check for CORS configuration
    if grep -q "CORSMiddleware" "$PROJECT_ROOT/backend/app/main.py"; then
        print_pass "CORS middleware configured"
    else
        print_warning "CORS middleware not found (may need manual setup)"
    fi
else
    print_fail "FastAPI main.py not found"
fi

# Check database configuration
if grep -q "SQLAlchemy\|sqlalchemy" "$PROJECT_ROOT/backend/requirements.txt"; then
    print_pass "SQLAlchemy dependency found"
else
    print_fail "SQLAlchemy dependency missing"
fi

# Check alembic configuration
if [ -f "$PROJECT_ROOT/backend/alembic.ini" ]; then
    print_pass "Alembic configuration found"
else
    print_fail "Alembic configuration missing"
fi

print_header "Environment Variables"

if [ -f "$PROJECT_ROOT/railway.env.example" ]; then
    # Count required variables
    REQUIRED_VARS=$(grep -c "^[A-Z_]*=" "$PROJECT_ROOT/railway.env.example" || true)
    print_pass "Environment template has $REQUIRED_VARS variables defined"

    # Check for critical variables
    CRITICAL_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "SECRET_KEY")

    for var in "${CRITICAL_VARS[@]}"; do
        if grep -q "$var" "$PROJECT_ROOT/railway.env.example"; then
            print_pass "Critical variable '$var' documented"
        else
            print_fail "Critical variable '$var' not documented"
        fi
    done
fi

print_header "Python Dependencies"

if [ -f "$PROJECT_ROOT/backend/requirements.txt" ]; then
    FASTAPI_FOUND=0
    UVICORN_FOUND=0
    SQLALCHEMY_FOUND=0
    ALEMBIC_FOUND=0

    [ -n "$(grep '^fastapi' "$PROJECT_ROOT/backend/requirements.txt")" ] && FASTAPI_FOUND=1
    [ -n "$(grep '^uvicorn' "$PROJECT_ROOT/backend/requirements.txt")" ] && UVICORN_FOUND=1
    [ -n "$(grep '^SQLAlchemy' "$PROJECT_ROOT/backend/requirements.txt")" ] && SQLALCHEMY_FOUND=1
    [ -n "$(grep '^alembic' "$PROJECT_ROOT/backend/requirements.txt")" ] && ALEMBIC_FOUND=1

    [ $FASTAPI_FOUND -eq 1 ] && print_pass "FastAPI dependency found" || print_fail "FastAPI dependency missing"
    [ $UVICORN_FOUND -eq 1 ] && print_pass "Uvicorn dependency found" || print_fail "Uvicorn dependency missing"
    [ $SQLALCHEMY_FOUND -eq 1 ] && print_pass "SQLAlchemy dependency found" || print_fail "SQLAlchemy dependency missing"
    [ $ALEMBIC_FOUND -eq 1 ] && print_pass "Alembic dependency found" || print_fail "Alembic dependency missing"
fi

print_header "Frontend Dependencies"

if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
    NEXTJS_FOUND=0
    NEXTAUTH_FOUND=0
    TYPESCRIPT_FOUND=0

    [ -n "$(grep '"next"' "$PROJECT_ROOT/frontend/package.json")" ] && NEXTJS_FOUND=1
    [ -n "$(grep '"next-auth"' "$PROJECT_ROOT/frontend/package.json")" ] && NEXTAUTH_FOUND=1
    [ -n "$(grep '"typescript"' "$PROJECT_ROOT/frontend/package.json")" ] && TYPESCRIPT_FOUND=1

    [ $NEXTJS_FOUND -eq 1 ] && print_pass "Next.js dependency found" || print_fail "Next.js dependency missing"
    [ $NEXTAUTH_FOUND -eq 1 ] && print_pass "NextAuth.js dependency found" || print_fail "NextAuth.js dependency missing"
    [ $TYPESCRIPT_FOUND -eq 1 ] && print_pass "TypeScript dependency found" || print_fail "TypeScript dependency missing"
fi

print_header "Docker Configuration"

if [ -f "$PROJECT_ROOT/Dockerfile.railway" ]; then
    print_pass "Dockerfile.railway exists"

    # Check for multi-stage build
    if grep -q "FROM.*as builder" "$PROJECT_ROOT/Dockerfile.railway"; then
        print_pass "Multi-stage Docker build configured (optimized)"
    else
        print_warning "Single-stage Docker build (consider multi-stage for size optimization)"
    fi

    # Check for health check
    if grep -q "HEALTHCHECK" "$PROJECT_ROOT/Dockerfile.railway"; then
        print_pass "Docker health check configured"
    else
        print_warning "Docker health check not configured (recommended)"
    fi
else
    print_fail "Dockerfile.railway not found"
fi

print_header "Security Checks"

# Check for secrets in files
if grep -r "sk_test_\|pk_test_" "$PROJECT_ROOT" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.json" 2>/dev/null | grep -v "node_modules" | grep -v ".env.example" > /dev/null; then
    print_fail "WARNING: Test keys found in code (should be removed before production)"
else
    print_pass "No obvious secrets in source code"
fi

# Check for .env files in git
if git -C "$PROJECT_ROOT" ls-files | grep -E "\.env(\.|$)" > /dev/null 2>/dev/null; then
    print_fail "ERROR: .env files tracked by git (remove with: git rm --cached .env)"
else
    print_pass ".env files not tracked by git"
fi

print_header "Documentation"

check_file_exists "RAILWAY_DEPLOYMENT_GUIDE.md" "Railway deployment guide"
check_file_exists "README.md" "Project README"

print_header "Verification Summary"

echo -e "\n${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS\n"

# ============================================================================
# RECOMMENDATIONS
# ============================================================================

if [ $FAILED -gt 0 ]; then
    echo -e "\n${RED}DEPLOYMENT NOT READY${NC}"
    echo "Fix the $FAILED failed checks above before deploying."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "\n${YELLOW}DEPLOYMENT READY WITH WARNINGS${NC}"
    echo "Address the $WARNINGS warnings above for better results."
    exit 0
else
    echo -e "\n${GREEN}DEPLOYMENT READY${NC}"
    echo "All checks passed! Ready to deploy to Railway."
    exit 0
fi
