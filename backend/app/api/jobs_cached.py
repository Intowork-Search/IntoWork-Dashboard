"""
Caching helpers for jobs API

This module provides caching wrappers for job-related queries
"""

import json
import hashlib
from typing import Optional, List
from app.cache import cache, make_cache_key
from app.monitoring import track_cache_hit, track_cache_miss, MetricsTimer, cache_operations_duration_seconds
from loguru import logger


async def get_cached_jobs_list(
    page: int,
    limit: int,
    search: Optional[str],
    location: Optional[str],
    job_type: Optional[str],
    location_type: Optional[str],
    salary_min: Optional[int],
    user_id: Optional[int]
) -> Optional[dict]:
    """
    Get jobs list from cache

    Cache key includes all filter parameters and user_id (for has_applied flag)
    TTL: 60 seconds
    """
    if not cache.is_available:
        return None

    # Generate cache key from all parameters
    cache_key = make_cache_key(
        "jobs",
        page=page,
        limit=limit,
        search=search or "",
        location=location or "",
        job_type=job_type or "",
        location_type=location_type or "",
        salary_min=salary_min or 0,
        user_id=user_id or 0
    )

    with MetricsTimer(cache_operations_duration_seconds, "get"):
        result = await cache.get(cache_key)

    if result:
        track_cache_hit("jobs")
        logger.debug(f"Cache HIT for jobs list: {cache_key}")
        return result

    track_cache_miss("jobs")
    logger.debug(f"Cache MISS for jobs list: {cache_key}")
    return None


async def set_cached_jobs_list(
    page: int,
    limit: int,
    search: Optional[str],
    location: Optional[str],
    job_type: Optional[str],
    location_type: Optional[str],
    salary_min: Optional[int],
    user_id: Optional[int],
    data: dict
) -> bool:
    """
    Store jobs list in cache

    TTL: 60 seconds
    """
    if not cache.is_available:
        return False

    cache_key = make_cache_key(
        "jobs",
        page=page,
        limit=limit,
        search=search or "",
        location=location or "",
        job_type=job_type or "",
        location_type=location_type or "",
        salary_min=salary_min or 0,
        user_id=user_id or 0
    )

    with MetricsTimer(cache_operations_duration_seconds, "set"):
        success = await cache.set(cache_key, data, ttl=60)

    if success:
        logger.debug(f"Cached jobs list: {cache_key}")

    return success


async def get_cached_job_detail(job_id: int) -> Optional[dict]:
    """
    Get job detail from cache

    TTL: 300 seconds (5 minutes)
    """
    if not cache.is_available:
        return None

    cache_key = f"job:{job_id}"

    with MetricsTimer(cache_operations_duration_seconds, "get"):
        result = await cache.get(cache_key)

    if result:
        track_cache_hit("job_detail")
        logger.debug(f"Cache HIT for job detail: {job_id}")
        return result

    track_cache_miss("job_detail")
    logger.debug(f"Cache MISS for job detail: {job_id}")
    return None


async def set_cached_job_detail(job_id: int, data: dict) -> bool:
    """
    Store job detail in cache

    TTL: 300 seconds (5 minutes)
    """
    if not cache.is_available:
        return False

    cache_key = f"job:{job_id}"

    with MetricsTimer(cache_operations_duration_seconds, "set"):
        success = await cache.set(cache_key, data, ttl=300)

    if success:
        logger.debug(f"Cached job detail: {job_id}")

    return success


async def invalidate_job_caches(job_id: Optional[int] = None):
    """
    Invalidate job-related caches

    If job_id is provided, only invalidate that job's detail cache
    Otherwise, invalidate all job listing caches
    """
    if not cache.is_available:
        return

    if job_id:
        # Invalidate specific job detail
        await cache.delete(f"job:{job_id}")
        logger.info(f"Invalidated cache for job {job_id}")
    else:
        # Invalidate all job listings
        await cache.delete_pattern("jobs:*")
        logger.info("Invalidated all job listing caches")
