from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.base import User, UserRole, Candidate, Employer
from app.auth import PasswordHasher, Auth, require_user
from typing import Optional

router = APIRouter()


# Schemas
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str  # "candidate" or "employer"


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    """
    Inscription d'un nouvel utilisateur
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Valider le rôle
    try:
        user_role = UserRole(request.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'candidate' or 'employer'"
        )
    
    # Hasher le mot de passe
    password_hash = PasswordHasher.hash_password(request.password)
    
    # Créer l'utilisateur
    new_user = User(
        email=request.email,
        password_hash=password_hash,
        first_name=request.first_name,
        last_name=request.last_name,
        name=f"{request.first_name} {request.last_name}",
        role=user_role,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Créer le profil associé (Candidate ou Employer)
    if user_role == UserRole.CANDIDATE:
        candidate = Candidate(user_id=new_user.id)
        db.add(candidate)
    elif user_role == UserRole.EMPLOYER:
        employer = Employer(user_id=new_user.id)
        db.add(employer)
    
    db.commit()
    
    # Générer le token JWT
    access_token = Auth.create_access_token(
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role.value
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "role": new_user.role.value
        }
    }


@router.post("/signin", response_model=AuthResponse)
async def signin(request: SignInRequest, db: Session = Depends(get_db)):
    """
    Connexion d'un utilisateur existant
    """
    # Chercher l'utilisateur
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Vérifier le mot de passe
    if not user.password_hash or not PasswordHasher.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Vérifier que le compte est actif
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Générer le token JWT
    access_token = Auth.create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role.value
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "image": user.image
        }
    }


@router.get("/me")
async def get_current_user_info(user: User = Depends(require_user)):
    """
    Récupérer les informations de l'utilisateur connecté
    """
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "name": user.name,
        "role": user.role.value,
        "image": user.image,
        "is_active": user.is_active
    }
