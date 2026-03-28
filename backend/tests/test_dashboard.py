"""
Tests for dashboard endpoints (/api/dashboard).

Covers: candidate dashboard, employer dashboard, admin dashboard.
"""
import pytest
from httpx import AsyncClient

from app.models.base import Job, User


# ===========================================================================
# Candidate dashboard
# ===========================================================================


class TestCandidateDashboard:
    """GET /api/dashboard for candidate users."""

    async def test_dashboard_returns_stats(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
    ):
        """Candidate dashboard returns stats, activities, and profileCompletion."""
        response = await client.get(
            "/api/dashboard",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        data = response.json()

        # Verify structure
        assert "stats" in data
        assert "recentActivities" in data
        assert "profileCompletion" in data

        # Stats should be a list of stat objects
        assert isinstance(data["stats"], list)
        assert len(data["stats"]) > 0

        for stat in data["stats"]:
            assert "title" in stat
            assert "value" in stat
            assert "change" in stat
            assert "changeType" in stat
            assert "color" in stat

    async def test_dashboard_profile_completion(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """profileCompletion is a numeric value between 0 and 100."""
        response = await client.get(
            "/api/dashboard",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        completion = response.json()["profileCompletion"]
        assert isinstance(completion, (int, float))
        assert 0 <= completion <= 100

    async def test_dashboard_shows_applications_count(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """After applying to a job, the dashboard reflects the count."""
        # Apply to a job
        await client.post(
            "/api/applications/my/applications",
            headers=auth_headers_candidate,
            json={
                "job_id": test_job.id,
                "cover_letter": "Test application for dashboard",
            },
        )

        response = await client.get(
            "/api/dashboard",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        stats = response.json()["stats"]

        # Find the "Candidatures envoyees" stat
        applications_stat = next(
            (s for s in stats if "candidature" in s["title"].lower()),
            None,
        )
        assert applications_stat is not None
        assert int(applications_stat["value"]) >= 1


# ===========================================================================
# Employer dashboard
# ===========================================================================


class TestEmployerDashboard:
    """GET /api/dashboard for employer users."""

    async def test_employer_dashboard_stats(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        employer_user: User,
    ):
        """Employer dashboard returns stats about their jobs and applications."""
        response = await client.get(
            "/api/dashboard",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert "recentActivities" in data
        assert "profileCompletion" in data
        assert isinstance(data["stats"], list)

    async def test_employer_dashboard_with_job(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
        test_job: Job,
    ):
        """Employer dashboard shows active jobs count when jobs exist."""
        response = await client.get(
            "/api/dashboard",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        stats = response.json()["stats"]

        # Find the "Offres actives" stat
        jobs_stat = next(
            (s for s in stats if "offre" in s["title"].lower()),
            None,
        )
        assert jobs_stat is not None


# ===========================================================================
# Admin dashboard
# ===========================================================================


class TestAdminDashboard:
    """GET /api/dashboard for admin users."""

    async def test_admin_dashboard(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
    ):
        """Admin dashboard returns platform-wide stats."""
        response = await client.get(
            "/api/dashboard",
            headers=auth_headers_admin,
        )

        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert len(data["stats"]) >= 1

        # Admin dashboard includes platform totals
        stat_titles = [s["title"].lower() for s in data["stats"]]
        assert any("admin" in t or "utilisateur" in t for t in stat_titles)


# ===========================================================================
# Unauthenticated access
# ===========================================================================


class TestDashboardAuth:
    """Authentication requirements for dashboard."""

    async def test_dashboard_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/dashboard")

        assert response.status_code == 401


# ===========================================================================
# Activities endpoint
# ===========================================================================


class TestDashboardActivities:
    """GET /api/dashboard/activities"""

    async def test_activities_returns_list(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Activities endpoint returns a list of recent activities."""
        response = await client.get(
            "/api/dashboard/activities",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        for activity in data:
            assert "id" in activity
            assert "action" in activity
            assert "target" in activity
            assert "time" in activity
            assert "type" in activity
