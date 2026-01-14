"""
CV Builder API Routes
Inspired by 5minportfolio.dev - Full-featured CV builder with:
- Save/Load CV data
- Multiple templates
- PDF generation
- Public sharing via custom URLs
- Analytics tracking
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete as sql_delete
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import User, CVDocument, CVAnalytics, CVTemplate
from app.auth import require_user
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from loguru import logger
import json
import os
import re
import hashlib
from pathlib import Path

router = APIRouter()

# Directory for generated PDFs
PDF_DIR = Path(__file__).parent.parent.parent / "uploads" / "pdfs"
PDF_DIR.mkdir(parents=True, exist_ok=True)


# ==================== Pydantic Schemas ====================

class PersonalInfo(BaseModel):
    photo: Optional[str] = None
    firstName: str = ""
    lastName: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    title: str = ""
    summary: str = ""


class ExperienceItem(BaseModel):
    id: str
    company: str = ""
    position: str = ""
    startDate: str = ""
    endDate: str = ""
    current: bool = False
    description: str = ""


class EducationItem(BaseModel):
    id: str
    school: str = ""
    degree: str = ""
    field: str = ""
    startDate: str = ""
    endDate: str = ""
    description: str = ""


class SkillItem(BaseModel):
    id: str
    name: str = ""
    level: int = Field(default=50, ge=0, le=100)


class LanguageItem(BaseModel):
    id: str
    name: str = ""
    level: str = "B1"


class CVData(BaseModel):
    personalInfo: PersonalInfo
    experiences: List[ExperienceItem] = []
    educations: List[EducationItem] = []
    skills: List[SkillItem] = []
    languages: List[LanguageItem] = []


class CVSaveRequest(BaseModel):
    cv_data: CVData
    template: str = "elegance"
    title: Optional[str] = None
    slug: Optional[str] = None
    is_public: bool = False


class CVDocumentResponse(BaseModel):
    id: int
    title: Optional[str]
    slug: str
    template: str
    is_public: bool
    views_count: int
    downloads_count: int
    cv_data: CVData
    created_at: datetime
    updated_at: datetime
    public_url: Optional[str] = None

    class Config:
        from_attributes = True


class CVPublicResponse(BaseModel):
    slug: str
    template: str
    cv_data: CVData
    views_count: int


class AnalyticsResponse(BaseModel):
    total_views: int
    total_downloads: int
    views_by_date: List[Dict[str, Any]]
    views_by_country: List[Dict[str, Any]]
    recent_views: List[Dict[str, Any]]


class CVListResponse(BaseModel):
    id: int
    title: Optional[str]
    slug: str
    template: str
    is_public: bool
    views_count: int
    downloads_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Helper Functions ====================

def generate_slug(first_name: str, last_name: str) -> str:
    """Generate a URL-friendly slug from name"""
    base = f"{first_name}-{last_name}".lower()
    # Remove accents and special characters
    slug = re.sub(r'[^a-z0-9-]', '', base)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug or "cv"


def generate_unique_slug(base_slug: str, existing_slugs: List[str]) -> str:
    """Ensure slug is unique by adding a suffix if needed"""
    if base_slug not in existing_slugs:
        return base_slug

    counter = 1
    while f"{base_slug}-{counter}" in existing_slugs:
        counter += 1
    return f"{base_slug}-{counter}"


def validate_slug(slug: str) -> bool:
    """Validate that a slug is URL-friendly"""
    return bool(re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$', slug))


def anonymize_ip(ip: str) -> str:
    """Anonymize IP address for GDPR compliance"""
    if not ip:
        return ""
    parts = ip.split('.')
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.xxx.xxx"
    return ip[:len(ip)//2] + "xxx"


def get_template_enum(template_str: str) -> CVTemplate:
    """Convert string to CVTemplate enum"""
    try:
        return CVTemplate(template_str.lower())
    except ValueError:
        return CVTemplate.ELEGANCE


# ==================== API Endpoints ====================

@router.post("/save", response_model=CVDocumentResponse)
async def save_cv(
    request: CVSaveRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Save or update the user's CV.
    Creates a new CV if none exists, updates if one already exists.
    """
    try:
        # Check if user already has a CV
        result = await db.execute(
            select(CVDocument).where(CVDocument.user_id == user.id)
        )
        existing_cv = result.scalar_one_or_none()

        cv_data_json = request.cv_data.model_dump_json()
        template_enum = get_template_enum(request.template)

        if existing_cv:
            # Update existing CV
            existing_cv.cv_data = cv_data_json
            existing_cv.template = template_enum
            existing_cv.title = request.title
            existing_cv.is_public = request.is_public

            # Update slug if provided and valid
            if request.slug and validate_slug(request.slug):
                # Check if slug is available
                slug_check = await db.execute(
                    select(CVDocument).where(
                        CVDocument.slug == request.slug,
                        CVDocument.id != existing_cv.id
                    )
                )
                if not slug_check.scalar_one_or_none():
                    existing_cv.slug = request.slug

            # Invalidate PDF cache
            existing_cv.pdf_url = None
            existing_cv.pdf_generated_at = None

            await db.commit()
            await db.refresh(existing_cv)

            logger.info(f"Updated CV for user {user.id}")

            return CVDocumentResponse(
                id=existing_cv.id,
                title=existing_cv.title,
                slug=existing_cv.slug,
                template=existing_cv.template.value,
                is_public=existing_cv.is_public,
                views_count=existing_cv.views_count,
                downloads_count=existing_cv.downloads_count,
                cv_data=request.cv_data,
                created_at=existing_cv.created_at,
                updated_at=existing_cv.updated_at,
                public_url=f"/cv/{existing_cv.slug}" if existing_cv.is_public else None
            )
        else:
            # Create new CV
            # Generate slug from name
            personal = request.cv_data.personalInfo
            base_slug = request.slug if request.slug and validate_slug(request.slug) else \
                        generate_slug(personal.firstName, personal.lastName)

            # Get all existing slugs
            result = await db.execute(select(CVDocument.slug))
            existing_slugs = [row[0] for row in result.fetchall()]

            unique_slug = generate_unique_slug(base_slug, existing_slugs)

            new_cv = CVDocument(
                user_id=user.id,
                cv_data=cv_data_json,
                template=template_enum,
                title=request.title or f"CV de {personal.firstName} {personal.lastName}",
                slug=unique_slug,
                is_public=request.is_public
            )

            db.add(new_cv)
            await db.commit()
            await db.refresh(new_cv)

            logger.info(f"Created new CV for user {user.id} with slug {unique_slug}")

            return CVDocumentResponse(
                id=new_cv.id,
                title=new_cv.title,
                slug=new_cv.slug,
                template=new_cv.template.value,
                is_public=new_cv.is_public,
                views_count=new_cv.views_count,
                downloads_count=new_cv.downloads_count,
                cv_data=request.cv_data,
                created_at=new_cv.created_at,
                updated_at=new_cv.updated_at,
                public_url=f"/cv/{new_cv.slug}" if new_cv.is_public else None
            )

    except Exception as e:
        logger.error(f"Error saving CV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error saving CV"
        )


