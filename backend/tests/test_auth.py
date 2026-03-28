"""
Tests for authentication endpoints (/api/auth/*).

Covers: signup, signin, forgot-password, reset-password, me, change-password.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.base import User, PasswordResetToken
from tests.conftest import TEST_PASSWORD


# ===========================================================================
# Signup
# ===========================================================================


class TestSignup:
    """POST /api/auth/signup"""

    async def test_signup_candidate_success(
        self, client: AsyncClient, test_db: AsyncSession
    ):
        """A new candidate can sign up and receives tokens."""
        response = await client.post(
            "/api/auth/signup",
            json={
                "email": "new.candidate@test.com",
                "password": TEST_PASSWORD,
                "first_name": "New",
                "last_name": "Candidate",
                "role": "candidate",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "new.candidate@test.com"
        assert data["user"]["role"] == "candidate"

        # Verify the user was persisted
        result = await test_db.execute(
            select(User).filter(User.email == "new.candidate@test.com")
        )
        user = result.scalar_one_or_none()
        assert user is not None

    async def test_signup_employer_success(self, client: AsyncClient):
        """A new employer can sign up."""
        response = await client.post(
            "/api/auth/signup",
            json={
                "email": "new.employer@test.com",
                "password": TEST_PASSWORD,
                "first_name": "New",
                "last_name": "Employer",
                "role": "employer",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["user"]["role"] == "employer"

    async def test_signup_duplicate_email(
        self, client: AsyncClient, candidate_user: User
    ):
        """Signup with an already-registered email returns 400."""
        response = await client.post(
            "/api/auth/signup",
            json={
                "email": "candidate@test.com",
                "password": TEST_PASSWORD,
                "first_name": "Duplicate",
                "last_name": "User",
                "role": "candidate",
            },
        )

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    async def test_signup_weak_password(self, client: AsyncClient):
        """Signup with a password that fails strength validation returns 400."""
        response = await client.post(
            "/api/auth/signup",
            json={
                "email": "weakpass@test.com",
                "password": "weak",
                "first_name": "Weak",
                "last_name": "Password",
                "role": "candidate",
            },
        )

        assert response.status_code == 400
        assert "password" in response.json()["detail"].lower()

    async def test_signup_missing_fields(self, client: AsyncClient):
        """Signup without required fields returns 422."""
        response = await client.post(
            "/api/auth/signup",
            json={"email": "incomplete@test.com"},
        )

        assert response.status_code == 422


# ===========================================================================
# Signin
# ===========================================================================


class TestSignin:
    """POST /api/auth/signin"""

    async def test_signin_success(
        self, client: AsyncClient, candidate_user: User
    ):
        """Valid credentials return tokens and user info."""
        response = await client.post(
            "/api/auth/signin",
            json={
                "email": "candidate@test.com",
                "password": TEST_PASSWORD,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "candidate@test.com"
        assert data["user"]["role"] == "candidate"

    async def test_signin_wrong_password(
        self, client: AsyncClient, candidate_user: User
    ):
        """Wrong password returns 401."""
        response = await client.post(
            "/api/auth/signin",
            json={
                "email": "candidate@test.com",
                "password": "WrongPassword123!@",
            },
        )

        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    async def test_signin_nonexistent_user(self, client: AsyncClient):
        """Signing in with an unknown email returns 401."""
        response = await client.post(
            "/api/auth/signin",
            json={
                "email": "nonexistent@test.com",
                "password": TEST_PASSWORD,
            },
        )

        assert response.status_code == 401

    async def test_signin_inactive_user(
        self, client: AsyncClient, test_db: AsyncSession
    ):
        """Inactive accounts cannot sign in (403)."""
        from app.auth import PasswordHasher
        from app.models.base import UserRole

        user = User(
            email="inactive@test.com",
            password_hash=PasswordHasher.hash_password(TEST_PASSWORD),
            role=UserRole.CANDIDATE,
            first_name="Inactive",
            last_name="User",
            name="Inactive User",
            is_active=False,
        )
        test_db.add(user)
        await test_db.commit()

        response = await client.post(
            "/api/auth/signin",
            json={
                "email": "inactive@test.com",
                "password": TEST_PASSWORD,
            },
        )

        assert response.status_code == 403


# ===========================================================================
# /me
# ===========================================================================


class TestMe:
    """GET /api/auth/me"""

    async def test_me_authenticated(
        self, client: AsyncClient, auth_headers_candidate: dict, candidate_user: User
    ):
        """Authenticated user can retrieve their own info."""
        response = await client.get(
            "/api/auth/me", headers=auth_headers_candidate
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "candidate@test.com"
        assert data["role"] == "candidate"
        assert data["is_active"] is True

    async def test_me_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/auth/me")

        assert response.status_code == 401


# ===========================================================================
# Forgot password
# ===========================================================================


class TestForgotPassword:
    """POST /api/auth/forgot-password"""

    async def test_forgot_password_existing_email(
        self,
        client: AsyncClient,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Requesting a reset for an existing email creates a token."""
        response = await client.post(
            "/api/auth/forgot-password",
            json={"email": "candidate@test.com"},
        )

        assert response.status_code == 200
        assert "message" in response.json()

        # A PasswordResetToken should exist in the DB
        result = await test_db.execute(
            select(PasswordResetToken).filter(
                PasswordResetToken.user_id == candidate_user.id
            )
        )
        token_record = result.scalar_one_or_none()
        assert token_record is not None

    async def test_forgot_password_nonexistent_email(
        self, client: AsyncClient
    ):
        """Non-existent email still returns 200 (security: don't leak)."""
        response = await client.post(
            "/api/auth/forgot-password",
            json={"email": "nobody@test.com"},
        )

        assert response.status_code == 200


