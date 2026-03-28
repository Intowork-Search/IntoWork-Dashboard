"""
Tests for email template endpoints (/api/email-templates/*).

Covers: create, list, detail, update, delete, duplicate,
        variables, usage stats, role-based access.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import User

pytestmark = pytest.mark.asyncio


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _template_payload(**overrides) -> dict:
    """Return a valid email template creation payload."""
    base = {
        "name": "Invitation entretien - Tech",
        "type": "interview_invitation",
        "subject": "Invitation a un entretien - {job_title}",
        "body": "<p>Bonjour {candidate_name},</p><p>Nous aimerions planifier un entretien pour le poste {job_title}.</p>",
        "is_default": False,
    }
    base.update(overrides)
    return base


# ===========================================================================
# Create email template (employer only)
# ===========================================================================


class TestCreateEmailTemplate:
    """POST /api/email-templates"""

    async def test_create_template_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.post(
            "/api/email-templates", json=_template_payload()
        )
        assert response.status_code == 401

    async def test_create_template_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidates cannot create email templates (403)."""
        response = await client.post(
            "/api/email-templates",
            headers=auth_headers_candidate,
            json=_template_payload(),
        )
        assert response.status_code == 403

    async def test_create_template_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer can create an email template."""
        payload = _template_payload()

        response = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=payload,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["type"] == payload["type"]
        assert data["subject"] == payload["subject"]
        assert data["body"] == payload["body"]
        assert data["is_active"] is True
        assert data["is_default"] is False
        assert data["usage_count"] == 0
        assert "id" in data
        assert "created_at" in data

    async def test_create_template_as_default(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Creating a default template sets is_default to True."""
        payload = _template_payload(is_default=True)

        response = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=payload,
        )

        assert response.status_code == 201
        assert response.json()["is_default"] is True

    async def test_create_template_different_types(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Templates can be created with various valid types."""
        for template_type in [
            "welcome_candidate",
            "application_received",
            "application_rejected",
            "offer_letter",
            "custom",
        ]:
            payload = _template_payload(
                name=f"Template {template_type}",
                type=template_type,
            )
            response = await client.post(
                "/api/email-templates",
                headers=auth_headers_employer,
                json=payload,
            )
            assert response.status_code == 201
            assert response.json()["type"] == template_type

    async def test_create_template_missing_required_fields(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Missing required fields returns 422."""
        response = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json={"name": "Incomplete"},
        )
        assert response.status_code == 422


# ===========================================================================
# List email templates
# ===========================================================================


class TestListEmailTemplates:
    """GET /api/email-templates"""

    async def test_list_templates_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/email-templates")
        assert response.status_code == 401

    async def test_list_templates_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidates cannot list email templates (403)."""
        response = await client.get(
            "/api/email-templates", headers=auth_headers_candidate
        )
        assert response.status_code == 403

    async def test_list_templates_empty(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer with no templates gets an empty list."""
        response = await client.get(
            "/api/email-templates", headers=auth_headers_employer
        )
        assert response.status_code == 200
        assert response.json() == []

    async def test_list_templates_returns_created(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Templates created by the employer appear in the list."""
        # Create two templates
        await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(name="Template A"),
        )
        await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(
                name="Template B",
                type="application_received",
            ),
        )

        response = await client.get(
            "/api/email-templates", headers=auth_headers_employer
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        names = [t["name"] for t in data]
        assert "Template A" in names
        assert "Template B" in names

    async def test_list_templates_filter_by_type(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Filtering by type returns only matching templates."""
        await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(name="Offer Template", type="offer_letter"),
        )
        await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(name="Invite Template", type="interview_invitation"),
        )

        response = await client.get(
            "/api/email-templates",
            headers=auth_headers_employer,
            params={"type": "offer_letter"},
        )
        assert response.status_code == 200
        data = response.json()
        assert all(t["type"] == "offer_letter" for t in data)


# ===========================================================================
# Get email template detail
# ===========================================================================


