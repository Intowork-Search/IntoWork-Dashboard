"""Add is_verified and verified_at to Company model

Revision ID: u5v6w7x8y9z0
Revises: c8f9e3d1b2a4
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'u5v6w7x8y9z0'
down_revision = 'c8f9e3d1b2a4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('companies', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('companies', sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('companies', 'verified_at')
    op.drop_column('companies', 'is_verified')
