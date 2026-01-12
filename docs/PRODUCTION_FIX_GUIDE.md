# PRODUCTION FIX - Quick Action Guide

CRITICAL: Backend not responding in production
Time Estimate: 2-4 hours

---

## STEP 1: Diagnose Backend (15 min)

```bash
# Login to Railway
railway login

# Link to project (if not already linked)
railway link

# Check deployment status
railway status

# View logs (look for errors)
railway logs --tail 100

# Get backend URL
railway domain

# Test health endpoint
curl https://<your-railway-url>/health
curl https://<your-railway-url>/api/ping
```

LOOK FOR:
- [ ] Is backend running or crashed?
- [ ] Port binding errors?
- [ ] Database connection errors?
- [ ] Missing environment variables?
- [ ] Migration failures?

---

## STEP 2: Fix Environment Variables (10 min)

```bash
# Check what's currently set
railway variables

# Set all required variables (COPY THESE EXACTLY)
railway variables --set NEXTAUTH_SECRET="qAOQq0/2GxTybJqV/GOKC34zM/tguUenONRdVY88nLw="
railway variables --set JWT_SECRET="ErbiyWdwzgzrSwqroghtIsPU8jiEnxMwME4UQu7LD78="
railway variables --set JWT_ALGORITHM="HS256"
railway variables --set RESEND_API_KEY="re_9PDmb3bu_91NLA4pshg8uYAGRGDveXWPj"
railway variables --set FROM_EMAIL="INTOWORK <noreply@intowork.com>"
railway variables --set SECRET_KEY="qAOQq0/2GxTybJqV/GOKC34zM/tguUenONRdVY88nLw="
railway variables --set RAILWAY_ENVIRONMENT="production"

# IMPORTANT: Set FRONTEND_URL to your Vercel URL
# First, get your Vercel URL:
cd frontend
vercel ls  # Note the production URL

# Then set it in Railway:
railway variables --set FRONTEND_URL="https://your-vercel-url.vercel.app"
```

VERIFY DATABASE_URL:
```bash
# This should be auto-set by Railway PostgreSQL
railway variables | grep DATABASE_URL
# If missing, check if PostgreSQL service exists in Railway dashboard
```

---

## STEP 3: Redeploy Backend (5 min)

```bash
# Trigger new deployment with updated env vars
railway up

# Or redeploy existing code
railway redeploy

# Wait for deployment to complete
railway status

# Monitor logs during deployment
railway logs --tail
```

WAIT FOR:
- [ ] "Migration complete" message
- [ ] "Starting server on port XXXX"
- [ ] No error messages

---

## STEP 4: Configure Vercel Frontend (10 min)

```bash
cd frontend

# Get your Railway backend URL
# (Already got it from railway domain command above)

# Set environment variables in Vercel
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-railway-backend.up.railway.app/api

vercel env add NEXTAUTH_SECRET production
# Enter: qAOQq0/2GxTybJqV/GOKC34zM/tguUenONRdVY88nLw=

vercel env add AUTH_SECRET production
# Enter: qAOQq0/2GxTybJqV/GOKC34zM/tguUenONRdVY88nLw=

vercel env add NEXTAUTH_URL production
# Enter: https://your-vercel-app.vercel.app

# Redeploy frontend
vercel --prod
```

ALTERNATIVE (If CLI doesn't work):
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add variables manually for "Production" environment
5. Click "Redeploy" from Deployments tab

---

## STEP 5: Update CORS (5 min)

```bash
cd /home/jdtkd/IntoWork-Dashboard

# Edit backend/app/main.py
# Find allow_origins section (around line 61)
# Update to exact Vercel production URL
```

Edit file to:
```python
allow_origins=[
    "http://localhost:3000",  # Development
    "https://your-actual-vercel-url.vercel.app",  # Production
],
```

```bash
# Commit and push
git add backend/app/main.py
git commit -m "fix: Update CORS with production Vercel URL"
git push

# If Railway is connected to Git, it will auto-deploy
# Otherwise, manual deploy:
railway up
```

---

## STEP 6: Verify Everything Works (10 min)

### Test Backend Directly

```bash
# Health check
curl https://your-railway-url.up.railway.app/health
# Expected: {"status":"healthy","service":"intowork-backend"}

# API ping
curl https://your-railway-url.up.railway.app/api/ping
# Expected: {"status":"ok","message":"pong"}

# Forgot password endpoint
curl -X POST https://your-railway-url.up.railway.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# Expected: {"message":"If this email exists..."}
```

### Test Frontend

1. Open https://your-vercel-url.vercel.app
2. Go to /auth/forgot-password
3. Enter email
4. Click "Send Reset Link"
5. Should see success message (not "une erreur est survenue")

### Check Logs

```bash
# Backend logs
railway logs --tail 50

# Look for:
# - No CORS errors
# - "Email sent successfully" messages
# - No 500 errors
```

### Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try forgot password flow
4. Look for:
   - [ ] No CORS errors
   - [ ] Successful API response (200)
   - [ ] No 401/403 errors

---

## TROUBLESHOOTING

### Backend Still Not Responding

```bash
# Check if backend service exists
railway status

# If crashed, check logs for reason
railway logs --tail 200

# Common issues:
# 1. Migration failure - run manually:
railway run alembic upgrade head

# 2. Database not connected - verify:
railway variables | grep DATABASE_URL
# Should show Railway PostgreSQL URL

# 3. Port binding - Railway auto-sets $PORT, don't override
```

### CORS Errors Persist

1. Verify exact URL in CORS whitelist matches Vercel
2. Don't use wildcards like `https://*.vercel.app`
3. Ensure no trailing slash in URLs
4. Check browser console for exact error

### JWT Validation Fails

1. Verify NEXTAUTH_SECRET is IDENTICAL in:
   - Railway backend
   - Vercel frontend
2. Check with: `railway variables | grep NEXTAUTH_SECRET`
3. And in Vercel dashboard: Settings > Environment Variables

### Email Not Sending

1. Verify RESEND_API_KEY is set: `railway variables | grep RESEND`
2. Check Resend dashboard at https://resend.com/emails
3. Verify FROM_EMAIL domain is verified in Resend
4. Check backend logs for email errors

---

## CHECKLIST - Complete This

After following all steps above:

- [ ] Backend health endpoint returns 200
- [ ] Backend ping endpoint returns 200
- [ ] Frontend loads without errors
- [ ] Forgot password form submits successfully
- [ ] Email is received (check spam folder too)
- [ ] Reset password link works
- [ ] Can login after password reset
- [ ] No CORS errors in browser console
- [ ] No 500 errors in Railway logs

---

## IF STILL BROKEN

1. Share Railway logs: `railway logs > logs.txt`
2. Share Vercel deployment logs from dashboard
3. Share browser console errors (screenshot)
4. Check full analysis: `/home/jdtkd/IntoWork-Dashboard/DEPLOYMENT_ANALYSIS_REPORT.md`

---

## SECURITY WARNING

The secrets in this guide are from your .env file. After fixing production:

1. ROTATE ALL SECRETS:
```bash
# Generate new secrets
./scripts/generate-secrets.sh

# Update in Railway and Vercel
# Redeploy both services
```

2. NEVER commit .env to Git
3. Use different secrets for dev and production

---

## SUCCESS CRITERIA

Production is working when:
1. Backend responds to health checks
2. Frontend can call backend APIs
3. Forgot password sends emails
4. No CORS errors
5. Users can signup/login successfully

---

**File**: /home/jdtkd/IntoWork-Dashboard/PRODUCTION_FIX_GUIDE.md
**Last Updated**: 2025-12-31
**Estimated Time**: 2-4 hours
