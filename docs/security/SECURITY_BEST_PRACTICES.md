# Security Best Practices - INTOWORK Dashboard

This document outlines security best practices for all developers working on the INTOWORK platform.

---

## Table of Contents

1. [Authentication and Authorization](#authentication-and-authorization)
2. [Input Validation and Sanitization](#input-validation-and-sanitization)
3. [Database Security](#database-security)
4. [File Upload Security](#file-upload-security)
5. [API Security](#api-security)
6. [Password Management](#password-management)
7. [Error Handling and Logging](#error-handling-and-logging)
8. [Security Headers](#security-headers)
9. [Code Review Checklist](#code-review-checklist)

---

## Authentication and Authorization

### JWT Token Handling

**DO**:
```python
# ✅ Always verify JWT tokens before processing requests
from app.auth import require_user

@router.get("/protected")
async def protected_route(current_user: User = Depends(require_user)):
    # current_user is guaranteed to be authenticated
    return {"user_id": current_user.id}
```

**DON'T**:
```python
# ❌ Never trust client-provided user IDs without verification
@router.get("/user/{user_id}")
async def get_user_data(user_id: int):
    # Anyone can access any user's data!
    return db.query(User).filter(User.id == user_id).first()
```

### Role-Based Access Control

**DO**:
```python
# ✅ Use role dependencies for protected endpoints
from app.auth import require_employer

@router.post("/jobs")
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(require_employer)
):
    # Only employers can create jobs
    pass
```

**DON'T**:
```python
# ❌ Never check roles manually in route handlers
@router.post("/jobs")
async def create_job(current_user: User = Depends(require_user)):
    if current_user.role != "employer":  # Manual check is error-prone
        raise HTTPException(403)
    pass
```

### Rate Limiting

**DO**:
```python
# ✅ Add rate limiting to all authentication endpoints
from slowapi import Limiter

@router.post("/signin")
@limiter.limit("5/15minutes")
async def signin(request: Request, ...):
    pass
```

**DON'T**:
```python
# ❌ Never allow unlimited authentication attempts
@router.post("/signin")  # No rate limiting
async def signin(...):
    # Vulnerable to brute force attacks
    pass
```

---

## Input Validation and Sanitization

### SQL Injection Prevention

**DO**:
```python
# ✅ Use parameterized queries with SQLAlchemy
search_pattern = f"%{search}%"
query = query.filter(Job.title.ilike(search_pattern))
```

**DON'T**:
```python
# ❌ Never concatenate user input into SQL queries
query = query.filter(Job.title.ilike(f"%{search}%"))  # Vulnerable!
query = db.execute(f"SELECT * FROM jobs WHERE title LIKE '%{search}%'")  # Very vulnerable!
```

### User Input Validation

**DO**:
```python
# ✅ Validate all inputs with Pydantic models
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr  # Validates email format
    password: str = Field(..., min_length=12)
    age: int = Field(..., ge=18, le=120)  # Age between 18-120
```

**DON'T**:
```python
# ❌ Never trust raw request data
@router.post("/users")
async def create_user(request: Request):
    data = await request.json()  # No validation!
    user = User(**data)  # Dangerous!
```

### XSS Prevention

**DO**:
```python
# ✅ Sanitize HTML content before storing
from html import escape

description = escape(user_input)
```

**DON'T**:
```python
# ❌ Never store raw HTML from users
job.description = request.description  # May contain <script> tags
```

---

## Database Security

### Parameterized Queries

**DO**:
```python
# ✅ Use ORM methods or parameterized queries
users = db.query(User).filter(User.email == email).all()

# ✅ If using raw SQL, use parameters
db.execute(text("SELECT * FROM users WHERE email = :email"), {"email": email})
```

**DON'T**:
```python
# ❌ Never use string formatting for SQL
db.execute(f"SELECT * FROM users WHERE email = '{email}'")  # SQL Injection!
```

### Database Credentials

**DO**:
```python
# ✅ Store credentials in environment variables
import os
DATABASE_URL = os.getenv("DATABASE_URL")
```

**DON'T**:
```python
# ❌ Never hardcode credentials
DATABASE_URL = "postgresql://admin:password123@localhost/db"  # Never!
```

### Sensitive Data

**DO**:
```python
# ✅ Hash passwords before storing
from app.auth import PasswordHasher

user.password_hash = PasswordHasher.hash_password(password)
```

**DON'T**:
```python
# ❌ Never store passwords in plain text
user.password = password  # Catastrophic security failure!
```

---

## File Upload Security

### Filename Sanitization

**DO**:
```python
# ✅ Sanitize filenames and validate paths
import os
import uuid
from pathlib import Path

# Extract basename to remove path components
original_filename = os.path.basename(uploaded_file.filename)

# Sanitize and add UUID for uniqueness
safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', original_filename)
unique_filename = f"{uuid.uuid4().hex}_{safe_filename}"

# Validate path stays within upload directory
upload_dir = os.path.abspath("uploads")
file_path = os.path.join(upload_dir, unique_filename)
file_path_resolved = os.path.abspath(file_path)

if not file_path_resolved.startswith(upload_dir):
    raise HTTPException(400, "Invalid file path")
```

**DON'T**:
```python
# ❌ Never trust uploaded filenames
file_path = f"uploads/{uploaded_file.filename}"  # Path traversal!
with open(file_path, "wb") as f:
    f.write(await uploaded_file.read())
```

### File Type Validation

**DO**:
```python
# ✅ Validate both MIME type and magic bytes
if file.content_type != "application/pdf":
    raise HTTPException(400, "Only PDF files allowed")

content = await file.read()
if not content.startswith(b'%PDF'):
    raise HTTPException(400, "Invalid PDF file")
```

**DON'T**:
```python
# ❌ Never trust file extensions alone
if not filename.endswith('.pdf'):  # Easily bypassed!
    raise HTTPException(400)
```

### File Size Limits

**DO**:
```python
# ✅ Enforce file size limits
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

content = await file.read()
if len(content) > MAX_FILE_SIZE:
    raise HTTPException(400, "File too large")
```

**DON'T**:
```python
# ❌ Never allow unlimited file uploads
content = await file.read()  # Could be gigabytes!
```

---

## API Security

### Rate Limiting

**DO**:
```python
# ✅ Implement rate limits on all public endpoints
@router.post("/api/public")
@limiter.limit("10/minute")
async def public_endpoint(request: Request):
    pass
```

### CORS Configuration

**DO**:
```python
# ✅ Specify allowed origins explicitly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-domain.com",
        "http://localhost:3000"  # Dev only
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"]
)
```

**DON'T**:
```python
# ❌ Never use wildcard origins with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dangerous with credentials!
    allow_credentials=True
)
```

### API Versioning

**DO**:
```python
# ✅ Version your APIs for backward compatibility
app.include_router(v1_router, prefix="/api/v1")
app.include_router(v2_router, prefix="/api/v2")
```

---

## Password Management

### Password Validation

**DO**:
```python
# ✅ Enforce strong password requirements
from app.auth import PasswordHasher

is_valid, error = PasswordHasher.validate_password_strength(password)
if not is_valid:
    raise HTTPException(400, detail=error)
```

**Current Requirements**:
- Minimum 12 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)
- At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

### Password Hashing

**DO**:
```python
# ✅ Use bcrypt for password hashing
from app.auth import PasswordHasher

password_hash = PasswordHasher.hash_password(password)
```

**DON'T**:
```python
# ❌ Never use weak hashing algorithms
import hashlib
password_hash = hashlib.md5(password.encode()).hexdigest()  # Insecure!
password_hash = hashlib.sha1(password.encode()).hexdigest()  # Also insecure!
```

### Password Reset

**DO**:
```python
# ✅ Use secure, single-use tokens with expiration
import secrets
from datetime import datetime, timedelta, timezone

token = secrets.token_urlsafe(32)  # Cryptographically secure
expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

reset_token = PasswordResetToken(
    user_id=user.id,
    token=token,
    expires_at=expires_at
)
```

**DON'T**:
```python
# ❌ Never use predictable tokens
import random
token = str(random.randint(100000, 999999))  # Predictable!
```

---

## Error Handling and Logging

### Error Messages

**DO**:
```python
# ✅ Return generic error messages to users
if not user or not verify_password(password, user.password_hash):
    raise HTTPException(401, "Invalid email or password")
```

**DON'T**:
```python
# ❌ Never reveal sensitive information in errors
if not user:
    raise HTTPException(404, "User not found")  # Email enumeration!
if not verify_password(password, user.password_hash):
    raise HTTPException(401, "Invalid password")  # Reveals email exists!
```

### Logging

**DO**:
```python
# ✅ Log security events with context
import logging
logger = logging.getLogger(__name__)

logger.warning(f"Failed login attempt for {email} from IP {request.client.host}")
logger.error(f"Path traversal attempt: {filename} by user {user_id}")
```

**DON'T**:
```python
# ❌ Never log sensitive data
logger.info(f"User password: {password}")  # Never log passwords!
logger.debug(f"JWT token: {token}")  # Never log tokens!
logger.info(f"Credit card: {card_number}")  # Never log PII!
```

### Exception Handling

**DO**:
```python
# ✅ Handle exceptions gracefully
try:
    result = process_data(user_input)
except ValueError as e:
    logger.error(f"Invalid data: {e}")
    raise HTTPException(400, "Invalid request data")
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(500, "Internal server error")
```

**DON'T**:
```python
# ❌ Never expose stack traces to users
@router.post("/process")
async def process(data: dict):
    result = process_data(data)  # May raise exception with sensitive info
    return result
```

---

## Security Headers

### Required Headers

Always include these security headers (already configured in main.py):

```python
response.headers["X-Content-Type-Options"] = "nosniff"
response.headers["X-Frame-Options"] = "DENY"
response.headers["X-XSS-Protection"] = "1; mode=block"
response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
response.headers["Content-Security-Policy"] = "default-src 'self'"
```

### HTTPS Only

**DO**:
```python
# ✅ Enforce HTTPS in production
if os.getenv("ENVIRONMENT") == "production":
    if not request.url.scheme == "https":
        raise HTTPException(403, "HTTPS required")
```

---

## Code Review Checklist

Use this checklist when reviewing code:

### Authentication & Authorization
- [ ] All protected endpoints use `require_user` or role-specific dependencies
- [ ] JWT tokens are validated before processing requests
- [ ] Role checks use dependency injection, not manual checks
- [ ] Rate limiting applied to authentication endpoints

### Input Validation
- [ ] All user inputs validated with Pydantic models
- [ ] SQL queries use parameterized queries (no string interpolation)
- [ ] File uploads sanitize filenames and validate paths
- [ ] Email addresses validated with `EmailStr`
- [ ] Numeric inputs have min/max constraints

### Security Best Practices
- [ ] Passwords validated for strength before hashing
- [ ] Sensitive data (passwords, tokens) not logged
- [ ] Error messages don't reveal sensitive information
- [ ] File uploads check MIME type and magic bytes
- [ ] File size limits enforced
- [ ] CORS configured with specific origins
- [ ] Security headers properly set

### Database Security
- [ ] No raw SQL with user input
- [ ] Database credentials in environment variables
- [ ] Passwords hashed with bcrypt before storage
- [ ] Sensitive queries use appropriate indexes

### API Security
- [ ] Rate limiting on public endpoints
- [ ] Proper HTTP status codes used
- [ ] Response doesn't leak internal details
- [ ] API versioning for breaking changes

---

## Common Security Pitfalls

### 1. Trusting Client Data

**Problem**: Accepting user-provided data without validation
**Solution**: Always validate with Pydantic models

### 2. Information Disclosure

**Problem**: Error messages reveal system details
**Solution**: Use generic error messages for users, detailed logs for developers

### 3. Insufficient Authorization

**Problem**: Checking authentication but not authorization
**Solution**: Verify user has permission for specific resources

### 4. Insecure Direct Object References (IDOR)

**Problem**: Users can access others' data by changing IDs
**Solution**: Always verify ownership before returning data

```python
# ✅ Good - Verify ownership
@router.get("/applications/{app_id}")
async def get_application(
    app_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app or app.user_id != current_user.id:
        raise HTTPException(404, "Application not found")
    return app
```

### 5. Session Fixation

**Problem**: Reusing session IDs after authentication
**Solution**: Generate new JWT token after login

### 6. Mass Assignment

**Problem**: Allowing users to set any field via API
**Solution**: Use explicit Pydantic models with only allowed fields

```python
# ✅ Good - Explicit fields
class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    # role NOT included - prevents privilege escalation

# ❌ Bad - Accepting any field
user_data = request.json()
user.update(**user_data)  # User could set role=admin!
```

---

## Security Resources

### OWASP Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

### FastAPI Security
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [SQLAlchemy Security](https://docs.sqlalchemy.org/en/14/faq/security.html)

### Tools
- [Bandit](https://github.com/PyCQA/bandit) - Python security linter
- [Safety](https://github.com/pyupio/safety) - Dependency vulnerability scanner
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing tool

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **DO NOT** discuss in public channels
3. **DO** email security@intowork.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

4. Wait for acknowledgment before public disclosure

---

## Updates

This document is maintained by the security team. Last updated: 2025-12-30

For questions or suggestions, contact the security team.
