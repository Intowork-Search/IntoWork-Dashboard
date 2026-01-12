"""
Tests for job endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.base import Job, User


@pytest.mark.asyncio
async def test_list_jobs_unauthenticated(client: AsyncClient, test_job: Job):
    """Test listing jobs without authentication"""
    response = await client.get("/api/jobs")

    assert response.status_code == 200
    data = response.json()
    assert "jobs" in data
    assert "total" in data
    assert len(data["jobs"]) > 0
    # has_applied should not be present for unauthenticated users
    assert "has_applied" not in data["jobs"][0] or data["jobs"][0]["has_applied"] is False


@pytest.mark.asyncio
async def test_list_jobs_authenticated(client: AsyncClient, auth_headers_candidate: dict, test_job: Job):
    """Test listing jobs with authentication"""
    response = await client.get(
        "/api/jobs",
        headers=auth_headers_candidate
    )

    assert response.status_code == 200
    data = response.json()
    assert "jobs" in data
    assert len(data["jobs"]) > 0


@pytest.mark.asyncio
async def test_get_job_detail(client: AsyncClient, test_job: Job):
    """Test getting job detail"""
    response = await client.get(f"/api/jobs/{test_job.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_job.id
    assert data["title"] == test_job.title
    assert data["description"] == test_job.description


@pytest.mark.asyncio
async def test_create_job_as_employer(client: AsyncClient, auth_headers_employer: dict, employer_user: User, test_db: AsyncSession):
    """Test creating job as employer"""
    from sqlalchemy import select
    from app.models.base import Employer

    # Get employer's company_id
    result = await test_db.execute(
        select(Employer).filter(Employer.user_id == employer_user.id)
    )
    employer = result.scalar_one()

    response = await client.post(
        "/api/jobs",
        headers=auth_headers_employer,
        json={
            "company_id": employer.company_id,
            "title": "Backend Developer",
            "description": "Looking for experienced backend developer",
            "requirements": "3+ years Python experience",
            "location": "Remote",
            "location_type": "remote",
            "job_type": "full_time",
            "salary_min": 70000,
            "salary_max": 100000,
            "status": "active"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Backend Developer"
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_create_job_as_candidate_fails(client: AsyncClient, auth_headers_candidate: dict):
    """Test that candidates cannot create jobs"""
    response = await client.post(
        "/api/jobs",
        headers=auth_headers_candidate,
        json={
            "company_id": 1,
            "title": "Test Job",
            "description": "Test description",
            "requirements": "Test requirements",
            "location": "Test Location",
            "location_type": "remote",
            "job_type": "full_time",
            "status": "active"
        }
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_job_as_employer(client: AsyncClient, auth_headers_employer: dict, test_job: Job):
    """Test updating job as employer"""
    response = await client.put(
        f"/api/jobs/{test_job.id}",
        headers=auth_headers_employer,
        json={
            "title": "Updated Senior Software Engineer",
            "description": "Updated description",
            "status": "active"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Senior Software Engineer"


@pytest.mark.asyncio
async def test_delete_job_as_employer(client: AsyncClient, auth_headers_employer: dict, test_job: Job):
    """Test deleting job as employer"""
    response = await client.delete(
        f"/api/jobs/{test_job.id}",
        headers=auth_headers_employer
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_jobs_by_keyword(client: AsyncClient, test_job: Job):
    """Test searching jobs by keyword"""
    response = await client.get(
        "/api/jobs",
        params={"search": "Software"}
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["jobs"]) > 0
    # Verify the job contains the search term
    assert any("software" in job["title"].lower() for job in data["jobs"])


@pytest.mark.asyncio
async def test_filter_jobs_by_location_type(client: AsyncClient, test_job: Job):
    """Test filtering jobs by location type"""
    response = await client.get(
        "/api/jobs",
        params={"location_type": "remote"}
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["jobs"]) > 0
    assert all(job["location_type"] == "remote" for job in data["jobs"])


@pytest.mark.asyncio
async def test_filter_jobs_by_job_type(client: AsyncClient, test_job: Job):
    """Test filtering jobs by job type"""
    response = await client.get(
        "/api/jobs",
        params={"job_type": "full_time"}
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["jobs"]) > 0
    assert all(job["job_type"] == "full_time" for job in data["jobs"])
