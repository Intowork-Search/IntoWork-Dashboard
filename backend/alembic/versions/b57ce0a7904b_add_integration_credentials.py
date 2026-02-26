"""add_integration_credentials

Revision ID: b57ce0a7904b
Revises: dcf183cb7a4f
Create Date: 2026-02-26 13:20:28.249762

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = 'b57ce0a7904b'
down_revision: Union[str, None] = 'dcf183cb7a4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create integration_credentials table
    op.create_table(
        'integration_credentials',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('company_id', sa.Integer, sa.ForeignKey('companies.id'), nullable=False, index=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('provider', sa.Enum('LINKEDIN', 'GOOGLE_CALENDAR', 'OUTLOOK_CALENDAR', 
                                      'JOBBERMAN', 'BRIGHTERMONDAY',
                                      name='integrationprovider'), nullable=False, index=True),
        sa.Column('access_token', sa.Text, nullable=False),
        sa.Column('refresh_token', sa.Text, nullable=True),
        sa.Column('token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('provider_data', JSONB, nullable=True),
        sa.Column('is_active', sa.Boolean, default=True, index=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('integration_credentials')
    op.execute('DROP TYPE IF EXISTS integrationprovider')

