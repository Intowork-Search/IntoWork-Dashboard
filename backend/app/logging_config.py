"""
Structured Logging Configuration with Loguru

This module configures loguru for production-grade structured logging with:
- JSON output for production
- Request ID tracking for distributed tracing
- Contextual logging with user/endpoint metadata
- Log rotation and retention
- Multiple log levels and formats based on environment
"""

import sys
import os
from loguru import logger
from pathlib import Path
import json


def serialize_record(record):
    """Serialize log record to JSON format for production"""
    subset = {
        "timestamp": record["time"].isoformat(),
        "level": record["level"].name,
        "message": record["message"],
        "module": record["name"],
        "function": record["function"],
        "line": record["line"],
    }

    # Add extra context fields if present
    if record["extra"]:
        subset["context"] = record["extra"]

    # Add exception info if present
    if record["exception"]:
        subset["exception"] = {
            "type": record["exception"].type.__name__ if record["exception"].type else None,
            "value": str(record["exception"].value) if record["exception"].value else None,
        }

    return json.dumps(subset)


def json_sink(message):
    """Custom sink for JSON output - writes pre-formatted JSON to stdout"""
    record = message.record
    output = serialize_record(record)
    sys.stdout.write(output + "\n")
    sys.stdout.flush()


def configure_logging():
    """
    Configure loguru logger based on environment

    Development: Human-readable colored output to stdout
    Production: JSON-formatted output to stdout + file with rotation
    """

    # Remove default handler
    logger.remove()

    # Get environment
    environment = os.getenv("ENVIRONMENT", "development")
    log_level = os.getenv("LOG_LEVEL", "INFO")

    if environment == "production":
        # Production: JSON format to stdout using custom sink
        logger.add(
            json_sink,
            level=log_level,
        )

        # Production: Also write to rotating file with JSON format
        logs_dir = Path(__file__).parent.parent / "logs"
        logs_dir.mkdir(exist_ok=True)

        def json_file_sink(message):
            """Write JSON logs to file"""
            record = message.record
            output = serialize_record(record)
            return output + "\n"

        logger.add(
            logs_dir / "app_{time:YYYY-MM-DD}.log",
            format="{message}",
            level=log_level,
            rotation="500 MB",
            retention="30 days",
            compression="zip",
            serialize=True,  # Use Loguru's built-in JSON serialization for files
        )
    else:
        # Development: Human-readable colored output
        logger.add(
            sys.stdout,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>",
            level=log_level,
            colorize=True,
        )

    # Log startup message
    logger.info(f"Logging configured for {environment} environment at {log_level} level")

    return logger


# Configure logging on module import
configure_logging()


# Middleware helper for request ID tracking
def get_or_create_request_id(request_id: str = None) -> str:
    """Get existing request ID or create new one"""
    import uuid
    return request_id or str(uuid.uuid4())


# Context manager for request logging
class LogContext:
    """Context manager for adding structured context to logs"""

    def __init__(self, **kwargs):
        self.context = kwargs

    def __enter__(self):
        logger.configure(extra=self.context)
        return logger

    def __exit__(self, exc_type, exc_val, exc_tb):
        logger.configure(extra={})
