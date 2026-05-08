"""
API Routes for Email Templates (ATS Phase 2)
Permet aux recruteurs de créer et gérer des templates d'emails réutilisables
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete as sql_delete, func
from typing import Annotated, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

from app.database import get_db
from app.auth import require_employer, require_employer_or_admin
from app.models.base import EmailTemplate, EmailTemplateType, User, Employer

router = APIRouter(prefix="/email-templates", tags=["email-templates"])


# ========================================
# Templates système (par défaut IntoWork)
# ========================================

SYSTEM_TEMPLATES = [
    {
        "type": EmailTemplateType.APPLICATION_RECEIVED,
        "name": "Accusé de réception candidature",
        "subject": "Votre candidature pour le poste {job_title} a bien été reçue",
        "body": """<p>Bonjour {candidate_first_name},</p>

<p>Nous avons bien reçu votre candidature pour le poste de <strong>{job_title}</strong> au sein de <strong>{company_name}</strong>.</p>

<p>Notre équipe va étudier votre dossier avec attention. Nous vous contacterons dans les prochains jours pour vous informer de la suite donnée à votre candidature.</p>

<p>Nous vous remercions de l'intérêt que vous portez à notre entreprise.</p>

<p>Cordialement,<br>
<strong>{recruiter_name}</strong><br>
{company_name}</p>""",
    },
    {
        "type": EmailTemplateType.INTERVIEW_INVITATION,
        "name": "Invitation à un entretien",
        "subject": "Invitation à un entretien — {job_title} chez {company_name}",
        "body": """<p>Bonjour {candidate_first_name},</p>

<p>Nous avons examiné votre candidature pour le poste de <strong>{job_title}</strong> et nous avons le plaisir de vous inviter à un entretien.</p>

<p><strong>Détails de l'entretien :</strong><br>
📅 Date : {interview_date}<br>
🕐 Heure : {interview_time}<br>
📍 Lieu : {interview_location}</p>

<p>Merci de nous confirmer votre disponibilité en répondant à cet email.</p>

<p>Cordialement,<br>
<strong>{recruiter_name}</strong><br>
{company_name}</p>""",
    },
    {
        "type": EmailTemplateType.INTERVIEW_CONFIRMATION,
        "name": "Confirmation d'entretien",
        "subject": "Confirmation de votre entretien — {job_title}",
        "body": """<p>Bonjour {candidate_first_name},</p>

<p>Nous confirmons votre entretien pour le poste de <strong>{job_title}</strong>.</p>

<p><strong>Rappel :</strong><br>
📅 {interview_date} à {interview_time}<br>
📍 {interview_location}</p>

<p>Pensez à apporter votre CV et tout document utile. N'hésitez pas à nous contacter si vous avez des questions.</p>

<p>À très bientôt,<br>
<strong>{recruiter_name}</strong><br>
{company_name}</p>""",
    },
    {
        "type": EmailTemplateType.INTERVIEW_REMINDER,
        "name": "Rappel d'entretien (J-1)",
        "subject": "Rappel — Votre entretien demain pour {job_title}",
        "body": """<p>Bonjour {candidate_first_name},</p>

<p>Nous vous rappelons que votre entretien pour le poste de <strong>{job_title}</strong> a lieu <strong>demain</strong>.</p>

<p>📅 {interview_date} à {interview_time}<br>
📍 {interview_location}</p>

<p>En cas d'empêchement, merci de nous prévenir le plus tôt possible.</p>

<p>À demain,<br>
<strong>{recruiter_name}</strong><br>
{company_name}</p>""",
    },
    {
        "type": EmailTemplateType.APPLICATION_REJECTED,
        "name": "Refus de candidature (professionnel)",
        "subject": "Suite donnée à votre candidature — {job_title}",
        "body": """<p>Bonjour {candidate_first_name},</p>

<p>Nous avons bien étudié votre candidature pour le poste de <strong>{job_title}</strong> au sein de <strong>{company_name}</strong>.</p>

<p>Après examen attentif des dossiers reçus, nous avons le regret de vous informer que votre candidature n'a pas été retenue pour ce poste. Cette décision ne remet pas en cause la qualité de votre profil.</p>

