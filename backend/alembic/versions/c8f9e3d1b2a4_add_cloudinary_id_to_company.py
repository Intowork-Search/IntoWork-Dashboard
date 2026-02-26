"""Add cloudinary_id to Company model

Revision ID: c8f9e3d1b2a4
Revises: b57ce0a7904b
Create Date: 2026-02-26 

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c8f9e3d1b2a4'
down_revision = 'b57ce0a7904b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add cloudinary_id column to companies table
    op.add_column('companies', sa.Column('cloudinary_id', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove cloudinary_id column from companies table
    op.drop_column('companies', 'cloudinary_id')
