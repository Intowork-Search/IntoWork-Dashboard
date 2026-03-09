from fastapi import APIRouter, Depends, HTTPException, Query
from app.rate_limiter import limiter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.database import get_db
from app.models.base import JobApplication, Job, User, Employer, NotificationType, Candidate
from app.auth import require_user
from app.api.notifications import create_notification
from app.services.email_service import email_service
from pydantic import BaseModel
from datetime import datetime
import logging

# Logger pour les emails
logger = logging.getLogger(__name__)

router = APIRouter()

# Schémas Pydantic pour les candidatures
class JobApplicationCreate(BaseModel):
    job_id: int
    cv_id: Optional[int] = None  # ID du CV sélectionné
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
    count_filter = JobApplication.candidate_id == candidate.id
    if status:
        count_filter = (count_filter) & (JobApplication.status == status)
    
    count_stmt = select(func.count()).select_from(JobApplication).where(count_filter)
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

    # Gérer la sélection du CV
    from app.models.base import ApplicationStatus, CandidateCV
    cv_url = None
    cv_id = None
    
    if application_data.cv_id:
        # Vérifier que le CV appartient bien au candidat
        cv_result = await db.execute(
            select(CandidateCV).filter(
                CandidateCV.id == application_data.cv_id,
                CandidateCV.candidate_id == candidate.id
            )
        )
        selected_cv = cv_result.scalar_one_or_none()
        
        if not selected_cv:
            raise HTTPException(status_code=400, detail="CV invalide ou introuvable")
        
        cv_id = selected_cv.id
        cv_url = selected_cv.file_path
    else:
        # Fallback : utiliser le CV principal (is_active=True)
        active_cv_result = await db.execute(
            select(CandidateCV)
            .filter(
                CandidateCV.candidate_id == candidate.id,
                CandidateCV.is_active == True
            )
            .order_by(CandidateCV.created_at.desc())
            .limit(1)
        )
        active_cv = active_cv_result.scalar_one_or_none()
        
        if active_cv:
            cv_id = active_cv.id
            cv_url = active_cv.file_path
        elif candidate.cv_url:
            # Fallback legacy
            cv_url = candidate.cv_url

    # Créer la candidature
    application = JobApplication(
        job_id=application_data.job_id,
        candidate_id=candidate.id,
        cv_id=cv_id,
        cv_url=cv_url,  # Pour compatibilité
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
            await create_notification(
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
    
    # Envoyer un email de confirmation au candidat (si template configuré)
    try:
        from app.models.base import EmailTemplate, EmailTemplateType, Company
        
        # Récupérer le job avec la company
        job_company_result = await db.execute(
            select(Job).options(selectinload(Job.company)).filter(Job.id == application_data.job_id)
        )
        job_with_company = job_company_result.scalar_one_or_none()
        
        if job_with_company and job_with_company.company:
            # Récupérer le template par défaut "application_received"
            template_result = await db.execute(
                select(EmailTemplate).where(
                    EmailTemplate.company_id == job_with_company.company_id,
                    EmailTemplate.type == EmailTemplateType.APPLICATION_RECEIVED,
                    EmailTemplate.is_default == True,
                    EmailTemplate.is_active == True
                )
            )
            template = template_result.scalar_one_or_none()
            
            if template:
                # Préparer les variables pour le template
                variables = {
                    "candidate_name": f"{current_user.first_name} {current_user.last_name}",
                    "candidate_first_name": current_user.first_name,
                    "candidate_last_name": current_user.last_name,
                    "candidate_email": current_user.email,
                    "job_title": job.title,
                    "job_location": job.location or "Non spécifiée",
                    "company_name": job_with_company.company.name,
                    "application_date": datetime.utcnow().strftime("%d/%m/%Y"),
                    "application_status": "Candidature reçue"
                }
                
                # Envoyer l'email
                email_sent = await email_service.send_from_template(
                    template_id=template.id,
                    to_email=current_user.email,
                    variables=variables,
                    db=db
                )
                
                if email_sent:
                    logger.info(f"✅ Application confirmation email sent to {current_user.email}")
                else:
                    logger.warning(f"⚠️ Failed to send application confirmation email to {current_user.email}")
            else:
                logger.debug(f"No default 'application_received' template found for company {job_with_company.company_id}")
    except Exception as e:
        logger.error(f"❌ Error sending application confirmation email: {e}")
        # Ne pas bloquer si l'envoi d'email échoue

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
    
    # ── Sync vers Targetym : notifier qu'une candidature a été reçue ──
    try:
        print(f'[TARGETYM-WEBHOOK] Checking webhook conditions for application {application.id}, job_id={job.id}')
        print(f'[TARGETYM-WEBHOOK] job.targetym_job_posting_id={job.targetym_job_posting_id}')

        if job.targetym_job_posting_id:
            from app.models.base import Company
            import re as _re
            import httpx
            import os as _os

            company_result = await db.execute(
                select(Company).where(Company.id == job.company_id)
            )
            company_obj = company_result.scalar_one_or_none()

            print(f'[TARGETYM-WEBHOOK] company_id={job.company_id}, company_found={company_obj is not None}')
            if company_obj:
                print(f'[TARGETYM-WEBHOOK] targetym_tenant_id={company_obj.targetym_tenant_id}, has_api_key={bool(company_obj.targetym_api_key)}')

            if company_obj and company_obj.targetym_tenant_id and company_obj.targetym_api_key:
                _raw = _os.getenv('TARGETYM_API_URL', '') or ''
                _m = _re.search(r'https?://[^\s]+', _raw)
                targetym_url = _m.group(0).rstrip('/') if _m else 'https://web-production-06c3.up.railway.app'
                print(f'[TARGETYM-WEBHOOK] Sending webhook to {targetym_url}')

                webhook_payload = {
                    'tenant_id': company_obj.targetym_tenant_id,
                    'api_key': company_obj.targetym_api_key,
                    'application': {
                        'targetym_job_posting_id': job.targetym_job_posting_id,
                        'intowork_application_id': application.id,
                        'first_name': current_user.first_name or '',
                        'last_name': current_user.last_name or '',
                        'email': current_user.email,
                        'phone': candidate.phone,
                        'location': candidate.location,
                        'cover_letter': application_data.cover_letter,
                        'cv_url': cv_url,
                        'source': 'IntoWork',
                    }
                }
                async with httpx.AsyncClient(timeout=10) as client:
                    resp = await client.post(
                        f'{targetym_url}/api/integrations/intowork/webhook/new-application',
                        json=webhook_payload
                    )
                print(f'[TARGETYM-WEBHOOK] Response: {resp.status_code} — {resp.text[:300]}')
                logger.info(f'Targetym new-application webhook: {resp.status_code} for application {application.id}')
            else:
                print(f'[TARGETYM-WEBHOOK] Skipped: company not linked to Targetym (no tenant_id/api_key)')
        else:
            print(f'[TARGETYM-WEBHOOK] Skipped: job has no targetym_job_posting_id')
    except Exception as _e:
        print(f'[TARGETYM-WEBHOOK] ERROR (non-blocking): {_e}')
        logger.warning(f'Targetym new-application webhook failed (non-blocking): {_e}')

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
    from app.models.base import ApplicationStatus

    # Récupérer le profil candidat (candidate_id ≠ user_id)
    candidate_result = await db.execute(
        select(Candidate).filter(Candidate.user_id == current_user.id)
    )
    candidate = candidate_result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profil candidat introuvable")

    result = await db.execute(
        select(JobApplication).filter(
            JobApplication.id == application_id,
            JobApplication.candidate_id == candidate.id,
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")

    # Bloquer uniquement si déjà accepté
    if application.status == ApplicationStatus.ACCEPTED:
        raise HTTPException(
            status_code=400,
            detail="Impossible de retirer une candidature déjà acceptée"
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

                await create_notification(
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
            
            # Envoyer un email selon le nouveau statut
            try:
                from app.models.base import EmailTemplate, EmailTemplateType, Company
                
                # Mapping des statuts vers les types de templates
                status_to_template_type = {
                    ApplicationStatus.INTERVIEW: EmailTemplateType.INTERVIEW_INVITATION,
                    ApplicationStatus.ACCEPTED: EmailTemplateType.OFFER,
                    ApplicationStatus.REJECTED: EmailTemplateType.REJECTION
                }
                
                template_type = status_to_template_type.get(new_status)
                
                if template_type:
                    # Récupérer le job avec la company
                    job_company_result = await db.execute(
                        select(Job).options(selectinload(Job.company)).filter(Job.id == application.job_id)
                    )
                    job_with_company = job_company_result.scalar_one_or_none()
                    
                    if job_with_company and job_with_company.company:
                        # Récupérer le template par défaut pour ce type
                        template_result = await db.execute(
                            select(EmailTemplate).where(
                                EmailTemplate.company_id == job_with_company.company_id,
                                EmailTemplate.type == template_type,
                                EmailTemplate.is_default == True,
                                EmailTemplate.is_active == True
                            )
                        )
                        template = template_result.scalar_one_or_none()
                        
                        if template:
                            # Récupérer les infos du candidat
                            candidate_user_result = await db.execute(
                                select(User).filter(User.id == application.candidate.user_id)
                            )
                            candidate_user = candidate_user_result.scalar_one_or_none()
                            
                            if candidate_user:
                                # Préparer les variables pour le template
                                variables = {
                                    "candidate_name": f"{candidate_user.first_name} {candidate_user.last_name}",
                                    "candidate_first_name": candidate_user.first_name,
                                    "candidate_last_name": candidate_user.last_name,
                                    "candidate_email": candidate_user.email,
                                    "job_title": application.job.title,
                                    "job_location": application.job.location or "Non spécifiée",
                                    "company_name": job_with_company.company.name,
                                    "application_status": new_status.value,
                                    "application_date": application.applied_at.strftime("%d/%m/%Y") if application.applied_at else "",
                                    "recruiter_name": current_user.name or current_user.email,
                                    "recruiter_email": current_user.email
                                }
                                
                                # Envoyer l'email
                                email_sent = await email_service.send_from_template(
                                    template_id=template.id,
                                    to_email=candidate_user.email,
                                    variables=variables,
                                    db=db
                                )
                                
                                if email_sent:
                                    logger.info(f"✅ Status change email ({template_type.value}) sent to {candidate_user.email}")
                                else:
                                    logger.warning(f"⚠️ Failed to send status change email to {candidate_user.email}")
                        else:
                            logger.debug(f"No default template of type '{template_type.value}' found for company {job_with_company.company_id}")
            except Exception as e:
                logger.error(f"❌ Error sending status change email: {e}")
                # Ne pas bloquer si l'envoi d'email échoue
        
        # ── Targetym : synchroniser le stage du Kanban (tous statuts) ────────
        try:
            import re as _re, os as _os
            import httpx
            from app.models.base import Company as _Company
            _company_result = await db.execute(
                select(_Company).where(_Company.id == employer.company_id)
            )
            _company = _company_result.scalar_one_or_none()
            if _company and _company.targetym_tenant_id and _company.targetym_api_key:
                _raw = _os.getenv('TARGETYM_API_URL', '') or ''
                _m = _re.search(r'https?://[^\s]+', _raw)
                _targetym_url = _m.group(0).rstrip('/') if _m else 'https://web-production-06c3.up.railway.app'
                async with httpx.AsyncClient(timeout=10) as _client:
                    _resp = await _client.put(
                        f'{_targetym_url}/api/integrations/intowork/webhook/update-application-stage',
                        json={
                            'tenant_id': _company.targetym_tenant_id,
                            'api_key': _company.targetym_api_key,
                            'intowork_application_id': application.id,
                            'intowork_status': new_status.value,
                        }
                    )
                    print(f'[TARGETYM-STAGE-WEBHOOK] {new_status.value} → {_resp.status_code} {_resp.text[:200]}')
        except Exception as _e:
            logger.warning(f'Targetym stage-update webhook failed (non-blocking): {_e}')
        # ────────────────────────────────────────────────────────────────────

        # ── Flux Targetym : candidat accepté → employé créé ──────────────
        if new_status == ApplicationStatus.ACCEPTED:
            try:
                from app.services.targetym_service import notify_candidate_hired
                from app.models.base import Company

                # Récupérer la company liée (avec les champs Targetym)
                company_result = await db.execute(
                    select(Company).where(Company.id == employer.company_id)
                )
                company = company_result.scalar_one_or_none()

                if (company and company.targetym_tenant_id and company.targetym_api_key):
                    # Récupérer les infos du candidat
                    candidate_user_result = await db.execute(
                        select(User).where(User.id == application.candidate.user_id)
                    )
                    candidate_user = candidate_user_result.scalar_one_or_none()

                    if candidate_user:
                        import asyncio
                        asyncio.create_task(
                            notify_candidate_hired(
                                targetym_tenant_id=company.targetym_tenant_id,
                                targetym_api_key=company.targetym_api_key,
                                first_name=candidate_user.first_name,
                                last_name=candidate_user.last_name,
                                email=candidate_user.email,
                                job_title=application.job.title,
                                phone=getattr(application.candidate, 'phone', None),
                                location=getattr(application.candidate, 'location', None),
                                intowork_application_id=application.id,
                                intowork_company_id=employer.company_id,
                            )
                        )
            except Exception as e:
                logger.error(f"Erreur flux Targetym (candidat accepté) : {e}")
                # Ne pas bloquer si l'intégration échoue
        # ──────────────────────────────────────────────────────────────────

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
