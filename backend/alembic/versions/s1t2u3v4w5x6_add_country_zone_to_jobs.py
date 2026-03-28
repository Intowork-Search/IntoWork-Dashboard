"""add country and zone to jobs

Revision ID: s1t2u3v4w5x6
Revises: r9i0j1k2l3m4
Create Date: 2026-03-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 's1t2u3v4w5x6'
down_revision: Union[str, None] = 'r9i0j1k2l3m4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajouter les colonnes country et zone à la table jobs
    op.add_column('jobs', sa.Column('country', sa.String(), nullable=True))
    op.add_column('jobs', sa.Column('zone', sa.String(), nullable=True))
    op.create_index(op.f('ix_jobs_country'), 'jobs', ['country'], unique=False)
    op.create_index(op.f('ix_jobs_zone'), 'jobs', ['zone'], unique=False)

    # Changer le défaut de currency de EUR à XAF
    op.alter_column('jobs', 'currency',
                     existing_type=sa.String(),
                     server_default='XAF')

    # Migrer les offres existantes : hériter country depuis Company
    op.execute("""
        UPDATE jobs
        SET country = companies.country
        FROM companies
        WHERE jobs.company_id = companies.id
          AND jobs.country IS NULL
          AND companies.country IS NOT NULL
    """)

    # Assigner la zone CEMAC pour les pays CEMAC connus
    op.execute("""
        UPDATE jobs
        SET zone = 'CEMAC'
        WHERE country IN ('GA', 'CM', 'CG', 'TD', 'CF', 'GQ')
          AND zone IS NULL
    """)

    # Assigner la zone UEMOA pour les pays UEMOA connus
    op.execute("""
        UPDATE jobs
        SET zone = 'UEMOA'
        WHERE country IN ('CI', 'SN', 'ML', 'BF', 'NE', 'TG', 'BJ', 'GW')
          AND zone IS NULL
    """)


def downgrade() -> None:
    op.drop_index(op.f('ix_jobs_zone'), table_name='jobs')
    op.drop_index(op.f('ix_jobs_country'), table_name='jobs')
    op.drop_column('jobs', 'zone')
    op.drop_column('jobs', 'country')
    op.alter_column('jobs', 'currency',
                     existing_type=sa.String(),
                     server_default='EUR')
