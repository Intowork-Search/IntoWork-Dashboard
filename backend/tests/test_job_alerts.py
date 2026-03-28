"""
Tests for Job Alerts endpoints (/api/job-alerts/*).

Covers: create, list, get, update, delete, toggle, preview, stats.
Job alerts are candidate-only — employers and unauthenticated users get 401/403.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Job, User


pytestmark = pytest.mark.asyncio


# ---------------------------------------------------------------------------
# Reusable helpers
# ---------------------------------------------------------------------------

def _alert_create_payload(
    *,
    name: str = "Python Jobs Libreville",
    keywords: list[str] | None = None,
    location: str | None = "Libreville",
    frequency: str = "daily",
) -> dict:
    """Build a valid POST /api/job-alerts/ body."""
    criteria: dict = {}
    if keywords is not None:
        criteria["keywords"] = keywords
    if location is not None:
        criteria["location"] = location
    return {
        "name": name,
        "criteria": criteria,
        "frequency": frequency,
    }


async def _create_alert(
    client: AsyncClient,
    headers: dict,
    **kwargs,
) -> dict:
    """Helper: create a job alert and return the response JSON."""
    payload = _alert_create_payload(**kwargs)
    resp = await client.post("/api/job-alerts/", json=payload, headers=headers)
    assert resp.status_code == 201, resp.text
    return resp.json()


# ===========================================================================
# Create job alert
# ===========================================================================


class TestCreateJobAlert:
    """POST /api/job-alerts/"""

    async def test_create_unauthenticated(self, client: AsyncClient):
        payload = _alert_create_payload()
        response = await client.post("/api/job-alerts/", json=payload)
        assert response.status_code == 401

    async def test_create_as_employer_forbidden(
        self, client: AsyncClient, auth_headers_employer: dict
    ):
        """Employers cannot create job alerts (403)."""
        payload = _alert_create_payload()
        response = await client.post(
            "/api/job-alerts/", json=payload, headers=auth_headers_employer
        )
        assert response.status_code == 403

    async def test_create_success(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        data = await _create_alert(client, auth_headers_candidate)

        assert "id" in data
        assert data["name"] == "Python Jobs Libreville"
        assert data["frequency"] == "daily"
        assert data["is_active"] is True
        assert data["jobs_sent_count"] == 0
        assert data["criteria"]["location"] == "Libreville"

    async def test_create_with_keywords(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        data = await _create_alert(
            client,
            auth_headers_candidate,
            keywords=["python", "backend"],
            name="Dev Backend",
        )
        assert data["criteria"]["keywords"] == ["python", "backend"]

    async def test_create_weekly_frequency(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        data = await _create_alert(
            client, auth_headers_candidate, frequency="weekly"
        )
        assert data["frequency"] == "weekly"

    async def test_create_empty_name_rejected(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Empty name violates min_length=1 validation."""
        payload = _alert_create_payload(name="")
        # Override name to empty string — Pydantic should reject it
        payload["name"] = ""
        response = await client.post(
            "/api/job-alerts/", json=payload, headers=auth_headers_candidate
        )
        assert response.status_code == 422


# ===========================================================================
# List job alerts
# ===========================================================================