# ===========================================================================
# Reset password
# ===========================================================================


class TestResetPassword:
    """POST /api/auth/reset-password"""

    async def test_reset_password_success(
        self,
        client: AsyncClient,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """A valid token allows the user to set a new password."""
        from datetime import datetime, timedelta, timezone

        # 1. Request a reset
        await client.post(
            "/api/auth/forgot-password",
            json={"email": "candidate@test.com"},
        )

        # 2. Retrieve the token from the database
        result = await test_db.execute(
            select(PasswordResetToken).filter(
                PasswordResetToken.user_id == candidate_user.id
            )
        )
        token_record = result.scalar_one()

        # SQLite strips timezone info from datetimes.
        # Ensure expires_at is timezone-aware so the route comparison works.
        if token_record.expires_at and token_record.expires_at.tzinfo is None:
            token_record.expires_at = token_record.expires_at.replace(
                tzinfo=timezone.utc
            )
            await test_db.commit()

        # 3. Reset password
        new_password = "BrandNewPass456!@"
        response = await client.post(
            "/api/auth/reset-password",
            json={
                "token": token_record.token,
                "new_password": new_password,
            },
        )

        assert response.status_code == 200
        assert "reset" in response.json()["message"].lower()

        # 4. Confirm signin with the new password works
        signin_response = await client.post(
            "/api/auth/signin",
            json={
                "email": "candidate@test.com",
                "password": new_password,
            },
        )
        assert signin_response.status_code == 200

    async def test_reset_password_invalid_token(self, client: AsyncClient):
        """An invalid token returns 400."""
        response = await client.post(
            "/api/auth/reset-password",
            json={
                "token": "totally-invalid-token",
                "new_password": "ValidPass123!@",
            },
        )

        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()

    async def test_reset_password_weak_new_password(
        self,
        client: AsyncClient,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Resetting with a weak password returns 400."""
        from datetime import timezone

        await client.post(
            "/api/auth/forgot-password",
            json={"email": "candidate@test.com"},
        )

        result = await test_db.execute(
            select(PasswordResetToken).filter(
                PasswordResetToken.user_id == candidate_user.id
            )
        )
        token_record = result.scalar_one()

        # SQLite strips timezone info; fix for route comparison
        if token_record.expires_at and token_record.expires_at.tzinfo is None:
            token_record.expires_at = token_record.expires_at.replace(
                tzinfo=timezone.utc
            )
            await test_db.commit()

        response = await client.post(
            "/api/auth/reset-password",
            json={
                "token": token_record.token,
                "new_password": "weak",
            },
        )

        assert response.status_code == 400
        assert "password" in response.json()["detail"].lower()


# ===========================================================================
# Change password
# ===========================================================================


class TestChangePassword:
    """POST /api/auth/change-password"""

    async def test_change_password_success(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Authenticated user can change their password."""
        new_password = "ChangedPass789!@"
        response = await client.post(
            "/api/auth/change-password",
            headers=auth_headers_candidate,
            json={
                "current_password": TEST_PASSWORD,
                "new_password": new_password,
            },
        )

        assert response.status_code == 200
        assert "changed" in response.json()["message"].lower()

    async def test_change_password_wrong_current(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Wrong current password returns 400."""
        response = await client.post(
            "/api/auth/change-password",
            headers=auth_headers_candidate,
            json={
                "current_password": "NotMyPassword123!@",
                "new_password": "NewPassword789!@",
            },
        )

        assert response.status_code == 400