<p>Nous conservons votre dossier et n'hésiterons pas à vous recontacter si une opportunité correspondant à votre profil se présente.</p>

<p>Nous vous souhaitons plein succès dans vos recherches.</p>

<p>Cordialement,<br>
<strong>{recruiter_name}</strong><br>
{company_name}</p>""",
    },
    {
        "type": EmailTemplateType.OFFER_LETTER,
        "name": "Lettre d'offre d'emploi",
        "subject": "Offre d'emploi — {job_title} chez {company_name}",
        "body": """<p>Bonjour {candidate_first_name},</p>

<p>Nous avons le plaisir de vous proposer le poste de <strong>{job_title}</strong> au sein de <strong>{company_name}</strong>.</p>

<p>Nous avons été très impressionnés par votre parcours et sommes convaincus que vous apporterez une réelle valeur ajoutée à notre équipe.</p>

<p>Vous trouverez ci-joint les détails de notre proposition. Nous restons disponibles pour répondre à toutes vos questions.</p>

<p>Dans l'attente de votre retour, veuillez agréer l'expression de nos salutations distinguées.</p>

<p><strong>{recruiter_name}</strong><br>
{company_name}</p>""",
    },
    {
        "type": EmailTemplateType.WELCOME_CANDIDATE,
        "name": "Bienvenue dans l'équipe",
        "subject": "Bienvenue chez {company_name} — {job_title}",
        "body": """<p>Bonjour {candidate_first_name},</p>

<p>Au nom de toute l'équipe de <strong>{company_name}</strong>, nous sommes ravis de vous accueillir en tant que <strong>{job_title}</strong>.</p>

<p>Votre arrivée est une excellente nouvelle pour nous, et nous avons hâte de commencer cette aventure professionnelle ensemble.</p>

<p>Des informations pratiques sur votre intégration vous seront communiquées très prochainement.</p>

<p>Encore une fois, bienvenue !<br>
<strong>{recruiter_name}</strong><br>
{company_name}</p>""",
    },
]


class SystemTemplateResponse(BaseModel):
    """Template système IntoWork (non lié à une entreprise)"""
    type: str
    name: str
    subject: str
    body: str
    already_activated: bool = False


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

class EmailTemplateCreate(BaseModel):
    """Création d'un nouveau template"""
    name: str = Field(..., min_length=1, max_length=200, description="Nom du template")
    type: EmailTemplateType = Field(..., description="Type de template")
    subject: str = Field(..., min_length=1, max_length=500, description="Sujet de l'email")
    body: str = Field(..., min_length=1, description="Corps de l'email (HTML supporté)")
    is_default: bool = Field(default=False, description="Template par défaut pour ce type")


class EmailTemplateUpdate(BaseModel):
    """Mise à jour d'un template existant"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[EmailTemplateType] = None
    subject: Optional[str] = Field(None, min_length=1, max_length=500)
    body: Optional[str] = Field(None, min_length=1)
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class EmailTemplateResponse(BaseModel):
    """Réponse avec un template complet"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_by_user_id: int
    name: str
    type: EmailTemplateType
    subject: str
    body: str
    is_active: bool
    is_default: bool
    usage_count: int
    created_at: datetime
    updated_at: datetime
    last_used_at: Optional[datetime]


class TemplateVariablesResponse(BaseModel):
    """Variables disponibles pour interpolation dans les templates"""
    variables: List[str]
    descriptions: dict


# ========================================
# API Routes
# ========================================

