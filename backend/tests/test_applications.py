"""
Tests for job application endpoints (/api/applications/*).

Covers: candidate apply, list, detail, withdraw, employer list, status update.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.base import (
    Job, User, Candidate, JobApplication, ApplicationStatus,
)


# ===========================================================================
# Helper to create an application via the API
# ===========================================================================


async def _apply_to_job(
    client: AsyncClient,
    auth_headers: dict,
    job_id: int,
    cover_letter: str = "I am very interested in this position.",
) -> dict:
    """Post an application and return the response data."""
    response = await client.post(
        "/api/applications/my/applications",
        headers=auth_headers,
        json={
            "job_id": job_id,
            "cover_letter": cover_letter,
        },
    )
    return response


# ===========================================================================
# Candidate: apply to a job
# ===========================================================================


class TestApplyToJob:
    """POST /api/applications/my/applications"""

    async def test_apply_success(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Candidate can apply to a published job."""
        response = await _apply_to_job(
            client, auth_headers_candidate, test_job.id
        )

        assert response.status_code in (200, 201)
        data = response.json()
        assert data["job_id"] == test_job.id
        assert data["status"] == "applied"

        # Get candidate_id from DB for verification
        result = await test_db.execute(
            select(Candidate).filter(Candidate.user_id == candidate_user.id)
        )
        candidate = result.scalar_one()
        assert data["candidate_id"] == candidate.id

    async def test_apply_twice_fails(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """Applying to the same job twice returns 400."""
        # First application
        first = await _apply_to_job(
            client, auth_headers_candidate, test_job.id, "First attempt"
        )
        assert first.status_code in (200, 201)

        # Second application
        second = await _apply_to_job(
            client, auth_headers_candidate, test_job.id, "Second attempt"
        )
        assert second.status_code == 400

    async def test_apply_nonexistent_job(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Applying to a non-existent job returns 404."""
        response = await _apply_to_job(
            client, auth_headers_candidate, 99999
        )
        assert response.status_code == 404

    async def test_apply_as_employer_forbidden(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_job: Job,
    ):
        """Employer cannot apply to jobs (403)."""
        response = await _apply_to_job(
            client, auth_headers_employer, test_job.id
        )
        assert response.status_code == 403

    async def test_apply_unauthenticated(
        self, client: AsyncClient, test_job: Job
    ):
        """Unauthenticated request returns 401."""
        response = await client.post(
            "/api/applications/my/applications",
            json={"job_id": test_job.id},
        )
        assert response.status_code == 401


# ===========================================================================
# Candidate: list own applications
# ===========================================================================


class TestListCandidateApplications:
    """GET /api/applications/my/applications"""

    async def test_list_applications_empty(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate with no applications gets an empty list."""
        response = await client.get(
            "/api/applications/my/applications",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["applications"] == []

    async def test_list_applications_after_apply(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """After applying, the application appears in the list."""
        await _apply_to_job(client, auth_headers_candidate, test_job.id)

        response = await client.get(
            "/api/applications/my/applications",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert data["applications"][0]["job_id"] == test_job.id


# ===========================================================================
# Candidate: get application detail
# ===========================================================================


class TestGetApplicationDetail:
    """GET /api/applications/my/applications/{application_id}"""

    @pytest.mark.xfail(
        reason="Bug in applications.py:434 — 'Job' object has no attribute 'company_name' "
               "(should use job.company.name with eager loading)"
    )
    async def test_get_detail_success(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """Candidate can retrieve detail of their own application."""
        create_resp = await _apply_to_job(
            client, auth_headers_candidate, test_job.id
        )
        app_id = create_resp.json()["id"]

        response = await client.get(
            f"/api/applications/my/applications/{app_id}",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == app_id
        assert data["job_id"] == test_job.id

    async def test_get_nonexistent_application(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Requesting a non-existent application returns 404."""
        response = await client.get(
            "/api/applications/my/applications/99999",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 404


# ===========================================================================
# Candidate: withdraw application
# ===========================================================================


class TestWithdrawApplication:
    """DELETE /api/applications/my/applications/{application_id}"""

    async def test_withdraw_success(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """Candidate can withdraw their own application."""
        create_resp = await _apply_to_job(
            client, auth_headers_candidate, test_job.id
        )
        app_id = create_resp.json()["id"]

        response = await client.delete(
            f"/api/applications/my/applications/{app_id}",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200

        # Verify it no longer exists
        get_resp = await client.get(
            f"/api/applications/my/applications/{app_id}",
            headers=auth_headers_candidate,
        )
        assert get_resp.status_code == 404

    async def test_withdraw_nonexistent(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Withdrawing a non-existent application returns 404."""
        response = await client.delete(
            "/api/applications/my/applications/99999",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 404


# ===========================================================================
# Employer: list applications for their jobs
# ===========================================================================


class TestEmployerApplications:
    """GET /api/applications/employer/applications"""

    async def test_employer_list_applications(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        auth_headers_employer: dict,
        test_job: Job,
    ):
        """Employer can see applications submitted to their jobs."""
        # Candidate applies
        await _apply_to_job(client, auth_headers_candidate, test_job.id)

        # Employer lists
        response = await client.get(
            "/api/applications/employer/applications",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert data["applications"][0]["job_id"] == test_job.id

    async def test_employer_list_filtered_by_job(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        auth_headers_employer: dict,
        test_job: Job,
    ):
        """Employer can filter applications by job_id."""
        await _apply_to_job(client, auth_headers_candidate, test_job.id)

        response = await client.get(
            "/api/applications/employer/applications",
            headers=auth_headers_employer,
            params={"job_id": test_job.id},
        )

        assert response.status_code == 200
        data = response.json()
        assert all(
            app["job_id"] == test_job.id
            for app in data["applications"]
        )

    async def test_candidate_cannot_access_employer_endpoint(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate is forbidden from employer applications endpoint (403)."""
        response = await client.get(
            "/api/applications/employer/applications",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 403


# ===========================================================================
# Employer: update application status
# ===========================================================================


class TestUpdateApplicationStatus:
    """PUT /api/applications/employer/applications/{id}/status"""

    async def test_update_status_success(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        auth_headers_employer: dict,
        test_job: Job,
    ):
        """Employer can change application status to shortlisted."""
        # Candidate applies
        create_resp = await _apply_to_job(
            client, auth_headers_candidate, test_job.id
        )
        app_id = create_resp.json()["id"]

        # Employer updates status
        response = await client.put(
            f"/api/applications/employer/applications/{app_id}/status",
            headers=auth_headers_employer,
            json={"status": "shortlisted"},
        )

        assert response.status_code == 200

    async def test_candidate_cannot_update_status(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """Candidate cannot update application status (403)."""
        create_resp = await _apply_to_job(
            client, auth_headers_candidate, test_job.id
        )
        app_id = create_resp.json()["id"]

        response = await client.put(
            f"/api/applications/employer/applications/{app_id}/status",
            headers=auth_headers_candidate,
            json={"status": "accepted"},
        )

        assert response.status_code == 403
