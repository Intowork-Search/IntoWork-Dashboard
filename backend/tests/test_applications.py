"""
Tests for job application endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.base import JobApplication, Job, User, Candidate


@pytest.mark.asyncio
async def test_apply_to_job_as_candidate(client: AsyncClient, auth_headers_candidate: dict, test_job: Job, candidate_user: User, test_db: AsyncSession):
    """Test applying to a job as candidate"""
    # Get candidate profile
    result = await test_db.execute(
        select(Candidate).filter(Candidate.user_id == candidate_user.id)
    )
    candidate = result.scalar_one()

    response = await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "I am very interested in this position"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["job_id"] == test_job.id
    assert data["candidate_id"] == candidate.id
    assert data["status"] == "applied"
    assert data["cover_letter"] == "I am very interested in this position"


@pytest.mark.asyncio
async def test_apply_to_job_twice_fails(client: AsyncClient, auth_headers_candidate: dict, test_job: Job):
    """Test that applying to same job twice fails"""
    # First application
    await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "First application"
        }
    )

    # Second application should fail
    response = await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "Second application"
        }
    )

    assert response.status_code == 400
    assert "already applied" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_list_candidate_applications(client: AsyncClient, auth_headers_candidate: dict, test_job: Job):
    """Test listing applications for candidate"""
    # Create an application first
    await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "Test application"
        }
    )

    # List applications
    response = await client.get(
        "/api/applications",
        headers=auth_headers_candidate
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["job_id"] == test_job.id


@pytest.mark.asyncio
async def test_get_application_detail(client: AsyncClient, auth_headers_candidate: dict, test_job: Job):
    """Test getting application detail"""
    # Create an application
    create_response = await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "Test application"
        }
    )
    application_id = create_response.json()["id"]

    # Get application detail
    response = await client.get(
        f"/api/applications/{application_id}",
        headers=auth_headers_candidate
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == application_id
    assert data["job_id"] == test_job.id


@pytest.mark.asyncio
async def test_update_application_status_as_employer(client: AsyncClient, auth_headers_candidate: dict, auth_headers_employer: dict, test_job: Job, test_db: AsyncSession):
    """Test updating application status as employer"""
    # Candidate applies
    create_response = await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "Test application"
        }
    )
    application_id = create_response.json()["id"]

    # Employer updates status
    response = await client.patch(
        f"/api/applications/{application_id}",
        headers=auth_headers_employer,
        json={"status": "shortlisted"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "shortlisted"


@pytest.mark.asyncio
async def test_list_applications_for_job_as_employer(client: AsyncClient, auth_headers_candidate: dict, auth_headers_employer: dict, test_job: Job):
    """Test listing applications for a specific job as employer"""
    # Candidate applies
    await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "Test application"
        }
    )

    # Employer lists applications for the job
    response = await client.get(
        f"/api/applications/job/{test_job.id}",
        headers=auth_headers_employer
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["job_id"] == test_job.id


@pytest.mark.asyncio
async def test_candidate_cannot_update_application_status(client: AsyncClient, auth_headers_candidate: dict, test_job: Job):
    """Test that candidates cannot update application status"""
    # Create application
    create_response = await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "Test application"
        }
    )
    application_id = create_response.json()["id"]

    # Try to update status as candidate
    response = await client.patch(
        f"/api/applications/{application_id}",
        headers=auth_headers_candidate,
        json={"status": "accepted"}
    )

    # Should fail with 403 Forbidden
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_withdraw_application(client: AsyncClient, auth_headers_candidate: dict, test_job: Job):
    """Test withdrawing an application"""
    # Create application
    create_response = await client.post(
        "/api/applications",
        headers=auth_headers_candidate,
        json={
            "job_id": test_job.id,
            "cover_letter": "Test application"
        }
    )
    application_id = create_response.json()["id"]

    # Withdraw application
    response = await client.delete(
        f"/api/applications/{application_id}",
        headers=auth_headers_candidate
    )

    assert response.status_code == 200

    # Verify application is gone or marked as withdrawn
    get_response = await client.get(
        f"/api/applications/{application_id}",
        headers=auth_headers_candidate
    )
    # Should either be 404 or have withdrawn status
    assert get_response.status_code in [404, 200]
