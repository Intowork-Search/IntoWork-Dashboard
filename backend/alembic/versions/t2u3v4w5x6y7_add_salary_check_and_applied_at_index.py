"""add salary check constraint and applied_at index

Revision ID: t2u3v4w5x6y7
Revises: s1t2u3v4w5x6
Create Date: 2026-03-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 't2u3v4w5x6y7'
down_revision: Union[str, None] = 's1t2u3v4w5x6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Contrainte CHECK : salary_min <= salary_max (ignore si les deux sont NULL)
    op.create_check_constraint(
        'ck_jobs_salary_min_lte_max',
        'jobs',
        'salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max'
    )

    # Index sur applied_at pour accélérer les requêtes triées par date de candidature
    op.create_index(
        'ix_job_applications_applied_at',
        'job_applications',
        ['applied_at'],
    )

    # Index sur status pour filtrer les candidatures par statut
    op.create_index(
        'ix_job_applications_status',
        'job_applications',
        ['status'],
    )


def downgrade() -> None:
    op.drop_index('ix_job_applications_status', table_name='job_applications')
    op.drop_index('ix_job_applications_applied_at', table_name='job_applications')
    op.drop_constraint('ck_jobs_salary_min_lte_max', 'jobs', type_='check')
