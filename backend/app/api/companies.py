from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import logging

from app.database import get_db
from app.auth import get_current_user
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

class CompanyStatsResponse(BaseModel):
    active_jobs: int
    total_jobs: int
    total_applications: int
    total_employers: int

# ==================== Routes ====================

@router.get("/my-company", response_model=CompanyResponse)
async def get_my_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les informations de l'entreprise de l'employeur connecté
    """
    logger.info(f"Récupération entreprise pour user_id={current_user.id}, role={current_user.role}")
    
    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Accès refusé: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")
    
    # Récupérer l'employeur
    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mettre à jour les informations de l'entreprise de l'employeur connecté
    """
    logger.info(f"Mise à jour entreprise pour user_id={current_user.id}")
    
    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Accès refusé: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")
    
    # Récupérer l'employeur
    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
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
        db.commit()
        db.refresh(company)
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
        db.rollback()
        logger.error(f"Erreur lors de la mise à jour de l'entreprise: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")

@router.get("/my-company/stats", response_model=CompanyStatsResponse)
async def get_company_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les statistiques de l'entreprise de l'employeur connecté
    """
    logger.info(f"Récupération stats entreprise pour user_id={current_user.id}")
    
    if current_user.role != UserRole.EMPLOYER:
        logger.warning("Accès refusé: utilisateur non employeur")
        raise HTTPException(status_code=403, detail="Accès réservé aux employeurs")
    
    # Récupérer l'employeur
    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    if not employer:
        logger.error(f"Employeur introuvable pour user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="Employeur introuvable")
    
    company = employer.company
    if not company:
        logger.error(f"Entreprise introuvable pour employer_id={employer.id}")
        raise HTTPException(status_code=404, detail="Entreprise introuvable")
    
    # Calculer les statistiques
    # Offres actives
    active_jobs = db.query(Job).filter(
        Job.company_id == company.id,
        Job.status == JobStatus.PUBLISHED
    ).count()
    
    # Total offres
    total_jobs = db.query(Job).filter(Job.company_id == company.id).count()
    
    # Total candidatures reçues
    total_applications = db.query(JobApplication).join(Job).filter(
        Job.company_id == company.id
    ).count()
    
    # Total employeurs de l'entreprise
    total_employers = db.query(Employer).filter(Employer.company_id == company.id).count()
    
    logger.info(f"Stats: active_jobs={active_jobs}, total_jobs={total_jobs}, applications={total_applications}")
    
    return CompanyStatsResponse(
        active_jobs=active_jobs,
        total_jobs=total_jobs,
        total_applications=total_applications,
        total_employers=total_employers
    )
