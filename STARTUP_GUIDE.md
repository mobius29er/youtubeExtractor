# YouTube ML Performance Predictor - System Startup Guide

## 🚀 Complete System Startup Commands

### 1. **Activate Python Environment**
```powershell
cd "C:\Github\Youtube Project"
& "C:/Github/Youtube Project/venv/Scripts/Activate.ps1"
```

### 2. **Start Dashboard API Server** (Port 8000)
```powershell
cd "C:\Github\Youtube Project"
python src/api_server.py
```
This serves the dashboard data and main analytics.

### 3. **Start Prediction API Server** (Port 8002)
```powershell
cd "C:\Github\Youtube Project"
python src/prediction_api.py
```
This serves the ML-powered video performance predictions.

### 4. **Start Frontend Development Server** (Port 3001)
```powershell
cd "C:\Github\Youtube Project\frontend"
npm run dev
```
This serves the React frontend with Vite.

## 📋 Complete Step-by-Step Setup

### **Terminal 1 - Dashboard API:**
```powershell
cd "C:\Github\Youtube Project"
& "C:/Github/Youtube Project/venv/Scripts/Activate.ps1"
python src/api_server.py
```
**Expected output:** `🚀 Starting YouTube Extractor API server...`

### **Terminal 2 - Prediction API:**
```powershell
cd "C:\Github\Youtube Project"
& "C:/Github/Youtube Project/venv/Scripts/Activate.ps1"
python src/prediction_api.py
```
**Expected output:** `🔄 Loading ML models...` followed by `🚀 Starting YouTube Performance Prediction API...`

### **Terminal 3 - Frontend:**
```powershell
cd "C:\Github\Youtube Project\frontend"
npm run dev
```
**Expected output:** Vite dev server starting on `http://localhost:3001`

## 🌐 Access URLs

Once all services are running:

- **🎯 Main Application:** http://localhost:3001
- **📊 Dashboard API:** http://localhost:8000
- **🤖 Prediction API:** http://localhost:8002
- **📚 API Documentation:** http://localhost:8002/docs

## 🔍 Quick Health Check Commands

```powershell
# Check if all ports are active
netstat -an | findstr ":3001 :8000 :8002"

# Test prediction API
curl -X GET "http://localhost:8002/api/test"

# Test dashboard API
curl -X GET "http://localhost:8000/api/status"
```

## 🛠️ Troubleshooting Commands

If you need to kill existing processes:

```powershell
# Find processes using the ports
netstat -ano | findstr ":8000"
netstat -ano | findstr ":8002"
netstat -ano | findstr ":3001"

# Kill specific process (replace PID with actual process ID)
taskkill /PID [PID_NUMBER] /F
```

## 📝 Service Dependencies

**Order matters:** Start services in this order:

1. **Dashboard API (8000)** - Provides data
2. **Prediction API (8002)** - Provides ML predictions
3. **Frontend (3001)** - Consumes both APIs

The frontend is configured with proxy rules to route:
- `/api/predict` → Prediction API (port 8002)
- `/api/*` → Dashboard API (port 8000)

All services should show startup messages confirming they're ready before proceeding to the next one! 🎉

## 🎯 Features Available

Once all services are running, you'll have access to:

- **📊 Data Dashboard** - View extracted YouTube channel and video analytics
- **🤖 ML Predictions** - AI-powered video performance predictions
- **🖼️ Thumbnail Analysis** - Upload and analyze video thumbnails
- **🏷️ Smart Tags** - Get recommended tags based on content analysis
- **📈 Performance Metrics** - Views, RQS, and CTR predictions
- **🎨 Dark/Light Mode** - Toggle between visual themes
- **📱 Responsive Design** - Works on desktop and mobile devices

## 💡 Tips

- Keep all three terminals open while using the application
- The prediction API may take a few seconds to load all ML models on first startup
- If you encounter port conflicts, use the troubleshooting commands to kill existing processes
- The frontend will automatically proxy API requests to the correct backend services