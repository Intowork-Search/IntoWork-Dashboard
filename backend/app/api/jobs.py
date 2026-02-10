"""
Phase 2 - Tasks 14 & 15: Jobs Routes with Response Models and Annotated Types

This module implements job posting endpoints using FastAPI 0.100+ patterns:
- Explicit response_model on all endpoints
- Annotated types for dependency injection
- Centralized Pydantic schemas
"""

from typing import Annotated, Optional
from fastapi import status, APIRouter, Depends, HTTPException, Query, Response, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select, func
from sqlalchemy.orm import selectinload
from datetime import timezone, datetime, timedelta
from loguru import logger

from app.rate_limiter import limiter
from app.auth import (
    CurrentUser, CurrentUserOptional, DBSession
)
from app.models.base import (
    User, UserRole, Job, Employer, Company, Candidate,
    JobLocation, JobType, JobStatus, JobApplication
)
from app.database import get_db
from app.schemas import (
    JobCreateRequest, JobResponse, JobDetailResponse, JobListResponse,
    RecentJobsCountResponse
)

router = APIRouter()


# ==============================================================================
# Query Parameter Type Aliases (FastAPI 0.100+ Annotated style)
# ==============================================================================

PageParam = Annotated[int, Query(ge=1, description="Page number")]
LimitParam = Annotated[int, Query(ge=1, le=1000, description="Items per page")]  # Augmenté pour landing page
SearchParam = Annotated[Optional[str], Query(description="Search term")]
LocationParam = Annotated[Optional[str], Query(description="Location filter")]
JobTypeParam = Annotated[Optional[str], Query(description="Job type filter")]
LocationTypeParam = Annotated[Optional[str], Query(description="Location type filter")]
SalaryMinParam = Annotated[Optional[int], Query(description="Minimum salary filter")]
StatusFilterParam = Annotated[Optional[str], Query(description="Status filter")]
DaysParam = Annotated[int, Query(ge=1, le=30, description="Number of days")]
JobIdPath = Annotated[int, Path(ge=1, description="Job ID")]


# ==============================================================================
# Routes
# ==============================================================================

