"""
Pytest configuration and fixtures for IntoWork Backend tests.

Uses SQLite async in-memory database for complete test isolation
without requiring a running PostgreSQL instance.
"""
import os

# Set NEXTAUTH_SECRET before any app imports that depend on it
os.environ.setdefault("NEXTAUTH_SECRET", "test-secret-key-for-pytest-minimum-32-chars")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient, ASGITransport

# Register JSONB -> TEXT compilation for SQLite before importing models
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.sqlite.base import SQLiteTypeCompiler

# Teach SQLite how to handle PostgreSQL JSONB columns (store as TEXT/JSON)
if not hasattr(SQLiteTypeCompiler, "visit_JSONB"):
    @classmethod  # type: ignore[misc]
    def _visit_jsonb(cls_or_self, type_, **kw):  # noqa: ANN001
        return "TEXT"

    SQLiteTypeCompiler.visit_JSONB = lambda self, type_, **kw: "TEXT"

from app.database import Base, get_db
from app.models.base import (
    User, UserRole, Candidate, Company, Employer,
    Job, JobApplication, JobStatus, JobType, JobLocation,
    ApplicationStatus,
)
from app.auth import Auth, PasswordHasher


# ---------------------------------------------------------------------------
# SQLite async in-memory engine (no external DB required)
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite://"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create a single event loop for the entire test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_engine():
    """Create a fresh SQLite async in-memory engine per test.

    SQLite stores datetimes as naive strings. Many app routes compare
    stored timestamps against ``datetime.now(timezone.utc)``, which
    is timezone-aware. To avoid ``TypeError: can't compare offset-naive
    and offset-aware datetimes`` we register a ``set_result_processor``
    on the sync engine's dialect that auto-attaches UTC to any datetime
    value coming out of SQLite.
    """
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

    # Register an event listener on the sync engine to make datetimes
    # returned by SQLite timezone-aware (UTC).
    from sqlalchemy import event as sa_event
    from datetime import timezone as _tz

    @sa_event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, connection_record):  # noqa: ANN001
        """Enable WAL mode and register a datetime adapter for SQLite."""
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture(scope="function")
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session bound to the in-memory engine."""
    async_session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with async_session_factory() as session:
        yield session


@pytest.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an httpx AsyncClient with the FastAPI app.

    Overrides the get_db dependency so every request uses the test session.
    Also patches the lifespan to skip Redis/Prometheus initialisation.
    """
    from app.main import app

    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Test password (meets all strength requirements)
# ---------------------------------------------------------------------------

TEST_PASSWORD = "SecurePass123!@"


# ---------------------------------------------------------------------------
# User fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
async def candidate_user(test_db: AsyncSession) -> User:
    """Create a test candidate user with an associated Candidate profile."""
    user = User(
        email="candidate@test.com",
        password_hash=PasswordHasher.hash_password(TEST_PASSWORD),
        role=UserRole.CANDIDATE,
        first_name="Test",
        last_name="Candidate",
        name="Test Candidate",
        is_active=True,
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)

    candidate = Candidate(
        user_id=user.id,
        phone="+241001234567",
        location="Libreville",
        title="Software Engineer",
        summary="Test candidate profile summary",
    )
    test_db.add(candidate)
    await test_db.commit()
    await test_db.refresh(candidate)

    return user


@pytest.fixture
async def employer_user(test_db: AsyncSession) -> User:
    """Create a test employer user with Company and Employer profile."""
    user = User(
        email="employer@test.com",
        password_hash=PasswordHasher.hash_password(TEST_PASSWORD),
        role=UserRole.EMPLOYER,
        first_name="Test",
        last_name="Employer",
        name="Test Employer",
        is_active=True,
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)

    company = Company(
        name="Test Company",
        industry="Technology",
        size="50-200",
        city="Libreville",
        country="GA",
        website_url="https://test.com",
        description="Test company description",
    )
    test_db.add(company)
    await test_db.commit()
    await test_db.refresh(company)

    employer = Employer(
        user_id=user.id,
        company_id=company.id,
        position="HR Manager",
        department="Human Resources",
    )
    test_db.add(employer)
    await test_db.commit()
    await test_db.refresh(employer)

    return user


