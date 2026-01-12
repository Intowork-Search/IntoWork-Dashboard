"""
Phase 2 - Task 15: Authentication Module with Annotated Types

This module provides authentication utilities using FastAPI 0.100+ patterns
with Annotated types for improved type inference and cleaner dependency injection.
"""

import os
from typing import Annotated, Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.base import User, UserRole
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
import bcrypt
import hashlib

# Configuration NextAuth
NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET")
if not NEXTAUTH_SECRET:
    raise ValueError("NEXTAUTH_SECRET environment variable is required. Generate one with: openssl rand -base64 32")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
REFRESH_TOKEN_EXPIRATION_DAYS = 7  # Phase 2 - Task 12: Refresh tokens expire in 7 days

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
    def hash_token(token: str) -> str:
        """
        Hash a token (like JWT refresh token) for storage.

        Uses SHA256 instead of bcrypt because tokens can exceed bcrypt's 72-byte limit.
        This is secure for tokens since they are already high-entropy random values.

        Args:
            token: The token to hash (e.g., JWT refresh token)

        Returns:
            str: SHA256 hash of the token (64 hex characters)
        """
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    @staticmethod
    def verify_token(plain_token: str, hashed_token: str) -> bool:
        """
        Verify a token against its hash.

        Args:
            plain_token: The token to verify
            hashed_token: The SHA256 hash to compare against

        Returns:
            bool: True if token matches, False otherwise
        """
        return hashlib.sha256(plain_token.encode('utf-8')).hexdigest() == hashed_token

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
        """Créer un JWT access token (24h expiration)"""
        payload = {
            "sub": str(user_id),
            "email": email,
            "role": role,
            "type": "access",  # Distinguish from refresh tokens
            "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
            "iat": datetime.now(timezone.utc)
        }
        return jwt.encode(payload, NEXTAUTH_SECRET, algorithm=JWT_ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: int, email: str) -> str:
        """
        Phase 2 - Task 12: Create JWT refresh token (7-day expiration)

        Refresh tokens are used to obtain new access tokens without re-authentication.
        They have longer expiration but contain minimal user data.
        """
        import secrets
        payload = {
            "sub": str(user_id),
            "email": email,
            "type": "refresh",
            "jti": secrets.token_urlsafe(32),  # Unique token ID for revocation
            "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRATION_DAYS),
            "iat": datetime.now(timezone.utc)
        }
        return jwt.encode(payload, NEXTAUTH_SECRET, algorithm=JWT_ALGORITHM)

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> dict:
        """
        Vérifier et décoder un token JWT NextAuth

        Args:
            token: JWT token string
            token_type: Expected token type ("access" or "refresh")
        """
        try:
            payload = jwt.decode(
                token,
                NEXTAUTH_SECRET,
                algorithms=[JWT_ALGORITHM]
            )

            # Verify token type matches expectation
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid token type. Expected {token_type}, got {payload.get('type')}"
                )

            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


# ==============================================================================
# Type Aliases for Annotated Dependencies (FastAPI 0.100+ Modern Style)
# ==============================================================================

# Database session dependency
DBSession = Annotated[AsyncSession, Depends(get_db)]

# HTTP Bearer credentials dependency
BearerCredentials = Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)]


async def get_current_user(
    credentials: BearerCredentials,
    db: DBSession
) -> Optional[User]:
    """
    Dépendance pour récupérer l'utilisateur actuel depuis le token NextAuth JWT

    Uses Annotated types for cleaner dependency injection.
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


# Type alias for optional current user
CurrentUserOptional = Annotated[Optional[User], Depends(get_current_user)]


async def require_user(
    current_user: CurrentUserOptional
) -> User:
    """
    Dépendance qui exige qu'un utilisateur soit authentifié

    Uses Annotated types for cleaner dependency injection.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user


# Type alias for required current user
CurrentUser = Annotated[User, Depends(require_user)]


def require_role(*allowed_roles: UserRole):
    """
    Décorateur pour exiger des rôles spécifiques
    Usage: @require_role(UserRole.EMPLOYER, UserRole.ADMIN)

    Returns a dependency that can be used with Annotated.
    """
    async def role_dependency(current_user: CurrentUser) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {', '.join(role.value for role in allowed_roles)}"
            )
        return current_user
    return role_dependency


# ==============================================================================
# Pre-configured Role Dependencies (for use with Annotated)
# ==============================================================================

# Role-specific dependency functions
async def _require_candidate(current_user: CurrentUser) -> User:
    """Require candidate role"""
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Required role: candidate"
        )
    return current_user


async def _require_employer(current_user: CurrentUser) -> User:
    """Require employer role"""
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Required role: employer"
        )
    return current_user


async def _require_admin(current_user: CurrentUser) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Required role: admin"
        )
    return current_user


async def _require_employer_or_admin(current_user: CurrentUser) -> User:
    """Require employer or admin role"""
    if current_user.role not in (UserRole.EMPLOYER, UserRole.ADMIN):
        raise HTTPException(
            status_code=403,
            detail="Access denied. Required roles: employer, admin"
        )
    return current_user


# Type aliases for role-specific dependencies (Annotated style)
CandidateUser = Annotated[User, Depends(_require_candidate)]
EmployerUser = Annotated[User, Depends(_require_employer)]
AdminUser = Annotated[User, Depends(_require_admin)]
EmployerOrAdminUser = Annotated[User, Depends(_require_employer_or_admin)]


# ==============================================================================
# Legacy Dependencies (for backward compatibility)
# ==============================================================================

# These use the old Depends() style for backward compatibility
# New code should use the Annotated type aliases above
require_candidate = require_role(UserRole.CANDIDATE)
require_employer = require_role(UserRole.EMPLOYER)
require_admin = require_role(UserRole.ADMIN)
require_employer_or_admin = require_role(UserRole.EMPLOYER, UserRole.ADMIN)
