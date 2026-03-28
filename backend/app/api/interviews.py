"""
Routes API CRUD pour la gestion des entretiens (InterviewSchedule).

Endpoints :
  POST   /                              Creer un entretien (employeur)
  GET    /                              Lister les entretiens (filtre par role)
  GET    /{interview_id}                Detail d'un entretien
  PUT    /{interview_id}                Modifier un entretien (employeur)
  DELETE /{interview_id}                Supprimer un entretien (employeur)
  PATCH  /{interview_id}/status         Mettre a jour le statut
  GET    /application/{application_id}  Entretiens pour une candidature
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.base import (
    InterviewSchedule,
    InterviewScheduleStatus,
    JobApplication,
    Job,
    User,
    Employer,
    Candidate,
)
from app.auth import require_user
from pydantic import BaseModel, ConfigDict, Field

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas Pydantic
# ---------------------------------------------------------------------------

class InterviewCreate(BaseModel):
    """Schema de creation d'un entretien."""

    application_id: int
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int = Field(default=60, ge=15, le=480)
    timezone: str = Field(default="Europe/Paris", max_length=100)
    interviewers: Optional[List[dict]] = None
    candidate_email: Optional[str] = None


class InterviewUpdate(BaseModel):
    """Schema de mise a jour d'un entretien."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(default=None, ge=15, le=480)
    timezone: Optional[str] = Field(default=None, max_length=100)
    interviewers: Optional[List[dict]] = None
    candidate_email: Optional[str] = None


class InterviewStatusUpdate(BaseModel):
    """Schema de mise a jour du statut d'un entretien."""

    status: str = Field(
        ...,
        description="Nouveau statut : confirmed, canceled, completed, rescheduled",
    )


class InterviewResponse(BaseModel):
    """Schema de reponse pour un entretien."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    created_by_user_id: int
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int
    timezone: str
    interviewers: Optional[List[dict]] = None
    candidate_email: str
    status: str
    google_event_id: Optional[str] = None
    outlook_event_id: Optional[str] = None
    reminder_sent: bool
    confirmation_received: bool
    created_at: datetime
    updated_at: datetime


class InterviewListResponse(BaseModel):
    """Schema de reponse paginee pour la liste des entretiens."""

    interviews: List[InterviewResponse]
    total: int
    page: int
    limit: int
    total_pages: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_employer_for_user(
    db: AsyncSession, user: User
) -> Employer:
    """Recupere le profil employeur lie a l'utilisateur ou leve 403."""
    result = await db.execute(
        select(Employer).filter(Employer.user_id == user.id)
    )
    employer = result.scalar_one_or_none()
    if not employer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profil employeur introuvable",
        )
    return employer


async def _verify_application_ownership(
    db: AsyncSession, application_id: int, employer: Employer
) -> JobApplication:
    """Verifie que la candidature appartient a un job de l'employeur."""
    result = await db.execute(
        select(JobApplication)
        .options(selectinload(JobApplication.job))
        .filter(JobApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature introuvable",
        )

    if application.job.employer_id != employer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'etes pas autorise a gerer les entretiens pour cette candidature",
        )

    return application


async def _get_interview_with_ownership(
    db: AsyncSession, interview_id: int, employer: Employer
) -> InterviewSchedule:
    """Recupere un entretien et verifie que l'employeur en est le proprietaire."""
    result = await db.execute(
        select(InterviewSchedule)
        .options(
            selectinload(InterviewSchedule.application).selectinload(JobApplication.job)
        )
        .filter(InterviewSchedule.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entretien introuvable",
        )

    if interview.application.job.employer_id != employer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'etes pas autorise a modifier cet entretien",
        )

    return interview


