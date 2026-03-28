from fastapi import APIRouter, Depends
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import User, UserRole, Company, Job, JobApplication
import time

router = APIRouter()

# Cache en mémoire pour les stats publiques (refresh toutes les 5 min)
_stats_cache: dict = {}
_stats_cache_ts: float = 0
STATS_CACHE_TTL = 300  # 5 minutes


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


@router.get("/stats/public")
async def get_public_stats(db: AsyncSession = Depends(get_db)):
    """Statistiques publiques pour la landing page (cache 5 min)."""
    global _stats_cache, _stats_cache_ts

    now = time.time()
    if _stats_cache and (now - _stats_cache_ts) < STATS_CACHE_TTL:
        return _stats_cache

    result = await db.execute(
        select(func.count()).select_from(User).filter(User.role == UserRole.CANDIDATE)
    )
    total_candidates = result.scalar() or 0

    result = await db.execute(select(func.count()).select_from(Company))
    total_companies = result.scalar() or 0

    result = await db.execute(
        select(func.count()).select_from(Job).filter(Job.status == "active")
    )
    active_jobs = result.scalar() or 0

    result = await db.execute(select(func.count()).select_from(JobApplication))
    total_applications = result.scalar() or 0

    _stats_cache = {
        "candidates": total_candidates,
        "companies": total_companies,
        "active_jobs": active_jobs,
        "applications": total_applications,
    }
    _stats_cache_ts = now

    return _stats_cache
