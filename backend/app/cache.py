"""
Redis Caching Layer for Frequent Queries

This module provides async Redis caching with:
- Connection pooling for performance
- Cache-aside pattern implementation
- Automatic TTL management
- Cache invalidation helpers
- Graceful degradation when Redis unavailable
"""

import os
import json
from typing import Optional, Any, Callable
import redis.asyncio as redis
from redis.asyncio.connection import ConnectionPool
from loguru import logger
from functools import wraps
import hashlib


class RedisCache:
    """
    Async Redis cache client with connection pooling

    Features:
    - Automatic serialization/deserialization (JSON)
    - Connection pooling for high performance
    - Health checks and graceful degradation
    - Cache key namespacing
    """

    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.pool: Optional[ConnectionPool] = None
        self._is_available = False

    async def connect(self):
        """Initialize Redis connection pool"""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

            # Create connection pool
            self.pool = ConnectionPool.from_url(
                redis_url,
                max_connections=20,
                decode_responses=True,  # Auto-decode bytes to str
                socket_keepalive=True,
                socket_connect_timeout=5,
                health_check_interval=30
            )

            # Create Redis client
            self.client = redis.Redis(connection_pool=self.pool)

            # Test connection
            await self.client.ping()
            self._is_available = True

            logger.info(f"Redis cache connected successfully: {redis_url}")

        except Exception as e:
            logger.warning(f"Redis connection failed (caching disabled): {e}")
            self._is_available = False

    async def disconnect(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()
            logger.info("Redis cache disconnected")

    @property
    def is_available(self) -> bool:
        """Check if Redis is available"""
        return self._is_available and self.client is not None

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Deserialized value or None if not found/error
        """
        if not self.is_available:
            return None

        try:
            value = await self.client.get(key)
            if value:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value)

            logger.debug(f"Cache MISS: {key}")
            return None

        except Exception as e:
            logger.error(f"Cache GET error for key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """
        Set value in cache with TTL

        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: 5 minutes)

        Returns:
            True if successful, False otherwise
        """
        if not self.is_available:
            return False

        try:
            serialized = json.dumps(value, default=str)  # default=str handles datetime
            await self.client.setex(key, ttl, serialized)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            return True

        except Exception as e:
            logger.error(f"Cache SET error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete key from cache

        Args:
            key: Cache key to delete

        Returns:
            True if deleted, False otherwise
        """
        if not self.is_available:
            return False

        try:
            await self.client.delete(key)
            logger.debug(f"Cache DELETE: {key}")
            return True

        except Exception as e:
            logger.error(f"Cache DELETE error for key {key}: {e}")
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern

        Args:
            pattern: Pattern to match (e.g., "jobs:*")

        Returns:
            Number of keys deleted
        """
        if not self.is_available:
            return 0

        try:
            # Find all matching keys
            keys = []
            async for key in self.client.scan_iter(match=pattern):
                keys.append(key)

            # Delete in batch if keys found
            if keys:
                deleted = await self.client.delete(*keys)
                logger.debug(f"Cache DELETE PATTERN: {pattern} ({deleted} keys)")
                return deleted

            return 0

        except Exception as e:
            logger.error(f"Cache DELETE PATTERN error for {pattern}: {e}")
            return 0

    async def invalidate_job_cache(self, job_id: Optional[int] = None):
        """Invalidate job-related caches"""
        if job_id:
            await self.delete(f"job:{job_id}")
            logger.info(f"Invalidated cache for job {job_id}")
        else:
            await self.delete_pattern("jobs:*")
            logger.info("Invalidated all job listing caches")

    async def invalidate_dashboard_cache(self, user_id: int):
        """Invalidate dashboard cache for user"""
        await self.delete(f"dashboard:{user_id}")
        logger.info(f"Invalidated dashboard cache for user {user_id}")

    async def invalidate_company_cache(self, company_id: int):
        """Invalidate company cache"""
        await self.delete(f"company:{company_id}")
        logger.info(f"Invalidated cache for company {company_id}")


# ==================== Cache Key Helpers ====================

def make_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Generate consistent cache key from prefix and parameters

    Args:
        prefix: Key prefix (e.g., "jobs", "dashboard")
        *args: Positional arguments to include in key
        **kwargs: Keyword arguments to include in key

    Returns:
        Cache key string
    """
    # Combine all parameters
    params = list(args)
    if kwargs:
        # Sort kwargs for consistency
        params.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])

    # Create hash of parameters for shorter keys
    if params:
        param_str = ":".join(str(p) for p in params)
        param_hash = hashlib.md5(param_str.encode()).hexdigest()[:8]
        return f"{prefix}:{param_hash}"

    return prefix


# ==================== Cache Decorator ====================

def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator for caching function results

    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key

    Usage:
        @cached(ttl=60, key_prefix="jobs")
        async def get_jobs(filters):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get cache instance from kwargs or args
            cache = kwargs.get('cache') or (args[0] if args and hasattr(args[0], 'get') else None)

            if not cache or not cache.is_available:
                # No cache available, call function directly
                return await func(*args, **kwargs)

            # Generate cache key
            cache_key = make_cache_key(key_prefix or func.__name__, *args[1:], **kwargs)

            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            # Cache miss - call function
            result = await func(*args, **kwargs)

            # Store in cache
            if result is not None:
                await cache.set(cache_key, result, ttl)

            return result

        return wrapper
    return decorator


# ==================== Global Cache Instance ====================

# Create global cache instance
cache = RedisCache()


# ==================== Cache Statistics ====================

class CacheStats:
    """Track cache statistics for monitoring"""

    def __init__(self):
        self.hits = 0
        self.misses = 0
        self.errors = 0

    @property
    def hit_rate(self) -> float:
        """Calculate cache hit rate"""
        total = self.hits + self.misses
        return (self.hits / total * 100) if total > 0 else 0.0

    def record_hit(self):
        """Record cache hit"""
        self.hits += 1

    def record_miss(self):
        """Record cache miss"""
        self.misses += 1

    def record_error(self):
        """Record cache error"""
        self.errors += 1

    def reset(self):
        """Reset statistics"""
        self.hits = 0
        self.misses = 0
        self.errors = 0


# Global cache stats
cache_stats = CacheStats()
