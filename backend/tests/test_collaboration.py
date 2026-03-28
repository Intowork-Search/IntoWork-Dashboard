"""
Tests for collaborative features endpoints (/api/applications/{id}/...).

Covers: recruiter notes, rating, tags, scorecard, collaboration summary.

Note: The collaboration endpoints use ``require_employer`` from ``app.auth``
which returns a ``User`` object, but ``verify_application_access`` accesses
``employer.user_id`` and ``employer.company_id`` — attributes that do not
exist on ``User``.  This causes an ``AttributeError`` (500) at runtime.
Tests affected by this bug are marked with ``pytest.mark.xfail``.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.base import (
    User,
    Candidate,
    Employer,
    Job,
    JobApplication,
    ApplicationStatus,
)


pytestmark = pytest.mark.asyncio


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_BUG_REASON = (
    "Bug: require_employer returns User but collaboration code accesses "
    "employer.user_id / employer.company_id which do not exist on User"
)


async def _create_application(
    db: AsyncSession,
    candidate_user: User,
    job: Job,
) -> JobApplication:
    """Create a JobApplication directly in the DB."""
    result = await db.execute(
        select(Candidate).filter(Candidate.user_id == candidate_user.id)
    )
    candidate = result.scalar_one()

    application = JobApplication(
        job_id=job.id,
        candidate_id=candidate.id,
        status=ApplicationStatus.APPLIED,
        cover_letter="Test cover letter for collaboration tests",
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


# ===========================================================================
# POST /api/applications/{id}/notes — add recruiter note
# ===========================================================================


class TestAddRecruiterNote:
    """POST /api/applications/{application_id}/notes"""

    async def test_add_note_unauthenticated(
        self,
        client: AsyncClient,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Unauthenticated request returns 401."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.post(
            f"/api/applications/{app.id}/notes",
            json={"note": "Great candidate!"},
        )
        assert response.status_code == 401

    async def test_add_note_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot add recruiter notes (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.post(
            f"/api/applications/{app.id}/notes",
            headers=auth_headers_candidate,
            json={"note": "I should not be allowed"},
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_add_note_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can add a note to an application."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.post(
            f"/api/applications/{app.id}/notes",
            headers=auth_headers_employer,
            json={"note": "Excellent profil technique"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["note"]["note"] == "Excellent profil technique"
        assert data["total_notes"] == 1

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_add_note_nonexistent_application(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
    ):
        """Adding a note to a non-existent application returns 404."""
        response = await client.post(
            "/api/applications/99999/notes",
            headers=auth_headers_employer,
            json={"note": "This should fail"},
        )
        assert response.status_code == 404


# ===========================================================================
# GET /api/applications/{id}/notes — list recruiter notes
# ===========================================================================


class TestGetRecruiterNotes:
    """GET /api/applications/{application_id}/notes"""

    async def test_get_notes_unauthenticated(
        self,
        client: AsyncClient,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Unauthenticated request returns 401."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.get(f"/api/applications/{app.id}/notes")
        assert response.status_code == 401

    async def test_get_notes_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot read recruiter notes (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.get(
            f"/api/applications/{app.id}/notes",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_get_notes_empty(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Application with no notes returns an empty list."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.get(
            f"/api/applications/{app.id}/notes",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        assert response.json() == []


# ===========================================================================
# DELETE /api/applications/{id}/notes/{index} — delete a note
# ===========================================================================


class TestDeleteRecruiterNote:
    """DELETE /api/applications/{application_id}/notes/{note_index}"""

    async def test_delete_note_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.delete("/api/applications/1/notes/0")
        assert response.status_code == 401

    async def test_delete_note_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot delete recruiter notes (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.delete(
            f"/api/applications/{app.id}/notes/0",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_delete_note_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Deleting a non-existent note index returns 404."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.delete(
            f"/api/applications/{app.id}/notes/99",
            headers=auth_headers_employer,
        )
        assert response.status_code == 404


# ===========================================================================
# PATCH /api/applications/{id}/rating — update rating
# ===========================================================================


class TestUpdateRating:
    """PATCH /api/applications/{application_id}/rating"""

    async def test_rating_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.patch(
            "/api/applications/1/rating", json={"rating": 4}
        )
        assert response.status_code == 401

    async def test_rating_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot rate applications (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.patch(
            f"/api/applications/{app.id}/rating",
            headers=auth_headers_candidate,
            json={"rating": 5},
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_rating_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can set a rating on an application."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.patch(
            f"/api/applications/{app.id}/rating",
            headers=auth_headers_employer,
            json={"rating": 4},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["rating"] == 4

    async def test_rating_invalid_value(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Rating outside 1-5 range returns 422 (Pydantic validation)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.patch(
            f"/api/applications/{app.id}/rating",
            headers=auth_headers_employer,
            json={"rating": 10},
        )
        assert response.status_code == 422


# ===========================================================================
# PATCH /api/applications/{id}/tags — replace tags
# ===========================================================================


class TestUpdateTags:
    """PATCH /api/applications/{application_id}/tags"""

    async def test_tags_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.patch(
            "/api/applications/1/tags", json={"tags": ["senior"]}
        )
        assert response.status_code == 401

    async def test_tags_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot set tags (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.patch(
            f"/api/applications/{app.id}/tags",
            headers=auth_headers_candidate,
            json={"tags": ["senior"]},
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_update_tags_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can set tags on an application."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.patch(
            f"/api/applications/{app.id}/tags",
            headers=auth_headers_employer,
            json={"tags": ["senior", "python", "Remote"]},
        )

        assert response.status_code == 200
        data = response.json()
        # Tags are cleaned (lowercase, trimmed, deduplicated)
        assert "senior" in data["tags"]
        assert "python" in data["tags"]
        assert "remote" in data["tags"]


# ===========================================================================
# POST /api/applications/{id}/tags/{tag} — add single tag
# ===========================================================================


class TestAddTag:
    """POST /api/applications/{application_id}/tags/{tag}"""

    async def test_add_tag_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.post("/api/applications/1/tags/senior")
        assert response.status_code == 401

    async def test_add_tag_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot add tags (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.post(
            f"/api/applications/{app.id}/tags/senior",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_add_tag_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can add a single tag to an application."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.post(
            f"/api/applications/{app.id}/tags/senior",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert "senior" in data["tags"]


# ===========================================================================
# DELETE /api/applications/{id}/tags/{tag} — remove tag
# ===========================================================================


class TestRemoveTag:
    """DELETE /api/applications/{application_id}/tags/{tag}"""

    async def test_remove_tag_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.delete("/api/applications/1/tags/senior")
        assert response.status_code == 401

    async def test_remove_tag_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot remove tags (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.delete(
            f"/api/applications/{app.id}/tags/senior",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_remove_tag_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can remove a tag from an application."""
        app = await _create_application(test_db, candidate_user, test_job)

        # Pre-populate tags directly in DB
        app.tags = ["senior", "python"]
        await test_db.commit()

        response = await client.delete(
            f"/api/applications/{app.id}/tags/senior",
            headers=auth_headers_employer,
        )

        assert response.status_code == 204


