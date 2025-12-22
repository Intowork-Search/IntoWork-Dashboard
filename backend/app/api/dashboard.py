from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.base import (
    User, Candidate, Experience, Education, Skill,
    Employer, Job, JobApplication, ApplicationStatus, JobStatus
)
from app.auth import require_user
from pydantic import BaseModel
from typing import List, Optional
import logging
from datetime import datetime, timedelta, timezone

router = APIRouter()
logger = logging.getLogger(__name__)

# Schémas pour les statistiques du dashboard
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

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Récupérer les données du dashboard pour l'utilisateur connecté"""
    
    try:
        if current_user.role.value == "employer":
            # Récupérer l'employeur lié à l'utilisateur
            employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
            if not employer:
                raise HTTPException(status_code=404, detail="Employeur non trouvé")

            # Offres actives
            active_jobs = db.query(Job).filter(Job.employer_id == employer.id, Job.status == JobStatus.PUBLISHED).all()
            active_jobs_count = len(active_jobs)

            # Candidatures reçues (toutes offres de l'employeur)
            applications_count = db.query(JobApplication).join(Job).filter(Job.employer_id == employer.id).count()

            # Entretiens prévus (statut interview)
            interviews_count = db.query(JobApplication).join(Job).filter(Job.employer_id == employer.id, JobApplication.status == ApplicationStatus.INTERVIEW).count()

            # Taux de réponse (candidatures traitées / total)
            total_applications = db.query(JobApplication).join(Job).filter(Job.employer_id == employer.id).count()
            responded_applications = db.query(JobApplication).join(Job).filter(Job.employer_id == employer.id, JobApplication.status.in_([ApplicationStatus.REJECTED, ApplicationStatus.ACCEPTED, ApplicationStatus.INTERVIEW, ApplicationStatus.SHORTLISTED, ApplicationStatus.VIEWED])).count()
            response_rate = f"{round((responded_applications / total_applications) * 100) if total_applications else 0}%"

            # Statistiques pour employeur
            stats = [
                {
                    "title": "Offres actives",
                    "value": str(active_jobs_count),
                    "change": f"+{active_jobs_count}",
                    "changeType": "increase" if active_jobs_count > 0 else "neutral",
                    "color": "blue"
                },
                {
                    "title": "Candidatures reçues",
                    "value": str(applications_count),
                    "change": f"+{applications_count}",
                    "changeType": "increase" if applications_count > 0 else "neutral",
                    "color": "green"
                },
                {
                    "title": "Entretiens prévus",
                    "value": str(interviews_count),
                    "change": f"+{interviews_count}",
                    "changeType": "increase" if interviews_count > 0 else "neutral",
                    "color": "purple"
                },
                {
                    "title": "Taux de réponse",
                    "value": response_rate,
                    "change": response_rate,
                    "changeType": "increase" if responded_applications > 0 else "neutral",
                    "color": "orange"
                }
            ]

            # Activités récentes (exemples)
            recent_activities = []
            # Dernière offre publiée
            last_job = db.query(Job).filter(Job.employer_id == employer.id).order_by(Job.created_at.desc()).first()
            if last_job:
                recent_activities.append({
                    "id": 1,
                    "action": "Nouvelle offre publiée",
                    "target": last_job.title,
                    "time": _format_time_ago(last_job.created_at),
                    "type": "job_post"
                })
            # Dernière candidature reçue
            last_application = db.query(JobApplication).join(Job).filter(Job.employer_id == employer.id).order_by(JobApplication.applied_at.desc()).first()
            if last_application:
                recent_activities.append({
                    "id": 2,
                    "action": "Nouvelle candidature reçue",
                    "target": last_application.job.title,
                    "time": _format_time_ago(last_application.applied_at),
                    "type": "application"
                })
            # Dernier entretien planifié
            last_interview = db.query(JobApplication).join(Job).filter(Job.employer_id == employer.id, JobApplication.status == ApplicationStatus.INTERVIEW).order_by(JobApplication.updated_at.desc()).first()
            if last_interview:
                recent_activities.append({
                    "id": 3,
                    "action": "Entretien planifié",
                    "target": last_interview.job.title,
                    "time": _format_time_ago(last_interview.updated_at),
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
                "profileCompletion": 100  # Non pertinent pour employeur, mais requis par le schéma
            }
        # Sinon, logique CANDIDATE (inchangée)
        # ...existing code...
        
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des données du dashboard"
        )

def _format_time_ago(dt: datetime) -> str:
    """Formater une date en temps relatif"""
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

@router.get("/dashboard/activities", response_model=List[RecentActivity])
async def get_recent_activities(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Récupérer les activités récentes de l'utilisateur"""
    
    try:
        candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        
        activities = []
        
        # Activité de création de profil
        activities.append(RecentActivity(
            id=1,
            action="Profil créé avec succès",
            target=f"{current_user.first_name} {current_user.last_name}",
            time="Aujourd'hui",
            type="update"
        ))
        
        # Activité de connexion
        activities.append(RecentActivity(
            id=2,
            action="Connexion à la plateforme",
            target="Nouvelle session",
            time="Il y a quelques instants",
            type="view"
        ))
        
        # Activité basée sur les données du profil
        if candidate:
            # Calcul du pourcentage de complétion (même logique que le frontend)
            fields = [
                current_user.first_name,
                current_user.last_name,
                current_user.email,
                candidate.phone,
                candidate.location,
                candidate.title,
                candidate.summary
            ]
            filled_fields = len([field for field in fields if field and str(field).strip()])
            profile_completion = (filled_fields / len(fields)) * 100
            
            # Ajouter les bonus pour expérience, éducation et compétences
            has_experience = len(candidate.experiences) > 0 if candidate.experiences else False
            has_education = len(candidate.educations) > 0 if candidate.educations else False
            has_skills = len(candidate.skills) > 0 if candidate.skills else False
            
            total_completion = profile_completion * 0.6
            if has_experience:
                total_completion += 15
            if has_education:
                total_completion += 15
            if has_skills:
                total_completion += 10
            
            completion = round(total_completion)
            
            activities.append(RecentActivity(
                id=3,
                action="Profil en cours de complétion",
                target=f"{completion}% complété",
                time="En cours",
                type="update"
            ))
        
        return activities
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des activités: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne du serveur"
        )
