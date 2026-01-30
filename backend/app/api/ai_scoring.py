"""
API endpoints pour le scoring IA des candidatures
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.auth import require_user
from app.models.base import User, UserRole, Employer, JobApplication, Job, Candidate
from app.services.ai_scoring import ai_service

router = APIRouter()


# ===== SCHEMAS =====

class AIScoreDetails(BaseModel):
    """Détails du scoring IA"""
    score: float
    strengths: List[str]
    weaknesses: List[str]
    skills_match: dict
    experience_match: str
    recommendation: str
    error: Optional[str] = None


class ApplicationWithScore(BaseModel):
    """Candidature avec score IA"""
    id: int
    job_id: int
    candidate_id: int
    candidate_name: str
    candidate_email: str
    status: str
    applied_at: datetime
    ai_score: Optional[float] = None
    ai_score_details: Optional[dict] = None
    ai_analyzed_at: Optional[datetime] = None
    cv_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class ScoreApplicationRequest(BaseModel):
    """Requête pour scorer une candidature"""
    application_id: int


class ScoreApplicationResponse(BaseModel):
    """Réponse après scoring"""
    success: bool
    application_id: int
    ai_score: float
    ai_score_details: dict
    message: str


class BulkScoreRequest(BaseModel):
    """Requête pour scorer toutes les candidatures d'une offre"""
    job_id: int


class BulkScoreResponse(BaseModel):
    """Réponse après scoring en masse"""
    success: bool
    job_id: int
    scored_count: int
    failed_count: int
    message: str


class ScoredApplicationsListResponse(BaseModel):
    """Liste des candidatures scorées"""
    applications: List[ApplicationWithScore]
    total: int
    page: int
    limit: int
    total_pages: int


# ===== ENDPOINTS =====

