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
        
        # Récupérer l'organization ID
        organization_id = await linkedin_service.get_company_id(token_data['access_token'])
        
        # Stocker les credentials
        # Vérifier si une intégration existe déjà
        result = await db.execute(
            select(IntegrationCredential).where(
                IntegrationCredential.company_id == employer.company_id,
                IntegrationCredential.provider == IntegrationProvider.LINKEDIN
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            # Mettre à jour
            existing.access_token = token_data['access_token']
            existing.token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 5184000))
            existing.provider_data = {"organization_id": organization_id}
            existing.is_active = True
        else:
            # Créer nouvelle intégration
            integration = IntegrationCredential(
                company_id=employer.company_id,
                user_id=employer.user_id,
                provider=IntegrationProvider.LINKEDIN,
                access_token=token_data['access_token'],
                token_expires_at=datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 5184000)),
                provider_data={"organization_id": organization_id}
            )
            db.add(integration)
        
        await db.commit()
        
        # Rediriger vers le frontend avec succès
        logger.info(f"✅ LinkedIn integration successful for user {employer.user_id}, organization {organization_id}")
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
