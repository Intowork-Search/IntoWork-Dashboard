# Railway Backend Deployment - Root Cause Analysis & Solution

**Date:** 2026-01-08
**Status:** CRITICAL - Backend Service in Crash Loop
**Severity:** Production Down

---

## Executive Summary

The INTOWORK backend service is experiencing a **crash loop** on Railway due to missing environment variables. The root cause is that environment variables were configured in the **Postgres service** (in the "triumphant-embrace" project) but the **backend application** is deployed in a separate service ("determined-heart" in the "Backend" project). Railway does not automatically share environment variables across different projects or services.

**Impact:**
- 100% backend API downtime
- Frontend cannot connect to backend
- Database migrations not running
- Password reset emails not functioning
- All user authentication failing

---

## Root Cause Analysis

### 1. Problem Identification

**Error Pattern:**
```bash
🚀 Démarrage IntoWork Backend sur Railway...
❌ NEXTAUTH_SECRET non définie
```

This error repeats indefinitely, causing Railway to continuously restart the service.

**Location:** `/home/jdtkd/IntoWork-Dashboard/backend/start.sh` (lines 12-15)

```bash
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET non définie"
    exit 1
fi
```

### 2. Environment Variable Mismatch

**Current State:**

| Component | Railway Project | Service Name | Has Variables? |
|-----------|----------------|--------------|----------------|
| PostgreSQL Database | triumphant-embrace (8f71755e) | Postgres | ✅ YES (36 variables) |
| Backend Application | Backend (717dcb80) | determined-heart | ❌ NO |

**Variables in Postgres Service (triumphant-embrace):**
- ✅ `NEXTAUTH_SECRET=SgY7swlXrMEbVg1BKx61RRqYVfEAZntvep42bXVcNfY=`
- ✅ `JWT_SECRET=bm8R9x5j7Wc6YuLrNOI7OrW/HW8bIosmhtLTAusiG0s=`
- ✅ `DATABASE_URL=postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@postgres.railway.internal:5432/railway`
- ✅ `RESEND_API_KEY=re_NNPZmCzV_4dRo7ks6GYXoatjG5KUjbv5N`
- ✅ `FRONTEND_URL=https://www.intowork.co`
- ✅ `ALLOWED_ORIGINS=https://frontend-one-mu-45.vercel.app,https://intowork.co,https://www.intowork.co`
- Plus 30+ other PostgreSQL-specific variables

**Variables in Backend Service (determined-heart):**
- ❌ NONE (this is the problem!)

### 3. Why This Happened

Railway uses a **project-based isolation model**:
- Each project has its own set of services
- Environment variables are scoped to the **service level**, not project level
- Variables set in one service (Postgres) are **NOT visible** to other services (Backend) unless they are in the same project and explicitly shared
- The current setup has the database in one project and the application in another project

**Architecture Issue:**
```
triumphant-embrace (Project A)
└── Postgres Service
    └── Has all environment variables ✅

Backend (Project B)
└── determined-heart Service
    └── NO environment variables ❌ (CRASH LOOP)
```

### 4. Application Code Requirements

The backend application **requires** these environment variables at startup:

