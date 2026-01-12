# PostgreSQL Database Implementation Guide
## IntoWork Dashboard - Technical Deep Dive & Quick Reference

**Purpose:** Comprehensive guide for developers implementing database improvements
**Audience:** Backend engineers, DevOps, database administrators
**Last Updated:** January 6, 2026

---

## Quick Start Checklist

```bash
# 1. Verify current database state
cd /home/jdtkd/IntoWork-Dashboard/backend
alembic current          # Shows applied revision
alembic heads            # Shows target revision

# 2. Apply critical indexes if needed
alembic upgrade h8c2d6e5f4g3

# 3. Verify indexes were created
psql -h localhost -U postgres intowork -c "\d job_applications"

# 4. Check for missing indexes
./scripts/check-indexes.sh  # See Section 2.4 below

# 5. Monitor database health
./scripts/monitor-db.sh     # See Section 7
```

---

## Section 1: Database Configuration Deep Dive

### 1.1 Current Async Configuration (Recommended)

**File:** `backend/app/database.py`

**What it does:**
- Creates async PostgreSQL engine using asyncpg driver
- Configures connection pooling (20 base + 10 overflow)
- Provides AsyncSessionLocal factory for dependency injection
- Implements async context manager for safe session cleanup

**Key Settings Explained:**

```python
# The async PostgreSQL driver (required for async/await support)
DATABASE_URL_ASYNC = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Connection pooling parameters
pool_size=20              # Base connections per worker (for 100-500 concurrent users)
max_overflow=10           # Extra connections when pool exhausted
pool_pre_ping=True        # Check connection health before reuse (prevents stale conn errors)
pool_recycle=3600         # Recycle connections after 1 hour (fixes dropped connections)

# Session configuration
expire_on_commit=False    # Keep ORM objects after flush (improves performance)
autocommit=False          # Explicit transaction management (required for Alembic)
autoflush=False           # Explicit flush control (prevents unexpected queries)
```

**Production Recommendations:**

```python
# Add to database.py after line 19:
connect_args = {
    'connect_timeout': 10,                          # Timeout on initial connection
    'options': '-c statement_timeout=30000',        # 30-second query timeout
}

engine = create_async_engine(
    DATABASE_URL_ASYNC,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    connect_args=connect_args,  # ADD THIS
)
```

**Testing Configuration:**

```bash
# Test async database connection
cd backend
python -c "
import asyncio
from app.database import engine, AsyncSessionLocal

async def test():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT 1')
        print('Connection OK:', result.scalar())

asyncio.run(test())
"
```

### 1.2 Deprecating database_production.py

**Issue:** Provides synchronous configuration (incompatible with async FastAPI)

**Action:**
1. Archive the file (not delete, keep for reference)
2. Update any references to use `database.py` instead
3. Add comment in production deployment docs

```bash
# Rename file to indicate deprecation
mv backend/app/database_production.py backend/app/database_production.py.deprecated

# Update any imports
grep -r "database_production" backend/ --include="*.py"
# Should return empty if properly migrated
```

---

## Section 2: Index Management

### 2.1 Critical Migration Status

**Migration:** `h8c2d6e5f4g3_critical_indexes_and_constraints.py`

**What it adds:**
- 14 new indexes across 8 tables
- 3 unique constraints for data integrity
- 2 partial indexes (conditional on status)

**Check if Applied:**

```bash
# Method 1: Check Alembic status
cd backend
alembic current    # Should show: h8c2d6e5f4g3

# Method 2: Query database directly
psql -h localhost -U postgres intowork <<EOF
SELECT * FROM information_schema.indexes
WHERE tablename IN ('job_applications', 'accounts', 'jobs')
AND indexname LIKE 'idx_%'
ORDER BY tablename;
EOF

# Method 3: Check for specific critical indexes
psql -h localhost -U postgres intowork -c "
SELECT indexname FROM pg_indexes
WHERE indexname IN (
  'unique_candidate_job_application',
  'idx_jobs_status_location_type',
  'idx_job_applications_candidate_id_status'
);"
```

### 2.2 Index Details & Query Plans

#### Index 1: Job Application Uniqueness (CRITICAL)

