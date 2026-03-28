"""
Tests for candidate endpoints (/api/candidates/*).

Covers: profile CRUD, experiences, educations, skills.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import User


# ===========================================================================
# Profile
# ===========================================================================


class TestCandidateProfile:
    """GET / PUT /api/candidates/profile"""

    async def test_get_profile_as_candidate(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
    ):
        """Candidate can retrieve their own profile."""
        response = await client.get(
            "/api/candidates/profile",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == candidate_user.id
        assert "phone" in data
        assert "location" in data
        assert "experiences" in data
        assert "educations" in data
        assert "skills" in data

    async def test_update_profile(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can update their profile fields."""
        response = await client.put(
            "/api/candidates/profile",
            headers=auth_headers_candidate,
            json={
                "phone": "+241009876543",
                "location": "Douala",
                "title": "Senior Developer",
                "summary": "Updated summary for the profile.",
                "years_experience": 7,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "+241009876543"
        assert data["location"] == "Douala"
        assert data["title"] == "Senior Developer"

    async def test_get_profile_as_employer_forbidden(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer cannot access the candidate profile endpoint (403)."""
        response = await client.get(
            "/api/candidates/profile",
            headers=auth_headers_employer,
        )

        assert response.status_code == 403

    async def test_get_profile_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/candidates/profile")

        assert response.status_code == 401


# ===========================================================================
# Experiences
# ===========================================================================


class TestExperiences:
    """CRUD on /api/candidates/profile/experiences"""

    async def test_create_experience(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can add an experience."""
        response = await client.post(
            "/api/candidates/profile/experiences",
            headers=auth_headers_candidate,
            json={
                "title": "Software Engineer",
                "company": "Tech Corp",
                "location": "Libreville",
                "start_date": "2020-01",
                "end_date": "2023-06",
                "is_current": False,
                "description": "Developed backend services.",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Software Engineer"
        assert data["company"] == "Tech Corp"
        assert "id" in data

    async def test_update_experience(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can update an existing experience."""
        # Create first
        create_resp = await client.post(
            "/api/candidates/profile/experiences",
            headers=auth_headers_candidate,
            json={
                "title": "Junior Dev",
                "company": "Startup X",
                "start_date": "2019-03",
                "end_date": "2020-01",
            },
        )
        exp_id = create_resp.json()["id"]

        # Update
        response = await client.put(
            f"/api/candidates/profile/experiences/{exp_id}",
            headers=auth_headers_candidate,
            json={
                "title": "Senior Dev",
                "company": "Startup X",
                "start_date": "2019-03",
                "end_date": "2021-06",
                "is_current": False,
            },
        )

        assert response.status_code == 200
        assert response.json()["title"] == "Senior Dev"

    async def test_delete_experience(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can delete an experience."""
        create_resp = await client.post(
            "/api/candidates/profile/experiences",
            headers=auth_headers_candidate,
            json={
                "title": "Intern",
                "company": "Big Co",
                "start_date": "2018-06",
                "end_date": "2018-12",
            },
        )
        exp_id = create_resp.json()["id"]

        response = await client.delete(
            f"/api/candidates/profile/experiences/{exp_id}",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        assert "message" in response.json()

    async def test_delete_nonexistent_experience(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Deleting a non-existent experience returns 404."""
        response = await client.delete(
            "/api/candidates/profile/experiences/99999",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 404

    async def test_employer_cannot_create_experience(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer cannot add experiences on candidate endpoint (403)."""
        response = await client.post(
            "/api/candidates/profile/experiences",
            headers=auth_headers_employer,
            json={
                "title": "Manager",
                "company": "Corp",
                "start_date": "2020-01",
            },
        )

        assert response.status_code == 403


# ===========================================================================
# Education
# ===========================================================================


class TestEducation:
    """CRUD on /api/candidates/profile/education"""

    async def test_create_education(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can add an education entry."""
        response = await client.post(
            "/api/candidates/profile/education",
            headers=auth_headers_candidate,
            json={
                "degree": "Master Informatique",
                "school": "Universite de Libreville",
                "location": "Libreville",
                "start_date": "2015-09",
                "end_date": "2017-06",
                "description": "Computer science graduate.",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["degree"] == "Master Informatique"
        assert "id" in data

    async def test_update_education(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can update an existing education entry."""
        create_resp = await client.post(
            "/api/candidates/profile/education",
            headers=auth_headers_candidate,
            json={
                "degree": "Licence",
                "school": "Ecole ABC",
                "start_date": "2012-09",
                "end_date": "2015-06",
            },
        )
        edu_id = create_resp.json()["id"]

        response = await client.put(
            f"/api/candidates/profile/education/{edu_id}",
            headers=auth_headers_candidate,
            json={
                "degree": "Licence Informatique",
                "school": "Ecole ABC",
                "start_date": "2012-09",
                "end_date": "2015-06",
            },
        )

        assert response.status_code == 200
        assert response.json()["degree"] == "Licence Informatique"

    async def test_delete_education(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can delete an education entry."""
        create_resp = await client.post(
            "/api/candidates/profile/education",
            headers=auth_headers_candidate,
            json={
                "degree": "BTS",
                "school": "Lycee Technique",
                "start_date": "2010-09",
                "end_date": "2012-06",
            },
        )
        edu_id = create_resp.json()["id"]

        response = await client.delete(
            f"/api/candidates/profile/education/{edu_id}",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        assert "message" in response.json()

    async def test_delete_nonexistent_education(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Deleting a non-existent education returns 404."""
        response = await client.delete(
            "/api/candidates/profile/education/99999",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 404


# ===========================================================================
# Skills
# ===========================================================================


class TestSkills:
    """CRUD on /api/candidates/profile/skills"""

    async def test_create_skill(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can add a skill."""
        response = await client.post(
            "/api/candidates/profile/skills",
            headers=auth_headers_candidate,
            json={
                "name": "Python",
                "level": 5,
                "category": "technical",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Python"
        assert data["level"] == 5
        assert data["category"] == "technical"
        assert "id" in data

    async def test_create_skill_invalid_level(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Skill level outside 1-5 is rejected (422)."""
        response = await client.post(
            "/api/candidates/profile/skills",
            headers=auth_headers_candidate,
            json={
                "name": "Invalid Skill",
                "level": 10,
                "category": "technical",
            },
        )

        assert response.status_code == 422

    async def test_update_skill(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can update an existing skill."""
        create_resp = await client.post(
            "/api/candidates/profile/skills",
            headers=auth_headers_candidate,
            json={
                "name": "JavaScript",
                "level": 3,
                "category": "technical",
            },
        )
        skill_id = create_resp.json()["id"]

        response = await client.put(
            f"/api/candidates/profile/skills/{skill_id}",
            headers=auth_headers_candidate,
            json={
                "name": "JavaScript",
                "level": 4,
                "category": "technical",
            },
        )

        assert response.status_code == 200
        assert response.json()["level"] == 4

    async def test_create_language_skill(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
    ):
        """Candidate can add a language-type skill."""
        response = await client.post(
            "/api/candidates/profile/skills",
            headers=auth_headers_candidate,
            json={
                "name": "Francais",
                "level": 5,
                "category": "language",
            },
        )

        assert response.status_code == 200
        assert response.json()["category"] == "language"

    async def test_employer_cannot_create_skill(
        self,
        client: AsyncClient,
        auth_headers_employer: dict,
    ):
        """Employer cannot add skills to candidate endpoint (403)."""
        response = await client.post(
            "/api/candidates/profile/skills",
            headers=auth_headers_employer,
            json={
                "name": "Management",
                "level": 4,
                "category": "soft",
            },
        )

        assert response.status_code == 403
