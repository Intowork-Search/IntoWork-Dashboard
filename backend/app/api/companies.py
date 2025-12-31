from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional
import logging

from app.database import get_db
from app.auth import require_user
from app.models.base import User, UserRole, Company, Employer, Job, JobStatus, JobApplication

router = APIRouter()
logger = logging.getLogger(__name__)

# ==================== Modèles Pydantic ====================

class CompanyResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyStatsResponse(BaseModel):
    active_jobs: int
    total_jobs: int
    total_applications: int
    total_employers: int

# ==================== Routes ====================

@router.post("", response_model=CompanyResponse, status_code=201)
async def create_company(
    company_data: CompanyCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    Créer une nouvelle entreprise (pour l'onboarding employeur)
    """
    logger.info(f"Création entreprise pour user_id={current_user.id}")

    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Accès refusé: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")

    # Créer l'entreprise
    new_company = Company(
        name=company_data.name,
        description=company_data.description,
        industry=company_data.industry,
        size=company_data.size,
        website_url=company_data.website_url,
        linkedin_url=company_data.linkedin_url,
        address=company_data.address,
        city=company_data.city,
        country=company_data.country,
        logo_url=company_data.logo_url
    )

    db.add(new_company)
    await db.commit()
    await db.refresh(new_company)

    logger.info(f"Entreprise créée: id={new_company.id}, name={new_company.name}")

    return CompanyResponse(
        id=new_company.id,
        name=new_company.name,
        description=new_company.description,
        industry=new_company.industry,
        size=new_company.size,
        website_url=new_company.website_url,
        linkedin_url=new_company.linkedin_url,
        address=new_company.address,
        city=new_company.city,
        country=new_company.country,
        logo_url=new_company.logo_url
    )

@router.get("/my-company", response_model=CompanyResponse)
async def get_my_company(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    Récupérer les informations de l'entreprise de l'employeur connecté
    """
    logger.info(f"Récupération entreprise pour user_id={current_user.id}, role={current_user.role}")

    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Accès refusé: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")

    # Récupérer l'employeur avec eager loading de company
    result = await db.execute(
        select(Employer).options(selectinload(Employer.company)).filter(Employer.user_id == current_user.id)
    )
    employer = result.scalar_one_or_none()
    if not employer:
        logger.error(f"Employeur introuvable pour user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    # Récupérer l'entreprise
    company = employer.company
    if not company:
        logger.error(f"Entreprise introuvable pour employer_id={employer.id}")
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    logger.info(f"Entreprise trouvée: id={company.id}, name={company.name}")

    return CompanyResponse(
        id=company.id,
        name=company.name,
        description=company.description,
        industry=company.industry,
        size=company.size,
        website_url=company.website_url,
        linkedin_url=company.linkedin_url,
        address=company.address,
        city=company.city,
        country=company.country,
        logo_url=company.logo_url
    )

@router.put("/my-company", response_model=CompanyResponse)
async def update_my_company(
    company_data: CompanyUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    Mettre à jour les informations de l'entreprise de l'employeur connecté
    """
    logger.info(f"Mise à jour entreprise pour user_id={current_user.id}")

    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Accès refusé: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")

    # Récupérer l'employeur avec eager loading de company
    result = await db.execute(
        select(Employer).options(selectinload(Employer.company)).filter(Employer.user_id == current_user.id)
    )
    employer = result.scalar_one_or_none()
    if not employer:
        logger.error(f"Employeur introuvable pour user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    # Récupérer l'entreprise
    company = employer.company
    if not company:
        logger.error(f"Entreprise introuvable pour employer_id={employer.id}")
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    # Mettre à jour les champs non nuls
    update_data = company_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    try:
        await db.commit()
        await db.refresh(company)
        logger.info(f"Entreprise id={company.id} mise à jour avec succès")

        return CompanyResponse(
            id=company.id,
            name=company.name,
            description=company.description,
            industry=company.industry,
            size=company.size,
            website_url=company.website_url,
            linkedin_url=company.linkedin_url,
            address=company.address,
            city=company.city,
            country=company.country,
            logo_url=company.logo_url
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Erreur lors de la mise à jour de l'entreprise: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")

@router.get("/my-company/stats", response_model=CompanyStatsResponse)
async def get_company_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    Récupérer les statistiques de l'entreprise de l'employeur connecté
    """
    logger.info(f"Récupération stats entreprise pour user_id={current_user.id}")

    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Accès refusé: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")

    # Récupérer l'employeur avec eager loading de company
    result = await db.execute(
        select(Employer).options(selectinload(Employer.company)).filter(Employer.user_id == current_user.id)
    )
    employer = result.scalar_one_or_none()
    if not employer:
        logger.error(f"Employeur introuvable pour user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    company = employer.company
    if not company:
        logger.error(f"Entreprise introuvable pour employer_id={employer.id}")
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    # Calculer les statistiques
    # Offres actives
    active_jobs_result = await db.execute(
        select(func.count()).select_from(Job).filter(
            Job.company_id == company.id,
            Job.status == JobStatus.PUBLISHED
        )
    )
    active_jobs = active_jobs_result.scalar()

    # Total offres
    total_jobs_result = await db.execute(
        select(func.count()).select_from(Job).filter(Job.company_id == company.id)
    )
    total_jobs = total_jobs_result.scalar()

    # Total candidatures reçues
    total_applications_result = await db.execute(
        select(func.count()).select_from(JobApplication).join(Job).filter(
            Job.company_id == company.id
        )
    )
    total_applications = total_applications_result.scalar()

    # Total employeurs de l'entreprise
    total_employers_result = await db.execute(
        select(func.count()).select_from(Employer).filter(Employer.company_id == company.id)
    )
    total_employers = total_employers_result.scalar()

    logger.info(f"Stats: active_jobs={active_jobs}, total_jobs={total_jobs}, applications={total_applications}")

    return CompanyStatsResponse(
        active_jobs=active_jobs,
        total_jobs=total_jobs,
        total_applications=total_applications,
        total_employers=total_employers
    )
