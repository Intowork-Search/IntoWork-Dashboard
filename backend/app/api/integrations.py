"""
API Routes for External Integrations (LinkedIn, Google Calendar, Outlook)
OAuth flows and service integrations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Annotated, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import secrets
import base64
import os
import logging

logger = logging.getLogger(__name__)

from app.database import get_db
from app.auth import require_employer
from app.models.base import IntegrationCredential, IntegrationProvider, Employer, Job, Company, User
from app.services.linkedin_service import linkedin_service
from app.services.google_calendar_service import google_calendar_service
from app.services.outlook_calendar_service import outlook_calendar_service

router = APIRouter(prefix="/integrations", tags=["integrations"])


# ========================================
# Debug Endpoint (à supprimer en production)
# ========================================

@router.get("/debug/config")
async def debug_oauth_config():
    """Endpoint de debug pour vérifier la configuration OAuth"""
    from app.services.google_calendar_service import (
        GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
    )
    from app.services.outlook_calendar_service import (
        MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_REDIRECT_URI, MICROSOFT_TENANT
    )
    from app.services.linkedin_service import (
        LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
    )
    
    return {
        "google": {
            "client_id": f"{GOOGLE_CLIENT_ID[:20]}..." if GOOGLE_CLIENT_ID else "NOT SET",
            "client_secret_set": bool(GOOGLE_CLIENT_SECRET),
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "redirect_uri_is_localhost": "localhost" in (GOOGLE_REDIRECT_URI or "")
        },
        "microsoft": {
            "client_id": f"{MICROSOFT_CLIENT_ID[:20]}..." if MICROSOFT_CLIENT_ID else "NOT SET",
            "client_secret_set": bool(MICROSOFT_CLIENT_SECRET),
            "redirect_uri": MICROSOFT_REDIRECT_URI,
            "redirect_uri_is_localhost": "localhost" in (MICROSOFT_REDIRECT_URI or ""),
            "tenant": MICROSOFT_TENANT
        },
        "linkedin": {
            "client_id": f"{LINKEDIN_CLIENT_ID[:20]}..." if LINKEDIN_CLIENT_ID else "NOT SET",
            "client_secret_set": bool(LINKEDIN_CLIENT_SECRET)
        }
    }


# ========================================
# Helper Functions
# ========================================

async def get_employer_profile(
    user: Annotated[User, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> Employer:
    """
    Récupérer le profil Employer à partir du User
    Utilisé comme dépendance dans les endpoints
    """
    result = await db.execute(
        select(Employer).where(Employer.user_id == user.id)
    )
    employer = result.scalar_one_or_none()
    
    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found. Please complete your profile setup."
        )
    
    return employer


# ========================================
# Pydantic Schemas
# ========================================

class IntegrationAuthURLResponse(BaseModel):
    """URL d'autorisation OAuth"""
    auth_url: str
    state: str
    provider: str


class IntegrationStatusResponse(BaseModel):
    """Statut d'une intégration"""
    provider: str
    is_connected: bool
    connected_at: Optional[datetime]
    last_used_at: Optional[datetime]


class LinkedInPublishRequest(BaseModel):
    """Requête de publication LinkedIn"""
    job_id: int
    custom_message: Optional[str] = None


class CalendarEventRequest(BaseModel):
    """Requête de création d'événement calendrier"""
    application_id: int
    title: str
    description: str
    start_time: str  # ISO format
    end_time: str  # ISO format
    location: Optional[str] = None
    attendees: list[str]  # Liste d'emails
    create_meeting_link: bool = False  # Google Meet ou Teams
    timezone: str = "Europe/Paris"


# ========================================
# LinkedIn OAuth Routes
# ========================================

@router.get("/linkedin/auth-url", response_model=IntegrationAuthURLResponse)
async def get_linkedin_auth_url(
    employer: Annotated[Employer, Depends(get_employer_profile)]
):
    """
    Générer l'URL d'autorisation LinkedIn OAuth
    
    L'utilisateur sera redirigé vers LinkedIn pour autoriser l'accès
    """
    if not linkedin_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LinkedIn integration is not configured"
        )
    
    # Générer un state token avec le user_id encodé pour le retrouver dans le callback
    # Format: {random_token}:{user_id} encodé en base64
    random_part = secrets.token_urlsafe(32)
    state_data = f"{random_part}:{employer.user_id}"
    state = base64.urlsafe_b64encode(state_data.encode()).decode()
    
    auth_url = linkedin_service.get_authorization_url(state)
    
    return IntegrationAuthURLResponse(
        auth_url=auth_url,
        state=state,
        provider="linkedin"
    )


