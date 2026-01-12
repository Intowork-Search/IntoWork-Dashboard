"""
Pytest configuration and fixtures for IntoWork Backend tests
"""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import Base, get_db
from app.models.base import User, Candidate, Company, Employer, Job, JobApplication
from app.auth import PasswordHasher
import os

# Test database URL (use separate test database)
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5433/intowork_test"
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_engine():
    """Create test database engine"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=NullPool,  # Disable pooling for tests
        echo=False
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Clean up
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture(scope="function")
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session"""
    AsyncTestingSessionLocal = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )

    async with AsyncTestingSessionLocal() as session:
        yield session


@pytest.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test HTTP client with database override"""
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def candidate_user(test_db: AsyncSession) -> User:
    """Create a test candidate user"""
    user = User(
        email="candidate@test.com",
        password_hash=PasswordHasher.hash_password("TestPass123!"),
        role="candidate",
        first_name="Test",
        last_name="Candidate",
        name="Test Candidate",
        email_verified=None
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)

    # Create candidate profile
    candidate = Candidate(
        user_id=user.id,
        phone="+1234567890",
        location="Test City",
        title="Software Engineer",
        summary="Test candidate profile"
    )
    test_db.add(candidate)
    await test_db.commit()
    await test_db.refresh(candidate)

    return user


@pytest.fixture
async def employer_user(test_db: AsyncSession) -> User:
    """Create a test employer user with company"""
    user = User(
        email="employer@test.com",
        password_hash=PasswordHasher.hash_password("TestPass123!"),
        role="employer",
        first_name="Test",
        last_name="Employer",
        name="Test Employer",
        email_verified=None
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)

    # Create company
    company = Company(
        name="Test Company",
        industry="Technology",
        company_size="50-200",
        location="Test Location",
        website="https://test.com",
        description="Test company description"
    )
    test_db.add(company)
    await test_db.commit()
    await test_db.refresh(company)

    # Create employer profile
    employer = Employer(
        user_id=user.id,
        company_id=company.id,
        position="HR Manager",
        department="Human Resources"
    )
    test_db.add(employer)
    await test_db.commit()
    await test_db.refresh(employer)

    return user


@pytest.fixture
async def auth_headers_candidate(client: AsyncClient, candidate_user: User) -> dict:
    """Get authentication headers for candidate user"""
    response = await client.post(
        "/api/auth/signin",
        json={
            "email": "candidate@test.com",
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_employer(client: AsyncClient, employer_user: User) -> dict:
    """Get authentication headers for employer user"""
    response = await client.post(
        "/api/auth/signin",
        json={
            "email": "employer@test.com",
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_job(test_db: AsyncSession, employer_user: User) -> Job:
    """Create a test job posting"""
    from sqlalchemy import select

    # Get employer and company
    result = await test_db.execute(
        select(Employer).filter(Employer.user_id == employer_user.id)
    )
    employer = result.scalar_one()

    job = Job(
        company_id=employer.company_id,
        title="Senior Software Engineer",
        description="Test job description",
        requirements="5+ years experience",
        location="Remote",
        location_type="remote",
        job_type="full_time",
        salary_min=80000,
        salary_max=120000,
        status="active"
    )
    test_db.add(job)
    await test_db.commit()
    await test_db.refresh(job)

    return job


# Mock email service to prevent actual email sending in tests
@pytest.fixture(autouse=True)
def mock_email_service(monkeypatch):
    """Mock email service for all tests"""
    async def mock_send_password_reset_email(email: str, token: str, frontend_url: str):
        # Do nothing - just log
        print(f"Mock email sent to {email} with token {token}")
        return True

    from app.services import email_service
    monkeypatch.setattr(
        email_service.EmailService,
        "send_password_reset_email",
        mock_send_password_reset_email
    )