@router.get("/load", response_model=Optional[CVDocumentResponse])
async def load_cv(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Load the user's CV"""
    try:
        result = await db.execute(
            select(CVDocument).where(CVDocument.user_id == user.id)
        )
        cv = result.scalar_one_or_none()

        if not cv:
            return None

        cv_data = CVData.model_validate_json(cv.cv_data)

        return CVDocumentResponse(
            id=cv.id,
            title=cv.title,
            slug=cv.slug,
            template=cv.template.value,
            is_public=cv.is_public,
            views_count=cv.views_count,
            downloads_count=cv.downloads_count,
            cv_data=cv_data,
            created_at=cv.created_at,
            updated_at=cv.updated_at,
            public_url=f"/cv/{cv.slug}" if cv.is_public else None
        )

    except Exception as e:
        logger.error(f"Error loading CV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error loading CV"
        )


@router.get("/list", response_model=List[CVListResponse])
async def list_cvs(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """List all CVs for the user (supports future multi-CV feature)"""
    try:
        result = await db.execute(
            select(CVDocument)
            .where(CVDocument.user_id == user.id)
            .order_by(CVDocument.updated_at.desc())
        )
        cvs = result.scalars().all()

        return [
            CVListResponse(
                id=cv.id,
                title=cv.title,
                slug=cv.slug,
                template=cv.template.value,
                is_public=cv.is_public,
                views_count=cv.views_count,
                downloads_count=cv.downloads_count,
                created_at=cv.created_at,
                updated_at=cv.updated_at
            )
            for cv in cvs
        ]

    except Exception as e:
        logger.error(f"Error listing CVs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error listing CVs"
        )


@router.get("/public/{slug}", response_model=CVPublicResponse)
async def get_public_cv(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a public CV by its slug.
    Automatically tracks the view.
    """
    try:
        result = await db.execute(
            select(CVDocument).where(
                CVDocument.slug == slug,
                CVDocument.is_public == True
            )
        )
        cv = result.scalar_one_or_none()

        if not cv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found or not public"
            )

        # Track the view
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")
        referrer = request.headers.get("referer", "")

        analytics = CVAnalytics(
            cv_document_id=cv.id,
            event_type="view",
            ip_address=anonymize_ip(client_ip) if client_ip else None,
            user_agent=user_agent[:500] if user_agent else None,
            referrer=referrer[:500] if referrer else None
        )
        db.add(analytics)

        # Increment view counter
        cv.views_count += 1

        await db.commit()

        cv_data = CVData.model_validate_json(cv.cv_data)

        return CVPublicResponse(
            slug=cv.slug,
            template=cv.template.value,
            cv_data=cv_data,
            views_count=cv.views_count
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting public CV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting CV"
        )


@router.post("/generate-pdf")
async def generate_pdf(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a PDF version of the user's CV.
    Uses WeasyPrint to convert HTML to PDF.
    """
    try:
        result = await db.execute(
            select(CVDocument).where(CVDocument.user_id == user.id)
        )
        cv = result.scalar_one_or_none()

        if not cv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found. Please save your CV first."
            )

        # Check if we have a cached PDF (less than 24h old)
        if cv.pdf_url and cv.pdf_generated_at:
            cache_age = datetime.utcnow() - cv.pdf_generated_at.replace(tzinfo=None)
            pdf_path = PDF_DIR / f"{cv.slug}.pdf"
            if cache_age < timedelta(hours=24) and pdf_path.exists():
                logger.info(f"Returning cached PDF for {cv.slug}")
                # Track download
                analytics = CVAnalytics(
                    cv_document_id=cv.id,
                    event_type="download"
                )
                db.add(analytics)
                cv.downloads_count += 1
                await db.commit()

                return FileResponse(
                    path=str(pdf_path),
                    filename=f"CV-{cv.slug}.pdf",
                    media_type="application/pdf"
                )

        # Generate new PDF
        cv_data = json.loads(cv.cv_data)
        html_content = generate_cv_html(cv_data, cv.template.value)

        # Create PDF file
        pdf_filename = f"{cv.slug}.pdf"
        pdf_path = PDF_DIR / pdf_filename

        try:
            from weasyprint import HTML
            HTML(string=html_content).write_pdf(str(pdf_path))
        except ImportError:
            # Fallback: save HTML and return error message
            logger.warning("WeasyPrint not installed. Returning HTML instead.")
            html_path = PDF_DIR / f"{cv.slug}.html"
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="PDF generation not available. Please install weasyprint."
            )

        # Update cache info
        cv.pdf_url = str(pdf_path)
        cv.pdf_generated_at = datetime.utcnow()

        # Track download
        analytics = CVAnalytics(
            cv_document_id=cv.id,
            event_type="download"
        )
        db.add(analytics)
        cv.downloads_count += 1

        await db.commit()

        logger.info(f"Generated PDF for CV {cv.slug}")

        return FileResponse(
            path=str(pdf_path),
            filename=f"CV-{cv.slug}.pdf",
            media_type="application/pdf"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}"
        )


