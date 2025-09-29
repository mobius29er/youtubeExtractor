#!/bin/bash

# YouTube Extractor - Railway Deployment Setup Script

echo "🚂 Setting up Railway deployment for YouTube Extractor..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Please login to Railway (this will open your browser)..."
railway login

echo "🎯 Initializing Railway project..."
railway init

echo "📝 Setting up environment variables..."
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS="https://youtubeextractor.up.railway.app"
railway variables set DATA_DIR="/app/extracted_data"  
railway variables set MODELS_DIR="/app/extracted_data/models"

echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at: https://youtubeextractor.up.railway.app"
echo "📊 Monitor deployment: https://railway.app/dashboard"