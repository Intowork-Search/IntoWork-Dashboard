# Monitoring & Observability Setup Guide

Production systems MUST have visibility. This guide implements comprehensive monitoring for INTOWORK platform.

---

## Why Monitoring Matters

Current Issue: "Backend not responding" - but we don't know:
- When did it fail?
- What caused the failure?
- How many users were affected?
- Is it still failing?

With proper monitoring, you'd know immediately via alerts and dashboards.

---

## Monitoring Stack - Free Tier Recommended

| Component | Tool | Cost | Purpose |
|-----------|------|------|---------|
| **Error Tracking** | Sentry | Free (5k events/month) | Track exceptions and errors |
| **Uptime Monitoring** | UptimeRobot | Free (50 monitors) | Alert when site goes down |
| **APM** | Railway Metrics | Included | CPU, memory, response times |
| **Log Aggregation** | Railway Logs | Included | Centralized logging |
| **Status Page** | Statuspage.io | Free tier | Public status page |

---

## SETUP 1: Sentry Error Tracking (30 minutes)

### Why Sentry?
- Captures Python exceptions automatically
- Shows full stack traces
- Tracks error frequency and trends
- Alerts on new errors
- Free tier: 5,000 events/month

### Setup Steps

#### 1. Create Sentry Account
1. Go to https://sentry.io/signup/
2. Create free account
3. Create new project: "intowork-backend"
4. Copy the DSN (Data Source Name)

#### 2. Install Sentry SDK

Add to `/home/jdtkd/IntoWork-Dashboard/backend/requirements.txt`:
```txt
sentry-sdk[fastapi]==1.39.2
```

#### 3. Configure Sentry in Backend

Edit `/home/jdtkd/IntoWork-Dashboard/backend/app/main.py`:

```python
# Add at top of file (after imports)
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
import os

# Initialize Sentry (before creating FastAPI app)
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[
        FastApiIntegration(),
        SqlalchemyIntegration(),
    ],
    environment=os.getenv("RAILWAY_ENVIRONMENT", "development"),
    traces_sample_rate=0.1,  # 10% of transactions for performance monitoring
    profiles_sample_rate=0.1,  # 10% of transactions for profiling
    send_default_pii=False,  # Don't send personal info
)
```

#### 4. Set Environment Variable

```bash
# In Railway
railway variables --set SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"

# Redeploy
railway up
```

#### 5. Test Sentry Integration

```bash
# Add test endpoint to main.py (temporary)
@app.get("/sentry-test")
async def sentry_test():
    raise Exception("This is a test error for Sentry")

# Deploy and test
curl https://your-railway-url.up.railway.app/sentry-test

# Check Sentry dashboard - error should appear within seconds
```

#### 6. Configure Alerts

In Sentry dashboard:
1. Go to Alerts > Create Alert
2. Choose "Issues"
3. Set condition: "A new issue is created"
4. Set action: "Send email to team"
5. Save alert

### Sentry Best Practices

```python
# Capture custom context
from sentry_sdk import capture_exception, set_user, set_context

# Set user context (in auth routes)
set_user({"id": user.id, "email": user.email})

# Capture exceptions with context
try:
    # risky operation
except Exception as e:
    set_context("job_application", {
        "job_id": job_id,
        "candidate_id": candidate_id
    })
    capture_exception(e)
    raise
```

---

## SETUP 2: Uptime Monitoring with UptimeRobot (15 minutes)

### Why UptimeRobot?
- Free tier: 50 monitors, 5-minute checks
- SMS and email alerts
- Status page
- Response time tracking

### Setup Steps

#### 1. Create UptimeRobot Account
1. Go to https://uptimerobot.com/signUp
2. Create free account
3. Verify email

#### 2. Add Monitors

**Monitor 1: Backend Health Check**
- Monitor Type: HTTP(s)
- Friendly Name: IntoWork Backend Health
- URL: https://your-railway-url.up.railway.app/health
- Monitoring Interval: Every 5 minutes
- Monitor Timeout: 30 seconds
- Alert Contacts: Your email

