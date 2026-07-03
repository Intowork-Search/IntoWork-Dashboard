"""add_job_listing_indexes

Revision ID: z1a2b3c4d5e6
Revises: y9z0a1b2c3d4
Create Date: 2026-07-03 00:00:00.000000

Ajoute des index pour accélérer la liste publique des offres (/api/jobs) :
- index composite (status, posted_at) : filtre status == published + tri par posted_at desc
- index sur company_id : jointure Job -> Company

Utilise IF NOT EXISTS pour être idempotent (colonnes déjà indexées côté modèle : title, country, zone, language).
"""
from alembic import op


# revision identifiers
revision = 'z1a2b3c4d5e6'
down_revision = 'y9z0a1b2c3d4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_jobs_status_posted_at "
        "ON jobs (status, posted_at DESC)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_jobs_company_id "
        "ON jobs (company_id)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_jobs_company_id")
    op.execute("DROP INDEX IF EXISTS ix_jobs_status_posted_at")
