# CORS Configuration Guide

## Overview

IntoWork backend implements secure CORS (Cross-Origin Resource Sharing) configuration to allow frontend applications to access the API while preventing unauthorized access.

## Current Configuration

**File**: `backend/app/main.py` (lines 109-125)

### Default Allowed Origins

The backend allows requests from these origins by default:

```python
allowed_origins = [
    "http://localhost:3000",  # Next.js dev server
    "https://intowork-dashboard.vercel.app",  # Production frontend
]
```

### Environment Variable Configuration

Additional origins can be added via the `ALLOWED_ORIGINS` environment variable:

```bash
# Single origin
ALLOWED_ORIGINS=https://preview-abc123.vercel.app

# Multiple origins (comma-separated, NO SPACES)
ALLOWED_ORIGINS=https://preview-abc123.vercel.app,https://staging.example.com,https://test.vercel.app
```

**Important**: Do NOT add spaces around commas in the `ALLOWED_ORIGINS` value.

## Security Features

### ✅ Implemented Security Measures

1. **No Wildcard Origins**: Wildcard patterns like `https://*.vercel.app` are NOT used
   - Wildcard origins with credentials are not supported by CORS spec
   - Prevents unauthorized subdomains from accessing the API

2. **Explicit Origin List**: All origins are explicitly listed
   - Default origins hardcoded in `main.py`
   - Additional origins added via environment variable
   - Each origin must be fully qualified (include protocol)

3. **Origin Validation**: Origins are validated before being added
   - Empty strings are filtered out
   - Whitespace is trimmed

4. **Credentials Support**: `allow_credentials=True`
   - Allows cookies and authorization headers
   - Required for NextAuth JWT tokens

5. **Method Restrictions**: Only specific HTTP methods allowed
   - GET, POST, PUT, DELETE, PATCH, OPTIONS
   - Prevents arbitrary HTTP methods

### ❌ Previous Security Issues (Fixed)

- **Issue**: Used `https://*.vercel.app` wildcard pattern
- **Risk**: Could allow ANY Vercel subdomain to access API
- **Fixed**: Removed wildcard, now using explicit origin list

## Configuration Steps

### Development

No configuration needed. Default `http://localhost:3000` is already allowed.

### Production (Vercel)

1. **Main Production Frontend**: Already configured
   - `https://intowork-dashboard.vercel.app` is in default list

2. **Vercel Preview Deployments**:

   Add preview URL to environment variable in Railway:

   ```bash
   ALLOWED_ORIGINS=https://intowork-dashboard-preview-xyz123.vercel.app
   ```

   Or via Railway CLI:
   ```bash
   railway variables set ALLOWED_ORIGINS="https://intowork-dashboard-preview-xyz123.vercel.app"
   ```

3. **Multiple Preview URLs**:

   Comma-separated list (no spaces):
   ```bash
   ALLOWED_ORIGINS=https://preview-1.vercel.app,https://preview-2.vercel.app
   ```

### Staging Environment

Add staging frontend URL:

```bash
ALLOWED_ORIGINS=https://staging-intowork.vercel.app
```

## Troubleshooting

### CORS Error: "Origin not allowed"

**Symptom**: Browser console shows CORS error:
```
Access to fetch at 'https://api.example.com/api/...' from origin 'https://preview.vercel.app'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Solution**:
1. Check that origin is in `ALLOWED_ORIGINS` environment variable
2. Verify no extra spaces in environment variable
3. Ensure origin includes protocol (`https://`, not just domain)
4. Restart backend after environment variable change

### Preview URLs Not Working

**Problem**: Vercel preview deployments can't access API

**Solutions**:

1. **Option 1: Add Each Preview URL** (Recommended for important previews)
   ```bash
   ALLOWED_ORIGINS=https://preview-abc123.vercel.app
   ```

2. **Option 2: Use Branch-Specific URLs** (More stable)
   ```bash
   ALLOWED_ORIGINS=https://intowork-dashboard-staging.vercel.app
   ```

3. **Option 3: Development Mode**
   For testing, temporarily add origin in Railway environment:
   ```bash
   ALLOWED_ORIGINS=https://preview-xyz.vercel.app
   ```

### Credentials Not Working

**Problem**: Cookies or auth headers not being sent

**Check**:
1. Verify `allow_credentials=True` in CORS config
2. Ensure origin is explicitly listed (not using wildcard)
3. Check that frontend is sending `credentials: 'include'` in fetch/axios

## Best Practices

### ✅ DO:

- Use full URLs with protocol: `https://example.com`
- Add production domains to default list in code
- Use environment variable for preview/staging URLs
- Test CORS with browser dev tools
- Document all added origins

### ❌ DON'T:

- Use wildcard origins (`*` or `https://*.domain.com`)
- Add spaces in `ALLOWED_ORIGINS` comma-separated list
- Forget protocol in URLs
- Add untrusted domains
- Commit sensitive URLs to version control

## Validation Script

To validate CORS configuration:

```bash
# Test from browser console on allowed origin
fetch('https://your-api.railway.app/api/ping', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('CORS OK:', data))
.catch(err => console.error('CORS Error:', err))
```

## Code Reference

### main.py CORS Setup

```python
# Get default origins
allowed_origins = [
    "http://localhost:3000",
    "https://intowork-dashboard.vercel.app",
]

# Add environment variable origins
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

# Apply CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)
```

## Monitoring

Monitor CORS issues in logs:

```bash
# Check for CORS-related errors
railway logs | grep -i cors

# Or with loguru (after structured logging implementation)
railway logs --json | jq 'select(.message | contains("CORS"))'
```

## Related Files

- `backend/app/main.py` - CORS middleware configuration
- `backend/.env.example` - Environment variable documentation
- `backend/docs/SECURITY.md` - Overall security documentation

## Support

For CORS configuration issues:
1. Check Railway environment variables
2. Verify frontend URL matches exactly (including protocol)
3. Review Railway logs for CORS errors
4. Test with `curl` or Postman to isolate frontend vs backend issues

## References

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [FastAPI CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/)
- [Vercel Preview URLs](https://vercel.com/docs/concepts/deployments/preview-deployments)
