#!/usr/bin/env python3
"""
SQL Query Performance Testing Script

Tests critical queries with and without indexes to measure performance improvements.
Usage:
    python test_query_performance.py
    python test_query_performance.py --explain  # Show EXPLAIN ANALYZE output
"""

import asyncio
import time
import sys
from typing import List, Tuple
from sqlalchemy import text, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from tabulate import tabulate

# Add parent directory to path for imports
sys.path.insert(0, '/home/jdtkd/IntoWork-Dashboard/backend')

from app.database import AsyncSessionLocal, engine
from app.models.base import Job, Company, JobApplication, Candidate, User, JobStatus, JobLocation, JobType


class PerformanceTester:
    """SQL query performance testing utility"""

    def __init__(self, show_explain: bool = False):
        self.show_explain = show_explain
        self.results: List[Tuple[str, float, int]] = []

    async def run_tests(self):
        """Run all performance tests"""
        print("=" * 80)
        print("SQL QUERY PERFORMANCE TESTING")
        print("=" * 80)
        print()

        async with AsyncSessionLocal() as session:
            # Check database connection
            print("Testing database connection...")
            result = await session.execute(text("SELECT version();"))
            version = result.scalar()
            print(f"✓ Connected to: {version}")
            print()

            # Get table sizes
            await self.print_table_sizes(session)
            print()

            # Run tests
            print("Running performance tests...")
            print("-" * 80)

            await self.test_job_search_query(session)
            await self.test_job_search_with_filters(session)
            await self.test_fulltext_search(session)
            await self.test_has_applied_check(session)
            await self.test_dashboard_stats(session)
            await self.test_application_list(session)
            await self.test_employer_applications(session)
            await self.test_notification_count(session)

            # Print summary
            self.print_summary()

    async def print_table_sizes(self, session: AsyncSession):
        """Print current database table sizes"""
        query = text("""
            SELECT
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
                pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            LIMIT 10;
        """)
        result = await session.execute(query)
        rows = result.all()

        print("Table Sizes:")
        table_data = [[row.tablename, row.size] for row in rows]
        print(tabulate(table_data, headers=["Table", "Size"], tablefmt="grid"))

    async def test_query(
        self,
        session: AsyncSession,
        name: str,
        query: str,
        params: dict = None,
        iterations: int = 3
    ) -> Tuple[float, int]:
        """
        Test a SQL query and measure performance

        Returns: (avg_time_ms, row_count)
        """
        times = []
        row_count = 0

        for i in range(iterations):
            start = time.perf_counter()
            result = await session.execute(text(query), params or {})
            rows = result.fetchall()
            end = time.perf_counter()

            elapsed = (end - start) * 1000  # Convert to milliseconds
            times.append(elapsed)
            row_count = len(rows)

        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)

        print(f"{'✓' if avg_time < 100 else '⚠'} {name}")
        print(f"  Avg: {avg_time:.2f}ms | Min: {min_time:.2f}ms | Max: {max_time:.2f}ms | Rows: {row_count}")

        # Show EXPLAIN ANALYZE if requested
        if self.show_explain and iterations == 1:
            explain_query = f"EXPLAIN ANALYZE {query}"
            result = await session.execute(text(explain_query), params or {})
            explain_output = result.fetchall()
            print("\n  EXPLAIN ANALYZE:")
            for line in explain_output:
                print(f"    {line[0]}")
            print()

        self.results.append((name, avg_time, row_count))
        return avg_time, row_count

    async def test_job_search_query(self, session: AsyncSession):
        """Test basic job search query"""
        query = """
            SELECT j.id, j.title, j.description, c.name as company_name, c.logo_url,
                   j.location, j.location_type, j.job_type, j.salary_min, j.salary_max,
                   j.posted_at, j.views_count, j.applications_count
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE j.status = 'published'
            ORDER BY j.posted_at DESC
            LIMIT 20;
        """
        await self.test_query(session, "Job Search - Basic Listing", query)

    async def test_job_search_with_filters(self, session: AsyncSession):
        """Test job search with multiple filters"""
        query = """
            SELECT j.id, j.title, j.description, c.name as company_name
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE j.status = 'published'
              AND j.location_type = 'remote'
              AND j.job_type = 'full_time'
              AND j.salary_min >= 50000
            ORDER BY j.posted_at DESC
            LIMIT 20;
        """
        await self.test_query(session, "Job Search - With Filters (remote, full_time, salary)", query)

    async def test_fulltext_search(self, session: AsyncSession):
        """Test full-text search on job titles and descriptions"""
        # First, test with ILIKE (slow)
        query_ilike = """
            SELECT j.id, j.title, c.name as company_name
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE j.status = 'published'
              AND (j.title ILIKE :search OR j.description ILIKE :search)
            ORDER BY j.posted_at DESC
            LIMIT 20;
        """
        await self.test_query(
            session,
            "Job Search - ILIKE '%python%' (SLOW)",
            query_ilike,
            {"search": "%python%"}
        )

        # Then, test with full-text search (fast, if index exists)
        query_fts = """
            SELECT j.id, j.title, c.name as company_name
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE j.status = 'published'
              AND to_tsvector('english', coalesce(j.title, '') || ' ' || coalesce(j.description, ''))
                  @@ plainto_tsquery('english', :search)
            ORDER BY j.posted_at DESC
            LIMIT 20;
        """
        await self.test_query(
            session,
            "Job Search - Full-Text Search 'python' (FAST with GIN index)",
            query_fts,
            {"search": "python"}
        )

    async def test_has_applied_check(self, session: AsyncSession):
        """Test has_applied check for a candidate"""
        # Get first candidate ID
        result = await session.execute(text("SELECT id FROM candidates LIMIT 1;"))
        candidate_id = result.scalar()

        if not candidate_id:
            print("⚠ Skipping has_applied test - no candidates in database")
            return

        query = """
            SELECT ja.job_id
            FROM job_applications ja
            WHERE ja.candidate_id = :candidate_id;
        """
        await self.test_query(
            session,
            "has_applied Check - Candidate Applications",
            query,
            {"candidate_id": candidate_id}
        )

    async def test_dashboard_stats(self, session: AsyncSession):
        """Test dashboard statistics query"""
        # Get first employer ID
        result = await session.execute(text("SELECT id FROM employers LIMIT 1;"))
        employer_id = result.scalar()

        if not employer_id:
            print("⚠ Skipping dashboard test - no employers in database")
            return

        # Test consolidated dashboard query
        query = """
            SELECT
              COUNT(DISTINCT CASE WHEN j.status = 'published' THEN j.id END) as active_jobs,
              COUNT(ja.id) as total_applications,
              COUNT(CASE WHEN ja.status = 'interview' THEN 1 END) as interviews,
              COUNT(CASE WHEN ja.status IN ('rejected', 'accepted', 'interview', 'shortlisted', 'viewed')
                    THEN 1 END) as responded_applications
            FROM jobs j
            LEFT JOIN job_applications ja ON j.id = ja.job_id
            WHERE j.employer_id = :employer_id;
        """
        await self.test_query(
            session,
            "Dashboard Stats - Consolidated Query (OPTIMIZED)",
            query,
            {"employer_id": employer_id}
        )

    async def test_application_list(self, session: AsyncSession):
        """Test candidate application listing"""
        result = await session.execute(text("SELECT id FROM candidates LIMIT 1;"))
        candidate_id = result.scalar()

        if not candidate_id:
            print("⚠ Skipping application list test - no candidates in database")
            return

        query = """
            SELECT
                ja.id, ja.job_id, ja.status, ja.applied_at,
                j.title as job_title,
                c.name as company_name
            FROM job_applications ja
            JOIN jobs j ON j.id = ja.job_id
            JOIN companies c ON c.id = j.company_id
            WHERE ja.candidate_id = :candidate_id
            ORDER BY ja.applied_at DESC
            LIMIT 20;
        """
        await self.test_query(
            session,
            "Application List - Candidate View",
            query,
            {"candidate_id": candidate_id}
        )

    async def test_employer_applications(self, session: AsyncSession):
        """Test employer application listing"""
        result = await session.execute(text("SELECT id FROM employers LIMIT 1;"))
        employer_id = result.scalar()

        if not employer_id:
            print("⚠ Skipping employer applications test - no employers in database")
            return

        query = """
            SELECT
                ja.id, ja.job_id, ja.candidate_id, ja.status, ja.applied_at,
                j.title as job_title,
                u.first_name || ' ' || u.last_name as candidate_name
            FROM job_applications ja
            JOIN jobs j ON j.id = ja.job_id
            JOIN candidates c ON c.id = ja.candidate_id
            JOIN users u ON u.id = c.user_id
            WHERE j.employer_id = :employer_id
            ORDER BY ja.applied_at DESC
            LIMIT 20;
        """
        await self.test_query(
            session,
            "Application List - Employer View",
            query,
            {"employer_id": employer_id}
        )

    async def test_notification_count(self, session: AsyncSession):
        """Test unread notification count"""
        result = await session.execute(text("SELECT id FROM users LIMIT 1;"))
        user_id = result.scalar()

        if not user_id:
            print("⚠ Skipping notification test - no users in database")
            return

        query = """
            SELECT COUNT(*)
            FROM notifications
            WHERE user_id = :user_id
              AND is_read = false;
        """
        await self.test_query(
            session,
            "Notification Count - Unread (with partial index)",
            query,
            {"user_id": user_id}
        )

    def print_summary(self):
        """Print performance test summary"""
        print()
        print("=" * 80)
        print("PERFORMANCE TEST SUMMARY")
        print("=" * 80)
        print()

        # Sort by execution time (slowest first)
        sorted_results = sorted(self.results, key=lambda x: x[1], reverse=True)

        table_data = [
            [name, f"{time_ms:.2f}ms", rows, self.get_rating(time_ms)]
            for name, time_ms, rows in sorted_results
        ]

        print(tabulate(
            table_data,
            headers=["Query", "Avg Time", "Rows", "Rating"],
            tablefmt="grid"
        ))

        print()
        print("Rating Guide:")
        print("  ✓ Excellent  : < 10ms")
        print("  ✓ Good       : 10-50ms")
        print("  ⚠ Fair       : 50-100ms")
        print("  ✗ Poor       : 100-500ms")
        print("  ✗✗ Very Poor : > 500ms")
        print()

        # Recommendations
        slow_queries = [name for name, time_ms, _ in sorted_results if time_ms > 100]
        if slow_queries:
            print("⚠ RECOMMENDATIONS:")
            print(f"  {len(slow_queries)} queries are slower than 100ms and need optimization.")
            print("  Run migrations to add missing indexes:")
            print("    cd backend && alembic upgrade head")
            print()

    @staticmethod
    def get_rating(time_ms: float) -> str:
        """Get performance rating based on execution time"""
        if time_ms < 10:
            return "✓ Excellent"
        elif time_ms < 50:
            return "✓ Good"
        elif time_ms < 100:
            return "⚠ Fair"
        elif time_ms < 500:
            return "✗ Poor"
        else:
            return "✗✗ Very Poor"