```sql
CREATE UNIQUE INDEX unique_candidate_job_application
ON job_applications(candidate_id, job_id)
WHERE status != 'rejected';

-- Why: Prevents duplicate applications
-- Allows: Reapplication after rejection
-- Impact: Prevents data corruption, enables application deduplication

-- Query benefit:
-- Before: Can insert duplicate (job_id=1, candidate_id=5) twice
-- After: Second insert fails with constraint violation
```

**Implementation Pattern:**

```python
# In applications.py route
@router.post("/apply")
async def apply_to_job(
    request: JobApplicationCreate,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # This will fail if duplicate exists (status != 'rejected')
        new_app = JobApplication(
            job_id=request.job_id,
            candidate_id=candidate.id,
            status=ApplicationStatus.APPLIED
        )
        db.add(new_app)
        await db.flush()  # Will raise IntegrityError if duplicate
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Already applied to this job"
        )
```

#### Index 2: Job Status + Location Type (HIGH IMPACT)

```sql
CREATE INDEX idx_jobs_status_location_type
ON jobs(status, location_type)
WHERE status = 'PUBLISHED';

-- Why: Filters by both status AND location_type
-- Query Pattern:
-- SELECT * FROM jobs
-- WHERE status = 'PUBLISHED' AND location_type = 'remote'
-- ORDER BY posted_at DESC LIMIT 10;

-- Performance:
-- Before: O(n) Full table scan - 500ms on 100k jobs
-- After:  O(log n) Index lookup - 5-10ms
```

**EXPLAIN Plan Comparison:**

```sql
-- Before index:
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM jobs
WHERE status = 'PUBLISHED' AND location_type = 'remote'
LIMIT 10;

-- Result:
-- Seq Scan on jobs (cost=0.00..50000.00 rows=100) (actual time=450.00..500.00)
--   Filter: (status = 'PUBLISHED' AND location_type = 'remote')

-- After index:
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM jobs
WHERE status = 'PUBLISHED' AND location_type = 'remote'
LIMIT 10;

-- Result:
-- Index Scan using idx_jobs_status_location_type (cost=0.28..5.32 rows=100) (actual time=2.00..5.00)
```

#### Index 3: Application Status Filtering (MEDIUM IMPACT)

```sql
CREATE INDEX idx_job_applications_candidate_id_status
ON job_applications(candidate_id, status);

-- Why: Filters applications by candidate AND status
-- Common Query:
-- SELECT * FROM job_applications
-- WHERE candidate_id = 42 AND status = 'SHORTLISTED'
-- ORDER BY applied_at DESC;

-- Used by: /api/applications/my/applications?status=shortlisted
```

### 2.3 Index Maintenance Queries

**List All Indexes:**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Find Unused Indexes:**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;
```

**Index Size Report:**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = pg_indexes.indexname
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Rebuild Fragmented Index:**

```sql
-- Check fragmentation
SELECT
    relname,
    round(100 * (pg_relation_size(otta) - pg_relation_size(relname)) / pg_relation_size(otta)) AS n_dead_tup
FROM pg_class
WHERE relname LIKE 'idx_%';

-- Rebuild if > 10% bloated
REINDEX INDEX CONCURRENTLY idx_jobs_status_location_type;
```

### 2.4 Script to Check Missing Indexes

**Create:** `backend/scripts/check-indexes.sh`

```bash
#!/bin/bash
# Check if critical indexes are present in database

DB_HOST=${1:-localhost}
DB_NAME=${2:-intowork}
DB_USER=${3:-postgres}

echo "Checking critical indexes in $DB_NAME..."
echo ""

REQUIRED_INDEXES=(
    "unique_candidate_job_application"
    "unique_user_provider_account"
    "idx_jobs_status_location_type"
    "idx_jobs_status_job_type"
    "idx_job_applications_candidate_id_status"
    "idx_job_applications_job_id_status"
)

MISSING=0

