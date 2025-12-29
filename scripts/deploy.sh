#!/bin/bash

# ============================================================================
# Railway Deployment Script
# ============================================================================
# Automated deployment to Railway with pre-deployment checks
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_DEPLOY=true
FRONTEND_DEPLOY=false
VERIFY_ONLY=false
DRY_RUN=false

# ============================================================================
# FUNCTIONS
# ============================================================================

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -b, --backend           Deploy backend only (default)
    -f, --frontend          Deploy frontend only
    -a, --all               Deploy both backend and frontend
    -v, --verify            Verify deployment readiness only
    -d, --dry-run           Show what would be deployed (no actual deployment)
    -h, --help              Show this help message

Examples:
    # Deploy backend only
    $0 --backend

    # Deploy both
    $0 --all

    # Verify everything is ready
    $0 --verify

    # Check what would be deployed
    $0 --dry-run

EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--backend)
                BACKEND_DEPLOY=true
                FRONTEND_DEPLOY=false
                shift
                ;;
            -f|--frontend)
                BACKEND_DEPLOY=false
                FRONTEND_DEPLOY=true
                shift
                ;;
            -a|--all)
                BACKEND_DEPLOY=true
                FRONTEND_DEPLOY=true
                shift
                ;;
            -v|--verify)
                VERIFY_ONLY=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check git
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    print_success "git is installed"

    # Check for git repository
    if ! git -C "$PROJECT_ROOT" rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not a git repository"
        exit 1
    fi
    print_success "Git repository detected"

    # Check for Railway CLI
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found (install with: npm install -g @railway/cli)"
        print_info "Using git-based deployment instead (automatic via Railway GitHub integration)"
    else
        print_success "Railway CLI is installed"
    fi

    # Check Docker (for local testing)
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found (needed for local testing of Dockerfile.railway)"
    else
        print_success "Docker is installed"
    fi
}

verify_deployment_readiness() {
    print_header "Verifying Deployment Readiness"

    # Run verification script
    if [ -f "$SCRIPT_DIR/verify-deployment.sh" ]; then
        bash "$SCRIPT_DIR/verify-deployment.sh"
        local verify_result=$?

        if [ $verify_result -ne 0 ]; then
            return 1
        fi
    else
        print_warning "Verification script not found"
    fi

    return 0
}

check_backend_ready() {
    print_header "Backend Deployment Checks"

    # Check backend directory
    if [ ! -d "$PROJECT_ROOT/backend" ]; then
        print_error "Backend directory not found"
        return 1
    fi
    print_success "Backend directory exists"

    # Check start script
    if [ ! -f "$PROJECT_ROOT/backend/start.sh" ]; then
        print_error "start.sh not found"
        return 1
    fi

    if [ ! -x "$PROJECT_ROOT/backend/start.sh" ]; then
        print_warning "start.sh is not executable, making it executable..."
        chmod +x "$PROJECT_ROOT/backend/start.sh"
    fi
    print_success "start.sh is ready"

    # Check requirements
    if [ ! -f "$PROJECT_ROOT/backend/requirements.txt" ]; then
        print_error "requirements.txt not found"
        return 1
    fi
    print_success "requirements.txt found"

    # Check Dockerfile
    if [ ! -f "$PROJECT_ROOT/Dockerfile.railway" ]; then
        print_error "Dockerfile.railway not found"
        return 1
    fi
    print_success "Dockerfile.railway found"

    # Check railway config
    if [ ! -f "$PROJECT_ROOT/railway.json" ] && [ ! -f "$PROJECT_ROOT/railway.toml" ]; then
        print_error "railway.json or railway.toml not found"
        return 1
    fi
    print_success "Railway config found"

    return 0
}

check_git_status() {
    print_header "Git Status"

    # Check for uncommitted changes
    if ! git -C "$PROJECT_ROOT" diff-index --quiet HEAD -- ; then
        print_warning "Uncommitted changes detected:"
        git -C "$PROJECT_ROOT" status --short

        read -p "Continue deployment with uncommitted changes? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            return 1
        fi
    else
        print_success "Working directory clean"
    fi

    # Get current branch
    CURRENT_BRANCH=$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD)
    print_info "Current branch: $CURRENT_BRANCH"

    # Get latest commit
    LATEST_COMMIT=$(git -C "$PROJECT_ROOT" rev-parse --short HEAD)
    COMMIT_MESSAGE=$(git -C "$PROJECT_ROOT" log -1 --pretty=%B | head -1)
    print_info "Latest commit: $LATEST_COMMIT - $COMMIT_MESSAGE"

    return 0
}