def _serialize_interview(interview: InterviewSchedule) -> InterviewResponse:
    """Convertit un objet InterviewSchedule en InterviewResponse."""
    return InterviewResponse(
        id=interview.id,
        application_id=interview.application_id,
        created_by_user_id=interview.created_by_user_id,
        title=interview.title,
        description=interview.description,
        location=interview.location,
        meeting_link=interview.meeting_link,
        scheduled_at=interview.scheduled_at,
        duration_minutes=interview.duration_minutes,
        timezone=interview.timezone,
        interviewers=interview.interviewers,
        candidate_email=interview.candidate_email,
        status=interview.status.value if isinstance(interview.status, InterviewScheduleStatus) else interview.status,
        google_event_id=interview.google_event_id,
        outlook_event_id=interview.outlook_event_id,
        reminder_sent=interview.reminder_sent,
        confirmation_received=interview.confirmation_received,
        created_at=interview.created_at,
        updated_at=interview.updated_at,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    payload: InterviewCreate,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Creer un entretien pour une candidature (employeur uniquement)."""

    if current_user.role.value != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les employeurs peuvent planifier des entretiens",
        )

    employer = await _get_employer_for_user(db, current_user)
    application = await _verify_application_ownership(db, payload.application_id, employer)

    # Recuperer l'email du candidat si non fourni
    candidate_email = payload.candidate_email
    if not candidate_email:
        candidate_result = await db.execute(
            select(Candidate)
            .options(selectinload(Candidate.user))
            .filter(Candidate.id == application.candidate_id)
        )
        candidate = candidate_result.scalar_one_or_none()
        if candidate and candidate.user:
            candidate_email = candidate.user.email
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de determiner l'email du candidat. Veuillez le fournir.",
            )

    interview = InterviewSchedule(
        application_id=payload.application_id,
        created_by_user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        meeting_link=payload.meeting_link,
        scheduled_at=payload.scheduled_at,
        duration_minutes=payload.duration_minutes,
        timezone=payload.timezone,
        interviewers=payload.interviewers,
        candidate_email=candidate_email,
        status=InterviewScheduleStatus.SCHEDULED,
    )

    db.add(interview)
    await db.commit()
    await db.refresh(interview)

    logger.info(
        "Entretien cree: id=%s, application_id=%s, par user_id=%s",
        interview.id,
        interview.application_id,
        current_user.id,
    )

    return _serialize_interview(interview)


@router.get("/", response_model=InterviewListResponse)
async def list_interviews(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Lister les entretiens filtres par role.

    - Employeur : voit les entretiens lies a ses offres.
    - Candidat  : voit les entretiens lies a ses candidatures.
    - Admin     : voit tous les entretiens.
    """

    stmt = select(InterviewSchedule).options(
        selectinload(InterviewSchedule.application).selectinload(JobApplication.job)
    )
    count_stmt = select(func.count()).select_from(InterviewSchedule)

    role = current_user.role.value

    if role == "employer":
        employer = await _get_employer_for_user(db, current_user)
        # Sous-requete : IDs des jobs de l'employeur
        employer_job_ids = select(Job.id).filter(Job.employer_id == employer.id).scalar_subquery()
        # IDs des candidatures liees a ces jobs
        employer_app_ids = (
            select(JobApplication.id)
            .filter(JobApplication.job_id.in_(select(Job.id).filter(Job.employer_id == employer.id)))
            .scalar_subquery()
        )
        stmt = stmt.filter(InterviewSchedule.application_id.in_(employer_app_ids))
        count_stmt = count_stmt.filter(InterviewSchedule.application_id.in_(employer_app_ids))

    elif role == "candidate":
        candidate_result = await db.execute(
            select(Candidate).filter(Candidate.user_id == current_user.id)
        )
        candidate = candidate_result.scalar_one_or_none()
        if not candidate:
            return InterviewListResponse(
                interviews=[], total=0, page=page, limit=limit, total_pages=0
            )
        candidate_app_ids = (
            select(JobApplication.id)
            .filter(JobApplication.candidate_id == candidate.id)
            .scalar_subquery()
        )
        stmt = stmt.filter(InterviewSchedule.application_id.in_(candidate_app_ids))
        count_stmt = count_stmt.filter(InterviewSchedule.application_id.in_(candidate_app_ids))

    elif role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role non autorise",
        )

    # Filtre par statut
    if status_filter:
        try:
            status_enum = InterviewScheduleStatus(status_filter)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Statut invalide : {status_filter}. Valeurs autorisees : {[s.value for s in InterviewScheduleStatus]}",
            )
        stmt = stmt.filter(InterviewSchedule.status == status_enum)
        count_stmt = count_stmt.filter(InterviewSchedule.status == status_enum)

    # Total et pagination
    total_result = await db.execute(count_stmt)
    total = total_result.scalar()
    total_pages = (total + limit - 1) // limit

    stmt = stmt.order_by(InterviewSchedule.scheduled_at.desc())
    stmt = stmt.offset((page - 1) * limit).limit(limit)

    result = await db.execute(stmt)
    interviews = result.scalars().all()

    return InterviewListResponse(
        interviews=[_serialize_interview(i) for i in interviews],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: int,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Recuperer le detail d'un entretien."""

    result = await db.execute(
        select(InterviewSchedule)
        .options(
            selectinload(InterviewSchedule.application).selectinload(JobApplication.job)
        )
        .filter(InterviewSchedule.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entretien introuvable",
        )

    role = current_user.role.value

    # Verification d'acces selon le role
    if role == "employer":
        employer = await _get_employer_for_user(db, current_user)
        if interview.application.job.employer_id != employer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acces refuse a cet entretien",
            )

    elif role == "candidate":
        candidate_result = await db.execute(
            select(Candidate).filter(Candidate.user_id == current_user.id)
        )
        candidate = candidate_result.scalar_one_or_none()
        if not candidate or interview.application.candidate_id != candidate.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acces refuse a cet entretien",
            )

    elif role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role non autorise",
        )

    return _serialize_interview(interview)


