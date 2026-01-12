"""
Rate Limiter Configuration

Centralized rate limiter to avoid circular imports
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Security: Initialize rate limiter to prevent brute force and abuse
limiter = Limiter(key_func=get_remote_address)