@pytest.fixture
async def admin_user(test_db: AsyncSession) -> User:
    """Create a test admin user."""
    user = User(
        email="admin@test.com",
        password_hash=PasswordHasher.hash_password(TEST_PASSWORD),
        role=UserRole.ADMIN,
        first_name="Test",
        last_name="Admin",
        name="Test Admin",
        is_active=True,
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Token / auth header fixtures
# ---------------------------------------------------------------------------


def _make_token(user: User) -> str:
    """Create a JWT access token for a user."""
    return Auth.create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role.value,
    )


@pytest.fixture
def candidate_token(candidate_user: User) -> str:
    """Return a valid JWT access token for the candidate user."""
    return _make_token(candidate_user)


@pytest.fixture
def employer_token(employer_user: User) -> str:
    """Return a valid JWT access token for the employer user."""
    return _make_token(employer_user)


@pytest.fixture
def admin_token(admin_user: User) -> str:
    """Return a valid JWT access token for the admin user."""
    return _make_token(admin_user)


@pytest.fixture
def auth_headers_candidate(candidate_token: str) -> dict:
    """Authorization headers for the candidate user."""
    return {"Authorization": f"Bearer {candidate_token}"}


@pytest.fixture
def auth_headers_employer(employer_token: str) -> dict:
    """Authorization headers for the employer user."""
    return {"Authorization": f"Bearer {employer_token}"}


@pytest.fixture
def auth_headers_admin(admin_token: str) -> dict:
    """Authorization headers for the admin user."""
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------------------------------------------------------------------
# Job fixture
# ---------------------------------------------------------------------------


@pytest.fixture
async def test_job(test_db: AsyncSession, employer_user: User) -> Job:
    """Create a published test job linked to the employer user."""
    from sqlalchemy import select

    result = await test_db.execute(
        select(Employer).filter(Employer.user_id == employer_user.id)
    )
    employer = result.scalar_one()

    from datetime import datetime, timezone

    job = Job(
        employer_id=employer.id,
        company_id=employer.company_id,
        title="Senior Software Engineer",
        description="We are looking for a senior software engineer to join our team.",
        requirements="5+ years experience in Python",
        location="Libreville",
        location_type=JobLocation.REMOTE,
        job_type=JobType.FULL_TIME,
        salary_min=80000,
        salary_max=120000,
        currency="XAF",
        country="GA",
        status=JobStatus.PUBLISHED,
        posted_at=datetime.now(timezone.utc),
        views_count=0,
        applications_count=0,
    )
    test_db.add(job)
    await test_db.commit()
    await test_db.refresh(job)
    return job


# ---------------------------------------------------------------------------
# Mock external services (autouse)
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def mock_email_service(monkeypatch):
    """Prevent real emails from being sent during tests."""
    mock_send = AsyncMock(return_value=True)
    mock_send_template = AsyncMock(return_value=True)

    # Import the email_service module directly (not via app.services.__init__)
    import app.services.email_service as email_svc_module

    monkeypatch.setattr(
        email_svc_module.email_service,
        "send_password_reset_email",
        mock_send,
    )
    # Also mock send_from_template used in applications
    if hasattr(email_svc_module.email_service, "send_from_template"):
        monkeypatch.setattr(
            email_svc_module.email_service,
            "send_from_template",
            mock_send_template,
        )
    return mock_send


@pytest.fixture(autouse=True)
def mock_redis_cache(monkeypatch):
    """Prevent Redis connections during tests."""
    from app import cache as cache_module

    monkeypatch.setattr(cache_module.cache, "_is_available", False)
    monkeypatch.setattr(cache_module.cache, "connect", AsyncMock())
    monkeypatch.setattr(cache_module.cache, "disconnect", AsyncMock())


@pytest.fixture(autouse=True)
def disable_rate_limiter():
    """Disable all SlowAPI rate limiters during tests."""
    from app.rate_limiter import limiter as global_limiter

    global_limiter.enabled = False

    # auth_routes.py creates its own Limiter instance
    try:
        from app.api.auth_routes import limiter as auth_limiter
        auth_limiter.enabled = False
    except ImportError:
        pass

    yield

    global_limiter.enabled = True
    try:
        from app.api.auth_routes import limiter as auth_limiter
        auth_limiter.enabled = True
    except ImportError:
        pass
