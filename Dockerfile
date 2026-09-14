# =========================================================================
# ShopSense Multi-Vendor Analytics Platform - Master Dockerfile
# Milestone 4 & 5: Production Ready Containerization
# =========================================================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    psycopg2-binary>=2.9.9 \
    langgraph>=0.2.0 \
    pytest>=8.0.0 \
    httpx>=0.27.0

# Copy application files
COPY app/ ./app/
COPY backend/ ./backend/
COPY customer-backend/ ./customer-backend/
COPY real_catalog_data.json .
COPY shopsense.db .

ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV DATABASE_URL=""

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
