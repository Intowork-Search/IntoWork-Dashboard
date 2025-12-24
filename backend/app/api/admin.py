"""
Routes Admin pour le back-office
Accessible uniquement par l'admin (software@hcexecutive.net)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.models.base import User, UserRole, Candidate, Employer, Company, Job, JobApplication, Notification
from app.auth import require_admin
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(tags=["admin"])


# ==================== MODELS ====================

class AdminStats(BaseModel):
    total_users: int
    total_candidates: int
    total_employers: int
    total_companies: int
    total_jobs: int
    total_applications: int
    total_notifications: int
    active_users: int
    inactive_users: int
    jobs_by_status: dict
    recent_signups: int  # derniers 7 jours
    
    class Config:
        from_attributes = True


class UserListItem(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class EmployerListItem(BaseModel):
    id: int
    user_id: int
    email: str
    first_name: str
    last_name: str
    company_name: Optional[str]
    position: Optional[str]
    phone: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class JobListItem(BaseModel):
    id: int
    title: str
    company_name: str
    employer_email: str
    status: str
    location: Optional[str]
    applications_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserActivationUpdate(BaseModel):
    is_active: bool


# ==================== ENDPOINTS ====================

@router.get("/stats", response_model=AdminStats)
async def get_admin_statistics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Récupérer les statistiques globales de la plateforme
    """
    # Compter les utilisateurs
    total_users = db.query(User).count()
    total_candidates = db.query(User).filter(User.role == UserRole.CANDIDATE).count()
    total_employers = db.query(User).filter(User.role == UserRole.EMPLOYER).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    inactive_users = db.query(User).filter(User.is_active == False).count()
    
    # Compter les autres entités
    total_companies = db.query(Company).count()
    total_jobs = db.query(Job).count()
    total_applications = db.query(JobApplication).count()
    total_notifications = db.query(Notification).count()
    
    # Jobs par statut
    jobs_by_status_query = db.query(
        Job.status,
        func.count(Job.id).label('count')
    ).group_by(Job.status).all()
    
    jobs_by_status = dict(jobs_by_status_query)
    
    # Inscriptions récentes (7 derniers jours)
    from datetime import timezone
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_signups = db.query(User).filter(User.created_at >= seven_days_ago).count()
    
    return AdminStats(
        total_users=total_users,
        total_candidates=total_candidates,
        total_employers=total_employers,
        total_companies=total_companies,
        total_jobs=total_jobs,
        total_applications=total_applications,
        total_notifications=total_notifications,
        active_users=active_users,
        inactive_users=inactive_users,
        jobs_by_status=jobs_by_status,
        recent_signups=recent_signups
    )


@router.get("/users", response_model=List[UserListItem])
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste de tous les utilisateurs avec filtres
    """
    query = db.query(User)
    
    # Filtres
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_pattern)) |
            (User.first_name.ilike(search_pattern)) |
            (User.last_name.ilike(search_pattern))
        )
    
    # Pagination
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        UserListItem(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role.value,
            is_active=user.is_active,
            created_at=user.created_at
        )
        for user in users
    ]


@router.get("/employers", response_model=List[EmployerListItem])
async def get_all_employers(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste de tous les employeurs avec leurs informations
    """
    employers = db.query(Employer).join(User).outerjoin(Company).filter(
        User.role == UserRole.EMPLOYER
    ).order_by(Employer.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for employer in employers:
        user = employer.user
        company = employer.company
        
        result.append(EmployerListItem(
            id=employer.id,
            user_id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            company_name=company.name if company else None,
            position=employer.position,
            phone=employer.phone,
            is_active=user.is_active,
            created_at=employer.created_at
        ))
    
    return result


@router.get("/jobs", response_model=List[JobListItem])
async def get_all_jobs(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Récupérer toutes les offres d'emploi (vue admin)
    """
    query = db.query(Job).join(Company).join(Employer).join(User)
    
    if status:
        query = query.filter(Job.status == status)
    
    jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for job in jobs:
        company = job.company
        employer = db.query(Employer).filter(Employer.id == job.employer_id).first()
        user = employer.user if employer else None
        
        # Compter les candidatures réelles pour cette offre
        real_applications_count = db.query(JobApplication).filter(JobApplication.job_id == job.id).count()
        
        result.append(JobListItem(
            id=job.id,
            title=job.title,
            company_name=company.name,
            employer_email=user.email if user else "N/A",
            status=job.status,
            location=job.location,
            applications_count=real_applications_count,
            created_at=job.created_at
        ))
    
    return result


@router.put("/users/{user_id}/activate", response_model=UserListItem)
async def toggle_user_activation(
    user_id: int,
    update: UserActivationUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Activer ou désactiver un utilisateur
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Empêcher l'admin de se désactiver lui-même
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    user.is_active = update.is_active
    db.commit()
    db.refresh(user)
    
    return UserListItem(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at
    )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Supprimer un utilisateur (DANGER: cascade delete)
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Empêcher l'admin de se supprimer lui-même
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.email} deleted successfully"}


@router.get("/me")
async def get_admin_info(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Récupérer les informations de l'admin connecté
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role.value,
        "is_active": current_user.is_active
    }
