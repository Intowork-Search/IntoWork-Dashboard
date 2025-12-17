from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.base import User, Candidate, Experience, Education, Skill
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
        # Récupérer le profil candidat
        candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        
        if not candidate:
            # Créer un profil vide si nécessaire
            candidate = Candidate(
                user_id=current_user.id,
                phone=None,
                location=None,
                title=None,
                summary=None
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)
        
        # Calculer les statistiques réelles
        experiences_count = db.query(Experience).filter(Experience.candidate_id == candidate.id).count()
        educations_count = db.query(Education).filter(Education.candidate_id == candidate.id).count()
        skills_count = db.query(Skill).filter(Skill.candidate_id == candidate.id).count()
        
        # Calculer le pourcentage de complétion du profil (logique unifiée)
        completion_fields = [
            current_user.first_name,
            current_user.last_name,
            current_user.email,
            candidate.phone,
            candidate.location,
            candidate.title,
            candidate.summary
        ]
        
        completed_fields = sum(1 for field in completion_fields if field and str(field).strip())
        base_completion = (completed_fields / len(completion_fields)) * 100
        
        # Appliquer la même logique que le frontend
        total_completion = base_completion * 0.6
        if experiences_count > 0:
            total_completion += 15
        if educations_count > 0:
            total_completion += 15
        if skills_count > 0:
            total_completion += 10
            
        profile_completion = round(total_completion)
        
        # Statistiques pour candidat
        stats = [
            {
                "title": "Profil complété",
                "value": f"{profile_completion}%",
                "change": "+5%",
                "changeType": "increase",
                "color": "blue"
            },
            {
                "title": "Expériences ajoutées",
                "value": str(experiences_count),
                "change": f"+{experiences_count}",
                "changeType": "increase" if experiences_count > 0 else "neutral",
                "color": "green"
            },
            {
                "title": "Formations ajoutées",
                "value": str(educations_count),
                "change": f"+{educations_count}",
                "changeType": "increase" if educations_count > 0 else "neutral",
                "color": "purple"
            },
            {
                "title": "Compétences ajoutées",
                "value": str(skills_count),
                "change": f"+{skills_count}",
                "changeType": "increase" if skills_count > 0 else "neutral",
                "color": "orange"
            }
        ]
        
        # Activités récentes basées sur les données réelles
        recent_activities = []
        
        # Ajouter les activités basées sur les données existantes
        if candidate.updated_at:
            recent_activities.append({
                "id": 1,
                "action": "Profil mis à jour",
                "target": f"{current_user.first_name} {current_user.last_name}",
                "time": _format_time_ago(candidate.updated_at),
                "type": "update"
            })
        
        if experiences_count > 0:
            recent_activities.append({
                "id": 2,
                "action": f"{experiences_count} expérience(s) professionnelle(s) ajoutée(s)",
                "target": "Section Expériences",
                "time": "Récemment",
                "type": "experience"
            })
        
        if skills_count > 0:
            recent_activities.append({
                "id": 3,
                "action": f"{skills_count} compétence(s) ajoutée(s)",
                "target": "Section Compétences",
                "time": "Récemment",
                "type": "skill"
            })
        
        # Si aucune activité, ajouter un message d'encouragement
        if not recent_activities:
            recent_activities.append({
                "id": 1,
                "action": "Compte créé avec succès",
                "target": f"Bienvenue {current_user.first_name} !",
                "time": _format_time_ago(current_user.created_at),
                "type": "welcome"
            })
        
        return {
            "stats": stats,
            "recentActivities": recent_activities,
            "profileCompletion": profile_completion
        }
        
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
