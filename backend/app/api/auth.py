from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.base import User, UserRole, Candidate, Company, Employer
from app.auth import get_current_user, require_user, ClerkAuth, clerk_client
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Schémas pour l'authentification
class UserProfile(BaseModel):
    clerk_id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole

class CompleteRegistration(BaseModel):
    role: UserRole
    # Pour les candidats
    phone: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None
    
    # Pour les employeurs
    company_name: Optional[str] = None
    company_industry: Optional[str] = None
    position: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    clerk_id: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    has_completed_profile: bool
    
    class Config:
        from_attributes = True

@router.post("/auth/sync", response_model=UserResponse)
async def sync_user_with_clerk(
    user_profile: UserProfile,
    db: Session = Depends(get_db)
):
    """
    Synchroniser un utilisateur avec Clerk après inscription/connexion
    Appelé par le frontend après auth Clerk
    """
    try:
        print(f"DEBUG: Syncing user: {user_profile.clerk_id}, {user_profile.email}")
        # Vérifier si l'utilisateur existe déjà (par clerk_id ou par email)
        existing_user = db.query(User).filter(
            (User.clerk_id == user_profile.clerk_id) | (User.email == user_profile.email)
        ).first()
        
        if existing_user:
            # Mettre à jour les informations si nécessaire
            existing_user.clerk_id = user_profile.clerk_id  # Mettre à jour le clerk_id aussi
            existing_user.email = user_profile.email
            existing_user.first_name = user_profile.first_name
            existing_user.last_name = user_profile.last_name
            existing_user.role = user_profile.role
            db.commit()
            db.refresh(existing_user)
            
            # Vérifier si le profil est complet
            has_completed_profile = await _check_profile_completion(existing_user, db)
            
            return UserResponse(
                **existing_user.__dict__,
                has_completed_profile=has_completed_profile
            )
        
        # Créer un nouvel utilisateur
        new_user = User(
            clerk_id=user_profile.clerk_id,
            email=user_profile.email,
            first_name=user_profile.first_name,
            last_name=user_profile.last_name,
            role=user_profile.role,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return UserResponse(
            **new_user.__dict__,
            has_completed_profile=False
        )
        
    except Exception as e:
        print(f"DEBUG: Error syncing user: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        logger.error(f"Error syncing user with Clerk: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync user: {str(e)}")

@router.post("/auth/complete-registration")
async def complete_registration(
    registration_data: CompleteRegistration,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Compléter l'inscription après authentification Clerk
    """
    try:
        # Mettre à jour le rôle si nécessaire
        if current_user.role != registration_data.role:
            current_user.role = registration_data.role
        
        if registration_data.role == UserRole.CANDIDATE:
            # Créer le profil candidat
            candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
            if not candidate:
                candidate = Candidate(
                    user_id=current_user.id,
                    phone=registration_data.phone,
                    location=registration_data.location,
                    title=registration_data.title,
                    is_looking_for_job=True,
                    profile_completed=False
                )
                db.add(candidate)
        
        elif registration_data.role == UserRole.EMPLOYER:
            # Créer ou récupérer l'entreprise
            company = None
            if registration_data.company_name:
                company = db.query(Company).filter(Company.name == registration_data.company_name).first()
                if not company:
                    company = Company(
                        name=registration_data.company_name,
                        industry=registration_data.company_industry
                    )
                    db.add(company)
                    db.commit()
                    db.refresh(company)
            
            # Créer le profil employeur
            employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
            if not employer and company:
                employer = Employer(
                    user_id=current_user.id,
                    company_id=company.id,
                    position=registration_data.position,
                    can_create_jobs=True,
                    can_manage_candidates=True,
                    is_admin=True  # Premier employeur = admin de l'entreprise
                )
                db.add(employer)
        
        db.commit()
        
        # Mettre à jour les métadonnées Clerk avec le rôle
        try:
            if clerk_client:
                print(f"DEBUG: Updating Clerk metadata for user {current_user.clerk_id} with role {registration_data.role.value}")
                clerk_client.users.update_metadata(
                    user_id=current_user.clerk_id,
                    public_metadata={"role": registration_data.role.value}
                )
                print("DEBUG: Clerk metadata updated successfully")
        except Exception as e:
            print(f"DEBUG: Failed to update Clerk metadata: {e}")
            # Ne pas faire échouer l'endpoint si la mise à jour Clerk échoue
            pass
        
        return {"message": "Registration completed successfully", "role": registration_data.role.value}
        
    except Exception as e:
        logger.error(f"Error completing registration: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete registration")

@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer le profil de l'utilisateur actuel
    """
    has_completed_profile = await _check_profile_completion(current_user, db)
    
    return UserResponse(
        **current_user.__dict__,
        has_completed_profile=has_completed_profile
    )

@router.post("/auth/webhook")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook Clerk pour synchroniser les changements d'utilisateurs
    """
    try:
        payload = await request.json()
        event_type = payload.get("type")
        
        if event_type == "user.created":
            # Utilisateur créé dans Clerk
            user_data = payload.get("data")
            # Logique de synchronisation si nécessaire
            pass
        
        elif event_type == "user.updated":
            # Utilisateur mis à jour dans Clerk
            user_data = payload.get("data")
            clerk_id = user_data.get("id")
            
            # Mettre à jour l'utilisateur dans notre DB
            user = db.query(User).filter(User.clerk_id == clerk_id).first()
            if user:
                user.email = user_data.get("email_addresses", [{}])[0].get("email_address", user.email)
                user.first_name = user_data.get("first_name", user.first_name)
                user.last_name = user_data.get("last_name", user.last_name)
                db.commit()
        
        return {"message": "Webhook processed successfully"}
        
    except Exception as e:
        logger.error(f"Error processing Clerk webhook: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

async def _check_profile_completion(user: User, db: Session) -> bool:
    """
    Vérifier si le profil utilisateur est complet
    """
    if user.role == UserRole.CANDIDATE:
        candidate = db.query(Candidate).filter(Candidate.user_id == user.id).first()
        return candidate is not None and candidate.profile_completed
    
    elif user.role == UserRole.EMPLOYER:
        employer = db.query(Employer).filter(Employer.user_id == user.id).first()
        return employer is not None
    
    return True  # Admin toujours complet
