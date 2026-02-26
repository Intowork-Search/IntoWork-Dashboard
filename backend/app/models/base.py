from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum, LargeBinary, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base
import enum

class UserRole(enum.Enum):
    CANDIDATE = "candidate"
    EMPLOYER = "employer" 
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # NextAuth fields
    email = Column(String, unique=True, nullable=False, index=True)
    email_verified = Column(DateTime(timezone=True), nullable=True)
    password_hash = Column(String, nullable=True)  # Nullable pour OAuth providers
    name = Column(String, nullable=True)  # Combinaison first_name + last_name
    image = Column(String, nullable=True)  # URL de l'avatar
    
    # Legacy Clerk (garde pour transition)
    clerk_id = Column(String, unique=True, nullable=True, index=True)
    
    # App-specific fields
    role = Column(SQLEnum(UserRole), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    candidate = relationship("Candidate", back_populates="user", uselist=False, cascade="all, delete-orphan")
    employer = relationship("Employer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Informations personnelles
    phone = Column(String)
    location = Column(String)
    linkedin_url = Column(String)
    website_url = Column(String)
    profile_picture_url = Column(String)
    
    # Profil professionnel
    title = Column(String)  # Titre du poste recherché
    summary = Column(Text)  # Résumé professionnel
    years_experience = Column(Integer)
    salary_expectation_min = Column(Integer)
    salary_expectation_max = Column(Integer)
    
    # CV
    cv_url = Column(String)  # URL/chemin du CV uploadé
    cv_filename = Column(String)  # Nom du fichier CV
    cv_uploaded_at = Column(DateTime(timezone=True))  # Date de téléchargement
    # cv_content = Column(LargeBinary)  # Contenu binaire du CV (à ajouter plus tard)
    
    # Meta
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    user = relationship("User", back_populates="candidate")
    experiences = relationship("Experience", back_populates="candidate", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="candidate", cascade="all, delete-orphan")
    cvs = relationship("CandidateCV", back_populates="candidate", cascade="all, delete-orphan")

class CandidateCV(Base):
    __tablename__ = "candidate_cvs"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    
    filename = Column(String, nullable=False)  # Nom original du fichier
    file_path = Column(String, nullable=False)  # Chemin sur le disque
    file_size = Column(Integer)  # Taille en bytes
    is_active = Column(Boolean, default=True)  # CV actif/principal
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    candidate = relationship("Candidate", back_populates="cvs")

class Experience(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    start_date = Column(String, nullable=False)  # Format YYYY-MM
    end_date = Column(String)  # Format YYYY-MM, null si poste actuel
    is_current = Column(Boolean, default=False)
    description = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    candidate = relationship("Candidate", back_populates="experiences")

class Education(Base):
    __tablename__ = "educations"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    
    degree = Column(String, nullable=False)
    school = Column(String, nullable=False)
    location = Column(String)
    start_date = Column(String, nullable=False)  # Format YYYY-MM
    end_date = Column(String, nullable=False)   # Format YYYY-MM
    description = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    candidate = relationship("Candidate", back_populates="educations")

class SkillCategory(enum.Enum):
    TECHNICAL = "technical"
    SOFT = "soft"
    LANGUAGE = "language"

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    
    name = Column(String, nullable=False)
    level = Column(Integer, nullable=False)  # 1-5
    category = Column(SQLEnum(SkillCategory), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    candidate = relationship("Candidate", back_populates="skills")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Informations de l'entreprise
    name = Column(String, nullable=False)
    description = Column(Text)
    industry = Column(String)
    size = Column(String)  # "1-10", "11-50", "51-200", "201-500", "500+"
    website_url = Column(String)
    linkedin_url = Column(String)
    
    # Adresse
    address = Column(String)
    city = Column(String)
    country = Column(String)
    
    # Branding
    logo_url = Column(String)
    cloudinary_id = Column(String)  # Cloudinary public_id pour gestion optimisée des images
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    employers = relationship("Employer", back_populates="company")

class Employer(Base):
    __tablename__ = "employers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)  # Nullable: l'employeur peut créer son entreprise plus tard
    
    # Informations du recruteur
    position = Column(String)  # Poste dans l'entreprise
    department = Column(String)
    phone = Column(String)
    
    # Permissions
    can_create_jobs = Column(Boolean, default=True)
    can_manage_candidates = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)  # Admin de l'entreprise
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    user = relationship("User", back_populates="employer")
    company = relationship("Company", back_populates="employers")
    jobs = relationship("Job", back_populates="employer")

class JobType(enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    TEMPORARY = "temporary"
    INTERNSHIP = "internship"

class JobLocation(enum.Enum):
    ON_SITE = "on_site"
    REMOTE = "remote"
    HYBRID = "hybrid"

class JobStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Informations de base
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    responsibilities = Column(Text)
    benefits = Column(Text)
    
    # Détails du poste
    job_type = Column(SQLEnum(JobType), nullable=False, default=JobType.FULL_TIME)
    location_type = Column(SQLEnum(JobLocation), nullable=False, default=JobLocation.ON_SITE)
    location = Column(String)  # Ville, région
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    currency = Column(String, default="EUR")
    
    # Paramètres
    status = Column(SQLEnum(JobStatus), nullable=False, default=JobStatus.DRAFT)
    is_featured = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    
    # Dates
    posted_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    employer = relationship("Employer", back_populates="jobs")
    company = relationship("Company")
    applications = relationship("JobApplication", back_populates="job")

class ApplicationStatus(enum.Enum):
    APPLIED = "applied"
    VIEWED = "viewed"
    SHORTLISTED = "shortlisted"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    ACCEPTED = "accepted"

class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    cv_id = Column(Integer, ForeignKey("candidate_cvs.id"), nullable=True)  # CV sélectionné pour cette candidature
    
    # Candidature
    status = Column(SQLEnum(ApplicationStatus, values_callable=lambda x: [e.value for e in x]), nullable=False, default=ApplicationStatus.APPLIED)
    cover_letter = Column(Text)  # Lettre de motivation en texte
    cover_letter_url = Column(String)  # URL du fichier de lettre de motivation
    cv_url = Column(String)  # CV spécifique à cette candidature (legacy, deprecated)
    notes = Column(Text)  # Notes de l'employeur sur cette candidature
    
    # 🆕 Collaboration recruteurs (Phase 2)
    recruiter_notes = Column(JSONB)  # Notes collaboratives multiples [{user_id, note, created_at}]
    rating = Column(Integer)  # Note de 1 à 5 étoiles
    tags = Column(JSONB)  # Tags pour catégorisation ["bon profil", "senior", etc.]
    scorecard = Column(JSONB)  # Scorecard structurée {technical: 5, soft_skills: 4, culture_fit: 5}
    
    # Scoring IA
    ai_score = Column(Float)  # Score de 0 à 100
    ai_score_details = Column(JSONB)  # Détails du scoring (compétences, expérience, etc.)
    ai_analyzed_at = Column(DateTime(timezone=True))  # Date d'analyse IA
    
    # Suivi
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    viewed_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate")
    selected_cv = relationship("CandidateCV", foreign_keys=[cv_id])  # CV sélectionné pour cette candidature


class NotificationType(enum.Enum):
    """Types de notifications"""
    NEW_APPLICATION = "new_application"  # Nouvelle candidature reçue (employeur)
    STATUS_CHANGE = "status_change"  # Changement de statut de candidature (candidat)
    NEW_JOB = "new_job"  # Nouvelle offre d'emploi (candidat)
    MESSAGE = "message"  # Message générique
    SYSTEM = "system"  # Notification système


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Contenu
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String, nullable=False)  # Titre de la notification
    message = Column(Text, nullable=False)  # Message complet
    
    # Métadonnées
    related_job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)  # Job lié si applicable
    related_application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=True)  # Candidature liée
    
    # Statut
    is_read = Column(Boolean, default=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relations
    user = relationship("User")
    job = relationship("Job")
    application = relationship("JobApplication")


# NextAuth Models

class Account(Base):
    """NextAuth Account model - pour OAuth providers (Google, GitHub, etc.)"""
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    type = Column(String, nullable=False)  # oauth, email, credentials
    provider = Column(String, nullable=False)  # google, github, credentials
    provider_account_id = Column(String, nullable=False)  # ID from provider
    
    refresh_token = Column(Text, nullable=True)
    access_token = Column(Text, nullable=True)
    expires_at = Column(Integer, nullable=True)
    token_type = Column(String, nullable=True)
    scope = Column(String, nullable=True)
    id_token = Column(Text, nullable=True)
    session_state = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    user = relationship("User", back_populates="accounts")
    
    __table_args__ = (
        # Un provider_account_id unique par provider
        {'extend_existing': True}
    )


class Session(Base):
    """NextAuth Session model - pour database sessions"""
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    session_token = Column(String, unique=True, nullable=False, index=True)
    expires = Column(DateTime(timezone=True), nullable=False)

    # Refresh token support (Phase 2 - Task 12)
    refresh_token_hash = Column(String(255), nullable=True, index=True)  # bcrypt hash of refresh token

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    user = relationship("User", back_populates="sessions")


class VerificationToken(Base):
    """NextAuth VerificationToken - pour email verification"""
    __tablename__ = "verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, nullable=False)  # email
    token = Column(String, unique=True, nullable=False, index=True)
    expires = Column(DateTime(timezone=True), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        # Un token unique par identifier
        {'extend_existing': True}
    )


class PasswordResetToken(Base):
    """Token de réinitialisation de mot de passe"""
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    user = relationship("User")


# CV Builder Models

class CVTemplate(enum.Enum):
    """Templates de CV disponibles"""
    ELEGANCE = "elegance"
    BOLD = "bold"
    MINIMAL = "minimal"
    CREATIVE = "creative"
    EXECUTIVE = "executive"


class CVDocument(Base):
    """CV Builder - Document de CV interactif avec données JSON"""
    __tablename__ = "cv_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Données du CV (format JSON)
    cv_data = Column(Text, nullable=False)  # JSON string contenant toutes les données

    # Template et personnalisation
    template = Column(SQLEnum(CVTemplate), nullable=False, default=CVTemplate.ELEGANCE)

    # Métadonnées
    title = Column(String, nullable=True)  # Titre du CV (pour l'utilisateur)
    slug = Column(String, unique=True, nullable=False, index=True)  # URL publique unique (ex: john-doe)
    is_public = Column(Boolean, default=False, index=True)  # CV partagé publiquement

    # Statistiques
    views_count = Column(Integer, default=0)
    downloads_count = Column(Integer, default=0)

    # PDF généré (optionnel - cache)
    pdf_url = Column(String, nullable=True)  # Chemin du PDF généré
    pdf_generated_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    user = relationship("User")
    analytics = relationship("CVAnalytics", back_populates="cv_document", cascade="all, delete-orphan")


class CVAnalytics(Base):
    """Analytics pour les vues et téléchargements de CV"""
    __tablename__ = "cv_analytics"

    id = Column(Integer, primary_key=True, index=True)
    cv_document_id = Column(Integer, ForeignKey("cv_documents.id"), nullable=False, index=True)

    # Type d'événement
    event_type = Column(String, nullable=False, index=True)  # "view", "download", "share"

    # Informations de l'événement
    ip_address = Column(String, nullable=True)  # IP du visiteur (anonymisée)
    user_agent = Column(String, nullable=True)  # User agent du navigateur
    referrer = Column(String, nullable=True)  # D'où vient le visiteur

    # Géolocalisation (optionnel)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relations
    cv_document = relationship("CVDocument", back_populates="analytics")


# ========================================
# 🆕 PHASE 2 - ATS FEATURES (Feb 2026)
# ========================================

class EmailTemplateType(enum.Enum):
    """Types de templates d'emails pour recruteurs"""
    WELCOME_CANDIDATE = "welcome_candidate"
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_REJECTED = "application_rejected"
    INTERVIEW_INVITATION = "interview_invitation"
    INTERVIEW_CONFIRMATION = "interview_confirmation"
    INTERVIEW_REMINDER = "interview_reminder"
    OFFER_LETTER = "offer_letter"
    ONBOARDING = "onboarding"
    CUSTOM = "custom"


class EmailTemplate(Base):
    """Templates d'emails personnalisables pour les recruteurs"""
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Template info
    name = Column(String, nullable=False)  # Nom du template (ex: "Invitation entretien - Tech")
    type = Column(SQLEnum(EmailTemplateType), nullable=False, index=True)
    subject = Column(String, nullable=False)  # Sujet de l'email
    body = Column(Text, nullable=False)  # Corps de l'email (HTML supporté)

    # Variables disponibles: {candidate_name}, {job_title}, {company_name}, {recruiter_name}, etc.
    # Métadonnées
    is_active = Column(Boolean, default=True, index=True)
    is_default = Column(Boolean, default=False)  # Template par défaut pour ce type
    usage_count = Column(Integer, default=0)  # Nombre d'utilisations

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)

    # Relations
    company = relationship("Company")
    created_by = relationship("User")


class JobAlertFrequency(enum.Enum):
    """Fréquence d'envoi des alertes emploi"""
    INSTANT = "instant"  # Dès qu'un nouveau job correspond
    DAILY = "daily"  # Résumé quotidien
    WEEKLY = "weekly"  # Résumé hebdomadaire


class JobAlert(Base):
    """Alertes emploi personnalisées pour les candidats"""
    __tablename__ = "job_alerts"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, index=True)

    # Nom de l'alerte
    name = Column(String, nullable=False)  # Ex: "Jobs Senior Python à Paris"

    # Critères de recherche (format JSON pour flexibilité)
    criteria = Column(JSONB, nullable=False)
    # Exemple: {
    #   "keywords": ["python", "backend"],
    #   "location": "Paris",
    #   "job_type": ["full_time"],
    #   "location_type": ["remote", "hybrid"],
    #   "salary_min": 50000
    # }

    # Configuration
    frequency = Column(SQLEnum(JobAlertFrequency), nullable=False, default=JobAlertFrequency.DAILY)
    is_active = Column(Boolean, default=True, index=True)

    # Statistiques
    jobs_sent_count = Column(Integer, default=0)  # Nombre de jobs envoyés
    last_sent_at = Column(DateTime(timezone=True), nullable=True)  # Dernier envoi
    last_matching_job_id = Column(Integer, nullable=True)  # ID du dernier job envoyé

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    candidate = relationship("Candidate")


