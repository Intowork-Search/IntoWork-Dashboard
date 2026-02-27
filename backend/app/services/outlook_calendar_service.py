"""
Microsoft Outlook Calendar Integration Service
Planification d'entretiens avec Outlook Calendar
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import httpx

logger = logging.getLogger(__name__)

# Configuration
MICROSOFT_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID")
MICROSOFT_CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET")
MICROSOFT_REDIRECT_URI = os.getenv(
    "MICROSOFT_REDIRECT_URI", 
    "https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback"
)
# Support both MICROSOFT_TENANT and MICROSOFT_TENANT_ID (prefer tenant-specific over 'common')
MICROSOFT_TENANT = os.getenv("MICROSOFT_TENANT_ID") or os.getenv("MICROSOFT_TENANT", "common")

# Microsoft OAuth URLs
MICROSOFT_AUTH_URL = f"https://login.microsoftonline.com/{MICROSOFT_TENANT}/oauth2/v2.0/authorize"
MICROSOFT_TOKEN_URL = f"https://login.microsoftonline.com/{MICROSOFT_TENANT}/oauth2/v2.0/token"
MICROSOFT_GRAPH_API = "https://graph.microsoft.com/v1.0"

# Scopes
MICROSOFT_SCOPES = [
    "Calendars.ReadWrite",
    "User.Read",
    "offline_access"  # Pour refresh token
]


class OutlookCalendarService:
    """Service pour l'intégration Outlook Calendar via Microsoft Graph API"""
    
    def __init__(self):
        self.enabled = bool(MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET)
        if self.enabled:
            logger.info("✅ Outlook Calendar integration ENABLED")
        else:
            logger.warning("❌ Outlook Calendar integration disabled: credentials not configured")
    
    def get_authorization_url(self, state: str) -> str:
        """
        Générer l'URL d'autorisation Microsoft OAuth 2.0
        
        Args:
            state: Token CSRF pour sécurité
            
        Returns:
            URL d'autorisation Microsoft
        """
        if not self.enabled:
            raise ValueError("Outlook Calendar integration is not enabled")
        
        params = {
            "client_id": MICROSOFT_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": MICROSOFT_REDIRECT_URI,
            "response_mode": "query",
            "scope": " ".join(MICROSOFT_SCOPES),
            "state": state
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{MICROSOFT_AUTH_URL}?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Échanger le code d'autorisation contre un access token
        
        Args:
            code: Code d'autorisation reçu de Microsoft
            
        Returns:
            Dict contenant access_token, refresh_token, expires_in
        """
        if not self.enabled:
            raise ValueError("Outlook Calendar integration is not enabled")
        
        logger.info(f"🔑 Exchanging Outlook OAuth code for token")
        logger.info(f"🎯 Redirect URI: {MICROSOFT_REDIRECT_URI}")
        logger.info(f"🆔 Client ID: {MICROSOFT_CLIENT_ID[:20] if MICROSOFT_CLIENT_ID else 'NOT SET'}...")
        logger.info(f"🔐 Client Secret configured: {bool(MICROSOFT_CLIENT_SECRET)}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                MICROSOFT_TOKEN_URL,
                data={
                    "client_id": MICROSOFT_CLIENT_ID,
                    "client_secret": MICROSOFT_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": MICROSOFT_REDIRECT_URI,
                    "grant_type": "authorization_code"
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"❌ Outlook token exchange failed: {response.status_code}")
                logger.error(f"📄 Error response: {error_detail}")
                logger.error(f"🔍 Check: 1) MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET are set correctly")
                logger.error(f"🔍 Check: 2) Redirect URI matches Azure AD app config: {MICROSOFT_REDIRECT_URI}")
                logger.error(f"🔍 Check: 3) Authorization code is valid and not expired")
            
            response.raise_for_status()
            return response.json()
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Rafraîchir l'access token avec le refresh token
        
        Args:
            refresh_token: Refresh token Microsoft
            
        Returns:
            Nouveau access token
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                MICROSOFT_TOKEN_URL,
                data={
                    "client_id": MICROSOFT_CLIENT_ID,
                    "client_secret": MICROSOFT_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                    "scope": " ".join(MICROSOFT_SCOPES)
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            response.raise_for_status()
            return response.json()
    
    async def create_interview_event(
        self,
        access_token: str,
        interview_data: Dict[str, Any]
    ) -> str:
        """
        Créer un événement d'entretien dans Outlook Calendar
        
        Args:
            access_token: Access token Microsoft
            interview_data: Données de l'entretien
            
        Returns:
            Event ID Outlook Calendar
        """
        if not self.enabled:
            raise ValueError("Outlook Calendar integration is not enabled")
        
        # Préparer l'événement
        event = {
            "subject": interview_data.get('title', 'Entretien'),
            "body": {
                "contentType": "HTML",
                "content": interview_data.get('description', '')
            },
            "start": {
                "dateTime": interview_data['start_time'],
                "timeZone": interview_data.get('timezone', 'Europe/Paris')
            },
            "end": {
                "dateTime": interview_data['end_time'],
                "timeZone": interview_data.get('timezone', 'Europe/Paris')
            },
            "location": {
                "displayName": interview_data.get('location', '')
            },
            "attendees": [
                {
                    "emailAddress": {
                        "address": email,
                        "name": email.split('@')[0]
                    },
                    "type": "required"
                }
                for email in interview_data.get('attendees', [])
            ],
            "isReminderOn": True,
            "reminderMinutesBeforeStart": 30,
            "isOnlineMeeting": interview_data.get('create_teams_link', False),
            "onlineMeetingProvider": "teamsForBusiness" if interview_data.get('create_teams_link') else None
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MICROSOFT_GRAPH_API}/me/calendar/events",
                json=event,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            event_id = result['id']
            logger.info(f"✅ Outlook Calendar event created: {event_id}")
            
            # Récupérer le lien Teams si demandé
            if interview_data.get('create_teams_link') and result.get('onlineMeeting'):
                logger.info(f"📹 Teams link: {result['onlineMeeting']['joinUrl']}")
            
            return event_id
    
    async def update_interview_event(
        self,
        access_token: str,
        event_id: str,
        interview_data: Dict[str, Any]
    ) -> bool:
        """
        Mettre à jour un événement d'entretien
        
        Args:
            access_token: Access token Microsoft
            event_id: ID de l'événement à mettre à jour
            interview_data: Nouvelles données
            
        Returns:
            True si mise à jour réussie
        """
        # Préparer les données à mettre à jour
        update_data = {}
        
        if 'title' in interview_data:
            update_data['subject'] = interview_data['title']
        if 'description' in interview_data:
            update_data['body'] = {
                "contentType": "HTML",
                "content": interview_data['description']
            }
        if 'location' in interview_data:
            update_data['location'] = {"displayName": interview_data['location']}
        if 'start_time' in interview_data:
            update_data['start'] = {
                "dateTime": interview_data['start_time'],
                "timeZone": interview_data.get('timezone', 'Europe/Paris')
            }
        if 'end_time' in interview_data:
            update_data['end'] = {
                "dateTime": interview_data['end_time'],
                "timeZone": interview_data.get('timezone', 'Europe/Paris')
            }
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{MICROSOFT_GRAPH_API}/me/calendar/events/{event_id}",
                json=update_data,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            response.raise_for_status()
            logger.info(f"✅ Outlook Calendar event updated: {event_id}")
            return True
    
    async def delete_interview_event(
        self,
        access_token: str,
        event_id: str
    ) -> bool:
        """
        Supprimer un événement d'entretien
        
        Args:
            access_token: Access token Microsoft
            event_id: ID de l'événement à supprimer
            
        Returns:
            True si suppression réussie
        """
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{MICROSOFT_GRAPH_API}/me/calendar/events/{event_id}",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            response.raise_for_status()
            logger.info(f"✅ Outlook Calendar event deleted: {event_id}")
            return True
    
    async def get_event_details(
        self,
        access_token: str,
        event_id: str
    ) -> Dict[str, Any]:
        """
        Récupérer les détails d'un événement
        
        Args:
            access_token: Access token Microsoft
            event_id: ID de l'événement
            
        Returns:
            Détails de l'événement
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{MICROSOFT_GRAPH_API}/me/calendar/events/{event_id}",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            response.raise_for_status()
            event = response.json()
            
            return {
                'id': event['id'],
                'title': event.get('subject', ''),
                'location': event.get('location', {}).get('displayName', ''),
                'description': event.get('body', {}).get('content', ''),
                'start_time': event['start']['dateTime'],
                'end_time': event['end']['dateTime'],
                'attendees': [a['emailAddress']['address'] for a in event.get('attendees', [])],
                'teams_link': event.get('onlineMeeting', {}).get('joinUrl') if event.get('onlineMeeting') else None,
                'status': event.get('responseStatus', {}).get('response', 'none')
            }
    
    async def get_available_time_slots(
        self,
        access_token: str,
        start_date: str,
        end_date: str,
        duration_minutes: int = 60
    ) -> List[Dict[str, str]]:
        """
        Récupérer les créneaux disponibles dans le calendrier
        
        Args:
            access_token: Access token Microsoft
            start_date: Date de début (ISO format)
            end_date: Date de fin (ISO format)
            duration_minutes: Durée souhaitée en minutes
            
        Returns:
            Liste de créneaux disponibles
        """
        # Utiliser l'API findMeetingTimes de Microsoft Graph
        request_body = {
            "attendees": [],
            "timeConstraint": {
                "activityDomain": "work",
                "timeslots": [
                    {
                        "start": {"dateTime": start_date, "timeZone": "Europe/Paris"},
                        "end": {"dateTime": end_date, "timeZone": "Europe/Paris"}
                    }
                ]
            },
            "meetingDuration": f"PT{duration_minutes}M",
            "returnSuggestionReasons": True,
            "minimumAttendeePercentage": 100
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MICROSOFT_GRAPH_API}/me/findMeetingTimes",
                json=request_body,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            time_slots = []
            for suggestion in result.get('meetingTimeSuggestions', []):
                time_slots.append({
                    'start': suggestion['meetingTimeSlot']['start']['dateTime'],
                    'end': suggestion['meetingTimeSlot']['end']['dateTime'],
                    'confidence': suggestion.get('confidence', 0)
                })
            
            return time_slots


# Instance singleton
outlook_calendar_service = OutlookCalendarService()
