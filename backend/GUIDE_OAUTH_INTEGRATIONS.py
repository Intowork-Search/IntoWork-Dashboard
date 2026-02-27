"""
GUIDE : Comment utiliser les intégrations OAuth
LinkedIn, Google Calendar, Microsoft Outlook/Teams

Ce guide explique comment utiliser les intégrations OAuth configurées dans le dashboard.
"""

# ========================================
# VUE D'ENSEMBLE DES INTÉGRATIONS
# ========================================

"""
IntoWork Dashboard supporte 3 intégrations OAuth :

1. **LinkedIn** - Importer le profil professionnel du candidat
   - Scope : w_member_social
   - Endpoint : /api/integrations/linkedin/connect
   - Callback : /api/integrations/linkedin/callback

2. **Google Calendar** - Créer des événements d'entretien automatiquement
   - Scopes : calendar, calendar.events
   - Endpoint : /api/integrations/google-calendar/connect
   - Callback : /api/integrations/google-calendar/callback

3. **Microsoft Outlook** - Créer des événements dans Outlook Calendar
   - Scopes : Calendars.ReadWrite, User.Read, offline_access
   - Endpoint : /api/integrations/outlook/connect
   - Callback : /api/integrations/outlook/callback

État de connexion stocké dans la table `oauth_integrations` avec:
- user_id : ID de l'utilisateur
- provider : linkedin, google_calendar, outlook
- access_token : Token d'accès (chiffré)
- refresh_token : Token de rafraîchissement (optionnel)
- expires_at : Date d'expiration du token
- is_active : Statut de l'intégration
"""

# ========================================
# DEPUIS LE FRONTEND : Connecter une intégration
# ========================================

"""
Les utilisateurs peuvent connecter leurs comptes depuis :
https://www.intowork.co/dashboard/settings

Onglet "Intégrations" avec 3 boutons :
- "Connecter LinkedIn"
- "Connecter Google Calendar"
- "Connecter Outlook Calendar"

Workflow :
1. Utilisateur clique sur "Connecter Google Calendar"
2. Frontend redirige vers : /api/integrations/google-calendar/connect
3. Backend génère un état (state) avec user_id encodé en base64
4. Redirige vers la page de consentement Google OAuth
5. Utilisateur autorise l'application
6. Google redirige vers : /api/integrations/google-calendar/callback?code=xxx&state=yyy
7. Backend échange le code contre un access_token
8. Stocke le token dans oauth_integrations
9. Redirige vers : /dashboard/settings?integration=google_calendar&status=success
"""

# Exemple de bouton dans le frontend (React/Next.js)
"""
<button
  onClick={() => {
    window.location.href = `${API_URL}/integrations/google-calendar/connect`;
  }}
  className="btn btn-primary"
>
  🔗 Connecter Google Calendar
</button>
"""

# ========================================
# DEPUIS LE BACKEND : Vérifier si une intégration est active
# ========================================

from sqlalchemy import select
from app.models.base import OAuthIntegration

async def is_google_calendar_connected(user_id: int, db: AsyncSession) -> bool:
    """Vérifier si l'utilisateur a connecté Google Calendar"""
    
    result = await db.execute(
        select(OAuthIntegration).where(
            OAuthIntegration.user_id == user_id,
            OAuthIntegration.provider == "google_calendar",
            OAuthIntegration.is_active == True
        )
    )
    integration = result.scalar_one_or_none()
    
    return integration is not None


async def get_active_integrations(user_id: int, db: AsyncSession) -> dict:
    """Récupérer toutes les intégrations actives d'un utilisateur"""
    
    result = await db.execute(
        select(OAuthIntegration).where(
            OAuthIntegration.user_id == user_id,
            OAuthIntegration.is_active == True
        )
    )
    integrations = result.scalars().all()
    
    return {
        "linkedin": any(i.provider == "linkedin" for i in integrations),
        "google_calendar": any(i.provider == "google_calendar" for i in integrations),
        "outlook": any(i.provider == "outlook" for i in integrations)
    }


# ========================================
# EXEMPLE 1 : Créer un événement Google Calendar lors d'un entretien
# ========================================

from app.services.google_calendar_service import google_calendar_service