@router.put("/{interview_id}", response_model=InterviewResponse)
async def update_interview(
    interview_id: int,
    payload: InterviewUpdate,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Modifier un entretien (employeur proprietaire uniquement)."""

    if current_user.role.value != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les employeurs peuvent modifier un entretien",
        )

    employer = await _get_employer_for_user(db, current_user)
    interview = await _get_interview_with_ownership(db, interview_id, employer)

    # Appliquer uniquement les champs fournis
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(interview, field, value)

    await db.commit()
    await db.refresh(interview)

    logger.info(
        "Entretien mis a jour: id=%s, champs=%s, par user_id=%s",
        interview.id,
        list(update_data.keys()),
        current_user.id,
    )

    return _serialize_interview(interview)


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: int,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Supprimer un entretien (employeur proprietaire uniquement)."""

    if current_user.role.value != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les employeurs peuvent supprimer un entretien",
        )

    employer = await _get_employer_for_user(db, current_user)
    interview = await _get_interview_with_ownership(db, interview_id, employer)

    await db.delete(interview)
    await db.commit()

    logger.info(
        "Entretien supprime: id=%s, par user_id=%s",
        interview_id,
        current_user.id,
    )


@router.patch("/{interview_id}/status", response_model=InterviewResponse)
async def update_interview_status(
    interview_id: int,
    payload: InterviewStatusUpdate,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Mettre a jour le statut d'un entretien.

    Les employeurs peuvent passer a n'importe quel statut.
    Les candidats ne peuvent que confirmer ou annuler.
    """

    # Valider le statut
    try:
        new_status = InterviewScheduleStatus(payload.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Statut invalide : {payload.status}. Valeurs autorisees : {[s.value for s in InterviewScheduleStatus]}",
        )

    result = await db.execute(
        select(InterviewSchedule)
        .options(
            selectinload(InterviewSchedule.application).selectinload(JobApplication.job)
        )
        .filter(InterviewSchedule.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entretien introuvable",
        )

    role = current_user.role.value

    if role == "employer":
        employer = await _get_employer_for_user(db, current_user)
        if interview.application.job.employer_id != employer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acces refuse a cet entretien",
            )

    elif role == "candidate":
        # Les candidats ne peuvent que confirmer ou annuler
        allowed_candidate_statuses = {
            InterviewScheduleStatus.CONFIRMED,
            InterviewScheduleStatus.CANCELED,
        }
        if new_status not in allowed_candidate_statuses:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Les candidats ne peuvent que confirmer ou annuler un entretien",
            )

        candidate_result = await db.execute(
            select(Candidate).filter(Candidate.user_id == current_user.id)
        )
        candidate = candidate_result.scalar_one_or_none()
        if not candidate or interview.application.candidate_id != candidate.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acces refuse a cet entretien",
            )

        # Mettre a jour le flag de confirmation si le candidat confirme
        if new_status == InterviewScheduleStatus.CONFIRMED:
            interview.confirmation_received = True

    elif role == "admin":
        pass  # Les admins peuvent tout faire

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role non autorise",
        )

    interview.status = new_status
    await db.commit()
    await db.refresh(interview)

    logger.info(
        "Statut entretien mis a jour: id=%s, nouveau_statut=%s, par user_id=%s",
        interview.id,
        new_status.value,
        current_user.id,
    )

    return _serialize_interview(interview)


@router.get("/application/{application_id}", response_model=InterviewListResponse)
async def get_interviews_for_application(
    application_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Recuperer tous les entretiens pour une candidature donnee."""

    # Verifier que la candidature existe et que l'utilisateur y a acces
    app_result = await db.execute(
        select(JobApplication)
        .options(selectinload(JobApplication.job))
        .filter(JobApplication.id == application_id)
    )
    application = app_result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature introuvable",
        )

    role = current_user.role.value

    if role == "employer":
        employer = await _get_employer_for_user(db, current_user)
        if application.job.employer_id != employer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acces refuse a cette candidature",
            )

    elif role == "candidate":
        candidate_result = await db.execute(
            select(Candidate).filter(Candidate.user_id == current_user.id)
        )
        candidate = candidate_result.scalar_one_or_none()
        if not candidate or application.candidate_id != candidate.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acces refuse a cette candidature",
            )

    elif role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role non autorise",
        )

    # Requete paginee
    stmt = (
        select(InterviewSchedule)
        .filter(InterviewSchedule.application_id == application_id)
        .order_by(InterviewSchedule.scheduled_at.desc())
    )

    count_stmt = (
        select(func.count())
        .select_from(InterviewSchedule)
        .filter(InterviewSchedule.application_id == application_id)
    )

    total_result = await db.execute(count_stmt)
    total = total_result.scalar()
    total_pages = (total + limit - 1) // limit

    stmt = stmt.offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    interviews = result.scalars().all()

    return InterviewListResponse(
        interviews=[_serialize_interview(i) for i in interviews],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )
