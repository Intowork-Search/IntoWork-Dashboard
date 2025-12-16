from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.ping import router as ping_router
from app.api.users import router as users_router
from app.api.auth import router as auth_router

app = FastAPI(
    title="INTOWORK Search - Backend",
    description="Plateforme de recrutement B2B2C - API Backend",
    version="1.0.0"
)

# CORS middleware pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routers
app.include_router(ping_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

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
