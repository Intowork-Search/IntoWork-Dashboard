"""
Request ID Middleware for Distributed Tracing

This middleware adds a unique request ID to each incoming request,
enabling correlation of logs across the entire request lifecycle.
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from loguru import logger


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware to generate and track request IDs for distributed tracing

    Features:
    - Generates UUID v4 for each request (or uses X-Request-ID header if provided)
    - Adds request_id to loguru context for all logs during request
    - Returns X-Request-ID header in response for client correlation
    - Logs request start and end with timing information
    """

    async def dispatch(self, request: Request, call_next):
        # Get or generate request ID
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # Add request ID to loguru context
        with logger.contextualize(request_id=request_id, path=request.url.path, method=request.method):
            # Log request start
            logger.info(f"Request started: {request.method} {request.url.path}")

            # Process request
            try:
                response = await call_next(request)

                # Log request completion
                logger.info(
                    f"Request completed: {request.method} {request.url.path} - Status: {response.status_code}"
                )

                # Add request ID to response headers
                response.headers["X-Request-ID"] = request_id

                return response

            except Exception as e:
                # Log request failure
                logger.error(
                    f"Request failed: {request.method} {request.url.path} - Error: {str(e)}",
                    exc_info=True
                )
                raise
