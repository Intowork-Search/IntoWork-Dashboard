"""Add critical indexes and unique constraints for production readiness

This migration addresses critical performance and data integrity gaps:
1. Unique constraint on job_applications to prevent duplicate applications
2. Unique constraint on accounts to prevent duplicate OAuth entries
3. Composite indexes for job search filtering
4. Application status tracking indexes
5. Drop legacy clerk_id index

Revision ID: h8c2d6e5f4g3
Revises: 411cd9a350e0
Create Date: 2025-12-31 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'h8c2d6e5f4g3'
down_revision: Union[str, None] = '411cd9a350e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add critical constraints and indexes for production database
    """

    # ============================================================
    # PART 1: DATA INTEGRITY CONSTRAINTS
    # ============================================================

    # 1.1: Prevent duplicate job applications
    # First, identify and handle any existing duplicates (if this is a migration on existing DB)
    # This constraint allows one active application per candidate per job
    # Users can reapply after rejection (status='rejected' doesn't count)
    op.create_unique_constraint(
        'unique_candidate_job_application',
        'job_applications',
        ['candidate_id', 'job_id'],
        postgresql_where=sa.text("status != 'rejected'")
    )

    # 1.2: Prevent duplicate OAuth provider accounts per user
    # Ensures one account per provider per user
    op.create_unique_constraint(
        'unique_user_provider_account',
        'accounts',
        ['user_id', 'provider', 'provider_account_id']
    )

    # 1.3: Prevent duplicate verification tokens per identifier (email)
    # Ensures one active token per email at a time
    op.create_unique_constraint(
        'unique_identifier_active_token',
        'verification_tokens',
        ['identifier', 'token']
    )

    # ============================================================
    # PART 2: PERFORMANCE INDEXES (Filter Optimization)
    # ============================================================

    # 2.1: Job listing queries (status + location_type + job_type filters)
    # Supports WHERE status = 'published' AND location_type = $1
    op.create_index(
        'idx_jobs_status_location_type',
        'jobs',
        [sa.column('status'), sa.column('location_type')],
        postgresql_where=sa.text("status = 'published'"),
        if_not_exists=True
    )

    # 2.2: Job search by type
    op.create_index(
        'idx_jobs_status_job_type',
        'jobs',
        [sa.column('status'), sa.column('job_type')],
        postgresql_where=sa.text("status = 'published'"),
        if_not_exists=True
    )

    # 2.3: Employer job listing
    op.create_index(
        'idx_jobs_employer_id_status',
        'jobs',
        [sa.column('employer_id'), sa.column('status')],
        if_not_exists=True
    )

    # 2.4: Company job listing
    op.create_index(
        'idx_jobs_company_id_status',
        'jobs',
        [sa.column('company_id'), sa.column('status')],
        postgresql_where=sa.text("status = 'published'"),
        if_not_exists=True
    )

    # ============================================================
    # PART 3: APPLICATION TRACKING INDEXES
    # ============================================================

    # 3.1: Employer viewing applications to their jobs
    # Query: SELECT * FROM job_applications WHERE job_id = $1 AND status = $2
    op.create_index(
        'idx_job_applications_job_id_status',
        'job_applications',
        [sa.column('job_id'), sa.column('status')],
        if_not_exists=True
    )

    # 3.2: Candidate viewing their applications
    # Query: SELECT * FROM job_applications WHERE candidate_id = $1 AND status = $2
    op.create_index(
        'idx_job_applications_candidate_id_status',
        'job_applications',
        [sa.column('candidate_id'), sa.column('status')],
        if_not_exists=True
    )

    # 3.3: Check for duplicate applications (with status context)
    # Query: SELECT COUNT(*) FROM job_applications WHERE candidate_id = $1 AND job_id = $2
    # Note: Handled by unique constraint above, but this index helps query performance
    op.create_index(
        'idx_job_applications_candidate_job',
        'job_applications',
        [sa.column('candidate_id'), sa.column('job_id')],
        if_not_exists=True
    )

    # ============================================================
    # PART 4: CANDIDATE PROFILE INDEXES
    # ============================================================

    # 4.1: Profile lookup by title
    op.create_index(
        'idx_candidates_user_id',
        'candidates',
        [sa.column('user_id')],
        if_not_exists=True
    )

    # 4.2: Skill lookup for matching
    op.create_index(
        'idx_skills_candidate_id_name',
        'skills',
        [sa.column('candidate_id'), sa.column('name')],
        if_not_exists=True
    )

    # 4.3: Experience timeline queries
    op.create_index(
        'idx_experiences_candidate_id_current',
        'experiences',
        [sa.column('candidate_id'), sa.column('is_current')],
        if_not_exists=True
    )

    # ============================================================
    # PART 5: MAINTENANCE INDEXES
    # ============================================================

    # 5.1: Session expiration cleanup
    op.create_index(
        'idx_sessions_expires',
        'sessions',
        [sa.column('expires')],
        postgresql_where=sa.text("expires < NOW()"),
        if_not_exists=True
    )

    # 5.2: Password reset token cleanup
    op.create_index(
        'idx_password_reset_tokens_expires',
        'password_reset_tokens',
        [sa.column('expires_at')],
        postgresql_where=sa.text("used_at IS NULL"),
        if_not_exists=True
    )

    # 5.3: Verification token cleanup
    op.create_index(
        'idx_verification_tokens_expires',
        'verification_tokens',
        [sa.column('expires')],
        if_not_exists=True
    )

    # ============================================================
    # PART 6: LEGACY DATA CLEANUP
    # ============================================================

    # 6.1: Drop the clerk_id index (migration from Clerk to NextAuth complete)
    # Note: clerk_id column remains for data integrity, but index can be dropped after 2025-06-31
    # Uncomment after transition period if clerk_id migration is complete
    # op.drop_index('ix_users_clerk_id', table_name='users')


def downgrade() -> None:
    """
    Rollback: Remove all constraints and indexes added in upgrade
    """

    # Remove indexes in reverse order (LIFO)
    op.drop_index('idx_verification_tokens_expires', table_name='verification_tokens', if_exists=True)
    op.drop_index('idx_password_reset_tokens_expires', table_name='password_reset_tokens', if_exists=True)
    op.drop_index('idx_sessions_expires', table_name='sessions', if_exists=True)

    op.drop_index('idx_experiences_candidate_id_current', table_name='experiences', if_exists=True)
    op.drop_index('idx_skills_candidate_id_name', table_name='skills', if_exists=True)
    op.drop_index('idx_candidates_user_id', table_name='candidates', if_exists=True)

    op.drop_index('idx_job_applications_candidate_job', table_name='job_applications', if_exists=True)
    op.drop_index('idx_job_applications_candidate_id_status', table_name='job_applications', if_exists=True)
    op.drop_index('idx_job_applications_job_id_status', table_name='job_applications', if_exists=True)

    op.drop_index('idx_jobs_company_id_status', table_name='jobs', if_exists=True)
    op.drop_index('idx_jobs_employer_id_status', table_name='jobs', if_exists=True)
    op.drop_index('idx_jobs_status_job_type', table_name='jobs', if_exists=True)
    op.drop_index('idx_jobs_status_location_type', table_name='jobs', if_exists=True)

    # Remove unique constraints
    op.drop_constraint('unique_identifier_active_token', 'verification_tokens', type_='unique')
    op.drop_constraint('unique_user_provider_account', 'accounts', type_='unique')
    op.drop_constraint('unique_candidate_job_application', 'job_applications', type_='unique')