@router.post("/score-application", response_model=ScoreApplicationResponse)
async def score_single_application(
    request: ScoreApplicationRequest,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Score une candidature individuelle avec l'IA
    Accessible uniquement aux employeurs pour leurs propres offres
    """
    
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")
    
    # Récupérer l'employeur
    employer_result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur introuvable")
    
    # Récupérer la candidature avec relations
    stmt = (
        select(JobApplication)
        .options(
            selectinload(JobApplication.job),
            selectinload(JobApplication.candidate).selectinload(Candidate.user),
            selectinload(JobApplication.candidate).selectinload(Candidate.experiences),
            selectinload(JobApplication.candidate).selectinload(Candidate.skills)
        )
        .filter(JobApplication.id == request.application_id)
    )
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    
    # Vérifier que l'offre appartient à l'employeur
    if application.job.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Cette candidature ne vous appartient pas")
    
    # Extraire les données pour l'IA
    job = application.job
    candidate = application.candidate
    
    # Construire le texte du CV (simplif pour l'instant, TODO: extraire du PDF)
    cv_text = f"""
Nom: {candidate.user.first_name} {candidate.user.last_name}
Email: {candidate.user.email}
Téléphone: {candidate.phone or 'Non renseigné'}
Localisation: {candidate.location or 'Non renseignée'}
Titre: {candidate.title or 'Non renseigné'}
Résumé: {candidate.summary or 'Non renseigné'}
Années d'expérience: {candidate.years_experience or 0}
"""
    
    # Ajouter les expériences
    candidate_experience = ""
    if candidate.experiences:
        candidate_experience = "\n".join([
            f"- {exp.job_title} chez {exp.company} ({exp.start_date} - {exp.end_date or 'Présent'})"
            for exp in candidate.experiences
        ])
    
    # Ajouter les compétences
    candidate_skills = ""
    if candidate.skills:
        candidate_skills = ", ".join([skill.name for skill in candidate.skills])
    
    # Appeler l'IA pour le scoring
    try:
        score_result = await ai_service.score_candidate(
            job_title=job.title,
            job_description=job.description,
            job_requirements=job.requirements,
            job_responsibilities=job.responsibilities,
            candidate_cv_text=cv_text,
            candidate_experience=candidate_experience,
            candidate_skills=candidate_skills
        )
        
        # Mettre à jour la candidature avec le score
        application.ai_score = score_result["score"]
        application.ai_score_details = score_result
        application.ai_analyzed_at = datetime.utcnow()
        
        await db.commit()
        
        return ScoreApplicationResponse(
            success=True,
            application_id=application.id,
            ai_score=score_result["score"],
            ai_score_details=score_result,
            message="Candidature scorée avec succès"
        )
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors du scoring: {str(e)}")


@router.post("/score-job-applications", response_model=BulkScoreResponse)
async def score_all_job_applications(
    request: BulkScoreRequest,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Score toutes les candidatures d'une offre avec l'IA
    """
    
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")
    
    # Récupérer l'employeur
    employer_result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur introuvable")
    
    # Vérifier que l'offre appartient à l'employeur
    job_result = await db.execute(
        select(Job).filter(and_(Job.id == request.job_id, Job.employer_id == employer.id))
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable ou non autorisée")
    
    # Récupérer toutes les candidatures non scorées
    stmt = (
        select(JobApplication)
        .options(
            selectinload(JobApplication.candidate).selectinload(Candidate.user),
            selectinload(JobApplication.candidate).selectinload(Candidate.experiences),
            selectinload(JobApplication.candidate).selectinload(Candidate.skills)
        )
        .filter(
            and_(
                JobApplication.job_id == request.job_id,
                JobApplication.ai_score == None  # Seulement les non-scorées
            )
        )
    )
    result = await db.execute(stmt)
    applications = result.scalars().all()
    
    if not applications:
        return BulkScoreResponse(
            success=True,
            job_id=request.job_id,
            scored_count=0,
            failed_count=0,
            message="Aucune candidature à scorer (toutes déjà analysées)"
        )
    
    scored_count = 0
    failed_count = 0
    
    # Scorer chaque candidature
    for application in applications:
        try:
            candidate = application.candidate
            
            cv_text = f"""
Nom: {candidate.user.first_name} {candidate.user.last_name}
Email: {candidate.user.email}
Téléphone: {candidate.phone or 'Non renseigné'}
Localisation: {candidate.location or 'Non renseignée'}
Titre: {candidate.title or 'Non renseigné'}
Résumé: {candidate.summary or 'Non renseigné'}
Années d'expérience: {candidate.years_experience or 0}
"""
            
            candidate_experience = ""
            if candidate.experiences:
                candidate_experience = "\n".join([
                    f"- {exp.job_title} chez {exp.company} ({exp.start_date} - {exp.end_date or 'Présent'})"
                    for exp in candidate.experiences
                ])
            
            candidate_skills = ""
            if candidate.skills:
                candidate_skills = ", ".join([skill.name for skill in candidate.skills])
            
            score_result = await ai_service.score_candidate(
                job_title=job.title,
                job_description=job.description,
                job_requirements=job.requirements,
                job_responsibilities=job.responsibilities,
                candidate_cv_text=cv_text,
                candidate_experience=candidate_experience,
                candidate_skills=candidate_skills
            )
            
            application.ai_score = score_result["score"]
            application.ai_score_details = score_result
            application.ai_analyzed_at = datetime.utcnow()
            
            scored_count += 1
            
        except Exception as e:
            print(f"Erreur lors du scoring de la candidature {application.id}: {e}")
            failed_count += 1
    
    try:
        await db.commit()
        
        return BulkScoreResponse(
            success=True,
            job_id=request.job_id,
            scored_count=scored_count,
            failed_count=failed_count,
            message=f"{scored_count} candidatures scorées avec succès, {failed_count} échecs"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la sauvegarde: {str(e)}")


@router.get("/scored-applications/{job_id}", response_model=ScoredApplicationsListResponse)
async def get_scored_applications(
    job_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by_score: bool = Query(True),
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupérer les candidatures scorées d'une offre, triées par score IA
    """
    
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")
    
    # Récupérer l'employeur
    employer_result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur introuvable")
    
    # Vérifier que l'offre appartient à l'employeur
    job_result = await db.execute(
        select(Job).filter(and_(Job.id == job_id, Job.employer_id == employer.id))
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable ou non autorisée")
    
    # Compter le total
    count_stmt = select(JobApplication).filter(JobApplication.job_id == job_id)
    count_result = await db.execute(count_stmt)
    total = len(count_result.scalars().all())
    
    # Construire la query avec tri
    stmt = (
        select(JobApplication)
        .options(
            selectinload(JobApplication.candidate).selectinload(Candidate.user)
        )
        .filter(JobApplication.job_id == job_id)
    )
    
    if sort_by_score:
        # Trier par score décroissant (NULL en dernier)
        stmt = stmt.order_by(JobApplication.ai_score.desc().nullslast())
    else:
        stmt = stmt.order_by(JobApplication.applied_at.desc())
    
    # Pagination
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    
    result = await db.execute(stmt)
    applications = result.scalars().all()
    
    # Formater la réponse
    applications_data = []
    for app in applications:
        candidate_user = app.candidate.user if app.candidate else None
        applications_data.append(ApplicationWithScore(
            id=app.id,
            job_id=app.job_id,
            candidate_id=app.candidate_id,
            candidate_name=f"{candidate_user.first_name} {candidate_user.last_name}" if candidate_user else "Inconnu",
            candidate_email=candidate_user.email if candidate_user else "",
            status=app.status.value,
            applied_at=app.applied_at,
            ai_score=app.ai_score,
            ai_score_details=app.ai_score_details,
            ai_analyzed_at=app.ai_analyzed_at,
            cv_url=app.candidate.cv_url if app.candidate else None
        ))
    
    total_pages = (total + limit - 1) // limit
    
    return ScoredApplicationsListResponse(
        applications=applications_data,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )
