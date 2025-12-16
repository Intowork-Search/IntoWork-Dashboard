from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.base import User, UserRole
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Schémas Pydantic
class UserBase(BaseModel):
    clerk_id: str
    email: str
    role: UserRole
    first_name: str
    last_name: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class UserCreate(UserBase):
    pass

@router.get("/users", response_model=List[UserResponse])
async def get_users(db: Session = Depends(get_db)):
    """Récupérer tous les utilisateurs"""
    users = db.query(User).all()
    return users

@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Créer un nouvel utilisateur"""
    # Vérifier si l'utilisateur existe déjà
    existing_user = db.query(User).filter(User.clerk_id == user.clerk_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this Clerk ID already exists")
    
    # Créer le nouvel utilisateur
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Récupérer un utilisateur par ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/db-status")
async def check_db_connection(db: Session = Depends(get_db)):
    """Vérifier la connexion à la base de données"""
    try:
        # Test simple de la connexion
        result = db.execute("SELECT 1").scalar()
        user_count = db.query(User).count()
        return {
            "status": "connected",
            "test_query": result,
            "users_count": user_count,
            "message": "Database connection successful"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
