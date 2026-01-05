# Multi-stage Dockerfile for FastAPI Backend (Railway Deployment)
# Optimized for Python 3.11+ with PostgreSQL and Alembic migrations

# Stage 1: Base image with Python dependencies
FROM python:3.11-slim AS base

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies required for PostgreSQL and Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS dependencies

# Copy requirements file
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Production image
FROM base AS production

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/backend/uploads/cv && \
    chown -R appuser:appuser /app

# Copy Python dependencies from dependencies stage
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=appuser:appuser backend/ /app/backend/

WORKDIR /app/backend

# Set correct permissions for startup script
RUN chmod +x /app/backend/start.sh

# Switch to non-root user
USER appuser

# Expose the port (Railway will provide PORT env variable)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')" || exit 1

# Use the startup script which handles migrations and server start
CMD ["bash", "/app/backend/start.sh"]
