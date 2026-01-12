"""merge_migration_heads

Revision ID: e6b45eef5a30
Revises: g7b1c5d4e3f2, i9d3e6f5h4j5
Create Date: 2026-01-07 10:23:38.511018

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6b45eef5a30'
down_revision: Union[str, None] = ('g7b1c5d4e3f2', 'i9d3e6f5h4j5')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
