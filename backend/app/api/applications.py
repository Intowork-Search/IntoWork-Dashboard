from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from app.database import get_db
from app.models.base import JobApplication, Job, User
from app.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Schémas Pydantic pour les candidatures
class JobApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None

class JobApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: str
    applied_at: datetime
    notes: Optional[str] = None
    job: dict  # Sera rempli avec les données du job

    class Config:
        from_attributes = True

class ApplicationsListResponse(BaseModel):
    applications: List[JobApplicationResponse]
    total: int
    page: int
    limit: int
    total_pages: int

@router.get("/candidates/applications", response_model=ApplicationsListResponse)
async def get_my_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer les candidatures du candidat connecté"""
    
    # Construire la query de base
    query = db.query(JobApplication).filter(
        JobApplication.candidate_id == current_user.id
    ).options(
        selectinload(JobApplication.job)
    )
    
    # Filtrer par statut si spécifié
    if status:
        query = query.filter(JobApplication.status == status)
    
    # Ordonner par date de candidature (plus récent en premier)
    query = query.order_by(JobApplication.applied_at.desc())
    
    # Calculer le total
    total = query.count()
    total_pages = (total + limit - 1) // limit
    
    # Appliquer la pagination
    applications = query.offset((page - 1) * limit).limit(limit).all()
    
    # Construire les données de réponse avec les informations du job
    applications_data = []
    for app in applications:
        job_data = {
            'id': app.job.id,
            'title': app.job.title,
            'company_name': app.job.company_name,
            'location': app.job.location,
            'location_type': app.job.location_type,
            'job_type': app.job.job_type,
            'salary_min': app.job.salary_min,
            'salary_max': app.job.salary_max,
            'currency': app.job.currency
        } if app.job else {}
        
        app_data = JobApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            candidate_id=app.candidate_id,
            status=app.status,
            applied_at=app.applied_at,
            notes=app.notes,
            job=job_data
        )
        applications_data.append(app_data)
    
    return ApplicationsListResponse(
        applications=applications_data,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.post("/candidates/applications", response_model=JobApplicationResponse)
async def create_application(
    application_data: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Postuler à une offre d'emploi"""
    
    # Vérifier si le job existe
    job = db.query(Job).filter(Job.id == application_data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre d'emploi introuvable")
    
    # Vérifier si l'utilisateur a déjà postulé à cette offre
    existing_application = db.query(JobApplication).filter(
        JobApplication.job_id == application_data.job_id,
        JobApplication.candidate_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette offre")
    
    # Créer la candidature
    application = JobApplication(
        job_id=application_data.job_id,
        candidate_id=current_user.id,
        status="pending",
        applied_at=datetime.utcnow(),
        notes=application_data.cover_letter
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    # Récupérer avec les données du job
    application_with_job = db.query(JobApplication).options(
        selectinload(JobApplication.job)
    ).filter(JobApplication.id == application.id).first()
    
    job_data = {
        'id': application_with_job.job.id,
        'title': application_with_job.job.title,
        'company_name': application_with_job.job.company_name,
        'location': application_with_job.job.location,
        'location_type': application_with_job.job.location_type,
        'job_type': application_with_job.job.job_type,
        'salary_min': application_with_job.job.salary_min,
        'salary_max': application_with_job.job.salary_max,
        'currency': application_with_job.job.currency
    }
    
    return JobApplicationResponse(
        id=application_with_job.id,
        job_id=application_with_job.job_id,
        candidate_id=application_with_job.candidate_id,
        status=application_with_job.status,
        applied_at=application_with_job.applied_at,
        notes=application_with_job.notes,
        job=job_data
    )

@router.get("/candidates/applications/{application_id}", response_model=JobApplicationResponse)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer une candidature spécifique"""
    
    application = db.query(JobApplication).options(
        selectinload(JobApplication.job)
    ).filter(
        JobApplication.id == application_id,
        JobApplication.candidate_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    
    job_data = {
        'id': application.job.id,
        'title': application.job.title,
        'company_name': application.job.company_name,
        'location': application.job.location,
        'location_type': application.job.location_type,
        'job_type': application.job.job_type,
        'salary_min': application.job.salary_min,
        'salary_max': application.job.salary_max,
        'currency': application.job.currency
    } if application.job else {}
    
    return JobApplicationResponse(
        id=application.id,
        job_id=application.job_id,
        candidate_id=application.candidate_id,
        status=application.status,
        applied_at=application.applied_at,
        notes=application.notes,
        job=job_data
    )

@router.delete("/candidates/applications/{application_id}")
async def withdraw_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retirer une candidature"""
    
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.candidate_id == current_user.id,
        JobApplication.status == "pending"  # On ne peut retirer que les candidatures en attente
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=404, 
            detail="Candidature introuvable ou impossible à retirer"
        )
    
    db.delete(application)
    db.commit()
    
    return {"message": "Candidature retirée avec succès"}
