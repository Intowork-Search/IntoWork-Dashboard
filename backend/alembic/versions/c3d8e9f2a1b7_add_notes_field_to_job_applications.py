"""add notes field to job applications

Revision ID: c3d8e9f2a1b7
Revises: b58fbc6d62f4
Create Date: 2025-12-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d8e9f2a1b7'
down_revision: Union[str, None] = 'b58fbc6d62f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajouter le champ notes à la table job_applications
    op.add_column('job_applications', sa.Column('notes', sa.Text(), nullable=True))


def downgrade() -> None:
    # Supprimer le champ notes
    op.drop_column('job_applications', 'notes')
