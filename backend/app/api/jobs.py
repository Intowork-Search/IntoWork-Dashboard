"""
Phase 2 - Tasks 14 & 15: Jobs Routes with Response Models and Annotated Types

This module implements job posting endpoints using FastAPI 0.100+ patterns:
- Explicit response_model on all endpoints
- Annotated types for dependency injection
- Centralized Pydantic schemas
"""

from typing import Annotated, Optional
from fastapi import status, APIRouter, Depends, HTTPException, Query, Response, Path, UploadFile, File
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
    RecentJobsCountResponse, MarketStatsResponse, MarketStatItem
)
from app.services.employer_service import get_or_create_employer
from app.services.cloudinary_service import CloudinaryService

router = APIRouter()


# ==============================================================================
# Query Parameter Type Aliases (FastAPI 0.100+ Annotated style)
# ==============================================================================

PageParam = Annotated[int, Query(ge=1, description="Page number")]
LimitParam = Annotated[int, Query(ge=1, le=100, description="Items per page")]
SearchParam = Annotated[Optional[str], Query(description="Search term")]
LocationParam = Annotated[Optional[str], Query(description="Location filter")]
JobTypeParam = Annotated[Optional[str], Query(description="Job type filter")]
LocationTypeParam = Annotated[Optional[str], Query(description="Location type filter")]
SalaryMinParam = Annotated[Optional[int], Query(description="Minimum salary filter")]
CountryParam = Annotated[Optional[str], Query(description="Country filter (ISO code: GA, CM, CG)")]
CurrencyParam = Annotated[Optional[str], Query(description="Currency filter (XAF, XOF, EUR, USD)")]
StatusFilterParam = Annotated[Optional[str], Query(description="Status filter")]
DaysParam = Annotated[int, Query(ge=1, le=30, description="Number of days")]
LanguageParam = Annotated[Optional[str], Query(description="Language filter (fr, en, pt, ar)")]
JobIdPath = Annotated[int, Path(ge=1, description="Job ID")]


# ==============================================================================
# Routes
# ==============================================================================

