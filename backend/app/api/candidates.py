from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.base import User, Candidate, Experience, Education, Skill, SkillCategory, CandidateCV
from app.auth import get_current_user, require_user
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Schémas Pydantic pour les données du profil

class CVResponse(BaseModel):
    id: int
    filename: str
    file_size: Optional[int]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExperienceBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: str  # Format YYYY-MM
    end_date: Optional[str] = None  # Format YYYY-MM
    is_current: bool = False
    description: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(ExperienceBase):
    pass

class ExperienceResponse(ExperienceBase):
    id: int

    class Config:
        from_attributes = True

class EducationBase(BaseModel):
    degree: str
    school: str
    location: Optional[str] = None
    start_date: str  # Format YYYY-MM
    end_date: str    # Format YYYY-MM
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationUpdate(EducationBase):
    pass

class EducationResponse(EducationBase):
    id: int

    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    level: int = Field(..., ge=1, le=5)  # 1-5
    category: SkillCategory

class SkillCreate(SkillBase):
    pass

class SkillUpdate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int

    class Config:
        from_attributes = True

class CandidateProfileBase(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    years_experience: Optional[int] = None
    salary_expectation_min: Optional[int] = None
    salary_expectation_max: Optional[int] = None
    cv_url: Optional[str] = None
    cv_filename: Optional[str] = None
    cv_uploaded_at: Optional[datetime] = None

class CandidateProfileUpdate(CandidateProfileBase):
    pass

class CandidateProfileResponse(CandidateProfileBase):
    id: int
    user_id: int
    experiences: List[ExperienceResponse] = []
    educations: List[EducationResponse] = []
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True

# Endpoints

@router.get("/profile", response_model=CandidateProfileResponse)
async def get_candidate_profile(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Récupérer le profil complet du candidat connecté"""
    
    # Vérifier que l'utilisateur est un candidat
    if current_user.role.value != 'candidate':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les candidats peuvent accéder à cette ressource"
        )
    
    # Récupérer ou créer le profil candidat
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    
    if not candidate:
        # Créer un profil candidat vide
        candidate = Candidate(
            user_id=current_user.id,
            phone=None,
            location=None,
            title=None,
            summary=None
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
    
    logger.info(f"Profile retrieved for candidate {candidate.id}")
    logger.info(f"🔍 CV Info - filename: {candidate.cv_filename}, url: {candidate.cv_url}, uploaded_at: {candidate.cv_uploaded_at}")
    
    # Transformer les données pour correspondre au format frontend
    response_data = {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "phone": candidate.phone,
        "location": candidate.location,
        "title": candidate.title,
        "bio": candidate.summary,  # Mapping summary -> bio pour le frontend
        "linkedin_url": candidate.linkedin_url,
        "website_url": candidate.website_url,
        "years_experience": candidate.years_experience,
        "salary_expectation_min": candidate.salary_expectation_min,
        "salary_expectation_max": candidate.salary_expectation_max,
        "experiences": candidate.experiences,
        "educations": candidate.educations,
        "skills": candidate.skills,
        "cv_filename": candidate.cv_filename,
        "cv_uploaded_at": candidate.cv_uploaded_at,
        "cv_url": f"/api/candidates/{candidate.id}/cv" if candidate.cv_filename else None
    }
    
    return response_data

@router.put("/profile", response_model=CandidateProfileResponse)
async def update_candidate_profile(
    profile_data: CandidateProfileUpdate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Mettre à jour le profil du candidat connecté"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les candidats peuvent modifier leur profil"
        )
    
    # Récupérer le profil candidat
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    
    if not candidate:
        # Créer le profil s'il n'existe pas
        candidate = Candidate(user_id=current_user.id)
        db.add(candidate)
        db.flush()
    
    # Mettre à jour les champs
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        if hasattr(candidate, field):
            setattr(candidate, field, value)
    
    db.commit()
    db.refresh(candidate)
    
    logger.info(f"Profile updated for candidate {candidate.id}")
    
    # Retourner la même structure que GET /profile
    response_data = {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "phone": candidate.phone,
        "location": candidate.location,
        "title": candidate.title,
        "bio": candidate.summary,
        "linkedin_url": candidate.linkedin_url,
        "website_url": candidate.website_url,
        "years_experience": candidate.years_experience,
        "salary_expectation_min": candidate.salary_expectation_min,
        "salary_expectation_max": candidate.salary_expectation_max,
        "experiences": candidate.experiences,
        "educations": candidate.educations,
        "skills": candidate.skills,
        "cv_filename": candidate.cv_filename,
        "cv_uploaded_at": candidate.cv_uploaded_at,
        "cv_url": f"/api/candidates/{candidate.id}/cv" if candidate.cv_filename else None
    }
    
    return response_data

# Endpoints pour les expériences

@router.post("/profile/experiences", response_model=ExperienceResponse)
async def create_experience(
    experience_data: ExperienceCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Ajouter une nouvelle expérience"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les candidats peuvent ajouter des expériences"
        )
    
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil candidat non trouvé"
        )
    
    experience = Experience(
        candidate_id=candidate.id,
        **experience_data.model_dump()
    )
    
    db.add(experience)
    db.commit()
    db.refresh(experience)
    
    return experience

@router.put("/profile/experiences/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: int,
    experience_data: ExperienceUpdate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Mettre à jour une expérience"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    experience = db.query(Experience).filter(
        Experience.id == experience_id,
        Experience.candidate_id == candidate.id
    ).first()
    
    if not experience:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    for field, value in experience_data.model_dump(exclude_unset=True).items():
        setattr(experience, field, value)
    
    db.commit()
    db.refresh(experience)
    
    return experience

@router.delete("/profile/experiences/{experience_id}")
async def delete_experience(
    experience_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Supprimer une expérience"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    experience = db.query(Experience).filter(
        Experience.id == experience_id,
        Experience.candidate_id == candidate.id
    ).first()
    
    if not experience:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(experience)
    db.commit()
    
    return {"message": "Expérience supprimée avec succès"}

# Endpoints pour Education

@router.post("/profile/education", response_model=EducationResponse)
async def create_education(
    education_data: EducationCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Ajouter une nouvelle formation"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les candidats peuvent ajouter des formations"
        )
    
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil candidat non trouvé"
        )
    
    education = Education(
        candidate_id=candidate.id,
        **education_data.model_dump()
    )
    
    db.add(education)
    db.commit()
    db.refresh(education)
    
    return education

@router.put("/profile/education/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: int,
    education_data: EducationUpdate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Mettre à jour une formation"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    education = db.query(Education).filter(
        Education.id == education_id,
        Education.candidate_id == candidate.id
    ).first()
    
    if not education:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    for field, value in education_data.model_dump(exclude_unset=True).items():
        setattr(education, field, value)
    
    db.commit()
    db.refresh(education)
    
    return education

@router.delete("/profile/education/{education_id}")
async def delete_education(
    education_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Supprimer une formation"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    education = db.query(Education).filter(
        Education.id == education_id,
        Education.candidate_id == candidate.id
    ).first()
    
    if not education:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(education)
    db.commit()
    
    return {"message": "Formation supprimée avec succès"}

# Endpoints pour Skills

@router.post("/profile/skills", response_model=SkillResponse)
async def create_skill(
    skill_data: SkillCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Ajouter une nouvelle compétence"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    skill = Skill(
        candidate_id=candidate.id,
        **skill_data.model_dump()
    )
    
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill

@router.put("/profile/skills/{skill_id}", response_model=SkillResponse)  
async def update_skill(
    skill_id: int,
    skill_data: SkillUpdate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Mettre à jour une compétence"""
    
    if current_user.role.value != 'candidate':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.candidate_id == candidate.id
    ).first()
    
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    for field, value in skill_data.model_dump(exclude_unset=True).items():
        setattr(skill, field, value)
    
    db.commit()
    db.refresh(skill)
    
    return skill

# Import pour le téléchargement de fichiers
from fastapi import File, UploadFile
from sqlalchemy import func

# Endpoint pour télécharger un CV
@router.post("/cv")
async def upload_cv(
    cv: UploadFile = File(...),
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Télécharger un CV pour le candidat"""
    
    try:
        # Vérifier le type de fichier (header check)
        if cv.content_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seuls les fichiers PDF sont acceptés"
            )

        # Récupérer ou créer le profil candidat
        candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not candidate:
            candidate = Candidate(
                user_id=current_user.id,
                phone=None,
                location=None,
                title=None,
                summary=None
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

        # Lire le contenu du fichier
        cv_content = await cv.read()

        # Vérifier la taille réelle du fichier (max 5MB)
        file_size = len(cv_content)
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Le fichier ne peut pas dépasser 5MB (taille actuelle: {file_size / (1024*1024):.2f}MB)"
            )

        # Vérifier le magic byte du PDF (validation supplémentaire)
        if not cv_content.startswith(b'%PDF'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier ne semble pas être un PDF valide"
            )

        logger.info(f"Début du téléchargement CV pour utilisateur {current_user.id}")
        logger.info(f"Nom du fichier: {cv.filename}")
        logger.info(f"Taille du fichier: {file_size} bytes")

        # Sauvegarder le fichier sur le disque local
        import os
        import re
        cv_dir = "uploads/cv"
        os.makedirs(cv_dir, exist_ok=True)

        # Sanitiser le nom de fichier (enlever les caractères dangereux)
        safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', cv.filename)

        # Créer un nom de fichier unique
        import uuid
        unique_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}_{safe_filename}"
        cv_path = os.path.join(cv_dir, unique_filename)
        
        # Écrire le fichier sur le disque
        with open(cv_path, "wb") as f:
            f.write(cv_content)
        
        # Créer un nouvel enregistrement CV au lieu d'écraser l'ancien
        new_cv = CandidateCV(
            candidate_id=candidate.id,
            filename=cv.filename,
            file_path=cv_path,
            file_size=len(cv_content),
            is_active=True  # Le nouveau CV devient actif
        )
        
        # Désactiver les anciens CV (optionnel - garde tous actifs pour l'instant)
        # db.query(CandidateCV).filter(CandidateCV.candidate_id == candidate.id).update({"is_active": False})
        
        db.add(new_cv)
        
        # Aussi mettre à jour les champs legacy dans candidate pour compatibilité
        candidate.cv_filename = cv.filename
        candidate.cv_uploaded_at = func.now()
        candidate.cv_url = cv_path
        
        logger.info(f"Nouveau CV ajouté - filename: {cv.filename}")
        logger.info(f"CV sauvegardé sur disque: {cv_path} ({len(cv_content)} bytes)")
        
        db.commit()
        db.refresh(new_cv)
        
        logger.info(f"Après commit - cv_filename: {candidate.cv_filename}")
        logger.info(f"Après commit - cv_uploaded_at: {candidate.cv_uploaded_at}")
        
        logger.info(f"CV téléchargé avec succès pour l'utilisateur {current_user.id}: {cv.filename}")
        
        return {
            "message": "CV téléchargé avec succès",
            "filename": cv.filename,
            "size": len(cv_content),
            "candidate_id": candidate.id,
            "cv_id": new_cv.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement du CV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne du serveur"
        )


@router.get("/cv/download")
async def download_cv(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Télécharger le CV du candidat connecté"""
    
    logger.info(f"🔍 Tentative de téléchargement CV pour utilisateur {current_user.id}")
    
    # Récupérer le candidat
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    
    logger.info(f"📊 Candidat trouvé: {candidate is not None}")
    if candidate:
        logger.info(f"📊 CV filename: {candidate.cv_filename}")
        logger.info(f"📊 CV URL: {candidate.cv_url}")
        logger.info(f"📊 CV uploaded_at: {candidate.cv_uploaded_at}")
    
    if not candidate:
        logger.warning("❌ Aucun candidat trouvé")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil candidat non trouvé"
        )
    
    if not candidate.cv_filename:
        logger.warning("❌ Aucun nom de fichier CV")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun CV téléchargé"
        )
    
    if not candidate.cv_url:
        logger.warning("❌ Aucun chemin de fichier CV")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chemin du fichier CV introuvable"
        )
    
    import os
    from fastapi.responses import FileResponse
    
    # Vérifier que le fichier existe
    if not os.path.exists(candidate.cv_url):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier CV introuvable"
        )
    
    return FileResponse(
        path=candidate.cv_url,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={candidate.cv_filename}"
        }
    )


