"""
Tests de conformite des contextes metier IntoWork.

Verifie que les exigences documentees dans CLAUDE.md sont bien
implementees dans les modeles SQLAlchemy et schemas Pydantic :
- Devises FCFA (XAF/XOF)
- Multi-tenant UEMOA/CEMAC (colonne zone)
- Champs country_code
- Timezone Afrique Centrale
"""

import pytest
from sqlalchemy import inspect as sa_inspect

from app.models.base import (
    User,
    Candidate,
    Company,
    Employer,
    Job,
    JobApplication,
    InterviewSchedule,
)
from app.schemas import JobCreateRequest, JobResponse


# ---------------------------------------------------------------------------
# Marqueur commun
# ---------------------------------------------------------------------------

pytestmark = pytest.mark.business_context


# ===========================================================================
# 1. Devise par defaut — FCFA (XAF)
# ===========================================================================


class TestCurrencyDefaults:
    """La devise par defaut doit etre XAF (FCFA zone CEMAC), pas EUR."""

    def test_job_model_has_currency_column(self):
        columns = {c.name for c in Job.__table__.columns}
        assert "currency" in columns, "Job doit avoir une colonne 'currency'"

    @pytest.mark.xfail(reason="Defaut actuel = 'EUR' — doit etre corrige en 'XAF'")
    def test_job_model_currency_default_is_xaf(self):
        col = Job.__table__.columns["currency"]
        default_value = col.default.arg if col.default else None
        assert default_value == "XAF", (
            f"Job.currency default = '{default_value}', attendu 'XAF'"
        )

    @pytest.mark.xfail(reason="Schema Pydantic JobCreateRequest.currency = 'EUR'")
    def test_schema_job_create_currency_default_is_xaf(self):
        job = JobCreateRequest(
            title="Test",
            description="Test description",
            location_type="on_site",
            job_type="full_time",
        )
        assert job.currency == "XAF", (
            f"JobCreateRequest.currency = '{job.currency}', attendu 'XAF'"
        )

    @pytest.mark.xfail(reason="Schema Pydantic JobResponse.currency = 'EUR'")
    def test_schema_job_response_currency_default_is_xaf(self):
        default = JobResponse.model_fields["currency"].default
        assert default == "XAF", (
            f"JobResponse.currency default = '{default}', attendu 'XAF'"
        )


# ===========================================================================
# 2. Multi-tenant UEMOA / CEMAC — colonne zone
# ===========================================================================


class TestZoneMultitenant:
    """Chaque modele metier doit porter une colonne 'zone' (UEMOA|CEMAC)."""

    @pytest.mark.xfail(reason="Colonne 'zone' absente sur Company")
    def test_company_has_zone_column(self):
        columns = {c.name for c in Company.__table__.columns}
        assert "zone" in columns, "Company doit avoir une colonne 'zone'"

    @pytest.mark.xfail(reason="Colonne 'zone' absente sur Job")
    def test_job_has_zone_column(self):
        columns = {c.name for c in Job.__table__.columns}
        assert "zone" in columns, "Job doit avoir une colonne 'zone'"

    @pytest.mark.xfail(reason="Colonne 'zone' absente sur JobApplication")
    def test_job_application_has_zone_column(self):
        columns = {c.name for c in JobApplication.__table__.columns}
        assert "zone" in columns, "JobApplication doit avoir une colonne 'zone'"


# ===========================================================================
# 3. Champ country_code sur User / Candidate
# ===========================================================================


class TestCountryCode:
    """Les utilisateurs doivent avoir un code pays (ISO 3166-1 alpha-2)."""

    @pytest.mark.xfail(reason="Champ 'country_code' absent sur User")
    def test_user_has_country_code(self):
        columns = {c.name for c in User.__table__.columns}
        assert "country_code" in columns, "User doit avoir 'country_code'"

    @pytest.mark.xfail(reason="Champ 'country_code' absent sur Candidate")
    def test_candidate_has_country_code(self):
        columns = {c.name for c in Candidate.__table__.columns}
        assert "country_code" in columns, "Candidate doit avoir 'country_code'"

    def test_company_has_country(self):
        columns = {c.name for c in Company.__table__.columns}
        assert "country" in columns, "Company doit avoir 'country'"


# ===========================================================================
# 4. Timezone — defaut Afrique Centrale
# ===========================================================================


class TestTimezone:
    """Le timezone par defaut doit etre africain, pas Europe/Paris."""

    AFRICAN_TIMEZONES = {
        "Africa/Libreville",
        "Africa/Douala",
        "Africa/Brazzaville",
        "Africa/Kinshasa",
        "Africa/Lagos",
    }

    @pytest.mark.xfail(reason="Defaut actuel = 'Europe/Paris'")
    def test_interview_schedule_timezone_default_is_african(self):
        col = InterviewSchedule.__table__.columns["timezone"]
        default_value = col.default.arg if col.default else None
        assert default_value in self.AFRICAN_TIMEZONES, (
            f"InterviewSchedule.timezone default = '{default_value}', "
            f"attendu un fuseau africain parmi {self.AFRICAN_TIMEZONES}"
        )


# ===========================================================================
# 5. Champs d'audit (created_at, updated_at) sur modeles critiques
# ===========================================================================


class TestAuditFields:
    """Les modeles metier doivent avoir des champs d'audit."""

    AUDITED_MODELS = [User, Candidate, Company, Job, JobApplication]

    @pytest.mark.parametrize(
        "model",
        AUDITED_MODELS,
        ids=lambda m: m.__tablename__,
    )
    def test_model_has_created_at(self, model):
        columns = {c.name for c in model.__table__.columns}
        # JobApplication utilise 'applied_at' comme timestamp de creation
        has_creation_ts = "created_at" in columns or "applied_at" in columns
        assert has_creation_ts, (
            f"{model.__tablename__} doit avoir 'created_at' ou 'applied_at'"
        )

    @pytest.mark.parametrize(
        "model",
        AUDITED_MODELS,
        ids=lambda m: m.__tablename__,
    )
    def test_model_has_updated_at(self, model):
        columns = {c.name for c in model.__table__.columns}
        assert "updated_at" in columns, (
            f"{model.__tablename__} doit avoir 'updated_at'"
        )