class TestListJobAlerts:
    """GET /api/job-alerts/"""

    async def test_list_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/job-alerts/")
        assert response.status_code == 401

    async def test_list_as_employer_forbidden(
        self, client: AsyncClient, auth_headers_employer: dict
    ):
        response = await client.get(
            "/api/job-alerts/", headers=auth_headers_employer
        )
        assert response.status_code == 403

    async def test_list_empty(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/job-alerts/", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        assert response.json() == []

    async def test_list_returns_created_alerts(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        await _create_alert(client, auth_headers_candidate, name="Alert 1")
        await _create_alert(client, auth_headers_candidate, name="Alert 2")

        response = await client.get(
            "/api/job-alerts/", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        names = {a["name"] for a in data}
        assert "Alert 1" in names
        assert "Alert 2" in names

    async def test_list_filter_active(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Filter by is_active=true returns only active alerts."""
        await _create_alert(client, auth_headers_candidate, name="Active One")

        response = await client.get(
            "/api/job-alerts/",
            params={"is_active": True},
            headers=auth_headers_candidate,
        )
        assert response.status_code == 200
        data = response.json()
        assert all(a["is_active"] for a in data)


# ===========================================================================
# Update job alert
# ===========================================================================


class TestUpdateJobAlert:
    """PATCH /api/job-alerts/{alert_id}"""

    async def test_update_unauthenticated(self, client: AsyncClient):
        response = await client.patch("/api/job-alerts/1", json={"name": "X"})
        assert response.status_code == 401

    async def test_update_not_found(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.patch(
            "/api/job-alerts/99999",
            json={"name": "Ghost"},
            headers=auth_headers_candidate,
        )
        assert response.status_code == 404

    async def test_update_name(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        alert = await _create_alert(client, auth_headers_candidate)

        response = await client.patch(
            f"/api/job-alerts/{alert['id']}",
            json={"name": "Updated Name"},
            headers=auth_headers_candidate,
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"

    async def test_update_frequency(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        alert = await _create_alert(client, auth_headers_candidate)

        response = await client.patch(
            f"/api/job-alerts/{alert['id']}",
            json={"frequency": "weekly"},
            headers=auth_headers_candidate,
        )
        assert response.status_code == 200
        assert response.json()["frequency"] == "weekly"

    async def test_update_criteria(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        alert = await _create_alert(client, auth_headers_candidate)

        response = await client.patch(
            f"/api/job-alerts/{alert['id']}",
            json={"criteria": {"keywords": ["react", "frontend"]}},
            headers=auth_headers_candidate,
        )
        assert response.status_code == 200
        assert "react" in response.json()["criteria"]["keywords"]


# ===========================================================================
# Delete job alert
# ===========================================================================


class TestDeleteJobAlert:
    """DELETE /api/job-alerts/{alert_id}"""

    async def test_delete_unauthenticated(self, client: AsyncClient):
        response = await client.delete("/api/job-alerts/1")
        assert response.status_code == 401

    async def test_delete_not_found(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.delete(
            "/api/job-alerts/99999", headers=auth_headers_candidate
        )
        assert response.status_code == 404

    async def test_delete_success(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        alert = await _create_alert(client, auth_headers_candidate)

        response = await client.delete(
            f"/api/job-alerts/{alert['id']}",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 204

        # Confirm alert is gone
        get_resp = await client.get(
            f"/api/job-alerts/{alert['id']}",
            headers=auth_headers_candidate,
        )
        assert get_resp.status_code == 404


# ===========================================================================
# Toggle job alert
# ===========================================================================


class TestToggleJobAlert:
    """POST /api/job-alerts/{alert_id}/toggle"""

    async def test_toggle_unauthenticated(self, client: AsyncClient):
        response = await client.post("/api/job-alerts/1/toggle")
        assert response.status_code == 401

    async def test_toggle_not_found(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.post(
            "/api/job-alerts/99999/toggle", headers=auth_headers_candidate
        )
        assert response.status_code == 404

    async def test_toggle_switches_state(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Toggle flips is_active from True to False and back."""
        alert = await _create_alert(client, auth_headers_candidate)
        assert alert["is_active"] is True

        # Toggle off
        resp1 = await client.post(
            f"/api/job-alerts/{alert['id']}/toggle",
            headers=auth_headers_candidate,
        )
        assert resp1.status_code == 200
        assert resp1.json()["is_active"] is False

        # Toggle on
        resp2 = await client.post(
            f"/api/job-alerts/{alert['id']}/toggle",
            headers=auth_headers_candidate,
        )
        assert resp2.status_code == 200
        assert resp2.json()["is_active"] is True


# ===========================================================================
# Preview matching jobs
# ===========================================================================


class TestPreviewMatchingJobs:
    """GET /api/job-alerts/{alert_id}/preview"""

    async def test_preview_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/job-alerts/1/preview")
        assert response.status_code == 401

    async def test_preview_not_found(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/job-alerts/99999/preview", headers=auth_headers_candidate
        )
        assert response.status_code == 404

    async def test_preview_returns_matching_jobs(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        test_job: Job,
    ):
        """Preview should return published jobs matching the alert criteria."""
        alert = await _create_alert(
            client,
            auth_headers_candidate,
            keywords=["Software"],
            location="Libreville",
        )

        response = await client.get(
            f"/api/job-alerts/{alert['id']}/preview",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["alert_id"] == alert["id"]
        assert "matching_jobs" in data
        assert "total_matches" in data
        # test_job title contains "Software Engineer" and location "Libreville"
        assert data["total_matches"] >= 1

    async def test_preview_no_matching_jobs(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Preview with non-matching criteria returns zero matches."""
        alert = await _create_alert(
            client,
            auth_headers_candidate,
            keywords=["ZzzNonExistentXxx"],
            location="Mars",
            name="No Match Alert",
        )

        response = await client.get(
            f"/api/job-alerts/{alert['id']}/preview",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 200
        assert response.json()["total_matches"] == 0


# ===========================================================================
# Stats summary
# ===========================================================================


class TestAlertStatsSummary:
    """GET /api/job-alerts/stats/summary"""

    async def test_stats_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/job-alerts/stats/summary")
        assert response.status_code == 401

    async def test_stats_as_employer_forbidden(
        self, client: AsyncClient, auth_headers_employer: dict
    ):
        response = await client.get(
            "/api/job-alerts/stats/summary", headers=auth_headers_employer
        )
        assert response.status_code == 403

    async def test_stats_empty(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/job-alerts/stats/summary", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_alerts"] == 0
        assert data["active_alerts"] == 0
        assert data["inactive_alerts"] == 0
        assert data["total_jobs_sent"] == 0

    async def test_stats_after_creating_alerts(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        await _create_alert(client, auth_headers_candidate, name="A1")
        await _create_alert(client, auth_headers_candidate, name="A2")

        response = await client.get(
            "/api/job-alerts/stats/summary", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_alerts"] >= 2
        assert data["active_alerts"] >= 2
