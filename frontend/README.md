# 🎨 YouTube Extractor Frontend Dashboard

A modern, interactive web dashboard for visualizing and monitoring YouTube data extraction results.

## ✨ Features

- **📊 Interactive Dashboard**: 6 clickable metric cards with smart filtering and modal views
- **🤖 ML Predictions**: Real-time CTR, RQS, and view count predictions via integrated API
- **📈 Advanced Visualization**: Interactive charts and graphs powered by Recharts
- **� Smart Filtering**: Pre-configured filters for quick data exploration
- **📱 Responsive Modals**: Detailed video breakdowns with performance analytics
- **🚀 Production Ready**: Deployed and battle-tested with comprehensive error handling
- **🌙 Dark/Light Mode**: Toggle between themes for optimal viewing
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: FastAPI + Python with ML prediction models
- **ML Models**: CTR, RQS, and Views prediction with 60-80% accuracy
- **State Management**: React Hooks
- **Production**: Railway deployment with health monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ with pip
- Your YouTube extraction data files

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Backend API Setup

```bash
# Install Python dependencies
pip install -r requirements-prediction.txt

# Start the prediction API server
python src/prediction_api.py
```

The API will be available at `http://localhost:8000` with ML prediction endpoints.

## 📊 Dashboard Sections

### 1. Interactive Main Dashboard
- **6 Clickable Metric Cards**: Total videos, channels, engagement stats with smart filtering
- **Modal Integration**: Click any card to open detailed video breakdowns
- **Performance Predictions**: Real-time ML predictions for CTR, RQS, and view counts
- **Smart Filters**: Pre-configured filters for high performers, recent uploads, etc.
- **Channel Analytics**: Deep-dive into individual channel performance

### 2. Enhanced Video Modals
- **All Videos Modal**: Filterable list of all videos with performance metrics
- **Video Details Modal**: Individual video analysis with duration parsing and predictions
- **Performance Insights**: ML-powered recommendations and trend analysis
- **Export Capabilities**: Download filtered datasets for further analysis

### 3. Data Visualization & Analytics
- **Engagement Charts**: Interactive visualizations showing channel performance
- **ML Model Insights**: Prediction accuracy metrics and model performance
- **Genre Distribution**: Content category analysis with performance correlations
- **Trend Analysis**: Time-series data showing growth patterns

## 🎨 Customization

### Themes
The dashboard supports both light and dark themes. Toggle using the moon/sun icon in the navigation.

### Colors
Custom color scheme defined in `tailwind.config.js`:
- YouTube Red: `#FF0000`
- Creator Blue: `#4285F4` 
- Data Green: `#34A853`
- Insight Purple: `#9333EA`

### Adding New Charts
1. Create new component in `src/components/`
2. Import chart type from Recharts
3. Add data processing logic
4. Register in navigation

## 📡 API Endpoints

The backend provides these REST endpoints:

**Dashboard & Analytics**
- `GET /api/dashboard` - Dashboard summary data with ML predictions
- `GET /api/channels` - Detailed channel information and analytics
- `GET /api/videos` - Comprehensive video data with filtering support
- `GET /api/health` - API health check and system status

**ML Prediction Services**
- `POST /predict/ctr` - Click-through rate prediction
- `POST /predict/rqs` - Retention Quality Score prediction  
- `POST /predict/views` - View count prediction
- `POST /predict/bulk` - Batch predictions for multiple videos

**Data Management**
- `GET /api/visualization` - Chart and visualization data
- `POST /api/refresh` - Refresh data from source files
- `GET /api/export` - Export filtered datasets

## 🔧 Development

### File Structure
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx    # Interactive dashboard with clickable cards
│   │   ├── AllVideosModal.jsx    # Filterable video list modal
│   │   ├── VideoDetailsModal.jsx # Individual video analysis
│   │   ├── DataVisualization.jsx # Charts and analytics
│   │   ├── Navigation.jsx   # App navigation
│   │   └── FilterControls.jsx # Advanced filtering
│   ├── utils/
│   │   └── rqsUtils.js     # RQS calculation utilities
│   ├── App.jsx             # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles with custom themes
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

### Adding New Features

1. **New Dashboard Card**: Create component in `components/`
2. **New Chart Type**: Import from Recharts and add to DataVisualization
3. **New API Endpoint**: Add to `api_server.py` and update frontend calls
4. **New Page**: Add route to App.jsx and navigation item

## 🚀 Deployment

### Frontend (Railway/Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder or connect git repository
```

### Production Backend (Railway)
The prediction API is deployed on Railway with:
- Automatic deployments from GitHub
- Health monitoring and uptime tracking
- Scalable compute resources for ML predictions
- Environment variable management

### Local Development
```bash
# Frontend
npm run dev

# Backend 
python src/prediction_api.py
```

## 🎯 Recent Enhancements

- **✅ Interactive Dashboard Cards**: 6 clickable metric cards with smart filtering
- **✅ Enhanced Modal System**: Detailed video breakdowns with performance analytics  
- **✅ ML Integration**: Real-time predictions for CTR, RQS, and view counts
- **✅ Duration Parsing**: Robust ISO 8601 duration formatting with fractional seconds
- **✅ Production Deployment**: Battle-tested Railway deployment with monitoring
- **✅ Advanced Filtering**: Pre-configured filters for data exploration
- **✅ Repository Cleanup**: Removed 200MB of redundant files for better performance

## 🎯 Future Enhancements

- **🔐 Authentication**: User login and role-based access
- **📊 Advanced Analytics**: Deeper statistical analysis and trending insights
- **� Alert System**: Notifications for prediction anomalies
- **🔄 Real-time Updates**: WebSocket integration for live data
- **📱 PWA Support**: Install as native app with offline capabilities

## 🐛 Troubleshooting

### Common Issues

**Frontend won't start**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API connection errors**
- Check that backend is running on port 8000
- Verify CORS configuration in FastAPI
- Ensure data files exist in `extracted_data/`

**Charts not displaying**
- Verify data format matches expected structure
- Check browser console for JavaScript errors
- Ensure Recharts is properly installed

## 📝 License

see parent project for full details

---

**Built with ❤️ for the YouTube creator economy**