class InterviewScheduleStatus(enum.Enum):
    """Statut des entretiens planifiés"""
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    CANCELED = "canceled"
    COMPLETED = "completed"
    RESCHEDULED = "rescheduled"


class InterviewSchedule(Base):
    """Planification d'entretiens avec intégration calendrier"""
    __tablename__ = "interview_schedules"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=False, index=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Détails de l'entretien
    title = Column(String, nullable=False)  # Ex: "Entretien technique - Python"
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)  # Adresse physique ou "Remote"
    meeting_link = Column(String, nullable=True)  # Lien Google Meet/Zoom/Teams

    # Date et heure
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes = Column(Integer, default=60)  # Durée en minutes
    timezone = Column(String, default="Europe/Paris")

    # Participants
    interviewers = Column(JSONB)  # Liste des recruteurs [{user_id, name, email}]
    candidate_email = Column(String, nullable=False)

    # Statut
    status = Column(SQLEnum(InterviewScheduleStatus), nullable=False, default=InterviewScheduleStatus.SCHEDULED)

    # Intégrations calendrier
    google_event_id = Column(String, nullable=True)  # ID de l'événement Google Calendar
    outlook_event_id = Column(String, nullable=True)  # ID de l'événement Outlook

    # Notifications
    reminder_sent = Column(Boolean, default=False)
    confirmation_received = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    application = relationship("JobApplication")
    created_by = relationship("User")


