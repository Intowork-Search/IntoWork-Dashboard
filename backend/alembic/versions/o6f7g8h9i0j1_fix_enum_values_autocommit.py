"""fix_enum_values_autocommit

Revision ID: o6f7g8h9i0j1
Revises: n5e6f7g8h9i0
Create Date: 2026-03-09 01:00:00.000000

ALTER TYPE ADD VALUE cannot run inside a transaction.
This migration uses AUTOCOMMIT to work around that PostgreSQL constraint.
"""
from typing import Sequence, Union
from alembic import op
from sqlalchemy import text

revision: str = 'o6f7g8h9i0j1'
down_revision: Union[str, None] = 'n5e6f7g8h9i0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ALTER TYPE ADD VALUE must run outside a transaction in PostgreSQL.
    connection = op.get_bind()
    connection = connection.execution_options(isolation_level="AUTOCOMMIT")

    for value in ('full_time', 'part_time', 'contract', 'temporary', 'internship'):
        connection.execute(
            text(f"ALTER TYPE jobtype ADD VALUE IF NOT EXISTS '{value}'")
        )

    for value in ('on_site', 'remote', 'hybrid'):
        connection.execute(
            text(f"ALTER TYPE joblocation ADD VALUE IF NOT EXISTS '{value}'")
        )


def downgrade() -> None:
    # PostgreSQL does not support removing enum values — intentionally a no-op
    pass
