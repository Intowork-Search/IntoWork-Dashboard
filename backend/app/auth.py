import os
from clerk_backend_api import Clerk
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.base import User, UserRole
from typing import Optional
import jwt
from jwt.exceptions import InvalidTokenError

# Configuration Clerk
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET", "")
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY", "")

# Client Clerk
clerk_client = Clerk(bearer_auth=CLERK_SECRET_KEY) if CLERK_SECRET_KEY else None

# Security scheme
security = HTTPBearer(auto_error=False)

class ClerkAuth:
    """Classe pour gérer l'authentification Clerk"""
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Vérifier et décoder un token Clerk JWT"""
        try:
            if not CLERK_PEM_PUBLIC_KEY:
                raise HTTPException(status_code=500, detail="Clerk public key not configured")
            
            print(f"DEBUG: Verifying token: {token[:50]}...")
            print(f"DEBUG: PEM key available: {bool(CLERK_PEM_PUBLIC_KEY)}")
            
            # Décoder le token JWT
            payload = jwt.decode(
                token,
                CLERK_PEM_PUBLIC_KEY,
                algorithms=["RS256"],
                issuer="https://current-coyote-76.clerk.accounts.dev",
                options={"verify_aud": False}  # Les tokens Clerk n'ont pas toujours de claim aud
            )
            print(f"DEBUG: Token payload: {payload}")
            return payload
        except InvalidTokenError as e:
            print(f"DEBUG: Token validation error: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    @staticmethod
    def get_user_info(user_id: str) -> dict:
        """Récupérer les informations utilisateur depuis Clerk"""
        try:
            if not clerk_client:
                raise HTTPException(status_code=500, detail="Clerk client not configured")
            
            user = clerk_client.users.get(user_id)
            return {
                "clerk_id": user.id,
                "email": user.email_addresses[0].email_address if user.email_addresses else None,
                "first_name": user.first_name or "",
                "last_name": user.last_name or "",
                "profile_image_url": user.profile_image_url
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to get user info: {str(e)}")

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dépendance pour récupérer l'utilisateur actuel depuis le token Clerk
    """
    if not credentials:
        print("DEBUG: No credentials provided")
        return None
    
    try:
        print(f"DEBUG: Attempting to verify token: {credentials.credentials[:50]}...")
        # Vérifier le token Clerk
        payload = ClerkAuth.verify_token(credentials.credentials)
        clerk_user_id = payload.get("sub")
        
        if not clerk_user_id:
            print("DEBUG: No 'sub' field in token payload")
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        print(f"DEBUG: Clerk user ID: {clerk_user_id}")
        
        # Récupérer l'utilisateur depuis la DB
        user = db.query(User).filter(User.clerk_id == clerk_user_id).first()
        
        if not user:
            print("DEBUG: User not found in DB, creating new user")
            # Si l'utilisateur n'existe pas, le créer automatiquement
            user_info = ClerkAuth.get_user_info(clerk_user_id)
            user = User(
                clerk_id=clerk_user_id,
                email=user_info["email"],
                first_name=user_info["first_name"],
                last_name=user_info["last_name"],
                role=UserRole.CANDIDATE,  # Rôle par défaut
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        print(f"DEBUG: User found/created: {user.email}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def require_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dépendance qui exige qu'un utilisateur soit authentifié
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user

def require_role(*allowed_roles: UserRole):
    """
    Décorateur pour exiger des rôles spécifiques
    Usage: @require_role(UserRole.EMPLOYER, UserRole.ADMIN)
    """
    def role_dependency(current_user: User = Depends(require_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required roles: {', '.join(role.value for role in allowed_roles)}"
            )
        return current_user
    return role_dependency

# Dépendances prêtes à utiliser
require_candidate = require_role(UserRole.CANDIDATE)
require_employer = require_role(UserRole.EMPLOYER)
require_admin = require_role(UserRole.ADMIN)
require_employer_or_admin = require_role(UserRole.EMPLOYER, UserRole.ADMIN)
