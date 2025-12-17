from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.base import Job, Company, Employer, JobStatus, JobType, JobLocation
from pydantic import BaseModel

router = APIRouter()

# Modèles Pydantic
class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    company_name: str
    company_logo_url: Optional[str] = None
    location: Optional[str] = None
    location_type: str
    job_type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str
    posted_at: Optional[datetime] = None
    is_featured: bool = False
    views_count: int = 0
    applications_count: int = 0

class JobDetailResponse(JobResponse):
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    company_description: Optional[str] = None
    company_industry: Optional[str] = None
    company_size: Optional[str] = None

class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int
    total_pages: int

@router.get("/", response_model=JobListResponse)
async def get_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    search: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    location_type: Optional[str] = None,
    salary_min: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des offres d'emploi avec filtres et pagination
    """
    query = db.query(Job, Company).join(Company, Job.company_id == Company.id)
    query = query.filter(Job.status == JobStatus.PUBLISHED)
    
    # Filtres
    if search:
        query = query.filter(
            Job.title.ilike(f"%{search}%") | 
            Job.description.ilike(f"%{search}%") |
            Company.name.ilike(f"%{search}%")
        )
    
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    
    if job_type:
        try:
            job_type_enum = JobType(job_type)
            query = query.filter(Job.job_type == job_type_enum)
        except ValueError:
            pass
    
    if location_type:
        try:
            location_type_enum = JobLocation(location_type)
            query = query.filter(Job.location_type == location_type_enum)
        except ValueError:
            pass
    
    if salary_min:
        query = query.filter(Job.salary_min >= salary_min)
    
    # Pagination
    total = query.count()
    offset = (page - 1) * limit
    results = query.order_by(desc(Job.posted_at)).offset(offset).limit(limit).all()
    
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
            applications_count=job.applications_count
        ))
    
    total_pages = (total + limit - 1) // limit
    
    return JobListResponse(
        jobs=jobs,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{job_id}", response_model=JobDetailResponse)
async def get_job(job_id: int, db: Session = Depends(get_db)):
    """
    Récupérer les détails d'une offre d'emploi
    """
    result = db.query(Job, Company).join(Company, Job.company_id == Company.id).filter(
        Job.id == job_id,
        Job.status == JobStatus.PUBLISHED
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job, company = result
    
    # Incrémenter le compteur de vues
    job.views_count += 1
    db.commit()
    
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
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        currency=job.currency,
        posted_at=job.posted_at,
        is_featured=job.is_featured,
        views_count=job.views_count,
        applications_count=job.applications_count
    )

@router.get("/stats/recent")
async def get_recent_jobs_count(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """
    Récupérer le nombre d'offres d'emploi récentes
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    count = db.query(Job).filter(
        Job.status == JobStatus.PUBLISHED,
        Job.posted_at >= cutoff_date
    ).count()
    
    return {"count": count, "days": days}
