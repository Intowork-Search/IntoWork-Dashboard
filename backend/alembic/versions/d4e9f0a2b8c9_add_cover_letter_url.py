"""add cover_letter_url to job applications

Revision ID: d4e9f0a2b8c9
Revises: c3d8e9f2a1b7
Create Date: 2025-12-22 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e9f0a2b8c9'
down_revision: Union[str, None] = 'c3d8e9f2a1b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajouter le champ cover_letter_url à la table job_applications
    op.add_column('job_applications', sa.Column('cover_letter_url', sa.String(), nullable=True))


def downgrade() -> None:
    # Supprimer le champ cover_letter_url
    op.drop_column('job_applications', 'cover_letter_url')
