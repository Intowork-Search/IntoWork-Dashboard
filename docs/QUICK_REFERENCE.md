# INTOWORK Deployment - Quick Reference Card

Print this or keep it handy for quick troubleshooting.

---

## Current Issue: Backend Not Responding

**Status**: CRITICAL
**Impact**: Password reset and authentication broken
**Fix Time**: 2-4 hours
**Guide**: `/home/jdtkd/IntoWork-Dashboard/PRODUCTION_FIX_GUIDE.md`

---

## Essential Commands

### Railway (Backend)

```bash
# Login and link
railway login
railway link

# Status and logs
railway status
railway logs --tail 100
railway domain

# Environment variables
railway variables
railway variables --set KEY="value"

# Deploy
railway up
railway redeploy

# Run commands
railway run alembic upgrade head
railway run python -c "print('Hello')"
```

### Vercel (Frontend)

```bash
# Status
vercel ls
vercel env ls

# Environment variables
vercel env add KEY production
vercel env pull .env.production

# Deploy
vercel --prod
vercel promote <deployment-url>
```

---

## Critical URLs

**Backend Health**: https://your-railway-url.up.railway.app/health
**Backend API**: https://your-railway-url.up.railway.app/api/ping
**Frontend**: https://your-vercel-url.vercel.app

---

## Required Environment Variables

### Backend (Railway)
```
DATABASE_URL (auto-set)
NEXTAUTH_SECRET (must match frontend!)
JWT_SECRET
JWT_ALGORITHM=HS256
RESEND_API_KEY
FROM_EMAIL
FRONTEND_URL (Vercel URL)
SECRET_KEY
RAILWAY_ENVIRONMENT=production
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL (Railway URL + /api)
NEXTAUTH_SECRET (must match backend!)
AUTH_SECRET (same as NEXTAUTH_SECRET)
NEXTAUTH_URL (Vercel URL)
NODE_ENV=production
```

---

## Quick Health Check

```bash
# Backend
curl https://your-railway-url.up.railway.app/health

# Expected: {"status":"healthy","service":"intowork-backend"}

# API
curl https://your-railway-url.up.railway.app/api/ping

# Expected: {"status":"ok","message":"pong"}

# Forgot password
curl -X POST https://your-railway-url.up.railway.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected: {"message":"If this email exists..."}
```

---

## Common Errors

### "Backend not responding"
1. Check: `railway status`
2. Check logs: `railway logs`
3. Restart: `railway redeploy`

### "CORS error"
1. Check browser console
2. Verify Vercel URL in backend CORS
3. Edit: `backend/app/main.py` line 61
4. Redeploy backend

### "JWT validation failed"
1. Verify NEXTAUTH_SECRET matches:
   - `railway variables | grep NEXTAUTH`
   - Vercel dashboard > Env Variables
2. Must be IDENTICAL

### "Email not sending"
1. Check: `railway variables | grep RESEND`
2. Verify Resend dashboard
3. Check logs for email errors

---

## Emergency Rollback

### Railway
```bash
railway deployments    # List deployments
railway rollback       # Rollback to previous
```

### Vercel
```bash
vercel ls              # List deployments
vercel promote <url>   # Promote to production
```

---

## File Locations

**Project Root**: `/home/jdtkd/IntoWork-Dashboard`

**Backend**:
- Code: `backend/app/`
- Config: `backend/.env`
- Dockerfile: `backend/Dockerfile`
- Startup: `backend/start.sh`
- Main: `backend/app/main.py`

**Frontend**:
- Code: `frontend/src/`
- Config: `frontend/.env.local`
- Next config: `frontend/next.config.js`

**Scripts**:
- Deploy all: `scripts/deploy-all.sh`
- Deploy Railway: `scripts/deploy-railway.sh`
- Deploy Vercel: `scripts/deploy-vercel.sh`

**Documentation**:
- Full analysis: `DEPLOYMENT_ANALYSIS_REPORT.md`
- Fix guide: `PRODUCTION_FIX_GUIDE.md`
- Monitoring: `MONITORING_SETUP_GUIDE.md`
- Summary: `DEPLOYMENT_SUMMARY.md`

---

## Support Contacts

**Railway**: https://railway.app/help
**Vercel**: https://vercel.com/support
**Resend**: https://resend.com/support

**Documentation**: https://github.com/yourusername/IntoWork-Dashboard
**Issues**: Create GitHub issue with logs

---

## Monitoring URLs

**UptimeRobot**: https://uptimerobot.com/dashboard
**Sentry**: https://sentry.io/organizations/your-org/issues/
**Railway Metrics**: https://railway.app/project/your-project/metrics
**Vercel Analytics**: https://vercel.com/your-project/analytics

---

## When to Escalate

**Immediate** (page on-call):
- Service down > 15 minutes
- Data loss or corruption
- Security breach

**Within 24h** (create ticket):
- High error rate (> 5%)
- Slow response times (> 2s avg)
- Database connection issues

**Weekly review**:
- Performance degradation
- Increased costs
- Capacity planning

---

## Production Checklist

Before declaring "fixed":

- [ ] Backend health returns 200
- [ ] Frontend loads without errors
- [ ] Can signup new account
- [ ] Can login
- [ ] Can request password reset
- [ ] Email arrives
- [ ] Can reset password
- [ ] No CORS errors in console
- [ ] No 500 errors in logs
- [ ] Monitoring alerts working

---

## Cost Tracking

**Current**: $5-20/month
**Target**: < $50/month for MVP
**Alert if**: > $100/month

Check monthly:
- Railway dashboard > Billing
- Vercel dashboard > Usage
- Resend dashboard > Usage

---

## Performance Targets

**Backend**:
- Response time: < 500ms (p95)
- Error rate: < 1%
- Uptime: > 99.5%

**Frontend**:
- Load time: < 2s
- Lighthouse score: > 90
- Core Web Vitals: All green

**Database**:
- Query time: < 100ms (p95)
- Connection pool: < 80% used
- Disk usage: < 80%

---

## Security Reminders

- [ ] Rotate secrets every 90 days
- [ ] Never commit .env to Git
- [ ] Use different secrets for dev/prod
- [ ] Check dependency vulnerabilities monthly
- [ ] Review access logs weekly
- [ ] Update dependencies quarterly

---

## Maintenance Schedule

**Daily**:
- Check UptimeRobot status
- Review Sentry errors

**Weekly**:
- Review Railway logs
- Check performance metrics
- Review costs

**Monthly**:
- Rotate secrets
- Update dependencies
- Review security alerts
- Capacity planning

**Quarterly**:
- Full security audit
- Performance optimization
- Infrastructure review
- Disaster recovery test

---

Keep this card accessible and update as you learn more about your deployment!

**Last Updated**: 2025-12-31
**Version**: 1.0