@router.get("/", response_model=JobListResponse)
async def get_jobs(
    page: PageParam = 1,
    limit: LimitParam = 10,
    search: SearchParam = None,
    location: LocationParam = None,
    job_type: JobTypeParam = None,
    location_type: LocationTypeParam = None,
    salary_min: SalaryMinParam = None,
    current_user: CurrentUserOptional = None,
    db: DBSession = None
) -> JobListResponse:
    """
    Récupérer la liste des offres d'emploi avec filtres et pagination
    """
    # Si l'utilisateur est authentifié, récupérer ses candidatures
    user_applications = set()
    if current_user:
        # Récupérer le profil candidat
        candidate_result = await db.execute(
            select(Candidate).filter(Candidate.user_id == current_user.id)
        )
        candidate = candidate_result.scalar_one_or_none()
        if candidate:
            applications_result = await db.execute(
                select(JobApplication.job_id).filter(
                    JobApplication.candidate_id == candidate.id
                )
            )
            applications = applications_result.scalars().all()
            user_applications = set(applications)

    # Construire la requête avec join
    stmt = select(Job, Company).join(Company, Job.company_id == Company.id)
    # Afficher les jobs publiés ET en draft pour la landing page
    stmt = stmt.filter(Job.status.in_([JobStatus.PUBLISHED, JobStatus.DRAFT]))

    # Filtres - Using parameterized queries to prevent SQL injection
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.filter(
            Job.title.ilike(search_pattern) |
            Job.description.ilike(search_pattern) |
            Company.name.ilike(search_pattern)
        )

    if location:
        location_pattern = f"%{location}%"
        stmt = stmt.filter(Job.location.ilike(location_pattern))

    if job_type:
        try:
            job_type_enum = JobType(job_type)
            stmt = stmt.filter(Job.job_type == job_type_enum)
        except ValueError:
            pass

    if location_type:
        try:
            location_type_enum = JobLocation(location_type)
            stmt = stmt.filter(Job.location_type == location_type_enum)
        except ValueError:
            pass

    if salary_min:
        stmt = stmt.filter(Job.salary_min >= salary_min)

    # Pagination - Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar()

    # Get paginated results
    offset = (page - 1) * limit
    stmt = stmt.order_by(desc(Job.posted_at)).offset(offset).limit(limit)
    results_data = await db.execute(stmt)
    results = results_data.all()

    # Construire la réponse
    jobs = []
    for job, company in results:
        jobs.append(JobResponse(
            id=job.id,
            title=job.title,
            description=job.description[:300] + "..." if len(job.description) > 300 else job.description,
            company_name=company.name,
            company_logo_url=company.logo_url,
            location=job.location,
            location_type=job.location_type.value,
            job_type=job.job_type.value,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            currency=job.currency,
            posted_at=job.posted_at,
            is_featured=job.is_featured,
            views_count=job.views_count,
            applications_count=job.applications_count,
            has_applied=job.id in user_applications
        ))

    total_pages = (total + limit - 1) // limit

    return JobListResponse(
        jobs=jobs,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/my-jobs", response_model=JobListResponse)
async def get_my_jobs(
    page: PageParam = 1,
    limit: LimitParam = 10,
    search: SearchParam = None,
    status_filter: StatusFilterParam = None,
    current_user: CurrentUser = None,
    db: DBSession = None
) -> JobListResponse:
    """
    Récupérer les offres d'emploi créées par l'employeur connecté
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Seuls les employeurs peuvent accéder à cette ressource")

    # Récupérer l'employeur
    employer_result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Profil employeur non trouvé")

    # Query de base - uniquement les jobs de cet employeur
    stmt = select(Job, Company).join(Company, Job.company_id == Company.id)
    stmt = stmt.filter(Job.employer_id == employer.id)

    # Filtres - Using parameterized queries to prevent SQL injection
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.filter(
            Job.title.ilike(search_pattern) |
            Job.description.ilike(search_pattern)
        )

    if status_filter:
        try:
            status_enum = JobStatus(status_filter)
            stmt = stmt.filter(Job.status == status_enum)
        except ValueError:
            pass

    # Pagination - Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar()

    # Get paginated results
    offset = (page - 1) * limit
    stmt = stmt.order_by(desc(Job.posted_at)).offset(offset).limit(limit)
    results_data = await db.execute(stmt)
    results = results_data.all()

    # Construire la réponse
    jobs = []
    for job, company in results:
        jobs.append(JobResponse(
            id=job.id,
            title=job.title,
            description=job.description[:300] + "..." if len(job.description) > 300 else job.description,
            company_name=company.name,
            company_logo_url=company.logo_url,
            location=job.location,
            location_type=job.location_type.value,
            job_type=job.job_type.value,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            currency=job.currency,
            posted_at=job.posted_at,
            is_featured=job.is_featured,
            views_count=job.views_count,
            applications_count=job.applications_count,
            has_applied=False  # L'employeur ne postule pas à ses propres offres
        ))

    total_pages = (total + limit - 1) // limit

    return JobListResponse(
        jobs=jobs,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/stats/recent", response_model=RecentJobsCountResponse)
async def get_recent_jobs_count(
    days: DaysParam = 7,
    db: DBSession = None
) -> RecentJobsCountResponse:
    """
    Récupérer le nombre d'offres d'emploi récentes
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    count_result = await db.execute(
        select(func.count()).select_from(Job).filter(
            Job.status == JobStatus.PUBLISHED,
            Job.posted_at >= cutoff_date
        )
    )
    count = count_result.scalar()

    return RecentJobsCountResponse(count=count, days=days)


@router.post("/create", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job: JobCreateRequest,
    db: DBSession,
    current_user: CurrentUser
) -> JobResponse:
    """
    Créer une nouvelle offre d'emploi (employeur authentifié)
    """
    logger.info(f"Tentative de création d'offre par user_id={current_user.id}, role={current_user.role}")

    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Refus: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Seuls les employeurs peuvent créer une offre")

    # Récupérer l'employeur avec eager loading de company
    employer_result = await db.execute(
        select(Employer).options(selectinload(Employer.company)).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        logger.error("Employeur introuvable pour user_id=%s", current_user.id)
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    company = employer.company
    if not company:
        logger.error("Entreprise introuvable pour employeur_id=%s", employer.id)
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    # Vérification enums
    try:
        location_type_enum = JobLocation(job.location_type)
    except ValueError:
        logger.error(f"Valeur location_type invalide: {job.location_type}")
        raise HTTPException(status_code=400, detail=f"Type de lieu invalide: {job.location_type}")

    try:
        job_type_enum = JobType(job.job_type)
    except ValueError:
        logger.error(f"Valeur job_type invalide: {job.job_type}")
        raise HTTPException(status_code=400, detail=f"Type de contrat invalide: {job.job_type}")

    # Créer l'offre
    try:
        job_obj = Job(
            employer_id=employer.id,
            company_id=company.id,
            title=job.title,
            description=job.description,
            location=job.location,
            location_type=location_type_enum,
            job_type=job_type_enum,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            currency=job.currency,
            requirements=job.requirements,
            responsibilities=job.responsibilities,
            benefits=job.benefits,
            status=JobStatus.PUBLISHED,
            posted_at=datetime.now(timezone.utc),
            is_featured=False,
            views_count=0,
            applications_count=0
        )
        db.add(job_obj)
        await db.commit()
        await db.refresh(job_obj)
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'offre: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de l'offre: {str(e)}")

    logger.info(f"Offre créée avec succès: id={job_obj.id}")

    return JobResponse(
        id=job_obj.id,
        title=job_obj.title,
        description=job_obj.description,
        company_name=company.name,
        company_logo_url=getattr(company, 'logo_url', None),
        location=job_obj.location,
        location_type=job_obj.location_type.value,
        job_type=job_obj.job_type.value,
        salary_min=job_obj.salary_min,
        salary_max=job_obj.salary_max,
        currency=job_obj.currency,
        posted_at=job_obj.posted_at,
        is_featured=job_obj.is_featured,
        views_count=job_obj.views_count,
        applications_count=job_obj.applications_count
    )


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: JobIdPath,
    job: JobCreateRequest,
    db: DBSession,
    current_user: CurrentUser
) -> JobResponse:
    """
    Mettre à jour une offre d'emploi (employeur propriétaire uniquement)
    """
    logger.info(f"Mise à jour de l'offre id={job_id} demandée par user_id={current_user.id}, role={current_user.role}")
    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Refus mise à jour: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Seuls les employeurs peuvent mettre à jour une offre")

    job_result = await db.execute(select(Job).filter(Job.id == job_id))
    job_obj = job_result.scalar_one_or_none()
    if not job_obj:
        logger.warning(f"Mise à jour: offre id={job_id} introuvable")
        raise HTTPException(status_code=404, detail="Offre introuvable")

    # Vérifier que l'employeur est bien le propriétaire de l'offre
    employer_result = await db.execute(
        select(Employer).options(selectinload(Employer.company)).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer or job_obj.employer_id != employer.id:
        logger.warning(f"Mise à jour refusée: user_id={current_user.id} n'est pas propriétaire de l'offre id={job_id}")
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier cette offre")

    # Vérification enums
    try:
        location_type_enum = JobLocation(job.location_type)
    except ValueError:
        logger.error(f"Valeur location_type invalide: {job.location_type}")
        raise HTTPException(status_code=400, detail=f"Type de lieu invalide: {job.location_type}")

    try:
        job_type_enum = JobType(job.job_type)
    except ValueError:
        logger.error(f"Valeur job_type invalide: {job.job_type}")
        raise HTTPException(status_code=400, detail=f"Type de contrat invalide: {job.job_type}")

    # Mettre à jour les champs
    try:
        job_obj.title = job.title
        job_obj.description = job.description
        job_obj.location = job.location
        job_obj.location_type = location_type_enum
        job_obj.job_type = job_type_enum
        job_obj.salary_min = job.salary_min
        job_obj.salary_max = job.salary_max
        job_obj.currency = job.currency
        job_obj.requirements = job.requirements
        job_obj.responsibilities = job.responsibilities
        job_obj.benefits = job.benefits

        await db.commit()
        await db.refresh(job_obj)
        logger.info(f"Offre id={job_id} mise à jour avec succès")

        company = employer.company
        return JobResponse(
            id=job_obj.id,
            title=job_obj.title,
            description=job_obj.description,
            company_name=company.name,
            company_logo_url=getattr(company, 'logo_url', None),
            location=job_obj.location,
            location_type=job_obj.location_type.value,
            job_type=job_obj.job_type.value,
            salary_min=job_obj.salary_min,
            salary_max=job_obj.salary_max,
            currency=job_obj.currency,
            posted_at=job_obj.posted_at,
            is_featured=job_obj.is_featured,
            views_count=job_obj.views_count,
            applications_count=job_obj.applications_count
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Erreur lors de la mise à jour de l'offre id={job_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour de l'offre")


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: JobIdPath,
    db: DBSession,
    current_user: CurrentUser
) -> Response:
    """
    Supprimer une offre d'emploi (employeur propriétaire uniquement)
    """
    logger.info(f"Suppression de l'offre id={job_id} demandée par user_id={current_user.id}, role={current_user.role}")
    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Refus suppression: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Seuls les employeurs peuvent supprimer une offre")

    job_result = await db.execute(select(Job).filter(Job.id == job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        logger.warning(f"Suppression: offre id={job_id} introuvable")
        raise HTTPException(status_code=404, detail="Offre introuvable")

    # Vérifier que l'employeur est bien le propriétaire de l'offre
    employer_result = await db.execute(
        select(Employer).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer or job.employer_id != employer.id:
        logger.warning(f"Suppression refusée: user_id={current_user.id} n'est pas propriétaire de l'offre id={job_id}")
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à supprimer cette offre")

    try:
        await db.delete(job)
        await db.commit()
        logger.info(f"Suppression réussie de l'offre id={job_id}")
        return Response(status_code=204)
    except Exception as e:
        await db.rollback()
        logger.error(f"Erreur lors de la suppression de l'offre id={job_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression de l'offre")


# Cette route DOIT être en DERNIER car elle capture tout
@router.get("/{job_id}", response_model=JobDetailResponse)
async def get_job(
    job_id: JobIdPath,
    current_user: CurrentUserOptional = None,
    db: DBSession = None
) -> JobDetailResponse:
    """
    Récupérer les détails d'une offre d'emploi
    """
    stmt = select(Job, Company).join(Company, Job.company_id == Company.id).filter(
        Job.id == job_id,
        Job.status == JobStatus.PUBLISHED
    )
    result_data = await db.execute(stmt)
    result = result_data.first()

    if not result:
        raise HTTPException(status_code=404, detail="Job not found")

    job, company = result

    # Vérifier si l'utilisateur a déjà postulé
    has_applied = False
    if current_user:
        # Récupérer le profil candidat
        candidate_result = await db.execute(
            select(Candidate).filter(Candidate.user_id == current_user.id)
        )
        candidate = candidate_result.scalar_one_or_none()
        if candidate:
            application_result = await db.execute(
                select(JobApplication).filter(
                    JobApplication.candidate_id == candidate.id,
                    JobApplication.job_id == job_id
                )
            )
            application = application_result.scalar_one_or_none()
            has_applied = application is not None

    # Incrémenter le compteur de vues
    job.views_count += 1
    await db.commit()

    return JobDetailResponse(
        id=job.id,
        title=job.title,
        description=job.description,
        requirements=job.requirements,
        responsibilities=job.responsibilities,
        benefits=job.benefits,
        company_name=company.name,
        company_description=company.description,
        company_industry=company.industry,
        company_size=company.size,
        company_logo_url=company.logo_url,
        location=job.location,
        location_type=job.location_type.value,
        job_type=job.job_type.value,
        employment_type=job.job_type.value,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        currency=job.currency,
        salary_range=f"{job.salary_min:,} - {job.salary_max:,} {job.currency}" if job.salary_min and job.salary_max else None,
        posted_at=job.posted_at,
        is_featured=job.is_featured,
        views_count=job.views_count,
        applications_count=job.applications_count,
        has_applied=has_applied,
        status=job.status.value,
        created_at=job.created_at
    )