**Monitor 2: Frontend**
- Monitor Type: HTTP(s)
- Friendly Name: IntoWork Frontend
- URL: https://your-vercel-app.vercel.app
- Monitoring Interval: Every 5 minutes
- Keyword to Monitor: "INTOWORK" (checks page actually loads)

**Monitor 3: API Ping**
- Monitor Type: HTTP(s)
- Friendly Name: IntoWork API Ping
- URL: https://your-railway-url.up.railway.app/api/ping
- Monitoring Interval: Every 5 minutes
- Expected Response: Contains "ok"

#### 3. Configure Alerts

Settings > Alert Contacts:
- Add your email
- Add SMS number (optional, limited on free tier)
- Set up Slack webhook (optional)

Alert Settings:
- [x] Send notification when monitor goes down
- [x] Send notification when monitor goes up
- Threshold: Alert after 1 failed check (immediate)

#### 4. Create Public Status Page

1. Go to "Status Pages"
2. Create New Status Page
3. Add monitors to display
4. Choose custom URL: status.intowork.com
5. Share with users: https://stats.uptimerobot.com/your-id

---

## SETUP 3: Railway Built-in Metrics (5 minutes)

### Available Metrics
- CPU usage
- Memory usage
- Network bandwidth
- Request count
- Response times

### Setup Steps

1. Go to Railway dashboard
2. Select your backend service
3. Click "Metrics" tab
4. View real-time metrics

### Set Up Metric Alerts

Railway doesn't support automated alerts on free tier, but you can:
1. Check metrics daily
2. Set calendar reminder to review weekly
3. Export data for analysis

### Upgrade for Alerting

Railway Pro ($20/month):
- Slack/Discord webhooks
- Email alerts on high CPU/memory
- Custom metric thresholds

---

## SETUP 4: Structured Logging (30 minutes)

### Why Structured Logging?
- Easier to search logs
- Better error context
- Integration with log aggregators

### Implement JSON Logging

#### 1. Install Dependencies

Add to `requirements.txt`:
```txt
python-json-logger==2.0.7
```

#### 2. Configure Logging

Create `/home/jdtkd/IntoWork-Dashboard/backend/app/logging_config.py`:

```python
import logging
from pythonjsonlogger import jsonlogger
import sys

def setup_logging():
    """Configure structured JSON logging for production"""

    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # JSON formatter
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s',
        timestamp=True
    )

    # Console handler (Railway captures stdout)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger
```

#### 3. Use in Application

Edit `backend/app/main.py`:

```python
from app.logging_config import setup_logging

# Set up logging before creating app
logger = setup_logging()

# Log application events
@app.on_event("startup")
async def startup_event():
    logger.info("Application startup", extra={
        "event": "startup",
        "environment": os.getenv("RAILWAY_ENVIRONMENT")
    })

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown", extra={
        "event": "shutdown"
    })
```

#### 4. Add Request Logging Middleware

```python
from fastapi import Request
import time

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time

    logger.info("Request processed", extra={
        "method": request.method,
        "url": str(request.url),
        "status_code": response.status_code,
        "process_time": f"{process_time:.3f}s",
        "client_ip": request.client.host
    })

    return response
```

### Viewing Logs

```bash
# Railway logs (now in JSON format)
railway logs --tail 100

# Filter by error level
railway logs | grep '"levelname":"ERROR"'

# Search for specific event
railway logs | grep '"event":"database_error"'
```

---

## SETUP 5: Performance Monitoring (15 minutes)

### Backend Performance Tracking

#### Add Performance Metrics Endpoint

Add to `backend/app/api/ping.py`:

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
import time
import psutil

router = APIRouter()

@router.get("/metrics")
async def get_metrics(db: Session = Depends(get_db)):
    """
    System metrics endpoint for monitoring
    """
    # Database connectivity check
    db_start = time.time()
    try:
        db.execute("SELECT 1")
        db_latency = (time.time() - db_start) * 1000  # milliseconds
        db_status = "healthy"
    except Exception as e:
        db_latency = -1
        db_status = f"unhealthy: {str(e)}"

    # System metrics
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()

    return {
        "timestamp": time.time(),
        "database": {
            "status": db_status,
            "latency_ms": db_latency
        },
        "system": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_available_mb": memory.available / (1024 * 1024)
        }
    }
```

Install psutil:
```bash
# Add to requirements.txt
psutil==5.9.8
```

### Frontend Performance Monitoring

#### Add Web Vitals Tracking

Create `frontend/src/lib/analytics.ts`:

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS(metric => sendToAnalytics('CLS', metric));
  onFID(metric => sendToAnalytics('FID', metric));
  onFCP(metric => sendToAnalytics('FCP', metric));
  onLCP(metric => sendToAnalytics('LCP', metric));
  onTTFB(metric => sendToAnalytics('TTFB', metric));
}

function sendToAnalytics(name: string, metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}:`, metric.value);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Option 1: Send to your backend
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        name,
        value: metric.value,
        id: metric.id,
      }),
    });

    // Option 2: Send to Google Analytics
    // gtag('event', name, {
    //   value: Math.round(metric.value),
    //   metric_id: metric.id,
    // });
  }
}
```

Add to `frontend/src/app/layout.tsx`:

```typescript
import { reportWebVitals } from '@/lib/analytics';

