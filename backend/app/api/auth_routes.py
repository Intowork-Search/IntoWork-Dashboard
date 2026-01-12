"""
Phase 2 - Tasks 14 & 15: Authentication Routes with Response Models and Annotated Types

This module implements authentication endpoints using FastAPI 0.100+ patterns:
- Explicit response_model on all endpoints
- Annotated types for dependency injection
- Centralized Pydantic schemas
"""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timedelta, timezone
import secrets
from loguru import logger
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models.base import User, UserRole, Candidate, Employer, PasswordResetToken, Session
from app.auth import (
    PasswordHasher, Auth, CurrentUser, DBSession,
    REFRESH_TOKEN_EXPIRATION_DAYS
)
from app.services.email_service import email_service
from app.schemas import (
    SignUpRequest, SignInRequest, AuthResponse, AuthUserData,
    RefreshTokenRequest, RefreshTokenResponse,
    ChangePasswordRequest, ChangePasswordResponse,
    ChangeEmailRequest, ChangeEmailResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
    DeleteAccountResponse, UserMeResponse
)

router = APIRouter()

# Security: Rate limiter to prevent brute force attacks
limiter = Limiter(key_func=get_remote_address)


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def signup(
    request: Request,
    signup_data: SignUpRequest,
    db: DBSession
) -> AuthResponse:
    """
    Inscription d'un nouvel utilisateur

    Rate limit: 3 requests per hour per IP address
    """
    # Vérifier si l'email existe déjà (ASYNC)
    result = await db.execute(
        select(User).filter(User.email == signup_data.email)
    )
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Security: Validate password strength before creating account
    is_valid, error_message = PasswordHasher.validate_password_strength(signup_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    # Valider le rôle
    try:
        user_role = UserRole(signup_data.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'candidate' or 'employer'"
        )

    # Hasher le mot de passe
    password_hash = PasswordHasher.hash_password(signup_data.password)

    # Créer l'utilisateur
    new_user = User(
        email=signup_data.email,
        password_hash=password_hash,
        first_name=signup_data.first_name,
        last_name=signup_data.last_name,
        name=f"{signup_data.first_name} {signup_data.last_name}",
        role=user_role,
        is_active=True
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Créer le profil associé (Candidate ou Employer)
    if user_role == UserRole.CANDIDATE:
        candidate = Candidate(user_id=new_user.id)
        db.add(candidate)
    elif user_role == UserRole.EMPLOYER:
        employer = Employer(user_id=new_user.id)
        db.add(employer)

    await db.commit()

    # Phase 2 - Task 12: Generate both access and refresh tokens
    access_token = Auth.create_access_token(
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role.value
    )

    refresh_token = Auth.create_refresh_token(
        user_id=new_user.id,
        email=new_user.email
    )

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=AuthUserData(
            id=new_user.id,
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            role=new_user.role.value
        )
    )


@router.post("/signin", response_model=AuthResponse)
@limiter.limit("5/15minutes")
async def signin(
    request: Request,
    signin_data: SignInRequest,
    db: DBSession
) -> AuthResponse:
    """
    Connexion d'un utilisateur existant

    Rate limit: 5 requests per 15 minutes per IP address
    """
    # Chercher l'utilisateur (ASYNC)
    result = await db.execute(
        select(User).filter(User.email == signin_data.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Vérifier le mot de passe
    if not user.password_hash or not PasswordHasher.verify_password(signin_data.password, user.password_hash):
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

    # Phase 2 - Task 12: Generate both access and refresh tokens
    access_token = Auth.create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role.value
    )

    refresh_token = Auth.create_refresh_token(
        user_id=user.id,
        email=user.email
    )

    # Store refresh token hash in database for validation
    refresh_token_hash = PasswordHasher.hash_password(refresh_token)

    # Create session with refresh token
    session = Session(
        user_id=user.id,
        session_token=access_token[-32:],
        expires=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRATION_DAYS),
        refresh_token_hash=refresh_token_hash
    )
    db.add(session)
    await db.commit()

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=AuthUserData(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role.value,
            image=user.image
        )
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
@limiter.limit("10/minute")
async def refresh_tokens(
    request: Request,
    refresh_data: RefreshTokenRequest,
    db: DBSession
) -> RefreshTokenResponse:
    """
    Phase 2 - Task 12: Refresh access token using refresh token

    This endpoint implements token rotation:
    1. Validates the refresh token
    2. Issues a new access token
    3. Issues a new refresh token (invalidates old one)
    4. Updates session with new refresh token hash

    Rate limit: 10 requests per minute per IP address
    """
    try:
        # Verify refresh token JWT signature and expiration
        payload = Auth.verify_token(refresh_data.refresh_token, token_type="refresh")
        user_id = int(payload.get("sub"))
        email = payload.get("email")

        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid refresh token payload")

        # Find session with matching refresh token hash
        result = await db.execute(
            select(Session).filter(Session.user_id == user_id)
        )
        sessions = result.scalars().all()

        # Verify refresh token hash matches stored hash
        valid_session = None
        for session in sessions:
            if session.refresh_token_hash and PasswordHasher.verify_password(
                refresh_data.refresh_token, session.refresh_token_hash
            ):
                valid_session = session
                break

        if not valid_session:
            raise HTTPException(
                status_code=401,
                detail="Invalid or revoked refresh token"
            )

        # Check session expiration
        if datetime.now(timezone.utc) > valid_session.expires:
            await db.delete(valid_session)
            await db.commit()
            raise HTTPException(
                status_code=401,
                detail="Refresh token expired. Please sign in again."
            )

        # Get user to include role in new access token
        user_result = await db.execute(
            select(User).filter(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()

        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or inactive")

        # Generate new tokens (token rotation)
        new_access_token = Auth.create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value
        )

        new_refresh_token = Auth.create_refresh_token(
            user_id=user.id,
            email=user.email
        )

        # Update session with new refresh token hash
        new_refresh_token_hash = PasswordHasher.hash_password(new_refresh_token)
        valid_session.refresh_token_hash = new_refresh_token_hash
        valid_session.session_token = new_access_token[-32:]
        valid_session.expires = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRATION_DAYS)
        valid_session.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(f"Tokens refreshed for user {user.email}")

        return RefreshTokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing tokens: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to refresh tokens"
        )


