from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models.base import User, Employer
from app.auth import require_user
from typing import Optional

router = APIRouter()


class UpdateEmployerRequest(BaseModel):
    company_id: Optional[int] = None
    position: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    employer_type: Optional[str] = None


@router.get("/employers/me")
async def get_my_employer_profile(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer le profil employeur de l'utilisateur connecté"""
    result = await db.execute(
        select(Employer).filter(Employer.user_id == user.id)
    )
    employer = result.scalar_one_or_none()

    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found"
        )

    return {
        "id": employer.id,
        "user_id": employer.user_id,
        "company_id": employer.company_id,
        "position": employer.position,
        "department": employer.department,
        "phone": employer.phone,
        "can_create_jobs": employer.can_create_jobs,
        "can_manage_candidates": employer.can_manage_candidates,
        "is_admin": employer.is_admin
    }


@router.put("/employers/me")
async def update_my_employer_profile(
    request: UpdateEmployerRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Mettre à jour le profil employeur de l'utilisateur connecté"""
    result = await db.execute(
        select(Employer).filter(Employer.user_id == user.id)
    )
    employer = result.scalar_one_or_none()

    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found"
        )

    # Mettre à jour les champs fournis
    if request.company_id is not None:
        employer.company_id = request.company_id
    if request.position is not None:
        employer.position = request.position
    if request.department is not None:
        employer.department = request.department
    if request.phone is not None:
        employer.phone = request.phone
    # Note: employer_type n'est pas dans le modèle, on peut l'ignorer ou l'ajouter

    await db.commit()
    await db.refresh(employer)

    return {
        "message": "Employer profile updated successfully",
        "employer": {
            "id": employer.id,
            "company_id": employer.company_id,
            "position": employer.position,
            "department": employer.department,
            "phone": employer.phone
        }
    }
