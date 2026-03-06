"""
Service d'intégration Targetym pour IntoWork.
Gère les appels vers l'API Targetym lors d'événements IntoWork.
"""

import httpx
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

TARGETYM_API_URL = os.getenv("TARGETYM_API_URL", "https://targetym-api.railway.app")
TIMEOUT = 10.0


async def notify_candidate_hired(
    *,
    targetym_tenant_id: int,
    targetym_api_key: str,
    first_name: str,
    last_name: str,
    email: str,
    job_title: str,
    phone: Optional[str] = None,
    location: Optional[str] = None,
    intowork_application_id: int,
    intowork_company_id: int,
) -> bool:
    """
    Notifie Targetym qu'un candidat IntoWork vient d'être accepté.
    Targetym crée alors automatiquement un employé dans le tenant concerné.

    Retourne True si l'appel a réussi, False sinon (sans lever d'exception
    pour ne pas bloquer le flux principal IntoWork).
    """
    payload = {
        "tenant_id": targetym_tenant_id,
        "api_key": targetym_api_key,
        "employee": {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "location": location,
            "position": job_title,
            "source": "intowork",
            "intowork_application_id": intowork_application_id,
            "intowork_company_id": intowork_company_id,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{TARGETYM_API_URL}/api/integrations/intowork/webhook/new-employee",
                json=payload,
            )
        if resp.status_code == 200:
            logger.info(
                f"✅ Targetym notifié : candidat {email} → employé dans tenant {targetym_tenant_id}"
            )
            return True
        else:
            logger.warning(
                f"⚠️ Targetym a répondu {resp.status_code} pour la création de l'employé {email}: {resp.text[:200]}"
            )
            return False
    except httpx.RequestError as e:
        logger.error(f"❌ Impossible de joindre Targetym : {e}")
        return False


async def sync_job_to_intowork(
    *,
    intowork_company_id: int,
    intowork_api_key: str,
    job: dict,
) -> bool:
    """
    Pousse une offre Targetym vers IntoWork.
    Appelé par le service IntoWork (depuis Targetym via webhook).
    Ce helper est utilisé en interne dans IntoWork pour confirmer la réception.
    """
    # Ce côté est géré par le webhook entrant dans integrations.py
    # La fonction est ici pour documentation / tests futurs
    return True
