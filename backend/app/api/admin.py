"""
Routes Admin pour le back-office
Accessible uniquement par l'admin (software@hcexecutive.net)
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    User, UserRole, Candidate, Employer, Company, Job, JobApplication, 
    Notification, PasswordResetToken, CVDocument,
    EmailTemplate, InterviewSchedule, JobPosting, IntegrationCredential
)
from app.auth import require_admin, PasswordHasher
from app.services.email_service import email_service
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timedelta
import secrets
import string

router = APIRouter(tags=["admin"])


# ==================== MODELS ====================

class AdminStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class UserListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    created_at: datetime


class EmployerListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class JobListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    company_name: str
    employer_email: str
    status: str
    location: Optional[str]
    applications_count: int
    created_at: datetime


class UserActivationUpdate(BaseModel):
    is_active: bool


class CreateUserRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: Literal["candidate", "employer"]
    company_name: Optional[str] = None  # Requis si role == employer


# ==================== ENDPOINTS ====================

@router.get("/stats", response_model=AdminStats)
async def get_admin_statistics(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupérer les statistiques globales de la plateforme
    """
    from datetime import timezone
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

    # Tous les counts basés sur User en 1 seule requête (filtres via func.count().filter())
    result = await db.execute(
        select(
            func.count().label("total"),
            func.count().filter(User.role == UserRole.CANDIDATE).label("candidates"),
            func.count().filter(User.role == UserRole.EMPLOYER).label("employers"),
            func.count().filter(User.is_active == True).label("active"),
            func.count().filter(User.is_active == False).label("inactive"),
            func.count().filter(User.created_at >= seven_days_ago).label("recent"),
        ).select_from(User)
    )
    user_stats = result.one()
    total_users = user_stats.total
    total_candidates = user_stats.candidates
    total_employers = user_stats.employers
    active_users = user_stats.active
    inactive_users = user_stats.inactive
    recent_signups = user_stats.recent

    # Counts des autres entités en 1 seule requête (sous-requêtes scalaires)
    result = await db.execute(
        select(
            select(func.count()).select_from(Company).scalar_subquery().label("companies"),
            select(func.count()).select_from(Job).scalar_subquery().label("jobs"),
            select(func.count()).select_from(JobApplication).scalar_subquery().label("applications"),
            select(func.count()).select_from(Notification).scalar_subquery().label("notifications"),
        )
    )
    entity_stats = result.one()
    total_companies = entity_stats.companies
    total_jobs = entity_stats.jobs
    total_applications = entity_stats.applications
    total_notifications = entity_stats.notifications

    # Jobs par statut
    result = await db.execute(
        select(Job.status, func.count(Job.id).label('count'))
        .group_by(Job.status)
    )
    jobs_by_status_query = result.all()

    jobs_by_status = dict(jobs_by_status_query)

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
        .options(
            selectinload(Job.company),
            selectinload(Job.employer).selectinload(Employer.user)
        )
    )

    if status:
        query = query.filter(Job.status == status)

    query = query.order_by(Job.created_at.desc()).offset(skip).limit(limit)
    result_exec = await db.execute(query)
    jobs = result_exec.scalars().all()

    # Batch query application counts — avoids one query per job (N+1)
    job_ids = [job.id for job in jobs]
    if job_ids:
        count_result = await db.execute(
            select(JobApplication.job_id, func.count(JobApplication.id).label('count'))
            .filter(JobApplication.job_id.in_(job_ids))
            .group_by(JobApplication.job_id)
        )
        app_counts = {row.job_id: row.count for row in count_result}
    else:
        app_counts = {}

    result = []
    for job in jobs:
        company = job.company

        # Employeur already eager-loaded via selectinload on the main query
        employer = job.employer if hasattr(job, 'employer') and job.employer else None
        user = employer.user if employer and hasattr(employer, 'user') else None

        real_applications_count = app_counts.get(job.id, 0)

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


