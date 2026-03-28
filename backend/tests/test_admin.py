"""
Tests for Admin endpoints (/api/admin/*).

Covers: stats, users list, user activation, user deletion,
employers list, jobs list, admin profile.
All endpoints require admin role — candidates and employers get 403.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Job, User


pytestmark = pytest.mark.asyncio


# ===========================================================================
# Admin statistics
# ===========================================================================


class TestAdminStats:
    """GET /api/admin/stats"""

    async def test_stats_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/admin/stats")
        assert response.status_code == 401

    async def test_stats_as_candidate_forbidden(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/admin/stats", headers=auth_headers_candidate
        )
        assert response.status_code == 403

    async def test_stats_as_employer_forbidden(
        self, client: AsyncClient, auth_headers_employer: dict
    ):
        response = await client.get(
            "/api/admin/stats", headers=auth_headers_employer
        )
        assert response.status_code == 403

    async def test_stats_as_admin(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        candidate_user: User,
        employer_user: User,
    ):
        """Admin can retrieve platform statistics."""
        response = await client.get(
            "/api/admin/stats", headers=auth_headers_admin
        )
        assert response.status_code == 200
        data = response.json()

        # Verify all expected fields are present
        assert "total_users" in data
        assert "total_candidates" in data
        assert "total_employers" in data
        assert "total_companies" in data
        assert "total_jobs" in data
        assert "total_applications" in data
        assert "total_notifications" in data
        assert "active_users" in data
        assert "inactive_users" in data
        assert "jobs_by_status" in data
        assert "recent_signups" in data

        # We created candidate, employer, admin = at least 3 users
        assert data["total_users"] >= 3
        assert data["total_candidates"] >= 1
        assert data["total_employers"] >= 1
        assert data["active_users"] >= 3

    async def test_stats_includes_jobs(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        test_job: Job,
    ):
        """Stats reflect job count."""
        response = await client.get(
            "/api/admin/stats", headers=auth_headers_admin
        )
        assert response.status_code == 200
        assert response.json()["total_jobs"] >= 1


# ===========================================================================
# Users list
# ===========================================================================


class TestAdminUsers:
    """GET /api/admin/users"""

    async def test_users_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/admin/users")
        assert response.status_code == 401

    async def test_users_as_candidate_forbidden(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/admin/users", headers=auth_headers_candidate
        )
        assert response.status_code == 403

    async def test_users_list(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        candidate_user: User,
        employer_user: User,
    ):
        """Admin can list all users."""
        response = await client.get(
            "/api/admin/users", headers=auth_headers_admin
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # candidate + employer + admin

        # Check structure
        first = data[0]
        assert "id" in first
        assert "email" in first
        assert "first_name" in first
        assert "last_name" in first
        assert "role" in first
        assert "is_active" in first
        assert "created_at" in first

    async def test_users_filter_by_role(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        candidate_user: User,
    ):
        """Filter users by role."""
        response = await client.get(
            "/api/admin/users",
            params={"role": "candidate"},
            headers=auth_headers_admin,
        )
        assert response.status_code == 200
        data = response.json()
        assert all(u["role"] == "candidate" for u in data)

    async def test_users_filter_invalid_role(
        self, client: AsyncClient, auth_headers_admin: dict
    ):
        """Invalid role filter returns 400."""
        response = await client.get(
            "/api/admin/users",
            params={"role": "invalid_role"},
            headers=auth_headers_admin,
        )
        assert response.status_code == 400

    async def test_users_search(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        candidate_user: User,
    ):
        """Search by email/name."""
        response = await client.get(
            "/api/admin/users",
            params={"search": "candidate@test.com"},
            headers=auth_headers_admin,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(u["email"] == "candidate@test.com" for u in data)

    async def test_users_pagination(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        candidate_user: User,
    ):
        """Pagination parameters are respected."""
        response = await client.get(
            "/api/admin/users",
            params={"skip": 0, "limit": 1},
            headers=auth_headers_admin,
        )
        assert response.status_code == 200
        assert len(response.json()) <= 1


# ===========================================================================
# User activation
# ===========================================================================


class TestUserActivation:
    """PUT /api/admin/users/{user_id}/activate"""

    async def test_activate_unauthenticated(self, client: AsyncClient):
        response = await client.put(
            "/api/admin/users/1/activate", json={"is_active": False}
        )
        assert response.status_code == 401

    async def test_activate_as_candidate_forbidden(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.put(
            "/api/admin/users/1/activate",
            json={"is_active": False},
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    async def test_activate_nonexistent_user(
        self, client: AsyncClient, auth_headers_admin: dict
    ):
        response = await client.put(
            "/api/admin/users/99999/activate",
            json={"is_active": False},
            headers=auth_headers_admin,
        )
        assert response.status_code == 404

    async def test_deactivate_user(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        candidate_user: User,
    ):
        """Admin can deactivate a user."""
        response = await client.put(
            f"/api/admin/users/{candidate_user.id}/activate",
            json={"is_active": False},
            headers=auth_headers_admin,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False
        assert data["id"] == candidate_user.id

    async def test_reactivate_user(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        candidate_user: User,
    ):
        """Admin can re-activate a previously deactivated user."""
        # Deactivate first
        await client.put(
            f"/api/admin/users/{candidate_user.id}/activate",
            json={"is_active": False},
            headers=auth_headers_admin,
        )

        # Reactivate
        response = await client.put(
            f"/api/admin/users/{candidate_user.id}/activate",
            json={"is_active": True},
            headers=auth_headers_admin,
        )
        assert response.status_code == 200
        assert response.json()["is_active"] is True

    async def test_admin_cannot_deactivate_self(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        admin_user: User,
    ):
        """Admin cannot deactivate their own account (400)."""
        response = await client.put(
            f"/api/admin/users/{admin_user.id}/activate",
            json={"is_active": False},
            headers=auth_headers_admin,
        )
        assert response.status_code == 400


# ===========================================================================
# Delete user
# ===========================================================================


class TestDeleteUser:
    """DELETE /api/admin/users/{user_id}"""

    async def test_delete_unauthenticated(self, client: AsyncClient):
        response = await client.delete("/api/admin/users/1")
        assert response.status_code == 401

    async def test_delete_as_employer_forbidden(
        self, client: AsyncClient, auth_headers_employer: dict
    ):
        response = await client.delete(
            "/api/admin/users/1", headers=auth_headers_employer
        )
        assert response.status_code == 403

    async def test_delete_nonexistent_user(
        self, client: AsyncClient, auth_headers_admin: dict
    ):
        response = await client.delete(
            "/api/admin/users/99999", headers=auth_headers_admin
        )
        assert response.status_code == 404

    async def test_delete_candidate_user(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        candidate_user: User,
    ):
        """Admin can delete a candidate user."""
        response = await client.delete(
            f"/api/admin/users/{candidate_user.id}",
            headers=auth_headers_admin,
        )
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()

        # Verify user is gone
        users_resp = await client.get(
            "/api/admin/users",
            params={"search": "candidate@test.com"},
            headers=auth_headers_admin,
        )
        assert all(
            u["email"] != "candidate@test.com"
            for u in users_resp.json()
        )

    async def test_delete_employer_user(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        employer_user: User,
    ):
        """Admin can delete an employer user (cascading jobs etc.)."""
        response = await client.delete(
            f"/api/admin/users/{employer_user.id}",
            headers=auth_headers_admin,
        )
        assert response.status_code == 200

    async def test_admin_cannot_delete_self(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        admin_user: User,
    ):
        """Admin cannot delete their own account (400)."""
        response = await client.delete(
            f"/api/admin/users/{admin_user.id}",
            headers=auth_headers_admin,
        )
        assert response.status_code == 400


# ===========================================================================
# Employers list
# ===========================================================================


class TestAdminEmployers:
    """GET /api/admin/employers"""

    async def test_employers_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/admin/employers")
        assert response.status_code == 401

    async def test_employers_as_candidate_forbidden(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/admin/employers", headers=auth_headers_candidate
        )
        assert response.status_code == 403

    async def test_employers_list(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        employer_user: User,
    ):
        """Admin can list all employers."""
        response = await client.get(
            "/api/admin/employers", headers=auth_headers_admin
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        first = data[0]
        assert "id" in first
        assert "user_id" in first
        assert "email" in first
        assert "company_name" in first
        assert "is_active" in first


# ===========================================================================
# Jobs list (admin view)
# ===========================================================================


class TestAdminJobs:
    """GET /api/admin/jobs"""

    async def test_jobs_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/admin/jobs")
        assert response.status_code == 401

    async def test_jobs_as_candidate_forbidden(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/admin/jobs", headers=auth_headers_candidate
        )
        assert response.status_code == 403

    async def test_jobs_list(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        test_job: Job,
    ):
        """Admin can list all jobs."""
        response = await client.get(
            "/api/admin/jobs", headers=auth_headers_admin
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        first = data[0]
        assert "id" in first
        assert "title" in first
        assert "company_name" in first
        assert "employer_email" in first
        assert "status" in first
        assert "applications_count" in first

    async def test_jobs_filter_by_status(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        test_job: Job,
    ):
        """Filter jobs by status."""
        response = await client.get(
            "/api/admin/jobs",
            params={"status": "published"},
            headers=auth_headers_admin,
        )
        assert response.status_code == 200
        data = response.json()
        assert all(j["status"] == "published" for j in data)

    async def test_jobs_pagination(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        test_job: Job,
    ):
        response = await client.get(
            "/api/admin/jobs",
            params={"skip": 0, "limit": 1},
            headers=auth_headers_admin,
        )
        assert response.status_code == 200
        assert len(response.json()) <= 1


# ===========================================================================
# Admin profile (me)
# ===========================================================================


class TestAdminMe:
    """GET /api/admin/me"""

    async def test_me_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/admin/me")
        assert response.status_code == 401

    async def test_me_as_candidate_forbidden(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/admin/me", headers=auth_headers_candidate
        )
        assert response.status_code == 403

    async def test_me_returns_admin_info(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        admin_user: User,
    ):
        """Admin can retrieve their own profile info."""
        response = await client.get(
            "/api/admin/me", headers=auth_headers_admin
        )
        assert response.status_code == 200
        data = response.json()

        assert data["id"] == admin_user.id
        assert data["email"] == admin_user.email
        assert data["first_name"] == "Test"
        assert data["last_name"] == "Admin"
        assert data["role"] == "admin"
        assert data["is_active"] is True
