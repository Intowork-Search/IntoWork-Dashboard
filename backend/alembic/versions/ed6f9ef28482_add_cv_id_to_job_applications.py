"""add cv_id to job_applications

Revision ID: ed6f9ef28482
Revises: k2b3c4d5e6f7
Create Date: 2026-01-30 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed6f9ef28482'
down_revision: Union[str, None] = 'k2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajouter la colonne cv_id pour lier à un CV spécifique
    op.add_column('job_applications', sa.Column('cv_id', sa.Integer(), nullable=True))
    
    # Créer la foreign key vers candidate_cvs
    op.create_foreign_key(
        'fk_job_applications_cv_id',
        'job_applications',
        'candidate_cvs',
        ['cv_id'],
        ['id'],
        ondelete='SET NULL'
    )
    
    # Créer un index pour optimiser les requêtes
    op.create_index('idx_job_applications_cv_id', 'job_applications', ['cv_id'])


def downgrade() -> None:
    # Supprimer l'index
    op.drop_index('idx_job_applications_cv_id', table_name='job_applications')
    
    # Supprimer la foreign key
    op.drop_constraint('fk_job_applications_cv_id', 'job_applications', type_='foreignkey')
    
    # Supprimer la colonne
    op.drop_column('job_applications', 'cv_id')