for index in "${REQUIRED_INDEXES[@]}"; do
    result=$(psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" -t -c "
        SELECT COUNT(*) FROM pg_indexes
        WHERE indexname = '$index';
    ")

    if [ "$result" -eq 0 ]; then
        echo "✗ MISSING: $index"
        MISSING=$((MISSING + 1))
    else
        echo "✓ FOUND: $index"
    fi
done

echo ""
if [ $MISSING -eq 0 ]; then
    echo "✓ All critical indexes present!"
    exit 0
else
    echo "✗ $MISSING critical indexes missing!"
    echo "Run: alembic upgrade h8c2d6e5f4g3"
    exit 1
fi
```

**Usage:**

```bash
chmod +x backend/scripts/check-indexes.sh
./backend/scripts/check-indexes.sh localhost intowork postgres
```

---

## Section 3: Query Optimization Patterns

### 3.1 Correct Async Query Pattern

**Pattern 1: Select with Filters**

```python
# CORRECT - Async pattern
stmt = select(Job, Company).join(
    Company, Job.company_id == Company.id
).filter(
    Job.status == JobStatus.PUBLISHED,
    Job.location_type == JobLocation.REMOTE
)

result = await db.execute(stmt)
jobs = result.scalars().all()  # Returns Job objects only
```

**Pattern 2: Count with Subquery**

```python
# CORRECT - Count aggregate
count_stmt = select(func.count()).select_from(
    select(Job).filter(Job.status == JobStatus.PUBLISHED).subquery()
)
total_result = await db.execute(count_stmt)
total = total_result.scalar()
```

**Pattern 3: Eager Loading with selectinload**

```python
# CORRECT - Prevent N+1 queries
stmt = select(JobApplication).options(
    selectinload(JobApplication.job).selectinload(Job.company),
    selectinload(JobApplication.candidate)
).filter(
    JobApplication.candidate_id == candidate_id
)

result = await db.execute(stmt)
applications = result.scalars().all()
```

**Pattern 4: Group By Aggregation**

```python
# CORRECT - Dashboard statistics in single query
stmt = select(
    func.count(distinct(Job.id)).label('total_jobs'),
    func.count(JobApplication.id).label('total_applications'),
    func.sum(
        case((JobApplication.status == ApplicationStatus.APPLIED, 1), else_=0)
    ).label('new_applications'),
    func.sum(
        case((JobApplication.status == ApplicationStatus.SHORTLISTED, 1), else_=0)
    ).label('shortlisted')
).select_from(Job).outerjoin(JobApplication).filter(
    Job.employer_id == employer_id
)

result = await db.execute(stmt)
stats = result.one()
```

### 3.2 Common Query Performance Issues

**Issue 1: LIKE Search Without Index**

```python
# SLOW - O(n) table scan
stmt = stmt.filter(Job.title.ilike(f"%{search}%"))
# Cost: 500ms on 100k rows

# BETTER - Use FTS index (when available)
stmt = stmt.filter(
    func.to_tsvector('english', Job.title).match(
        func.plainto_tsquery('english', search)
    )
)
# Cost: 5-10ms with GIN index

# Or use ILIKE with partial index
stmt = stmt.filter(Job.title.ilike(f"{search}%"))  # Prefix search
# Partial index: ON jobs(title) WHERE title IS NOT NULL
# Cost: 20-50ms
```

**Issue 2: Join Without Composite Index**

```python
# SLOW - Multiple filters without index
stmt = select(JobApplication).filter(
    JobApplication.candidate_id == candidate_id,
    JobApplication.status == ApplicationStatus.APPLIED
)

# FAST - With idx_job_applications_candidate_id_status
# Same query, but index is used
# No code change needed, just ensure index exists
```

**Issue 3: Pagination Without Ordering Index**

```python
# SLOW - No index on ORDER BY column
stmt = select(Job).order_by(Job.created_at).offset(1000).limit(10)

# FAST - Create index on created_at
# CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

# Even faster - Use seek pagination instead of offset
# SELECT * FROM jobs WHERE created_at < ? ORDER BY created_at DESC LIMIT 10
# More efficient for large offsets
```

---

## Section 4: Connection Pool Tuning

### 4.1 Current Configuration

**File:** `backend/app/database.py`

```python
pool_size=20              # Concurrent connections per worker
max_overflow=10           # Extra connections when pool exhausted
pool_timeout=30           # Seconds to wait for available connection
pool_pre_ping=True        # Health check before reuse
```

### 4.2 Capacity Planning

**For Different User Loads:**

| Expected Users | pool_size | max_overflow | Rationale |
|----------------|-----------|--------------|-----------|
| 0-100 | 10 | 5 | Small team, low concurrency |
| 100-500 | 20 | 10 | Typical B2B SaaS (CURRENT) |
| 500-2000 | 40 | 20 | Growing platform |
| 2000+ | 60 | 30 | Large platform (add pgBouncer) |

**Calculation Formula:**

```
pool_size = (concurrent_users / 2) + buffer
max_overflow = pool_size / 2

Example: 500 users
- Avg 20% online: 100 concurrent users
- Avg 2 requests per minute = 3 requests/second
- Assume 100ms avg query time = 0.3 connections needed
- pool_size = (100 / 0.3) / 2 = 166 (round down to 50)
- max_overflow = 25
```

### 4.3 Monitoring Pool Usage

**Query Current Pool Status:**

```python
# In FastAPI route or periodic task
from app.database import engine

def get_pool_stats():
    pool = engine.pool
    if hasattr(pool, 'checkedout'):
        return {
            'checked_out': pool.checkedout(),
            'available': pool.size() - pool.checkedout(),
            'pool_size': pool.size(),
            'overflow': pool.overflow()
        }
```

**Alert Thresholds:**

```
⚠️ WARNING: checked_out > pool_size * 0.8 (80% utilization)
🔴 CRITICAL: checked_out > pool_size * 0.95 (95% utilization)
🔴 CRITICAL: overflow > 0 (overflow pool being used)
```

**Add to Monitoring:**

```python
# main.py - Add health check endpoint
@app.get("/health/db-pool")
async def db_pool_health():
    from app.database import engine
    pool = engine.pool
    utilization = pool.checkedout() / pool.size() * 100
    return {
        'pool_utilization': f'{utilization:.1f}%',
        'checked_out': pool.checkedout(),
        'pool_size': pool.size(),
        'status': 'healthy' if utilization < 80 else 'warning'
    }
```

---

## Section 5: Data Integrity Constraints

### 5.1 Applying Unique Constraints

**Migration to Create:**

```bash
cd backend
alembic revision -m "Add unique constraints for data integrity"
```

**Migration Content:**

```python
def upgrade() -> None:
    # Already in h8c2d6e5f4g3, but documenting here for completeness

    # Unique constraint on accounts table
    op.create_unique_constraint(
        'unique_user_provider_account',
        'accounts',
        ['user_id', 'provider', 'provider_account_id']
    )

    # Partial unique index on job_applications
    op.create_index(
        'unique_candidate_job_application',
        'job_applications',
        ['candidate_id', 'job_id'],
        unique=True,
        postgresql_where=sa.text("status != 'rejected'")
    )

def downgrade() -> None:
    op.drop_constraint('unique_user_provider_account', 'accounts')
    op.drop_index('unique_candidate_job_application', 'job_applications')
```

### 5.2 Check Constraints for Data Validation

**Create Migration:**

```bash
alembic revision -m "Add check constraints for data validation"
```

**Migration Content:**

```python
def upgrade() -> None:
    # Salary validation
    op.create_check_constraint(
        'check_job_salary_range',
        'jobs',
        'salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max'
    )

    op.create_check_constraint(
        'check_candidate_salary_range',
        'candidates',
        'salary_expectation_min IS NULL OR salary_expectation_max IS NULL OR salary_expectation_min <= salary_expectation_max'
    )

    # Date validation
    op.create_check_constraint(
        'check_job_dates',
        'jobs',
        'posted_at IS NULL OR expires_at IS NULL OR posted_at <= expires_at'
    )

    # Application status validation (informational)
    op.create_check_constraint(
        'check_application_status',
        'job_applications',
        "status IN ('applied', 'viewed', 'shortlisted', 'interview', 'rejected', 'accepted')"
    )

def downgrade() -> None:
    op.drop_constraint('check_job_salary_range', 'jobs')
    op.drop_constraint('check_candidate_salary_range', 'candidates')
    op.drop_constraint('check_job_dates', 'jobs')
    op.drop_constraint('check_application_status', 'job_applications')
```

**Apply Migration:**

```bash
alembic upgrade head
```

---

## Section 6: Query Timeout Protection

### 6.1 Configure in database.py

```python
# Add to database.py after line 19
connect_args = {
    'connect_timeout': 10,                    # TCP connection timeout
    'options': '-c statement_timeout=30000',  # 30-second SQL timeout
}

engine = create_async_engine(
    DATABASE_URL_ASYNC,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    connect_args=connect_args,  # ADD THIS LINE
)
```

### 6.2 Per-Route Timeout (Optional)

```python
# In FastAPI route, add timeout decorator
from asyncio import timeout

@router.get("/jobs/search")
async def search_jobs(...):
    try:
        async with timeout(5):  # 5-second timeout for this route
            result = await db.execute(stmt)
            return result.scalars().all()
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Search took too long, try refining filters"
        )
