"""add ai scoring fields

Revision ID: k2b3c4d5e6f7
Revises: j1a2b3c4d5e6
Create Date: 2026-01-30 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'k2b3c4d5e6f7'
down_revision = 'j1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ajouter les champs de scoring IA à job_applications
    op.add_column('job_applications', sa.Column('ai_score', sa.Float(), nullable=True))
    op.add_column('job_applications', sa.Column('ai_score_details', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('job_applications', sa.Column('ai_analyzed_at', sa.DateTime(timezone=True), nullable=True))
    
    # Index pour trier par score
    op.create_index('idx_job_applications_ai_score', 'job_applications', ['job_id', 'ai_score'], unique=False)


def downgrade() -> None:
    # Supprimer l'index
    op.drop_index('idx_job_applications_ai_score', table_name='job_applications')
    
    # Supprimer les colonnes
    op.drop_column('job_applications', 'ai_analyzed_at')
    op.drop_column('job_applications', 'ai_score_details')
    op.drop_column('job_applications', 'ai_score')