@router.post("/applications/{application_id}/schedule-interview")
async def schedule_interview_with_calendar(
    application_id: int,
    interview_data: dict,  # {date, time, duration, location}
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Planifier un entretien et créer automatiquement un événement Google Calendar
    """
    
    # 1. Récupérer l'application et le candidat
    application = await get_application(application_id, db)
    candidate = application.candidate
    candidate_user = candidate.user
    job = application.job
    
    # 2. Vérifier si le candidat a connecté Google Calendar
    has_google_calendar = await is_google_calendar_connected(candidate.user_id, db)
    
    calendar_event_created = False
    calendar_event_link = None
    
    if has_google_calendar:
        try:
            # 3. Créer l'événement dans Google Calendar du candidat
            event_data = {
                "summary": f"Entretien - {job.title}",
                "description": f"Entretien pour le poste de {job.title} chez {job.company.name}",
                "start_time": interview_data["date"] + "T" + interview_data["time"] + ":00",
                "end_time": interview_data["date"] + "T" + interview_data["end_time"] + ":00",
                "location": interview_data.get("location", ""),
                "attendees": [
                    candidate_user.email,  # Candidat
                    employer.user.email    # Recruteur
                ]
            }
            
            # Créer l'événement
            event = await google_calendar_service.create_event(
                user_id=candidate.user_id,
                event_data=event_data,
                db=db
            )
            
            if event:
                calendar_event_created = True
                calendar_event_link = event.get("htmlLink")
                logger.info(f"✅ Google Calendar event created for application {application_id}")
            else:
                logger.warning(f"⚠️ Failed to create Google Calendar event for application {application_id}")
                
        except Exception as e:
            logger.error(f"❌ Error creating Google Calendar event: {e}")
            # Ne pas bloquer si la création échoue
    else:
        logger.debug(f"Candidate {candidate.user_id} has not connected Google Calendar")
    
    # 4. Envoyer un email d'invitation avec le lien du calendrier
    # (utiliser les templates d'email comme dans les exemples précédents)
    
    return {
        "message": "Interview scheduled",
        "calendar_event_created": calendar_event_created,
        "calendar_link": calendar_event_link
    }


# ========================================
# EXEMPLE 2 : Créer un événement Outlook Calendar
# ========================================

from app.services.outlook_calendar_service import outlook_calendar_service

async def schedule_interview_outlook(
    candidate_user_id: int,
    employer_email: str,
    interview_data: dict,
    job_title: str,
    company_name: str,
    db: AsyncSession
) -> dict:
    """
    Créer un événement dans Outlook Calendar du candidat
    """
    
    # Vérifier si le candidat a connecté Outlook
    has_outlook = await db.execute(
        select(OAuthIntegration).where(
            OAuthIntegration.user_id == candidate_user_id,
            OAuthIntegration.provider == "outlook",
            OAuthIntegration.is_active == True
        )
    )
    outlook_integration = has_outlook.scalar_one_or_none()
    
    if not outlook_integration:
        return {"success": False, "reason": "Outlook not connected"}
    
    try:
        # Créer l'événement
        event_data = {
            "subject": f"Entretien - {job_title}",
            "body": f"Entretien pour le poste de {job_title} chez {company_name}",
            "start_time": interview_data["date"] + "T" + interview_data["time"] + ":00",
            "end_time": interview_data["date"] + "T" + interview_data["end_time"] + ":00",
            "location": interview_data.get("location", ""),
            "attendees": [employer_email]
        }
        
        event = await outlook_calendar_service.create_event(
            user_id=candidate_user_id,
            event_data=event_data,
            db=db
        )
        
        if event:
            return {
                "success": True,
                "event_id": event.get("id"),
                "event_link": event.get("webLink")
            }
        else:
            return {"success": False, "reason": "Event creation failed"}
            
    except Exception as e:
        logger.error(f"Error creating Outlook event: {e}")
        return {"success": False, "reason": str(e)}


# ========================================
# EXEMPLE 3 : Importer le profil LinkedIn d'un candidat
# ========================================

from app.services.linkedin_service import linkedin_service

async def import_linkedin_profile(
    candidate_id: int,
    db: AsyncSession
) -> dict:
    """
    Importer le profil LinkedIn du candidat pour pré-remplir son profil
    """
    
    # Récupérer le candidat
    candidate_result = await db.execute(
        select(Candidate).filter(Candidate.id == candidate_id)
    )
    candidate = candidate_result.scalar_one_or_none()
    
    if not candidate:
        return {"success": False, "reason": "Candidate not found"}
    
    # Vérifier si LinkedIn est connecté
    has_linkedin = await db.execute(
        select(OAuthIntegration).where(
            OAuthIntegration.user_id == candidate.user_id,
            OAuthIntegration.provider == "linkedin",
            OAuthIntegration.is_active == True
        )
    )
    linkedin_integration = has_linkedin.scalar_one_or_none()
    
    if not linkedin_integration:
        return {"success": False, "reason": "LinkedIn not connected"}
    
    try:
        # Récupérer le profil LinkedIn
        profile_data = await linkedin_service.get_profile(
            user_id=candidate.user_id,
            db=db
        )
        
        if profile_data:
            # Mettre à jour le profil du candidat
            if profile_data.get("firstName") and profile_data.get("lastName"):
                candidate.user.first_name = profile_data["firstName"]
                candidate.user.last_name = profile_data["lastName"]
            
            if profile_data.get("headline"):
                candidate.title = profile_data["headline"]
            
            if profile_data.get("summary"):
                candidate.summary = profile_data["summary"]
            
            await db.commit()
            
            return {
                "success": True,
                "updated_fields": ["name", "title", "summary"]
            }
        else:
            return {"success": False, "reason": "Failed to fetch LinkedIn profile"}
            
    except Exception as e:
        logger.error(f"Error importing LinkedIn profile: {e}")
        return {"success": False, "reason": str(e)}


# ========================================
# EXEMPLE 4 : Déconnecter une intégration
# ========================================

@router.delete("/integrations/{provider}/disconnect")
async def disconnect_integration(
    provider: str,  # "linkedin", "google_calendar", "outlook"
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Déconnecter une intégration OAuth
    """
    
    from app.models.base import OAuthIntegration
    
    # Vérifier que le provider est valide
    valid_providers = ["linkedin", "google_calendar", "outlook"]
    if provider not in valid_providers:
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    # Récupérer l'intégration
    result = await db.execute(
        select(OAuthIntegration).where(
            OAuthIntegration.user_id == current_user.id,
            OAuthIntegration.provider == provider
        )
    )
    integration = result.scalar_one_or_none()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Désactiver l'intégration
    integration.is_active = False
    await db.commit()
    
    return {
        "message": f"{provider} integration disconnected successfully",
        "provider": provider
    }


# ========================================
# EXEMPLE 5 : Rafraîchir un access token expiré
# ========================================

async def refresh_expired_token(
    user_id: int,
    provider: str,  # "google_calendar" ou "outlook" (LinkedIn n'a pas de refresh token)
    db: AsyncSession
) -> bool:
    """
    Rafraîchir un access token expiré en utilisant le refresh token
    """
    
    # Récupérer l'intégration
    result = await db.execute(
        select(OAuthIntegration).where(
            OAuthIntegration.user_id == user_id,
            OAuthIntegration.provider == provider
        )
    )
    integration = result.scalar_one_or_none()
    
    if not integration or not integration.refresh_token:
        return False
    
    try:
        if provider == "google_calendar":
            # Utiliser le service Google Calendar pour rafraîchir
            new_tokens = await google_calendar_service.refresh_access_token(
                refresh_token=integration.refresh_token
            )
        elif provider == "outlook":
            # Utiliser le service Outlook pour rafraîchir
            new_tokens = await outlook_calendar_service.refresh_access_token(
                refresh_token=integration.refresh_token
            )
        else:
            return False
        
        if new_tokens:
            # Mettre à jour les tokens dans la base de données
            integration.access_token = new_tokens["access_token"]
            if "refresh_token" in new_tokens:
                integration.refresh_token = new_tokens["refresh_token"]
            if "expires_in" in new_tokens:
                from datetime import datetime, timedelta
                integration.expires_at = datetime.utcnow() + timedelta(seconds=new_tokens["expires_in"])
            
            await db.commit()
            return True
        
    except Exception as e:
        logger.error(f"Error refreshing token for {provider}: {e}")
        return False


# ========================================
# BONNES PRATIQUES
# ========================================

"""
1. **Toujours vérifier si l'intégration est active** avant de l'utiliser
   - Vérifier is_active == True
   - Vérifier expires_at > now()

2. **Gérer les erreurs gracieusement**
   - Ne jamais bloquer le workflow principal si une intégration échoue
   - Logger les erreurs pour le debugging
   - Informer l'utilisateur si l'intégration n'est pas disponible

3. **Rafraîchir les tokens expirés**
   - Google et Outlook tokens expirent après 1 heure
   - Utiliser le refresh_token pour obtenir un nouveau access_token
   - LinkedIn tokens expirent après 60 jours et ne sont pas rafraîchissables

4. **Sécurité**
   - Les access_tokens sont sensibles, ne jamais les exposer dans les logs ou le frontend
   - Utiliser HTTPS pour tous les callbacks OAuth
   - Valider le state parameter pour éviter les attaques CSRF

5. **UX**
   - Proposer la connexion OAuth au bon moment (ex: lors de la planification d'un entretien)
   - Permettre à l'utilisateur de déconnecter facilement
   - Afficher clairement quelles intégrations sont connectées dans les paramètres

6. **Testing**
   - Tester avec des comptes réels pour chaque provider
   - Vérifier que les callbacks fonctionnent en production
   - Tester le rafraîchissement des tokens
"""

# ========================================
# ENDPOINTS DISPONIBLES
# ========================================

"""
LinkedIn:
  GET  /api/integrations/linkedin/connect - Initier la connexion
  GET  /api/integrations/linkedin/callback - Callback après autorisation

Google Calendar:
  GET  /api/integrations/google-calendar/connect - Initier la connexion
  GET  /api/integrations/google-calendar/callback - Callback après autorisation
  POST /api/integrations/google-calendar/events - Créer un événement

Microsoft Outlook:
  GET  /api/integrations/outlook/connect - Initier la connexion
  GET  /api/integrations/outlook/callback - Callback après autorisation
  POST /api/integrations/outlook/events - Créer un événement

Gestion:
  GET    /api/integrations/status - Statut de toutes les intégrations
  DELETE /api/integrations/{provider}/disconnect - Déconnecter
  
Debug:
  GET /api/integrations/debug/config - Voir la configuration OAuth (sans secrets complets)
"""