```

### 6.3 Monitoring Timeout Events

```sql
-- Query to find timeout statistics (requires pg_stat_statements)
SELECT
    query,
    calls,
    mean_time,
    max_time,
    total_time
FROM pg_stat_statements
WHERE mean_time > 30000  -- 30 seconds
ORDER BY max_time DESC
LIMIT 10;
```

---

## Section 7: Monitoring & Observability

### 7.1 Enable pg_stat_statements

**Production Setup:**

```sql
-- Connect to database as superuser
psql -h localhost -U postgres intowork

-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Reset stats
SELECT pg_stat_statements_reset();

-- Query top slow queries
SELECT
    query,
    calls,
    mean_time,
    max_time,
    total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 7.2 Create Monitoring Script

**File:** `backend/scripts/monitor-db.sh`

```bash
#!/bin/bash
# Monitor database health and performance

DB_HOST=${1:-localhost}
DB_NAME=${2:-intowork}
DB_USER=${3:-postgres}

echo "=== PostgreSQL Database Monitoring ==="
echo "Database: $DB_NAME"
echo "Time: $(date)"
echo ""

# 1. Cache hit ratio
echo "1. CACHE HIT RATIO (target: > 95%)"
psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" -c "
    SELECT
        sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) * 100 AS cache_hit_ratio
    FROM pg_statio_user_tables;
"

# 2. Database size
echo ""
echo "2. DATABASE SIZE"
psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" -c "
    SELECT
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10;
"

# 3. Connections
echo ""
echo "3. ACTIVE CONNECTIONS (target: < pool_size)"
psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" -c "
    SELECT
        datname,
        usename,
        COUNT(*) as connections
    FROM pg_stat_activity
    GROUP BY datname, usename;
"

# 4. Slow queries
echo ""
echo "4. SLOW QUERIES (> 100ms)"
psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" -c "
    SELECT
        substring(query, 1, 50) AS query_snippet,
        calls,
        round(mean_time::numeric, 2) AS mean_ms,
        round(max_time::numeric, 2) AS max_ms
    FROM pg_stat_statements
    WHERE mean_time > 100
    ORDER BY mean_time DESC
    LIMIT 10;
"

# 5. Index usage
echo ""
echo "5. UNUSED INDEXES"
psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" -c "
    SELECT
        tablename,
        indexname,
        idx_scan,
        idx_tup_read
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
    LIMIT 10;
"
```

