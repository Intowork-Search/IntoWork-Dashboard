from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum
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
    cv_url = Column(String)  # URL du CV uploadé
    cv_filename = Column(String)
    
    # Statut
    is_looking_for_job = Column(Boolean, default=True)
    profile_completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relations
    user = relationship("User", back_populates="candidate")

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
