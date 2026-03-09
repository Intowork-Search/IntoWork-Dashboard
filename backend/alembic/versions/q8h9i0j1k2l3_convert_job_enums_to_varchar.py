"""convert_job_enums_to_varchar

Revision ID: q8h9i0j1k2l3
Revises: p7g8h9i0j1k2
Create Date: 2026-03-09 03:00:00.000000

Switch job_type, location_type, status columns from PG native enum to VARCHAR.
This is required because SQLAlchemy model now uses native_enum=False.
"""
from typing import Sequence, Union
from alembic import op
from sqlalchemy import text

revision: str = 'q8h9i0j1k2l3'
down_revision: Union[str, None] = 'p7g8h9i0j1k2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Convert all three columns to VARCHAR, lowercasing any UPPERCASE values.
    # These ALTER TABLE statements can run inside a transaction (unlike ADD VALUE).
    conn.execute(text(
        "ALTER TABLE jobs ALTER COLUMN job_type TYPE VARCHAR(50) "
        "USING lower(job_type::text)"
    ))
    conn.execute(text(
        "ALTER TABLE jobs ALTER COLUMN location_type TYPE VARCHAR(50) "
        "USING lower(location_type::text)"
    ))
    conn.execute(text(
        "ALTER TABLE jobs ALTER COLUMN status TYPE VARCHAR(50) "
        "USING lower(status::text)"
    ))

    # Drop now-unused PG enum types (safe inside a transaction)
    conn.execute(text("DROP TYPE IF EXISTS jobtype CASCADE"))
    conn.execute(text("DROP TYPE IF EXISTS joblocation CASCADE"))
    conn.execute(text("DROP TYPE IF EXISTS jobstatus CASCADE"))


def downgrade() -> None:
    pass