async def _delete_candidate_data(db: AsyncSession, user: User) -> None:
    """Supprime les candidatures et notifications liées d'un candidat."""
    from sqlalchemy import delete as sql_delete

    result = await db.execute(
        select(JobApplication.id).filter(
            JobApplication.candidate_id == user.candidate.id
        )
    )
    application_ids = [row[0] for row in result.fetchall()]

    if application_ids:
        await db.execute(
            sql_delete(Notification).filter(
                Notification.related_application_id.in_(application_ids)
            )
        )

    await db.execute(
        sql_delete(JobApplication).filter(
            JobApplication.candidate_id == user.candidate.id
        )
    )


async def _delete_employer_data(db: AsyncSession, user: User) -> None:
    """Supprime jobs, candidatures liées et l'entreprise orpheline d'un employeur."""
    from sqlalchemy import delete as sql_delete

    company_id = user.employer.company_id

    result = await db.execute(
        select(Job).filter(Job.employer_id == user.employer.id)
    )
    employer_jobs = result.scalars().all()
    job_ids = [job.id for job in employer_jobs]

    if job_ids:
        await db.execute(
            sql_delete(Notification).filter(Notification.related_job_id.in_(job_ids))
        )

        result = await db.execute(
            select(JobApplication.id).filter(JobApplication.job_id.in_(job_ids))
        )
        application_ids = [row[0] for row in result.fetchall()]

        if application_ids:
            await db.execute(
                sql_delete(InterviewSchedule).filter(
                    InterviewSchedule.application_id.in_(application_ids)
                )
            )
            await db.execute(
                sql_delete(Notification).filter(
                    Notification.related_application_id.in_(application_ids)
                )
            )

        await db.execute(
            sql_delete(JobApplication).filter(JobApplication.job_id.in_(job_ids))
        )
        await db.execute(
            sql_delete(JobPosting).filter(JobPosting.job_id.in_(job_ids))
        )

    for job in employer_jobs:
        await db.delete(job)

    # Supprimer l'entreprise si plus aucun autre recruteur n'y est rattaché
    if company_id is not None:
        other_employers = await db.execute(
            select(func.count())
            .select_from(Employer)
            .filter(
                Employer.company_id == company_id,
                Employer.user_id != user.id,
            )
        )
        if (other_employers.scalar() or 0) == 0:
            await db.execute(
                sql_delete(EmailTemplate).filter(EmailTemplate.company_id == company_id)
            )
            await db.execute(
                sql_delete(IntegrationCredential).filter(
                    IntegrationCredential.company_id == company_id
                )
            )
            await db.execute(
                sql_delete(Company).filter(Company.id == company_id)
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
            await _delete_candidate_data(db, user)

        # Si c'est un employeur, supprimer les offres, candidatures et l'entreprise orpheline
        if user.role == UserRole.EMPLOYER and user.employer:
            await _delete_employer_data(db, user)

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


@router.post("/users", response_model=UserListItem, status_code=201)
async def create_user_by_admin(
    data: CreateUserRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Créer un utilisateur (candidat ou employeur) depuis le back-office admin.
    Un mot de passe temporaire est généré et envoyé par email au nouvel utilisateur.
    """
    # Vérifier que l'email n'est pas déjà utilisé
    existing = await db.execute(select(User).filter(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Un compte avec cet email existe déjà")

    if data.role == "employer" and not data.company_name:
        raise HTTPException(status_code=400, detail="Le nom de l'entreprise est requis pour un employeur")

    # Générer un mot de passe temporaire lisible (12 caractères)
    alphabet = string.ascii_letters + string.digits
    temporary_password = ''.join(secrets.choice(alphabet) for _ in range(12))

    # Créer l'utilisateur
    role_enum = UserRole.CANDIDATE if data.role == "candidate" else UserRole.EMPLOYER
    new_user = User(
        email=data.email,
        first_name=data.first_name,
        last_name=data.last_name,
        role=role_enum,
        password_hash=PasswordHasher.hash_password(temporary_password),
        is_active=True,
    )
    db.add(new_user)
    await db.flush()  # Obtenir l'ID sans commit

    # Créer le profil associé
    if data.role == "candidate":
        candidate = Candidate(user_id=new_user.id)
        db.add(candidate)
    else:
        # Créer ou réutiliser l'entreprise
        company_result = await db.execute(
            select(Company).filter(Company.name == data.company_name)
        )
        company = company_result.scalar_one_or_none()
        if not company:
            company = Company(name=data.company_name)
            db.add(company)
            await db.flush()

        employer = Employer(user_id=new_user.id, company_id=company.id)
        db.add(employer)

    await db.commit()
    await db.refresh(new_user)

    # Envoyer l'email de bienvenue en arrière-plan (non bloquant)
    background_tasks.add_task(
        email_service.send_welcome_credentials_email,
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        role=data.role,
        temporary_password=temporary_password,
    )

    return UserListItem(
        id=new_user.id,
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        role=new_user.role.value,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
    )


@router.post("/users/{user_id}/resend-credentials", status_code=200)
async def resend_credentials_email(
    user_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Génère un nouveau mot de passe temporaire et renvoie les identifiants par email.
    À utiliser si l'utilisateur n'a pas reçu son mail de bienvenue.
    """
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Générer un nouveau mot de passe temporaire
    alphabet = string.ascii_letters + string.digits
    temporary_password = ''.join(secrets.choice(alphabet) for _ in range(12))
    user.password_hash = PasswordHasher.hash_password(temporary_password)
    await db.commit()

    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    background_tasks.add_task(
        email_service.send_welcome_credentials_email,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=role_str,
        temporary_password=temporary_password,
    )

    return {"message": f"Email de credentials renvoyé à {user.email}"}


# ==================== COMPANY VERIFICATION ====================

class CompanyVerifyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    is_verified: bool
    verified_at: Optional[datetime]


@router.patch("/companies/{company_id}/verify", response_model=CompanyVerifyResponse)
async def toggle_company_verification(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
) -> CompanyVerifyResponse:
    """Toggle le statut de vérification d'une entreprise."""
    result = await db.execute(select(Company).filter(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    company.is_verified = not company.is_verified
    company.verified_at = datetime.utcnow() if company.is_verified else None
    await db.commit()
    await db.refresh(company)

    return CompanyVerifyResponse(
        id=company.id,
        name=company.name,
        is_verified=company.is_verified,
        verified_at=company.verified_at,
    )


class CompanyRecruiter(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    email: str
    phone: Optional[str]
    position: Optional[str]


class CompanyListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    industry: Optional[str]
    city: Optional[str]
    country: Optional[str]
    is_verified: bool
    jobs_count: int
    employers_count: int
    recruiters: List[CompanyRecruiter] = []
    created_at: datetime


@router.get("/companies", response_model=List[CompanyListItem])
async def list_companies(
    search: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Liste toutes les entreprises avec leur nombre d'offres et employeurs."""
    from sqlalchemy import func as sqlfunc
    query = select(
        Company,
        sqlfunc.count(Job.id.distinct()).label("jobs_count"),
        sqlfunc.count(Employer.id.distinct()).label("employers_count"),
    ).outerjoin(Job, Job.company_id == Company.id).outerjoin(Employer, Employer.company_id == Company.id).group_by(Company.id)

    if search:
        query = query.filter(Company.name.ilike(f"%{search}%"))

    query = query.order_by(Company.name)
    result = await db.execute(query)
    rows = result.all()

    # Charger les recruteurs (employeurs + leur user) pour chaque entreprise
    company_ids = [row.Company.id for row in rows]
    recruiters_by_company: dict[int, List[CompanyRecruiter]] = {}
    if company_ids:
        recruiters_result = await db.execute(
            select(Employer)
            .options(selectinload(Employer.user))
            .filter(Employer.company_id.in_(company_ids))
        )
        for employer in recruiters_result.scalars().all():
            user = employer.user
            if user is None:
                continue
            recruiters_by_company.setdefault(employer.company_id, []).append(
                CompanyRecruiter(
                    id=user.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email,
                    phone=employer.phone,
                    position=employer.position,
                )
            )

    return [
        CompanyListItem(
            id=row.Company.id,
            name=row.Company.name,
            industry=row.Company.industry,
            city=row.Company.city,
            country=row.Company.country,
            is_verified=row.Company.is_verified,
            jobs_count=row.jobs_count,
            employers_count=row.employers_count,
            recruiters=recruiters_by_company.get(row.Company.id, []),
            created_at=row.Company.created_at,
        )
        for row in rows
    ]


@router.delete("/companies/{company_id}")
async def delete_company(
    company_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Supprime une entreprise et tout ce qui lui est lié en cascade :
    notifications → candidatures → offres → profils employeurs → comptes recruteurs → entreprise.
    Les comptes User des recruteurs rattachés à l'entreprise sont également supprimés
    (sauf l'admin courant), afin qu'ils ne puissent plus se connecter.
    """
    from sqlalchemy import delete as sql_delete

    result = await db.execute(select(Company).filter(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    # 1. Récupérer les IDs des jobs liés
    job_ids_result = await db.execute(select(Job.id).filter(Job.company_id == company_id))
    job_ids = [r[0] for r in job_ids_result.fetchall()]

    if job_ids:
        # 2. Récupérer les IDs des candidatures liées à ces jobs
        app_ids_result = await db.execute(
            select(JobApplication.id).filter(JobApplication.job_id.in_(job_ids))
        )
        app_ids = [r[0] for r in app_ids_result.fetchall()]

        # 3. Supprimer les entretiens planifiés (Phase 2)
        if app_ids:
            await db.execute(
                sql_delete(InterviewSchedule).filter(InterviewSchedule.application_id.in_(app_ids))
            )

        # 4. Supprimer les notifications liées aux candidatures et jobs
        if app_ids:
            await db.execute(
                sql_delete(Notification).filter(Notification.related_application_id.in_(app_ids))
            )
        await db.execute(
            sql_delete(Notification).filter(Notification.related_job_id.in_(job_ids))
        )

        # 5. Supprimer les candidatures
        await db.execute(
            sql_delete(JobApplication).filter(JobApplication.job_id.in_(job_ids))
        )

        # 6. Supprimer les publications multi-canaux (Phase 2)
        await db.execute(
            sql_delete(JobPosting).filter(JobPosting.job_id.in_(job_ids))
        )

        # 7. Supprimer les offres
        await db.execute(sql_delete(Job).filter(Job.company_id == company_id))

    # 8. Supprimer les templates email liés à l'entreprise (Phase 2)
    await db.execute(
        sql_delete(EmailTemplate).filter(EmailTemplate.company_id == company_id)
    )

    # 9. Supprimer les credentials d'intégration (Phase 2)
    await db.execute(
        sql_delete(IntegrationCredential).filter(IntegrationCredential.company_id == company_id)
    )

    # 10. Récupérer les recruteurs rattachés à l'entreprise (+ leur compte User)
    employers_result = await db.execute(
        select(Employer)
        .options(selectinload(Employer.user))
        .filter(Employer.company_id == company_id)
    )
    company_employers = employers_result.scalars().all()

    # Comptes User des recruteurs à supprimer (on épargne l'admin courant)
    recruiter_users = [
        emp.user
        for emp in company_employers
        if emp.user is not None and emp.user.id != current_user.id
    ]
    recruiter_user_ids = [u.id for u in recruiter_users]

    if recruiter_user_ids:
        # Nettoyer les données liées aux comptes recruteurs (non gérées par le cascade ORM)
        await db.execute(
            sql_delete(Notification).filter(Notification.user_id.in_(recruiter_user_ids))
        )
        await db.execute(
            sql_delete(PasswordResetToken).filter(
                PasswordResetToken.user_id.in_(recruiter_user_ids)
            )
        )
        await db.execute(
            sql_delete(CVDocument).filter(CVDocument.user_id.in_(recruiter_user_ids))
        )

    # 11. Supprimer les comptes recruteurs via l'ORM
    #     (le cascade supprime Employer, Account, Session automatiquement)
    for recruiter in recruiter_users:
        await db.delete(recruiter)

    # 12. Supprimer les éventuels profils employeurs restants (recruteur = admin conservé)
    await db.execute(
        sql_delete(Employer).filter(Employer.company_id == company_id)
    )

    # 13. Supprimer l'entreprise
    await db.execute(sql_delete(Company).filter(Company.id == company_id))
    await db.commit()

    deleted_accounts = len(recruiter_users)
    suffix = (
        f" et {deleted_accounts} compte(s) recruteur associé(s)"
        if deleted_accounts
        else ""
    )
    return {
        "message": f"Entreprise \"{company.name}\"{suffix} et toutes ses données supprimées."
    }
