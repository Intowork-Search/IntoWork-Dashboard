"""
Tests for CV Builder endpoints (/api/cv-builder/*).

Covers: save, load, list, public access, PDF generation (mocked),
analytics, toggle-public, delete.
"""
import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import CVDocument, CVTemplate, User


pytestmark = pytest.mark.asyncio


# ---------------------------------------------------------------------------
# Reusable helpers
# ---------------------------------------------------------------------------

def _cv_save_payload(
    *,
    first_name: str = "Jean",
    last_name: str = "Dupont",
    template: str = "elegance",
    is_public: bool = False,
    slug: str | None = None,
    title: str | None = None,
) -> dict:
    """Build a valid POST /api/cv-builder/save body."""
    payload: dict = {
        "cv_data": {
            "personalInfo": {
                "firstName": first_name,
                "lastName": last_name,
                "email": "jean@test.com",
                "phone": "+241001234567",
                "address": "Libreville",
                "title": "Developpeur",
                "summary": "Profil test",
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "company": "ACME",
                    "position": "Dev",
                    "startDate": "2020-01",
                    "endDate": "2023-06",
                    "current": False,
                    "description": "Backend dev",
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "MIT",
                    "degree": "MSc",
                    "field": "CS",
                    "startDate": "2016",
                    "endDate": "2020",
                    "description": "",
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "Python", "level": 90}
            ],
            "languages": [
                {"id": "lang-1", "name": "Francais", "level": "C1"}
            ],
        },
        "template": template,
        "is_public": is_public,
    }
    if slug is not None:
        payload["slug"] = slug
    if title is not None:
        payload["title"] = title
    return payload


async def _create_cv(
    client: AsyncClient,
    headers: dict,
    **kwargs,
) -> dict:
    """Helper: create a CV and return the response JSON."""
    payload = _cv_save_payload(**kwargs)
    resp = await client.post("/api/cv-builder/save", json=payload, headers=headers)
    assert resp.status_code == 200, resp.text
    return resp.json()


# ===========================================================================
# Save CV
# ===========================================================================


