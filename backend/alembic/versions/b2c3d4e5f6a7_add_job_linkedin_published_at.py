"""add_job_linkedin_published_at

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-03 00:00:00.000000

Ajoute une colonne optionnelle à la table jobs pour tracer la dernière
publication de l'offre sur LinkedIn :
- linkedin_published_at : timestamp de la dernière publication (NULL = jamais)

Utilise IF NOT EXISTS pour être idempotent.
"""
from alembic import op


# revision identifiers
revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS linkedin_published_at TIMESTAMPTZ"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE jobs DROP COLUMN IF EXISTS linkedin_published_at")
