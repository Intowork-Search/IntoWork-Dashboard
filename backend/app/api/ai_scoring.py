"""
API endpoints pour le scoring IA des candidatures
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict
import os
import io
import json
import httpx

from app.database import get_db
from app.auth import require_user
from app.models.base import User, UserRole, Employer, JobApplication, Job, Candidate
from app.services.ai_scoring import get_ai_service


async def extract_cv_text(cv_url: Optional[str]) -> str:
    """Extrait le texte d'un fichier CV (PDF, DOCX, DOC) depuis Cloudinary ou le disque local."""
    if not cv_url:
        return ""
    try:
        file_bytes: Optional[bytes] = None

        if cv_url.startswith("http"):
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(cv_url)
                if resp.status_code == 200:
                    file_bytes = resp.content
        else:
            base_dir = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
            local_path = os.path.normpath(
                os.path.join(base_dir, cv_url.replace("\\\\", "/").replace("\\", "/"))
            )
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    file_bytes = f.read()

        if not file_bytes:
            return ""

        # Détecter le format via magic bytes
        if file_bytes.startswith(b"%PDF"):
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            pages_text = [p.extract_text() for p in reader.pages if p.extract_text()]
            extracted = "\n".join(pages_text).strip()
        elif file_bytes.startswith(b"PK\x03\x04"):
            # DOCX ou ODT (format ZIP)
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            extracted = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        else:
            # DOC (OLE2) — extraction basique du texte brut
            extracted = file_bytes.decode("latin-1", errors="ignore")
            # Filtrer les caractères non imprimables
            import re
            extracted = re.sub(r"[^\x20-\x7E\xA0-\xFF\n]", " ", extracted)
            extracted = re.sub(r" {3,}", " ", extracted).strip()

        return extracted[:8000]
    except Exception:
        return ""

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
    model_config = ConfigDict(from_attributes=True)

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


class JobMatchResult(BaseModel):
    """Résultat de matching IA pour une offre"""
    job_id: int
    job_title: str
    company_name: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = "XAF"
    match_score: float
    match_reasons: List[str]
    missing_skills: List[str]
    posted_at: Optional[datetime] = None