@router.get("/cvs", response_model=List[CVResponse])
async def list_cvs(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Lister tous les CV du candidat connecté"""
    
    # Récupérer le candidat
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    
    if not candidate:
        return []
    
    # Récupérer tous les CV du candidat
    cvs = db.query(CandidateCV).filter(
        CandidateCV.candidate_id == candidate.id
    ).order_by(CandidateCV.created_at.desc()).all()
    
    logger.info(f"📋 {len(cvs)} CV(s) trouvé(s) pour le candidat {candidate.id}")
    
    return cvs


@router.get("/cvs/{cv_id}/download")
async def download_specific_cv(
    cv_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Télécharger un CV spécifique par son ID"""
    
    # Récupérer le candidat
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil candidat non trouvé"
        )
    
    # Récupérer le CV spécifique
    cv = db.query(CandidateCV).filter(
        CandidateCV.id == cv_id,
        CandidateCV.candidate_id == candidate.id
    ).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV non trouvé"
        )
    
    # Vérifier que le fichier existe
    import os
    if not os.path.exists(cv.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier CV introuvable sur le serveur"
        )
    
    from fastapi.responses import FileResponse
    
    return FileResponse(
        path=cv.file_path,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={cv.filename}"
        }
    )


@router.delete("/cvs/{cv_id}")
async def delete_cv(
    cv_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Supprimer un CV spécifique"""
    
    # Récupérer le candidat
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil candidat non trouvé"
        )
    
    # Récupérer le CV spécifique
    cv = db.query(CandidateCV).filter(
        CandidateCV.id == cv_id,
        CandidateCV.candidate_id == candidate.id
    ).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV non trouvé"
        )
    
    # Supprimer le fichier du disque
    import os
    try:
        if os.path.exists(cv.file_path):
            os.remove(cv.file_path)
            logger.info(f"🗑️ Fichier supprimé: {cv.file_path}")
    except Exception as e:
        logger.warning(f"⚠️ Erreur suppression fichier: {e}")
    
    # Supprimer l'enregistrement de la base de données
    db.delete(cv)
    db.commit()
    
    logger.info(f"✅ CV supprimé: {cv.filename}")
    
    return {"message": "CV supprimé avec succès"}


@router.get("/{candidate_id}/cv")
async def get_candidate_cv(
    candidate_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Récupérer le CV d'un candidat spécifique (pour les employeurs)"""
    
    # Pour l'instant, seuls les propriétaires peuvent voir leur CV
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.user_id == current_user.id
    ).first()
    
    if not candidate or not candidate.cv_filename or not candidate.cv_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV non trouvé"
        )
    
    import os
    from fastapi.responses import FileResponse
    
    # Vérifier que le fichier existe
    if not os.path.exists(candidate.cv_url):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier CV introuvable"
        )
    
    return FileResponse(
        path=candidate.cv_url,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={candidate.cv_filename}"
        }
    )
