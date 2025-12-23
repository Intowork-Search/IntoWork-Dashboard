"""add notifications table

Revision ID: f6a0b4c3d2e1
Revises: e5f0a3b9c1d0
Create Date: 2025-12-23 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f6a0b4c3d2e1'
down_revision = 'e5f0a3b9c1d0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Créer l'enum NotificationType seulement s'il n'existe pas
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE notificationtype AS ENUM ('new_application', 'status_change', 'new_job', 'message', 'system');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # Créer la table notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', postgresql.ENUM('new_application', 'status_change', 'new_job', 'message', 'system', name='notificationtype', create_type=False), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('related_job_id', sa.Integer(), nullable=True),
        sa.Column('related_application_id', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['related_job_id'], ['jobs.id'], ),
        sa.ForeignKeyConstraint(['related_application_id'], ['job_applications.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Créer les index
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])
    op.create_index('ix_notifications_created_at', 'notifications', ['created_at'])


def downgrade() -> None:
    # Supprimer les index
    op.drop_index('ix_notifications_created_at', table_name='notifications')
    op.drop_index('ix_notifications_is_read', table_name='notifications')
    op.drop_index('ix_notifications_user_id', table_name='notifications')
    
    # Supprimer la table
    op.drop_table('notifications')
    
    # Supprimer l'enum
    notification_type_enum = postgresql.ENUM(
        'new_application',
        'status_change',
        'new_job',
        'message',
        'system',
        name='notificationtype'
    )
    notification_type_enum.drop(op.get_bind(), checkfirst=True)
