# Multi-stage build for Dashboard Service
FROM node:20-slim as frontend-builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy frontend source and build
COPY frontend/ .
RUN npm run build && echo "✅ Frontend build successful" || (echo "❌ Frontend build failed" && exit 1)

# Python stage for dashboard API
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements-railway.txt .
RUN pip install --no-cache-dir -r requirements-railway.txt

# Copy backend source
COPY src/ ./src/

# Copy data files
COPY extracted_data/ ./extracted_data/
RUN echo "Copied extracted_data directory for dashboard"
RUN ls -la extracted_data/ | head -10

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
RUN echo "✅ Frontend copied to frontend/dist/"
RUN ls -la frontend/dist/ | head -5

# Health check - give more time for startup
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl --fail http://localhost:8000/api/health || exit 1

# Expose port
EXPOSE 8000

# Run dashboard API server
CMD ["python", "src/api_server.py"]