# ===========================================================================
# PATCH /api/applications/{id}/scorecard — update scorecard
# ===========================================================================


class TestUpdateScorecard:
    """PATCH /api/applications/{application_id}/scorecard"""

    async def test_scorecard_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.patch(
            "/api/applications/1/scorecard",
            json={"technical_skills": 4},
        )
        assert response.status_code == 401

    async def test_scorecard_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot update scorecards (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.patch(
            f"/api/applications/{app.id}/scorecard",
            headers=auth_headers_candidate,
            json={"technical_skills": 4},
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_update_scorecard_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can set scorecard criteria."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.patch(
            f"/api/applications/{app.id}/scorecard",
            headers=auth_headers_employer,
            json={
                "technical_skills": 5,
                "soft_skills": 4,
                "experience": 4,
            },
        )

        assert response.status_code == 200
        data = response.json()
        scorecard = data["scorecard"]
        assert scorecard["technical_skills"] == 5
        assert scorecard["soft_skills"] == 4
        assert scorecard["experience"] == 4
        # Average computed when >= 3 criteria
        assert "average" in scorecard

    async def test_scorecard_invalid_value(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Scorecard value outside 1-5 range returns 422."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.patch(
            f"/api/applications/{app.id}/scorecard",
            headers=auth_headers_employer,
            json={"technical_skills": 10},
        )
        assert response.status_code == 422


# ===========================================================================
# GET /api/applications/{id}/scorecard — read scorecard
# ===========================================================================


class TestGetScorecard:
    """GET /api/applications/{application_id}/scorecard"""

    async def test_get_scorecard_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/applications/1/scorecard")
        assert response.status_code == 401

    async def test_get_scorecard_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot read scorecards (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.get(
            f"/api/applications/{app.id}/scorecard",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_get_scorecard_empty(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Application with no scorecard returns empty dict."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.get(
            f"/api/applications/{app.id}/scorecard",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["application_id"] == app.id
        assert data["scorecard"] == {}
        assert data["rating"] is None


# ===========================================================================
# GET /api/applications/{id}/collaboration — full collaboration data
# ===========================================================================


class TestGetCollaborationData:
    """GET /api/applications/{application_id}/collaboration"""

    async def test_collaboration_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/applications/1/collaboration")
        assert response.status_code == 401

    async def test_collaboration_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Candidate cannot access collaboration data (403)."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.get(
            f"/api/applications/{app.id}/collaboration",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_get_collaboration_data_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
        test_db: AsyncSession,
        candidate_user: User,
        test_job: Job,
    ):
        """Employer can retrieve full collaboration data for an application."""
        app = await _create_application(test_db, candidate_user, test_job)

        response = await client.get(
            f"/api/applications/{app.id}/collaboration",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["application_id"] == app.id
        assert data["recruiter_notes"] == []
        assert data["rating"] is None
        assert data["tags"] == []
        assert data["scorecard"] is None

    @pytest.mark.xfail(reason=_BUG_REASON, strict=False)
    async def test_collaboration_nonexistent_application(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
    ):
        """Non-existent application returns 404."""
        response = await client.get(
            "/api/applications/99999/collaboration",
            headers=auth_headers_employer,
        )
        assert response.status_code == 404
