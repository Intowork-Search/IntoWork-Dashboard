"""
API Routes for Job Alerts (ATS Phase 2)
Permet aux candidats de créer des alertes personnalisées pour recevoir des notifications
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete as sql_delete, func, and_, or_
from typing import Annotated, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.database import get_db
from app.auth import require_candidate
from app.models.base import JobAlert, JobAlertFrequency, Candidate, Job, JobType, JobLocation

router = APIRouter(prefix="/job-alerts", tags=["job-alerts"])


# ========================================
# Pydantic Schemas
# ========================================

class JobAlertCriteria(BaseModel):
    """Critères de recherche pour l'alerte"""
    keywords: Optional[List[str]] = Field(default=None, description="Mots-clés à rechercher")
    location: Optional[str] = Field(default=None, description="Localisation souhaitée")
    job_types: Optional[List[JobType]] = Field(default=None, description="Types de contrat")
    location_types: Optional[List[JobLocation]] = Field(default=None, description="Types de localisation")
    salary_min: Optional[int] = Field(default=None, description="Salaire minimum")
    salary_max: Optional[int] = Field(default=None, description="Salaire maximum")


class JobAlertCreate(BaseModel):
    """Création d'une nouvelle alerte emploi"""
    name: str = Field(..., min_length=1, max_length=200, description="Nom de l'alerte")
    criteria: JobAlertCriteria = Field(..., description="Critères de recherche")
    frequency: JobAlertFrequency = Field(default=JobAlertFrequency.DAILY, description="Fréquence d'envoi")


class JobAlertUpdate(BaseModel):
    """Mise à jour d'une alerte existante"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    criteria: Optional[JobAlertCriteria] = None
    frequency: Optional[JobAlertFrequency] = None
    is_active: Optional[bool] = None


class JobAlertResponse(BaseModel):
    """Réponse avec une alerte complète"""
    id: int
    candidate_id: int
    name: str
    criteria: dict
    frequency: JobAlertFrequency
    is_active: bool
    jobs_sent_count: int
    last_sent_at: Optional[datetime]
    last_matching_job_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MatchingJobsResponse(BaseModel):
    """Réponse avec les jobs correspondant à une alerte"""
    alert_id: int
    matching_jobs: List[dict]
    total_matches: int


# ========================================
# Helpers
# ========================================

async def match_jobs_to_criteria(db: AsyncSession, criteria: dict, limit: int = 50) -> List[Job]:
    """
    Trouve les jobs correspondant aux critères d'une alerte
    """
    query = select(Job).where(Job.status == "PUBLISHED")
    
    # Filtrer par mots-clés (title, description, requirements)
    if criteria.get("keywords"):
        keywords = criteria["keywords"]
        keyword_filters = []
        for keyword in keywords:
            keyword_filters.append(
                or_(
                    Job.title.ilike(f"%{keyword}%"),
                    Job.description.ilike(f"%{keyword}%"),
                    Job.requirements.ilike(f"%{keyword}%")
                )
            )
        if keyword_filters:
            query = query.where(or_(*keyword_filters))
    
    # Filtrer par localisation
    if criteria.get("location"):
        query = query.where(Job.location.ilike(f"%{criteria['location']}%"))
    
    # Filtrer par types de contrat
    if criteria.get("job_types"):
        job_types = criteria["job_types"]
        query = query.where(Job.job_type.in_(job_types))
    
    # Filtrer par types de localisation (remote, hybrid, on_site)
    if criteria.get("location_types"):
        location_types = criteria["location_types"]
        query = query.where(Job.location_type.in_(location_types))
    
    # Filtrer par salaire minimum
    if criteria.get("salary_min"):
        query = query.where(
            or_(
                Job.salary_min >= criteria["salary_min"],
                Job.salary_max >= criteria["salary_min"]
            )
        )
    
    # Filtrer par salaire maximum
    if criteria.get("salary_max"):
        query = query.where(Job.salary_min <= criteria["salary_max"])
    
    # Trier par date de publication (plus récents en premier)
    query = query.order_by(Job.posted_at.desc()).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


# ========================================
# API Routes
# ========================================

@router.post("/", response_model=JobAlertResponse, status_code=status.HTTP_201_CREATED)
async def create_job_alert(
    alert_data: JobAlertCreate,
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Créer une nouvelle alerte emploi"""
    
    # Convertir les critères en dict pour stockage JSONB
    criteria_dict = alert_data.criteria.model_dump(exclude_none=True)
    
    new_alert = JobAlert(
        candidate_id=candidate.id,
        name=alert_data.name,
        criteria=criteria_dict,
        frequency=alert_data.frequency
    )
    
    db.add(new_alert)
    await db.commit()
    await db.refresh(new_alert)
    
    return new_alert