**Usage:**

```bash
chmod +x backend/scripts/monitor-db.sh
./backend/scripts/monitor-db.sh localhost intowork postgres
```

---

## Section 8: Backup & Recovery

### 8.1 Backup Script

**File:** `backend/scripts/backup-db.sh`

```bash
#!/bin/bash
# Daily PostgreSQL backup

set -e

DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-intowork}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/intowork}
RETENTION_DAYS=30

# Create backup directory if needed
mkdir -p "$BACKUP_DIR"

# Backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/intowork_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "Starting backup: $BACKUP_FILE"

# Perform backup
pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Backup successful: $BACKUP_FILE"
    echo "✓ Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "✗ Backup failed!"
    exit 1
fi

# Remove old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "intowork_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "✓ Cleanup complete"

# Log backup
echo "$(date): Backup completed - $BACKUP_FILE" >> "$BACKUP_DIR/backup.log"
```

### 8.2 Restore Script

**File:** `backend/scripts/restore-db.sh`

```bash
#!/bin/bash
# Restore PostgreSQL backup

if [ $# -ne 1 ]; then
    echo "Usage: ./restore-db.sh <backup-file>"
    exit 1
fi

BACKUP_FILE=$1
DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-intowork}
DB_USER=${DB_USER:-postgres}

if [ ! -f "$BACKUP_FILE" ]; then
    echo "✗ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will overwrite the database '$DB_NAME'"
read -p "Are you sure? (type 'YES' to confirm): " confirm

if [ "$confirm" != "YES" ]; then
    echo "Cancelled"
    exit 1
fi

echo "Restoring from: $BACKUP_FILE"

# Decompress and restore
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✓ Restore successful!"
else
    echo "✗ Restore failed!"
    exit 1
fi
```

