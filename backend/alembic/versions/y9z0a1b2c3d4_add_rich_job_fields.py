"""add_rich_job_fields

Revision ID: y9z0a1b2c3d4
Revises: x8y9z0a1b2c3
Create Date: 2025-07-01 00:00:00.000000

Ajoute les champs enrichis pour les offres d'emploi :
- context : contexte du poste
- mission_principale : mission principale
- profil_formation : formation requise
- profil_experience : profil/expérience
- profil_competences : compétences
- profil_posture : posture comportementale
- profil_autre : autres critères
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = 'y9z0a1b2c3d4'
down_revision = 'x8y9z0a1b2c3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('jobs', sa.Column('context', sa.Text(), nullable=True))
    op.add_column('jobs', sa.Column('mission_principale', sa.Text(), nullable=True))
    op.add_column('jobs', sa.Column('profil_formation', sa.Text(), nullable=True))
    op.add_column('jobs', sa.Column('profil_experience', sa.Text(), nullable=True))
    op.add_column('jobs', sa.Column('profil_competences', sa.Text(), nullable=True))
    op.add_column('jobs', sa.Column('profil_posture', sa.Text(), nullable=True))
    op.add_column('jobs', sa.Column('profil_autre', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('jobs', 'profil_autre')
    op.drop_column('jobs', 'profil_posture')
    op.drop_column('jobs', 'profil_competences')
    op.drop_column('jobs', 'profil_experience')
    op.drop_column('jobs', 'profil_formation')
    op.drop_column('jobs', 'mission_principale')
    op.drop_column('jobs', 'context')
