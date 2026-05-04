"""merge heads: t2u3v4w5x6y7 and u5v6w7x8y9z0

Revision ID: v6w7x8y9z0a1
Revises: t2u3v4w5x6y7, u5v6w7x8y9z0
Create Date: 2026-05-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'v6w7x8y9z0a1'
down_revision: Union[str, None] = ('t2u3v4w5x6y7', 'u5v6w7x8y9z0')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