@router.get("/linkedin/callback")
async def linkedin_oauth_callback(
    code: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Callback OAuth LinkedIn
    
    Reçoit le code d'autorisation et l'échange contre un access token
    OU reçoit une erreur OAuth de LinkedIn
    
    Note: Ce endpoint ne nécessite PAS d'authentification JWT car l'utilisateur
    est redirigé directement par LinkedIn. On utilise le state token pour
    retrouver l'utilisateur et vérifier CSRF.
    """
    # Construire l'URL de redirection vers le frontend
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    redirect_url = f"{frontend_url}/dashboard/integrations"
    
    # Gérer les erreurs OAuth de LinkedIn
    if error:
        error_msg = error_description or error
        logger.warning(f"LinkedIn OAuth error: {error} - {error_msg}")
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=false&error={error_msg}")
    
    # Vérifier que le code est présent
    if not code:
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=false&error=Missing authorization code")
    
    if not linkedin_service.enabled:
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=false&error=LinkedIn integration not configured")
    
    # Décoder le state pour récupérer le user_id
    if not state:
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=false&error=Missing state token")
    
    try:
        # Décoder le state: {random}:{user_id}
        state_data = base64.urlsafe_b64decode(state.encode()).decode()
        _, user_id_str = state_data.split(':')
        user_id = int(user_id_str)
    except Exception as e:
        logger.error(f"Invalid state token: {e}")
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=false&error=Invalid state token")
    
    # Récupérer l'employer à partir du user_id
    result = await db.execute(
        select(Employer).where(Employer.user_id == user_id)
    )
    employer = result.scalar_one_or_none()
    
    if not employer:
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=false&error=Employer profile not found")
    
    if not employer.company_id:
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=false&error=Please create a company profile first")
    
    try:
        # Échanger le code contre un access token
        token_data = await linkedin_service.exchange_code_for_token(code)
        
        # Essayer de récupérer l'organization ID (nécessite Marketing Developer Platform)
        # Si l'app n'a que les scopes standards, on stocke sans organization_id
        organization_id = None
        try:
            organization_id = await linkedin_service.get_company_id(token_data['access_token'])
            logger.info(f"✅ LinkedIn organization ID retrieved: {organization_id}")
        except Exception as org_error:
            logger.warning(f"⚠️  Could not retrieve organization ID (this is normal for standard LinkedIn apps): {org_error}")
            logger.info("📝 Integration will work for personal posts only (not organization posts)")
        
        # Stocker les credentials
        # Vérifier si une intégration existe déjà
        result = await db.execute(
            select(IntegrationCredential).where(
                IntegrationCredential.company_id == employer.company_id,
                IntegrationCredential.provider == IntegrationProvider.LINKEDIN
            )
        )
        existing = result.scalar_one_or_none()
        
        provider_data = {"organization_id": organization_id} if organization_id else {}
        
        if existing:
            # Mettre à jour
            existing.access_token = token_data['access_token']
            existing.token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 5184000))
            existing.provider_data = provider_data
            existing.is_active = True
        else:
            # Créer nouvelle intégration
            integration = IntegrationCredential(
                company_id=employer.company_id,
                user_id=employer.user_id,
                provider=IntegrationProvider.LINKEDIN,
                access_token=token_data['access_token'],
                token_expires_at=datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 5184000)),
                provider_data=provider_data
            )
            db.add(integration)
        
        await db.commit()
        
        # Rediriger vers le frontend avec succès
        org_msg = f", organization {organization_id}" if organization_id else " (personal account only)"
        logger.info(f"✅ LinkedIn integration successful for user {employer.user_id}{org_msg}")
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=true")
        
    except Exception as e:
        logger.error(f"❌ LinkedIn OAuth failed: {str(e)}")
        await db.rollback()
        return RedirectResponse(url=f"{redirect_url}?provider=linkedin&success=false&error={str(e)}")


@router.post("/linkedin/publish-job")
async def publish_job_to_linkedin(
    request: LinkedInPublishRequest,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Publier une offre d'emploi sur LinkedIn
    
    Nécessite une intégration LinkedIn active
    """
    if not employer.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create a company profile before publishing jobs"
        )
    
    # Récupérer le job
    job_result = await db.execute(
        select(Job).where(
            Job.id == request.job_id,
            Job.company_id == employer.company_id
        )
    )
    job = job_result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Récupérer les credentials LinkedIn
    cred_result = await db.execute(
        select(IntegrationCredential).where(
            IntegrationCredential.company_id == employer.company_id,
            IntegrationCredential.provider == IntegrationProvider.LINKEDIN,
            IntegrationCredential.is_active == True
        )
    )
    credentials = cred_result.scalar_one_or_none()
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn integration not connected. Please connect first."
        )
    
    # Récupérer la company
    company_result = await db.execute(select(Company).where(Company.id == employer.company_id))
    company = company_result.scalar_one()
    
    # Préparer les données du job
    job_data = {
        "title": job.title,
        "description": job.description,
        "summary": job.requirements[:500] if job.requirements else "",
        "location": job.location,
        "job_type": job.job_type.value if job.job_type else "",
        "company_name": company.name,
        "apply_url": f"https://intowork.co/jobs/{job.id}"  # TODO: Configurable
    }
    
    try:
        # Publier sur LinkedIn
        post_id = await linkedin_service.publish_job_post(
            access_token=credentials.access_token,
            organization_id=credentials.provider_data.get("organization_id"),
            job_data=job_data
        )
        
        # Mettre à jour last_used_at
        credentials.last_used_at = datetime.utcnow()
        await db.commit()
        
        # TODO: Créer un JobPosting record avec external_id=post_id
        
        return {
            "message": "Job published to LinkedIn successfully",
            "post_id": post_id,
            "job_id": job.id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to publish to LinkedIn: {str(e)}"
        )


