from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/ping")
async def ping():
    return {
        "ping": "pong",
        "timestamp": datetime.now().isoformat(),
        "service": "intowork-backend"
    }

@router.get("/status")
async def status():
    return {
        "status": "running",
        "phase": "Phase 1 - Foundation",
        "features": ["ping", "health_check"],
        "next": "database_models"
    }