@router.get("/", response_model=JobListResponse, response_model_exclude_none=True)
async def get_jobs(
    page: PageParam = 1,
    limit: LimitParam = 10,
    search: SearchParam = None,
    location: LocationParam = None,
    job_type: JobTypeParam = None,
    location_type: LocationTypeParam = None,
    salary_min: SalaryMinParam = None,
    country: CountryParam = None,
    currency: CurrencyParam = None,
    language: LanguageParam = None,
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
    # Afficher uniquement les jobs publiés (les drafts sont privés)
    stmt = stmt.filter(Job.status == JobStatus.PUBLISHED)

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

    if country:
        stmt = stmt.filter(Job.country == country)

    if currency:
        stmt = stmt.filter(Job.currency == currency)

    if language:
        stmt = stmt.filter(Job.language == language)

    # Optimisation : une seule requête au lieu de 3 allers-retours DB.
    # - func.count().over() : total des lignes filtrées (avant LIMIT) sans requête COUNT séparée
    # - sous-requête corrélée : nombre de candidatures par offre sans requête batch séparée
    app_count_subq = (
        select(func.count(JobApplication.id))
        .where(JobApplication.job_id == Job.id)
        .correlate(Job)
        .scalar_subquery()
    )

    offset = (page - 1) * limit
    stmt = (
        stmt.add_columns(
            func.count().over().label("total_count"),
            app_count_subq.label("app_count"),
        )
        .order_by(desc(Job.posted_at))
        .offset(offset)
        .limit(limit)
    )
    results_data = await db.execute(stmt)
    results = results_data.all()

    total = results[0].total_count if results else 0

    # Construire la réponse
    jobs = []
    for row in results:
        job = row[0]
        company = row[1]
        jobs.append(JobResponse(
            id=job.id,
            title=job.title,
            description=job.description[:300] + "..." if len(job.description) > 300 else job.description,
            company_name=company.name,
            company_logo_url=company.logo_url,
            company_is_verified=getattr(company, 'is_verified', False),
            location=job.location,
            location_type=job.location_type.value,
            job_type=job.job_type.value,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            currency=job.currency,
            country=job.country or company.country,
            zone=job.zone,
            language=job.language,
            image_url=job.image_url,
            status=job.status.value,
            posted_at=job.posted_at,
            is_featured=job.is_featured,
            views_count=job.views_count,
            applications_count=row.app_count or 0,
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


@router.get("/my-jobs", response_model=JobListResponse, response_model_exclude_none=True)
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

    # Récupérer l'employeur (auto-création si le profil est manquant)
    employer = await get_or_create_employer(db, current_user)

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

    # Calculer les vrais comptes de candidatures en une seule requête batch
    job_ids = [job.id for job, _ in results]
    employer_app_counts_map: dict = {}
    if job_ids:
        employer_app_counts_result = await db.execute(
            select(JobApplication.job_id, func.count(JobApplication.id).label("cnt"))
            .where(JobApplication.job_id.in_(job_ids))
            .group_by(JobApplication.job_id)
        )
        employer_app_counts_map = {row.job_id: row.cnt for row in employer_app_counts_result}

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
            country=job.country or company.country,
            zone=job.zone,
            language=job.language,
            image_url=job.image_url,
            status=job.status.value,
            posted_at=job.posted_at,
            is_featured=job.is_featured,
            views_count=job.views_count,
            applications_count=employer_app_counts_map.get(job.id, 0),
            has_applied=False,  # L'employeur ne postule pas à ses propres offres
            linkedin_published_at=job.linkedin_published_at,
        ))
    total_pages = (total + limit - 1) // limit

    return JobListResponse(
        jobs=jobs,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/stats/market", response_model=MarketStatsResponse)
async def get_market_stats(
    db: DBSession = None
) -> MarketStatsResponse:
    """
    Statistiques publiques du marché de l'emploi.
    Aucune authentification requise.
    """
    # Totaux
    total_jobs_res = await db.execute(
        select(func.count()).select_from(Job).filter(Job.status == JobStatus.PUBLISHED)
    )
    total_jobs = total_jobs_res.scalar() or 0

    total_apps_res = await db.execute(select(func.count()).select_from(JobApplication))
    total_applications = total_apps_res.scalar() or 0

    total_companies_res = await db.execute(select(func.count()).select_from(Company))
    total_companies = total_companies_res.scalar() or 0

    total_cands_res = await db.execute(select(func.count()).select_from(Candidate))
    total_candidates = total_cands_res.scalar() or 0

    # Offres par pays
    by_country_res = await db.execute(
        select(Job.country, func.count().label("cnt"))
        .filter(Job.status == JobStatus.PUBLISHED, Job.country.isnot(None))
        .group_by(Job.country)
        .order_by(desc("cnt"))
        .limit(10)
    )
    jobs_by_country = [
        MarketStatItem(label=row.country, count=row.cnt)
        for row in by_country_res.all()
    ]

    # Offres par type de contrat
    by_type_res = await db.execute(
        select(Job.job_type, func.count().label("cnt"))
        .filter(Job.status == JobStatus.PUBLISHED)
        .group_by(Job.job_type)
        .order_by(desc("cnt"))
    )
    jobs_by_type = [
        MarketStatItem(label=row.job_type, count=row.cnt)
        for row in by_type_res.all()
    ]

    # Offres par type de lieu (remote/on-site/hybrid)
    by_loc_res = await db.execute(
        select(Job.location_type, func.count().label("cnt"))
        .filter(Job.status == JobStatus.PUBLISHED)
        .group_by(Job.location_type)
        .order_by(desc("cnt"))
    )
    jobs_by_location_type = [
        MarketStatItem(label=row.location_type, count=row.cnt)
        for row in by_loc_res.all()
    ]

    # Top industries (via Company)
    top_industries_res = await db.execute(
        select(Company.industry, func.count().label("cnt"))
        .join(Job, Job.company_id == Company.id)
        .filter(Job.status == JobStatus.PUBLISHED, Company.industry.isnot(None))
        .group_by(Company.industry)
        .order_by(desc("cnt"))
        .limit(8)
    )
    top_industries = [
        MarketStatItem(label=row.industry, count=row.cnt)
        for row in top_industries_res.all()
    ]

    return MarketStatsResponse(
        total_jobs=total_jobs,
        total_applications=total_applications,
        total_companies=total_companies,
        total_candidates=total_candidates,
        jobs_by_country=jobs_by_country,
        jobs_by_type=jobs_by_type,
        jobs_by_location_type=jobs_by_location_type,
        top_industries=top_industries,
    )


@router.get("/stats/recent", response_model=RecentJobsCountResponse)
async def get_recent_jobs_count(
    days: DaysParam = 7,
    db: DBSession = None
) -> RecentJobsCountResponse:
    """
    Récupérer le nombre d'offres d'emploi récentes
    """
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)

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

    # Récupérer l'employeur (auto-création si le profil est manquant) avec son entreprise
    employer = await get_or_create_employer(db, current_user, with_company=True)

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
            country=job.country or company.country,
            zone=job.zone,
            language=job.language,
            image_url=job.image_url,
            requirements=job.requirements,
            responsibilities=job.responsibilities,
            benefits=job.benefits,
            context=job.context,
            mission_principale=job.mission_principale,
            profil_formation=job.profil_formation,
            profil_experience=job.profil_experience,
            profil_competences=job.profil_competences,
            profil_posture=job.profil_posture,
            profil_autre=job.profil_autre,
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
        company_is_verified=getattr(company, 'is_verified', False),
        location=job_obj.location,
        location_type=job_obj.location_type.value,
        job_type=job_obj.job_type.value,
        salary_min=job_obj.salary_min,
        salary_max=job_obj.salary_max,
        currency=job_obj.currency,
        country=job_obj.country or company.country,
        zone=job_obj.zone,
        language=job_obj.language,
        image_url=job_obj.image_url,
        status=job_obj.status.value,
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
        job_obj.country = job.country or job_obj.country
        job_obj.zone = job.zone or job_obj.zone
        job_obj.language = job.language if job.language is not None else job_obj.language
        job_obj.image_url = job.image_url if job.image_url is not None else job_obj.image_url
        job_obj.requirements = job.requirements
        job_obj.responsibilities = job.responsibilities
        job_obj.benefits = job.benefits
        job_obj.context = job.context
        job_obj.mission_principale = job.mission_principale
        job_obj.profil_formation = job.profil_formation
        job_obj.profil_experience = job.profil_experience
        job_obj.profil_competences = job.profil_competences
        job_obj.profil_posture = job.profil_posture
        job_obj.profil_autre = job.profil_autre

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
            company_is_verified=getattr(company, 'is_verified', False),
            location=job_obj.location,
            location_type=job_obj.location_type.value,
            job_type=job_obj.job_type.value,
            salary_min=job_obj.salary_min,
            salary_max=job_obj.salary_max,
            currency=job_obj.currency,
            country=job_obj.country or company.country,
            zone=job_obj.zone,
            language=job_obj.language,
            image_url=job_obj.image_url,
            status=job_obj.status.value,
            posted_at=job_obj.posted_at,
            is_featured=job_obj.is_featured,
            views_count=job_obj.views_count,
            applications_count=job_obj.applications_count
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Erreur lors de la mise à jour de l'offre id={job_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour de l'offre")


@router.post("/{job_id}/image", response_model=JobResponse)
async def upload_job_image(
    job_id: JobIdPath,
    db: DBSession,
    current_user: CurrentUser,
    image: UploadFile = File(...),
) -> JobResponse:
    """
    Uploader une image / visuel pour une offre (employeur propriétaire uniquement).
    L'image est stockée sur Cloudinary et utilisée notamment comme visuel LinkedIn.
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Seuls les employeurs peuvent modifier une offre")

    # Récupérer l'offre + l'employeur propriétaire
    job_result = await db.execute(select(Job).filter(Job.id == job_id))
    job_obj = job_result.scalar_one_or_none()
    if not job_obj:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    employer_result = await db.execute(
        select(Employer).options(selectinload(Employer.company)).filter(Employer.user_id == current_user.id)
    )
    employer = employer_result.scalar_one_or_none()
    if not employer or job_obj.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier cette offre")

    # Valider le type de fichier
    if not (image.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")

    # Valider la taille (max 5MB)
    content = await image.read()
    max_size = 5 * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"L'image ne peut pas dépasser 5MB (taille: {len(content) / (1024*1024):.2f}MB)"
        )
    await image.seek(0)

    try:
        # Supprimer l'ancienne image si présente
        if job_obj.image_cloudinary_id:
            await CloudinaryService.delete_image(job_obj.image_cloudinary_id)

        # Upload vers Cloudinary (paysage 1200x627, ratio recommandé LinkedIn)
        upload_result = await CloudinaryService.upload_image(
            file=image,
            folder=f"job_images/job_{job_obj.id}",
            transformation={
                "width": 1200,
                "height": 627,
                "crop": "fill",
                "gravity": "auto",
                "quality": "auto:good",
            },
        )

        job_obj.image_url = upload_result["url"]
        job_obj.image_cloudinary_id = upload_result["public_id"]
        await db.commit()
        await db.refresh(job_obj)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Erreur upload image offre id={job_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'upload de l'image")

    company = employer.company
    return JobResponse(
        id=job_obj.id,
        title=job_obj.title,
        description=job_obj.description,
        company_name=company.name,
        company_logo_url=getattr(company, 'logo_url', None),
        company_is_verified=getattr(company, 'is_verified', False),
        location=job_obj.location,
        location_type=job_obj.location_type.value,
        job_type=job_obj.job_type.value,
        salary_min=job_obj.salary_min,
        salary_max=job_obj.salary_max,
        currency=job_obj.currency,
        country=job_obj.country or company.country,
        zone=job_obj.zone,
        language=job_obj.language,
        image_url=job_obj.image_url,
        status=job_obj.status.value,
        posted_at=job_obj.posted_at,
        is_featured=job_obj.is_featured,
        views_count=job_obj.views_count,
        applications_count=job_obj.applications_count,
    )


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

    # Calculer le vrai nombre de candidatures
    app_count_result = await db.execute(
        select(func.count(JobApplication.id)).where(JobApplication.job_id == job_id)
    )
    real_app_count = app_count_result.scalar() or 0

    # Incrémenter le compteur de vues + synchroniser applications_count
    job.views_count += 1
    job.applications_count = real_app_count
    await db.commit()

    return JobDetailResponse(
        id=job.id,
        title=job.title,
        description=job.description,
        requirements=job.requirements,
        responsibilities=job.responsibilities,
        benefits=job.benefits,
        company_name=company.name,
        company_is_verified=getattr(company, 'is_verified', False),
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
        country=job.country or company.country,
        zone=job.zone,
        language=job.language,
        image_url=job.image_url,
        salary_range=f"{job.salary_min:,} - {job.salary_max:,} {job.currency}" if job.salary_min and job.salary_max else None,
        posted_at=job.posted_at,
        is_featured=job.is_featured,
        views_count=job.views_count,
        applications_count=real_app_count,
        has_applied=has_applied,
        status=job.status.value,
        created_at=job.created_at,
        context=job.context,
        mission_principale=job.mission_principale,
        profil_formation=job.profil_formation,
        profil_experience=job.profil_experience,
        profil_competences=job.profil_competences,
        profil_posture=job.profil_posture,
        profil_autre=job.profil_autre,
    )
