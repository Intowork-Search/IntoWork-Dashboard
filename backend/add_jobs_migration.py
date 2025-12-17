"""Add jobs and applications tables

Revision ID: add_jobs_tables
Revises: 
Create Date: 2025-12-17

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'add_jobs_tables'
down_revision = None
depends_on = None

def upgrade():
    # Create enum types
    op.execute("CREATE TYPE jobtype AS ENUM ('full_time', 'part_time', 'contract', 'temporary', 'internship')")
    op.execute("CREATE TYPE joblocation AS ENUM ('on_site', 'remote', 'hybrid')")
    op.execute("CREATE TYPE jobstatus AS ENUM ('draft', 'published', 'closed', 'archived')")
    op.execute("CREATE TYPE applicationstatus AS ENUM ('applied', 'viewed', 'shortlisted', 'interview', 'rejected', 'accepted')")

    # Create jobs table
    op.create_table('jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employer_id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('responsibilities', sa.Text(), nullable=True),
        sa.Column('benefits', sa.Text(), nullable=True),
        sa.Column('job_type', postgresql.ENUM('full_time', 'part_time', 'contract', 'temporary', 'internship', name='jobtype'), nullable=False),
        sa.Column('location_type', postgresql.ENUM('on_site', 'remote', 'hybrid', name='joblocation'), nullable=False),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('status', postgresql.ENUM('draft', 'published', 'closed', 'archived', name='jobstatus'), nullable=False),
        sa.Column('is_featured', sa.Boolean(), nullable=True),
        sa.Column('views_count', sa.Integer(), nullable=True),
        sa.Column('applications_count', sa.Integer(), nullable=True),
        sa.Column('posted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.ForeignKeyConstraint(['employer_id'], ['employers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)
    op.create_index(op.f('ix_jobs_title'), 'jobs', ['title'], unique=False)

    # Create job_applications table
    op.create_table('job_applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('status', postgresql.ENUM('applied', 'viewed', 'shortlisted', 'interview', 'rejected', 'accepted', name='applicationstatus'), nullable=False),
        sa.Column('cover_letter', sa.Text(), nullable=True),
        sa.Column('cv_url', sa.String(), nullable=True),
        sa.Column('applied_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('viewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_applications_id'), 'job_applications', ['id'], unique=False)

def downgrade():
    # Drop tables
    op.drop_index(op.f('ix_job_applications_id'), table_name='job_applications')
    op.drop_table('job_applications')
    op.drop_index(op.f('ix_jobs_title'), table_name='jobs')
    op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
    op.drop_table('jobs')
    
    # Drop enum types
    op.execute("DROP TYPE applicationstatus")
    op.execute("DROP TYPE jobstatus")
    op.execute("DROP TYPE joblocation")
    op.execute("DROP TYPE jobtype")
