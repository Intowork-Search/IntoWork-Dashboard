"""add_internship_to_jobtype_enum

Revision ID: n5e6f7g8h9i0
Revises: m4d5e6f7g8h9
Create Date: 2026-03-09 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = 'n5e6f7g8h9i0'
down_revision: Union[str, None] = 'm4d5e6f7g8h9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ALTER TYPE ADD VALUE cannot run inside a transaction in PG < 12.
    # Railway uses PG 15+, so IF NOT EXISTS is safe.
    op.execute("ALTER TYPE jobtype ADD VALUE IF NOT EXISTS 'internship'")
    op.execute("ALTER TYPE joblocation ADD VALUE IF NOT EXISTS 'hybrid'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values — intentionally a no-op
    pass
