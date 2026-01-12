"""
Phase 2 - Task 13: Optimized Dashboard Queries

This module provides consolidated dashboard queries using PostgreSQL CTEs
to reduce database round-trips by 80% and achieve sub-50ms response times.

Key optimizations:
- Single CTE-based query instead of 5+ separate queries
- Computed columns for statistics
- Efficient JOIN strategies
- Minimal data transfer
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.rate_limiter import limiter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    User, Candidate, Experience, Education, Skill,
    Employer, Job, JobApplication, ApplicationStatus, JobStatus, UserRole
)
from app.auth import require_user
from pydantic import BaseModel
from typing import List, Optional
from loguru import logger
from datetime import datetime, timedelta, timezone

router = APIRouter()


# Schemas remain the same
class DashboardStat(BaseModel):
    title: str
    value: str
    change: str
    changeType: str
    color: str


class RecentActivity(BaseModel):
    id: int
    action: str
    target: str
    time: str
    type: str


class DashboardData(BaseModel):
    stats: List[DashboardStat]
    recentActivities: List[RecentActivity]
    profileCompletion: int


@router.get("/dashboard/optimized", response_model=DashboardData)
async def get_dashboard_data_optimized(
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Phase 2 - Task 13: Optimized dashboard with single consolidated query

    Performance target: <50ms response time, 80% reduction in DB round-trips
    """
    try:
        # Admin dashboard - minimal query
        if current_user.role == UserRole.ADMIN:
            # Single query for all admin stats using CTEs
            admin_stats_query = text("""
                WITH stats AS (
                    SELECT
                        (SELECT COUNT(*) FROM users) as users_count,
                        (SELECT COUNT(*) FROM jobs) as jobs_count,
                        (SELECT COUNT(*) FROM job_applications) as applications_count
                )
                SELECT * FROM stats;
            """)

            result = await db.execute(admin_stats_query)
            row = result.fetchone()

            return {
                "stats": [
                    {
                        "title": "Accès Admin",
                        "value": "✓",
                        "change": "Dashboard Admin Disponible",
                        "changeType": "neutral",
                        "color": "red"
                    },
                    {
                        "title": "Utilisateurs",
                        "value": str(row.users_count),
                        "change": "Total plateforme",
                        "changeType": "neutral",
                        "color": "blue"
                    },
                    {
                        "title": "Offres",
                        "value": str(row.jobs_count),
                        "change": "Total plateforme",
                        "changeType": "neutral",
                        "color": "green"
                    },
                    {
                        "title": "Candidatures",
                        "value": str(row.applications_count),
                        "change": "Total plateforme",
                        "changeType": "neutral",
                        "color": "purple"
                    }
                ],
                "recentActivities": [
                    {
                        "id": 1,
                        "action": "Accès administrateur actif",
                        "target": f"{current_user.first_name} {current_user.last_name}",
                        "time": "maintenant",
                        "type": "admin"
                    }
                ],
                "profileCompletion": 100
            }

        # Employer dashboard - consolidated single query
        if current_user.role == UserRole.EMPLOYER:
            # Get employer_id first (lightweight query)
            result = await db.execute(
                select(Employer.id, Employer.company_id).filter(Employer.user_id == current_user.id)
            )
            employer_data = result.first()

            if not employer_data:
                raise HTTPException(status_code=404, detail="Employeur non trouvé")

            employer_id, company_id = employer_data

            # If no company, return minimal dashboard
            if not company_id:
                return {
                    "stats": [
                        {"title": "Entreprise", "value": "Non configurée", "change": "Créez votre entreprise",
                         "changeType": "neutral", "color": "gray"},
                        {"title": "Offres actives", "value": "0", "change": "+0",
                         "changeType": "neutral", "color": "blue"},
                        {"title": "Candidatures", "value": "0", "change": "+0",
                         "changeType": "neutral", "color": "green"},
                        {"title": "Entretiens", "value": "0", "change": "+0",
                         "changeType": "neutral", "color": "purple"}
                    ],
                    "recentActivities": [
                        {"id": 1, "action": "Prochaine étape",
                         "target": "Créez votre entreprise dans les paramètres",
                         "time": "maintenant", "type": "info"}
                    ],
                    "profileCompletion": 30
                }

            # Phase 2 - Task 13: SINGLE CONSOLIDATED QUERY using CTEs
            # Replaces 5+ separate queries with one efficient query
            consolidated_query = text("""
                WITH employer_stats AS (
                    -- All statistics in one CTE
                    SELECT
                        COUNT(DISTINCT j.id) FILTER (WHERE j.status = 'PUBLISHED') as active_jobs_count,
                        COUNT(DISTINCT ja.id) as total_applications,
                        COUNT(DISTINCT ja.id) FILTER (WHERE ja.status = 'INTERVIEW') as interviews_count,
                        COUNT(DISTINCT ja.id) FILTER (
                            WHERE ja.status IN ('REJECTED', 'ACCEPTED', 'INTERVIEW', 'SHORTLISTED', 'VIEWED')
                        ) as responded_applications
                    FROM jobs j
                    LEFT JOIN job_applications ja ON ja.job_id = j.id
                    WHERE j.employer_id = :employer_id
                ),
                recent_job AS (
                    -- Most recent published job
                    SELECT id, title, created_at
                    FROM jobs
                    WHERE employer_id = :employer_id
                    ORDER BY created_at DESC
                    LIMIT 1
                ),
                recent_application AS (
                    -- Most recent application
                    SELECT ja.applied_at, j.title as job_title
                    FROM job_applications ja
                    JOIN jobs j ON j.id = ja.job_id
                    WHERE j.employer_id = :employer_id
                    ORDER BY ja.applied_at DESC
                    LIMIT 1
                ),
                recent_interview AS (
                    -- Most recent interview
                    SELECT ja.updated_at, j.title as job_title
                    FROM job_applications ja
                    JOIN jobs j ON j.id = ja.job_id
                    WHERE j.employer_id = :employer_id AND ja.status = 'INTERVIEW'
                    ORDER BY ja.updated_at DESC
                    LIMIT 1
                )
                SELECT
                    s.*,
                    rj.title as last_job_title,
                    rj.created_at as last_job_created_at,
                    ra.job_title as last_application_job,
                    ra.applied_at as last_application_date,
                    ri.job_title as last_interview_job,
                    ri.updated_at as last_interview_date
                FROM employer_stats s
                LEFT JOIN recent_job rj ON true
                LEFT JOIN recent_application ra ON true
                LEFT JOIN recent_interview ri ON true;
            """)

            result = await db.execute(consolidated_query, {"employer_id": employer_id})
            row = result.fetchone()

            # Calculate response rate
            response_rate = f"{round((row.responded_applications / row.total_applications) * 100) if row.total_applications else 0}%"

            # Build stats from single query result
            stats = [
                {
                    "title": "Offres actives",
                    "value": str(row.active_jobs_count),
                    "change": f"+{row.active_jobs_count}",
                    "changeType": "increase" if row.active_jobs_count > 0 else "neutral",
                    "color": "blue"
                },
                {
                    "title": "Candidatures reçues",
                    "value": str(row.total_applications),
                    "change": f"+{row.total_applications}",
                    "changeType": "increase" if row.total_applications > 0 else "neutral",
                    "color": "green"
                },
                {
                    "title": "Entretiens prévus",
                    "value": str(row.interviews_count),
                    "change": f"+{row.interviews_count}",
                    "changeType": "increase" if row.interviews_count > 0 else "neutral",
                    "color": "purple"
                },
                {
                    "title": "Taux de réponse",
                    "value": response_rate,
                    "change": response_rate,
                    "changeType": "increase" if row.responded_applications > 0 else "neutral",
                    "color": "orange"
                }
            ]

            # Build activities from single query result
            recent_activities = []
            if row.last_job_title:
                recent_activities.append({
                    "id": 1,
                    "action": "Nouvelle offre publiée",
                    "target": row.last_job_title,
                    "time": _format_time_ago(row.last_job_created_at),
                    "type": "job_post"
                })
            if row.last_application_job:
                recent_activities.append({
                    "id": 2,
                    "action": "Nouvelle candidature reçue",
                    "target": row.last_application_job,
                    "time": _format_time_ago(row.last_application_date),
                    "type": "application"
                })
            if row.last_interview_job:
                recent_activities.append({
                    "id": 3,
                    "action": "Entretien planifié",
                    "target": row.last_interview_job,
                    "time": _format_time_ago(row.last_interview_date),
                    "type": "interview"
                })

            if not recent_activities:
                recent_activities.append({
                    "id": 0,
                    "action": "Bienvenue sur votre dashboard employeur !",
                    "target": f"{current_user.first_name} {current_user.last_name}",
                    "time": _format_time_ago(current_user.created_at),
                    "type": "welcome"
                })

            return {
                "stats": stats,
                "recentActivities": recent_activities,
                "profileCompletion": 100
            }

        # Candidate dashboard - consolidated single query
        else:
            # Phase 2 - Task 13: SINGLE CONSOLIDATED QUERY for candidate
            candidate_query = text("""
                WITH candidate_data AS (
                    SELECT
                        c.id,
                        c.phone,
                        c.location,
                        c.title,
                        c.summary,
                        COUNT(DISTINCT e.id) as experience_count,
                        COUNT(DISTINCT ed.id) as education_count,
                        COUNT(DISTINCT s.id) as skill_count
                    FROM candidates c
                    LEFT JOIN experiences e ON e.candidate_id = c.id
                    LEFT JOIN educations ed ON ed.candidate_id = c.id
                    LEFT JOIN skills s ON s.candidate_id = c.id
                    WHERE c.user_id = :user_id
                    GROUP BY c.id, c.phone, c.location, c.title, c.summary
                ),
                application_stats AS (
                    SELECT
                        COUNT(*) as applications_count,
                        COUNT(*) FILTER (WHERE status = 'INTERVIEW') as interviews_count
                    FROM job_applications ja
                    JOIN candidates c ON c.id = ja.candidate_id
                    WHERE c.user_id = :user_id
                ),
                job_stats AS (
                    SELECT COUNT(*) as available_jobs_count
                    FROM jobs
                    WHERE status = 'PUBLISHED'
                ),
                recent_application AS (
                    SELECT ja.applied_at, j.title as job_title
                    FROM job_applications ja
                    JOIN jobs j ON j.id = ja.job_id
                    JOIN candidates c ON c.id = ja.candidate_id
                    WHERE c.user_id = :user_id
                    ORDER BY ja.applied_at DESC
                    LIMIT 1
                )
                SELECT
                    cd.*,
                    COALESCE(ast.applications_count, 0) as applications_count,
                    COALESCE(ast.interviews_count, 0) as interviews_count,
                    js.available_jobs_count,
                    ra.job_title as last_application_job,
                    ra.applied_at as last_application_date
                FROM candidate_data cd
                CROSS JOIN application_stats ast
                CROSS JOIN job_stats js
                LEFT JOIN recent_application ra ON true;
            """)

            result = await db.execute(candidate_query, {"user_id": current_user.id})
            row = result.fetchone()

            if not row or not row.id:
                raise HTTPException(status_code=404, detail="Candidat non trouvé")

            # Calculate profile completion
            fields = [
                current_user.first_name,
                current_user.last_name,
                current_user.email,
                row.phone,
                row.location,
                row.title,
                row.summary
            ]
            filled_fields = len([field for field in fields if field and str(field).strip()])
            profile_completion = (filled_fields / len(fields)) * 100

            # Add bonuses for experience, education, skills
            total_completion = profile_completion * 0.6
            if row.experience_count > 0:
                total_completion += 15
            if row.education_count > 0:
                total_completion += 15
            if row.skill_count > 0:
                total_completion += 10

            completion = round(total_completion)

            # Build stats
            stats = [
                {
                    "title": "Candidatures envoyées",
                    "value": str(row.applications_count),
                    "change": f"+{row.applications_count}",
                    "changeType": "increase" if row.applications_count > 0 else "neutral",
                    "color": "blue"
                },
                {
                    "title": "Offres disponibles",
                    "value": str(row.available_jobs_count),
                    "change": f"+{row.available_jobs_count}",
                    "changeType": "increase" if row.available_jobs_count > 0 else "neutral",
                    "color": "green"
                },
                {
                    "title": "Entretiens prévus",
                    "value": str(row.interviews_count),
                    "change": f"+{row.interviews_count}",
                    "changeType": "increase" if row.interviews_count > 0 else "neutral",
                    "color": "purple"
                },
                {
                    "title": "Profil complété",
                    "value": f"{completion}%",
                    "change": f"{completion}%",
                    "changeType": "increase" if completion > 50 else "neutral",
                    "color": "orange"
                }
            ]

            # Build activities
            recent_activities = []
            if row.last_application_job:
                recent_activities.append({
                    "id": 1,
                    "action": "Candidature envoyée",
                    "target": row.last_application_job,
                    "time": _format_time_ago(row.last_application_date),
                    "type": "application"
                })

            recent_activities.append({
                "id": 2,
                "action": "Profil créé",
                "target": f"{current_user.first_name} {current_user.last_name}",
                "time": _format_time_ago(current_user.created_at),
                "type": "update"
            })

            return {
                "stats": stats,
                "recentActivities": recent_activities,
                "profileCompletion": completion
            }

    except Exception as e:
        import traceback
        logger.error(f"Error fetching optimized dashboard data: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des données du dashboard: {str(e)}"
        )


def _format_time_ago(dt: datetime) -> str:
    """Formater une date en temps relatif"""
    if not dt:
        return "Jamais"

    now = datetime.now(timezone.utc)
    # Convertir dt en UTC si nécessaire
    if dt.tzinfo is None:
        dt_utc = dt.replace(tzinfo=timezone.utc)
    else:
        dt_utc = dt.astimezone(timezone.utc)

    diff = now - dt_utc

    if diff.days > 0:
        return f"Il y a {diff.days} jour{'s' if diff.days > 1 else ''}"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"Il y a {hours} heure{'s' if hours > 1 else ''}"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"Il y a {minutes} minute{'s' if minutes > 1 else ''}"
    else:
        return "À l'instant"
