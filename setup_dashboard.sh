#!/bin/bash
# Setup script for YouTube Extractor Frontend Dashboard

echo "🎨 Setting up YouTube Extractor Frontend Dashboard..."
echo "=================================================="

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check npm installation  
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found! Please install npm."
    exit 1
fi

# Check Python installation
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python not found! Please install Python 3.8+ first."
    exit 1
fi

# Get Python command
PYTHON_CMD="python3"
if command -v python &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo "✅ Python version: $($PYTHON_CMD --version)"

echo ""
echo "📦 Installing Frontend Dependencies..."
echo "======================================"
cd frontend
npm install

echo ""
echo "🐍 Installing Backend Dependencies..."
echo "===================================="
cd ..
$PYTHON_CMD -m pip install fastapi uvicorn pandas python-multipart

echo ""
echo "🚀 Setup Complete!"
echo "=================="
echo ""
echo "To start the development servers:"
echo ""
echo "Frontend (Terminal 1):"
echo "  cd frontend"
echo "  npm run dev"
echo "  → Dashboard: http://localhost:3000"
echo ""
echo "Backend API (Terminal 2):"
echo "  python api_server.py"
echo "  → API: http://localhost:8000"
echo "  → Docs: http://localhost:8000/docs"
echo ""
echo "🎉 Happy analyzing!"
