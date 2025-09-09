# 🎨 YouTube Extractor Frontend Dashboard

A modern, interactive web dashboard for visualizing and monitoring YouTube data extraction results.

## ✨ Features

- **📊 Real-time Dashboard**: Live stats and metrics from your YouTube dataset
- **📈 Data Visualization**: Interactive charts and graphs powered by Recharts
- **🔄 Extraction Status**: Real-time monitoring of data extraction progress
- **🌙 Dark/Light Mode**: Toggle between themes for optimal viewing
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🚀 Fast Performance**: Built with React + Vite for lightning-fast loading

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: FastAPI + Python
- **State Management**: React Hooks

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
pip install fastapi uvicorn pandas

# Start the API server
python api_server.py
```

The API will be available at `http://localhost:8000`

## 📊 Dashboard Sections

### 1. Main Dashboard
- **Key Metrics**: Total videos, channels, engagement stats
- **Channel Status**: Overview of extraction progress per channel
- **Data Quality**: Health scores and verification status
- **Quick Actions**: Export data, start analysis

### 2. Data Visualization
- **Engagement Charts**: Interactive bar charts showing channel performance
- **Genre Distribution**: Pie charts of content categories
- **Performance Trends**: Time-series analysis of metrics
- **Correlation Analysis**: Scatter plots showing relationships

### 3. Extraction Status
- **Real-time Monitoring**: Live extraction progress
- **System Health**: API response times, uptime statistics  
- **Channel Progress**: Individual channel extraction status
- **Data Export**: Download processed datasets

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

- `GET /api/dashboard` - Dashboard summary data
- `GET /api/channels` - Detailed channel information
- `GET /api/visualization` - Chart and visualization data
- `GET /api/status` - Real-time extraction status
- `POST /api/refresh` - Refresh data from source files

## 🔧 Development

### File Structure
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── DataVisualization.jsx
│   │   ├── ExtractionStatus.jsx
│   │   └── Navigation.jsx
│   ├── App.jsx             # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
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

### Frontend (Netlify/Vercel)
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

### Backend (Railway/Heroku)
```bash
# Ensure requirements.txt includes:
# fastapi
# uvicorn
# pandas

# Deploy using your platform's CLI
```

## 🎯 Future Enhancements

- **🤖 ML Model Integration**: Display model predictions and insights
- **📧 Alert System**: Email notifications for extraction completion
- **🔐 Authentication**: User login and role-based access
- **📊 Advanced Analytics**: Deeper statistical analysis
- **🔄 Auto-refresh**: Real-time updates without manual refresh
- **📱 PWA Support**: Install as native app

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

MIT License - see parent project for full details

---

**Built with ❤️ for the YouTube creator economy**
