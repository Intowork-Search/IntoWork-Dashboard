"""
API Routes for External Integrations (LinkedIn, Google Calendar, Outlook)
OAuth flows and service integrations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Annotated, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import secrets

from app.database import get_db
from app.auth import require_employer
from app.models.base import IntegrationCredential, IntegrationProvider, Employer, Job, Company
from app.services.linkedin_service import linkedin_service
from app.services.google_calendar_service import google_calendar_service
from app.services.outlook_calendar_service import outlook_calendar_service

router = APIRouter(prefix="/integrations", tags=["integrations"])


# ========================================
# Pydantic Schemas
# ========================================

class IntegrationAuthURLResponse(BaseModel):
    """URL d'autorisation OAuth"""
    authorization_url: str
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
    employer: Annotated[Employer, Depends(require_employer)]
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
    
    # Générer un state token pour CSRF protection
    state = secrets.token_urlsafe(32)
    
    # TODO: Stocker le state en session/cache avec expiration
    # Pour l'instant, on le retourne juste
    
    auth_url = linkedin_service.get_authorization_url(state)
    
    return IntegrationAuthURLResponse(
        authorization_url=auth_url,
        state=state,
        provider="linkedin"
    )


@router.get("/linkedin/callback")
async def linkedin_oauth_callback(
    code: str,
    state: str,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Callback OAuth LinkedIn
    
    Reçoit le code d'autorisation et l'échange contre un access token
    """
    if not linkedin_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LinkedIn integration is not configured"
        )
    
    # TODO: Vérifier le state token pour CSRF protection
    
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
        
        return {
            "message": "LinkedIn integration successful",
            "organization_id": organization_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"LinkedIn OAuth failed: {str(e)}"
        )


@router.post("/linkedin/publish-job")
async def publish_job_to_linkedin(
    request: LinkedInPublishRequest,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Publier une offre d'emploi sur LinkedIn
    
    Nécessite une intégration LinkedIn active
    """
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
    employer: Annotated[Employer, Depends(require_employer)]
):
    """Générer l'URL d'autorisation Google Calendar OAuth"""
    if not google_calendar_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Calendar integration is not configured"
        )
    
    state = secrets.token_urlsafe(32)
    auth_url = google_calendar_service.get_authorization_url(state)
    
    return IntegrationAuthURLResponse(
        authorization_url=auth_url,
        state=state,
        provider="google_calendar"
    )


@router.get("/google-calendar/callback")
async def google_calendar_oauth_callback(
    code: str,
    state: str,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Callback OAuth Google Calendar"""
    if not google_calendar_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Calendar integration is not configured"
        )
    
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
        
        return {"message": "Google Calendar integration successful"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google Calendar OAuth failed: {str(e)}"
        )


@router.post("/google-calendar/create-event")
async def create_google_calendar_event(
    request: CalendarEventRequest,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Créer un événement d'entretien dans Google Calendar"""
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
    employer: Annotated[Employer, Depends(require_employer)]
):
    """Générer l'URL d'autorisation Outlook Calendar OAuth"""
    if not outlook_calendar_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Outlook Calendar integration is not configured"
        )
    
    state = secrets.token_urlsafe(32)
    auth_url = outlook_calendar_service.get_authorization_url(state)
    
    return IntegrationAuthURLResponse(
        authorization_url=auth_url,
        state=state,
        provider="outlook_calendar"
    )


@router.get("/outlook/callback")
async def outlook_oauth_callback(
    code: str,
    state: str,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Callback OAuth Outlook Calendar"""
    if not outlook_calendar_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Outlook Calendar integration is not configured"
        )
    
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
        
        return {"message": "Outlook Calendar integration successful"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Outlook OAuth failed: {str(e)}"
        )


@router.post("/outlook/create-event")
async def create_outlook_event(
    request: CalendarEventRequest,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Créer un événement d'entretien dans Outlook Calendar"""
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
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Récupérer le statut de toutes les intégrations"""
    
    # Vérifier que l'employeur a une entreprise
    if not employer.company_id:
        # Retourner un statut par défaut si pas d'entreprise
        return {
            "linkedin": IntegrationStatusResponse(
                provider="linkedin",
                is_connected=False,
                connected_at=None,
                last_used_at=None
            ),
            "google_calendar": IntegrationStatusResponse(
                provider="google_calendar",
                is_connected=False,
                connected_at=None,
                last_used_at=None
            ),
            "outlook_calendar": IntegrationStatusResponse(
                provider="outlook_calendar",
                is_connected=False,
                connected_at=None,
                last_used_at=None
            )
        }
    
    result = await db.execute(
        select(IntegrationCredential).where(
            IntegrationCredential.company_id == employer.company_id
        )
    )
    integrations = result.scalars().all()
    
    status_map = {
        "linkedin": None,
        "google_calendar": None,
        "outlook_calendar": None
    }
    
    for integration in integrations:
        provider_key = integration.provider.value
        status_map[provider_key] = IntegrationStatusResponse(
            provider=provider_key,
            is_connected=integration.is_active,
            connected_at=integration.created_at,
            last_used_at=integration.last_used_at
        )
    
    # Remplir les non-connectés
    for provider in status_map:
        if status_map[provider] is None:
            status_map[provider] = IntegrationStatusResponse(
                provider=provider,
                is_connected=False,
                connected_at=None,
                last_used_at=None
            )
    
    return status_map


@router.delete("/{provider}/disconnect")
async def disconnect_integration(
    provider: str,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Déconnecter une intégration"""
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
