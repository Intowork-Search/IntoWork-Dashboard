"""add_targetym_job_posting_id_to_jobs

Revision ID: m4d5e6f7g8h9
Revises: l3c4d5e6f7g8
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'm4d5e6f7g8h9'
down_revision: Union[str, None] = 'l3c4d5e6f7g8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Utilisation de IF NOT EXISTS pour idempotence
    op.execute("""
        ALTER TABLE jobs
            ADD COLUMN IF NOT EXISTS targetym_job_posting_id INTEGER
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_jobs_targetym_job_posting_id
            ON jobs (targetym_job_posting_id)
    """)


def downgrade() -> None:
    op.drop_index('ix_jobs_targetym_job_posting_id', table_name='jobs')
    op.drop_column('jobs', 'targetym_job_posting_id')