class JobMatchesResponse(BaseModel):
    """Liste des offres recommandées pour un candidat"""
    matches: List[JobMatchResult]
    total_jobs_analyzed: int
    generated_at: datetime


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

    # Extraire le contenu du fichier PDF si disponible
    pdf_content = await extract_cv_text(candidate.cv_url)

    # Construire le texte du CV (profil + contenu PDF)
    cv_text = f"""
Nom: {candidate.user.first_name} {candidate.user.last_name}
Email: {candidate.user.email}
Téléphone: {candidate.phone or 'Non renseigné'}
Localisation: {candidate.location or 'Non renseignée'}
Titre: {candidate.title or 'Non renseigné'}
Résumé: {candidate.summary or 'Non renseigné'}
Années d'expérience: {candidate.years_experience or 0}
"""
    if pdf_content:
        cv_text += f"\n\n--- Contenu extrait du fichier CV ---\n{pdf_content}"

    # Ajouter les expériences
    candidate_experience = ""
    if candidate.experiences:
        candidate_experience = "\n".join([
            f"- {exp.title} chez {exp.company} ({exp.start_date} - {exp.end_date or 'Présent'})"
            for exp in candidate.experiences
        ])

    # Ajouter les compétences
    candidate_skills = ""
    if candidate.skills:
        candidate_skills = ", ".join([skill.name for skill in candidate.skills])

    # Appeler l'IA pour le scoring
    try:
        score_result = await get_ai_service().score_candidate(
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
        application.ai_analyzed_at = datetime.now(timezone.utc)
        
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

            # Extraire le contenu du fichier PDF si disponible
            pdf_content = await extract_cv_text(candidate.cv_url)

            cv_text = f"""
Nom: {candidate.user.first_name} {candidate.user.last_name}
Email: {candidate.user.email}
Téléphone: {candidate.phone or 'Non renseigné'}
Localisation: {candidate.location or 'Non renseignée'}
Titre: {candidate.title or 'Non renseigné'}
Résumé: {candidate.summary or 'Non renseigné'}
Années d'expérience: {candidate.years_experience or 0}
"""
            if pdf_content:
                cv_text += f"\n\n--- Contenu extrait du fichier CV ---\n{pdf_content}"

            candidate_experience = ""
            if candidate.experiences:
                candidate_experience = "\n".join([
                    f"- {exp.title} chez {exp.company} ({exp.start_date} - {exp.end_date or 'Présent'})"
                    for exp in candidate.experiences
                ])

            candidate_skills = ""
            if candidate.skills:
                candidate_skills = ", ".join([skill.name for skill in candidate.skills])

            score_result = await get_ai_service().score_candidate(
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
            application.ai_analyzed_at = datetime.now(timezone.utc)
            
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
    
    # Compter le total (COUNT en DB, pas en mémoire)
    count_stmt = select(func.count()).select_from(JobApplication).filter(JobApplication.job_id == job_id)
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0
    
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


@router.get("/candidate/job-matches", response_model=JobMatchesResponse)
async def get_candidate_job_matches(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retourne les offres d'emploi actives les mieux matchées pour le candidat connecté.
    Utilise Claude pour analyser le profil et classer les offres.
    Accessible uniquement aux candidats.
    """
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=403, detail="Accès réservé aux candidats")

    # Charger le profil candidat complet
    stmt = (
        select(Candidate)
        .options(
            selectinload(Candidate.experiences),
            selectinload(Candidate.educations),
            selectinload(Candidate.skills),
        )
        .filter(Candidate.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profil candidat introuvable")

    # Charger les offres actives (max 30 pour ne pas surcharger le prompt)
    jobs_stmt = (
        select(Job)
        .options(selectinload(Job.company))
        .filter(Job.status == "published")
        .order_by(Job.posted_at.desc().nullslast())
        .limit(30)
    )
    jobs_result = await db.execute(jobs_stmt)
    active_jobs = jobs_result.scalars().all()

    if not active_jobs:
        return JobMatchesResponse(
            matches=[],
            total_jobs_analyzed=0,
            generated_at=datetime.now(timezone.utc)
        )

    # Construire le profil candidat pour le prompt
    candidate_profile = f"""Nom: {current_user.first_name} {current_user.last_name}
Titre recherché: {candidate.title or 'Non renseigné'}
Résumé: {candidate.summary or 'Non renseigné'}
Années d'expérience: {candidate.years_experience or 0}
Localisation: {candidate.location or 'Non renseignée'}
"""
    if candidate.experiences:
        candidate_profile += "\nExpériences:\n" + "\n".join(
            f"- {e.title} chez {e.company} ({e.start_date} - {e.end_date or 'Présent'}): {e.description or ''}"
            for e in candidate.experiences
        )
    if candidate.educations:
        candidate_profile += "\n\nFormation:\n" + "\n".join(
            f"- {e.degree} à {e.school} ({e.end_date})"
            for e in candidate.educations
        )
    if candidate.skills:
        skills_by_cat: dict = {}
        for s in candidate.skills:
            cat = s.category.value if hasattr(s.category, 'value') else str(s.category)
            skills_by_cat.setdefault(cat, []).append(s.name)
        candidate_profile += "\n\nCompétences:\n" + "\n".join(
            f"- {cat}: {', '.join(names)}" for cat, names in skills_by_cat.items()
        )

    # Extraire le texte du CV si disponible
    cv_text = await extract_cv_text(candidate.cv_url)
    if cv_text:
        candidate_profile += f"\n\n--- CV uploadé ---\n{cv_text[:3000]}"

    # Construire la liste des offres pour le prompt
    jobs_list = ""
    for i, job in enumerate(active_jobs):
        company_name = job.company.name if job.company else "Entreprise inconnue"
        jobs_list += f"""
[JOB_{job.id}]
Titre: {job.title}
Entreprise: {company_name}
Type: {job.job_type}
Lieu: {job.location or 'Non précisé'} ({job.location_type})
Description (résumé): {(job.description or '')[:400]}
Exigences: {(job.requirements or '')[:300]}
"""

    prompt = f"""Tu es un expert en recrutement. Analyse le profil candidat et classe les offres d'emploi par pertinence.

=== PROFIL CANDIDAT ===
{candidate_profile}

=== OFFRES DISPONIBLES ===
{jobs_list}

=== INSTRUCTIONS ===
Sélectionne les {min(limit, len(active_jobs))} offres les plus pertinentes pour ce candidat.
Pour chaque offre retenue, fournis un score de matching (0-100) et des explications courtes.

Réponds UNIQUEMENT en JSON valide (sans markdown) avec cette structure exacte:
{{
  "matches": [
    {{
      "job_id": 123,
      "match_score": 87.5,
      "match_reasons": ["Raison 1", "Raison 2", "Raison 3"],
      "missing_skills": ["Compétence manquante 1"]
    }}
  ]
}}

Ordonne les matches du score le plus élevé au plus faible. Maximum {min(limit, len(active_jobs))} résultats."""

    try:
        ai_service = get_ai_service()
        message = await ai_service.client.messages.create(
            model=ai_service.model,
            max_tokens=1500,
            temperature=0.2,
            system="Tu es un expert en recrutement qui analyse la compatibilité entre profils candidats et offres d'emploi.",
            messages=[{"role": "user", "content": prompt}]
        )
        response_text = message.content[0].text

        try:
            ai_result = json.loads(response_text)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                ai_result = json.loads(json_match.group())
            else:
                raise ValueError("Réponse IA non parseable")

        # Construire un index des offres pour enrichissement
        jobs_index = {job.id: job for job in active_jobs}

        matches = []
        for m in ai_result.get("matches", []):
            job = jobs_index.get(m.get("job_id"))
            if not job:
                continue
            company_name = job.company.name if job.company else "Entreprise inconnue"
            matches.append(JobMatchResult(
                job_id=job.id,
                job_title=job.title,
                company_name=company_name,
                location=job.location,
                job_type=job.job_type,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                currency=job.currency or "XAF",
                match_score=float(m.get("match_score", 0)),
                match_reasons=m.get("match_reasons", []),
                missing_skills=m.get("missing_skills", []),
                posted_at=job.posted_at,
            ))

        return JobMatchesResponse(
            matches=matches,
            total_jobs_analyzed=len(active_jobs),
            generated_at=datetime.now(timezone.utc)
        )

    except Exception as e:
        from app.logging_config import logger
        logger.error(f"Erreur matching IA candidat: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du matching IA. Réessayez dans quelques instants.")


# ─────────────────────────────────────────────────────────────────────────────
# Préparation entretien IA
# ─────────────────────────────────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    question: str
    tip: str
    category: str  # "technical" | "behavioral" | "motivation" | "company"


class InterviewPrepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    job_title: str
    company_name: str
    questions: List[InterviewQuestion]
    general_advice: List[str]
    generated_at: datetime


class InterviewPrepRequest(BaseModel):
    job_id: int


@router.post("/interview-prep", response_model=InterviewPrepResponse)
async def generate_interview_prep(
    request: InterviewPrepRequest,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Génère des questions d'entretien personnalisées pour un candidat et une offre donnée.
    Accessible uniquement aux candidats.
    """
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=403, detail="Accès réservé aux candidats")

    # Charger le profil candidat
    stmt = (
        select(Candidate)
        .options(
            selectinload(Candidate.experiences),
            selectinload(Candidate.educations),
            selectinload(Candidate.skills),
        )
        .filter(Candidate.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profil candidat introuvable")

    # Charger l'offre
    job_stmt = (
        select(Job)
        .options(selectinload(Job.company))
        .filter(Job.id == request.job_id)
    )
    job_result = await db.execute(job_stmt)
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    company_name = job.company.name if job.company else "l'entreprise"

    # Construire le contexte candidat
    candidate_context = f"""Nom: {current_user.first_name} {current_user.last_name}
Titre: {candidate.title or 'Non renseigné'}
Années d'expérience: {candidate.years_experience or 0}
Localisation: {candidate.location or 'Non renseignée'}
"""
    if candidate.experiences:
        candidate_context += "\nExpériences:\n" + "\n".join(
            f"- {e.title} chez {e.company} ({e.start_date} → {e.end_date or 'Présent'}): {e.description or ''}"
            for e in candidate.experiences
        )
    if candidate.educations:
        candidate_context += "\n\nFormations:\n" + "\n".join(
            f"- {e.degree} à {e.school} ({e.end_date})"
            for e in candidate.educations
        )
    if candidate.skills:
        all_skills = [s.name for s in candidate.skills]
        candidate_context += f"\n\nCompétences: {', '.join(all_skills)}"

    # Contexte offre
    job_context = f"""Titre: {job.title}
Entreprise: {company_name}
Type: {job.job_type} | Mode: {job.location_type} | Lieu: {job.location or 'Non précisé'}
Description: {(job.description or '')[:600]}
Exigences: {(job.requirements or '')[:400]}
Responsabilités: {(job.responsibilities or '')[:400]}
"""

    prompt = f"""Tu es un coach en préparation d'entretien d'embauche expert.
Un candidat postule pour ce poste et veut se préparer.

=== PROFIL CANDIDAT ===
{candidate_context}

=== OFFRE VISÉE ===
{job_context}

=== INSTRUCTIONS ===
Génère exactement 12 questions d'entretien personnalisées réparties en 4 catégories :
- "technical" : 4 questions techniques liées aux compétences requises pour CE poste
- "behavioral" : 3 questions comportementales (méthode STAR)
- "motivation" : 3 questions sur la motivation pour CE poste et CETTE entreprise
- "company" : 2 questions que le candidat devrait poser à l'employeur

Pour chaque question, fournis un conseil court et pratique (tip) en tenant compte du profil du candidat.
Fournis aussi 3 conseils généraux pour cet entretien spécifique.

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{{
  "questions": [
    {{
      "question": "...",
      "tip": "Conseil personnalisé court et actionnable",
      "category": "technical|behavioral|motivation|company"
    }}
  ],
  "general_advice": ["Conseil 1", "Conseil 2", "Conseil 3"]
}}"""

    try:
        ai_service = get_ai_service()
        message = await ai_service.client.messages.create(
            model=ai_service.model,
            max_tokens=2500,
            temperature=0.3,
            system="Tu es un expert en coaching d'entretien d'embauche. Tu génères des questions personnalisées et des conseils pratiques.",
            messages=[{"role": "user", "content": prompt}]
        )
        response_text = message.content[0].text

        try:
            ai_result = json.loads(response_text)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                ai_result = json.loads(json_match.group())
            else:
                raise ValueError("Réponse IA non parseable")

        questions = [
            InterviewQuestion(
                question=q.get("question", ""),
                tip=q.get("tip", ""),
                category=q.get("category", "behavioral"),
            )
            for q in ai_result.get("questions", [])
            if q.get("question")
        ]

        return InterviewPrepResponse(
            job_title=job.title,
            company_name=company_name,
            questions=questions,
            general_advice=ai_result.get("general_advice", []),
            generated_at=datetime.now(timezone.utc),
        )

    except Exception as e:
        from app.logging_config import logger
        logger.error(f"Erreur préparation entretien: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la génération. Réessayez dans quelques instants.")