**Critical (Application Won't Start):**
1. `NEXTAUTH_SECRET` - Validated in `/backend/app/auth.py` line 22-24:
   ```python
   NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET")
   if not NEXTAUTH_SECRET:
       raise ValueError("NEXTAUTH_SECRET environment variable is required")
   ```

2. `DATABASE_URL` - Checked in `/backend/start.sh` lines 7-10

**Required for Full Functionality:**
3. `JWT_SECRET` - Used for JWT token signing
4. `JWT_ALGORITHM` - Should be "HS256"
5. `RESEND_API_KEY` - For password reset emails
6. `FROM_EMAIL` - Email sender address
7. `FRONTEND_URL` - For CORS and password reset links
8. `ALLOWED_ORIGINS` - CORS configuration

**Optional (Has Defaults):**
9. `ENVIRONMENT` - Defaults to "development"
10. `LOG_LEVEL` - Defaults to "INFO"
11. `SECRET_KEY` - Additional security key
12. `REDIS_URL` - For caching (optional feature)

---

## Complete Solution

### Solution A: Set Variables in Backend Service (RECOMMENDED)

This is the **fastest and most straightforward** solution. Copy all required environment variables from the Postgres service to the Backend service.

#### Step 1: Link to Backend Project

```bash
cd /home/jdtkd/IntoWork-Dashboard/backend

# Link to the Backend project
railway link 717dcb80-672a-4ffa-9913-fbb295fa460c

# Verify link
railway status
# Should show: Project: Backend, Service: determined-heart
```

#### Step 2: Set Required Environment Variables

**Option A: Using Railway CLI (RECOMMENDED - Fastest)**

```bash
# Set all critical variables in one command
railway variables set \
  NEXTAUTH_SECRET="SgY7swlXrMEbVg1BKx61RRqYVfEAZntvep42bXVcNfY=" \
  JWT_SECRET="bm8R9x5j7Wc6YuLrNOI7OrW/HW8bIosmhtLTAusiG0s=" \
  JWT_ALGORITHM="HS256" \
  DATABASE_URL="postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@postgres.railway.internal:5432/railway" \
  RESEND_API_KEY="re_NNPZmCzV_4dRo7ks6GYXoatjG5KUjbv5N" \
  FROM_EMAIL="INTOWORK <noreply@intowork.com>" \
  FRONTEND_URL="https://www.intowork.co" \
  ALLOWED_ORIGINS="https://intowork.co,https://www.intowork.co" \
  ENVIRONMENT="production" \
  RAILWAY_ENVIRONMENT="production" \
  SECRET_KEY="uU3FCk6IjsOOfENPiYj+hAtsBpsMp9KRq8IJnxVDPm4=" \
  LOG_LEVEL="INFO"
```

**Option B: Using Railway Dashboard (Manual)**

1. Go to https://railway.app/project/717dcb80-672a-4ffa-9913-fbb295fa460c
2. Select the "determined-heart" service
3. Go to "Variables" tab
4. Click "New Variable" and add each variable:

| Variable Name | Value |
|---------------|-------|
| `NEXTAUTH_SECRET` | `SgY7swlXrMEbVg1BKx61RRqYVfEAZntvep42bXVcNfY=` |
| `JWT_SECRET` | `bm8R9x5j7Wc6YuLrNOI7OrW/HW8bIosmhtLTAusiG0s=` |
| `JWT_ALGORITHM` | `HS256` |
| `DATABASE_URL` | `postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@postgres.railway.internal:5432/railway` |
| `RESEND_API_KEY` | `re_NNPZmCzV_4dRo7ks6GYXoatjG5KUjbv5N` |
| `FROM_EMAIL` | `INTOWORK <noreply@intowork.com>` |
| `FRONTEND_URL` | `https://www.intowork.co` |
| `ALLOWED_ORIGINS` | `https://intowork.co,https://www.intowork.co` |
| `ENVIRONMENT` | `production` |
| `RAILWAY_ENVIRONMENT` | `production` |
| `SECRET_KEY` | `uU3FCk6IjsOOfENPiYj+hAtsBpsMp9KRq8IJnxVDPm4=` |
| `LOG_LEVEL` | `INFO` |

5. Click "Deploy" to trigger a new deployment

#### Step 3: Verify Variables Are Set

```bash
# Check all variables
railway variables

# Should now show all 12 variables listed above
```

### Solution B: Consolidate Services (BETTER LONG-TERM)

Move the backend service into the same project as the Postgres database. This allows using Railway's native service references.

#### Step 1: Create Backend Service in triumphant-embrace Project

```bash
cd /home/jdtkd/IntoWork-Dashboard/backend

# Link to triumphant-embrace project
railway link 8f71755e-975b-46ec-9af5-55ed6a50edc8

# Create new service in this project
railway service create backend

# Link to the new service
railway service link backend
```

#### Step 2: Reference Variables

In the triumphant-embrace project, variables can be shared or referenced between services:

```bash
# Set backend-specific variables (others inherit from project)
railway variables set \
  NEXTAUTH_SECRET="SgY7swlXrMEbVg1BKx61RRqYVfEAZntvep42bXVcNfY=" \
  JWT_SECRET="bm8R9x5j7Wc6YuLrNOI7OrW/HW8bIosmhtLTAusiG0s=" \
  JWT_ALGORITHM="HS256" \
  RESEND_API_KEY="re_NNPZmCzV_4dRo7ks6GYXoatjG5KUjbv5N" \
  FROM_EMAIL="INTOWORK <noreply@intowork.com>" \
  FRONTEND_URL="https://www.intowork.co" \
  ALLOWED_ORIGINS="https://intowork.co,https://www.intowork.co"
```

**Note:** `DATABASE_URL` can use Railway's service reference: `${{Postgres.DATABASE_URL}}`

#### Step 3: Deploy Backend

```bash
# Deploy from current directory
railway up

# Or enable automatic deployments from GitHub
```

#### Step 4: Delete Old Backend Project

Once the new backend service is working:
1. Go to https://railway.app/project/717dcb80-672a-4ffa-9913-fbb295fa460c
2. Delete the "Backend" project (no longer needed)

---

## Verification Steps

### 1. Verify Variables Are Set

```bash
cd /home/jdtkd/IntoWork-Dashboard/backend

# Link to Backend project
railway link 717dcb80-672a-4ffa-9913-fbb295fa460c

# Check variables
railway variables

# Expected output: Should show all 12 variables
```

### 2. Check Deployment Status

```bash
# View deployment logs
railway logs --deployment

# Look for these success indicators:
# ✅ "🚀 Démarrage IntoWork Backend sur Railway..."
# ✅ "📊 Exécution des migrations de base de données..."
# ✅ "✅ Migrations terminées"
# ✅ "🎯 Démarrage du serveur FastAPI sur le port..."
# ✅ "Application startup complete"
```

### 3. Test API Connectivity

```bash
# Get the backend URL from Railway
railway domain

# Test health endpoint (replace URL with your actual URL)
curl https://determined-heart-production.up.railway.app/health

# Expected response:
# {"status":"healthy","service":"intowork-backend"}

# Test API root
curl https://determined-heart-production.up.railway.app/api

# Expected response with service info
```

### 4. Verify Database Migrations

```bash
# View logs to confirm migrations ran
railway logs | grep -A 5 "migrations"

# Expected output:
# 📊 Exécution des migrations de base de données...
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO  [alembic.runtime.migration] Will assume transactional DDL.
# ✅ Migrations terminées
```

### 5. Test Authentication

```bash
# Test signup endpoint
curl -X POST https://determined-heart-production.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!@#",
    "first_name": "Test",
    "last_name": "User"
  }'

# Should return 200 OK with JWT token
```

### 6. Frontend Connection Test

Update frontend environment variable:
```env
NEXT_PUBLIC_API_URL=https://determined-heart-production.up.railway.app/api
```

Test from frontend:
1. Navigate to https://intowork.co
2. Try to sign up or sign in
3. Check browser console for API calls
4. Should connect successfully without CORS errors

---

## Prevention Recommendations

### 1. Environment Variable Management

**Best Practice: Use .env.production Template**

Create a deployment checklist based on `/home/jdtkd/IntoWork-Dashboard/.env.production.example`:

```bash
# Create production environment setup script
cat > /home/jdtkd/IntoWork-Dashboard/backend/setup-railway-env.sh << 'EOF'
#!/bin/bash
# Railway Environment Variable Setup Script

echo "🔧 Setting up Railway environment variables..."

# Prompt for Railway project
echo "Select Railway project:"
echo "1. Backend (717dcb80)"
echo "2. triumphant-embrace (8f71755e)"
read -p "Enter choice (1 or 2): " choice

case $choice in
  1) PROJECT_ID="717dcb80-672a-4ffa-9913-fbb295fa460c" ;;
  2) PROJECT_ID="8f71755e-975b-46ec-9af5-55ed6a50edc8" ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

# Link to project
railway link $PROJECT_ID

# Load variables from .env.production
if [ ! -f "../.env.production" ]; then
  echo "❌ .env.production not found. Create it from .env.production.example"
  exit 1
fi

# Read and set each variable
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue

  # Remove quotes if present
  value="${value%\"}"
  value="${value#\"}"

  echo "Setting $key..."
  railway variables set "$key=$value"
done < "../.env.production"

echo "✅ All environment variables set successfully"
railway variables
EOF

chmod +x /home/jdtkd/IntoWork-Dashboard/backend/setup-railway-env.sh
```

### 2. Deployment Checklist

Create **DEPLOYMENT_CHECKLIST.md** in project root:

```markdown
# Railway Deployment Checklist

## Pre-Deployment

- [ ] Create .env.production from .env.production.example
- [ ] Generate secure secrets using ./scripts/generate-secrets.sh
- [ ] Update FRONTEND_URL to production domain
- [ ] Update ALLOWED_ORIGINS with all production domains
- [ ] Verify DATABASE_URL points to Railway Postgres
- [ ] Test email service with RESEND_API_KEY

## Railway Setup

- [ ] Link to correct Railway project
- [ ] Set all environment variables (use setup-railway-env.sh)
- [ ] Verify variables with `railway variables`
- [ ] Configure custom domain if needed
- [ ] Set up automatic deployments from GitHub

## Post-Deployment Verification

- [ ] Check deployment logs for errors
- [ ] Verify migrations ran successfully
- [ ] Test health endpoint (/health)
- [ ] Test API root endpoint (/api)
- [ ] Test authentication (signup/signin)
- [ ] Test frontend connection
- [ ] Monitor logs for 24 hours

## Rollback Plan

- [ ] Keep previous deployment ID
- [ ] Document rollback procedure
- [ ] Test rollback in staging first
```

### 3. Railway Project Structure

**RECOMMENDED: Consolidate into Single Project**

```
intowork-production (Single Project)
├── postgres (Service)
│   └── PostgreSQL 15 with persistent volume
├── backend (Service)
│   ├── FastAPI application
│   ├── Shares project-level variables
│   └── References: ${{Postgres.DATABASE_URL}}
└── Environment Variables (Project Level)
    ├── NEXTAUTH_SECRET
    ├── JWT_SECRET
    ├── RESEND_API_KEY
    └── etc.
```

**Benefits:**
- Single source of truth for environment variables
- Easy service-to-service communication
- Simplified deployment process
- Reduced risk of variable mismatch

### 4. Automated Variable Validation

Add validation to `start.sh`:

```bash
#!/bin/bash
# Enhanced Railway Startup Script with Validation

echo "🚀 Démarrage IntoWork Backend sur Railway..."

# Array of required variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "JWT_SECRET"
  "JWT_ALGORITHM"
  "RESEND_API_KEY"
  "FROM_EMAIL"
  "FRONTEND_URL"
)

# Validate all required variables
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '   - %s\n' "${MISSING_VARS[@]}"
  echo ""
  echo "Set these variables in Railway Dashboard or using Railway CLI:"
  echo "railway variables set VARIABLE_NAME=\"value\""
  exit 1
fi

echo "✅ All required environment variables present"

# Continue with deployment...
```

### 5. Documentation Updates

**Update CLAUDE.md:**

Add Railway-specific deployment section:

```markdown
## Railway Deployment - Environment Variables

### Critical Requirements

The backend service MUST have these variables set:

1. **NEXTAUTH_SECRET** - JWT secret (min 32 chars)
2. **DATABASE_URL** - PostgreSQL connection string
3. **JWT_SECRET** - Additional JWT secret
4. **JWT_ALGORITHM** - Must be "HS256"
5. **RESEND_API_KEY** - Email service API key

### Setup Process

1. Link to Railway project:
   ```bash
   cd backend
   railway link <project-id>
   ```

2. Set variables using script:
   ```bash
   ./setup-railway-env.sh
   ```

3. Verify variables:
   ```bash
   railway variables
   ```

4. Deploy:
   ```bash
   railway up
   ```

### Troubleshooting

If deployment fails with "NEXTAUTH_SECRET non définie":
- Variables are missing in the service
- Run `railway variables` to check
- Re-run setup script if needed
```

### 6. Monitoring and Alerting

**Set up Railway Alerts:**

1. Go to Railway Dashboard
2. Settings > Notifications
3. Configure alerts for:
   - Deployment failures
   - Service crashes
   - High error rates
   - Resource limits

**Add Health Check Monitoring:**

Use Railway's built-in health checks or external service like UptimeRobot:
- Endpoint: https://determined-heart-production.up.railway.app/health
- Interval: 5 minutes
- Alert on: 3 consecutive failures

---

## Timeline for Resolution

### Immediate (0-5 minutes)
1. Link to Backend project: `railway link 717dcb80-672a-4ffa-9913-fbb295fa460c`
2. Set all 12 environment variables using Railway CLI
3. Deployment automatically triggers

### Short-term (5-15 minutes)
4. Monitor deployment logs for success
5. Verify health endpoint responds
6. Test authentication from frontend

### Long-term (1-2 hours)
7. Create deployment documentation
8. Set up monitoring and alerts
9. Plan migration to consolidated project structure

---

## Success Criteria

**Deployment is successful when:**

1. ✅ Railway shows "Active" status (no crash loop)
2. ✅ Logs show "Application startup complete"
3. ✅ Health endpoint returns 200 OK
4. ✅ API endpoints respond correctly
5. ✅ Frontend can connect and authenticate
6. ✅ Database migrations completed
7. ✅ No error logs in Railway dashboard

---

## Related Files

- `/home/jdtkd/IntoWork-Dashboard/backend/start.sh` - Startup script with variable checks
- `/home/jdtkd/IntoWork-Dashboard/backend/.env.example` - Development environment template
- `/home/jdtkd/IntoWork-Dashboard/.env.production.example` - Production environment template
- `/home/jdtkd/IntoWork-Dashboard/backend/app/auth.py` - Authentication configuration
- `/home/jdtkd/IntoWork-Dashboard/backend/app/main.py` - FastAPI application entry

---

## Contact & Support

- Railway Dashboard: https://railway.app/project/717dcb80-672a-4ffa-9913-fbb295fa460c
- Railway Documentation: https://docs.railway.app
- Project Repository: GitHub/GitLab (dual-repo setup)

**Generated:** 2026-01-08
**Last Updated:** 2026-01-08