class JobPostingChannel(enum.Enum):
    """Canaux de publication d'offres"""
    INTOWORK = "intowork"  # Site principal
    LINKEDIN = "linkedin"
    JOBBERMAN = "jobberman"  # Job board africain
    BRIGHTERMONDAY = "brightermonday"  # Job board africain
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    CUSTOM = "custom"


class JobPosting(Base):
    """Publication multi-canaux d'offres d'emploi"""
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)

    # Canal de publication
    channel = Column(SQLEnum(JobPostingChannel), nullable=False, index=True)
    external_id = Column(String, nullable=True)  # ID sur la plateforme externe

    # Statut
    is_active = Column(Boolean, default=True)
    posted_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Statistiques
    views_count = Column(Integer, default=0)
    clicks_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)

    # Métadonnées
    posting_data = Column(JSONB)  # Données spécifiques au canal

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    job = relationship("Job")


class IntegrationProvider(enum.Enum):
    """Providers d'intégrations externes"""
    LINKEDIN = "linkedin"
    GOOGLE_CALENDAR = "google_calendar"
    OUTLOOK_CALENDAR = "outlook_calendar"
    JOBBERMAN = "jobberman"
    BRIGHTERMONDAY = "brightermonday"


class IntegrationCredential(Base):
    """Credentials OAuth pour intégrations externes"""
    __tablename__ = "integration_credentials"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Utilisateur qui a autorisé

    # Provider
    provider = Column(SQLEnum(IntegrationProvider), nullable=False, index=True)

    # OAuth tokens (encryptés en production)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Métadonnées provider-specific
    provider_data = Column(JSONB)  # Ex: organization_id pour LinkedIn

    # Status
    is_active = Column(Boolean, default=True, index=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    company = relationship("Company")
    user = relationship("User")