@router.get("/", response_model=List[JobAlertResponse])
async def list_job_alerts(
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)],
    is_active: Optional[bool] = None
):
    """
    Lister toutes les alertes emploi du candidat
    
    Filtre optionnel :
    - is_active : Filtrer par statut actif/inactif
    """
    
    query = select(JobAlert).where(JobAlert.candidate_id == candidate.id)
    
    if is_active is not None:
        query = query.where(JobAlert.is_active == is_active)
    
    query = query.order_by(JobAlert.created_at.desc())
    
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return alerts


@router.get("/{alert_id}", response_model=JobAlertResponse)
async def get_job_alert(
    alert_id: int,
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Récupérer une alerte spécifique"""
    
    result = await db.execute(
        select(JobAlert).where(
            JobAlert.id == alert_id,
            JobAlert.candidate_id == candidate.id
        )
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job alert not found"
        )
    
    return alert


@router.get("/{alert_id}/preview", response_model=MatchingJobsResponse)
async def preview_matching_jobs(
    alert_id: int,
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = 20
):
    """
    Prévisualiser les jobs qui correspondent à cette alerte
    Utile pour tester les critères avant de sauvegarder
    """
    
    # Récupérer l'alerte
    result = await db.execute(
        select(JobAlert).where(
            JobAlert.id == alert_id,
            JobAlert.candidate_id == candidate.id
        )
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job alert not found"
        )
    
    # Trouver les jobs correspondants
    matching_jobs = await match_jobs_to_criteria(db, alert.criteria, limit=limit)
    
    # Formater la réponse
    jobs_data = [
        {
            "id": job.id,
            "title": job.title,
            "location": job.location,
            "location_type": job.location_type.value,
            "job_type": job.job_type.value,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "posted_at": job.posted_at,
            "company_id": job.company_id
        }
        for job in matching_jobs
    ]
    
    return {
        "alert_id": alert.id,
        "matching_jobs": jobs_data,
        "total_matches": len(jobs_data)
    }


@router.patch("/{alert_id}", response_model=JobAlertResponse)
async def update_job_alert(
    alert_id: int,
    update_data: JobAlertUpdate,
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Mettre à jour une alerte existante"""
    
    # Récupérer l'alerte
    result = await db.execute(
        select(JobAlert).where(
            JobAlert.id == alert_id,
            JobAlert.candidate_id == candidate.id
        )
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job alert not found"
        )
    
    # Mettre à jour les champs fournis
    if update_data.name is not None:
        alert.name = update_data.name
    if update_data.frequency is not None:
        alert.frequency = update_data.frequency
    if update_data.is_active is not None:
        alert.is_active = update_data.is_active
    if update_data.criteria is not None:
        alert.criteria = update_data.criteria.model_dump(exclude_none=True)
    
    await db.commit()
    await db.refresh(alert)
    
    return alert


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_alert(
    alert_id: int,
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Supprimer une alerte emploi"""
    
    result = await db.execute(
        select(JobAlert).where(
            JobAlert.id == alert_id,
            JobAlert.candidate_id == candidate.id
        )
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job alert not found"
        )
    
    await db.delete(alert)
    await db.commit()
    
    return None


@router.post("/{alert_id}/toggle", response_model=JobAlertResponse)
async def toggle_job_alert(
    alert_id: int,
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Activer/désactiver une alerte rapidement"""
    
    result = await db.execute(
        select(JobAlert).where(
            JobAlert.id == alert_id,
            JobAlert.candidate_id == candidate.id
        )
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job alert not found"
        )
    
    # Toggle
    alert.is_active = not alert.is_active
    await db.commit()
    await db.refresh(alert)
    
    return alert


@router.get("/stats/summary", response_model=dict)
async def get_alerts_summary(
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Statistiques sur les alertes du candidat"""
    
    # Total d'alertes
    total_result = await db.execute(
        select(func.count(JobAlert.id))
        .where(JobAlert.candidate_id == candidate.id)
    )
    total_alerts = total_result.scalar()
    
    # Alertes actives
    active_result = await db.execute(
        select(func.count(JobAlert.id))
        .where(
            JobAlert.candidate_id == candidate.id,
            JobAlert.is_active == True
        )
    )
    active_alerts = active_result.scalar()
    
    # Total de jobs envoyés
    jobs_sent_result = await db.execute(
        select(func.sum(JobAlert.jobs_sent_count))
        .where(JobAlert.candidate_id == candidate.id)
    )
    total_jobs_sent = jobs_sent_result.scalar() or 0
    
    return {
        "total_alerts": total_alerts,
        "active_alerts": active_alerts,
        "inactive_alerts": total_alerts - active_alerts,
        "total_jobs_sent": total_jobs_sent
    }
