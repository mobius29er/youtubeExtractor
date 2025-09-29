#!/bin/bash

# Railway startup script for YouTube Extractor

echo "🚀 Starting YouTube Extractor on Railway..."

# Create necessary directories
mkdir -p /app/extracted_data/models
mkdir -p /app/logs

# Set proper permissions
chmod -R 755 /app/extracted_data
chmod -R 755 /app/logs

# Check if data files exist
if [ ! -f "/app/extracted_data/api_only_complete_data.json" ]; then
    echo "⚠️ No data file found. Creating sample data..."
    mkdir -p /app/extracted_data
    echo '{"data": {}}' > /app/extracted_data/api_only_complete_data.json
fi

# Start the FastAPI server
echo "🎯 Starting FastAPI server on port $PORT..."
exec uvicorn src.api_server:app --host 0.0.0.0 --port $PORT --workers 1