"""add_refresh_token_to_sessions

Add refresh_token_hash column to sessions table for JWT refresh token support.
Refresh tokens have 7-day expiration and are stored as bcrypt hashes for security.

Revision ID: 8e971a8beea1
Revises: e6b45eef5a30
Create Date: 2026-01-07 10:27:18.702449

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e971a8beea1'
down_revision: Union[str, None] = 'e6b45eef5a30'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add refresh_token_hash column to sessions table
    """
    # Add refresh_token_hash column (nullable to allow gradual rollout)
    op.add_column('sessions', sa.Column('refresh_token_hash', sa.String(length=255), nullable=True))

    # Add index for fast refresh token lookup
    op.create_index(
        'idx_sessions_refresh_token',
        'sessions',
        ['refresh_token_hash'],
        unique=False,
        if_not_exists=True
    )


def downgrade() -> None:
    """
    Remove refresh_token_hash column from sessions table
    """
    # Remove index first
    op.drop_index('idx_sessions_refresh_token', table_name='sessions', if_exists=True)

    # Remove column
    op.drop_column('sessions', 'refresh_token_hash')
