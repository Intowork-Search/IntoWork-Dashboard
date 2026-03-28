"""
Tests for interview endpoints (/api/interviews/*).

Covers: create, list, detail, update, delete, status update,
        interviews by application, role-based access.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta

from app.models.base import (
    User,
    Candidate,
    Employer,
    Job,
    JobApplication,
    ApplicationStatus,
    InterviewSchedule,
    InterviewScheduleStatus,
)

pytestmark = pytest.mark.asyncio


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _create_application(
    db: AsyncSession,
    candidate_user: User,
    test_job: Job,
) -> JobApplication:
    """Create a JobApplication tied to the candidate and the test job."""
    result = await db.execute(
        select(Candidate).filter(Candidate.user_id == candidate_user.id)
    )
    candidate = result.scalar_one()

    application = JobApplication(
        job_id=test_job.id,
        candidate_id=candidate.id,
        status=ApplicationStatus.APPLIED,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


def _interview_payload(application_id: int) -> dict:
    """Return a valid interview creation payload."""
    scheduled = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    return {
        "application_id": application_id,
        "title": "Entretien technique - Python",
        "description": "Entretien technique de 60 minutes",
        "location": "Remote",
        "meeting_link": "https://meet.google.com/abc-defg-hij",
        "scheduled_at": scheduled,
        "duration_minutes": 60,
        "timezone": "Africa/Libreville",
        "candidate_email": "candidate@test.com",
    }


# ===========================================================================
# Create interview (employer only)
# ===========================================================================


class TestCreateInterview:
    """POST /api/interviews/"""

    async def test_create_interview_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.post("/api/interviews/", json=_interview_payload(1))
        assert response.status_code == 401

    async def test_create_interview_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidates cannot create interviews (403)."""
        response = await client.post(
            "/api/interviews/",
            headers=auth_headers_candidate,
            json=_interview_payload(1),
        )
        assert response.status_code == 403

    async def test_create_interview_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can create an interview for a valid application."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        response = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["application_id"] == application.id
        assert data["title"] == payload["title"]
        assert data["candidate_email"] == "candidate@test.com"
        assert data["status"] == "scheduled"
        assert data["duration_minutes"] == 60

    async def test_create_interview_nonexistent_application(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Creating an interview for a non-existent application returns 404."""
        response = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=_interview_payload(99999),
        )
        assert response.status_code == 404

    async def test_create_interview_resolves_candidate_email(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """When candidate_email is omitted, the backend resolves it from the candidate profile."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)
        del payload["candidate_email"]

        response = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["candidate_email"] == candidate_user.email


# ===========================================================================
# List interviews (role-aware)
# ===========================================================================


class TestListInterviews:
    """GET /api/interviews/"""

    async def test_list_interviews_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/interviews/")
        assert response.status_code == 401

    async def test_list_interviews_empty_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer with no interviews gets an empty paginated list."""
        response = await client.get(
            "/api/interviews/", headers=auth_headers_employer
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["interviews"] == []
        assert "page" in data
        assert "total_pages" in data

    async def test_list_interviews_as_employer_with_data(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer sees interviews tied to their jobs."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )

        response = await client.get(
            "/api/interviews/", headers=auth_headers_employer
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["interviews"]) >= 1

    async def test_list_interviews_as_candidate(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate sees interviews tied to their applications."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        # Create an interview as the employer
        await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )

        # Candidate lists their interviews
        response = await client.get(
            "/api/interviews/", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    async def test_list_interviews_filter_by_status(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Filtering by status returns only matching interviews."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )

        # Filter for scheduled interviews (should find at least one)
        response = await client.get(
            "/api/interviews/",
            headers=auth_headers_employer,
            params={"status": "scheduled"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

        # Filter for completed interviews (should find none)
        response = await client.get(
            "/api/interviews/",
            headers=auth_headers_employer,
            params={"status": "completed"},
        )
        assert response.status_code == 200
        assert response.json()["total"] == 0

    async def test_list_interviews_invalid_status_filter(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Invalid status filter returns 400."""
        response = await client.get(
            "/api/interviews/",
            headers=auth_headers_employer,
            params={"status": "invalid_status"},
        )
        assert response.status_code == 400


# ===========================================================================
# Get interview detail
# ===========================================================================


class TestGetInterview:
    """GET /api/interviews/{interview_id}"""

    async def test_get_interview_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/interviews/1")
        assert response.status_code == 401

    async def test_get_interview_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Non-existent interview returns 404."""
        response = await client.get(
            "/api/interviews/99999", headers=auth_headers_employer
        )
        assert response.status_code == 404

    async def test_get_interview_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can retrieve an interview they own."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.get(
            f"/api/interviews/{interview_id}",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == interview_id
        assert data["title"] == payload["title"]
        assert data["meeting_link"] == payload["meeting_link"]

    async def test_get_interview_as_candidate(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate can retrieve an interview for their own application."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.get(
            f"/api/interviews/{interview_id}",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 200
        assert response.json()["id"] == interview_id


# ===========================================================================
# Update interview (employer only)
# ===========================================================================


class TestUpdateInterview:
    """PUT /api/interviews/{interview_id}"""

    async def test_update_interview_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.put(
            "/api/interviews/1", json={"title": "Updated"}
        )
        assert response.status_code == 401

    async def test_update_interview_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidates cannot update interviews (403)."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.put(
            f"/api/interviews/{interview_id}",
            headers=auth_headers_candidate,
            json={"title": "Hacked title"},
        )
        assert response.status_code == 403

    async def test_update_interview_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can update their own interview."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.put(
            f"/api/interviews/{interview_id}",
            headers=auth_headers_employer,
            json={"title": "Entretien RH - Mise a jour", "duration_minutes": 90},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Entretien RH - Mise a jour"
        assert data["duration_minutes"] == 90

    async def test_update_interview_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Updating a non-existent interview returns 404."""
        response = await client.put(
            "/api/interviews/99999",
            headers=auth_headers_employer,
            json={"title": "Ghost"},
        )
        assert response.status_code == 404


# ===========================================================================
# Delete interview (employer only)
# ===========================================================================


class TestDeleteInterview:
    """DELETE /api/interviews/{interview_id}"""

    async def test_delete_interview_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.delete("/api/interviews/1")
        assert response.status_code == 401

    async def test_delete_interview_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidates cannot delete interviews (403)."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.delete(
            f"/api/interviews/{interview_id}",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    async def test_delete_interview_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can delete their own interview (204)."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.delete(
            f"/api/interviews/{interview_id}",
            headers=auth_headers_employer,
        )
        assert response.status_code == 204

        # Verify it is actually deleted
        get_resp = await client.get(
            f"/api/interviews/{interview_id}",
            headers=auth_headers_employer,
        )
        assert get_resp.status_code == 404

    async def test_delete_interview_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Deleting a non-existent interview returns 404."""
        response = await client.delete(
            "/api/interviews/99999",
            headers=auth_headers_employer,
        )
        assert response.status_code == 404


# ===========================================================================
# Update interview status
# ===========================================================================


class TestUpdateInterviewStatus:
    """PATCH /api/interviews/{interview_id}/status"""

    async def test_update_status_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.patch(
            "/api/interviews/1/status", json={"status": "confirmed"}
        )
        assert response.status_code == 401

    async def test_update_status_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can set any valid status on their interview."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.patch(
            f"/api/interviews/{interview_id}/status",
            headers=auth_headers_employer,
            json={"status": "completed"},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "completed"

    async def test_candidate_can_confirm_interview(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate can confirm an interview for their application."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.patch(
            f"/api/interviews/{interview_id}/status",
            headers=auth_headers_candidate,
            json={"status": "confirmed"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "confirmed"
        assert data["confirmation_received"] is True

    async def test_candidate_can_cancel_interview(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate can cancel an interview for their application."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.patch(
            f"/api/interviews/{interview_id}/status",
            headers=auth_headers_candidate,
            json={"status": "canceled"},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "canceled"

    async def test_candidate_cannot_complete_interview(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidates cannot mark an interview as completed (403)."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.patch(
            f"/api/interviews/{interview_id}/status",
            headers=auth_headers_candidate,
            json={"status": "completed"},
        )
        assert response.status_code == 403

    async def test_update_status_invalid_value(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Invalid status value returns 400."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        create_resp = await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        interview_id = create_resp.json()["id"]

        response = await client.patch(
            f"/api/interviews/{interview_id}/status",
            headers=auth_headers_employer,
            json={"status": "nonexistent_status"},
        )
        assert response.status_code == 400

    async def test_update_status_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Updating status of a non-existent interview returns 404."""
        response = await client.patch(
            "/api/interviews/99999/status",
            headers=auth_headers_employer,
            json={"status": "confirmed"},
        )
        assert response.status_code == 404


# ===========================================================================
# Get interviews for application
# ===========================================================================


class TestInterviewsByApplication:
    """GET /api/interviews/application/{application_id}"""

    async def test_interviews_by_application_unauthenticated(
        self, client: AsyncClient
    ):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/interviews/application/1")
        assert response.status_code == 401

    async def test_interviews_by_application_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Non-existent application returns 404."""
        response = await client.get(
            "/api/interviews/application/99999",
            headers=auth_headers_employer,
        )
        assert response.status_code == 404

    async def test_interviews_by_application_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can list interviews for an application they own."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        # Create two interviews for the same application
        await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )
        payload_2 = _interview_payload(application.id)
        payload_2["title"] = "Entretien final - Direction"
        await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload_2,
        )

        response = await client.get(
            f"/api/interviews/application/{application.id}",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["interviews"]) == 2

    async def test_interviews_by_application_as_candidate(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate can list interviews for their own application."""
        application = await _create_application(test_db, candidate_user, test_job)
        payload = _interview_payload(application.id)

        await client.post(
            "/api/interviews/",
            headers=auth_headers_employer,
            json=payload,
        )

        response = await client.get(
            f"/api/interviews/application/{application.id}",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
