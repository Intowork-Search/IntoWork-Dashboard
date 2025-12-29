# Railway Deployment Guide - IntoWork Dashboard

Complete guide to deploying the IntoWork Dashboard on Railway with CI/CD automation from GitHub.

**Status**: Production-Ready
**Last Updated**: 2025-12-26
**Architecture**: Backend (FastAPI) + Frontend (Next.js) + PostgreSQL

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup & Migrations](#database-setup--migrations)
6. [GitHub Integration & CI/CD](#github-integration--cicd)
7. [Vercel Frontend Deployment](#vercel-frontend-deployment)
8. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
9. [Security Best Practices](#security-best-practices)
10. [Maintenance & Operations](#maintenance--operations)

---

## Prerequisites

### Required Accounts

- **Railway Account** - https://railway.app (free tier available)
- **GitHub Account** - For CI/CD automation
- **Vercel Account** (optional) - https://vercel.com for frontend deployment
- **Text Editor** - For managing secrets

### Local Setup

Ensure your local environment is properly configured:

```bash
# Clone the repository
git clone <your-repo-url>
cd IntoWork-Dashboard

# Create backend virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create frontend node_modules
cd ../frontend
npm install
```

---

## Architecture Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                      │
│  (Source code with railway.json, Dockerfile.railway)        │
└────────────────────┬────────────────────────────────────────┘
                     │ Push to main branch
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Railway Dashboard                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Backend Service (FastAPI)                            │  │
│  │ - Build: Docker (Dockerfile.railway)                 │  │
│  │ - Start Command: bash backend/start.sh               │  │
│  │ - Port: 8000                                         │  │
│  │ - Health Check: /health endpoint                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                  │  │
│  │ - Automatic DATABASE_URL injection                   │  │
│  │ - Automatic backups                                  │  │
│  │ - Connection pooling configured                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ API calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Deployment                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Frontend (Next.js 14)                                │  │
│  │ - GitHub integration (auto-deploy)                   │  │
│  │ - Environment variables configured                   │  │
│  │ - Connected to Railway backend API                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Browser
    ↓
    ├─→ Frontend (Vercel) - Next.js + NextAuth
    │   ├─→ API Requests to Railway Backend
    │   └─→ Session Management (NextAuth)
    │
    ├─→ Backend (Railway) - FastAPI
    │   ├─→ JWT Validation (NextAuth tokens)
    │   ├─→ Database Queries (PostgreSQL)
    │   └─→ File Operations (CV uploads)
    │
    └─→ Database (Railway PostgreSQL)
        ├─→ Users & Authentication
        ├─→ Candidates & Profiles
        ├─→ Jobs & Applications
        └─→ File Metadata
```

---

## Step-by-Step Deployment

### Phase 1: Create Railway Project

#### 1.1 Create a new Railway project

```bash
# Go to https://railway.app
# Click "New Project"
# Select "Deploy from GitHub repo"
# Or select "Create an empty project" if starting fresh
```

#### 1.2 Link GitHub Repository

```
Dashboard → Projects → New Project → GitHub
├─ Select "Existing Repositories"
├─ Find and select "IntoWork-Dashboard"
├─ Authorize Railway to access your repository
└─ Choose which branch to deploy (main)
```

#### 1.3 Create the Project Structure

In Railway:

1. **Create Backend Service**
   - Service → Add Service → GitHub Repo
   - Select IntoWork-Dashboard
   - Railway will detect `railway.json` automatically
   - Build method: Docker (uses `Dockerfile.railway`)

2. **Add PostgreSQL Database**
   - Add Service → Database → PostgreSQL
   - Railway automatically creates `DATABASE_URL` environment variable
   - All connection details handled automatically

---

### Phase 2: Configure Environment Variables

#### 2.1 Backend Environment Variables

In Railway Dashboard → Backend Service → Variables:

```
# Core Configuration
ENVIRONMENT=production
PORT=8000

# Database (auto-injected by Railway)
DATABASE_URL=[auto-populated]

# NextAuth (Generate new secrets)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-frontend-domain.com

# API Configuration
NEXT_PUBLIC_API_URL=https://<your-railway-domain>/api
CORS_ORIGIN=https://your-frontend-domain.com,https://your-frontend-domain-*.vercel.app

# Security
SECRET_KEY=<generate-with-openssl-rand-base64-32>

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
AZURE_AD_CLIENT_ID=<your-azure-client-id>
AZURE_AD_CLIENT_SECRET=<your-azure-client-secret>
AZURE_AD_TENANT_ID=<your-azure-tenant-id>

# Optional: Monitoring
LOG_LEVEL=info
SENTRY_DSN=<optional-sentry-dsn>
```

#### 2.2 Generate Required Secrets

Use these commands to generate secure random strings:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate SECRET_KEY
openssl rand -base64 32

# Example outputs:
# NEXTAUTH_SECRET=aB7xK9pL2mN4qR6sT8uV1wX3yZ5cD7eF9gH2jK4lM6nO8pQ=
# SECRET_KEY=zY8xW6vU4tS2rQ0pO9nM8lK7jI6hG5fE4dC3bA2zA1yX9wV=
```

#### 2.3 Copy from Example File

Alternatively, use the provided example:

```bash
# Copy the railway.env.example file
cp railway.env.example railway.env.production

# Edit and replace placeholders
vim railway.env.production
```

---

### Phase 3: Database Configuration

#### 3.1 PostgreSQL Setup

Railway automatically handles PostgreSQL setup:

1. In Railway Dashboard, PostgreSQL service shows:
   - Connection string (DATABASE_URL)
   - Credentials
   - Connection pooling options

2. The connection URL looks like:
   ```
   postgresql://postgres:PASSWORD@hostname.proxy.rlwy.net:PORT/railway
   ```

#### 3.2 Run Database Migrations

Migrations run automatically when the backend starts:

```bash
# The backend/start.sh script includes:
# python -m alembic upgrade head

# This happens automatically on Railway:
# 1. Container starts
# 2. start.sh runs
# 3. Alembic migrations execute
# 4. FastAPI server starts on $PORT
```

#### 3.3 Verify Database Connection

Check Railway logs:

```
Railway Dashboard → Backend Service → Deployments → Latest → Logs

Look for these messages:
✓ "📊 Exécution des migrations de base de données..."
✓ "✅ Migrations terminées"
✓ "🎯 Démarrage du serveur FastAPI..."
✓ "Uvicorn running on 0.0.0.0:8000"
```

#### 3.4 Database Backups

Railway automatically backs up PostgreSQL:

- **Automatic Backups**: Daily
- **Retention**: 30 days
- **Recovery**: Available in dashboard under Database → Backups
- **Manual Backups**: Can be triggered manually

---

### Phase 4: GitHub Integration & Auto-Deployment

#### 4.1 Connect GitHub Repository

```
Railway Dashboard → Backend Service → Settings → Deployments
├─ Connect GitHub Repository: IntoWork-Dashboard
├─ Branch to deploy: main (or your branch)
└─ Auto-deploy on push: Enabled
```

#### 4.2 Configure Deployment Rules

```
Railway → Backend Service → Settings → Advanced
├─ Auto-Deploy: Enabled
├─ Deployment Trigger: On git push
├─ Build Command: [Auto-detected from railway.json]
└─ Start Command: bash backend/start.sh
```

#### 4.3 Test CI/CD Pipeline

```bash
# Make a test commit
cd /home/jdtkd/IntoWork-Dashboard
echo "# Updated: $(date)" >> README.md
git add README.md
git commit -m "test: trigger Railway deployment"
git push origin feature/migrate-to-nextauth

# Watch deployment in Railway:
# Railway Dashboard → Backend Service → Deployments
# Status should go from "Building" → "Deploying" → "Success"
```

---

## Phase 5: Frontend Deployment (Vercel)

### 5.1 Deploy to Vercel

```bash
# Option 1: Connect GitHub to Vercel
# 1. Go to vercel.com
# 2. Click "New Project"
# 3. Select "Import Git Repository"
# 4. Find IntoWork-Dashboard
# 5. Vercel auto-detects Next.js configuration

# Option 2: Deploy via CLI
cd frontend
npm i -g vercel
vercel --prod
```

### 5.2 Configure Vercel Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
# NextAuth Configuration
NEXTAUTH_SECRET=<same-value-as-backend>
NEXTAUTH_URL=https://your-frontend-domain.com

# API Configuration
NEXT_PUBLIC_API_URL=https://intowork-backend-production.up.railway.app/api
NEXT_PUBLIC_FORCE_HTTPS=true

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
```

### 5.3 Connect Frontend to Backend API

The frontend automatically connects to Railway backend via:

```typescript
// frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL
// In production: https://intowork-backend-production.up.railway.app/api
```

---

## Phase 6: Domain Configuration

### 6.1 Configure Custom Domain (Optional)

#### For Backend (Railway):

```
Railway Dashboard → Backend Service → Settings → Domains
├─ Add Custom Domain: api.your-domain.com
├─ Add DNS CNAME record:
│  Host: api
│  Value: [Railway-provided-CNAME]
│  TTL: 3600
└─ Wait for DNS propagation (5-15 minutes)
```

#### For Frontend (Vercel):

```
Vercel Dashboard → Project Settings → Domains
├─ Add Custom Domain: your-domain.com
├─ Add DNS records (Vercel provides exact values):
│  Type: CNAME or A records
│  Follow Vercel instructions exactly
└─ Wait for verification
```

### 6.2 Update Environment Variables After Domain Change

Once domains are configured, update:

```
# In Railway (Backend)
NEXTAUTH_URL=https://your-frontend-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
CORS_ORIGIN=https://your-frontend-domain.com

# In Vercel (Frontend)
NEXTAUTH_URL=https://your-frontend-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

---

## Environment Configuration

### Complete Variable Reference

#### Backend Variables (Railway)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection | Auto-set by Railway |
| `NEXTAUTH_SECRET` | Yes | Session encryption | openssl rand -base64 32 |
| `NEXTAUTH_URL` | Yes | Frontend URL for auth | https://app.yourdom.com |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | https://api.yourdom.com/api |
| `SECRET_KEY` | Yes | FastAPI secrets | openssl rand -base64 32 |
| `ENVIRONMENT` | Yes | Environment name | production |
| `CORS_ORIGIN` | Yes | Allowed frontend origins | https://app.yourdom.com |
| `PORT` | Auto | Server port | 8000 |
| `LOG_LEVEL` | No | Logging level | info, debug |
| `GOOGLE_CLIENT_ID` | No | Google OAuth | oauth-id.apps.googleusercontent.com |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth | oauth-secret |
| `AZURE_AD_CLIENT_ID` | No | Azure OAuth | azure-app-id |
| `AZURE_AD_CLIENT_SECRET` | No | Azure OAuth | azure-secret |
| `AZURE_AD_TENANT_ID` | No | Azure tenant | tenant-id |

#### Frontend Variables (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Yes | Session encryption | Same as backend |
| `NEXTAUTH_URL` | Yes | Frontend URL | https://app.yourdom.com |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | https://api.yourdom.com/api |
| `NEXT_PUBLIC_FORCE_HTTPS` | No | Force HTTPS | true |
| `GOOGLE_CLIENT_ID` | No | Google OAuth | oauth-id |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth | oauth-secret |

### Configuration Files

#### `/railway.json` - Railway Service Configuration

Defines how Railway builds and deploys the backend:
- **Builder**: Docker (uses `Dockerfile.railway`)
- **Start Command**: `bash backend/start.sh`
- **Health Check**: HTTP endpoint at `/health`

#### `/Dockerfile.railway` - Multi-stage Build

Optimized Docker image:
- **Build Stage**: Installs dependencies
- **Runtime Stage**: Minimal image with only runtime deps
- **Health Check**: Configured for Railway monitoring
- **Entrypoint**: Runs `start.sh` script

#### `railway.env.example` - Variable Template

Complete reference of all environment variables needed for production.

---

## Database Setup & Migrations

### 3.1 Automatic Migration on Deployment

The backend/start.sh script handles migrations:

```bash
#!/bin/bash

# 1. Check required env vars
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    exit 1
fi

# 2. Run Alembic migrations
python -m alembic upgrade head

# 3. Create uploads directory
mkdir -p uploads/cv

# 4. Start FastAPI
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 3.2 Managing Migrations

#### Create a New Migration

When you modify models:

```bash
cd backend
alembic revision --autogenerate -m "Add new_column to users"
```

#### Review Migration

```bash
# Check the generated migration
cat alembic/versions/xxxxx_add_new_column_to_users.py

# Make manual edits if needed
vim alembic/versions/xxxxx_add_new_column_to_users.py
```

#### Apply Migration Locally

```bash
alembic upgrade head
```

#### Rollback Last Migration

```bash
alembic downgrade -1
```

### 3.3 Database Monitoring

In Railway Dashboard → PostgreSQL Service:

- **Connections**: Monitor active connections
- **CPU/Memory**: Watch resource usage
- **Backups**: View automatic backups
- **Metrics**: Connection pooling stats

---

## GitHub Integration & CI/CD

### 4.1 Repository Setup

Ensure your GitHub repo has:

```
IntoWork-Dashboard/
├── .github/workflows/          # Optional: GitHub Actions
├── railway.json                 # Railway config (required)
├── railway.toml                 # Alternative config
├── Dockerfile.railway           # Build configuration
├── backend/
│   ├── start.sh                # Start script (executable)
│   ├── requirements.txt
│   └── alembic/
├── frontend/
│   ├── package.json
│   └── src/
└── README.md
```

### 4.2 Railway Deployment Triggers

Railway automatically deploys when:

1. **Push to monitored branch** (usually `main`)
2. **Pull request created** (preview deployment)
3. **Manual redeploy** from dashboard

### 4.3 Deployment Flow

```
git push origin main
        ↓
GitHub notifies Railway
        ↓
Railway detects commit
        ↓
Railway builds Docker image
        ↓
Runs Dockerfile.railway
        ↓
Injects env variables
        ↓
Executes backend/start.sh
        ↓
Alembic migrations run
        ↓
FastAPI starts
        ↓
Health check passes
        ↓
Old deployment stops
        ↓
New deployment active
```

### 4.4 Preview Deployments (Optional)

Enable preview deployments for PRs:

```
Railway Dashboard → Backend Service → Settings → Advanced
├─ Enable Preview Deployments
├─ Delete preview deployments after 48 hours (optional)
└─ Create a separate database for previews (optional)
```

---

## Vercel Frontend Deployment

### 5.1 Initial Setup

```bash
# Connect Vercel to GitHub
# 1. Go to vercel.com
# 2. Click "New Project"
# 3. Select "Import Git Repository"
# 4. Search for "IntoWork-Dashboard"
# 5. Click "Import"
# 6. Configure project settings
```

### 5.2 Build Configuration

Vercel auto-detects Next.js:

```
Build Settings:
├─ Framework: Next.js
├─ Build Command: next build
├─ Output Directory: .next
├─ Install Command: npm install
└─ Node Version: 20.x
```

### 5.3 Environment Variables in Vercel

```
Project Settings → Environment Variables

Add all variables from railway.env.example:
├─ NEXTAUTH_SECRET
├─ NEXTAUTH_URL
├─ NEXT_PUBLIC_API_URL
├─ And any OAuth credentials
```

### 5.4 Auto-Deployment from GitHub

```
Vercel Dashboard → Your Project → Git
├─ Connected Repository: IntoWork-Dashboard
├─ Production Branch: main
├─ Deploy on Push: Enabled
└─ Preview Deployments: Enabled for PRs
```

### 5.5 Verify Frontend to Backend Connection

Test the connection:

```bash
# Check if frontend can reach backend
curl https://your-frontend-domain.com/api/health
# Should proxy request to Railway backend and return healthy status
```

---

## Monitoring & Troubleshooting

### 6.1 Real-Time Logs

#### Backend Logs (Railway)

```
Railway Dashboard → Backend Service → Deployments
├─ Select latest deployment
├─ Click "Logs" tab
└─ View real-time logs
```

**Key log messages to watch:**

```
✓ "Démarrage IntoWork Backend sur Railway..."
✓ "📊 Exécution des migrations de base de données..."
✓ "✅ Migrations terminées"
✓ "🎯 Démarrage du serveur FastAPI..."
✓ "Uvicorn running on 0.0.0.0:8000"
```

**Troubleshooting common errors:**

```
❌ "DATABASE_URL non définie"
   → Add DATABASE_URL variable in Railway dashboard

❌ "CLERK_SECRET_KEY non définie"
   → Update to NEXTAUTH_SECRET in Railway dashboard

❌ "error connecting to postgres"
   → Check DATABASE_URL format
   → Verify PostgreSQL service is running
   → Check logs from PostgreSQL service
```

#### Frontend Logs (Vercel)

```
Vercel Dashboard → Your Project → Deployments
├─ Select deployment
├─ Click "Logs" tab
└─ View build and runtime logs
```

### 6.2 Health Checks

#### Backend Health Check

```bash
# Check backend health
curl https://intowork-backend-production.up.railway.app/health

# Expected response:
# {"status": "healthy", "service": "intowork-backend"}
```

#### Database Connection

```bash
# Railway automatically monitors connection
# Check in: PostgreSQL Service → Metrics → Connections

# From backend logs, look for:
# "SQLAlchemy connection pool initialized"
```

#### API Connectivity

```bash
# Test from command line
curl -H "Authorization: Bearer TOKEN" \
  https://intowork-backend-production.up.railway.app/api/ping

# Or test from browser console
fetch('https://api.yourdom.com/api/ping')
  .then(r => r.json())
  .then(console.log)
```

### 6.3 Monitoring Dashboard

#### Railway Metrics

```
Railway Dashboard → Backend Service → Metrics
├─ CPU Usage
├─ Memory Usage
├─ Network I/O
├─ Disk Space
├─ Request Count
└─ Response Times
```

#### Alerts (Optional)

```
Railway Dashboard → Project Settings → Alerts
├─ High CPU usage (>80%)
├─ High Memory usage (>80%)
├─ Deployment failures
├─ Database connection issues
└─ Setup email notifications
```

### 6.4 Common Issues & Solutions

#### Issue: Migrations Fail on Deployment

**Symptom**: Logs show "alembic: error: FAILED"

**Solutions**:
1. Check migration file syntax
2. Test migration locally first:
   ```bash
   cd backend
   python -m alembic upgrade head
   ```
3. Check database connection
4. Review error message in logs

#### Issue: CORS Errors in Frontend

**Symptom**: Browser console shows "CORS policy: No 'Access-Control-Allow-Origin'"

**Solutions**:
1. Update `CORS_ORIGIN` in Railway variables
2. Include all frontend URLs (prod + Vercel preview)
3. Restart backend service:
   ```
   Railway Dashboard → Backend → Redeploy
   ```

#### Issue: Database Connection Refused

**Symptom**: "FATAL: authentication failed for user"

**Solutions**:
1. Verify `DATABASE_URL` is set correctly
2. Check PostgreSQL service is running
3. Confirm credentials in Railway PostgreSQL settings
4. Check if PostgreSQL service needs to be restarted

#### Issue: 502 Bad Gateway

**Symptom**: "502 Bad Gateway" error when accessing API

**Solutions**:
1. Check backend health endpoint
2. Verify backend is running in Railway
3. Check logs for startup errors
4. Ensure port configuration (8000) is correct

#### Issue: File Uploads Not Working

**Symptom**: Upload returns "500 Internal Server Error"

**Solutions**:
1. Verify `/app/uploads` directory exists
2. Check Railway has write permissions
3. Review upload size limit (MAX_UPLOAD_SIZE_MB)
4. Check disk space on Railway container

---

## Security Best Practices

### 7.1 Secrets Management

#### Never Commit Secrets

```bash
# BAD - Don't do this
git add .env
git commit -m "add env variables"
git push

# GOOD - Use only Railway dashboard
# Railway Dashboard → Variables
# Add all secrets there, not in git
```

#### Rotate Secrets Regularly

```bash
# Every 3 months, generate new secrets:
openssl rand -base64 32  # New NEXTAUTH_SECRET
openssl rand -base64 32  # New SECRET_KEY

# Update in Railway dashboard
# Update in Vercel dashboard
# Restart services
```

### 7.2 HTTPS Enforcement

```
# In railway.env
NEXT_PUBLIC_FORCE_HTTPS=true

# In frontend code, redirects all HTTP to HTTPS
```

### 7.3 CORS Configuration

```
# Allow only your domain in production
CORS_ORIGIN=https://your-frontend-domain.com,https://your-frontend-domain-*.vercel.app

# Do NOT use "*" in production
# Remove "allow_origins=['*']" from main.py before production
```

### 7.4 Database Security

```
✓ Use strong passwords (auto-generated by Railway)
✓ Restrict database access to backend only
✓ Enable automatic backups (Railway default)
✓ Monitor connection logs
✓ Use SSL for connections (Railway default)
✓ Regular security updates (Railway patches automatically)
```

### 7.5 API Security

```
✓ Validate all user inputs
✓ Use JWT tokens with short expiration
✓ Implement rate limiting (optional)
✓ Use HTTPS only (NEXT_PUBLIC_FORCE_HTTPS=true)
✓ Set secure cookies (httpOnly, secure flags)
✓ Validate file uploads (type, size)
```

---

## Maintenance & Operations

### 8.1 Regular Maintenance Tasks

#### Weekly
- Check deployment logs for errors
- Monitor database size
- Review application metrics

#### Monthly
- Update dependencies
- Rotate secrets (if no rotation policy)
- Test backup restoration
- Review security patches

#### Quarterly
- Full security audit
- Performance optimization
- Database maintenance

### 8.2 Updating Dependencies

#### Backend Dependencies

```bash
# Check for updates
pip list --outdated

# Update a specific package
pip install --upgrade fastapi

# Update in requirements.txt
pip freeze > requirements.txt

# Test locally
cd backend
python -m alembic upgrade head
uvicorn app.main:app --reload

# Commit and push
git add requirements.txt
git commit -m "chore: update dependencies"
git push origin main

# Watch Railway redeploy automatically
```

#### Frontend Dependencies

```bash
# Check for updates
npm outdated

# Update a specific package
npm install --save next@latest

# Test locally
npm run build
npm run dev

# Commit and push
git add package-lock.json
git commit -m "chore: update dependencies"
git push origin main

# Vercel automatically redeploys
```

### 8.3 Database Maintenance

#### Monitor Database Growth

```
Railway PostgreSQL → Metrics → Disk Usage

Watch for:
├─ Rapid growth
├─ Approaching disk limit
└─ Unusual query patterns
```

#### Backup Management

```
Railway PostgreSQL → Backups
├─ Automatic: Daily (retained 30 days)
├─ Manual: Create anytime
├─ Recovery: Click "Restore" to recover
└─ Test: Periodically test restore process
```

#### Clean Old Data (Optional)

If uploads grow too large:

```sql
-- Connect to PostgreSQL and run cleanup
-- WARNING: Test in staging first!

-- Delete old CV files not referenced in database
DELETE FROM candidate_cv
WHERE created_at < NOW() - INTERVAL '1 year'
AND is_active = false;
```

### 8.4 Scaling Considerations

#### When to Scale

Scale when:
- Backend CPU >70% consistently
- Backend Memory >80% consistently
- Database connections maxed out
- Response times degrading

#### Vertical Scaling (Railway)

```
Railway Dashboard → Backend Service → Settings
├─ Memory: Increase from 1GB to 2GB+
├─ CPU: Add additional CPU allocation
└─ Database: Upgrade PostgreSQL tier
```

#### Horizontal Scaling (Multiple Instances)

```
railway.json:
"deploy": {
  "numReplicas": 2  # Run 2 instances
}
```

### 8.5 Disaster Recovery

#### Backup Strategy

Railway provides automatic backups:
```
✓ Daily automated backups
✓ 30-day retention
✓ One-click restoration
✓ Point-in-time recovery
```

#### Manual Backup Before Major Changes

```bash
# Backup database before migrations
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Keep in secure location
```

#### Recovery Procedure

```
If disaster occurs:

1. PostgreSQL Service → Backups
2. Select backup from desired date
3. Click "Restore from backup"
4. Wait for restoration to complete
5. Verify data integrity
6. Redeploy backend service
```

### 8.6 Monitoring & Alerting

#### Set Up Email Alerts

```
Railway Dashboard → Project Settings → Alerts
├─ Enable email notifications
├─ CPU usage > 80%
├─ Memory usage > 80%
├─ Deployment failures
└─ Database issues
```

#### Optional: Third-Party Monitoring

```
Integrate Sentry for error tracking:

SENTRY_DSN=https://key@sentry.io/project-id

Errors automatically logged to Sentry dashboard
```

---

## Deployment Checklist

### Before First Deployment

- [ ] Create Railway account
- [ ] Link GitHub repository
- [ ] Generate new NEXTAUTH_SECRET
- [ ] Generate new SECRET_KEY
- [ ] Set CORS_ORIGIN to your domain
- [ ] Create PostgreSQL service on Railway
- [ ] Add all environment variables
- [ ] Test backend locally
- [ ] Test frontend locally
- [ ] Verify DATABASE_URL format
- [ ] Check migrations run successfully

### First Deployment

- [ ] Deploy backend to Railway
- [ ] Monitor logs for errors
- [ ] Verify health endpoint (/health)
- [ ] Check database migrations completed
- [ ] Deploy frontend to Vercel
- [ ] Update frontend env variables
- [ ] Test API connectivity from frontend
- [ ] Verify authentication flow
- [ ] Test file upload (CV)
- [ ] Monitor metrics for 1 hour

### Post-Deployment

- [ ] Set up monitoring alerts
- [ ] Configure custom domains (optional)
- [ ] Update DNS records (if using custom domains)
- [ ] Test from production URL
- [ ] Review logs daily for first week
- [ ] Document any custom settings
- [ ] Set up backup verification
- [ ] Create runbook for common issues

---

## Quick Reference Commands

### Railway CLI Commands (Optional)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to Railway project
railway link

# View logs
railway logs -s backend

# View environment variables
railway variables

# Set variable
railway variables set NEXTAUTH_SECRET=value

# Redeploy
railway deploy
```

### PostgreSQL Access (if needed)

```bash
# Connect to production database
psql $DATABASE_URL

# Common queries
\dt                    # List tables
\l                     # List databases
SELECT VERSION();      # Check PostgreSQL version
SELECT COUNT(*) FROM users;  # Count users
```

### Troubleshooting Commands

```bash
# Test backend health
curl https://intowork-backend-production.up.railway.app/health

# Test API endpoint
curl -H "Authorization: Bearer TOKEN" \
  https://intowork-backend-production.up.railway.app/api/users/me

# Check DNS resolution
nslookup intowork-backend-production.up.railway.app

# Check CORS headers
curl -I -H "Origin: https://your-frontend.com" \
  https://intowork-backend-production.up.railway.app/api/ping
```

---

## Support & Resources

### Documentation
- [Railway Docs](https://docs.railway.app)
- [Railway GitHub Integration](https://docs.railway.app/guides/github)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

### Community
- [Railway Discord](https://discord.gg/railway)
- [FastAPI GitHub Discussions](https://github.com/tiangolo/fastapi/discussions)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

### Support Channels
- Railway: https://railway.app/support
- Vercel: https://vercel.com/support
- Email support for paid plans

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-26 | 1.0.0 | Initial production-ready configuration |

---

**Last Updated**: December 26, 2025
**Status**: Production-Ready
**Maintainer**: IntoWork Dashboard Team
