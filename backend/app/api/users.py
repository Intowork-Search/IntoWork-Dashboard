from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
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
async def get_users(db: AsyncSession = Depends(get_db)):
    """Récupérer tous les utilisateurs"""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Créer un nouvel utilisateur"""
    # Vérifier si l'utilisateur existe déjà
    result = await db.execute(
        select(User).filter(User.clerk_id == user.clerk_id)
    )
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this Clerk ID already exists")

    # Créer le nouvel utilisateur
    db_user = User(**user.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Récupérer un utilisateur par ID"""
    result = await db.execute(
        select(User).filter(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/db-status")
async def check_db_connection(db: AsyncSession = Depends(get_db)):
    """Vérifier la connexion à la base de données"""
    try:
        from sqlalchemy import text
        # Test simple de la connexion avec syntaxe SQLAlchemy 2.0
        result = await db.execute(text("SELECT 1"))
        test_value = result.scalar()

        # Count users using func.count()
        count_result = await db.execute(
            select(func.count()).select_from(User)
        )
        user_count = count_result.scalar()

        return {
            "status": "connected",
            "test_query": test_value,
            "users_count": user_count,
            "message": "Database connection successful"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
