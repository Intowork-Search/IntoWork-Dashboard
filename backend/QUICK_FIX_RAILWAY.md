# QUICK FIX: Railway Backend Crash Loop

**Problem:** Backend service crashes with "NEXTAUTH_SECRET non définie"
**Cause:** Environment variables missing in Backend service
**Time to Fix:** 5-10 minutes

---

## IMMEDIATE SOLUTION (Choose One Method)

### Method 1: Railway Dashboard (EASIEST - No CLI Required)

1. **Open Railway Dashboard**
   - Go to: https://railway.app/project/717dcb80-672a-4ffa-9913-fbb295fa460c
   - Login if needed

2. **Select Backend Service**
   - Click on "determined-heart" service
   - Go to "Variables" tab

3. **Add These 12 Variables** (Click "New Variable" for each)

   Copy and paste these exactly:

   ```
   NEXTAUTH_SECRET
   SgY7swlXrMEbVg1BKx61RRqYVfEAZntvep42bXVcNfY=
   ```

   ```
   JWT_SECRET
   bm8R9x5j7Wc6YuLrNOI7OrW/HW8bIosmhtLTAusiG0s=
   ```

   ```
   JWT_ALGORITHM
   HS256
   ```

   ```
   DATABASE_URL
   postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@postgres.railway.internal:5432/railway
   ```

   ```
   RESEND_API_KEY
   re_NNPZmCzV_4dRo7ks6GYXoatjG5KUjbv5N
   ```

   ```
   FROM_EMAIL
   INTOWORK <noreply@intowork.com>
   ```

   ```
   FRONTEND_URL
   https://www.intowork.co
   ```

   ```
   ALLOWED_ORIGINS
   https://intowork.co,https://www.intowork.co
   ```

   ```
   ENVIRONMENT
   production
   ```

   ```
   RAILWAY_ENVIRONMENT
   production
   ```

   ```
   SECRET_KEY
   uU3FCk6IjsOOfENPiYj+hAtsBpsMp9KRq8IJnxVDPm4=
   ```

   ```
   LOG_LEVEL
   INFO
   ```

4. **Wait for Auto-Deploy**
   - Railway will automatically redeploy with new variables
   - Takes 2-5 minutes

5. **Verify Success**
   - Go to "Deployments" tab
   - Check logs for: "✅ Migrations terminées" and "Application startup complete"
   - Status should change from "Crashed" to "Active"

---

### Method 2: Railway CLI (Faster if already linked)

```bash
cd /home/jdtkd/IntoWork-Dashboard/backend

# Step 1: Link to Backend project (if not already linked)
railway link
# Select: Backend (717dcb80-672a-4ffa-9913-fbb295fa460c)

# Step 2: Set all variables in one command
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

# Step 3: Verify variables
railway variables

# Step 4: Monitor deployment
railway logs
```

---

## VERIFICATION

After setting variables, verify the fix:

### 1. Check Deployment Status (Railway Dashboard)
- Go to: https://railway.app/project/717dcb80-672a-4ffa-9913-fbb295fa460c
- Click "determined-heart" service
- Go to "Deployments" tab
- Latest deployment should show "Active" (green)

### 2. Check Logs
Look for these success messages:
```
✅ "🚀 Démarrage IntoWork Backend sur Railway..."
✅ "📊 Exécution des migrations de base de données..."
✅ "✅ Migrations terminées"
✅ "🎯 Démarrage du serveur FastAPI sur le port..."
✅ "Application startup complete"
```

Should NOT see:
```
❌ "❌ NEXTAUTH_SECRET non définie"
❌ "❌ DATABASE_URL non définie"
```

### 3. Test API Endpoint

Get your backend URL from Railway Dashboard, then test:

```bash
# Health check
curl https://determined-heart-production.up.railway.app/health

# Expected response:
# {"status":"healthy","service":"intowork-backend"}

# API root
curl https://determined-heart-production.up.railway.app/api

# Expected: JSON response with service info
```

### 4. Test from Frontend

Update frontend `.env` if needed:
```env
NEXT_PUBLIC_API_URL=https://determined-heart-production.up.railway.app/api
```

Then test:
1. Go to https://intowork.co
2. Try signup/signin
3. Check browser console - should see successful API calls

---

## WHY THIS HAPPENED

**Root Cause:**
- Environment variables were set in **Postgres service** (different Railway project)
- Backend service is in a **separate Railway project** (Backend/determined-heart)
- Railway doesn't share variables across different projects automatically

**Projects:**
- **triumphant-embrace** (8f71755e) - Has Postgres service WITH variables ✅
- **Backend** (717dcb80) - Has determined-heart service WITHOUT variables ❌

**Solution:**
- Copy all required variables to the Backend service

---

## TROUBLESHOOTING

### Problem: Variables set but service still crashing

**Check:**
1. Did Railway auto-deploy after setting variables?
   - Check "Deployments" tab for new deployment
   - Look for deployment triggered at time you set variables

2. Are ALL 12 variables set?
   - Go to Variables tab
   - Count: should see exactly 12 variables
   - Missing any? Add them

3. Check logs for different error:
   ```bash
   railway logs --deployment
   ```
   - May reveal different issue (database connection, etc.)

### Problem: Database connection fails

**Check DATABASE_URL:**
- Should be: `postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@postgres.railway.internal:5432/railway`
- Note the internal Railway network hostname: `postgres.railway.internal`
- This assumes Postgres service is in the same Railway account

**Alternative:** If using separate Postgres project:
- Get public DATABASE_URL from Postgres service
- Use TCP proxy URL instead of internal hostname

### Problem: Still see "NEXTAUTH_SECRET non définie"

**Verify variable is actually set:**
1. Go to Railway Dashboard > Backend project > determined-heart service
2. Click "Variables" tab
3. Look for `NEXTAUTH_SECRET` in the list
4. If not there, add it manually with value: `SgY7swlXrMEbVg1BKx61RRqYVfEAZntvep42bXVcNfY=`
5. Wait for auto-deploy (2-3 minutes)

---

## PREVENTION

To prevent this in future deployments:

1. **Use Single Railway Project**
   - Keep backend and database in SAME project
   - Variables can be shared more easily

2. **Use Deployment Checklist**
   - See: `/home/jdtkd/IntoWork-Dashboard/backend/RAILWAY_DEPLOYMENT_DEBUG_REPORT.md`
   - Check all variables before deploying

3. **Create Setup Script**
   - See: `/home/jdtkd/IntoWork-Dashboard/backend/SET_RAILWAY_VARIABLES.sh`
   - Run script for new deployments

4. **Document Required Variables**
   - Keep `.env.production.example` updated
   - List all required variables in README

---

## NEXT STEPS

Once backend is running:

1. **Update Frontend Environment**
   - Set `NEXT_PUBLIC_API_URL` to Railway backend URL
   - Redeploy frontend on Vercel

2. **Test End-to-End**
   - Signup/signin flow
   - Job search
   - Applications
   - Password reset

3. **Monitor for 24 Hours**
   - Check Railway logs regularly
   - Look for errors or crashes
   - Monitor API response times

4. **Plan Consolidation**
   - Consider moving backend to triumphant-embrace project
   - Simplifies variable management
   - Better service-to-service communication

---

## SUPPORT

- **Detailed Analysis:** See `RAILWAY_DEPLOYMENT_DEBUG_REPORT.md`
- **Railway Dashboard:** https://railway.app/project/717dcb80-672a-4ffa-9913-fbb295fa460c
- **Railway Docs:** https://docs.railway.app

**Last Updated:** 2026-01-08
