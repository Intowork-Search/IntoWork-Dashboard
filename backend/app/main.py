from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
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
from dotenv import load_dotenv
import os
from pathlib import Path

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

app = FastAPI(
    title="INTOWORK Search - Backend",
    description="Plateforme de recrutement B2B2C - API Backend",
    version="1.0.0"
)


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
        # CSP - À adapter selon vos besoins
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response


# Ajouter le middleware de sécurité
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://intowork-dashboard.vercel.app",  # Production frontend
        "https://intowork-dashboard-56y4i4dix-saas-hc.vercel.app",  # Vercel preview
        "https://*.vercel.app",  # All Vercel deployments
    ],
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

# Servir les fichiers uploadés (CV, photos, etc.)
uploads_path = Path(__file__).parent.parent / "uploads"
uploads_path.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

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
