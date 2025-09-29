# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy Python requirements and install dependencies
COPY requirements-railway.txt .
RUN pip install --no-cache-dir -r requirements-railway.txt

# Copy frontend package files
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy frontend source and build
COPY frontend/ .
RUN npm run build

# Go back to app directory and copy backend
WORKDIR /app
COPY src/ ./src/

# Create dist directory and copy built frontend
RUN mkdir -p dist && cp -r frontend/dist/* dist/

# Create minimal fallback if frontend build fails
RUN echo '<!DOCTYPE html><html><head><title>YouTube Extractor</title></head><body><h1>YouTube Extractor API</h1><p>Backend running successfully!</p><a href="/docs">View API Documentation</a></body></html>' > dist/index.html || true

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/ || exit 1

# Start command
CMD ["sh", "-c", "uvicorn src.api_server:app --host 0.0.0.0 --port $PORT"]