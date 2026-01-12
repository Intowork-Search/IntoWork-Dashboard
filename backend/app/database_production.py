"""
PostgreSQL Database Configuration
==================================

Production-ready database setup with:
- Connection pooling for concurrent requests
- Query timeout protection
- SSL/TLS support for secure connections
- Prepared statement usage
- Monitoring integration

Replace the current database.py with this configuration once tested.
"""

from sqlalchemy import create_engine, event, pool
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# ============================================================
# DATABASE URL CONFIGURATION
# ============================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5433/intowork"
)

# Validate that database URL is set
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# For production, ensure SSL is enforced
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
if ENVIRONMENT == "production" and "sslmode" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"

# ============================================================
# ENGINE CONFIGURATION
# ============================================================

# Connection pool configuration tuned for INTOWORK workload
# - Read-heavy (job listings, applications)
# - Moderate write load (job creation, applications)
# - Expected concurrent users: 100-1000

if ENVIRONMENT == "production":
    # Production: Larger pool for concurrent connections
    pool_size = 20           # Connections per worker process
    max_overflow = 40        # Additional connections from overflow pool
    pool_timeout = 30        # Seconds to wait for connection
    pool_recycle = 3600      # Recycle connections after 1 hour (fixes stale connections)
    statement_timeout = "30000"  # 30 seconds (milliseconds)
    echo = False
else:
    # Development: Smaller pool, verbose logging
    pool_size = 5
    max_overflow = 10
    pool_timeout = 30
    pool_recycle = 3600
    statement_timeout = "60000"  # 60 seconds for slower dev machines
    echo = False  # Set to True to see SQL queries

# Connect args for driver-level configuration
connect_args = {
    "connect_timeout": 10,  # Timeout on initial connection
    "options": f"-c statement_timeout={statement_timeout}",  # Query timeout
}

# Add SSL support for production
if ENVIRONMENT == "production":
    connect_args["sslmode"] = "require"

# Create engine with pooling
engine = create_engine(
    DATABASE_URL,
    # Connection pooling
    poolclass=QueuePool,
    pool_size=pool_size,
    max_overflow=max_overflow,
    pool_timeout=pool_timeout,
    pool_recycle=pool_recycle,
    pool_pre_ping=True,  # Verify connection is alive before reusing

    # Performance
    echo=echo,
    future=True,  # Use SQLAlchemy 2.0 future behavior

    # Connection settings
    connect_args=connect_args,
)

# ============================================================
# EVENT HANDLERS FOR MONITORING & LOGGING
# ============================================================

@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """
    Called when a new DBAPI connection is created.
    Used for per-connection initialization.
    """
    # Ensure UTF-8 encoding
    if hasattr(dbapi_conn, 'set_client_encoding'):
        dbapi_conn.set_client_encoding('UTF-8')

    # Log connection event in development
    if ENVIRONMENT == "development":
        logger.debug(f"Database connection established (pool: {engine.pool.checkedout()}/{pool_size})")


@event.listens_for(engine, "engine_disposed")
def receive_engine_disposed(engine):
    """
    Called when engine.dispose() is called.
    Used for cleanup operations.
    """
    logger.warning("Database engine disposed - recreating connection pool")


@event.listens_for(engine, "pool_connect")
def receive_pool_connect(dbapi_conn, connection_record):
    """
    Called for each new connection from the pool.
    """
    pass


@event.listens_for(engine, "pool_checkin")
def receive_pool_checkin(dbapi_conn, connection_record):
    """
    Called when connection is returned to pool.
    Verify connection health before returning.
    """
    try:
        # Verify connection is still responsive
        dbapi_conn.isolation_level
    except Exception as e:
        logger.warning(f"Stale connection detected during checkin: {e}")
        connection_record.invalidate()


@event.listens_for(engine, "pool_overflow")
def receive_pool_overflow(dbapi_conn, connection_record):
    """
    Called when overflow pool is used (pool is exhausted).
    Log warning to monitor connection pool capacity.
    """
    logger.warning(
        f"Connection pool overflow - consider increasing pool_size "
        f"(current: {pool_size}, overflow: {max_overflow})"
    )


