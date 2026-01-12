"""
Phase 2 - Tasks 14 & 15: Centralized Pydantic Schemas

This module contains all Pydantic models for request/response validation.
Organized by domain for maintainability.

Features:
- ConfigDict with from_attributes=True for ORM compatibility
- Comprehensive type hints
- Optional fields with proper defaults
- Nested response models for relationships
"""

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ==============================================================================
# Enums (mirroring database enums)
# ==============================================================================

class UserRoleEnum(str, Enum):
    CANDIDATE = "candidate"
    EMPLOYER = "employer"
    ADMIN = "admin"


class JobStatusEnum(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class JobTypeEnum(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    TEMPORARY = "temporary"
    INTERNSHIP = "internship"


class JobLocationEnum(str, Enum):
    ON_SITE = "on_site"
    REMOTE = "remote"
    HYBRID = "hybrid"


class ApplicationStatusEnum(str, Enum):
    APPLIED = "applied"
    PENDING = "pending"
    VIEWED = "viewed"
    SHORTLISTED = "shortlisted"
    INTERVIEW = "interview"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class SkillCategoryEnum(str, Enum):
    TECHNICAL = "technical"
    SOFT = "soft"
    LANGUAGE = "language"
    TOOL = "tool"
    OTHER = "other"


# ==============================================================================
# Base Response Models (shared across domains)
# ==============================================================================

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str


class MessageWithDataResponse(BaseModel):
    """Generic message response with additional data"""
    message: str
    data: Optional[Dict[str, Any]] = None


# ==============================================================================
# User Schemas
# ==============================================================================

class UserBase(BaseModel):
    """Base user fields"""
    email: EmailStr
    first_name: str
    last_name: str
    role: str


class UserResponse(BaseModel):
    """User response model"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    role: str
    image: Optional[str] = None
    is_active: bool


class UserMeResponse(BaseModel):
    """Current user info response"""
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    role: str
    image: Optional[str] = None
    is_active: bool


# ==============================================================================
# Auth Schemas
# ==============================================================================

class SignUpRequest(BaseModel):
    """User signup request"""
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str  # "candidate" or "employer"


class SignInRequest(BaseModel):
    """User signin request"""
    email: EmailStr
    password: str


class AuthUserData(BaseModel):
    """User data included in auth response"""
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    image: Optional[str] = None


class AuthResponse(BaseModel):
    """Authentication response with tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserData


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Refresh token response (token rotation)"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ChangePasswordRequest(BaseModel):
    """Change password request"""
    current_password: str
    new_password: str


class ChangePasswordResponse(BaseModel):
    """Change password response"""
    message: str


class ChangeEmailRequest(BaseModel):
    """Change email request"""
    new_email: EmailStr
    password: str


class ChangeEmailResponse(BaseModel):
    """Change email response"""
    message: str
    new_email: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request"""
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """Forgot password response (generic for security)"""
    message: str


class ResetPasswordRequest(BaseModel):
    """Reset password with token"""
    token: str
    new_password: str


class ResetPasswordResponse(BaseModel):
    """Reset password response"""
    message: str


class DeleteAccountResponse(BaseModel):
    """Delete account response"""
    message: str


# ==============================================================================
# Candidate Schemas
# ==============================================================================

class ExperienceBase(BaseModel):
    """Experience base fields"""
    title: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None


class ExperienceCreate(ExperienceBase):
    """Create experience request"""
    pass


class ExperienceUpdate(ExperienceBase):
    """Update experience request"""
    pass


class ExperienceResponse(ExperienceBase):
    """Experience response"""
    model_config = ConfigDict(from_attributes=True)

    id: int


class EducationBase(BaseModel):
    """Education base fields"""
    degree: str
    school: str
    location: Optional[str] = None
    start_date: str
    end_date: str
    description: Optional[str] = None


class EducationCreate(EducationBase):
    """Create education request"""
    pass


class EducationUpdate(EducationBase):
    """Update education request"""
    pass


class EducationResponse(EducationBase):
    """Education response"""
    model_config = ConfigDict(from_attributes=True)

    id: int


class SkillBase(BaseModel):
    """Skill base fields"""
    name: str
    level: int = Field(..., ge=1, le=5)
    category: str


class SkillCreate(SkillBase):
    """Create skill request"""
    pass


class SkillUpdate(SkillBase):
    """Update skill request"""
    pass


class SkillResponse(SkillBase):
    """Skill response"""
    model_config = ConfigDict(from_attributes=True)

    id: int


class CVResponse(BaseModel):
    """CV file response"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    file_size: Optional[int] = None
    is_active: bool
    created_at: datetime


class CandidateProfileBase(BaseModel):
    """Candidate profile base fields"""
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    years_experience: Optional[int] = None
    salary_expectation_min: Optional[int] = None
    salary_expectation_max: Optional[int] = None
    cv_url: Optional[str] = None
    cv_filename: Optional[str] = None
    cv_uploaded_at: Optional[datetime] = None


class CandidateProfileUpdate(CandidateProfileBase):
    """Update candidate profile request"""
    pass


class CandidateProfileResponse(CandidateProfileBase):
    """Candidate profile response with relations"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    experiences: List[ExperienceResponse] = []
    educations: List[EducationResponse] = []
    skills: List[SkillResponse] = []


class CVUploadResponse(BaseModel):
    """CV upload response"""
    message: str
    filename: str
    size: int
    candidate_id: int
    cv_id: int


class DeleteExperienceResponse(BaseModel):
    """Delete experience response"""
    message: str


class DeleteEducationResponse(BaseModel):
    """Delete education response"""
    message: str


class DeleteCVResponse(BaseModel):
    """Delete CV response"""
    message: str


# ==============================================================================
# Company Schemas
# ==============================================================================

class CompanyBase(BaseModel):
    """Company base fields"""
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None


class CompanyCreateRequest(CompanyBase):
    """Create company request"""
    pass


class CompanyUpdateRequest(BaseModel):
    """Update company request (all fields optional)"""
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None


class CompanyResponse(CompanyBase):
    """Company response"""
    model_config = ConfigDict(from_attributes=True)

    id: int


class CompanyStatsResponse(BaseModel):
    """Company statistics response"""
    active_jobs: int
    total_jobs: int
    total_applications: int
    total_employers: int


# ==============================================================================
# Employer Schemas
# ==============================================================================

class EmployerProfileResponse(BaseModel):
    """Employer profile response"""
    id: int
    user_id: int
    company_id: Optional[int] = None
    position: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    can_create_jobs: bool
    can_manage_candidates: bool
    is_admin: bool


class UpdateEmployerRequest(BaseModel):
    """Update employer profile request"""
    company_id: Optional[int] = None
    position: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    employer_type: Optional[str] = None


class EmployerUpdateResponse(BaseModel):
    """Employer update response"""
    message: str
    employer: EmployerProfileResponse


# ==============================================================================
# Job Schemas
# ==============================================================================

class JobCreateRequest(BaseModel):
    """Create job request"""
    title: str
    description: str
    location: Optional[str] = None
    location_type: str
    job_type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = "EUR"
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None


class JobResponse(BaseModel):
    """Job response (list view)"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    company_name: str
    company_logo_url: Optional[str] = None
    location: Optional[str] = None
    location_type: str
    job_type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = "EUR"
    posted_at: Optional[datetime] = None
    is_featured: bool = False
    views_count: int = 0
    applications_count: int = 0
    has_applied: bool = False


class JobDetailResponse(JobResponse):
    """Job detail response (full view)"""
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    company_description: Optional[str] = None
    company_industry: Optional[str] = None
    company_size: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    employment_type: Optional[str] = None
    salary_range: Optional[str] = None


class JobListResponse(BaseModel):
    """Paginated job list response"""
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class RecentJobsCountResponse(BaseModel):
    """Recent jobs count response"""
    count: int
    days: int


# ==============================================================================
# Application Schemas
# ==============================================================================

class JobApplicationCreate(BaseModel):
    """Create job application request"""
    job_id: int
    cover_letter: Optional[str] = None


class JobDataInApplication(BaseModel):
    """Job data nested in application response"""
    id: int
    title: str
    company_name: str
    location: Optional[str] = None
    location_type: Optional[str] = None
    job_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: Optional[str] = None


class JobApplicationResponse(BaseModel):
    """Job application response"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    candidate_id: int
    status: str
    applied_at: datetime
    notes: Optional[str] = None
    job: JobDataInApplication


class ApplicationsListResponse(BaseModel):
    """Paginated applications list response"""
    applications: List[JobApplicationResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class CandidateApplicationResponse(BaseModel):
    """Application response for employer view"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    job_title: str
    candidate_id: int
    candidate_name: str
    candidate_email: str
    candidate_phone: Optional[str] = None
    status: str
    applied_at: datetime
    cover_letter: Optional[str] = None
    notes: Optional[str] = None
    cv_url: Optional[str] = None


class EmployerApplicationsListResponse(BaseModel):
    """Paginated employer applications list response"""
    applications: List[CandidateApplicationResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class UpdateApplicationStatusRequest(BaseModel):
    """Update application status request"""
    status: str


class UpdateApplicationStatusResponse(BaseModel):
    """Update application status response"""
    message: str
    application_id: int
    new_status: str


class UpdateApplicationNotesRequest(BaseModel):
    """Update application notes request"""
    notes: str


class UpdateApplicationNotesResponse(BaseModel):
    """Update application notes response"""
    message: str
    application_id: int
    notes: str


class WithdrawApplicationResponse(BaseModel):
    """Withdraw application response"""
    message: str


# ==============================================================================
# Dashboard Schemas
# ==============================================================================

class DashboardStat(BaseModel):
    """Dashboard statistic item"""
    title: str
    value: str
    change: str
    changeType: str
    color: str


class RecentActivity(BaseModel):
    """Dashboard recent activity item"""
    id: int
    action: str
    target: str
    time: str
    type: str


class DashboardData(BaseModel):
    """Dashboard data response"""
    stats: List[DashboardStat]
    recentActivities: List[RecentActivity] = []
    profileCompletion: int


# ==============================================================================
# Notification Schemas
# ==============================================================================

class NotificationResponse(BaseModel):
    """Notification response"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    title: str
    message: str
    related_job_id: Optional[int] = None
    related_application_id: Optional[int] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime


class NotificationListResponse(BaseModel):
    """Notification list response"""
    notifications: List[NotificationResponse]
    total: int
    unread_count: int


class UnreadCountResponse(BaseModel):
    """Unread notifications count response"""
    unread_count: int


class MarkAsReadRequest(BaseModel):
    """Mark notifications as read request"""
    notification_ids: List[int]


class MarkAsReadResponse(BaseModel):
    """Mark as read response"""
    message: str


class DeleteNotificationResponse(BaseModel):
    """Delete notification response"""
    message: str


# ==============================================================================
# Admin Schemas
# ==============================================================================

class AdminStats(BaseModel):
    """Admin statistics response"""
    model_config = ConfigDict(from_attributes=True)

    total_users: int
    total_candidates: int
    total_employers: int
    total_companies: int
    total_jobs: int
    total_applications: int
    total_notifications: int
    active_users: int
    inactive_users: int
    jobs_by_status: Dict[str, int]
    recent_signups: int


class UserListItem(BaseModel):
    """User list item for admin"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    created_at: datetime


class EmployerListItem(BaseModel):
    """Employer list item for admin"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    email: str
    first_name: str
    last_name: str
    company_name: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime


class JobListItem(BaseModel):
    """Job list item for admin"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    company_name: str
    employer_email: str
    status: str
    location: Optional[str] = None
    applications_count: int
    created_at: datetime


class UserActivationUpdate(BaseModel):
    """User activation update request"""
    is_active: bool


class AdminUserResponse(BaseModel):
    """Admin user info response"""
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    is_active: bool


class DeleteUserResponse(BaseModel):
    """Delete user response"""
    message: str


# ==============================================================================
# Ping/Status Schemas
# ==============================================================================

class PingResponse(BaseModel):
    """Ping response"""
    ping: str
    timestamp: str
    service: str


class StatusResponse(BaseModel):
    """Status response"""
    status: str
    phase: str
    features: List[str]
    next: str


class DBStatusResponse(BaseModel):
    """Database status response"""
    status: str
    test_query: int
    users_count: int
    message: str
