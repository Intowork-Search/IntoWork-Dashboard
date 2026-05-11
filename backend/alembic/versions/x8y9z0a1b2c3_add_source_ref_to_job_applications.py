"""add source_ref to job_applications

Revision ID: x8y9z0a1b2c3
Revises: w7x8y9z0a1b2
Create Date: 2026-05-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'x8y9z0a1b2c3'
down_revision: Union[str, None] = 'w7x8y9z0a1b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Colonne source_ref : canal d'où provient la candidature
    # Valeurs attendues : 'whatsapp', 'email', 'linkedin', 'facebook', 'direct', ou toute ref employeur libre
    op.add_column(
        'job_applications',
        sa.Column('source_ref', sa.String(length=100), nullable=True)
    )
    # Index pour accélérer les agrégations par source (widget sources dashboard)
    op.create_index(
        'ix_job_applications_source_ref',
        'job_applications',
        ['source_ref'],
        unique=False
    )


def downgrade() -> None:
    op.drop_index('ix_job_applications_source_ref', table_name='job_applications')
    op.drop_column('job_applications', 'source_ref')
