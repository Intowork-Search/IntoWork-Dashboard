FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app
COPY ./alembic ./alembic
COPY alembic.ini .
COPY start.sh .

# Create uploads directory and make script executable
RUN mkdir -p uploads/cv && \
    chmod +x start.sh

# Use PORT environment variable from Railway
EXPOSE $PORT

# Use startup script
CMD ["./start.sh"]
