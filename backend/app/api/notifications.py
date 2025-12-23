from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from app.database import get_db
from app.auth import require_user
from app.models.base import User, Notification, NotificationType

router = APIRouter()
logger = logging.getLogger(__name__)

# ==================== Modèles Pydantic ====================

class NotificationResponse(BaseModel):
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
    notifications: List[NotificationResponse]
    total: int
    unread_count: int

class MarkAsReadRequest(BaseModel):
    notification_ids: List[int]

# ==================== Routes ====================

@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    limit: int = 20,
    offset: int = 0,
    unread_only: bool = False,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer les notifications de l'utilisateur connecté
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Compter le total et les non lues
    total = query.count()
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    # Récupérer les notifications paginées
    notifications = query.order_by(desc(Notification.created_at)).offset(offset).limit(limit).all()
    
    return NotificationListResponse(
        notifications=[
            NotificationResponse(
                id=notif.id,
                type=notif.type.value,
                title=notif.title,
                message=notif.message,
                related_job_id=notif.related_job_id,
                related_application_id=notif.related_application_id,
                is_read=notif.is_read,
                read_at=notif.read_at,
                created_at=notif.created_at
            ) for notif in notifications
        ],
        total=total,
        unread_count=unread_count
    )

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer le nombre de notifications non lues
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"unread_count": count}

@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Marquer une notification comme lue
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    
    notification.is_read = True
    notification.read_at = datetime.now()
    db.commit()
    
    return {"message": "Notification marquée comme lue"}

@router.put("/mark-all-read")
async def mark_all_as_read(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Marquer toutes les notifications comme lues
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.now()
    })
    db.commit()
    
    return {"message": "Toutes les notifications marquées comme lues"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer une notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification supprimée"}

# ==================== Fonctions utilitaires ====================

def create_notification(
    db: Session,
    user_id: int,
    type: NotificationType,
    title: str,
    message: str,
    related_job_id: Optional[int] = None,
    related_application_id: Optional[int] = None
):
    """
    Créer une nouvelle notification
    """
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        related_job_id=related_job_id,
        related_application_id=related_application_id,
        is_read=False
    )
    db.add(notification)
    db.commit()
    logger.info(f"Notification créée pour user_id={user_id}, type={type.value}")
    return notification
