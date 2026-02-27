"""
LinkedIn Integration Service
Publication d'offres d'emploi sur LinkedIn via leur API officielle
"""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import httpx

logger = logging.getLogger(__name__)

# Configuration
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8001/api/integrations/linkedin/callback")

# LinkedIn API URLs
LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_API_BASE = "https://api.linkedin.com/v2"


class LinkedInService:
    """Service pour l'intégration LinkedIn"""
    
    def __init__(self):
        self.enabled = bool(LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET)
        if self.enabled:
            logger.info("✅ LinkedIn integration ENABLED")
        else:
            logger.warning("❌ LinkedIn integration disabled: credentials not configured")
    
    def get_authorization_url(self, state: str) -> str:
        """
        Générer l'URL d'autorisation LinkedIn OAuth 2.0
        
        Scopes requis:
        - w_member_social: Publier du contenu au nom du membre
        - r_organization_social: Lire les posts de l'organisation (si accès entreprise)
        
        Args:
            state: Token CSRF pour sécurité
            
        Returns:
            URL d'autorisation LinkedIn
        """
        if not self.enabled:
            raise ValueError("LinkedIn integration is not enabled")
        
        # Scopes LinkedIn Marketing Developer Platform
        # Note: w_organization_social nécessite l'accès "Marketing Developer Platform"
        scopes = "w_member_social r_organization_social"
        
        params = {
            "response_type": "code",
            "client_id": LINKEDIN_CLIENT_ID,
            "redirect_uri": LINKEDIN_REDIRECT_URI,
            "state": state,
            "scope": scopes
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{LINKEDIN_AUTH_URL}?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Échanger le code d'autorisation contre un access token
        
        Args:
            code: Code d'autorisation reçu de LinkedIn
            
        Returns:
            Dict contenant access_token, expires_in, etc.
        """
        if not self.enabled:
            raise ValueError("LinkedIn integration is not enabled")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                LINKEDIN_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": LINKEDIN_REDIRECT_URI,
                    "client_id": LINKEDIN_CLIENT_ID,
                    "client_secret": LINKEDIN_CLIENT_SECRET
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            response.raise_for_status()
            return response.json()
    
    async def get_company_id(self, access_token: str) -> str:
        """
        Récupérer l'ID de l'organisation LinkedIn
        
        Args:
            access_token: Token d'accès LinkedIn
            
        Returns:
            Organization ID
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{LINKEDIN_API_BASE}/organizationalEntityAcls",
                params={"q": "roleAssignee"},
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            response.raise_for_status()
            data = response.json()
            
            # Récupérer le premier organization ID
            if "elements" in data and len(data["elements"]) > 0:
                org_urn = data["elements"][0].get("organizationalTarget")
                return org_urn
            
            raise ValueError("No organization found for this account")
    
    async def publish_job_post(
        self,
        access_token: str,
        organization_id: str,
        job_data: Dict[str, Any]
    ) -> str:
        """
        Publier une offre d'emploi sur LinkedIn
        
        Args:
            access_token: Token d'accès LinkedIn
            organization_id: ID de l'organisation LinkedIn
            job_data: Données du job (title, description, location, etc.)
            
        Returns:
            Post ID LinkedIn
        """
        if not self.enabled:
            raise ValueError("LinkedIn integration is not enabled")
        
        # Préparer le payload pour LinkedIn Share API
        share_payload = {
            "author": organization_id,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": self._format_job_post(job_data)
                    },
                    "shareMediaCategory": "ARTICLE",
                    "media": [
                        {
                            "status": "READY",
                            "description": {
                                "text": job_data.get("description", "")[:256]
                            },
                            "originalUrl": job_data.get("apply_url", ""),
                            "title": {
                                "text": job_data.get("title", "")
                            }
                        }
                    ]
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{LINKEDIN_API_BASE}/ugcPosts",
                json=share_payload,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0"
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Extraire le post ID
            post_id = result.get("id")
            logger.info(f"✅ Job posted to LinkedIn: {post_id}")
            
            return post_id
    
    def _format_job_post(self, job_data: Dict[str, Any]) -> str:
        """
        Formater le texte du post LinkedIn
        
        Args:
            job_data: Données du job
            
        Returns:
            Texte formaté pour LinkedIn
        """
        title = job_data.get("title", "Nouvelle opportunité")
        location = job_data.get("location", "")
        job_type = job_data.get("job_type", "").replace("_", " ").title()
        company_name = job_data.get("company_name", "Notre entreprise")
        
        text = f"🚀 {company_name} recrute : {title}\n\n"
        
        if location:
            text += f"📍 Localisation : {location}\n"
        if job_type:
            text += f"💼 Type : {job_type}\n"
        
        text += f"\n{job_data.get('summary', '')}\n\n"
        text += "👉 Postulez dès maintenant via le lien ci-dessous !\n"
        text += f"\n#Recrutement #Emploi #{job_type.replace(' ', '')}"
        
        return text[:3000]  # LinkedIn limit
    
    async def delete_job_post(self, access_token: str, post_id: str) -> bool:
        """
        Supprimer un post LinkedIn
        
        Args:
            access_token: Token d'accès LinkedIn
            post_id: ID du post à supprimer
            
        Returns:
            True si suppression réussie
        """
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{LINKEDIN_API_BASE}/ugcPosts/{post_id}",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "X-Restli-Protocol-Version": "2.0.0"
                }
            )
            
            response.raise_for_status()
            logger.info(f"✅ LinkedIn post deleted: {post_id}")
            return True
    
    async def get_post_statistics(
        self,
        access_token: str,
        post_id: str
    ) -> Dict[str, Any]:
        """
        Récupérer les statistiques d'un post LinkedIn
        
        Args:
            access_token: Token d'accès LinkedIn
            post_id: ID du post
            
        Returns:
            Statistiques (impressions, clics, engagements)
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{LINKEDIN_API_BASE}/socialActions/{post_id}",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            response.raise_for_status()
            data = response.json()
            
            return {
                "likes": data.get("likesSummary", {}).get("totalLikes", 0),
                "comments": data.get("commentsSummary", {}).get("totalComments", 0),
                "shares": data.get("sharesSummary", {}).get("totalShares", 0),
                "impressions": data.get("impressionCount", 0),
                "clicks": data.get("clickCount", 0)
            }


# Instance singleton
linkedin_service = LinkedInService()