# ========================================
# Google Calendar OAuth Routes
# ========================================

@router.get("/google-calendar/auth-url", response_model=IntegrationAuthURLResponse)
async def get_google_calendar_auth_url(
    employer: Annotated[Employer, Depends(get_employer_profile)]
):
    """Générer l'URL d'autorisation Google Calendar OAuth"""
    if not google_calendar_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Calendar integration is not configured"
        )
    
    # Générer un state token avec le user_id encodé
    random_part = secrets.token_urlsafe(32)
    state_data = f"{random_part}:{employer.user_id}"
    state = base64.urlsafe_b64encode(state_data.encode()).decode()
    
    auth_url = google_calendar_service.get_authorization_url(state)
    
    return IntegrationAuthURLResponse(
        auth_url=auth_url,
        state=state,
        provider="google_calendar"
    )


@router.get("/google-calendar/callback")
async def google_calendar_oauth_callback(
    code: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Callback OAuth Google Calendar"""
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    redirect_url = f"{frontend_url}/dashboard/integrations"
    
    # Gérer les erreurs OAuth
    if error:
        error_msg = error_description or error
        logger.warning(f"Google Calendar OAuth error: {error} - {error_msg}")
        return RedirectResponse(url=f"{redirect_url}?provider=google-calendar&success=false&error={error_msg}")
    
    if not code:
        return RedirectResponse(url=f"{redirect_url}?provider=google-calendar&success=false&error=Missing authorization code")
    
    if not google_calendar_service.enabled:
        return RedirectResponse(url=f"{redirect_url}?provider=google-calendar&success=false&error=Google Calendar integration not configured")
    
    # Décoder le state pour récupérer le user_id
    if not state:
        return RedirectResponse(url=f"{redirect_url}?provider=google-calendar&success=false&error=Missing state token")
    
    try:
        state_data = base64.urlsafe_b64decode(state.encode()).decode()
        _, user_id_str = state_data.split(':')
        user_id = int(user_id_str)
    except Exception as e:
        logger.error(f"Invalid state token: {e}")
        return RedirectResponse(url=f"{redirect_url}?provider=google-calendar&success=false&error=Invalid state token")
    
    # Récupérer l'employer
    result = await db.execute(
        select(Employer).where(Employer.user_id == user_id)
    )
    employer = result.scalar_one_or_none()
    
    if not employer or not employer.company_id:
        return RedirectResponse(url=f"{redirect_url}?provider=google-calendar&success=false&error=Employer profile not found")
    
    try:
        # Échanger le code contre un access token
        token_data = await google_calendar_service.exchange_code_for_token(code)
        
        # Stocker les credentials
        result = await db.execute(
            select(IntegrationCredential).where(
                IntegrationCredential.company_id == employer.company_id,
                IntegrationCredential.provider == IntegrationProvider.GOOGLE_CALENDAR
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            existing.access_token = token_data['access_token']
            existing.refresh_token = token_data.get('refresh_token', existing.refresh_token)
            existing.token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 3600))
            existing.is_active = True
        else:
            integration = IntegrationCredential(
                company_id=employer.company_id,
                user_id=employer.user_id,
                provider=IntegrationProvider.GOOGLE_CALENDAR,
                access_token=token_data['access_token'],
                refresh_token=token_data.get('refresh_token'),
                token_expires_at=datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 3600))
            )
            db.add(integration)
        
        await db.commit()
        
        logger.info(f"✅ Google Calendar integration successful for user {employer.user_id}")
        return RedirectResponse(url=f"{redirect_url}?provider=google-calendar&success=true")
        
    except Exception as e:
        logger.error(f"❌ Google Calendar OAuth failed: {str(e)}")
        await db.rollback()
        return RedirectResponse(url=f"{redirect_url}?provider=google-calendar&success=false&error={str(e)}")


@router.post("/google-calendar/create-event")
async def create_google_calendar_event(
    request: CalendarEventRequest,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Créer un événement d'entretien dans Google Calendar"""
    if not employer.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create a company profile before creating calendar events"
        )
    
    # Récupérer les credentials
    cred_result = await db.execute(
        select(IntegrationCredential).where(
            IntegrationCredential.company_id == employer.company_id,
            IntegrationCredential.provider == IntegrationProvider.GOOGLE_CALENDAR,
            IntegrationCredential.is_active == True
        )
    )
    credentials = cred_result.scalar_one_or_none()
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Calendar integration not connected"
        )
    
    try:
        # Préparer les données de l'événement
        interview_data = {
            "title": request.title,
            "description": request.description,
            "start_time": request.start_time,
            "end_time": request.end_time,
            "location": request.location,
            "attendees": request.attendees,
            "timezone": request.timezone,
            "create_meet_link": request.create_meeting_link
        }
        
        # Créer l'événement
        event_id = await google_calendar_service.create_interview_event(
            access_token=credentials.access_token,
            interview_data=interview_data,
            refresh_token=credentials.refresh_token
        )
        
        # Mettre à jour last_used_at
        credentials.last_used_at = datetime.utcnow()
        await db.commit()
        
        # TODO: Mettre à jour InterviewSchedule avec google_event_id
        
        return {
            "message": "Google Calendar event created",
            "event_id": event_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Google Calendar event: {str(e)}"
        )


