"""add_ats_features_phase2

Revision ID: dcf183cb7a4f
Revises: ed6f9ef28482
Create Date: 2026-02-26 12:57:28.648709

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = 'dcf183cb7a4f'
down_revision: Union[str, None] = 'ed6f9ef28482'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add collaborative fields to job_applications
    op.add_column('job_applications', sa.Column('recruiter_notes', JSONB, nullable=True))
    op.add_column('job_applications', sa.Column('rating', sa.Integer, nullable=True))
    op.add_column('job_applications', sa.Column('tags', JSONB, nullable=True))
    op.add_column('job_applications', sa.Column('scorecard', JSONB, nullable=True))
    
    # 2. Create email_templates table
    op.create_table(
        'email_templates',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('company_id', sa.Integer, sa.ForeignKey('companies.id'), nullable=False, index=True),
        sa.Column('created_by_user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('type', sa.Enum('WELCOME_CANDIDATE', 'APPLICATION_RECEIVED', 'APPLICATION_REJECTED', 
                                  'INTERVIEW_INVITATION', 'INTERVIEW_CONFIRMATION', 'INTERVIEW_REMINDER',
                                  'OFFER_LETTER', 'ONBOARDING', 'CUSTOM', 
                                  name='emailtemplatetype'), nullable=False, index=True),
        sa.Column('subject', sa.String, nullable=False),
        sa.Column('body', sa.Text, nullable=False),
        sa.Column('is_active', sa.Boolean, default=True, index=True),
        sa.Column('is_default', sa.Boolean, default=False),
        sa.Column('usage_count', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    # 3. Create job_alerts table
    op.create_table(
        'job_alerts',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('candidate_id', sa.Integer, sa.ForeignKey('candidates.id'), nullable=False, index=True),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('criteria', JSONB, nullable=False),
        sa.Column('frequency', sa.Enum('INSTANT', 'DAILY', 'WEEKLY', name='jobalertfrequency'), 
                  nullable=False, default='DAILY'),
        sa.Column('is_active', sa.Boolean, default=True, index=True),
        sa.Column('jobs_sent_count', sa.Integer, default=0),
        sa.Column('last_sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_matching_job_id', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # 4. Create interview_schedules table
    op.create_table(
        'interview_schedules',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('application_id', sa.Integer, sa.ForeignKey('job_applications.id'), nullable=False, index=True),
        sa.Column('created_by_user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String, nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('location', sa.String, nullable=True),
        sa.Column('meeting_link', sa.String, nullable=True),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('duration_minutes', sa.Integer, default=60),
        sa.Column('timezone', sa.String, default='Europe/Paris'),
        sa.Column('interviewers', JSONB, nullable=True),
        sa.Column('candidate_email', sa.String, nullable=False),
        sa.Column('status', sa.Enum('SCHEDULED', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'RESCHEDULED',
                                    name='interviewschedulestatus'), nullable=False, default='SCHEDULED'),
        sa.Column('google_event_id', sa.String, nullable=True),
        sa.Column('outlook_event_id', sa.String, nullable=True),
        sa.Column('reminder_sent', sa.Boolean, default=False),
        sa.Column('confirmation_received', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # 5. Create job_postings table (multi-channel publishing)
    op.create_table(
        'job_postings',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('job_id', sa.Integer, sa.ForeignKey('jobs.id'), nullable=False, index=True),
        sa.Column('channel', sa.Enum('INTOWORK', 'LINKEDIN', 'JOBBERMAN', 'BRIGHTERMONDAY', 
                                     'FACEBOOK', 'TWITTER', 'CUSTOM',
                                     name='jobpostingchannel'), nullable=False, index=True),
        sa.Column('external_id', sa.String, nullable=True),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('posted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('views_count', sa.Integer, default=0),
        sa.Column('clicks_count', sa.Integer, default=0),
        sa.Column('applications_count', sa.Integer, default=0),
        sa.Column('posting_data', JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('job_postings')
    op.drop_table('interview_schedules')
    op.drop_table('job_alerts')
    op.drop_table('email_templates')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS jobpostingchannel')
    op.execute('DROP TYPE IF EXISTS interviewschedulestatus')
    op.execute('DROP TYPE IF EXISTS jobalertfrequency')
    op.execute('DROP TYPE IF EXISTS emailtemplatetype')
    
    # Remove columns from job_applications
    op.drop_column('job_applications', 'scorecard')
    op.drop_column('job_applications', 'tags')
    op.drop_column('job_applications', 'rating')
    op.drop_column('job_applications', 'recruiter_notes')
