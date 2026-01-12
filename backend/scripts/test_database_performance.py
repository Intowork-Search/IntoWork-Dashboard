#!/usr/bin/env python3
"""
Database Performance Testing Script
====================================

This script tests the performance impact of the critical indexes and constraints
migration before deploying to production.

Usage:
    python scripts/test_database_performance.py --env development
    python scripts/test_database_performance.py --env production --sample-data

Functions tested:
1. Job listing with filters
2. Duplicate application prevention
3. Candidate applications list
4. Dashboard statistics
5. Full-text search (when implemented)

"""

import sys
import time
import argparse
from typing import List, Dict, Tuple
import statistics
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, '/home/jdtkd/IntoWork-Dashboard/backend')

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models.base import (
    User, Candidate, Job, Company, JobApplication, Employer,
    UserRole, JobType, JobLocation, JobStatus, ApplicationStatus
)

# ============================================================
# TEST CONFIGURATION
# ============================================================

class PerformanceTest:
    """Base class for performance tests"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.results: List[float] = []

    def run(self, db: Session, iterations: int = 5) -> Dict:
        """Run test multiple times and collect metrics"""
        print(f"\n{self.name}")
        print(f"Description: {self.description}")
        print(f"Running {iterations} iterations...")

        for i in range(iterations):
            start = time.perf_counter()
            try:
                self.test(db)
                elapsed = (time.perf_counter() - start) * 1000  # Convert to ms
                self.results.append(elapsed)
                print(f"  Iteration {i+1}: {elapsed:.2f}ms")
            except Exception as e:
                print(f"  ERROR in iteration {i+1}: {e}")
                self.results.append(float('inf'))

        return self.get_stats()

    def test(self, db: Session):
        """Override in subclass"""
        raise NotImplementedError

    def get_stats(self) -> Dict:
        """Calculate statistics from results"""
        if not self.results:
            return {}

        valid_results = [r for r in self.results if r != float('inf')]
        if not valid_results:
            return {"status": "failed", "all_errors": True}

        return {
            "name": self.name,
            "min_ms": min(valid_results),
            "max_ms": max(valid_results),
            "mean_ms": statistics.mean(valid_results),
            "median_ms": statistics.median(valid_results),
            "stdev_ms": statistics.stdev(valid_results) if len(valid_results) > 1 else 0,
            "iterations": len(valid_results),
        }


# ============================================================
# TEST 1: JOB LIST FILTERING (Common Query Pattern)
# ============================================================

class JobListFilterTest(PerformanceTest):
    """
    Test job listing with filters - most common operation
    Simulates: GET /api/jobs?location_type=remote&status=published&limit=10
    """

    def __init__(self):
        super().__init__(
            "Job List Filtering",
            "Filter published jobs by location_type and job_type"
        )

    def test(self, db: Session):
        """Execute filtered job query"""
        query = db.query(Job).filter(
            Job.status == JobStatus.PUBLISHED,
            Job.location_type == JobLocation.REMOTE,
            Job.job_type == JobType.FULL_TIME
        ).limit(10)
        list(query)  # Force execution


# ============================================================
# TEST 2: APPLICATION DUPLICATE CHECK (Data Integrity)
# ============================================================

class ApplicationDuplicateCheckTest(PerformanceTest):
    """
    Test checking for duplicate applications before insert
    Simulates: Candidate tries to apply to same job twice
    Expected: Should use unique index for fast lookup
    """

    def __init__(self):
        super().__init__(
            "Duplicate Application Check",
            "Check if candidate already applied to job (unique index lookup)"
        )

    def test(self, db: Session):
        """Check for existing application"""
        # Get first candidate and first job
        candidate = db.query(Candidate).first()
        job = db.query(Job).first()

        if not candidate or not job:
            return  # Skip if no data

        # This should be very fast with unique index
        existing = db.query(JobApplication).filter(
            JobApplication.candidate_id == candidate.id,
            JobApplication.job_id == job.id,
            JobApplication.status != ApplicationStatus.REJECTED
        ).first()


# ============================================================
# TEST 3: CANDIDATE APPLICATIONS LIST (Dashboard Query)
# ============================================================

class CandidateApplicationsTest(PerformanceTest):
    """
    Test loading candidate's applications
    Simulates: GET /api/applications/my/applications?status=applied
    """

    def __init__(self):
        super().__init__(
            "Candidate Applications List",
            "Load candidate applications with status filter"
        )

    def test(self, db: Session):
        """Get candidate applications"""
        candidate = db.query(Candidate).first()
        if not candidate:
            return

        query = db.query(JobApplication).filter(
            JobApplication.candidate_id == candidate.id,
            JobApplication.status == ApplicationStatus.APPLIED
        ).order_by(JobApplication.applied_at.desc()).limit(20)
        list(query)


# ============================================================
# TEST 4: JOB APPLICATIONS BY STATUS (Employer Dashboard)
# ============================================================

class JobApplicationsByStatusTest(PerformanceTest):
    """
    Test loading applications for a specific job
    Simulates: Employer viewing applications to their job posting
    """

    def __init__(self):
        super().__init__(
            "Job Applications by Status",
            "Count applications per status (employer dashboard)"
        )

    def test(self, db: Session):
        """Get applications for first job"""
        job = db.query(Job).first()
        if not job:
            return

        # Count by status (typical dashboard query)
        statuses = [s.value for s in ApplicationStatus]
        for status in statuses:
            count = db.query(JobApplication).filter(
                JobApplication.job_id == job.id,
                JobApplication.status == status
            ).count()


# ============================================================
# TEST 5: EMPLOYER JOBS WITH APPLICATION COUNT
# ============================================================

class EmployerJobsTest(PerformanceTest):
    """
    Test loading employer's jobs with application counts
    Simulates: Employer dashboard listing their job postings
    """

    def __init__(self):
        super().__init__(
            "Employer Jobs Listing",
            "Load employer's published jobs"
        )

    def test(self, db: Session):
        """Get employer jobs"""
        employer = db.query(Employer).first()
        if not employer:
            return

        jobs = db.query(Job).filter(
            Job.employer_id == employer.id,
            Job.status == JobStatus.PUBLISHED
        ).limit(20)
        list(jobs)


# ============================================================
# TEST 6: INDEX VERIFICATION
# ============================================================

def verify_indexes(db: Session):
    """
    Verify that critical indexes exist and are being used
    """
    print("\n" + "="*70)
    print("INDEX VERIFICATION")
    print("="*70)

    # Query to check if indexes exist
    index_check = """
        SELECT
            schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND (
            indexname LIKE 'idx_%'
            OR indexname LIKE 'ix_%'
            OR indexname LIKE 'unique_%'
        )
        ORDER BY tablename, indexname;
    """

    result = db.execute(text(index_check))
    indexes = result.fetchall()

    if not indexes:
        print("WARNING: No indexes found! Run migration first.")
        return False

    print(f"\nFound {len(indexes)} indexes:\n")
    for schema, table, index, definition in indexes:
        print(f"  {index:50} on {table}")

    # Check for critical indexes
    critical_indexes = [
        'unique_candidate_job_application',
        'unique_user_provider_account',
        'idx_jobs_status_location_type',
        'idx_jobs_status_job_type',
        'idx_job_applications_job_id_status',
        'idx_job_applications_candidate_id_status',
    ]

    found_critical = [idx for _, _, idx_name, _ in indexes for c_idx in critical_indexes if idx_name == c_idx]

    print(f"\nCritical Indexes Found: {len(found_critical)}/{len(critical_indexes)}")
    for idx in critical_indexes:
        status = "✓" if idx in found_critical else "✗"
        print(f"  {status} {idx}")

    return len(found_critical) == len(critical_indexes)


def check_table_constraints(db: Session):
    """Check that unique constraints exist"""
    print("\n" + "="*70)
    print("CONSTRAINT VERIFICATION")
    print("="*70)

    constraint_check = """
        SELECT
            constraint_name, table_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND (constraint_name LIKE 'unique_%' OR constraint_type = 'UNIQUE')
        ORDER BY table_name, constraint_name;
    """

    result = db.execute(text(constraint_check))
    constraints = result.fetchall()

    print(f"\nFound {len(constraints)} constraints:\n")
    for name, table, ctype in constraints:
        print(f"  {name:50} on {table} ({ctype})")

    critical_constraints = [
        'unique_candidate_job_application',
        'unique_user_provider_account',
    ]

    found_critical = [c[0] for c in constraints for critical in critical_constraints if c[0] == critical]

    print(f"\nCritical Constraints Found: {len(found_critical)}/{len(critical_constraints)}")
    for constraint in critical_constraints:
        status = "✓" if constraint in found_critical else "✗"
        print(f"  {status} {constraint}")

    return len(found_critical) == len(critical_constraints)


# ============================================================
# DATA GENERATION (For Testing)
# ============================================================

def generate_test_data(db: Session, num_jobs: int = 100, num_candidates: int = 50):
    """Generate test data for performance testing"""
    print("\n" + "="*70)
    print("GENERATING TEST DATA")
    print("="*70)

    # Check if data already exists
    user_count = db.query(User).count()
    if user_count > 0:
        print(f"Database already contains {user_count} users. Skipping data generation.")
        return

    print(f"Generating {num_candidates} candidates...")
    candidates = []
    for i in range(num_candidates):
        user = User(
            email=f"candidate_{i}@test.com",
            password_hash="test_hash",
            role=UserRole.CANDIDATE,
            first_name=f"Candidate_{i}",
            last_name="Test",
        )
        db.add(user)
        db.flush()

        candidate = Candidate(
            user_id=user.id,
            phone="123456789",
            location="Remote",
            title="Software Engineer",
            summary="Test candidate",
        )
        db.add(candidate)
        candidates.append(candidate)

    print(f"Generating {num_jobs} jobs...")
    company = Company(
        name="Test Company",
        industry="Technology",
    )
    db.add(company)
    db.flush()

    employer_user = User(
        email="employer@test.com",
        password_hash="test_hash",
        role=UserRole.EMPLOYER,
        first_name="Employer",
        last_name="Test",
    )
    db.add(employer_user)
    db.flush()

    employer = Employer(
        user_id=employer_user.id,
        company_id=company.id,
    )
    db.add(employer)
    db.flush()

    jobs = []
    for i in range(num_jobs):
        job = Job(
            employer_id=employer.id,
            company_id=company.id,
            title=f"Senior Software Engineer {i}",
            description=f"Job description {i}",
            location_type=JobLocation.REMOTE if i % 3 == 0 else JobLocation.HYBRID,
            job_type=JobType.FULL_TIME,
            status=JobStatus.PUBLISHED,
            posted_at=datetime.utcnow(),
        )
        db.add(job)
        jobs.append(job)

    db.commit()
    print(f"Generated {len(candidates)} candidates and {len(jobs)} jobs")


# ============================================================
# MAIN TEST RUNNER
# ============================================================

def run_performance_tests():
    """Run all performance tests"""
    parser = argparse.ArgumentParser(description="Database Performance Tests")
    parser.add_argument('--env', default='development', choices=['development', 'production'])
    parser.add_argument('--sample-data', action='store_true', help='Generate sample data for testing')
    parser.add_argument('--iterations', type=int, default=5, help='Number of iterations per test')
    args = parser.parse_args()

    print("="*70)
    print("INTOWORK DATABASE PERFORMANCE TEST SUITE")
    print("="*70)
    print(f"Environment: {args.env}")
    print(f"Iterations: {args.iterations}")
    print(f"Timestamp: {datetime.now().isoformat()}")

    db = SessionLocal()

    try:
        # Step 1: Check database connectivity
        print("\nStep 1: Checking database connectivity...")
        db.execute(text("SELECT 1"))
        print("✓ Database connected")

        # Step 2: Generate test data if requested
        if args.sample_data:
            generate_test_data(db, num_jobs=500, num_candidates=100)

        # Step 3: Verify indexes and constraints
        indexes_ok = verify_indexes(db)
        constraints_ok = check_table_constraints(db)

        if not (indexes_ok and constraints_ok):
            print("\n⚠ WARNING: Some critical indexes or constraints are missing!")
            print("Run the migration to add them:")
            print("  alembic upgrade head")
            return False

        # Step 4: Run performance tests
        print("\n" + "="*70)
        print("RUNNING PERFORMANCE TESTS")
        print("="*70)

        tests = [
            JobListFilterTest(),
            ApplicationDuplicateCheckTest(),
            CandidateApplicationsTest(),
            JobApplicationsByStatusTest(),
            EmployerJobsTest(),
        ]

        results = []
        for test in tests:
            stats = test.run(db, iterations=args.iterations)
            if stats:
                results.append(stats)

        # Step 5: Print results summary
        print("\n" + "="*70)
        print("PERFORMANCE RESULTS SUMMARY")
        print("="*70)

        for result in results:
            if "all_errors" in result:
                print(f"\n{result['name']}: FAILED (all iterations errored)")
                continue

            print(f"\n{result['name']}:")
            print(f"  Min:    {result['min_ms']:8.2f}ms")
            print(f"  Max:    {result['max_ms']:8.2f}ms")
            print(f"  Mean:   {result['mean_ms']:8.2f}ms")
            print(f"  Median: {result['median_ms']:8.2f}ms")
            print(f"  StdDev: {result['stdev_ms']:8.2f}ms")

            # Performance assessment
            mean = result['mean_ms']
            if mean < 10:
                assessment = "✓ Excellent"
            elif mean < 50:
                assessment = "✓ Good"
            elif mean < 200:
                assessment = "⚠ Fair"
            else:
                assessment = "✗ Slow"
            print(f"  Status: {assessment}")

        print("\n" + "="*70)
        print("TEST COMPLETE")
        print("="*70)

        # Overall assessment
        avg_mean = statistics.mean([r['mean_ms'] for r in results if 'mean_ms' in r])
        if avg_mean < 50:
            print("\n✓ Database performance is excellent for production")
            return True
        elif avg_mean < 200:
            print("\n✓ Database performance is acceptable for production")
            return True
        else:
            print("\n✗ Database performance needs optimization")
            print("Recommended actions:")
            print("  1. Verify all indexes are created (see Index Verification above)")
            print("  2. Increase database server resources (CPU, RAM)")
            print("  3. Enable query logging to identify slow queries")
            return False

    except Exception as e:
        print(f"\n✗ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    success = run_performance_tests()
    sys.exit(0 if success else 1)