# ========================================
# Outlook Calendar OAuth Routes
# ========================================

@router.get("/outlook/auth-url", response_model=IntegrationAuthURLResponse)
async def get_outlook_auth_url(
    employer: Annotated[Employer, Depends(get_employer_profile)]
):
    """Générer l'URL d'autorisation Outlook Calendar OAuth"""
    if not outlook_calendar_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Outlook Calendar integration is not configured"
        )
    
    # Générer un state token avec le user_id encodé
    random_part = secrets.token_urlsafe(32)
    state_data = f"{random_part}:{employer.user_id}"
    state = base64.urlsafe_b64encode(state_data.encode()).decode()
    
    auth_url = outlook_calendar_service.get_authorization_url(state)
    
    return IntegrationAuthURLResponse(
        auth_url=auth_url,
        state=state,
        provider="outlook_calendar"
    )


@router.get("/outlook/callback")
async def outlook_oauth_callback(
    code: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Callback OAuth Outlook Calendar"""
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    redirect_url = f"{frontend_url}/dashboard/integrations"
    
    # Gérer les erreurs OAuth
    if error:
        error_msg = error_description or error
        logger.warning(f"Outlook OAuth error: {error} - {error_msg}")
        return RedirectResponse(url=f"{redirect_url}?provider=outlook&success=false&error={error_msg}")
    
    if not code:
        return RedirectResponse(url=f"{redirect_url}?provider=outlook&success=false&error=Missing authorization code")
    
    if not outlook_calendar_service.enabled:
        return RedirectResponse(url=f"{redirect_url}?provider=outlook&success=false&error=Outlook integration not configured")
    
    # Décoder le state pour récupérer le user_id
    if not state:
        return RedirectResponse(url=f"{redirect_url}?provider=outlook&success=false&error=Missing state token")
    
    try:
        state_data = base64.urlsafe_b64decode(state.encode()).decode()
        _, user_id_str = state_data.split(':')
        user_id = int(user_id_str)
    except Exception as e:
        logger.error(f"Invalid state token: {e}")
        return RedirectResponse(url=f"{redirect_url}?provider=outlook&success=false&error=Invalid state token")
    
    # Récupérer l'employer
    result = await db.execute(
        select(Employer).where(Employer.user_id == user_id)
    )
    employer = result.scalar_one_or_none()
    
    if not employer or not employer.company_id:
        return RedirectResponse(url=f"{redirect_url}?provider=outlook&success=false&error=Employer profile not found")
    
    try:
        # Échanger le code contre un access token
        token_data = await outlook_calendar_service.exchange_code_for_token(code)
        
        # Stocker les credentials
        result = await db.execute(
            select(IntegrationCredential).where(
                IntegrationCredential.company_id == employer.company_id,
                IntegrationCredential.provider == IntegrationProvider.OUTLOOK_CALENDAR
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            existing.access_token = token_data['access_token']
            existing.refresh_token = token_data.get('refresh_token', existing.refresh_token)
            existing.token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 3600))
            existing.is_active = True
        else:
            integration = IntegrationCredential(
                company_id=employer.company_id,
                user_id=employer.user_id,
                provider=IntegrationProvider.OUTLOOK_CALENDAR,
                access_token=token_data['access_token'],
                refresh_token=token_data.get('refresh_token'),
                token_expires_at=datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 3600))
            )
            db.add(integration)
        
        await db.commit()
        
        logger.info(f"✅ Outlook integration successful for user {employer.user_id}")
        return RedirectResponse(url=f"{redirect_url}?provider=outlook&success=true")
        
    except Exception as e:
        logger.error(f"❌ Outlook OAuth failed: {str(e)}")
        await db.rollback()
        return RedirectResponse(url=f"{redirect_url}?provider=outlook&success=false&error={str(e)}")


@router.post("/outlook/create-event")
async def create_outlook_event(
    request: CalendarEventRequest,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Créer un événement d'entretien dans Outlook Calendar"""
    if not employer.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create a company profile before creating calendar events"
        )
    
    # Récupérer les credentials
    cred_result = await db.execute(
        select(IntegrationCredential).where(
            IntegrationCredential.company_id == employer.company_id,
            IntegrationCredential.provider == IntegrationProvider.OUTLOOK_CALENDAR,
            IntegrationCredential.is_active == True
        )
    )
    credentials = cred_result.scalar_one_or_none()
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Outlook Calendar integration not connected"
        )
    
    try:
        # Préparer les données de l'événement
        interview_data = {
            "title": request.title,
            "description": request.description,
            "start_time": request.start_time,
            "end_time": request.end_time,
            "location": request.location,
            "attendees": request.attendees,
            "timezone": request.timezone,
            "create_teams_link": request.create_meeting_link
        }
        
        # Créer l'événement
        event_id = await outlook_calendar_service.create_interview_event(
            access_token=credentials.access_token,
            interview_data=interview_data
        )
        
        # Mettre à jour last_used_at
        credentials.last_used_at = datetime.utcnow()
        await db.commit()
        
        # TODO: Mettre à jour InterviewSchedule avec outlook_event_id
        
        return {
            "message": "Outlook Calendar event created",
            "event_id": event_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Outlook event: {str(e)}"
        )


