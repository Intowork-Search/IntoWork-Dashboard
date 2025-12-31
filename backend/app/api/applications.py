from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.database import get_db
from app.models.base import JobApplication, Job, User, Employer, NotificationType, Candidate
from app.auth import require_user
from app.api.notifications import create_notification
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

@router.get("/my/applications", response_model=ApplicationsListResponse)
async def get_my_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer les candidatures du candidat connecté"""

    # Vérifier que l'utilisateur est un candidat
    if current_user.role.value != 'candidate':
        raise HTTPException(status_code=403, detail="Seuls les candidats peuvent accéder à leurs candidatures")

    # Récupérer le profil candidat
    result = await db.execute(
        select(Candidate).filter(Candidate.user_id == current_user.id)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        return ApplicationsListResponse(
            applications=[],
            total=0,
            page=page,
            limit=limit,
            total_pages=0
        )

    # Construire la query de base
    from app.models.base import Company
    stmt = select(JobApplication).filter(
        JobApplication.candidate_id == candidate.id
    ).options(
        selectinload(JobApplication.job).selectinload(Job.company)
    )

    # Filtrer par statut si spécifié
    if status:
        stmt = stmt.filter(JobApplication.status == status)

    # Ordonner par date de candidature (plus récent en premier)
    stmt = stmt.order_by(JobApplication.applied_at.desc())

    # Calculer le total
    count_stmt = select(func.count()).select_from(
        select(JobApplication).filter(
            JobApplication.candidate_id == candidate.id,
            JobApplication.status == status if status else True
        ).subquery()
    )
    total_result = await db.execute(count_stmt)
    total = total_result.scalar()
    total_pages = (total + limit - 1) // limit

    # Appliquer la pagination
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    apps_result = await db.execute(stmt)
    applications = apps_result.scalars().all()
    
    # Construire les données de réponse avec les informations du job
    applications_data = []
    for app in applications:
        job_data = {
            'id': app.job.id,
            'title': app.job.title,
            'company_name': app.job.company.name if app.job.company else "Entreprise inconnue",
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

@router.post("/my/applications", response_model=JobApplicationResponse)
async def create_application(
    application_data: JobApplicationCreate,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Postuler à une offre d'emploi"""

    # Vérifier que l'utilisateur est un candidat
    if current_user.role.value != 'candidate':
        raise HTTPException(status_code=403, detail="Seuls les candidats peuvent postuler")

    # Récupérer le profil candidat
    result = await db.execute(
        select(Candidate).filter(Candidate.user_id == current_user.id)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profil candidat introuvable")

    # Vérifier si le job existe
    job_result = await db.execute(
        select(Job).filter(Job.id == application_data.job_id)
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Offre d'emploi introuvable")

    # Vérifier si l'utilisateur a déjà postulé à cette offre
    existing_result = await db.execute(
        select(JobApplication).filter(
            JobApplication.job_id == application_data.job_id,
            JobApplication.candidate_id == candidate.id
        )
    )
    existing_application = existing_result.scalar_one_or_none()

    if existing_application:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette offre")

    # Créer la candidature
    from app.models.base import ApplicationStatus
    application = JobApplication(
        job_id=application_data.job_id,
        candidate_id=candidate.id,
        status=ApplicationStatus.APPLIED,
        cover_letter=application_data.cover_letter,
        applied_at=datetime.utcnow()
    )

    db.add(application)
    await db.commit()
    await db.refresh(application)

    # Créer une notification pour l'employeur
    try:
        # Récupérer le job avec l'employeur
        job_employer_result = await db.execute(
            select(Job).options(selectinload(Job.employer)).filter(Job.id == application_data.job_id)
        )
        job_with_employer = job_employer_result.scalar_one_or_none()
        if job_with_employer and job_with_employer.employer:
            create_notification(
                db=db,
                user_id=job_with_employer.employer.user_id,
                type=NotificationType.NEW_APPLICATION,
                title="📝 Nouvelle candidature reçue",
                message=f"{current_user.first_name} {current_user.last_name} a postulé pour le poste de {job.title}",
                related_job_id=application_data.job_id,
                related_application_id=application.id
            )
    except Exception as e:
        print(f"Erreur lors de la création de la notification: {e}")
        # Ne pas bloquer si la notification échoue

    # Récupérer avec les données du job et de la company
    from app.models.base import Company
    app_with_job_result = await db.execute(
        select(JobApplication)
        .options(selectinload(JobApplication.job).selectinload(Job.company))
        .filter(JobApplication.id == application.id)
    )
    application_with_job = app_with_job_result.scalar_one_or_none()
    
    job_data = {
        'id': application_with_job.job.id,
        'title': application_with_job.job.title,
        'company_name': application_with_job.job.company.name if application_with_job.job.company else "Entreprise inconnue",
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

@router.get("/my/applications/{application_id}", response_model=JobApplicationResponse)
async def get_application(
    application_id: int,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer une candidature spécifique"""

    result = await db.execute(
        select(JobApplication)
        .options(selectinload(JobApplication.job))
        .filter(
            JobApplication.id == application_id,
            JobApplication.candidate_id == current_user.id
        )
    )
    application = result.scalar_one_or_none()

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

@router.delete("/my/applications/{application_id}")
async def withdraw_application(
    application_id: int,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Retirer une candidature"""

    result = await db.execute(
        select(JobApplication).filter(
            JobApplication.id == application_id,
            JobApplication.candidate_id == current_user.id,
            JobApplication.status == "pending"  # On ne peut retirer que les candidatures en attente
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Candidature introuvable ou impossible à retirer"
        )

    await db.delete(application)
    await db.commit()

    return {"message": "Candidature retirée avec succès"}

# ===== ENDPOINTS EMPLOYEUR =====

class CandidateApplicationResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    candidate_id: int
    candidate_name: str
    candidate_email: str
    candidate_phone: Optional[str] = None
    status: str
    applied_at: datetime
    cover_letter: Optional[str] = None
    notes: Optional[str] = None
    cv_url: Optional[str] = None

    class Config:
        from_attributes = True

class EmployerApplicationsListResponse(BaseModel):
    applications: List[CandidateApplicationResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class UpdateApplicationStatusRequest(BaseModel):
    status: str  # pending, viewed, shortlisted, interview, accepted, rejected
    
class UpdateApplicationNotesRequest(BaseModel):
    notes: str

@router.get("/employer/applications", response_model=EmployerApplicationsListResponse)
async def get_employer_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    job_id: Optional[int] = Query(None),
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer toutes les candidatures des offres de l'employeur"""
    from app.models.base import Employer, Candidate, UserRole

    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")

    # Récupérer l'employeur
    employer_result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    # Construire la query - candidatures pour les jobs de cet employeur
    stmt = (
        select(JobApplication)
        .join(Job)
        .filter(Job.employer_id == employer.id)
        .options(
            selectinload(JobApplication.job),
            selectinload(JobApplication.candidate).selectinload(Candidate.user)
        )
    )

    # Filtrer par statut si spécifié
    if status:
        from app.models.base import ApplicationStatus
        try:
            status_enum = ApplicationStatus(status)
            stmt = stmt.filter(JobApplication.status == status_enum)
        except ValueError:
            pass

    # Filtrer par job_id si spécifié
    if job_id:
        stmt = stmt.filter(JobApplication.job_id == job_id)

    # Ordre anti-chronologique
    stmt = stmt.order_by(JobApplication.applied_at.desc())

    # Pagination - calculer le total
    count_stmt = select(func.count()).select_from(
        select(JobApplication).join(Job).filter(Job.employer_id == employer.id).subquery()
    )
    if status:
        from app.models.base import ApplicationStatus
        try:
            status_enum = ApplicationStatus(status)
            count_stmt = select(func.count()).select_from(
                select(JobApplication).join(Job).filter(
                    Job.employer_id == employer.id,
                    JobApplication.status == status_enum
                ).subquery()
            )
        except ValueError:
            pass
    if job_id:
        count_stmt = select(func.count()).select_from(
            select(JobApplication).join(Job).filter(
                Job.employer_id == employer.id,
                JobApplication.job_id == job_id
            ).subquery()
        )

    total_result = await db.execute(count_stmt)
    total = total_result.scalar()
    total_pages = (total + limit - 1) // limit

    # Récupérer les applications
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    apps_result = await db.execute(stmt)
    applications = apps_result.scalars().all()
    
    # Formater les résultats
    applications_data = []
    for app in applications:
        candidate_user = app.candidate.user if app.candidate else None
        applications_data.append(CandidateApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            job_title=app.job.title,
            candidate_id=app.candidate_id,
            candidate_name=f"{candidate_user.first_name} {candidate_user.last_name}" if candidate_user else "Inconnu",
            candidate_email=candidate_user.email if candidate_user else "",
            candidate_phone=app.candidate.phone if app.candidate else None,
            status=app.status.value,
            applied_at=app.applied_at,
            cover_letter=app.cover_letter,
            notes=app.notes,
            cv_url=app.candidate.cv_url if app.candidate else None
        ))
    
    return EmployerApplicationsListResponse(
        applications=applications_data,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.put("/employer/applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    request: UpdateApplicationStatusRequest,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Mettre à jour le statut d'une candidature (employeur uniquement)"""
    from app.models.base import Employer, ApplicationStatus, UserRole

    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")

    # Récupérer l'employeur
    employer_result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    # Récupérer la candidature avec le candidat
    app_result = await db.execute(
        select(JobApplication)
        .options(
            selectinload(JobApplication.job),
            selectinload(JobApplication.candidate)
        )
        .filter(JobApplication.id == application_id)
    )
    application = app_result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")

    # Vérifier que le job appartient à cet employeur
    if application.job.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas modifier cette candidature")

    # Valider et mettre à jour le statut
    try:
        old_status = application.status
        new_status = ApplicationStatus(request.status)
        application.status = new_status
        await db.commit()
        await db.refresh(application)
        
        # Créer une notification pour le candidat si le statut a changé
        if old_status != new_status:
            try:
                status_messages = {
                    ApplicationStatus.VIEWED: "👁️ Votre candidature a été vue",
                    ApplicationStatus.SHORTLISTED: "⭐ Vous avez été présélectionné(e)",
                    ApplicationStatus.INTERVIEW: "🎯 Vous êtes convoqué(e) en entretien",
                    ApplicationStatus.ACCEPTED: "🎉 Félicitations! Votre candidature a été acceptée",
                    ApplicationStatus.REJECTED: "❌ Votre candidature n'a pas été retenue"
                }
                
                title = status_messages.get(new_status, "📬 Mise à jour de votre candidature")
                message = f"Votre candidature pour le poste de {application.job.title} a été mise à jour: {new_status.value}"
                
                create_notification(
                    db=db,
                    user_id=application.candidate.user_id,
                    type=NotificationType.STATUS_CHANGE,
                    title=title,
                    message=message,
                    related_job_id=application.job_id,
                    related_application_id=application.id
                )
            except Exception as e:
                print(f"Erreur lors de la création de la notification: {e}")
                # Ne pas bloquer si la notification échoue
        
        return {
            "message": "Statut mis à jour avec succès",
            "application_id": application.id,
            "new_status": application.status.value
        }
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Statut invalide: {request.status}")

@router.put("/employer/applications/{application_id}/notes")
async def update_application_notes(
    application_id: int,
    request: UpdateApplicationNotesRequest,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Ajouter ou mettre à jour les notes d'une candidature (employeur uniquement)"""
    from app.models.base import Employer, UserRole

    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")

    # Récupérer l'employeur
    employer_result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    # Récupérer la candidature
    app_result = await db.execute(
        select(JobApplication)
        .options(selectinload(JobApplication.job))
        .filter(JobApplication.id == application_id)
    )
    application = app_result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")

    # Vérifier que le job appartient à cet employeur
    if application.job.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas modifier cette candidature")

    # Mettre à jour les notes
    application.notes = request.notes
    await db.commit()
    await db.refresh(application)

    return {
        "message": "Notes mises à jour avec succès",
        "application_id": application.id,
        "notes": application.notes
    }
