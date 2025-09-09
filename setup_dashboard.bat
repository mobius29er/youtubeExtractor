@echo off
REM Setup script for YouTube Extractor Frontend Dashboard (Windows)

echo 🎨 Setting up YouTube Extractor Frontend Dashboard...
echo ==================================================

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 16+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check npm installation
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found! Please install npm.
    pause
    exit /b 1
)

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version
echo ✅ npm version: 
npm --version
echo ✅ Python version: 
python --version

echo.
echo 📦 Installing Frontend Dependencies...
echo ======================================
cd frontend
call npm install

echo.
echo 🐍 Installing Backend Dependencies...
echo ====================================
cd ..
python -m pip install fastapi uvicorn pandas python-multipart

echo.
echo 🚀 Setup Complete!
echo ==================
echo.
echo To start the development servers:
echo.
echo Frontend (Terminal 1):
echo   cd frontend
echo   npm run dev
echo   → Dashboard: http://localhost:3000
echo.
echo Backend API (Terminal 2):
echo   python api_server.py
echo   → API: http://localhost:8000
echo   → Docs: http://localhost:8000/docs
echo.
echo 🎉 Happy analyzing!
pause
