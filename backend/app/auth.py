import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.base import User, UserRole
from typing import Optional
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
import bcrypt

# Configuration NextAuth
NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET")
if not NEXTAUTH_SECRET:
    raise ValueError("NEXTAUTH_SECRET environment variable is required. Generate one with: openssl rand -base64 32")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security scheme
security = HTTPBearer(auto_error=False)


class PasswordHasher:
    """Gestion des mots de passe avec bcrypt"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash un mot de passe"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Vérifie un mot de passe"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """
        Security: Validate password strength with comprehensive requirements

        Requirements:
        - Minimum 12 characters
        - At least 1 uppercase letter (A-Z)
        - At least 1 lowercase letter (a-z)
        - At least 1 digit (0-9)
        - At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

        Returns:
            tuple[bool, str]: (is_valid, error_message)
        """
        if len(password) < 12:
            return False, "Password must be at least 12 characters long"

        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter (A-Z)"

        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter (a-z)"

        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one digit (0-9)"

        # Check for special characters
        special_chars = set("!@#$%^&*()_+-=[]{}|;:,.<>?")
        if not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"

        return True, ""


class Auth:
    """Classe pour gérer l'authentification NextAuth"""
    
    @staticmethod
    def create_access_token(user_id: int, email: str, role: str) -> str:
        """Créer un JWT token"""
        payload = {
            "sub": str(user_id),
            "email": email,
            "role": role,
            "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
            "iat": datetime.now(timezone.utc)
        }
        return jwt.encode(payload, NEXTAUTH_SECRET, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Vérifier et décoder un token JWT NextAuth"""
        try:
            payload = jwt.decode(
                token,
                NEXTAUTH_SECRET,
                algorithms=[JWT_ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Dépendance pour récupérer l'utilisateur actuel depuis le token NextAuth JWT
    """
    if not credentials:
        return None

    try:
        # Vérifier le token NextAuth
        payload = Auth.verify_token(credentials.credentials)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Récupérer l'utilisateur depuis la DB (ASYNC)
        result = await db.execute(
            select(User).filter(User.id == int(user_id))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not user.is_active:
            raise HTTPException(status_code=403, detail="User account is inactive")

        return user

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def require_user(
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
    async def role_dependency(current_user: User = Depends(require_user)) -> User:
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