export default function RootLayout({ children }) {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    // ... layout code
  );
}
```

---

## SETUP 6: Alerts Configuration (10 minutes)

### Critical Alerts (Immediate Action Required)

Set up notifications for:

1. **Service Down**
   - Tool: UptimeRobot
   - Trigger: Health check fails
   - Action: Email + SMS

2. **High Error Rate**
   - Tool: Sentry
   - Trigger: > 10 errors/minute
   - Action: Email to team

3. **Database Connection Lost**
   - Tool: Sentry + Custom monitoring
   - Trigger: Database connection error
   - Action: Immediate email

### Warning Alerts (Review Within 24h)

1. **High Memory Usage**
   - Tool: Railway Metrics
   - Trigger: > 80% memory used
   - Action: Check logs, optimize queries

2. **Slow Response Times**
   - Tool: Custom /metrics endpoint
   - Trigger: Avg response time > 1s
   - Action: Profile slow endpoints

3. **Email Service Errors**
   - Tool: Sentry
   - Trigger: Email send failures
   - Action: Check Resend API key and quota

### Alert Escalation Policy

1. **Immediate** (5 minutes): Email to developer
2. **No Response** (15 minutes): SMS to developer
3. **Still Failing** (30 minutes): Email to manager
4. **Critical** (1 hour): Page on-call engineer

---

## SETUP 7: Dashboard Creation (20 minutes)

### Railway Dashboard

Built-in metrics available:
- CPU usage over time
- Memory usage over time
- Network bandwidth
- Deployment history

### Custom Monitoring Dashboard

Create a simple HTML dashboard:

`/home/jdtkd/IntoWork-Dashboard/monitoring-dashboard.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>INTOWORK Monitoring Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { display: inline-block; padding: 20px; margin: 10px;
                  border: 1px solid #ddd; border-radius: 8px; }
        .healthy { background-color: #d4edda; }
        .warning { background-color: #fff3cd; }
        .error { background-color: #f8d7da; }
    </style>
</head>
<body>
    <h1>INTOWORK System Status</h1>

    <div id="status">
        <div class="metric healthy">
            <h3>Backend API</h3>
            <p id="backend-status">Checking...</p>
        </div>

        <div class="metric healthy">
            <h3>Frontend</h3>
            <p id="frontend-status">Checking...</p>
        </div>

        <div class="metric healthy">
            <h3>Database</h3>
            <p id="database-status">Checking...</p>
        </div>
    </div>

    <canvas id="responseTimeChart" width="400" height="200"></canvas>

    <script>
        const BACKEND_URL = 'https://your-railway-url.up.railway.app';
        const FRONTEND_URL = 'https://your-vercel-url.vercel.app';

        async function checkHealth() {
            // Check backend
            try {
                const response = await fetch(`${BACKEND_URL}/health`);
                const data = await response.json();
                document.getElementById('backend-status').textContent =
                    data.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy';
            } catch (error) {
                document.getElementById('backend-status').textContent = '❌ Unreachable';
            }

            // Check frontend
            try {
                const response = await fetch(FRONTEND_URL);
                document.getElementById('frontend-status').textContent =
                    response.ok ? '✅ Online' : '❌ Error';
            } catch (error) {
                document.getElementById('frontend-status').textContent = '❌ Unreachable';
            }

            // Check database (via metrics endpoint)
            try {
                const response = await fetch(`${BACKEND_URL}/metrics`);
                const data = await response.json();
                document.getElementById('database-status').textContent =
                    data.database.status === 'healthy'
                        ? `✅ Healthy (${data.database.latency_ms.toFixed(2)}ms)`
                        : '❌ Unhealthy';
            } catch (error) {
                document.getElementById('database-status').textContent = '❌ Error';
            }
        }

        // Check every 30 seconds
        setInterval(checkHealth, 30000);
        checkHealth();  // Initial check
    </script>
</body>
</html>
```

Host this dashboard:
- Upload to Vercel as static file
- Or run locally: `python -m http.server 8080`
- Access at http://localhost:8080/monitoring-dashboard.html

---

## Monitoring Checklist

After implementing all monitoring:

- [ ] Sentry capturing errors
- [ ] UptimeRobot monitoring health endpoints
- [ ] Railway metrics reviewed weekly
- [ ] Structured logging enabled
- [ ] Performance metrics tracked
- [ ] Alerts configured for critical issues
- [ ] Dashboard accessible
- [ ] Team trained on incident response

---

## Incident Response Playbook

### When Alert Fires

1. **Acknowledge Alert** (1 minute)
   - Respond to notification
   - Check dashboard/logs

2. **Assess Severity** (2 minutes)
   - How many users affected?
   - Is data at risk?
   - Is this a complete outage?

3. **Quick Fix Attempt** (5 minutes)
   - Restart service: `railway redeploy`
   - Check obvious issues (env vars, database)
   - Roll back recent deployment

4. **Communicate** (Ongoing)
   - Update status page
   - Notify users if > 5 minutes
   - Inform team

5. **Detailed Investigation** (After service restored)
   - Review logs in Sentry
   - Check Railway metrics
   - Identify root cause
   - Document in postmortem

6. **Prevent Recurrence**
   - Add monitoring for this specific issue
   - Update deployment process
   - Add automated tests

---

## Cost Summary

| Tool | Plan | Cost | Limit |
|------|------|------|-------|
| Sentry | Free | $0 | 5k events/month |
| UptimeRobot | Free | $0 | 50 monitors, 5-min checks |
| Railway Metrics | Included | $0 | Basic metrics |
| Railway Logs | Included | $0 | 7 days retention |
| **Total** | | **$0** | Sufficient for MVP |

### When to Upgrade

Upgrade when:
- Sentry: > 5k errors/month (unlikely if code is stable)
- UptimeRobot: Need 1-minute checks or more monitors ($7/month)
- Railway: Need advanced metrics/alerts ($20/month Pro plan)

---

## Next Steps

1. Implement Sentry (highest priority)
2. Set up UptimeRobot (quick win)
3. Add structured logging (better debugging)
4. Create monitoring dashboard (visibility)
5. Configure alerts (proactive response)
6. Train team on incident response

---

**File**: /home/jdtkd/IntoWork-Dashboard/MONITORING_SETUP_GUIDE.md
**Last Updated**: 2025-12-31
**Estimated Setup Time**: 2-3 hours total
**Maintenance**: < 1 hour/week