deploy_backend() {
    print_header "Deploying Backend to Railway"

    if [ "$DRY_RUN" = true ]; then
        print_info "DRY RUN - No actual deployment"
        print_info "Would deploy:"
        print_info "  - Branch: $CURRENT_BRANCH"
        print_info "  - Commit: $LATEST_COMMIT"
        print_info "  - Dockerfile: Dockerfile.railway"
        print_info "  - Start command: bash backend/start.sh"
        return 0
    fi

    # Check for Railway CLI
    if command -v railway &> /dev/null; then
        print_info "Using Railway CLI for deployment..."

        # Link to project (interactive)
        railway link

        # Deploy
        railway deploy
        print_success "Backend deployed to Railway"
    else
        print_info "Railway CLI not available"
        print_info "Using GitHub integration for deployment..."
        print_info ""
        print_info "Deploying by pushing to GitHub (automatic Railway trigger):"

        # Push to GitHub
        git -C "$PROJECT_ROOT" push origin "$CURRENT_BRANCH"
        print_success "Pushed to GitHub - Railway will deploy automatically"

        print_info ""
        print_info "Monitor deployment at:"
        print_info "  https://railway.app/project/YOUR_PROJECT_ID"
    fi

    return 0
}

deploy_frontend() {
    print_header "Deploying Frontend to Vercel"

    if [ "$DRY_RUN" = true ]; then
        print_info "DRY RUN - No actual deployment"
        print_info "Would deploy:"
        print_info "  - Branch: $CURRENT_BRANCH"
        print_info "  - Commit: $LATEST_COMMIT"
        print_info "  - Framework: Next.js"
        return 0
    fi

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found"
        print_info "Deployment via GitHub integration (automatic):"
        git -C "$PROJECT_ROOT" push origin "$CURRENT_BRANCH"
        print_success "Pushed to GitHub - Vercel will deploy automatically"
    else
        print_info "Using Vercel CLI for deployment..."

        cd "$PROJECT_ROOT/frontend"
        vercel --prod
        print_success "Frontend deployed to Vercel"
        cd "$PROJECT_ROOT"
    fi

    return 0
}

show_deployment_status() {
    print_header "Deployment Instructions"

    echo "1. Monitor Railway backend deployment:"
    echo "   https://railway.app/dashboard"
    echo ""
    echo "2. Monitor Vercel frontend deployment:"
    echo "   https://vercel.com/dashboard"
    echo ""
    echo "3. Check logs:"
    echo "   Railway:  railway logs -s backend"
    echo "   Vercel:   vercel logs"
    echo ""
    echo "4. Test deployed application:"
    echo "   Backend:  https://intowork-backend-production.up.railway.app/health"
    echo "   Frontend: https://your-frontend-domain.com"
    echo ""
    echo "5. View environment variables:"
    echo "   Railway: railway variables"
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    print_header "IntoWork Dashboard - Railway Deployment"

    parse_arguments "$@"

    check_prerequisites

    if ! verify_deployment_readiness; then
        print_error "Deployment readiness verification failed"
        exit 1
    fi

    if [ "$VERIFY_ONLY" = true ]; then
        print_success "Deployment verification complete"
        exit 0
    fi

    check_git_status

    if [ "$BACKEND_DEPLOY" = true ]; then
        if ! check_backend_ready; then
            print_error "Backend readiness check failed"
            exit 1
        fi

        if ! deploy_backend; then
            print_error "Backend deployment failed"
            exit 1
        fi
    fi

    if [ "$FRONTEND_DEPLOY" = true ]; then
        if ! deploy_frontend; then
            print_error "Frontend deployment failed"
            exit 1
        fi
    fi

    show_deployment_status

    if [ "$DRY_RUN" = true ]; then
        print_warning "This was a DRY RUN - no actual deployment occurred"
    else
        print_success "Deployment initiated successfully!"
    fi
}

# Run main
main "$@"
