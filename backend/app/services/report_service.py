"""
Service de génération de rapports PDF — IntoWork
Utilise WeasyPrint (HTML→PDF) + Jinja2 pour les templates.
"""

import io
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

try:
    from weasyprint import HTML as _WeasyHTML
    WEASYPRINT_AVAILABLE = True
except OSError:
    _WeasyHTML = None  # type: ignore[assignment]
    WEASYPRINT_AVAILABLE = False

TEMPLATES_DIR = Path(__file__).parent.parent / "templates" / "reports"

_jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=True,
)


def _render_pdf(template_name: str, context: dict) -> bytes:
    """Rend un template HTML en PDF via WeasyPrint."""
    if not WEASYPRINT_AVAILABLE or _WeasyHTML is None:
        raise RuntimeError("WeasyPrint n'est pas disponible sur ce serveur (librairies système manquantes).")
    template = _jinja_env.get_template(template_name)
    html_content = template.render(**context, generated_at=datetime.now().strftime("%d/%m/%Y à %H:%M"))
    pdf_bytes = _WeasyHTML(string=html_content).write_pdf()
    return pdf_bytes


def generate_candidate_report(
    user_name: str,
    email: str,
    title: str | None,
    location: str | None,
    profile_completion: int,
    stats: list[dict],
    skills: list[dict],
    experiences: list[dict],
    educations: list[dict],
    activities: list[dict],
) -> bytes:
    """Générer le rapport PDF candidat."""
    return _render_pdf("candidate.html", {
        "user_name": user_name,
        "email": email,
        "title": title or "Non renseigné",
        "location": location or "Non renseigné",
        "profile_completion": profile_completion,
        "stats": stats,
        "skills": skills,
        "experiences": experiences,
        "educations": educations,
        "activities": activities,
    })


def generate_employer_report(
    user_name: str,
    company_name: str,
    company_industry: str | None,
    company_size: str | None,
    stats: list[dict],
    activities: list[dict],
    jobs_summary: list[dict],
) -> bytes:
    """Générer le rapport PDF employeur."""
    return _render_pdf("employer.html", {
        "user_name": user_name,
        "company_name": company_name,
        "company_industry": company_industry or "Non renseigné",
        "company_size": company_size or "Non renseigné",
        "stats": stats,
        "activities": activities,
        "jobs_summary": jobs_summary,
    })


def generate_admin_report(
    admin_name: str,
    total_users: int,
    total_candidates: int,
    total_employers: int,
    total_companies: int,
    total_jobs: int,
    total_applications: int,
    active_users: int,
    inactive_users: int,
    jobs_by_status: dict,
    recent_signups: int,
) -> bytes:
    """Générer le rapport PDF admin."""
    return _render_pdf("admin.html", {
        "admin_name": admin_name,
        "total_users": total_users,
        "total_candidates": total_candidates,
        "total_employers": total_employers,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "jobs_by_status": jobs_by_status,
        "recent_signups": recent_signups,
    })
