"""
API Routes for Collaborative Notes & Scorecards (ATS Phase 2)
Permet aux recruteurs de collaborer sur l'évaluation des candidatures
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import Annotated, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.database import get_db
from app.auth import require_employer, require_employer_or_admin
from app.models.base import JobApplication, Employer, User, Job, Candidate

router = APIRouter(prefix="/applications", tags=["collaborative-features"])


# ========================================
# Pydantic Schemas
# ========================================

class RecruiterNote(BaseModel):
    """Une note d'un recruteur"""
    user_id: int
    user_name: str
    note: str
    created_at: datetime


class RecruiterNoteCreate(BaseModel):
    """Création d'une nouvelle note"""
    note: str = Field(..., min_length=1, max_length=2000, description="Contenu de la note")


class ScorecardUpdate(BaseModel):
    """Mise à jour de la scorecard"""
    technical_skills: Optional[int] = Field(None, ge=1, le=5, description="Compétences techniques (1-5)")
    soft_skills: Optional[int] = Field(None, ge=1, le=5, description="Soft skills (1-5)")
    experience: Optional[int] = Field(None, ge=1, le=5, description="Expérience (1-5)")
    culture_fit: Optional[int] = Field(None, ge=1, le=5, description="Culture fit (1-5)")
    motivation: Optional[int] = Field(None, ge=1, le=5, description="Motivation (1-5)")
    overall: Optional[int] = Field(None, ge=1, le=5, description="Note globale (1-5)")


class TagsUpdate(BaseModel):
    """Mise à jour des tags"""
    tags: List[str] = Field(..., max_items=10, description="Liste de tags (max 10)")


class RatingUpdate(BaseModel):
    """Mise à jour de la note globale"""
    rating: int = Field(..., ge=1, le=5, description="Note de 1 à 5 étoiles")


class ApplicationCollaborationResponse(BaseModel):
    """Réponse avec toutes les données de collaboration"""
    application_id: int
    recruiter_notes: List[RecruiterNote]
    rating: Optional[int]
    tags: List[str]
    scorecard: Optional[dict]
    
    class Config:
        from_attributes = True


# ========================================
# Helper Functions
# ========================================

