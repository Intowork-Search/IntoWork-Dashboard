from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(enum.Enum):
    CANDIDATE = "candidate"
    EMPLOYER = "employer" 
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, nullable=False, index=True)  # ID Clerk
    email = Column(String, unique=True, nullable=False, index=True)
    role = Column(SQLEnum(UserRole), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    candidate = relationship("Candidate", back_populates="user", uselist=False)
    employer = relationship("Employer", back_populates="user", uselist=False)

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
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    employers = relationship("Employer", back_populates="company")

class Employer(Base):
    __tablename__ = "employers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
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
    
    # Candidature
    status = Column(SQLEnum(ApplicationStatus, values_callable=lambda x: [e.value for e in x]), nullable=False, default=ApplicationStatus.APPLIED)
    cover_letter = Column(Text)  # Lettre de motivation en texte
    cover_letter_url = Column(String)  # URL du fichier de lettre de motivation
    cv_url = Column(String)  # CV spécifique à cette candidature
    notes = Column(Text)  # Notes de l'employeur sur cette candidature
    
    # Suivi
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    viewed_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate")
