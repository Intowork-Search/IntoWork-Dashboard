"""
Monitoring and Observability Configuration

This module sets up Prometheus metrics collection for:
- HTTP request metrics (latency, status codes, throughput)
- Database connection pool metrics
- Custom business metrics (jobs created, applications submitted)
- System resource metrics
"""

from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi import FastAPI, Response
from sqlalchemy.ext.asyncio import AsyncEngine
from loguru import logger
import time


# ==================== Custom Business Metrics ====================

# Job metrics
jobs_created_total = Counter(
    'intowork_jobs_created_total',
    'Total number of jobs created',
    ['employer_id', 'job_type', 'location_type']
)

jobs_published_total = Counter(
    'intowork_jobs_published_total',
    'Total number of jobs published',
    ['employer_id']
)

jobs_closed_total = Counter(
    'intowork_jobs_closed_total',
    'Total number of jobs closed',
    ['employer_id']
)

# Application metrics
applications_submitted_total = Counter(
    'intowork_applications_submitted_total',
    'Total number of applications submitted',
    ['candidate_id', 'job_id']
)

applications_status_changed_total = Counter(
    'intowork_applications_status_changed_total',
    'Total number of application status changes',
    ['from_status', 'to_status']
)

# User metrics
users_registered_total = Counter(
    'intowork_users_registered_total',
    'Total number of users registered',
    ['role']
)

users_signin_total = Counter(
    'intowork_users_signin_total',
    'Total number of successful sign-ins',
    ['role']
)

users_signin_failed_total = Counter(
    'intowork_users_signin_failed_total',
    'Total number of failed sign-in attempts'
)

# CV upload metrics
cv_uploads_total = Counter(
    'intowork_cv_uploads_total',
    'Total number of CV uploads',
    ['candidate_id']
)

cv_upload_size_bytes = Histogram(
    'intowork_cv_upload_size_bytes',
    'Size of uploaded CVs in bytes',
    buckets=(50000, 100000, 500000, 1000000, 5000000, 10000000)  # 50KB to 10MB
)

# Cache metrics
cache_hits_total = Counter(
    'intowork_cache_hits_total',
    'Total number of cache hits',
    ['cache_key_prefix']
)

cache_misses_total = Counter(
    'intowork_cache_misses_total',
    'Total number of cache misses',
    ['cache_key_prefix']
)

cache_operations_duration_seconds = Histogram(
    'intowork_cache_operations_duration_seconds',
    'Duration of cache operations in seconds',
    ['operation']  # get, set, delete
)

# Database metrics
db_query_duration_seconds = Histogram(
    'intowork_db_query_duration_seconds',
    'Duration of database queries in seconds',
    ['query_type']  # select, insert, update, delete
)

# Connection pool metrics
db_pool_size = Gauge(
    'intowork_db_pool_size',
    'Current size of database connection pool'
)

db_pool_checked_out = Gauge(
    'intowork_db_pool_checked_out',
    'Number of connections currently checked out from pool'
)

db_pool_overflow = Gauge(
    'intowork_db_pool_overflow',
    'Number of connections in overflow (beyond pool_size)'
)


# ==================== Instrumentator Setup ====================

def setup_monitoring(app: FastAPI):
    """
    Setup Prometheus monitoring for FastAPI application

    Features:
    - Automatic HTTP request instrumentation
    - Custom business metrics
    - Database connection pool metrics
    - /metrics endpoint for Prometheus scraping
    """

    logger.info("Setting up Prometheus monitoring...")

    # Create instrumentator
    instrumentator = Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=False,
        should_respect_env_var=True,
        should_instrument_requests_inprogress=True,
        excluded_handlers=["/metrics", "/health", "/"],
        env_var_name="ENABLE_METRICS",
        inprogress_name="intowork_requests_inprogress",
        inprogress_labels=True
    )

    # Add default metrics
    instrumentator.instrument(app)

    # Add custom latency buckets for our use case
    instrumentator.add(
        Histogram(
            'intowork_http_request_duration_seconds',
            'Duration of HTTP requests in seconds',
            ['method', 'endpoint', 'status'],
            buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0)
        )
    )

    logger.info("Prometheus instrumentation configured")

    return instrumentator


async def update_db_pool_metrics(engine: AsyncEngine):
    """
    Update database connection pool metrics

    Should be called periodically or on-demand
    """
    try:
        pool = engine.pool
        db_pool_size.set(pool.size())
        db_pool_checked_out.set(pool.checkedout())
        db_pool_overflow.set(pool.overflow())
    except Exception as e:
        logger.error(f"Failed to update DB pool metrics: {e}")


# ==================== Helper Functions ====================

def track_job_created(employer_id: int, job_type: str, location_type: str):
    """Track job creation metric"""
    jobs_created_total.labels(
        employer_id=str(employer_id),
        job_type=job_type,
        location_type=location_type
    ).inc()


def track_job_published(employer_id: int):
    """Track job publication metric"""
    jobs_published_total.labels(employer_id=str(employer_id)).inc()


def track_application_submitted(candidate_id: int, job_id: int):
    """Track application submission metric"""
    applications_submitted_total.labels(
        candidate_id=str(candidate_id),
        job_id=str(job_id)
    ).inc()


def track_user_registered(role: str):
    """Track user registration metric"""
    users_registered_total.labels(role=role).inc()


def track_user_signin(role: str):
    """Track successful sign-in metric"""
    users_signin_total.labels(role=role).inc()


def track_user_signin_failed():
    """Track failed sign-in attempt"""
    users_signin_failed_total.inc()


def track_cache_hit(cache_key_prefix: str):
    """Track cache hit"""
    cache_hits_total.labels(cache_key_prefix=cache_key_prefix).inc()


def track_cache_miss(cache_key_prefix: str):
    """Track cache miss"""
    cache_misses_total.labels(cache_key_prefix=cache_key_prefix).inc()


class MetricsTimer:
    """Context manager for timing operations"""

    def __init__(self, metric: Histogram, label_value: str):
        self.metric = metric
        self.label_value = label_value
        self.start_time = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        self.metric.labels(self.label_value).observe(duration)


# ==================== Metrics Endpoint ====================

def create_metrics_endpoint(app: FastAPI):
    """Create /metrics endpoint for Prometheus scraping"""

    @app.get("/metrics")
    async def metrics():
        """
        Prometheus metrics endpoint

        Returns metrics in Prometheus text format for scraping
        """
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

    logger.info("Metrics endpoint created at /metrics")