@router.post("/track-view/{slug}")
async def track_view(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Manually track a view (for client-side tracking)"""
    try:
        result = await db.execute(
            select(CVDocument).where(CVDocument.slug == slug)
        )
        cv = result.scalar_one_or_none()

        if not cv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found"
            )

        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")
        referrer = request.headers.get("referer", "")

        analytics = CVAnalytics(
            cv_document_id=cv.id,
            event_type="view",
            ip_address=anonymize_ip(client_ip) if client_ip else None,
            user_agent=user_agent[:500] if user_agent else None,
            referrer=referrer[:500] if referrer else None
        )
        db.add(analytics)
        cv.views_count += 1

        await db.commit()

        return {"status": "tracked", "views_count": cv.views_count}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking view: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error tracking view"
        )


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics for the user's CV"""
    try:
        result = await db.execute(
            select(CVDocument).where(CVDocument.user_id == user.id)
        )
        cv = result.scalar_one_or_none()

        if not cv:
            return AnalyticsResponse(
                total_views=0,
                total_downloads=0,
                views_by_date=[],
                views_by_country=[],
                recent_views=[]
            )

        # Get total counts
        total_views = cv.views_count
        total_downloads = cv.downloads_count

        # Get views by date (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        result = await db.execute(
            select(
                func.date(CVAnalytics.created_at).label('date'),
                func.count().label('count')
            )
            .where(
                CVAnalytics.cv_document_id == cv.id,
                CVAnalytics.event_type == "view",
                CVAnalytics.created_at >= thirty_days_ago
            )
            .group_by(func.date(CVAnalytics.created_at))
            .order_by(func.date(CVAnalytics.created_at))
        )
        views_by_date = [
            {"date": str(row.date), "count": row.count}
            for row in result.fetchall()
        ]

        # Get views by country
        result = await db.execute(
            select(
                CVAnalytics.country,
                func.count().label('count')
            )
            .where(
                CVAnalytics.cv_document_id == cv.id,
                CVAnalytics.event_type == "view",
                CVAnalytics.country.isnot(None)
            )
            .group_by(CVAnalytics.country)
            .order_by(func.count().desc())
            .limit(10)
        )
        views_by_country = [
            {"country": row.country or "Unknown", "count": row.count}
            for row in result.fetchall()
        ]

        # Get recent views
        result = await db.execute(
            select(CVAnalytics)
            .where(
                CVAnalytics.cv_document_id == cv.id,
                CVAnalytics.event_type == "view"
            )
            .order_by(CVAnalytics.created_at.desc())
            .limit(10)
        )
        recent_views = [
            {
                "date": row.created_at.isoformat() if row.created_at else None,
                "referrer": row.referrer,
                "country": row.country
            }
            for row in result.scalars().all()
        ]

        return AnalyticsResponse(
            total_views=total_views,
            total_downloads=total_downloads,
            views_by_date=views_by_date,
            views_by_country=views_by_country,
            recent_views=recent_views
        )

    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting analytics"
        )


