"""
GUIDE : Comment utiliser les templates d'email

Ce guide montre comment utiliser les templates d'email configurés dans le dashboard
pour envoyer des emails automatiques aux candidats.
"""

# ========================================
# EXEMPLE 1 : Envoyer un email d'invitation à un entretien
# ========================================

# Dans votre fichier (ex: app/api/applications.py)

from app.services.email_service import email_service
from sqlalchemy import select
from app.models.base import EmailTemplate, EmailTemplateType

@router.patch("/{application_id}/schedule-interview")
async def schedule_interview(
    application_id: int,
    interview_data: dict,  # {date, time, location}
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Planifier un entretien et envoyer un email au candidat"""
    
    # 1. Récupérer l'application et le candidat
    application = await get_application(application_id, db)
    candidate = application.candidate
    job = application.job
    
    # 2. Récupérer le template par défaut pour "interview_invitation"
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.company_id == employer.company_id,
            EmailTemplate.type == EmailTemplateType.INTERVIEW_INVITATION,
            EmailTemplate.is_default == True,
            EmailTemplate.is_active == True
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        # Pas de template configuré, log une erreur
        logger.warning(f"No default interview_invitation template for company {employer.company_id}")
        return {"message": "Interview scheduled but no email sent (no template)"}
    
    # 3. Préparer les variables pour le template
    variables = {
        "candidate_name": f"{candidate.user.first_name} {candidate.user.last_name}",
        "candidate_first_name": candidate.user.first_name,
        "candidate_last_name": candidate.user.last_name,
        "candidate_email": candidate.user.email,
        "job_title": job.title,
        "job_location": job.location,
        "company_name": job.company.name,
        "recruiter_name": employer.user.name or employer.user.email,
        "recruiter_email": employer.user.email,
        "interview_date": interview_data["date"],
        "interview_time": interview_data["time"],
        "interview_location": interview_data["location"],
    }
    
    # 4. Envoyer l'email avec le template
    email_sent = await email_service.send_from_template(
        template_id=template.id,
        to_email=candidate.user.email,
        variables=variables,
        db=db
    )
    
    if email_sent:
        logger.info(f"✅ Interview invitation email sent to {candidate.user.email}")
    else:
        logger.error(f"❌ Failed to send interview invitation to {candidate.user.email}")
    
    return {"message": "Interview scheduled", "email_sent": email_sent}


# ========================================
# EXEMPLE 2 : Email de refus de candidature
# ========================================

@router.patch("/{application_id}/reject")
async def reject_application(
    application_id: int,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Rejeter une candidature et envoyer un email de refus"""
    
    # 1. Mettre à jour le statut de l'application
    application = await get_application(application_id, db)
    application.status = ApplicationStatus.REJECTED
    await db.commit()
    
    # 2. Récupérer le template de refus par défaut
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.company_id == employer.company_id,
            EmailTemplate.type == EmailTemplateType.REJECTION,
            EmailTemplate.is_default == True,
            EmailTemplate.is_active == True
        )
    )
    template = result.scalar_one_or_none()
    
    if template:
        # 3. Envoyer l'email
        variables = {
            "candidate_name": f"{application.candidate.user.first_name} {application.candidate.user.last_name}",
            "candidate_first_name": application.candidate.user.first_name,
            "job_title": application.job.title,
            "company_name": application.job.company.name,
            "application_date": application.created_at.strftime("%d/%m/%Y"),
        }
        
        await email_service.send_from_template(
            template_id=template.id,
            to_email=application.candidate.user.email,
            variables=variables,
            db=db
        )
    
    return {"message": "Application rejected", "email_sent": bool(template)}


# ========================================
# EXEMPLE 3 : Confirmation de candidature reçue
# ========================================

# Dans app/api/applications.py - endpoint de création d'application

@router.post("")
async def create_application(
    job_id: int,
    candidate: Annotated[Candidate, Depends(require_candidate)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Créer une nouvelle candidature et envoyer un email de confirmation"""
    
    # 1. Créer l'application
    new_application = JobApplication(
        candidate_id=candidate.id,
        job_id=job_id,
        status=ApplicationStatus.APPLIED
    )
    db.add(new_application)
    await db.commit()
    
    # 2. Récupérer le job et la company pour les variables
    job = await get_job(job_id, db)
    
    # 3. Récupérer le template "application_received"
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.company_id == job.company_id,
            EmailTemplate.type == EmailTemplateType.APPLICATION_RECEIVED,
            EmailTemplate.is_default == True,
            EmailTemplate.is_active == True
        )
    )
    template = result.scalar_one_or_none()
    
    if template:
        variables = {
            "candidate_name": f"{candidate.user.first_name} {candidate.user.last_name}",
            "candidate_first_name": candidate.user.first_name,
            "job_title": job.title,
            "company_name": job.company.name,
            "application_date": datetime.now().strftime("%d/%m/%Y"),
        }
        
        await email_service.send_from_template(
            template_id=template.id,
            to_email=candidate.user.email,
            variables=variables,
            db=db
        )
    
    return new_application


# ========================================
# EXEMPLE 4 : Récupérer un template spécifique par ID
# ========================================

async def send_custom_email_to_candidate(
    template_id: int,
    candidate_email: str,
    custom_variables: dict,
    db: AsyncSession
):
    """
    Envoyer un email avec un template spécifique (pas nécessairement le template par défaut)
    Utile pour les recruteurs qui veulent choisir le template manuellement
    """
    
    email_sent = await email_service.send_from_template(
        template_id=template_id,
        to_email=candidate_email,
        variables=custom_variables,
        db=db
    )
    
    return email_sent


# ========================================
# EXEMPLE 5 : Lister les templates disponibles
# ========================================

@router.get("/company/{company_id}/templates")
async def get_available_templates(
    company_id: int,
    employer: Annotated[Employer, Depends(require_employer)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Récupérer tous les templates actifs d'une entreprise
    Utile pour afficher un dropdown dans l'interface
    """
    
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.company_id == company_id,
            EmailTemplate.is_active == True
        ).order_by(EmailTemplate.type, EmailTemplate.name)
    )
    templates = result.scalars().all()
    
    return [
        {
            "id": t.id,
            "name": t.name,
            "type": t.type,
            "is_default": t.is_default,
            "subject": t.subject
        }
        for t in templates
    ]


# ========================================
# BONNES PRATIQUES
# ========================================

"""
1. Toujours vérifier si un template existe avant d'envoyer
   - Si pas de template, log une erreur mais ne bloquez pas le flux

2. Utiliser les templates par défaut pour les emails automatiques
   - EmailTemplate.is_default == True
   - EmailTemplate.is_active == True

3. Fournir toutes les variables attendues
   - Même si optionnelles, mieux vaut tout fournir
   - Vérifier la liste des variables avec GET /email-templates/variables

4. Le compteur usage_count est mis à jour automatiquement
   - Utile pour voir quels templates sont les plus utilisés

5. last_used_at permet de voir quand un template a été utilisé pour la dernière fois
   - Utile pour nettoyer les templates obsolètes

6. Types de templates disponibles :
   - WELCOME_CANDIDATE : Email de bienvenue
   - INTERVIEW_INVITATION : Invitation à un entretien
   - REJECTION : Email de refus
   - OFFER : Offre d'emploi
   - FOLLOW_UP : Email de suivi
   - APPLICATION_RECEIVED : Confirmation de candidature
"""
