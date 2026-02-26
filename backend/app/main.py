from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from app.logging_config import logger
from app.middleware.request_id import RequestIDMiddleware
from app.monitoring import setup_monitoring, create_metrics_endpoint, update_db_pool_metrics
from app.cache import cache
from app.api.ping import router as ping_router
from app.api.users import router as users_router
from app.api.auth_routes import router as auth_routes_router
from app.api.candidates import router as candidates_router
from app.api.employers import router as employers_router
from app.api.dashboard import router as dashboard_router
from app.api.jobs import router as jobs_router
from app.api.applications import router as applications_router
from app.api.companies import router as companies_router
from app.api.notifications import router as notifications_router
from app.api.admin import router as admin_router
from app.api.cv_builder import router as cv_builder_router
from app.api.ai_scoring import router as ai_scoring_router
# 🆕 ATS Phase 2 - February 2026
from app.api.email_templates import router as email_templates_router
from app.api.job_alerts import router as job_alerts_router
from app.api.collaboration import router as collaboration_router
from app.api.integrations import router as integrations_router
from dotenv import load_dotenv
import os
from pathlib import Path
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Security: Initialize rate limiter to prevent brute force and abuse
from app.rate_limiter import limiter

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up INTOWORK Backend API...")

    # Initialize Redis cache
    await cache.connect()

    # Update database pool metrics
    from app.database import engine
    await update_db_pool_metrics(engine)

    logger.info("All services initialized successfully")

    yield

    # Shutdown
    logger.info("Shutting down INTOWORK Backend API...")

    # Disconnect Redis
    await cache.disconnect()

    # Dispose database engine
    await engine.dispose()
    logger.info("Database engine disposed successfully")

    logger.info("Shutdown complete")

app = FastAPI(
    title="INTOWORK Search - Backend",
    description="Plateforme de recrutement B2B2C - API Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Security: Add rate limiter state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup Prometheus monitoring and metrics endpoint
instrumentator = setup_monitoring(app)
create_metrics_endpoint(app)
instrumentator.expose(app, endpoint="/metrics", include_in_schema=False)

# Define allowed origins for CORS early (used in exception handler)
allowed_origins = [
    "http://localhost:3000",  # Next.js dev server
    "https://intowork.co",  # Production frontend
    "https://www.intowork.co",  # Production frontend with www
    "https://intowork-dashboard.vercel.app",  # Production Vercel deployment
]

# Get additional allowed origins from environment
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

# Global exception handler for unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Create error response
    response = JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
    
    # Add CORS headers manually to ensure they're present on error responses
    origin = request.headers.get("origin")
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Ajouter les en-têtes de sécurité
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # CSP - NE PAS appliquer aux routes API (JSON only, pas de contenu HTML)
        if request.url.path.startswith("/api/"):
            # Pour les API JSON, pas besoin de CSP
            # Ça évite les conflits Mixed Content avec le frontend
            pass
        elif request.url.path in ["/docs", "/redoc", "/openapi.json"]:
            # CSP permissive pour Swagger UI
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://fastapi.tiangolo.com; "
                "font-src 'self' https://cdn.jsdelivr.net"
            )
        else:
            # CSP stricte pour les autres routes (root, health, etc.)
            response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response


# Ajouter le middleware de sécurité
app.add_middleware(SecurityHeadersMiddleware)

# Add Request ID middleware for distributed tracing
app.add_middleware(RequestIDMiddleware)

# CORS middleware pour le frontend
# NOTE: register CORS early so headers are applied even on error responses
# Note: Wildcard origins with credentials not supported by CORS spec
# For dynamic Vercel preview URLs, validate origin in middleware
# (allowed_origins defined earlier, before global exception handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Inclure les routers
app.include_router(ping_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(auth_routes_router, prefix="/api/auth", tags=["authentication"])
app.include_router(candidates_router, prefix="/api/candidates", tags=["candidates"])
app.include_router(employers_router, prefix="/api", tags=["employers"])
app.include_router(dashboard_router, prefix="/api", tags=["dashboard"])
app.include_router(jobs_router, prefix="/api/jobs", tags=["jobs"])
app.include_router(applications_router, prefix="/api/applications", tags=["applications"])
app.include_router(companies_router, prefix="/api/companies", tags=["companies"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["notifications"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(cv_builder_router, prefix="/api/cv-builder", tags=["cv-builder"])
app.include_router(ai_scoring_router, prefix="/api/ai-scoring", tags=["ai-scoring"])
# 🆕 ATS Phase 2 routers
app.include_router(email_templates_router, prefix="/api", tags=["ats-email-templates"])
app.include_router(job_alerts_router, prefix="/api", tags=["ats-job-alerts"])
app.include_router(collaboration_router, prefix="/api", tags=["ats-collaboration"])
app.include_router(integrations_router, prefix="/api", tags=["ats-integrations"])

# Servir les fichiers uploadés (CV, photos, etc.) avec CORS
uploads_path = Path(__file__).parent.parent / "uploads"
uploads_path.mkdir(exist_ok=True)

# Custom StaticFiles middleware pour ajouter les headers CORS
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response, FileResponse
from starlette.staticfiles import StaticFiles as BaseStaticFiles

class CORSStaticFiles(BaseStaticFiles):
    """Custom StaticFiles with CORS headers for images"""
    async def get_response(self, path: str, scope) -> Response:
        response = await super().get_response(path, scope)
        
        # Add CORS headers to allow cross-origin image loading
        if isinstance(response, FileResponse):
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
            response.headers["Cache-Control"] = "public, max-age=31536000"
        
        return response

app.mount("/uploads", CORSStaticFiles(directory=str(uploads_path)), name="uploads")

@app.get("/")
async def root():
    return {
        "status": "ok", 
        "service": "intowork-backend",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "intowork-backend"}