@router.delete("/delete")
async def delete_cv(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete the user's CV and all associated data"""
    try:
        result = await db.execute(
            select(CVDocument).where(CVDocument.user_id == user.id)
        )
        cv = result.scalar_one_or_none()

        if not cv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found"
            )

        # Delete PDF if exists
        if cv.pdf_url:
            pdf_path = Path(cv.pdf_url)
            if pdf_path.exists():
                pdf_path.unlink()

        # Delete CV (cascade deletes analytics)
        await db.delete(cv)
        await db.commit()

        logger.info(f"Deleted CV for user {user.id}")

        return {"status": "deleted", "message": "CV and all analytics deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting CV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting CV"
        )


@router.patch("/toggle-public")
async def toggle_public(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle the public status of the CV"""
    try:
        result = await db.execute(
            select(CVDocument).where(CVDocument.user_id == user.id)
        )
        cv = result.scalar_one_or_none()

        if not cv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found"
            )

        cv.is_public = not cv.is_public
        await db.commit()

        return {
            "is_public": cv.is_public,
            "public_url": f"/cv/{cv.slug}" if cv.is_public else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling public status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error toggling public status"
        )


# ==================== HTML Template Generation ====================

def generate_cv_html(cv_data: dict, template: str) -> str:
    """Generate HTML for PDF rendering based on template"""

    personal = cv_data.get('personalInfo', {})
    experiences = cv_data.get('experiences', [])
    educations = cv_data.get('educations', [])
    skills = cv_data.get('skills', [])
    languages = cv_data.get('languages', [])

    # Template-specific colors
    TEMPLATE_COLORS = {
        'elegance': {'primary': '#6B9B5F', 'secondary': '#4A7A3F', 'bg': '#E8F0E5'},
        'bold': {'primary': '#6B46C1', 'secondary': '#4A2E8F', 'bg': '#EDE9F7'},
        'minimal': {'primary': '#1f2937', 'secondary': '#6b7280', 'bg': '#f9fafb'},
        'creative': {'primary': '#F7C700', 'secondary': '#C49E00', 'bg': '#FFF9E0'},
        'executive': {'primary': '#1e3a5f', 'secondary': '#0f172a', 'bg': '#f8fafc'}
    }

    colors = TEMPLATE_COLORS.get(template, TEMPLATE_COLORS['elegance'])

    # Generate experiences HTML
    exp_html = ""
    for exp in experiences:
        end_date = "Present" if exp.get('current') else exp.get('endDate', '')
        exp_html += f"""
        <div class="item">
            <div class="item-header">
                <div>
                    <div class="item-title">{exp.get('position', '')}</div>
                    <div class="item-subtitle">{exp.get('company', '')}</div>
                </div>
                <div class="item-date">{exp.get('startDate', '')} - {end_date}</div>
            </div>
            <div class="item-description">{exp.get('description', '')}</div>
        </div>
        """

    # Generate educations HTML
    edu_html = ""
    for edu in educations:
        edu_html += f"""
        <div class="item">
            <div class="item-header">
                <div>
                    <div class="item-title">{edu.get('degree', '')} - {edu.get('field', '')}</div>
                    <div class="item-subtitle">{edu.get('school', '')}</div>
                </div>
                <div class="item-date">{edu.get('startDate', '')} - {edu.get('endDate', '')}</div>
            </div>
            <div class="item-description">{edu.get('description', '')}</div>
        </div>
        """

    # Generate skills HTML
    skills_html = ""
    for skill in skills:
        level = skill.get('level', 50)
        skills_html += f"""
        <div class="skill">
            <div class="skill-name">{skill.get('name', '')}</div>
            <div class="skill-bar">
                <div class="skill-level" style="width: {level}%"></div>
            </div>
        </div>
        """

    # Generate languages HTML
    lang_html = ""
    for lang in languages:
        lang_html += f"""
        <div class="language">
            <span class="lang-name">{lang.get('name', '')}</span>
            <span class="lang-level">{lang.get('level', '')}</span>
        </div>
        """

    html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>CV - {personal.get('firstName', '')} {personal.get('lastName', '')}</title>
    <style>
        @page {{
            size: A4;
            margin: 0;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #333;
            background: white;
        }}

        .cv-container {{
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
        }}

        .header {{
            background: {colors['primary']};
            color: white;
            padding: 20px 25px;
            margin: -15mm -15mm 20px -15mm;
            display: flex;
            align-items: center;
            gap: 20px;
        }}

        .photo {{
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid white;
            object-fit: cover;
        }}

        .header-info h1 {{
            font-size: 24pt;
            font-weight: 700;
            margin-bottom: 5px;
        }}

        .header-info .title {{
            font-size: 14pt;
            opacity: 0.9;
        }}

        .contact {{
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
            padding: 10px 0;
            border-bottom: 2px solid {colors['bg']};
        }}

        .contact-item {{
            font-size: 10pt;
            color: #666;
        }}

        .summary {{
            background: {colors['bg']};
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid {colors['primary']};
        }}

        .section {{
            margin-bottom: 20px;
        }}

        .section-title {{
            color: {colors['primary']};
            font-size: 14pt;
            font-weight: 700;
            padding-bottom: 8px;
            border-bottom: 2px solid {colors['primary']};
            margin-bottom: 15px;
        }}

        .item {{
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }}

        .item:last-child {{
            border-bottom: none;
        }}

        .item-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }}

        .item-title {{
            font-weight: 600;
            font-size: 12pt;
            color: {colors['secondary']};
        }}

        .item-subtitle {{
            color: #666;
            font-size: 10pt;
        }}

        .item-date {{
            color: {colors['primary']};
            font-size: 10pt;
            font-weight: 500;
        }}

        .item-description {{
            font-size: 10pt;
            color: #555;
        }}

        .two-columns {{
            display: flex;
            gap: 30px;
        }}

        .column {{
            flex: 1;
        }}

        .skill {{
            margin-bottom: 10px;
        }}

        .skill-name {{
            font-size: 10pt;
            margin-bottom: 4px;
        }}

        .skill-bar {{
            height: 8px;
            background: {colors['bg']};
            border-radius: 4px;
            overflow: hidden;
        }}

        .skill-level {{
            height: 100%;
            background: {colors['primary']};
            border-radius: 4px;
        }}

        .language {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }}

        .lang-name {{
            font-weight: 500;
        }}

        .lang-level {{
            color: {colors['primary']};
            font-weight: 600;
        }}
    </style>
</head>
<body>
    <div class="cv-container">
        <div class="header">
            {f'<img src="{personal.get("photo")}" class="photo" />' if personal.get('photo') else ''}
            <div class="header-info">
                <h1>{personal.get('firstName', '')} {personal.get('lastName', '')}</h1>
                <div class="title">{personal.get('title', '')}</div>
            </div>
        </div>

        <div class="contact">
            {f'<div class="contact-item">{personal.get("email")}</div>' if personal.get('email') else ''}
            {f'<div class="contact-item">{personal.get("phone")}</div>' if personal.get('phone') else ''}
            {f'<div class="contact-item">{personal.get("address")}</div>' if personal.get('address') else ''}
        </div>

        {f'<div class="summary">{personal.get("summary")}</div>' if personal.get('summary') else ''}

        {f'''
        <div class="section">
            <div class="section-title">Experience Professionnelle</div>
            {exp_html}
        </div>
        ''' if experiences else ''}

        {f'''
        <div class="section">
            <div class="section-title">Formation</div>
            {edu_html}
        </div>
        ''' if educations else ''}

        <div class="two-columns">
            {f'''
            <div class="column">
                <div class="section">
                    <div class="section-title">Competences</div>
                    {skills_html}
                </div>
            </div>
            ''' if skills else ''}

            {f'''
            <div class="column">
                <div class="section">
                    <div class="section-title">Langues</div>
                    {lang_html}
                </div>
            </div>
            ''' if languages else ''}
        </div>
    </div>
</body>
</html>
"""

    return html
