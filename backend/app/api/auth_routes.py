from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.base import User, UserRole, Candidate, Employer, PasswordResetToken
from app.auth import PasswordHasher, Auth, require_user
from app.services.email_service import email_service
from typing import Optional
from datetime import datetime, timedelta, timezone
import secrets
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


# Schemas
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str  # "candidate" or "employer"


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    """
    Inscription d'un nouvel utilisateur
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Valider le rôle
    try:
        user_role = UserRole(request.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'candidate' or 'employer'"
        )
    
    # Hasher le mot de passe
    password_hash = PasswordHasher.hash_password(request.password)
    
    # Créer l'utilisateur
    new_user = User(
        email=request.email,
        password_hash=password_hash,
        first_name=request.first_name,
        last_name=request.last_name,
        name=f"{request.first_name} {request.last_name}",
        role=user_role,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Créer le profil associé (Candidate ou Employer)
    if user_role == UserRole.CANDIDATE:
        candidate = Candidate(user_id=new_user.id)
        db.add(candidate)
    elif user_role == UserRole.EMPLOYER:
        employer = Employer(user_id=new_user.id)
        db.add(employer)
    
    db.commit()
    
    # Générer le token JWT
    access_token = Auth.create_access_token(
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role.value
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "role": new_user.role.value
        }
    }


@router.post("/signin", response_model=AuthResponse)
async def signin(request: SignInRequest, db: Session = Depends(get_db)):
    """
    Connexion d'un utilisateur existant
    """
    # Chercher l'utilisateur
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Vérifier le mot de passe
    if not user.password_hash or not PasswordHasher.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Vérifier que le compte est actif
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Générer le token JWT
    access_token = Auth.create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role.value
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "image": user.image
        }
    }


@router.get("/me")
async def get_current_user_info(user: User = Depends(require_user)):
    """
    Récupérer les informations de l'utilisateur connecté
    """
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "name": user.name,
        "role": user.role.value,
        "image": user.image,
        "is_active": user.is_active
    }


# Schemas pour changement de mot de passe et email
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ChangeEmailRequest(BaseModel):
    new_email: EmailStr
    password: str  # Demander le mot de passe pour confirmer


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Changer le mot de passe de l'utilisateur connecté
    """
    # Vérifier l'ancien mot de passe
    hasher = PasswordHasher()
    if not hasher.verify_password(request.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Valider le nouveau mot de passe (minimum 8 caractères)
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    # Hasher et sauvegarder le nouveau mot de passe
    user.password_hash = hasher.hash_password(request.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/change-email")
async def change_email(
    request: ChangeEmailRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Changer l'adresse email de l'utilisateur connecté
    """
    # Vérifier le mot de passe pour confirmer l'identité
    hasher = PasswordHasher()
    if not hasher.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )
    
    # Vérifier si le nouvel email existe déjà
    existing_user = db.query(User).filter(
        User.email == request.new_email,
        User.id != user.id
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use"
        )
    
    # Mettre à jour l'email
    user.email = request.new_email
    db.commit()
    
    return {"message": "Email changed successfully", "new_email": request.new_email}


@router.delete("/delete-account")
async def delete_account(
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer le compte de l'utilisateur connecté
    """
    try:
        # Si c'est un candidat, supprimer les candidatures d'abord
        if user.role == UserRole.CANDIDATE and user.candidate:
            from app.models.base import JobApplication
            # Supprimer toutes les candidatures
            db.query(JobApplication).filter(
                JobApplication.candidate_id == user.candidate.id
            ).delete()

        # Si c'est un employeur, supprimer les offres d'emploi et candidatures associées
        if user.role == UserRole.EMPLOYER and user.employer:
            from app.models.base import Job, JobApplication
            # Récupérer tous les jobs de l'employeur
            employer_jobs = db.query(Job).filter(Job.employer_id == user.employer.id).all()
            for job in employer_jobs:
                # Supprimer les candidatures pour chaque job
                db.query(JobApplication).filter(JobApplication.job_id == job.id).delete()
                # Supprimer le job
                db.delete(job)

        # Maintenant supprimer l'utilisateur (cascade supprimera candidate/employer et autres relations)
        db.delete(user)
        db.commit()

        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting account: {str(e)}"
        )


# Schemas pour réinitialisation de mot de passe
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Demander une réinitialisation de mot de passe

    Envoie un email avec un lien de réinitialisation sécurisé.
    Pour des raisons de sécurité, retourne toujours un succès même si l'email n'existe pas.
    """
    try:
        # Chercher l'utilisateur
        user = db.query(User).filter(User.email == request.email).first()

        if user:
            # Invalider tous les tokens existants non utilisés de cet utilisateur
            db.query(PasswordResetToken).filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at.is_(None)
            ).update({"used_at": datetime.now(timezone.utc)})

            # Générer un token sécurisé
            token = secrets.token_urlsafe(32)

            # Créer le token de réinitialisation (expire dans 24h)
            reset_token = PasswordResetToken(
                user_id=user.id,
                token=token,
                expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
            )

            db.add(reset_token)
            db.commit()

            # Envoyer l'email
            email_sent = email_service.send_password_reset_email(
                email=user.email,
                token=token,
                user_name=user.first_name or user.name
            )

            if not email_sent:
                logger.error(f"Failed to send password reset email to {user.email}")
                # Ne pas lever d'exception pour ne pas révéler si l'email existe

        # Toujours retourner un succès (sécurité: ne pas révéler si l'email existe)
        return {
            "message": "If this email exists in our system, you will receive password reset instructions shortly."
        }

    except Exception as e:
        logger.error(f"Error in forgot_password: {str(e)}")
        db.rollback()
        # Retourner un succès même en cas d'erreur (sécurité)
        return {
            "message": "If this email exists in our system, you will receive password reset instructions shortly."
        }


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Réinitialiser le mot de passe avec un token valide
    """
    # Chercher le token
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token
    ).first()

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Vérifier si le token a déjà été utilisé
    if reset_token.used_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset token has already been used"
        )

    # Vérifier si le token a expiré
    if datetime.now(timezone.utc) > reset_token.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset token has expired. Please request a new one."
        )

    # Valider le nouveau mot de passe
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )

    # Récupérer l'utilisateur
    user = db.query(User).filter(User.id == reset_token.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Hasher et mettre à jour le mot de passe
    user.password_hash = PasswordHasher.hash_password(request.new_password)

    # Marquer le token comme utilisé
    reset_token.used_at = datetime.now(timezone.utc)

    # Invalider tous les autres tokens de cet utilisateur
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.id != reset_token.id,
        PasswordResetToken.used_at.is_(None)
    ).update({"used_at": datetime.now(timezone.utc)})

    db.commit()

    logger.info(f"Password successfully reset for user {user.email}")

    return {
        "message": "Password reset successfully. You can now sign in with your new password."
    }
