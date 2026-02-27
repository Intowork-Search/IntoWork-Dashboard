"""
Google Calendar Integration Service
Planification d'entretiens avec Google Calendar
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import httpx
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI", 
    "https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback"
)

# Google OAuth URLs
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

# Scopes
GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
]


class GoogleCalendarService:
    """Service pour l'intégration Google Calendar"""
    
    def __init__(self):
        self.enabled = bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
        if self.enabled:
            logger.info("✅ Google Calendar integration ENABLED")
        else:
            logger.warning("❌ Google Calendar integration disabled: credentials not configured")
    
    def get_authorization_url(self, state: str) -> str:
        """
        Générer l'URL d'autorisation Google OAuth 2.0
        
        Args:
            state: Token CSRF pour sécurité
            
        Returns:
            URL d'autorisation Google
        """
        if not self.enabled:
            raise ValueError("Google Calendar integration is not enabled")
        
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": " ".join(GOOGLE_SCOPES),
            "state": state,
            "access_type": "offline",  # Pour obtenir refresh token
            "prompt": "consent"  # Forcer le consentement pour avoir refresh token
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{GOOGLE_AUTH_URL}?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Échanger le code d'autorisation contre un access token
        
        Args:
            code: Code d'autorisation reçu de Google
            
        Returns:
            Dict contenant access_token, refresh_token, expires_in
        """
        if not self.enabled:
            raise ValueError("Google Calendar integration is not enabled")
        
        logger.info(f"🔑 Exchanging Google OAuth code for token")
        logger.info(f"🎯 Redirect URI: {GOOGLE_REDIRECT_URI}")
        logger.info(f"🆔 Client ID: {GOOGLE_CLIENT_ID[:20]}...")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"❌ Google token exchange failed: {response.status_code} - {response.text}")
            
            response.raise_for_status()
            return response.json()
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Rafraîchir l'access token avec le refresh token
        
        Args:
            refresh_token: Refresh token Google
            
        Returns:
            Nouveau access token
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                }
            )
            
            response.raise_for_status()
            return response.json()
    
    def _get_calendar_service(self, access_token: str, refresh_token: Optional[str] = None):
        """
        Créer un service Google Calendar
        
        Args:
            access_token: Access token Google
            refresh_token: Refresh token (optionnel)
            
        Returns:
            Google Calendar service
        """
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri=GOOGLE_TOKEN_URL,
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
            scopes=GOOGLE_SCOPES
        )
        
        return build('calendar', 'v3', credentials=creds)
    
    async def create_interview_event(
        self,
        access_token: str,
        interview_data: Dict[str, Any],
        refresh_token: Optional[str] = None
    ) -> str:
        """
        Créer un événement d'entretien dans Google Calendar
        
        Args:
            access_token: Access token Google
            interview_data: Données de l'entretien
            refresh_token: Refresh token (optionnel)
            
        Returns:
            Event ID Google Calendar
        """
        if not self.enabled:
            raise ValueError("Google Calendar integration is not enabled")
        
        try:
            service = self._get_calendar_service(access_token, refresh_token)
            
            # Préparer l'événement
            event = {
                'summary': interview_data.get('title', 'Entretien'),
                'location': interview_data.get('location', ''),
                'description': interview_data.get('description', ''),
                'start': {
                    'dateTime': interview_data['start_time'],
                    'timeZone': interview_data.get('timezone', 'Europe/Paris'),
                },
                'end': {
                    'dateTime': interview_data['end_time'],
                    'timeZone': interview_data.get('timezone', 'Europe/Paris'),
                },
                'attendees': [
                    {'email': email} for email in interview_data.get('attendees', [])
                ],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 jour avant
                        {'method': 'popup', 'minutes': 30},  # 30 min avant
                    ],
                },
                'conferenceData': self._create_meet_link(interview_data) if interview_data.get('create_meet_link') else None
            }
            
            # Créer l'événement
            created_event = service.events().insert(
                calendarId='primary',
                body=event,
                sendUpdates='all',  # Envoyer des invitations à tous les participants
                conferenceDataVersion=1 if interview_data.get('create_meet_link') else 0
            ).execute()
            
            event_id = created_event['id']
            logger.info(f"✅ Google Calendar event created: {event_id}")
            
            return event_id
            
        except Exception as e:
            logger.error(f"❌ Error creating Google Calendar event: {e}")
            raise
    
    def _create_meet_link(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Créer un lien Google Meet pour l'événement
        
        Returns:
            Configuration Google Meet
        """
        return {
            'createRequest': {
                'requestId': f"meet-{datetime.utcnow().timestamp()}",
                'conferenceSolutionKey': {
                    'type': 'hangoutsMeet'
                }
            }
        }
    
    async def update_interview_event(
        self,
        access_token: str,
        event_id: str,
        interview_data: Dict[str, Any],
        refresh_token: Optional[str] = None
    ) -> bool:
        """
        Mettre à jour un événement d'entretien
        
        Args:
            access_token: Access token Google
            event_id: ID de l'événement à mettre à jour
            interview_data: Nouvelles données
            refresh_token: Refresh token (optionnel)
            
        Returns:
            True si mise à jour réussie
        """
        try:
            service = self._get_calendar_service(access_token, refresh_token)
            
            # Récupérer l'événement existant
            event = service.events().get(calendarId='primary', eventId=event_id).execute()
            
            # Mettre à jour les champs
            if 'title' in interview_data:
                event['summary'] = interview_data['title']
            if 'location' in interview_data:
                event['location'] = interview_data['location']
            if 'description' in interview_data:
                event['description'] = interview_data['description']
            if 'start_time' in interview_data:
                event['start']['dateTime'] = interview_data['start_time']
            if 'end_time' in interview_data:
                event['end']['dateTime'] = interview_data['end_time']
            
            # Mettre à jour l'événement
            updated_event = service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"✅ Google Calendar event updated: {event_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error updating Google Calendar event: {e}")
            raise
    
    async def delete_interview_event(
        self,
        access_token: str,
        event_id: str,
        refresh_token: Optional[str] = None
    ) -> bool:
        """
        Supprimer un événement d'entretien
        
        Args:
            access_token: Access token Google
            event_id: ID de l'événement à supprimer
            refresh_token: Refresh token (optionnel)
            
        Returns:
            True si suppression réussie
        """
        try:
            service = self._get_calendar_service(access_token, refresh_token)
            
            service.events().delete(
                calendarId='primary',
                eventId=event_id,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"✅ Google Calendar event deleted: {event_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error deleting Google Calendar event: {e}")
            raise
    
    async def get_event_details(
        self,
        access_token: str,
        event_id: str,
        refresh_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Récupérer les détails d'un événement
        
        Args:
            access_token: Access token Google
            event_id: ID de l'événement
            refresh_token: Refresh token (optionnel)
            
        Returns:
            Détails de l'événement
        """
        try:
            service = self._get_calendar_service(access_token, refresh_token)
            
            event = service.events().get(calendarId='primary', eventId=event_id).execute()
            
            return {
                'id': event['id'],
                'title': event.get('summary', ''),
                'location': event.get('location', ''),
                'description': event.get('description', ''),
                'start_time': event['start'].get('dateTime'),
                'end_time': event['end'].get('dateTime'),
                'attendees': [a.get('email') for a in event.get('attendees', [])],
                'meet_link': event.get('hangoutLink'),
                'status': event.get('status')
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting Google Calendar event: {e}")
            raise


# Instance singleton
google_calendar_service = GoogleCalendarService()
