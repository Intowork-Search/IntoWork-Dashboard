"""
Tests for authentication endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.base import User, PasswordResetToken


@pytest.mark.asyncio
async def test_signup_success(client: AsyncClient, test_db: AsyncSession):
    """Test successful user signup"""
    response = await client.post(
        "/api/auth/signup",
        json={
            "email": "newuser@test.com",
            "password": "SecurePass123!",
            "first_name": "New",
            "last_name": "User"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["first_name"] == "New"
    assert data["last_name"] == "User"
    assert "access_token" in data
    assert "id" in data

    # Verify user was created in database
    result = await test_db.execute(
        select(User).filter(User.email == "newuser@test.com")
    )
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.email == "newuser@test.com"


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient, candidate_user: User):
    """Test signup with duplicate email fails"""
    response = await client.post(
        "/api/auth/signup",
        json={
            "email": "candidate@test.com",  # Already exists
            "password": "SecurePass123!",
            "first_name": "Duplicate",
            "last_name": "User"
        }
    )

    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_signup_weak_password(client: AsyncClient):
    """Test signup with weak password fails"""
    response = await client.post(
        "/api/auth/signup",
        json={
            "email": "weakpass@test.com",
            "password": "weak",  # Too weak
            "first_name": "Weak",
            "last_name": "Password"
        }
    )

    assert response.status_code == 400
    assert "password" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_signin_success(client: AsyncClient, candidate_user: User):
    """Test successful signin"""
    response = await client.post(
        "/api/auth/signin",
        json={
            "email": "candidate@test.com",
            "password": "TestPass123!"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "candidate@test.com"
    assert data["user"]["role"] == "candidate"


@pytest.mark.asyncio
async def test_signin_invalid_credentials(client: AsyncClient, candidate_user: User):
    """Test signin with invalid credentials"""
    response = await client.post(
        "/api/auth/signin",
        json={
            "email": "candidate@test.com",
            "password": "WrongPassword123!"
        }
    )

    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_signin_nonexistent_user(client: AsyncClient):
    """Test signin with non-existent user"""
    response = await client.post(
        "/api/auth/signin",
        json={
            "email": "nonexistent@test.com",
            "password": "TestPass123!"
        }
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_forgot_password_success(client: AsyncClient, candidate_user: User, test_db: AsyncSession):
    """Test forgot password request"""
    response = await client.post(
        "/api/auth/forgot-password",
        json={"email": "candidate@test.com"}
    )

    assert response.status_code == 200
    assert "sent" in response.json()["message"].lower()

    # Verify token was created in database
    result = await test_db.execute(
        select(PasswordResetToken).filter(
            PasswordResetToken.email == "candidate@test.com"
        )
    )
    token = result.scalar_one_or_none()
    assert token is not None
    assert token.email == "candidate@test.com"


@pytest.mark.asyncio
async def test_forgot_password_nonexistent_user(client: AsyncClient):
    """Test forgot password for non-existent user"""
    response = await client.post(
        "/api/auth/forgot-password",
        json={"email": "nonexistent@test.com"}
    )

    # Should return 200 for security (don't reveal if email exists)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_reset_password_success(client: AsyncClient, candidate_user: User, test_db: AsyncSession):
    """Test password reset with valid token"""
    # First request password reset
    await client.post(
        "/api/auth/forgot-password",
        json={"email": "candidate@test.com"}
    )

    # Get the token from database
    result = await test_db.execute(
        select(PasswordResetToken).filter(
            PasswordResetToken.email == "candidate@test.com"
        )
    )
    token_record = result.scalar_one()

    # Reset password
    response = await client.post(
        "/api/auth/reset-password",
        json={
            "token": token_record.token,
            "new_password": "NewSecurePass456!"
        }
    )

    assert response.status_code == 200
    assert "reset" in response.json()["message"].lower()

    # Verify can sign in with new password
    signin_response = await client.post(
        "/api/auth/signin",
        json={
            "email": "candidate@test.com",
            "password": "NewSecurePass456!"
        }
    )
    assert signin_response.status_code == 200


@pytest.mark.asyncio
async def test_reset_password_invalid_token(client: AsyncClient):
    """Test password reset with invalid token"""
    response = await client.post(
        "/api/auth/reset-password",
        json={
            "token": "invalid-token-12345",
            "new_password": "NewSecurePass456!"
        }
    )

    assert response.status_code == 400
    assert "invalid" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_reset_password_weak_password(client: AsyncClient, candidate_user: User, test_db: AsyncSession):
    """Test password reset with weak password"""
    # Request password reset
    await client.post(
        "/api/auth/forgot-password",
        json={"email": "candidate@test.com"}
    )

    # Get token
    result = await test_db.execute(
        select(PasswordResetToken).filter(
            PasswordResetToken.email == "candidate@test.com"
        )
    )
    token_record = result.scalar_one()

    # Try to reset with weak password
    response = await client.post(
        "/api/auth/reset-password",
        json={
            "token": token_record.token,
            "new_password": "weak"
        }
    )

    assert response.status_code == 400
    assert "password" in response.json()["detail"].lower()
