"""
API de génération de rapports PDF — IntoWork
Endpoints pour candidat, employeur et admin.
"""

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import require_user
from app.database import get_db
from app.models.base import (
    ApplicationStatus,
    Candidate,
    Company,
    Employer,
    Job,
    JobApplication,
    JobStatus,
    Notification,
    User,
    UserRole,
)
from app.rate_limiter import limiter
from app.services.report_service import (
    generate_admin_report,
    generate_candidate_report,
    generate_employer_report,
)

router = APIRouter()


def _pdf_response(pdf_bytes: bytes, filename: str) -> Response:
    """Construire une réponse HTTP avec le PDF en téléchargement."""
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ═══════════════════════════════════════════════════════════════
# RAPPORT CANDIDAT
# ═══════════════════════════════════════════════════════════════

@router.get("/candidate/pdf")
@limiter.limit("5/minute")
async def export_candidate_pdf(
    request: Request,
    current_user: Annotated[User, Depends(require_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Générer et télécharger le rapport PDF du candidat connecté."""
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Réservé aux candidats")

    # Charger le profil candidat avec relations
    result = await db.execute(
        select(Candidate)
        .filter(Candidate.user_id == current_user.id)
        .options(
            selectinload(Candidate.experiences),
            selectinload(Candidate.educations),
            selectinload(Candidate.skills),
        )
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profil candidat introuvable")

    # Stats
    app_count = (await db.execute(
        select(func.count()).select_from(JobApplication).filter(JobApplication.candidate_id == candidate.id)
    )).scalar() or 0

    interview_count = (await db.execute(
        select(func.count()).select_from(JobApplication).filter(
            JobApplication.candidate_id == candidate.id,
            JobApplication.status == ApplicationStatus.INTERVIEW,
        )
    )).scalar() or 0

    available_jobs = (await db.execute(
        select(func.count()).select_from(Job).filter(Job.status == "active")
    )).scalar() or 0

    # Complétion profil
    filled = sum(1 for v in [
        current_user.first_name, current_user.last_name,
        candidate.phone, candidate.location, candidate.title, candidate.summary,
    ] if v)
    has_exp = len(candidate.experiences) > 0
    has_edu = len(candidate.educations) > 0
    has_skills = len(candidate.skills) > 0
    profile_completion = min(100, int((filled / 6) * 60 + has_exp * 15 + has_edu * 15 + has_skills * 10))

    stats = [
        {"title": "Candidatures", "value": str(app_count)},
        {"title": "Entretiens", "value": str(interview_count)},
        {"title": "Offres disponibles", "value": str(available_jobs)},
        {"title": "Profil", "value": f"{profile_completion}%"},
    ]

    skills = [{"name": s.name, "category": s.category.value if hasattr(s.category, 'value') else s.category, "level": s.level} for s in candidate.skills]
    experiences = [{"title": e.title, "company": e.company, "start_date": e.start_date, "end_date": e.end_date} for e in candidate.experiences]
    educations = [{"degree": e.degree, "school": e.school, "start_date": e.start_date, "end_date": e.end_date} for e in candidate.educations]

    pdf = generate_candidate_report(
        user_name=f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email,
        email=current_user.email,
        title=candidate.title,
        location=candidate.location,
        profile_completion=profile_completion,
        stats=stats,
        skills=skills,
        experiences=experiences,
        educations=educations,
        activities=[],
    )

    filename = f"intowork_rapport_candidat_{datetime.now().strftime('%Y%m%d')}.pdf"
    return _pdf_response(pdf, filename)


# ═══════════════════════════════════════════════════════════════
# RAPPORT EMPLOYEUR
# ═══════════════════════════════════════════════════════════════

@router.get("/employer/pdf")
@limiter.limit("5/minute")
async def export_employer_pdf(
    request: Request,
    current_user: Annotated[User, Depends(require_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Générer et télécharger le rapport PDF recrutement de l'employeur."""
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Réservé aux employeurs")

    result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id).options(selectinload(Employer.company))
    )
    employer = result.scalar_one_or_none()
    if not employer or not employer.company:
        raise HTTPException(status_code=404, detail="Profil employeur introuvable")

    company = employer.company

    # Stats agrégées en 1 requête
    agg = (await db.execute(
        select(
            func.count().label("total"),
            func.count().filter(JobApplication.status == ApplicationStatus.INTERVIEW).label("interviews"),
            func.count().filter(JobApplication.status.in_([
                ApplicationStatus.REJECTED, ApplicationStatus.ACCEPTED,
                ApplicationStatus.INTERVIEW, ApplicationStatus.SHORTLISTED, ApplicationStatus.VIEWED,
            ])).label("responded"),
        ).select_from(JobApplication).join(Job).filter(Job.employer_id == employer.id)
    )).one()

    active_jobs_count = (await db.execute(
        select(func.count()).select_from(Job).filter(Job.employer_id == employer.id, Job.status == JobStatus.PUBLISHED)
    )).scalar() or 0

    response_rate = round((agg.responded / agg.total) * 100) if agg.total else 0

    stats = [
        {"title": "Offres actives", "value": str(active_jobs_count)},
        {"title": "Candidatures", "value": str(agg.total or 0)},
        {"title": "Entretiens", "value": str(agg.interviews or 0)},
        {"title": "Taux de reponse", "value": f"{response_rate}%"},
    ]

    # Liste des offres
    jobs_result = await db.execute(
        select(Job).filter(Job.employer_id == employer.id).order_by(Job.created_at.desc()).limit(20)
    )
    jobs_list = jobs_result.scalars().all()

    jobs_summary = []
    for job in jobs_list:
        app_count = (await db.execute(
            select(func.count()).select_from(JobApplication).filter(JobApplication.job_id == job.id)
        )).scalar() or 0
        jobs_summary.append({
            "title": job.title,
            "status": job.status.value if hasattr(job.status, 'value') else job.status,
            "applications_count": app_count,
            "posted_at": job.posted_at.strftime("%d/%m/%Y") if job.posted_at else None,
        })

    pdf = generate_employer_report(
        user_name=f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email,
        company_name=company.name,
        company_industry=company.industry,
        company_size=company.size,
        stats=stats,
        activities=[],
        jobs_summary=jobs_summary,
    )

    filename = f"intowork_rapport_recrutement_{datetime.now().strftime('%Y%m%d')}.pdf"
    return _pdf_response(pdf, filename)


# ═══════════════════════════════════════════════════════════════
# RAPPORT ADMIN
# ═══════════════════════════════════════════════════════════════

@router.get("/admin/pdf")
@limiter.limit("5/minute")
async def export_admin_pdf(
    request: Request,
    current_user: Annotated[User, Depends(require_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Générer et télécharger le rapport PDF plateforme (admin uniquement)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Réservé aux administrateurs")

    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    total_candidates = (await db.execute(select(func.count()).select_from(User).filter(User.role == UserRole.CANDIDATE))).scalar() or 0
    total_employers = (await db.execute(select(func.count()).select_from(User).filter(User.role == UserRole.EMPLOYER))).scalar() or 0
    total_companies = (await db.execute(select(func.count()).select_from(Company))).scalar() or 0
    total_jobs = (await db.execute(select(func.count()).select_from(Job))).scalar() or 0
    total_applications = (await db.execute(select(func.count()).select_from(JobApplication))).scalar() or 0
    active_users = (await db.execute(select(func.count()).select_from(User).filter(User.is_active == True))).scalar() or 0
    inactive_users = total_users - active_users

    # Inscriptions 7 derniers jours
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_signups = (await db.execute(
        select(func.count()).select_from(User).filter(User.created_at >= week_ago)
    )).scalar() or 0

    # Jobs par statut
    jobs_by_status = {}
    for job_status in ["published", "draft", "closed", "archived"]:
        count = (await db.execute(
            select(func.count()).select_from(Job).filter(Job.status == job_status)
        )).scalar() or 0
        jobs_by_status[job_status] = count

    pdf = generate_admin_report(
        admin_name=f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email,
        total_users=total_users,
        total_candidates=total_candidates,
        total_employers=total_employers,
        total_companies=total_companies,
        total_jobs=total_jobs,
        total_applications=total_applications,
        active_users=active_users,
        inactive_users=inactive_users,
        jobs_by_status=jobs_by_status,
        recent_signups=recent_signups,
    )

    filename = f"intowork_rapport_plateforme_{datetime.now().strftime('%Y%m%d')}.pdf"
    return _pdf_response(pdf, filename)
