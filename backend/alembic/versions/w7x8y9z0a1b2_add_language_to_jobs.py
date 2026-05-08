"""add language column to jobs

Revision ID: w7x8y9z0a1b2
Revises: v6w7x8y9z0a1
Create Date: 2026-05-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'w7x8y9z0a1b2'
down_revision: Union[str, None] = 'v6w7x8y9z0a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'jobs',
        sa.Column('language', sa.String(), nullable=True)
    )
    op.create_index('ix_jobs_language', 'jobs', ['language'])


def downgrade() -> None:
    op.drop_index('ix_jobs_language', table_name='jobs')
    op.drop_column('jobs', 'language')