class TestGetEmailTemplate:
    """GET /api/email-templates/{template_id}"""

    async def test_get_template_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/email-templates/1")
        assert response.status_code == 401

    async def test_get_template_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Non-existent template returns 404."""
        response = await client.get(
            "/api/email-templates/99999", headers=auth_headers_employer
        )
        assert response.status_code == 404

    async def test_get_template_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer can retrieve a template they created."""
        create_resp = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(),
        )
        template_id = create_resp.json()["id"]

        response = await client.get(
            f"/api/email-templates/{template_id}",
            headers=auth_headers_employer,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == template_id
        assert data["name"] == "Invitation entretien - Tech"


# ===========================================================================
# Update email template
# ===========================================================================


class TestUpdateEmailTemplate:
    """PATCH /api/email-templates/{template_id}"""

    async def test_update_template_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.patch(
            "/api/email-templates/1", json={"name": "Updated"}
        )
        assert response.status_code == 401

    async def test_update_template_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Non-existent template returns 404."""
        response = await client.patch(
            "/api/email-templates/99999",
            headers=auth_headers_employer,
            json={"name": "Ghost"},
        )
        assert response.status_code == 404

    async def test_update_template_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer can partially update a template."""
        create_resp = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(),
        )
        template_id = create_resp.json()["id"]

        response = await client.patch(
            f"/api/email-templates/{template_id}",
            headers=auth_headers_employer,
            json={
                "name": "Invitation entretien - Mise a jour",
                "subject": "Nouveau sujet",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Invitation entretien - Mise a jour"
        assert data["subject"] == "Nouveau sujet"
        # Unchanged fields should remain
        assert data["type"] == "interview_invitation"

    async def test_update_template_set_default(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Setting a template as default works correctly."""
        create_resp = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(is_default=False),
        )
        template_id = create_resp.json()["id"]

        response = await client.patch(
            f"/api/email-templates/{template_id}",
            headers=auth_headers_employer,
            json={"is_default": True},
        )

        assert response.status_code == 200
        assert response.json()["is_default"] is True

    async def test_update_template_deactivate(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer can deactivate a template."""
        create_resp = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(),
        )
        template_id = create_resp.json()["id"]

        response = await client.patch(
            f"/api/email-templates/{template_id}",
            headers=auth_headers_employer,
            json={"is_active": False},
        )

        assert response.status_code == 200
        assert response.json()["is_active"] is False


# ===========================================================================
# Delete email template
# ===========================================================================


class TestDeleteEmailTemplate:
    """DELETE /api/email-templates/{template_id}"""

    async def test_delete_template_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.delete("/api/email-templates/1")
        assert response.status_code == 401

    async def test_delete_template_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Non-existent template returns 404."""
        response = await client.delete(
            "/api/email-templates/99999", headers=auth_headers_employer
        )
        assert response.status_code == 404

    async def test_delete_template_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer can delete their own template (204)."""
        create_resp = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(),
        )
        template_id = create_resp.json()["id"]

        response = await client.delete(
            f"/api/email-templates/{template_id}",
            headers=auth_headers_employer,
        )
        assert response.status_code == 204

        # Verify it is actually deleted
        get_resp = await client.get(
            f"/api/email-templates/{template_id}",
            headers=auth_headers_employer,
        )
        assert get_resp.status_code == 404


# ===========================================================================
# Duplicate email template
# ===========================================================================


class TestDuplicateEmailTemplate:
    """POST /api/email-templates/{template_id}/duplicate"""

    async def test_duplicate_template_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.post("/api/email-templates/1/duplicate")
        assert response.status_code == 401

    async def test_duplicate_template_not_found(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Non-existent template returns 404."""
        response = await client.post(
            "/api/email-templates/99999/duplicate",
            headers=auth_headers_employer,
        )
        assert response.status_code == 404

    async def test_duplicate_template_success(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Duplicating creates a copy with '(Copie)' appended to the name."""
        create_resp = await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(name="Original Template", is_default=True),
        )
        original_id = create_resp.json()["id"]

        response = await client.post(
            f"/api/email-templates/{original_id}/duplicate",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Original Template (Copie)"
        assert data["id"] != original_id
        assert data["type"] == "interview_invitation"
        assert data["is_default"] is False  # Duplicates are never default
        assert data["is_active"] is True
        assert data["usage_count"] == 0


# ===========================================================================
# Template variables
# ===========================================================================


class TestTemplateVariables:
    """GET /api/email-templates/variables"""

    async def test_variables_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/email-templates/variables")
        assert response.status_code == 401

    async def test_variables_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidates cannot access template variables (403)."""
        response = await client.get(
            "/api/email-templates/variables",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    async def test_variables_as_employer(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer can fetch the list of available template variables."""
        response = await client.get(
            "/api/email-templates/variables",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert "variables" in data
        assert "descriptions" in data
        assert len(data["variables"]) > 0
        # Verify key variables are present
        assert "{candidate_name}" in data["variables"]
        assert "{job_title}" in data["variables"]
        assert "{company_name}" in data["variables"]
        # Each variable should have a description
        for var in data["variables"]:
            assert var in data["descriptions"]


# ===========================================================================
# Template usage stats
# ===========================================================================


class TestTemplateUsageStats:
    """GET /api/email-templates/stats/usage"""

    async def test_stats_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/email-templates/stats/usage")
        assert response.status_code == 401

    async def test_stats_as_candidate_forbidden(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidates cannot access template stats (403)."""
        response = await client.get(
            "/api/email-templates/stats/usage",
            headers=auth_headers_candidate,
        )
        assert response.status_code == 403

    async def test_stats_empty(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer with no templates gets zeroed stats."""
        response = await client.get(
            "/api/email-templates/stats/usage",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_templates"] == 0
        assert data["active_templates"] == 0
        assert data["inactive_templates"] == 0
        assert data["total_usage"] == 0
        assert data["most_used_template"] is None

    async def test_stats_with_templates(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Stats reflect the templates that exist."""
        # Create two templates
        await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(name="Stats Template A"),
        )
        await client.post(
            "/api/email-templates",
            headers=auth_headers_employer,
            json=_template_payload(
                name="Stats Template B",
                type="application_received",
            ),
        )

        response = await client.get(
            "/api/email-templates/stats/usage",
            headers=auth_headers_employer,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_templates"] == 2
        assert data["active_templates"] == 2
        assert data["inactive_templates"] == 0
        assert data["total_usage"] == 0
        assert data["most_used_template"] is not None
        assert "id" in data["most_used_template"]
        assert "name" in data["most_used_template"]