async def verify_application_access(
    db: AsyncSession,
    application_id: int,
    employer: Employer
) -> JobApplication:
    """
    Vérifie que l'employeur a accès à cette candidature
    (doit être de la même entreprise que le job)
    """
    result = await db.execute(
        select(JobApplication)
        .options(selectinload(JobApplication.job))
        .where(JobApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Vérifier que le job appartient à la même entreprise
    if application.job.company_id != employer.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this application"
        )
    
    return application


# ========================================
# API Routes - Notes Collaboratives
# ========================================

@router.post("/{application_id}/notes", status_code=status.HTTP_201_CREATED)
async def add_recruiter_note(
    application_id: int,
    note_data: RecruiterNoteCreate,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Ajouter une note de recruteur à une candidature"""
    
    # Vérifier l'accès
    application = await verify_application_access(db, application_id, employer)
    
    # Récupérer l'utilisateur pour avoir son nom
    user_result = await db.execute(
        select(User).where(User.id == employer.user_id)
    )
    user = user_result.scalar_one()
    
    # Initialiser recruiter_notes si nécessaire
    if application.recruiter_notes is None:
        application.recruiter_notes = []
    
    # Créer la nouvelle note
    new_note = {
        "user_id": employer.user_id,
        "user_name": user.name or f"{user.first_name} {user.last_name}",
        "note": note_data.note,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Ajouter la note (JSONB append)
    current_notes = application.recruiter_notes or []
    current_notes.append(new_note)
    application.recruiter_notes = current_notes
    
    await db.commit()
    await db.refresh(application)
    
    return {
        "message": "Note added successfully",
        "note": new_note,
        "total_notes": len(application.recruiter_notes)
    }


@router.get("/{application_id}/notes", response_model=List[RecruiterNote])
async def get_recruiter_notes(
    application_id: int,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Récupérer toutes les notes d'une candidature"""
    
    application = await verify_application_access(db, application_id, employer)
    
    if not application.recruiter_notes:
        return []
    
    # Convertir les dicts JSONB en RecruiterNote objects
    notes = [
        RecruiterNote(
            user_id=note["user_id"],
            user_name=note["user_name"],
            note=note["note"],
            created_at=datetime.fromisoformat(note["created_at"])
        )
        for note in application.recruiter_notes
    ]
    
    return notes


@router.delete("/{application_id}/notes/{note_index}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recruiter_note(
    application_id: int,
    note_index: int,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Supprimer une note spécifique (seul l'auteur peut supprimer)"""
    
    application = await verify_application_access(db, application_id, employer)
    
    if not application.recruiter_notes or note_index >= len(application.recruiter_notes):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Vérifier que c'est l'auteur de la note
    note = application.recruiter_notes[note_index]
    if note["user_id"] != employer.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own notes"
        )
    
    # Supprimer la note
    current_notes = application.recruiter_notes
    current_notes.pop(note_index)
    application.recruiter_notes = current_notes
    
    await db.commit()
    
    return None


# ========================================
# API Routes - Rating
# ========================================

@router.patch("/{application_id}/rating")
async def update_application_rating(
    application_id: int,
    rating_data: RatingUpdate,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Mettre à jour la note globale de la candidature (1-5 étoiles)"""
    
    application = await verify_application_access(db, application_id, employer)
    
    application.rating = rating_data.rating
    await db.commit()
    await db.refresh(application)
    
    return {
        "message": "Rating updated successfully",
        "rating": application.rating
    }


# ========================================
# API Routes - Tags
# ========================================

@router.patch("/{application_id}/tags")
async def update_application_tags(
    application_id: int,
    tags_data: TagsUpdate,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Mettre à jour les tags de la candidature"""
    
    application = await verify_application_access(db, application_id, employer)
    
    # Nettoyer les tags (lowercase, trim)
    cleaned_tags = [tag.strip().lower() for tag in tags_data.tags if tag.strip()]
    # Enlever les doublons
    unique_tags = list(set(cleaned_tags))
    
    application.tags = unique_tags
    await db.commit()
    await db.refresh(application)
    
    return {
        "message": "Tags updated successfully",
        "tags": application.tags
    }


@router.post("/{application_id}/tags/{tag}")
async def add_tag(
    application_id: int,
    tag: str,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Ajouter un tag unique à la candidature"""
    
    application = await verify_application_access(db, application_id, employer)
    
    cleaned_tag = tag.strip().lower()
    
    if not cleaned_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag cannot be empty"
        )
    
    current_tags = application.tags or []
    
    if cleaned_tag not in current_tags:
        current_tags.append(cleaned_tag)
        application.tags = current_tags
        await db.commit()
        await db.refresh(application)
    
    return {
        "message": "Tag added successfully",
        "tags": application.tags
    }


@router.delete("/{application_id}/tags/{tag}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tag(
    application_id: int,
    tag: str,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Supprimer un tag de la candidature"""
    
    application = await verify_application_access(db, application_id, employer)
    
    cleaned_tag = tag.strip().lower()
    current_tags = application.tags or []
    
    if cleaned_tag in current_tags:
        current_tags.remove(cleaned_tag)
        application.tags = current_tags
        await db.commit()
    
    return None


# ========================================
# API Routes - Scorecard
# ========================================

@router.patch("/{application_id}/scorecard")
async def update_application_scorecard(
    application_id: int,
    scorecard_data: ScorecardUpdate,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Mettre à jour la scorecard d'évaluation de la candidature"""
    
    application = await verify_application_access(db, application_id, employer)
    
    # Initialiser la scorecard si nécessaire
    current_scorecard = application.scorecard or {}
    
    # Mettre à jour uniquement les champs fournis
    update_dict = scorecard_data.model_dump(exclude_none=True)
    current_scorecard.update(update_dict)
    
    # Calculer la moyenne automatique si au moins 3 critères sont remplis
    scores = [v for v in current_scorecard.values() if isinstance(v, (int, float))]
    if len(scores) >= 3:
        current_scorecard["average"] = round(sum(scores) / len(scores), 1)
    
    application.scorecard = current_scorecard
    await db.commit()
    await db.refresh(application)
    
    return {
        "message": "Scorecard updated successfully",
        "scorecard": application.scorecard
    }


@router.get("/{application_id}/scorecard")
async def get_application_scorecard(
    application_id: int,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Récupérer la scorecard d'une candidature"""
    
    application = await verify_application_access(db, application_id, employer)
    
    return {
        "application_id": application.id,
        "scorecard": application.scorecard or {},
        "rating": application.rating
    }


# ========================================
# API Routes - Vue complète
# ========================================

@router.get("/{application_id}/collaboration", response_model=ApplicationCollaborationResponse)
async def get_application_collaboration_data(
    application_id: int,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Récupérer toutes les données de collaboration pour une candidature"""
    
    application = await verify_application_access(db, application_id, employer)
    
    # Convertir recruiter_notes en objets RecruiterNote
    notes = []
    if application.recruiter_notes:
        notes = [
            RecruiterNote(
                user_id=note["user_id"],
                user_name=note["user_name"],
                note=note["note"],
                created_at=datetime.fromisoformat(note["created_at"])
            )
            for note in application.recruiter_notes
        ]
    
    return ApplicationCollaborationResponse(
        application_id=application.id,
        recruiter_notes=notes,
        rating=application.rating,
        tags=application.tags or [],
        scorecard=application.scorecard
    )
