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

# Activer les scopes "page entreprise" (Community Management API).
# ⚠️ Nécessite que l'app LinkedIn soit approuvée pour le produit
# "Community Management API". Sans approbation, demander ces scopes fait échouer
# tout le flux OAuth (unauthorized_scope_error). Passer à "true" UNIQUEMENT
# une fois l'approbation LinkedIn obtenue.
LINKEDIN_ORG_SCOPES_ENABLED = os.getenv("LINKEDIN_ORG_SCOPES_ENABLED", "false").lower() == "true"

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
        
        Scopes requis (LinkedIn Sign In API - disponibles publiquement):
        - profile: Profil de base (nom, photo)
        - email: Adresse email
        - w_member_social: Publier du contenu au nom du membre
        
        Note: w_organization_social nécessite "Marketing Developer Platform" 
        qui requiert une approbation manuelle de LinkedIn.
        
        Args:
            state: Token CSRF pour sécurité
            
        Returns:
            URL d'autorisation LinkedIn
        """
        if not self.enabled:
            raise ValueError("LinkedIn integration is not enabled")
        
        # Scopes OpenID Connect + publication.
        # - openid + profile : requis pour récupérer l'URN du membre via /v2/userinfo
        # - w_member_social : publier du contenu au nom du membre
        # "Sign In with LinkedIn using OpenID Connect" est un produit standard
        # activable sans approbation manuelle dans le portail développeur LinkedIn.
        scopes = "openid profile w_member_social"

        # Scopes "page entreprise" ajoutés seulement si l'app est approuvée
        # (Community Management API). Permet de lister les pages administrées et
        # de publier en leur nom.
        if LINKEDIN_ORG_SCOPES_ENABLED:
            scopes += " r_organization_social w_organization_social rw_organization_admin"

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
    
    async def get_member_urn(self, access_token: str) -> str:
        """
        Récupérer l'URN du membre connecté (utilisateur personnel)

        Utilise l'endpoint OpenID Connect /v2/userinfo (scopes openid + profile),
        dont le champ `sub` correspond à l'identifiant de la personne.
        Fallback sur l'ancien endpoint /v2/me (scope r_liteprofile) si nécessaire.

        Args:
            access_token: Token d'accès LinkedIn

        Returns:
            Member URN (ex: "urn:li:person:ABC123")
        """
        async with httpx.AsyncClient() as client:
            # 1) OpenID Connect (recommandé)
            try:
                response = await client.get(
                    f"{LINKEDIN_API_BASE}/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                response.raise_for_status()
                sub = response.json().get("sub")
                if sub:
                    return f"urn:li:person:{sub}"
            except httpx.HTTPStatusError as exc:
                logger.warning(
                    "LinkedIn /userinfo indisponible (%s), fallback sur /me",
                    exc.response.status_code,
                )

            # 2) Fallback ancien endpoint
            response = await client.get(
                f"{LINKEDIN_API_BASE}/me",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            member_id = response.json().get("id")
            if not member_id:
                raise ValueError("Could not retrieve member ID from LinkedIn")

            return f"urn:li:person:{member_id}"
    
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

    async def get_organizations(self, access_token: str) -> list:
        """
        Lister TOUTES les pages entreprise LinkedIn dont le membre est administrateur.

        Nécessite que le membre soit ADMINISTRATOR d'au moins une page ET que l'app
        dispose des scopes organisation (Community Management API). Sans approbation
        LinkedIn, cet appel échoue généralement → on renvoie une liste vide et la
        publication se fera sur le compte personnel.

        Args:
            access_token: Token d'accès LinkedIn

        Returns:
            Liste de dicts: [{"id": "urn:li:organization:123", "name": "Ma Page"}]
        """
        headers = {"Authorization": f"Bearer {access_token}"}
        organizations: list = []

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{LINKEDIN_API_BASE}/organizationalEntityAcls",
                params={
                    "q": "roleAssignee",
                    "role": "ADMINISTRATOR",
                    "state": "APPROVED",
                },
                headers=headers,
            )
            response.raise_for_status()
            data = response.json()

            org_urns = [
                el.get("organizationalTarget")
                for el in data.get("elements", [])
                if el.get("organizationalTarget")
            ]

            # Récupérer le nom lisible de chaque page (best-effort)
            for org_urn in org_urns:
                org_id = org_urn.split(":")[-1]
                name = f"Page {org_id}"
                try:
                    org_resp = await client.get(
                        f"{LINKEDIN_API_BASE}/organizations/{org_id}",
                        params={"projection": "(localizedName)"},
                        headers=headers,
                    )
                    if org_resp.status_code == 200:
                        name = org_resp.json().get("localizedName", name)
                except Exception as e:  # noqa: BLE001
                    logger.warning(f"Could not fetch org name for {org_urn}: {e}")

                organizations.append({"id": org_urn, "name": name})

        return organizations

    @staticmethod
    def build_post_url(post_id: str) -> str:
        """Construire l'URL publique d'un post LinkedIn à partir de son URN/ID."""
        if not post_id:
            return ""
        return f"https://www.linkedin.com/feed/update/{post_id}"
    
    async def _upload_image_asset(self, access_token: str, owner_urn: str, image_url: str) -> Optional[str]:
        """
        Enregistrer et uploader une image sur LinkedIn pour l'attacher à un post.

        Flux officiel LinkedIn (Vector Asset API) :
        1. registerUpload → obtenir une uploadUrl + un asset URN
        2. Télécharger l'image source (Cloudinary)
        3. Uploader le binaire vers uploadUrl

        Args:
            access_token: Token d'accès LinkedIn
            owner_urn: URN de l'auteur du post (personne ou organisation)
            image_url: URL publique de l'image (Cloudinary)

        Returns:
            L'asset URN (ex: "urn:li:digitalmediaAsset:...") ou None en cas d'échec.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # 1) registerUpload
                register_payload = {
                    "registerUploadRequest": {
                        "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                        "owner": owner_urn,
                        "serviceRelationships": [
                            {
                                "relationshipType": "OWNER",
                                "identifier": "urn:li:userGeneratedContent",
                            }
                        ],
                    }
                }
                register_resp = await client.post(
                    f"{LINKEDIN_API_BASE}/assets?action=registerUpload",
                    json=register_payload,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json",
                        "X-Restli-Protocol-Version": "2.0.0",
                    },
                )
                register_resp.raise_for_status()
                register_data = register_resp.json()

                value = register_data.get("value", {})
                asset = value.get("asset")
                upload_url = (
                    value.get("uploadMechanism", {})
                    .get("com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest", {})
                    .get("uploadUrl")
                )
                if not asset or not upload_url:
                    logger.warning("LinkedIn registerUpload: réponse incomplète, image ignorée")
                    return None

                # 2) Télécharger l'image source
                image_resp = await client.get(image_url)
                image_resp.raise_for_status()
                image_bytes = image_resp.content

                # 3) Upload binaire vers LinkedIn
                upload_resp = await client.put(
                    upload_url,
                    content=image_bytes,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                upload_resp.raise_for_status()

                logger.info(f"🖼️ Image LinkedIn uploadée: {asset}")
                return asset
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Échec upload image LinkedIn (post publié sans image): {exc}")
            return None

    async def publish_job_post(
        self,
        access_token: str,
        organization_id: Optional[str],
        job_data: Dict[str, Any]
    ) -> str:
        """
        Publier une offre d'emploi sur LinkedIn
        
        Args:
            access_token: Token d'accès LinkedIn
            organization_id: ID de l'organisation LinkedIn (None = publier au nom du membre)
            job_data: Données du job (title, description, location, etc.)
            
        Returns:
            Post ID LinkedIn
        """
        if not self.enabled:
            raise ValueError("LinkedIn integration is not enabled")
        
        # Déterminer l'author (organization ou membre personnel)
        if organization_id:
            author_urn = organization_id
            logger.info(f"🏬 Publishing as organization: {organization_id}")
        else:
            # Publier au nom du membre personnel
            author_urn = await self.get_member_urn(access_token)
            logger.info(f"👤 Publishing as personal member: {author_urn}")

        # Si une image est fournie, l'uploader et l'attacher comme média IMAGE.
        # Sinon, utiliser une carte ARTICLE pointant vers l'offre (aperçu de lien).
        image_url = job_data.get("image_url")
        image_asset = None
        if image_url:
            image_asset = await self._upload_image_asset(access_token, author_urn, image_url)

        if image_asset:
            share_content = {
                "shareCommentary": {
                    "text": self._format_job_post(job_data)
                },
                "shareMediaCategory": "IMAGE",
                "media": [
                    {
                        "status": "READY",
                        "description": {
                            "text": job_data.get("description", "")[:256]
                        },
                        "media": image_asset,
                        "title": {
                            "text": job_data.get("title", "")
                        }
                    }
                ]
            }
        else:
            share_content = {
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

        # Préparer le payload pour LinkedIn Share API
        share_payload = {
            "author": author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": share_content
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

        Si un message personnalisé (custom_message) est fourni, il est utilisé comme
        base. Le lien vers l'offre (apply_url) est toujours ajouté à la fin.

        Args:
            job_data: Données du job

        Returns:
            Texte formaté pour LinkedIn
        """
        apply_url = job_data.get("apply_url", "")
        custom_message = (job_data.get("custom_message") or "").strip()

        if custom_message:
            text = custom_message
        else:
            title = job_data.get("title", "Nouvelle opportunité")
            location = job_data.get("location", "")
            job_type = job_data.get("job_type", "").replace("_", " ").title()
            company_name = job_data.get("company_name", "Notre entreprise")

            text = f"🚀 {company_name} recrute : {title}\n\n"

            if location:
                text += f"📍 Localisation : {location}\n"
            if job_type:
                text += f"💼 Type : {job_type}\n"

            text += f"\n{job_data.get('summary', '')}\n"
            text += f"\n#Recrutement #Emploi #{job_type.replace(' ', '')}"

        # Toujours ajouter le lien vers l'offre IntoWork
        if apply_url:
            text += f"\n\n👉 Postulez maintenant : {apply_url}"

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