### 8.3 Setup Cron Jobs

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/jdtkd/IntoWork-Dashboard/backend/scripts/backup-db.sh

# Session cleanup at 3 AM daily
0 3 * * * psql -h localhost -U postgres intowork -c "DELETE FROM sessions WHERE expires < NOW();"

# Database analysis at 4 AM daily (for query optimization)
0 4 * * * psql -h localhost -U postgres intowork -c "ANALYZE;"
```

---

## Section 9: Troubleshooting Guide

### 9.1 Slow Query Diagnosis

**Step 1: Identify Slow Query**

```sql
-- Find top 5 slowest queries
SELECT
    query,
    calls,
    mean_time,
    max_time,
    total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 5;
```

**Step 2: Generate EXPLAIN Plan**

```sql
-- Replace 'your_query' with actual query
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM jobs
WHERE status = 'PUBLISHED'
  AND location_type = 'remote'
ORDER BY posted_at DESC
LIMIT 10;

-- Output shows:
-- - Cost (estimated before execution)
-- - Actual time (actual after execution)
-- - Rows (actual rows returned)
-- - Buffers (disk I/O info)
```

**Step 3: Check for Missing Index**

```sql
-- If plan shows "Seq Scan" (full table scan)
-- Check if relevant index exists
SELECT * FROM pg_indexes
WHERE tablename = 'jobs'
  AND indexname LIKE '%status%'
  AND indexname LIKE '%location%';

-- If missing, create index
CREATE INDEX idx_jobs_status_location_type
ON jobs(status, location_type)
WHERE status = 'PUBLISHED';

-- Rerun EXPLAIN to verify improvement
```

### 9.2 Connection Pool Exhaustion

**Symptoms:**
- "sqlalchemy.exc.TimeoutError: QueuePool limit exceeded"
- Requests hanging for 30+ seconds
- "connect_timeout exceeded"

**Diagnosis:**

```bash
# Check current connections
psql -h localhost -U postgres intowork -c "
    SELECT
        datname,
        usename,
        state,
        COUNT(*) as connections
    FROM pg_stat_activity
    GROUP BY datname, usename, state
    ORDER BY connections DESC;"
```

**Solutions:**

1. **Identify Blocking Query:**
```sql
SELECT
    pid,
    usename,
    query,
    query_start,
    state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

2. **Kill Long-Running Query:**
```sql
-- Replace 12345 with pid from above
SELECT pg_terminate_backend(12345);
```

3. **Increase Pool Size:**
```python
# In database.py
pool_size=40  # Increase from 20
max_overflow=20  # Increase from 10
```

4. **Add pgBouncer Connection Pooling:**
```ini
# pgbouncer.ini
[databases]
intowork = host=localhost port=5432 dbname=intowork user=postgres

[pgbouncer]
pool_mode = transaction  # Route by transaction
max_client_conn = 1000
default_pool_size = 25
```

### 9.3 High Memory Usage

**Symptoms:**
- `pg_toast` table growing
- Shared buffers always full
- Slow queries after running long

**Check Memory:**

