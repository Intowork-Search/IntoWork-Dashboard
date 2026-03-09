"""recreate_job_enums_lowercase

Revision ID: p7g8h9i0j1k2
Revises: o6f7g8h9i0j1
Create Date: 2026-03-09 02:00:00.000000

The PG enums jobtype/joblocation/jobstatus were created with UPPERCASE values
(FULL_TIME, ON_SITE...) but the SQLAlchemy model uses lowercase values
(full_time, on_site...). This migration recreates them with lowercase values.

Uses raw COMMIT to exit Alembic's transaction (required for DROP TYPE / CREATE TYPE).
"""
from typing import Sequence, Union
from alembic import op
from sqlalchemy import text

revision: str = 'p7g8h9i0j1k2'
down_revision: Union[str, None] = 'o6f7g8h9i0j1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Exit the current transaction — required for DROP TYPE / CREATE TYPE
    conn.execute(text("COMMIT"))

    # ── Convert job_type column to text so we can drop the enum ──
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

    # ── Drop old UPPERCASE enums ──
    # (ignore if they don't exist)
    conn.execute(text("DROP TYPE IF EXISTS jobtype CASCADE"))
    conn.execute(text("DROP TYPE IF EXISTS joblocation CASCADE"))
    conn.execute(text("DROP TYPE IF EXISTS jobstatus CASCADE"))

    # ── Recreate with lowercase values ──
    conn.execute(text(
        "CREATE TYPE jobtype AS ENUM "
        "('full_time','part_time','contract','temporary','internship')"
    ))
    conn.execute(text(
        "CREATE TYPE joblocation AS ENUM "
        "('on_site','remote','hybrid')"
    ))
    conn.execute(text(
        "CREATE TYPE jobstatus AS ENUM "
        "('draft','published','closed','archived')"
    ))

    # ── Restore typed columns ──
    conn.execute(text(
        "ALTER TABLE jobs ALTER COLUMN job_type TYPE jobtype "
        "USING job_type::jobtype"
    ))
    conn.execute(text(
        "ALTER TABLE jobs ALTER COLUMN location_type TYPE joblocation "
        "USING location_type::joblocation"
    ))
    conn.execute(text(
        "ALTER TABLE jobs ALTER COLUMN status TYPE jobstatus "
        "USING status::jobstatus"
    ))

    # Re-open a transaction for Alembic to write alembic_version
    conn.execute(text("BEGIN"))


def downgrade() -> None:
    pass
