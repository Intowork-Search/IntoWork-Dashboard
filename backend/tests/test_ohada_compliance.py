"""
Tests de conformite OHADA / SYSCOHADA.

CLAUDE.md exige :
- Archivage legal conforme aux durees OHADA
- Plans comptables SYSCOHADA dans les modeles financiers
- Facturation en FCFA (XAF/XOF)

Ces tests verifient la presence des mecanismes d'archivage et de soft delete.
"""

import pytest

from app.models.base import Job, JobApplication, Company

pytestmark = [pytest.mark.business_context, pytest.mark.ohada]


# ===========================================================================
# 1. Archivage legal — champs soft delete
# ===========================================================================


class TestSoftDeleteFields:
    """Les modeles financiers doivent supporter le soft delete pour l'archivage OHADA."""

    FINANCIAL_MODELS = [Job, JobApplication, Company]

    @pytest.mark.xfail(reason="Champ 'archived_at' absent — archivage OHADA non implemente")
    @pytest.mark.parametrize(
        "model",
        FINANCIAL_MODELS,
        ids=lambda m: m.__tablename__,
    )
    def test_model_has_archived_at(self, model):
        columns = {c.name for c in model.__table__.columns}
        assert "archived_at" in columns, (
            f"{model.__tablename__} doit avoir 'archived_at' pour l'archivage OHADA"
        )

    @pytest.mark.xfail(reason="Champ 'archived_by' absent")
    @pytest.mark.parametrize(
        "model",
        FINANCIAL_MODELS,
        ids=lambda m: m.__tablename__,
    )
    def test_model_has_archived_by(self, model):
        columns = {c.name for c in model.__table__.columns}
        assert "archived_by" in columns, (
            f"{model.__tablename__} doit avoir 'archived_by' pour tracabilite OHADA"
        )


# ===========================================================================
# 2. Retention — constantes de duree legale
# ===========================================================================


class TestRetentionPolicy:

    @pytest.mark.xfail(reason="Constante OHADA_RETENTION_YEARS non definie")
    def test_retention_constant_exists(self):
        """Une constante de retention legale OHADA doit etre definie."""
        try:
            from app.constants import OHADA_RETENTION_YEARS
            assert OHADA_RETENTION_YEARS >= 10, (
                f"La retention OHADA doit etre >= 10 ans, got {OHADA_RETENTION_YEARS}"
            )
        except ImportError:
            pytest.fail(
                "OHADA_RETENTION_YEARS doit etre importable depuis app.constants"
            )


# ===========================================================================
# 3. Statut Job — ARCHIVED doit exister
# ===========================================================================


class TestJobArchiveStatus:

    def test_job_status_includes_archived(self):
        """Le statut 'archived' doit exister dans JobStatus pour l'archivage OHADA."""
        from app.models.base import JobStatus
        statuses = {s.value for s in JobStatus}
        assert "archived" in statuses, (
            f"JobStatus doit inclure 'archived', valeurs actuelles: {statuses}"
        )