# ========================================
# General Integration Management
# ========================================

@router.get("/status")
async def get_integrations_status(
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Récupérer le statut de toutes les intégrations"""
    
    # Vérifier que l'employeur a une entreprise
    if not employer.company_id:
        # Retourner un statut par défaut si pas d'entreprise
        return {
            "linkedin": {
                "provider": "linkedin",
                "is_connected": False,
                "connected_at": None,
                "last_used_at": None
            },
            "google_calendar": {
                "provider": "google_calendar",
                "is_connected": False,
                "connected_at": None,
                "last_used_at": None
            },
            "outlook_calendar": {
                "provider": "outlook_calendar",
                "is_connected": False,
                "connected_at": None,
                "last_used_at": None
            }
        }
    
    try:
        result = await db.execute(
            select(IntegrationCredential).where(
                IntegrationCredential.company_id == employer.company_id
            )
        )
        integrations = result.scalars().all()
    except Exception as e:
        # En cas d'erreur DB, retourner l'état par défaut
        return {
            "linkedin": {
                "provider": "linkedin",
                "is_connected": False,
                "connected_at": None,
                "last_used_at": None
            },
            "google_calendar": {
                "provider": "google_calendar",
                "is_connected": False,
                "connected_at": None,
                "last_used_at": None
            },
            "outlook_calendar": {
                "provider": "outlook_calendar",
                "is_connected": False,
                "connected_at": None,
                "last_used_at": None
            }
        }
    
    status_map = {
        "linkedin": None,
        "google_calendar": None,
        "outlook_calendar": None
    }
    
    for integration in integrations:
        provider_key = integration.provider.value
        status_map[provider_key] = {
            "provider": provider_key,
            "is_connected": integration.is_active,
            "connected_at": integration.created_at,
            "last_used_at": integration.last_used_at
        }
    
    # Remplir les non-connectés
    for provider in status_map:
        if status_map[provider] is None:
            status_map[provider] = {
                "provider": provider,
                "is_connected": False,
                "connected_at": None,
                "last_used_at": None
            }
    
    return status_map


@router.delete("/{provider}/disconnect")
async def disconnect_integration(
    provider: str,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Déconnecter une intégration"""
    if not employer.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create a company profile before managing integrations"
        )
    
    # Mapper le provider string vers l'enum
    provider_map = {
        "linkedin": IntegrationProvider.LINKEDIN,
        "google_calendar": IntegrationProvider.GOOGLE_CALENDAR,
        "outlook_calendar": IntegrationProvider.OUTLOOK_CALENDAR
    }
    
    if provider not in provider_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid provider"
        )
    
    # Désactiver l'intégration
    await db.execute(
        update(IntegrationCredential)
        .where(
            IntegrationCredential.company_id == employer.company_id,
            IntegrationCredential.provider == provider_map[provider]
        )
        .values(is_active=False)
    )
    await db.commit()
    
    return {"message": f"{provider} integration disconnected"}