# ============================================================
# SESSION CONFIGURATION
# ============================================================

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,      # Explicit transactions
    autoflush=False,       # Explicit flushes
    expire_on_commit=False # Keep objects after commit for inspection
)

# ============================================================
# DECLARATIVE BASE
# ============================================================

Base = declarative_base()

# ============================================================
# DEPENDENCY INJECTION
# ============================================================

def get_db():
    """
    Dependency for FastAPI to get database session.

    Usage in routes:
        @router.get("/items")
        async def get_items(db: Session = Depends(get_db)):
            items = db.query(Item).all()
            return items

    Each request gets a fresh session from the pool.
    Session is automatically closed after request completes.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database error in request: {e}")
        db.rollback()
        raise
    finally:
        db.close()


# ============================================================
# HEALTH CHECK UTILITIES
# ============================================================

def check_database_connection() -> bool:
    """
    Check if database connection is healthy.

    Usage in liveness probes:
        @router.get("/health/db")
        async def health_check():
            if check_database_connection():
                return {"status": "healthy"}
            return {"status": "unhealthy"}
    """
    try:
        with engine.connect() as conn:
            # Execute simple query to verify connectivity
            result = conn.execute("SELECT 1")
            return result.scalar() == 1
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


def get_database_stats() -> dict:
    """
    Get connection pool statistics for monitoring.

    Returns:
        dict with pool status including checked_out connections, overflow count, etc.
    """
    if isinstance(engine.pool, QueuePool):
        return {
            "pool_size": engine.pool.size(),
            "checked_out": engine.pool.checkedout(),
            "overflow": engine.pool.overflow(),
            "total_connections": engine.pool.size() + engine.pool.overflow(),
        }
    return {}


# ============================================================
# INITIALIZATION (Run at startup)
# ============================================================

def init_db():
    """
    Initialize database tables from declarative models.
    Called at application startup if needed.

    Note: In production, use Alembic migrations instead.
    This is for local development only.
    """
    if ENVIRONMENT != "production":
        # Only auto-create in development
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized in development mode")


# ============================================================
# CLEANUP (Run at shutdown)
# ============================================================

def dispose_db():
    """
    Dispose of the engine and close all connections.
    Called at application shutdown.
    """
    logger.info("Closing database connections...")
    engine.dispose()
    logger.info("Database connections closed")


# ============================================================
# PERFORMANCE MONITORING QUERIES
# ============================================================

# These queries can be executed periodically to monitor database health
# Place in a monitoring service that runs every 5-10 minutes

MONITORING_QUERIES = {
    "cache_hit_ratio": """
        SELECT
            sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio
        FROM pg_statio_user_tables
        WHERE sum(heap_blks_hit) + sum(heap_blks_read) > 0;
    """,

    "table_sizes": """
        SELECT
            schemaname, tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 20;
    """,

    "slow_queries": """
        SELECT
            query, calls, mean_time, max_time,
            calls * mean_time as total_time
        FROM pg_stat_statements
        WHERE mean_time > 100  -- Queries taking more than 100ms
        ORDER BY mean_time DESC
        LIMIT 10;
    """,

    "index_usage": """
        SELECT
            schemaname, tablename, indexname,
            idx_scan, idx_tup_read, idx_tup_fetch
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
        LIMIT 20;
    """,

    "connection_count": """
        SELECT
            datname as database,
            usename as user,
            COUNT(*) as connections
        FROM pg_stat_activity
        GROUP BY datname, usename;
    """,

    "locks": """
        SELECT
            blocked_locks.pid as blocked_pid,
            blocked_locks.usename as blocked_user,
            blocking_locks.pid as blocking_pid,
            blocking_locks.usename as blocking_user
        FROM pg_catalog.pg_locks blocked_locks
        JOIN pg_catalog.pg_locks blocking_locks
            ON blocking_locks.locktype = blocked_locks.locktype
        WHERE NOT blocked_locks.granted AND blocked_locks.pid != blocking_locks.pid;
    """,
}
