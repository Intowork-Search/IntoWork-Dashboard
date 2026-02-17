"""
Routes Admin pour le back-office
Accessible uniquement par l'admin (software@hcexecutive.net)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    User, UserRole, Candidate, Employer, Company, Job, JobApplication, 
    Notification, PasswordResetToken, CVDocument
)
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
    db: AsyncSession = Depends(get_db)
):
    """
    Récupérer les statistiques globales de la plateforme
    """
    # Compter les utilisateurs
    result = await db.execute(select(func.count()).select_from(User))
    total_users = result.scalar()

    result = await db.execute(select(func.count()).select_from(User).filter(User.role == UserRole.CANDIDATE))
    total_candidates = result.scalar()

    result = await db.execute(select(func.count()).select_from(User).filter(User.role == UserRole.EMPLOYER))
    total_employers = result.scalar()

    result = await db.execute(select(func.count()).select_from(User).filter(User.is_active == True))
    active_users = result.scalar()

    result = await db.execute(select(func.count()).select_from(User).filter(User.is_active == False))
    inactive_users = result.scalar()

    # Compter les autres entités
    result = await db.execute(select(func.count()).select_from(Company))
    total_companies = result.scalar()

    result = await db.execute(select(func.count()).select_from(Job))
    total_jobs = result.scalar()

    result = await db.execute(select(func.count()).select_from(JobApplication))
    total_applications = result.scalar()

    result = await db.execute(select(func.count()).select_from(Notification))
    total_notifications = result.scalar()

    # Jobs par statut
    result = await db.execute(
        select(Job.status, func.count(Job.id).label('count'))
        .group_by(Job.status)
    )
    jobs_by_status_query = result.all()

    jobs_by_status = dict(jobs_by_status_query)

    # Inscriptions récentes (7 derniers jours)
    from datetime import timezone
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(select(func.count()).select_from(User).filter(User.created_at >= seven_days_ago))
    recent_signups = result.scalar()

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
    db: AsyncSession = Depends(get_db)
):
    """
    Récupérer la liste de tous les utilisateurs avec filtres
    """
    query = select(User)

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
    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()

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
    db: AsyncSession = Depends(get_db)
):
    """
    Récupérer la liste de tous les employeurs avec leurs informations
    """
    query = (
        select(Employer)
        .join(User)
        .outerjoin(Company)
        .filter(User.role == UserRole.EMPLOYER)
        .options(selectinload(Employer.user), selectinload(Employer.company))
        .order_by(Employer.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result_exec = await db.execute(query)
    employers = result_exec.scalars().all()

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
    db: AsyncSession = Depends(get_db)
):
    """
    Récupérer toutes les offres d'emploi (vue admin)
    """
    query = (
        select(Job)
        .join(Company)
        .join(Employer)
        .join(User)
        .options(selectinload(Job.company))
    )

    if status:
        query = query.filter(Job.status == status)

    query = query.order_by(Job.created_at.desc()).offset(skip).limit(limit)
    result_exec = await db.execute(query)
    jobs = result_exec.scalars().all()

    result = []
    for job in jobs:
        company = job.company

        # Récupérer l'employeur
        employer_query = select(Employer).filter(Employer.id == job.employer_id).options(selectinload(Employer.user))
        employer_result = await db.execute(employer_query)
        employer = employer_result.scalar_one_or_none()
        user = employer.user if employer else None

        # Compter les candidatures réelles pour cette offre
        count_result = await db.execute(
            select(func.count()).select_from(JobApplication).filter(JobApplication.job_id == job.id)
        )
        real_applications_count = count_result.scalar()

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
    db: AsyncSession = Depends(get_db)
):
    """
    Activer ou désactiver un utilisateur
    """
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Empêcher l'admin de se désactiver lui-même
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    user.is_active = update.is_active
    await db.commit()
    await db.refresh(user)

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
    db: AsyncSession = Depends(get_db)
):
    """
    Supprimer un utilisateur (DANGER: cascade delete)
    """
    from sqlalchemy import delete as sql_delete
    
    result = await db.execute(
        select(User)
        .options(selectinload(User.candidate), selectinload(User.employer))
        .filter(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Empêcher l'admin de se supprimer lui-même
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    try:
        # 1. Supprimer d'abord toutes les notifications de l'utilisateur
        await db.execute(
            sql_delete(Notification).filter(Notification.user_id == user.id)
        )
        
        # 2. Supprimer les tokens de réinitialisation de mot de passe
        await db.execute(
            sql_delete(PasswordResetToken).filter(PasswordResetToken.user_id == user.id)
        )
        
        # 3. Supprimer les CV documents (CV Builder)
        await db.execute(
            sql_delete(CVDocument).filter(CVDocument.user_id == user.id)
        )

        # Si c'est un candidat, supprimer les candidatures
        if user.role == UserRole.CANDIDATE and user.candidate:
            # Récupérer les IDs des candidatures pour supprimer les notifications liées
            result = await db.execute(
                select(JobApplication.id).filter(
                    JobApplication.candidate_id == user.candidate.id
                )
            )
            application_ids = [row[0] for row in result.fetchall()]
            
            # Supprimer les notifications qui référencent ces candidatures
            if application_ids:
                await db.execute(
                    sql_delete(Notification).filter(
                        Notification.related_application_id.in_(application_ids)
                    )
                )
            
            # Supprimer toutes les candidatures
            await db.execute(
                sql_delete(JobApplication).filter(
                    JobApplication.candidate_id == user.candidate.id
                )
            )

        # Si c'est un employeur, supprimer les offres d'emploi et candidatures associées
        if user.role == UserRole.EMPLOYER and user.employer:
            # Récupérer tous les jobs de l'employeur
            result = await db.execute(
                select(Job).filter(Job.employer_id == user.employer.id)
            )
            employer_jobs = result.scalars().all()
            job_ids = [job.id for job in employer_jobs]

            if job_ids:
                # Supprimer les notifications liées à ces jobs
                await db.execute(
                    sql_delete(Notification).filter(
                        Notification.related_job_id.in_(job_ids)
                    )
                )

                # Récupérer les IDs des candidatures liées à ces jobs
                result = await db.execute(
                    select(JobApplication.id).filter(
                        JobApplication.job_id.in_(job_ids)
                    )
                )
                application_ids = [row[0] for row in result.fetchall()]
                
                # Supprimer les notifications liées à ces candidatures
                if application_ids:
                    await db.execute(
                        sql_delete(Notification).filter(
                            Notification.related_application_id.in_(application_ids)
                        )
                    )
                
                # Supprimer les candidatures
                await db.execute(
                    sql_delete(JobApplication).filter(
                        JobApplication.job_id.in_(job_ids)
                    )
                )

            # Supprimer les jobs
            for job in employer_jobs:
                await db.delete(job)

        # Maintenant supprimer l'utilisateur (cascade supprimera candidate/employer et autres relations)
        await db.delete(user)
        await db.commit()

        return {"message": f"User {user.email} deleted successfully"}
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting user: {str(e)}"
        )



@router.get("/me")
async def get_admin_info(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
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