class TestSaveCV:
    """POST /api/cv-builder/save"""

    async def test_save_cv_unauthenticated(self, client: AsyncClient):
        """Unauthenticated requests are rejected."""
        payload = _cv_save_payload()
        response = await client.post("/api/cv-builder/save", json=payload)
        assert response.status_code == 401

    async def test_save_cv_creates_new(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Authenticated user can create a new CV."""
        data = await _create_cv(client, auth_headers_candidate)

        assert "id" in data
        assert data["slug"]  # slug is generated
        assert data["template"] == "elegance"
        assert data["is_public"] is False
        assert data["views_count"] == 0
        assert data["downloads_count"] == 0

    async def test_save_cv_updates_existing(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Second save updates the existing CV instead of creating another."""
        first = await _create_cv(client, auth_headers_candidate, title="V1")
        second = await _create_cv(
            client, auth_headers_candidate, title="V2", template="bold"
        )

        assert second["id"] == first["id"]
        assert second["template"] == "bold"

    async def test_save_cv_with_custom_slug(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """User can specify a custom slug."""
        data = await _create_cv(
            client, auth_headers_candidate, slug="mon-cv"
        )
        assert data["slug"] == "mon-cv"

    async def test_save_cv_with_title(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """User can set a CV title."""
        data = await _create_cv(
            client, auth_headers_candidate, title="Mon CV Pro"
        )
        assert data["title"] == "Mon CV Pro"

    async def test_save_cv_public_url(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Public CV includes a public_url."""
        data = await _create_cv(
            client, auth_headers_candidate, is_public=True
        )
        assert data["is_public"] is True
        assert data["public_url"] is not None
        assert data["slug"] in data["public_url"]


# ===========================================================================
# Load CV
# ===========================================================================


class TestLoadCV:
    """GET /api/cv-builder/load"""

    async def test_load_cv_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/cv-builder/load")
        assert response.status_code == 401

    async def test_load_cv_no_cv_returns_null(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """When user has no CV, endpoint returns null."""
        response = await client.get(
            "/api/cv-builder/load", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        # null JSON body
        assert response.json() is None

    async def test_load_cv_returns_saved(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """After saving, the CV can be loaded back."""
        saved = await _create_cv(client, auth_headers_candidate)

        response = await client.get(
            "/api/cv-builder/load", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        loaded = response.json()
        assert loaded["id"] == saved["id"]
        assert loaded["slug"] == saved["slug"]
        assert loaded["cv_data"]["personalInfo"]["firstName"] == "Jean"


# ===========================================================================
# List CVs
# ===========================================================================


class TestListCVs:
    """GET /api/cv-builder/list"""

    async def test_list_cvs_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/cv-builder/list")
        assert response.status_code == 401

    async def test_list_cvs_empty(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.get(
            "/api/cv-builder/list", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        assert response.json() == []

    async def test_list_cvs_returns_items(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        await _create_cv(client, auth_headers_candidate)

        response = await client.get(
            "/api/cv-builder/list", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        items = response.json()
        assert len(items) >= 1
        assert "id" in items[0]
        assert "slug" in items[0]
        assert "template" in items[0]


# ===========================================================================
# Public CV access
# ===========================================================================


class TestPublicCV:
    """GET /api/cv-builder/public/{slug}"""

    async def test_public_cv_not_found(self, client: AsyncClient):
        response = await client.get("/api/cv-builder/public/nonexistent-slug")
        assert response.status_code == 404

    async def test_public_cv_not_public(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """A private CV is not accessible via public endpoint."""
        saved = await _create_cv(
            client, auth_headers_candidate, is_public=False
        )

        response = await client.get(
            f"/api/cv-builder/public/{saved['slug']}"
        )
        assert response.status_code == 404

    async def test_public_cv_accessible(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """A public CV is accessible without authentication."""
        saved = await _create_cv(
            client, auth_headers_candidate, is_public=True
        )

        response = await client.get(
            f"/api/cv-builder/public/{saved['slug']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == saved["slug"]
        assert data["template"] == "elegance"
        assert "cv_data" in data

    async def test_public_cv_increments_views(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Each public access increments the views counter."""
        saved = await _create_cv(
            client, auth_headers_candidate, is_public=True
        )

        # Visit twice
        await client.get(f"/api/cv-builder/public/{saved['slug']}")
        resp = await client.get(f"/api/cv-builder/public/{saved['slug']}")

        assert resp.status_code == 200
        assert resp.json()["views_count"] >= 2


# ===========================================================================
# Generate PDF (WeasyPrint mocked)
# ===========================================================================


class TestGeneratePDF:
    """POST /api/cv-builder/generate-pdf"""

    async def test_generate_pdf_unauthenticated(self, client: AsyncClient):
        response = await client.post("/api/cv-builder/generate-pdf")
        assert response.status_code == 401

    async def test_generate_pdf_no_cv(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """PDF generation fails when user has no CV."""
        response = await client.post(
            "/api/cv-builder/generate-pdf", headers=auth_headers_candidate
        )
        assert response.status_code == 404

    async def test_generate_pdf_weasyprint_not_installed(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """When WeasyPrint is not installed, returns 503."""
        await _create_cv(client, auth_headers_candidate)

        # The default import of weasyprint will fail with ImportError,
        # which the endpoint handles by returning 503.
        # We patch the import to ensure it raises ImportError.
        with patch.dict("sys.modules", {"weasyprint": None}):
            response = await client.post(
                "/api/cv-builder/generate-pdf",
                headers=auth_headers_candidate,
            )
            assert response.status_code == 503

    async def test_generate_pdf_success_mocked(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """With WeasyPrint mocked, PDF generation succeeds."""
        from pathlib import Path

        saved = await _create_cv(client, auth_headers_candidate)
        slug = saved["slug"]
        pdf_dir = Path(__file__).parent.parent / "uploads" / "pdfs"
        pdf_dir.mkdir(parents=True, exist_ok=True)
        pdf_path = pdf_dir / f"{slug}.pdf"

        def _fake_write_pdf(path: str, **kwargs) -> None:
            """Create a minimal fake PDF file so FileResponse finds it."""
            Path(path).write_bytes(b"%PDF-1.4 fake")

        mock_html_instance = MagicMock()
        mock_html_instance.write_pdf = MagicMock(side_effect=_fake_write_pdf)
        mock_html_class = MagicMock(return_value=mock_html_instance)
        mock_weasyprint = MagicMock()
        mock_weasyprint.HTML = mock_html_class

        try:
            with patch.dict("sys.modules", {"weasyprint": mock_weasyprint}):
                response = await client.post(
                    "/api/cv-builder/generate-pdf",
                    headers=auth_headers_candidate,
                )
                assert response.status_code == 200
                assert mock_html_class.called
        finally:
            # Clean up the fake PDF
            if pdf_path.exists():
                pdf_path.unlink()


# ===========================================================================
# Analytics
# ===========================================================================


class TestAnalytics:
    """GET /api/cv-builder/analytics"""

    async def test_analytics_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/cv-builder/analytics")
        assert response.status_code == 401

    async def test_analytics_no_cv(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """When user has no CV, returns zeroed analytics."""
        response = await client.get(
            "/api/cv-builder/analytics", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_views"] == 0
        assert data["total_downloads"] == 0
        assert data["views_by_date"] == []

    async def test_analytics_after_views(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Analytics reflect public views."""
        saved = await _create_cv(
            client, auth_headers_candidate, is_public=True
        )

        # Generate some views
        await client.get(f"/api/cv-builder/public/{saved['slug']}")
        await client.get(f"/api/cv-builder/public/{saved['slug']}")

        response = await client.get(
            "/api/cv-builder/analytics", headers=auth_headers_candidate
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_views"] >= 2


# ===========================================================================
# Toggle public
# ===========================================================================


class TestTogglePublic:
    """PATCH /api/cv-builder/toggle-public"""

    async def test_toggle_unauthenticated(self, client: AsyncClient):
        response = await client.patch("/api/cv-builder/toggle-public")
        assert response.status_code == 401

    async def test_toggle_no_cv(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.patch(
            "/api/cv-builder/toggle-public", headers=auth_headers_candidate
        )
        assert response.status_code == 404

    async def test_toggle_switches_state(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """Toggling flips is_public from False to True and back."""
        await _create_cv(client, auth_headers_candidate, is_public=False)

        # Toggle to True
        resp1 = await client.patch(
            "/api/cv-builder/toggle-public", headers=auth_headers_candidate
        )
        assert resp1.status_code == 200
        assert resp1.json()["is_public"] is True
        assert resp1.json()["public_url"] is not None

        # Toggle back to False
        resp2 = await client.patch(
            "/api/cv-builder/toggle-public", headers=auth_headers_candidate
        )
        assert resp2.status_code == 200
        assert resp2.json()["is_public"] is False
        assert resp2.json()["public_url"] is None


# ===========================================================================
# Delete CV
# ===========================================================================


class TestDeleteCV:
    """DELETE /api/cv-builder/delete"""

    async def test_delete_unauthenticated(self, client: AsyncClient):
        response = await client.delete("/api/cv-builder/delete")
        assert response.status_code == 401

    async def test_delete_no_cv(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        response = await client.delete(
            "/api/cv-builder/delete", headers=auth_headers_candidate
        )
        assert response.status_code == 404

    async def test_delete_success(
        self, client: AsyncClient, auth_headers_candidate: dict
    ):
        """After deletion, load returns null."""
        await _create_cv(client, auth_headers_candidate)

        resp = await client.delete(
            "/api/cv-builder/delete", headers=auth_headers_candidate
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"

        # Confirm CV is gone
        load_resp = await client.get(
            "/api/cv-builder/load", headers=auth_headers_candidate
        )
        assert load_resp.status_code == 200
        assert load_resp.json() is None
