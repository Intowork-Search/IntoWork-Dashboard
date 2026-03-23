"""remove clerk_id from users

Revision ID: r9i0j1k2l3m4
Revises: q8h9i0j1k2l3
Create Date: 2026-03-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'r9i0j1k2l3m4'
down_revision: Union[str, None] = 'q8h9i0j1k2l3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Supprimer l'index sur clerk_id
    op.drop_index('ix_users_clerk_id', table_name='users', if_exists=True)
    # Supprimer la colonne clerk_id
    op.drop_column('users', 'clerk_id')


def downgrade() -> None:
    # Recréer la colonne clerk_id (nullable pour la compatibilité)
    op.add_column('users', sa.Column('clerk_id', sa.String(), nullable=True))
    op.create_index('ix_users_clerk_id', 'users', ['clerk_id'], unique=True)
