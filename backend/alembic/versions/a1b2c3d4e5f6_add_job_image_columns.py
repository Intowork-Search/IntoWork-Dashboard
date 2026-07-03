"""add_job_image_columns

Revision ID: a1b2c3d4e5f6
Revises: z1a2b3c4d5e6
Create Date: 2026-07-03 00:00:00.000000

Ajoute deux colonnes optionnelles à la table jobs pour le visuel d'une offre :
- image_url : URL Cloudinary de l'image (HTTPS)
- image_cloudinary_id : public_id Cloudinary (pour suppression)

Utilise IF NOT EXISTS pour être idempotent.
"""
from alembic import op


# revision identifiers
revision = 'a1b2c3d4e5f6'
down_revision = 'z1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS image_url VARCHAR")
    op.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS image_cloudinary_id VARCHAR")


def downgrade() -> None:
    op.execute("ALTER TABLE jobs DROP COLUMN IF EXISTS image_cloudinary_id")
    op.execute("ALTER TABLE jobs DROP COLUMN IF EXISTS image_url")