# ========================================
# Intégration Targetym
# ========================================

TARGETYM_API_BASE_URL = os.getenv("TARGETYM_API_URL", "https://targetym-api.railway.app")


class TargetymLinkRequest(BaseModel):
    targetym_tenant_id: int
    targetym_api_key: str


class TargetymLinkResponse(BaseModel):
    linked: bool
    targetym_tenant_id: int
    targetym_tenant_name: str
    linked_at: str
    message: str


@router.post("/targetym/link", response_model=TargetymLinkResponse)
async def link_targetym_account(
    body: TargetymLinkRequest,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Lier le compte de l'entreprise IntoWork à un tenant Targetym.
    L'employeur fournit son tenant_id Targetym et sa clé API Targetym.
    IntoWork vérifie la clé auprès de Targetym avant de sauvegarder.
    """
    import httpx

    # Récupérer l'entreprise
    result = await db.execute(
        select(Company).where(Company.id == employer.company_id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    # Déjà liée ?
    if company.targetym_tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Ce compte est déjà lié à un tenant Targetym. Déliez d'abord l'ancien compte."
        )

    # Vérifier la clé API auprès de Targetym
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{TARGETYM_API_BASE_URL}/api/integrations/intowork/verify-key",
                json={
                    "tenant_id": body.targetym_tenant_id,
                    "api_key": body.targetym_api_key,
                    "intowork_company_id": employer.company_id,
                }
            )
    except httpx.RequestError as e:
        logger.error(f"Targetym unreachable: {e}")
        raise HTTPException(status_code=503, detail="Impossible de joindre Targetym pour vérifier la clé API")

    if resp.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail="Clé API Targetym invalide ou tenant introuvable"
        )

    tenant_data = resp.json()

    # Sauvegarder la liaison
    now = datetime.utcnow()
    await db.execute(
        update(Company)
        .where(Company.id == employer.company_id)
        .values(
            targetym_tenant_id=body.targetym_tenant_id,
            targetym_api_key=body.targetym_api_key,
            targetym_linked_at=now,
        )
    )
    await db.commit()

    logger.info(f"Company {employer.company_id} linked to Targetym tenant {body.targetym_tenant_id}")

    return TargetymLinkResponse(
        linked=True,
        targetym_tenant_id=body.targetym_tenant_id,
        targetym_tenant_name=tenant_data.get("tenant_name", ""),
        linked_at=now.isoformat(),
        message="Compte Targetym lié avec succès"
    )


@router.delete("/targetym/unlink")
async def unlink_targetym_account(
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Délier le compte IntoWork du tenant Targetym."""
    result = await db.execute(
        select(Company).where(Company.id == employer.company_id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    if not company.targetym_tenant_id:
        raise HTTPException(status_code=400, detail="Aucun compte Targetym lié")

    await db.execute(
        update(Company)
        .where(Company.id == employer.company_id)
        .values(
            targetym_tenant_id=None,
            targetym_api_key=None,
            targetym_linked_at=None,
        )
    )
    await db.commit()

    return {"message": "Compte Targetym délié avec succès"}


@router.get("/targetym/status")
async def get_targetym_status(
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Retourne le statut de la liaison avec Targetym pour l'entreprise courante."""
    result = await db.execute(
        select(Company).where(Company.id == employer.company_id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    if not company.targetym_tenant_id:
        return {"linked": False}

    return {
        "linked": True,
        "targetym_tenant_id": company.targetym_tenant_id,
        "linked_at": company.targetym_linked_at.isoformat() if company.targetym_linked_at else None,
    }


# ========================================
# Clé API IntoWork (pour Targetym)
# ========================================

class TargetymVerifyKeyRequest(BaseModel):
    """Appelé par Targetym pour vérifier la clé API IntoWork d'une entreprise."""
    company_id: int
    api_key: str
    targetym_tenant_id: int  # Pour que IntoWork enregistre la liaison côté retour


@router.post("/api-key/generate")
async def generate_company_api_key(
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Génère (ou régénère) la clé API IntoWork de l'entreprise.
    Cette clé permet à Targetym de s'authentifier auprès d'IntoWork.
    """
    result = await db.execute(
        select(Company).where(Company.id == employer.company_id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    new_key = "iw_" + secrets.token_urlsafe(32)

    await db.execute(
        update(Company)
        .where(Company.id == employer.company_id)
        .values(company_api_key=new_key)
    )
    await db.commit()

    return {
        "api_key": new_key,
        "message": "Clé API générée. Partagez-la avec votre admin Targetym pour activer la liaison."
    }


@router.get("/api-key")
async def get_company_api_key(
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Retourne la clé API IntoWork actuelle de l'entreprise (masquée)."""
    result = await db.execute(
        select(Company).where(Company.id == employer.company_id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    if not company.company_api_key:
        return {"has_key": False, "api_key_preview": None}

    preview = company.company_api_key[:8] + "••••••••"
    return {"has_key": True, "api_key_preview": preview}


@router.post("/targetym/verify-key")
async def verify_targetym_key_from_targetym(
    body: TargetymVerifyKeyRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Endpoint appelé par Targetym pour vérifier la clé API IntoWork d'une entreprise.
    Si valide, enregistre la liaison côté IntoWork (targetym_tenant_id sur Company).
    Pas d'authentification requise — la clé est la preuve.
    """
    result = await db.execute(
        select(Company).where(Company.id == body.company_id)
    )
    company = result.scalar_one_or_none()

    if not company or not company.company_api_key:
        return {"valid": False}

    if company.company_api_key != body.api_key:
        logger.warning(f"Clé API IntoWork invalide pour la Company {body.company_id}")
        return {"valid": False}

    # Enregistrer la liaison côté IntoWork
    now = datetime.utcnow()
    await db.execute(
        update(Company)
        .where(Company.id == body.company_id)
        .values(
            targetym_tenant_id=body.targetym_tenant_id,
            targetym_linked_at=now,
        )
    )
    await db.commit()

    logger.info(f"Company {body.company_id} liée au tenant Targetym {body.targetym_tenant_id} via verify-key")

    return {"valid": True, "company_name": company.name}


# ========================================
# Webhook : Offre Targetym publiée → Job IntoWork
# ========================================

class SyncJobWebhookPayload(BaseModel):
    company_id: int
    api_key: str
    targetym_tenant_id: int
    job: dict  # title, description, location, job_type, location_type, salary_min, salary_max, currency, targetym_job_posting_id


@router.post("/targetym/webhook/sync-job")
async def webhook_sync_job(
    body: SyncJobWebhookPayload,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Webhook appelé par Targetym quand une offre est publiée.
    Crée ou met à jour un Job dans IntoWork pour la company concernée.
    Authentification par clé API company.
    """
    from app.models.base import Job, JobStatus

    result = await db.execute(
        select(Company).where(Company.id == body.company_id)
    )
    company = result.scalar_one_or_none()

    if not company or not company.company_api_key:
        return {"synced": False, "reason": "company_not_found"}

    if company.company_api_key != body.api_key:
        logger.warning(f"Clé API invalide dans webhook sync-job pour company {body.company_id}")
        return {"synced": False, "reason": "invalid_key"}

    # Récupérer l'employer admin de la company
    employer_result = await db.execute(
        select(Employer).where(
            Employer.company_id == body.company_id,
            Employer.is_admin == True
        )
    )
    employer = employer_result.scalar_one_or_none()
    if not employer:
        # Prendre n'importe quel employer de la company
        employer_result = await db.execute(
            select(Employer).where(Employer.company_id == body.company_id)
        )
        employer = employer_result.scalar_one_or_none()

    if not employer:
        return {"synced": False, "reason": "no_employer_found"}

    job_data = body.job
    targetym_job_id = job_data.get("targetym_job_posting_id")

    # Vérifier si le job existe déjà par targetym_job_posting_id
    existing_result = await db.execute(
        select(Job).where(
            Job.company_id == body.company_id,
            Job.targetym_job_posting_id == targetym_job_id
        )
    )
    existing_job = existing_result.scalar_one_or_none()

    # Mapping job_type
    valid_job_types = ["full_time", "part_time", "contract", "temporary", "internship"]
    job_type = job_data.get("job_type", "full_time")
    if job_type not in valid_job_types:
        job_type = "full_time"

    valid_location_types = ["on_site", "remote", "hybrid"]
    location_type = job_data.get("location_type", "on_site")
    if location_type not in valid_location_types:
        location_type = "on_site"

    if existing_job:
        # Mise à jour
        existing_job.title = job_data.get("title", existing_job.title)
        existing_job.description = job_data.get("description", existing_job.description)
        existing_job.location = job_data.get("location", existing_job.location)
        existing_job.job_type = job_type
        existing_job.location_type = location_type
        existing_job.salary_min = job_data.get("salary_min")
        existing_job.salary_max = job_data.get("salary_max")
        existing_job.currency = job_data.get("currency", "XOF")
        existing_job.status = JobStatus.PUBLISHED
        await db.commit()
        logger.info(f"✅ Job Targetym #{targetym_job_id} mis à jour dans IntoWork (job_id={existing_job.id})")
        return {"synced": True, "job_id": existing_job.id, "action": "updated"}
    else:
        # Création
        new_job = Job(
            company_id=body.company_id,
            employer_id=employer.id,
            targetym_job_posting_id=targetym_job_id,
            title=job_data.get("title", "Poste ouvert"),
            description=job_data.get("description", ""),
            location=job_data.get("location", ""),
            job_type=job_type,
            location_type=location_type,
            salary_min=job_data.get("salary_min"),
            salary_max=job_data.get("salary_max"),
            currency=job_data.get("currency", "XOF"),
            status=JobStatus.PUBLISHED,
        )
        db.add(new_job)
        await db.commit()
        await db.refresh(new_job)
        logger.info(f"✅ Job Targetym #{targetym_job_id} créé dans IntoWork (job_id={new_job.id})")
        return {"synced": True, "job_id": new_job.id, "action": "created"}
