"""
Tests for job endpoints (/api/jobs/*).

Covers: list, detail, create, update, delete, search, filters.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.base import Job, User, Employer


# ===========================================================================
# List jobs (public)
# ===========================================================================


class TestListJobs:
    """GET /api/jobs/"""

    async def test_list_jobs_returns_published(
        self, client: AsyncClient, test_job: Job
    ):
        """Published jobs appear in the public listing."""
        response = await client.get("/api/jobs/")

        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert "total" in data
        assert "page" in data
        assert "total_pages" in data
        assert data["total"] >= 1
        assert len(data["jobs"]) >= 1

    async def test_list_jobs_authenticated(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """Authenticated candidate can list jobs (has_applied field present)."""
        response = await client.get(
            "/api/jobs/", headers=auth_headers_candidate
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["jobs"]) >= 1
        # has_applied should be False since candidate hasn't applied
        assert data["jobs"][0]["has_applied"] is False

    async def test_list_jobs_empty_when_no_published(
        self, client: AsyncClient
    ):
        """Empty database returns zero jobs."""
        response = await client.get("/api/jobs/")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["jobs"] == []


# ===========================================================================
# Search and filters
# ===========================================================================


class TestJobSearch:
    """GET /api/jobs/ with query parameters"""

    async def test_search_by_keyword(
        self, client: AsyncClient, test_job: Job
    ):
        """Search by title keyword returns matching jobs."""
        response = await client.get(
            "/api/jobs/", params={"search": "Software"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert any(
            "software" in job["title"].lower() for job in data["jobs"]
        )

    async def test_search_no_results(
        self, client: AsyncClient, test_job: Job
    ):
        """Search with a non-matching keyword returns zero jobs."""
        response = await client.get(
            "/api/jobs/", params={"search": "ZzzNonExistentXxx"}
        )

        assert response.status_code == 200
        assert response.json()["total"] == 0

    async def test_filter_by_job_type(
        self, client: AsyncClient, test_job: Job
    ):
        """Filter by job_type returns only matching jobs."""
        response = await client.get(
            "/api/jobs/", params={"job_type": "full_time"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert all(
            job["job_type"] == "full_time" for job in data["jobs"]
        )

    async def test_filter_by_location_type(
        self, client: AsyncClient, test_job: Job
    ):
        """Filter by location_type returns only matching jobs."""
        response = await client.get(
            "/api/jobs/", params={"location_type": "remote"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert all(
            job["location_type"] == "remote" for job in data["jobs"]
        )

    async def test_filter_by_country(
        self, client: AsyncClient, test_job: Job
    ):
        """Filter by country ISO code returns only matching jobs."""
        response = await client.get(
            "/api/jobs/", params={"country": "GA"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    async def test_pagination(
        self, client: AsyncClient, test_job: Job
    ):
        """Pagination parameters are respected."""
        response = await client.get(
            "/api/jobs/", params={"page": 1, "limit": 1}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 1
        assert len(data["jobs"]) <= 1


# ===========================================================================
# Job detail
# ===========================================================================


class TestJobDetail:
    """GET /api/jobs/{job_id}"""

    async def test_get_job_detail(
        self, client: AsyncClient, test_job: Job
    ):
        """Retrieve full details for a published job."""
        response = await client.get(f"/api/jobs/{test_job.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_job.id
        assert data["title"] == test_job.title
        assert "description" in data
        assert "requirements" in data
        assert "company_name" in data
        assert "status" in data

    async def test_get_nonexistent_job(self, client: AsyncClient):
        """Requesting a non-existent job returns 404."""
        response = await client.get("/api/jobs/99999")

        assert response.status_code == 404


# ===========================================================================
# Create job (employer only)
# ===========================================================================


class TestCreateJob:
    """POST /api/jobs/create"""

    async def test_create_job_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Authenticated employer can create a job."""
        response = await client.post(
            "/api/jobs/create",
            headers=auth_headers_employer,
            json={
                "title": "Backend Developer",
                "description": "Looking for an experienced backend developer.",
                "requirements": "3+ years Python experience",
                "location": "Libreville",
                "location_type": "remote",
                "job_type": "full_time",
                "salary_min": 70000,
                "salary_max": 100000,
                "currency": "XAF",
                "country": "GA",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Backend Developer"
        assert data["job_type"] == "full_time"
        assert data["company_name"] == "Test Company"

    async def test_create_job_as_candidate_forbidden(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Candidates cannot create jobs (403)."""
        response = await client.post(
            "/api/jobs/create",
            headers=auth_headers_candidate,
            json={
                "title": "Fake Job",
                "description": "Should be rejected",
                "location_type": "remote",
                "job_type": "full_time",
            },
        )

        assert response.status_code == 403

    async def test_create_job_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.post(
            "/api/jobs/create",
            json={
                "title": "Unauthenticated Job",
                "description": "No token",
                "location_type": "remote",
                "job_type": "full_time",
            },
        )

        assert response.status_code == 401

    async def test_create_job_invalid_job_type(
        self, client: AsyncClient, auth_headers_employer: dict
    ):
        """Invalid job_type returns 400."""
        response = await client.post(
            "/api/jobs/create",
            headers=auth_headers_employer,
            json={
                "title": "Bad Job Type",
                "description": "Invalid type",
                "location_type": "remote",
                "job_type": "invalid_type",
            },
        )

        assert response.status_code == 400


# ===========================================================================
# Update job (employer owner only)
# ===========================================================================


class TestUpdateJob:
    """PUT /api/jobs/{job_id}"""

    async def test_update_job_as_owner(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_job: Job,
    ):
        """Employer who owns the job can update it."""
        response = await client.put(
            f"/api/jobs/{test_job.id}",
            headers=auth_headers_employer,
            json={
                "title": "Updated Software Engineer",
                "description": "Updated description for the role.",
                "location_type": "hybrid",
                "job_type": "full_time",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Software Engineer"

    async def test_update_job_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """Candidate cannot update a job (403)."""
        response = await client.put(
            f"/api/jobs/{test_job.id}",
            headers=auth_headers_candidate,
            json={
                "title": "Hacked",
                "description": "Should fail",
                "location_type": "remote",
                "job_type": "full_time",
            },
        )

        assert response.status_code == 403

    async def test_update_nonexistent_job(
        self, client: AsyncClient, auth_headers_employer: dict
    ):
        """Updating a non-existent job returns 404."""
        response = await client.put(
            "/api/jobs/99999",
            headers=auth_headers_employer,
            json={
                "title": "Ghost",
                "description": "Does not exist",
                "location_type": "remote",
                "job_type": "full_time",
            },
        )

        assert response.status_code == 404


# ===========================================================================
# Delete job (employer owner only)
# ===========================================================================


class TestDeleteJob:
    """DELETE /api/jobs/{job_id}"""

    async def test_delete_job_as_owner(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_job: Job,
    ):
        """Employer who owns the job can delete it (204)."""
        response = await client.delete(
            f"/api/jobs/{test_job.id}",
            headers=auth_headers_employer,
        )

        assert response.status_code == 204

    async def test_delete_job_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """Candidate cannot delete a job (403)."""
        response = await client.delete(
            f"/api/jobs/{test_job.id}",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 403

    async def test_delete_nonexistent_job(
        self, client: AsyncClient, auth_headers_employer: dict
    ):
        """Deleting a non-existent job returns 404."""
        response = await client.delete(
            "/api/jobs/99999",
            headers=auth_headers_employer,
        )

        assert response.status_code == 404