```sql
-- Cache hit ratio
SELECT
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) * 100
FROM pg_statio_user_tables;

-- Target: > 95% (means most data in memory)

-- If < 90%:
-- Option 1: Increase shared_buffers in postgresql.conf
shared_buffers = 256MB  # Set to 25% of system RAM

-- Option 2: Add read replica to distribute load
```

### 9.4 Index Bloat

**Symptoms:**
- "Indexes are almost as large as tables"
- Query performance degradation over time

**Check Index Bloat:**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = pg_indexes.indexname
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

**Rebuild Index:**

```sql
-- Online rebuild (no lock)
REINDEX INDEX CONCURRENTLY idx_jobs_status_location_type;

-- Or schedule during maintenance window
REINDEX TABLE CONCURRENTLY jobs;
```

---

## Section 10: Performance Tuning Reference

### 10.1 Parameter Tuning Guide

| Parameter | Current | Recommended | When to Change |
|-----------|---------|-------------|-----------------|
| `shared_buffers` | Default (128MB) | 25% of RAM | If cache hit ratio < 90% |
| `effective_cache_size` | Default | 50-75% of RAM | Helps query planner decisions |
| `work_mem` | Default (4MB) | 50-100MB | If sorts/hashes slow |
| `maintenance_work_mem` | Default | 256MB | During index creation |
| `wal_buffers` | Default | 16MB | High-write workloads |
| `checkpoint_timeout` | 5min | 10-30 min | Reduce I/O during peak |

### 10.2 Query Plan Optimization

**Pattern 1: Force Index Usage**

```python
# If planner chooses wrong index
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql.expression import ClauseElement

# Force specific index
stmt = stmt.with_hint(Job, "INDEX (idx_jobs_status_location_type)")

# Or rewrite to make index attractive
# Instead of:
where status = 'PUBLISHED' AND job_type = 'full_time' OR salary_min > 50000

# Use:
where status = 'PUBLISHED' AND (job_type = 'full_time' OR salary_min > 50000)
```

**Pattern 2: Materialized View for Complex Queries**

```sql
-- For expensive aggregations
CREATE MATERIALIZED VIEW job_stats_summary AS
SELECT
    employer_id,
    COUNT(DISTINCT id) as total_jobs,
    COUNT(DISTINCT application_id) as total_applications,
    AVG(views_count) as avg_views
FROM jobs
LEFT JOIN job_applications ON jobs.id = job_applications.job_id
GROUP BY employer_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY job_stats_summary;

-- Use in queries
SELECT * FROM job_stats_summary WHERE employer_id = 42;
```

---

## Quick Reference Commands

### Alembic Commands

```bash
# Check current revision
alembic current

# Check target revision
alembic heads

# Apply next migration
alembic upgrade +1

# Apply specific migration
alembic upgrade h8c2d6e5f4g3

# Create new migration
alembic revision --autogenerate -m "Description"

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

### PostgreSQL Commands

```bash
# Connect to database
psql -h localhost -U postgres intowork

# List tables
\dt public.*

# List indexes
\di public.*

# List constraints
\d public.job_applications

# Check table size
SELECT pg_size_pretty(pg_total_relation_size('jobs'));

# Analyze table for stats
ANALYZE jobs;

# Vacuum table
VACUUM (ANALYZE, VERBOSE) jobs;

# Kill query
SELECT pg_terminate_backend(pid);

# Check active queries
SELECT * FROM pg_stat_activity;
```

### Python Testing

```python
# Test async database connection
import asyncio
from app.database import AsyncSessionLocal

async def test_connection():
    async with AsyncSessionLocal() as session:
        from sqlalchemy import text
        result = await session.execute(text("SELECT 1"))
        print("✓ Connection successful:", result.scalar())

asyncio.run(test_connection())
```

---

## References

- **SQLAlchemy 2.0 Async Docs:** https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- **PostgreSQL Performance:** https://wiki.postgresql.org/wiki/Performance_Optimization
- **Alembic Documentation:** https://alembic.sqlalchemy.org/
- **pg_stat_statements:** https://www.postgresql.org/docs/current/pgstatstatements.html

---

**Document Version:** 1.0
**Last Updated:** January 6, 2026
**Next Review:** January 13, 2026 (After Phase 1 implementation)
