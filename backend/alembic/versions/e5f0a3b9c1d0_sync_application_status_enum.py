"""sync application status enum with database

Revision ID: e5f0a3b9c1d0
Revises: d4e9f0a2b8c9
Create Date: 2025-12-22 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5f0a3b9c1d0'
down_revision: Union[str, None] = 'd4e9f0a2b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL : Modifier l'enum pour utiliser des minuscules
    # L'enum existant a: APPLIED, VIEWED, SHORTLISTED, INTERVIEW, ACCEPTED, REJECTED
    # On veut: applied, viewed, shortlisted, interview, accepted, rejected
    
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'APPLIED' TO 'applied'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'VIEWED' TO 'viewed'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'SHORTLISTED' TO 'shortlisted'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'INTERVIEW' TO 'interview'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'ACCEPTED' TO 'accepted'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'REJECTED' TO 'rejected'")


def downgrade() -> None:
    # Remettre en majuscules
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'applied' TO 'APPLIED'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'viewed' TO 'VIEWED'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'shortlisted' TO 'SHORTLISTED'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'interview' TO 'INTERVIEW'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'accepted' TO 'ACCEPTED'")
    op.execute("ALTER TYPE applicationstatus RENAME VALUE 'rejected' TO 'REJECTED'")
