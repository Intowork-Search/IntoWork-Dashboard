"""Add full-text search and advanced performance indexes

This migration adds:
1. Full-text search indexes (GIN) for job title and description
2. Company name fuzzy search (pg_trgm)
3. Notification performance indexes
4. Dashboard optimization indexes
5. Advanced application tracking

Revision ID: i9d3e6f5h4j5
Revises: h8c2d6e5f4g3
Create Date: 2026-01-06 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'i9d3e6f5h4j5'
down_revision: Union[str, None] = 'h8c2d6e5f4g3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add advanced performance indexes for production scaling
    """

    # Get connection to use execution_options for CONCURRENTLY indexes
    conn = op.get_bind()

    # ============================================================
    # PART 1: ENABLE REQUIRED POSTGRESQL EXTENSIONS
    # ============================================================

    # Enable pg_trgm extension for fuzzy text search
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

    # ============================================================
    # PART 2: FULL-TEXT SEARCH INDEXES
    # ============================================================

    # 2.1: Full-text search on job title and description (English language)
    # Supports: WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('python')
    # Performance: 50-100x faster than ILIKE '%search%'
    # Use regular CREATE INDEX (not CONCURRENTLY) in migration for transaction compatibility
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_jobs_title_description_fts
        ON jobs USING GIN(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
        );
    """)

    # 2.2: Full-text search on company name (for autocomplete/search)
    # Supports: WHERE to_tsvector('english', name) @@ plainto_tsquery('acme')
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_companies_name_fts
        ON companies USING GIN(to_tsvector('english', name));
    """)

    # 2.3: Fuzzy/trigram search on company name (for typos and partial matches)
    # Supports: WHERE name % 'acme' (similarity operator)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_companies_name_trgm
        ON companies USING GIN(name gin_trgm_ops);
    """)

    # ============================================================
    # PART 3: NOTIFICATION PERFORMANCE INDEXES
    # ============================================================

    # 3.1: Unread notification count (most frequent query)
    # Partial index: Only indexes unread notifications
    # Supports: SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
        ON notifications(user_id, created_at DESC)
        WHERE is_read = false;
    """)

    # 3.2: Notification list by type (for filtering)
    # Supports: SELECT * FROM notifications WHERE user_id = $1 AND type = $2 ORDER BY created_at
    op.create_index(
        'idx_notifications_user_type_date',
        'notifications',
        [sa.column('user_id'), sa.column('type'), sa.column('created_at').desc()],
        if_not_exists=True
    )

    # ============================================================
    # PART 4: DASHBOARD OPTIMIZATION INDEXES
    # ============================================================

    # 4.1: Job application counting with date filter (recent applications)
    # Note: Skipping time-based partial index due to IMMUTABLE constraint
    # Alternative: Use full index or application-level filtering
    # op.execute("""
    #     CREATE INDEX IF NOT EXISTS idx_applications_job_status_recent
    #     ON job_applications(job_id, status, applied_at DESC);
    # """)

    # 4.2: Candidate application statistics
    # Supports: Count applications per status for dashboard
    op.create_index(
        'idx_applications_candidate_status_date',
        'job_applications',
        [sa.column('candidate_id'), sa.column('status'), sa.column('applied_at').desc()],
        if_not_exists=True
    )

    # ============================================================
    # PART 5: ADVANCED QUERY OPTIMIZATION
    # ============================================================

    # 5.1: Composite index for job search with posted_at ordering
    # Supports: Paginated job listings with filters
    # Order matters: status (filter) -> location_type (filter) -> posted_at (sort)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_jobs_search_composite
        ON jobs(status, location_type, job_type, posted_at DESC)
        WHERE status = 'PUBLISHED';
    """)

    # 5.2: Application lookup with INCLUDE clause (covering index)
    # PostgreSQL 11+ covering index: Includes status and applied_at without table lookup
    # Supports: has_applied check with status and date
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_applications_candidate_job_covering
        ON job_applications(candidate_id, job_id)
        INCLUDE (status, applied_at);
    """)

    # 5.3: Job view counting (for trending/popular jobs)
    # Supports: ORDER BY views_count DESC, posted_at DESC
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_jobs_views_date
        ON jobs(views_count DESC, posted_at DESC)
        WHERE status = 'PUBLISHED';
    """)

    # ============================================================
    # PART 6: CANDIDATE SEARCH INDEXES (Future Feature)
    # ============================================================

    # 6.1: Full-text search on candidate title
    # Supports: Employer searching for candidates by job title
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_candidates_title_fts
        ON candidates USING GIN(to_tsvector('english', coalesce(title, '')))
        WHERE title IS NOT NULL;
    """)

    # 6.2: Trigram search on candidate title (fuzzy matching)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_candidates_title_trgm
        ON candidates USING GIN(title gin_trgm_ops)
        WHERE title IS NOT NULL;
    """)

    # ============================================================
    # PART 7: OPTIMIZED SESSION VALIDATION
    # ============================================================

    # 7.1: Fast session token lookup with expiration check
    # Note: Skipping time-based partial index due to IMMUTABLE constraint
    # Alternative: Use compound index with expires column
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_sessions_token_expires
        ON sessions(session_token, expires DESC);
    """)

    # Note: Regular CREATE INDEX (not CONCURRENTLY) used for migration transaction compatibility
    # For production zero-downtime deployments, run CONCURRENTLY indexes manually outside migration


def downgrade() -> None:
    """
    Rollback: Remove all indexes added in upgrade
    """

    # Remove indexes in reverse order (LIFO)
    op.execute("DROP INDEX IF EXISTS idx_sessions_token_expires;")

    op.execute("DROP INDEX IF EXISTS idx_candidates_title_trgm;")
    op.execute("DROP INDEX IF EXISTS idx_candidates_title_fts;")

    op.execute("DROP INDEX IF EXISTS idx_jobs_views_date;")
    op.execute("DROP INDEX IF EXISTS idx_applications_candidate_job_covering;")
    op.execute("DROP INDEX IF EXISTS idx_jobs_search_composite;")

    op.drop_index('idx_applications_candidate_status_date', table_name='job_applications', if_exists=True)

    op.drop_index('idx_notifications_user_type_date', table_name='notifications', if_exists=True)
    op.execute("DROP INDEX IF EXISTS idx_notifications_user_unread;")

    op.execute("DROP INDEX IF EXISTS idx_companies_name_trgm;")
    op.execute("DROP INDEX IF EXISTS idx_companies_name_fts;")
    op.execute("DROP INDEX IF EXISTS idx_jobs_title_description_fts;")

    # Note: Not dropping pg_trgm extension as other systems may depend on it
    # op.execute("DROP EXTENSION IF EXISTS pg_trgm;")