@router.get("/me", response_model=UserMeResponse)
async def get_current_user_info(
    user: CurrentUser
) -> UserMeResponse:
    """
    Récupérer les informations de l'utilisateur connecté
    """
    return UserMeResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        name=user.name,
        role=user.role.value,
        image=user.image,
        is_active=user.is_active
    )


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    request_data: ChangePasswordRequest,
    user: CurrentUser,
    db: DBSession
) -> ChangePasswordResponse:
    """
    Changer le mot de passe de l'utilisateur connecté
    """
    # Vérifier l'ancien mot de passe
    if not PasswordHasher.verify_password(request_data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Security: Validate new password strength
    is_valid, error_message = PasswordHasher.validate_password_strength(request_data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    # Hasher et sauvegarder le nouveau mot de passe
    user.password_hash = PasswordHasher.hash_password(request_data.new_password)
    await db.commit()

    return ChangePasswordResponse(message="Password changed successfully")


@router.post("/change-email", response_model=ChangeEmailResponse)
async def change_email(
    request_data: ChangeEmailRequest,
    user: CurrentUser,
    db: DBSession
) -> ChangeEmailResponse:
    """
    Changer l'adresse email de l'utilisateur connecté
    """
    # Vérifier le mot de passe pour confirmer l'identité
    if not PasswordHasher.verify_password(request_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )

    # Vérifier si le nouvel email existe déjà (ASYNC)
    result = await db.execute(
        select(User).filter(
            User.email == request_data.new_email,
            User.id != user.id
        )
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use"
        )

    # Mettre à jour l'email
    user.email = request_data.new_email
    await db.commit()

    return ChangeEmailResponse(
        message="Email changed successfully",
        new_email=request_data.new_email
    )


@router.delete("/delete-account", response_model=DeleteAccountResponse)
async def delete_account(
    user: CurrentUser,
    db: DBSession
) -> DeleteAccountResponse:
    """
    Supprimer le compte de l'utilisateur connecté
    """
    try:
        # Si c'est un candidat, supprimer les candidatures d'abord
        if user.role == UserRole.CANDIDATE and user.candidate:
            from app.models.base import JobApplication
            from sqlalchemy import delete as sql_delete
            # Supprimer toutes les candidatures (ASYNC)
            await db.execute(
                sql_delete(JobApplication).filter(
                    JobApplication.candidate_id == user.candidate.id
                )
            )

        # Si c'est un employeur, supprimer les offres d'emploi et candidatures associées
        if user.role == UserRole.EMPLOYER and user.employer:
            from app.models.base import Job, JobApplication
            from sqlalchemy import delete as sql_delete
            # Récupérer tous les jobs de l'employeur (ASYNC)
            result = await db.execute(
                select(Job).filter(Job.employer_id == user.employer.id)
            )
            employer_jobs = result.scalars().all()

            for job in employer_jobs:
                # Supprimer les candidatures pour chaque job
                await db.execute(
                    sql_delete(JobApplication).filter(JobApplication.job_id == job.id)
                )
                # Supprimer le job
                await db.delete(job)

        # Maintenant supprimer l'utilisateur (cascade supprimera candidate/employer et autres relations)
        await db.delete(user)
        await db.commit()

        return DeleteAccountResponse(message="Account deleted successfully")
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting account: {str(e)}"
        )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
@limiter.limit("3/hour")
async def forgot_password(
    request: Request,
    forgot_data: ForgotPasswordRequest,
    db: DBSession
) -> ForgotPasswordResponse:
    """
    Demander une réinitialisation de mot de passe

    Envoie un email avec un lien de réinitialisation sécurisé.
    Pour des raisons de sécurité, retourne toujours un succès même si l'email n'existe pas.

    Rate limit: 3 requests per hour per IP address
    """
    try:
        # Chercher l'utilisateur (ASYNC)
        result = await db.execute(
            select(User).filter(User.email == forgot_data.email)
        )
        user = result.scalar_one_or_none()

        if user:
            # Invalider tous les tokens existants non utilisés de cet utilisateur (ASYNC)
            await db.execute(
                update(PasswordResetToken).filter(
                    PasswordResetToken.user_id == user.id,
                    PasswordResetToken.used_at.is_(None)
                ).values(used_at=datetime.now(timezone.utc))
            )

            # Générer un token sécurisé
            token = secrets.token_urlsafe(32)

            # Créer le token de réinitialisation (expire dans 24h)
            reset_token = PasswordResetToken(
                user_id=user.id,
                token=token,
                expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
            )

            db.add(reset_token)
            await db.commit()

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
        return ForgotPasswordResponse(
            message="If this email exists in our system, you will receive password reset instructions shortly."
        )

    except Exception as e:
        logger.error(f"Error in forgot_password: {str(e)}")
        await db.rollback()
        # Retourner un succès même en cas d'erreur (sécurité)
        return ForgotPasswordResponse(
            message="If this email exists in our system, you will receive password reset instructions shortly."
        )


@router.post("/reset-password", response_model=ResetPasswordResponse)
@limiter.limit("5/15minutes")
async def reset_password(
    request: Request,
    reset_data: ResetPasswordRequest,
    db: DBSession
) -> ResetPasswordResponse:
    """
    Réinitialiser le mot de passe avec un token valide

    Rate limit: 5 requests per 15 minutes per IP address
    """
    # Chercher le token (ASYNC)
    result = await db.execute(
        select(PasswordResetToken).filter(
            PasswordResetToken.token == reset_data.token
        )
    )
    reset_token = result.scalar_one_or_none()

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

    # Security: Validate new password strength
    is_valid, error_message = PasswordHasher.validate_password_strength(reset_data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    # Récupérer l'utilisateur (ASYNC)
    user_result = await db.execute(
        select(User).filter(User.id == reset_token.user_id)
    )
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Hasher et mettre à jour le mot de passe
    user.password_hash = PasswordHasher.hash_password(reset_data.new_password)

    # Marquer le token comme utilisé
    reset_token.used_at = datetime.now(timezone.utc)

    # Invalider tous les autres tokens de cet utilisateur (ASYNC)
    await db.execute(
        update(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.id != reset_token.id,
            PasswordResetToken.used_at.is_(None)
        ).values(used_at=datetime.now(timezone.utc))
    )

    await db.commit()

    logger.info(f"Password successfully reset for user {user.email}")

    return ResetPasswordResponse(
        message="Password reset successfully. You can now sign in with your new password."
    )