async def check_indexes(session: AsyncSession):
    """Check which performance indexes are present"""
    query = text("""
        SELECT
            tablename,
            indexname,
            pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND (
              indexname LIKE 'idx_%' OR
              indexname LIKE 'unique_%'
          )
        ORDER BY tablename, indexname;
    """)

    result = await session.execute(query)
    indexes = result.all()

    print()
    print("=" * 80)
    print("INSTALLED PERFORMANCE INDEXES")
    print("=" * 80)
    print()

    table_data = [[idx.tablename, idx.indexname, idx.index_size] for idx in indexes]
    print(tabulate(table_data, headers=["Table", "Index Name", "Size"], tablefmt="grid"))
    print()

    # Check for critical indexes
    critical_indexes = [
        'idx_jobs_search_composite',
        'idx_jobs_title_description_fts',
        'idx_applications_candidate_job_lookup',
        'unique_candidate_job_application',
        'idx_notifications_user_unread'
    ]

    installed = [idx.indexname for idx in indexes]
    missing = [idx for idx in critical_indexes if idx not in installed]

    if missing:
        print("⚠ MISSING CRITICAL INDEXES:")
        for idx in missing:
            print(f"  - {idx}")
        print()
        print("Run migrations to install missing indexes:")
        print("  cd backend && alembic upgrade head")
    else:
        print("✓ All critical indexes are installed!")

    print()


async def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="SQL Query Performance Testing")
    parser.add_argument(
        "--explain",
        action="store_true",
        help="Show EXPLAIN ANALYZE output for queries"
    )
    args = parser.parse_args()

    try:
        # Check installed indexes
        async with AsyncSessionLocal() as session:
            await check_indexes(session)

        # Run performance tests
        tester = PerformanceTester(show_explain=args.explain)
        await tester.run_tests()

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
