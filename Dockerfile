# Multi-stage Dockerfile for SENTINEL-X Backend
FROM python:3.11-slim

# Install system dependencies for OpenCV & Computer Vision
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency specifications
COPY backend/requirements.txt ./backend/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy source code and models
COPY backend ./backend
COPY yolov8n.pt ./yolov8n.pt

# Expose default backend port
EXPOSE 8000

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    ENVIRONMENT=production

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Launch uvicorn server
CMD ["sh", "-c", "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]
