"""Add CV Builder tables - CVDocument and CVAnalytics

This migration adds:
1. cv_documents table - stores CV data as JSON with templates and public sharing
2. cv_analytics table - tracks views, downloads, and visitor analytics

Inspired by 5minportfolio.dev for portfolio/CV building with:
- Multiple templates support
- Public URL sharing via slugs
- PDF generation cache
- Comprehensive analytics

Revision ID: j1a2b3c4d5e6
Revises: 8e971a8beea1
Create Date: 2026-01-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'j1a2b3c4d5e6'
down_revision: Union[str, None] = '8e971a8beea1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create CV Builder tables
    """
    # Create cv_documents table
    op.create_table(
        'cv_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('cv_data', sa.Text(), nullable=False),
        sa.Column('template', sa.Enum('elegance', 'bold', 'minimal', 'creative', 'executive', name='cvtemplate'), nullable=False, server_default='elegance'),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('views_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('downloads_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('pdf_url', sa.String(), nullable=True),
        sa.Column('pdf_generated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for cv_documents
    op.create_index('ix_cv_documents_id', 'cv_documents', ['id'])
    op.create_index('ix_cv_documents_user_id', 'cv_documents', ['user_id'])
    op.create_index('ix_cv_documents_slug', 'cv_documents', ['slug'], unique=True)
    op.create_index('ix_cv_documents_is_public', 'cv_documents', ['is_public'])

    # Create cv_analytics table
    op.create_table(
        'cv_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cv_document_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('user_agent', sa.String(), nullable=True),
        sa.Column('referrer', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['cv_document_id'], ['cv_documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for cv_analytics
    op.create_index('ix_cv_analytics_id', 'cv_analytics', ['id'])
    op.create_index('ix_cv_analytics_cv_document_id', 'cv_analytics', ['cv_document_id'])
    op.create_index('ix_cv_analytics_event_type', 'cv_analytics', ['event_type'])
    op.create_index('ix_cv_analytics_created_at', 'cv_analytics', ['created_at'])

    # Composite index for analytics queries
    op.create_index(
        'ix_cv_analytics_document_event_date',
        'cv_analytics',
        ['cv_document_id', 'event_type', 'created_at']
    )


def downgrade() -> None:
    """
    Drop CV Builder tables
    """
    # Drop indexes first
    op.drop_index('ix_cv_analytics_document_event_date', table_name='cv_analytics')
    op.drop_index('ix_cv_analytics_created_at', table_name='cv_analytics')
    op.drop_index('ix_cv_analytics_event_type', table_name='cv_analytics')
    op.drop_index('ix_cv_analytics_cv_document_id', table_name='cv_analytics')
    op.drop_index('ix_cv_analytics_id', table_name='cv_analytics')

    op.drop_index('ix_cv_documents_is_public', table_name='cv_documents')
    op.drop_index('ix_cv_documents_slug', table_name='cv_documents')
    op.drop_index('ix_cv_documents_user_id', table_name='cv_documents')
    op.drop_index('ix_cv_documents_id', table_name='cv_documents')

    # Drop tables
    op.drop_table('cv_analytics')
    op.drop_table('cv_documents')

    # Drop enum type
    op.execute('DROP TYPE IF EXISTS cvtemplate')