@router.post("", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_email_template(
    template_data: EmailTemplateCreate,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Créer un nouveau template d'email
    
    Variables disponibles : {candidate_name}, {job_title}, {company_name}, {recruiter_name}, 
    {interview_date}, {interview_time}, {interview_location}, {application_status}
    """
    
    # Debug logging
    print(f"📧 Creating email template - Data received: {template_data.model_dump()}")
    
    # Vérifier que l'employeur a une entreprise
    if not employer.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create a company profile before creating email templates"
        )
    
    # Si c'est un template par défaut, désactiver les autres par défaut du même type
    if template_data.is_default:
        await db.execute(
            update(EmailTemplate)
            .where(
                EmailTemplate.company_id == employer.company_id,
                EmailTemplate.type == template_data.type
            )
            .values(is_default=False)
        )
    
    # Créer le nouveau template
    new_template = EmailTemplate(
        company_id=employer.company_id,
        created_by_user_id=employer.user_id,
        name=template_data.name,
        type=template_data.type,
        subject=template_data.subject,
        body=template_data.body,
        is_default=template_data.is_default
    )
    
    db.add(new_template)
    await db.commit()
    await db.refresh(new_template)
    
    return new_template


@router.get("", response_model=List[EmailTemplateResponse])
async def list_email_templates(
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)],
    type: Optional[EmailTemplateType] = None,
    is_active: Optional[bool] = None
):
    """
    Lister tous les templates d'email de l'entreprise
    
    Filtres optionnels :
    - type : Filtrer par type de template
    - is_active : Filtrer par statut actif/inactif
    """
    
    # Vérifier que l'employeur a une entreprise
    if not employer.company_id:
        return []  # Retourner liste vide si pas d'entreprise
    
    query = select(EmailTemplate).where(EmailTemplate.company_id == employer.company_id)
    
    if type:
        query = query.where(EmailTemplate.type == type)
    if is_active is not None:
        query = query.where(EmailTemplate.is_active == is_active)
    
    query = query.order_by(EmailTemplate.type, EmailTemplate.is_default.desc(), EmailTemplate.name)
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return templates


@router.get("/variables", response_model=TemplateVariablesResponse)
async def get_template_variables(
    employer: Annotated[Employer, Depends(get_employer_profile)]
):
    """
    Liste des variables disponibles pour interpolation dans les templates
    """
    
    variables_info = {
        "variables": [
            "{candidate_name}",
            "{candidate_first_name}",
            "{candidate_last_name}",
            "{candidate_email}",
            "{job_title}",
            "{job_location}",
            "{company_name}",
            "{recruiter_name}",
            "{recruiter_email}",
            "{interview_date}",
            "{interview_time}",
            "{interview_location}",
            "{interview_link}",
            "{application_status}",
            "{application_date}",
        ],
        "descriptions": {
            "{candidate_name}": "Nom complet du candidat",
            "{candidate_first_name}": "Prénom du candidat",
            "{candidate_last_name}": "Nom de famille du candidat",
            "{candidate_email}": "Email du candidat",
            "{job_title}": "Titre du poste",
            "{job_location}": "Localisation du poste",
            "{company_name}": "Nom de l'entreprise",
            "{recruiter_name}": "Nom du recruteur",
            "{recruiter_email}": "Email du recruteur",
            "{interview_date}": "Date de l'entretien",
            "{interview_time}": "Heure de l'entretien",
            "{interview_location}": "Lieu de l'entretien",
            "{interview_link}": "Lien de visioconférence",
            "{application_status}": "Statut de la candidature",
            "{application_date}": "Date de candidature",
        }
    }
    
    return variables_info


@router.get("/defaults", response_model=List[SystemTemplateResponse])
async def get_default_templates(
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Retourne les templates système IntoWork.
    Le champ `already_activated` indique si l'entreprise possède déjà un template de ce type.
    """
    already_activated_types: set[str] = set()
    if employer.company_id:
        result = await db.execute(
            select(EmailTemplate.type).where(EmailTemplate.company_id == employer.company_id)
        )
        already_activated_types = {row[0].value for row in result.fetchall()}

    return [
        SystemTemplateResponse(
            type=tpl["type"].value,
            name=tpl["name"],
            subject=tpl["subject"],
            body=tpl["body"],
            already_activated=tpl["type"].value in already_activated_types,
        )
        for tpl in SYSTEM_TEMPLATES
    ]


@router.post("/defaults/{template_type}/activate", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
async def activate_default_template(
    template_type: EmailTemplateType,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Clone un template système dans l'entreprise de l'employeur.
    Le template est créé actif et marqué comme défaut pour ce type.
    """
    if not employer.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create a company profile before activating templates"
        )

    system_tpl = next((t for t in SYSTEM_TEMPLATES if t["type"] == template_type), None)
    if not system_tpl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Default template not found")

    # Désactiver le flag is_default pour ce type dans la compagnie
    await db.execute(
        update(EmailTemplate)
        .where(
            EmailTemplate.company_id == employer.company_id,
            EmailTemplate.type == template_type
        )
        .values(is_default=False)
    )

    new_template = EmailTemplate(
        company_id=employer.company_id,
        created_by_user_id=employer.user_id,
        name=system_tpl["name"],
        type=template_type,
        subject=system_tpl["subject"],
        body=system_tpl["body"],
        is_default=True,
        is_active=True,
    )
    db.add(new_template)
    await db.commit()
    await db.refresh(new_template)
    return new_template


@router.get("/{template_id}", response_model=EmailTemplateResponse)
async def get_email_template(
    template_id: int,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Récupérer un template spécifique"""
    
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.id == template_id,
            EmailTemplate.company_id == employer.company_id
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return template


@router.patch("/{template_id}", response_model=EmailTemplateResponse)
async def update_email_template(
    template_id: int,
    update_data: EmailTemplateUpdate,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Mettre à jour un template existant"""
    
    # Récupérer le template
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.id == template_id,
            EmailTemplate.company_id == employer.company_id
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Si on change is_default à True, désactiver les autres
    if update_data.is_default and not template.is_default:
        await db.execute(
            update(EmailTemplate)
            .where(
                EmailTemplate.company_id == employer.company_id,
                EmailTemplate.type == template.type,
                EmailTemplate.id != template_id
            )
            .values(is_default=False)
        )
    
    # Mettre à jour les champs fournis
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(template, field, value)
    
    await db.commit()
    await db.refresh(template)
    
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email_template(
    template_id: int,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Supprimer un template (soft delete - désactive plutôt que supprimer)"""
    
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.id == template_id,
            EmailTemplate.company_id == employer.company_id
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Supprimer définitivement le template
    await db.delete(template)
    await db.commit()

    return None


@router.post("/{template_id}/duplicate", response_model=EmailTemplateResponse)
async def duplicate_email_template(
    template_id: int,
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Dupliquer un template existant"""
    
    # Récupérer le template original
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.id == template_id,
            EmailTemplate.company_id == employer.company_id
        )
    )
    original = result.scalar_one_or_none()
    
    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Créer une copie
    duplicate = EmailTemplate(
        company_id=original.company_id,
        created_by_user_id=employer.user_id,
        name=f"{original.name} (Copie)",
        type=original.type,
        subject=original.subject,
        body=original.body,
        is_default=False,  # La copie n'est jamais par défaut
        is_active=True
    )
    
    db.add(duplicate)
    await db.commit()
    await db.refresh(duplicate)
    
    return duplicate


@router.get("/stats/usage", response_model=dict)
async def get_template_usage_stats(
    employer: Annotated[Employer, Depends(get_employer_profile)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Statistiques d'utilisation des templates"""
    
    # Total de templates
    total_result = await db.execute(
        select(func.count(EmailTemplate.id))
        .where(EmailTemplate.company_id == employer.company_id)
    )
    total_templates = total_result.scalar()
    
    # Templates actifs
    active_result = await db.execute(
        select(func.count(EmailTemplate.id))
        .where(
            EmailTemplate.company_id == employer.company_id,
            EmailTemplate.is_active == True
        )
    )
    active_templates = active_result.scalar()
    
    # Template le plus utilisé
    most_used_result = await db.execute(
        select(EmailTemplate)
        .where(EmailTemplate.company_id == employer.company_id)
        .order_by(EmailTemplate.usage_count.desc())
        .limit(1)
    )
    most_used = most_used_result.scalar_one_or_none()
    
    # Total d'utilisations
    usage_sum_result = await db.execute(
        select(func.sum(EmailTemplate.usage_count))
        .where(EmailTemplate.company_id == employer.company_id)
    )
    total_usage = usage_sum_result.scalar() or 0
    
    return {
        "total_templates": total_templates,
        "active_templates": active_templates,
        "inactive_templates": total_templates - active_templates,
        "total_usage": total_usage,
        "most_used_template": {
            "id": most_used.id,
            "name": most_used.name,
            "usage_count": most_used.usage_count
        } if most_used else None
    }
