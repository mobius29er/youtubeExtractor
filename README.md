# 🎯 YouTube Performance Predictor — AI-Powered Creator Analytics

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-brightgreen)](https://virtuous-insight-production-cc49.up.railway.app/)
[![ML Models](https://img.shields.io/badge/ML%20Models-24%20Trained-blue)](#ml-architecture)
[![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%2B%20React%20%2B%20Docker-orange)](#technology-stack)

> **Predict YouTube video performance before you publish.** Get AI-powered insights on CTR, retention scores, and view predictions using advanced machine learning and computer vision.

**🚀 [Try the Live Demo](https://virtuous-insight-production-cc49.up.railway.app/)**

---

## 📊 What This Does

Transform your video ideas into data-driven decisions:

- **🎯 CTR Prediction**: Forecast click-through rates with 20%+ accuracy
- **📈 View Forecasting**: Predict expected views based on your channel size
- **🏆 RQS Scoring**: Get retention quality scores (0-100)
- **🖼️ Thumbnail Analysis**: Computer vision insights on colors, faces, text
- **🏷️ Smart Tag Recommendations**: AI-generated tags based on title and genre
- **⚡ Real-Time Predictions**: Get results in seconds, not hours

### Live Example
```
Input: "24 Hours in Adoration" (Challenge, 10K subs, 8 min)
Output: 
├── CTR: 20.59% (Excellent)
├── Views: 2.1K (Above average)
├── RQS: 41.31% (Good retention)
└── Tags: [challenge, stunts, extreme, amazing, 2025]
```

---

## 🧠 ML Architecture

### Sequential Prediction Pipeline
```
Video Data → CTR Model → RQS Model → Views Model → Performance Score
     ↓           ↓           ↓           ↓
  Features   Baseline+    Advanced     Guardrails
   (131)    Residual     Features      Applied
```

### Model Details
- **CTR Model**: 131 features including text embeddings, thumbnail analysis, duration
- **RQS Model**: 131 features for retention quality prediction
- **Views Model**: 13 features using CTR/RQS predictions + channel metrics
- **Computer Vision**: OpenCV pipeline for face detection, color analysis
- **Text Processing**: TF-IDF + SVD embeddings for titles, descriptions, tags

### Training Data
- **1,000+ YouTube videos** across 5 genres
- **25 top creators** (MrBeast, Kurzgesagt, Jacksepticeye, etc.)
- **Real performance metrics** from YouTube Data API
- **Intelligent sampling**: Top/bottom/random video selection

---

## 🎨 User Interface

### Modern, Responsive Design
- **🌙 Dark/Light Theme**: Automatic theme switching
- **📱 Mobile Optimized**: Works on all devices
- **⚡ Real-Time**: Instant predictions with loading states
- **🎯 Smart Forms**: Duration input, genre selection, thumbnail upload
- **📊 Visual Results**: Clean charts and confidence indicators

### Key Features
- **Thumbnail Upload**: Drag-and-drop with preview
- **Smart Defaults**: 8-minute duration, intelligent tag generation
- **Confidence Scoring**: Visual indicators for prediction reliability
- **Error Handling**: Graceful fallbacks and user feedback

---

## 🚀 Technology Stack

### Backend (Python)
```python
FastAPI          # High-performance API framework
scikit-learn     # Machine learning models
OpenCV           # Computer vision processing
NumPy/Pandas     # Data processing
joblib           # Model persistence
PIL              # Image processing
```

### Frontend (React)
```javascript
React 18         # Modern UI framework
Tailwind CSS     # Utility-first styling
Lucide Icons     # Beautiful icons
Responsive       # Mobile-first design
```

### Infrastructure
```yaml
Docker:          # Containerized deployment
Railway:         # Cloud hosting platform
GitHub Actions:  # CI/CD pipeline
Git LFS:         # Large model file storage
```

---

## 📁 Project Structure

```
📦 YouTube Performance Predictor
├── 🤖 models/                          # Complete ML pipeline (24 trained models)
│   ├── ctr_model.joblib               # CTR prediction model
│   ├── ctr_baseline.joblib            # CTR baseline features
│   ├── ctr_features.joblib            # CTR feature engineering
│   ├── rqs_model.joblib               # RQS prediction model  
│   ├── rqs_features.joblib            # RQS feature engineering
│   ├── rqs_weights.joblib             # RQS ensemble weights
│   ├── views_baseline_model.joblib    # Views baseline predictor
│   ├── views_residual_model.joblib    # Views residual predictor
│   ├── views_guardrails.json          # Views prediction bounds
│   ├── tfidf_*.joblib                 # Text embedding models (5 files)
│   └── svd_*.joblib                   # Dimensionality reduction (5 files)
├── 🔥 src/                            # Backend services
│   ├── prediction_api.py              # Main ML prediction API
│   ├── api_server.py                  # Legacy data extraction API
│   ├── corrected_data_extractor.py    # YouTube data collector
│   ├── dataset_analyzer.py            # Training data analysis
│   └── supplementary_analysis.py      # Additional analytics
├── ⚛️ frontend/                       # React dashboard application
│   ├── src/
│   │   ├── components/                # UI components
│   │   │   ├── VideoPerformancePredictor.jsx  # Main prediction interface
│   │   │   ├── Dashboard.jsx          # Data overview dashboard
│   │   │   ├── DataVisualization.jsx  # Interactive charts
│   │   │   ├── ComparisonAnalytics.jsx # Video comparison tools
│   │   │   ├── AllVideosModal.jsx     # Video library viewer
│   │   │   ├── VideoDetailsModal.jsx  # Individual video details
│   │   │   ├── FilterControls.jsx     # Data filtering options
│   │   │   ├── Navigation.jsx         # App navigation
│   │   │   └── ExtractionStatus.jsx   # Real-time status
│   │   ├── utils/                     # Helper functions
│   │   ├── App.jsx                    # Main React app
│   │   └── main.jsx                   # React entry point
│   ├── package.json                   # Node.js dependencies
│   └── public/                        # Static assets
├── � extracted_data/                 # Training datasets & outputs
│   ├── api_only_ml_dataset.csv        # ML-ready training data
│   ├── youtube_channel_data.json      # Channel metadata
│   ├── metadata_only.json             # Video metadata
│   ├── caption_availability_report.json # Caption analysis
│   ├── thumbnails/                    # Downloaded thumbnail images
│   └── comments_raw/                  # Raw comment data
├── 📋 scripts/                        # Development & analysis tools
│   ├── analysis/                      # Data analysis scripts
│   ├── cleanup/                       # Data cleaning utilities
│   ├── utilities/                     # Helper scripts
│   └── verification/                  # Data validation tools
├── �🐳 Docker & Deployment             # Container & hosting config
│   ├── Dockerfile.prediction          # ML prediction service
│   ├── Dockerfile.dashboard           # Dashboard service
│   ├── railway.toml                   # Railway deployment config
│   ├── Procfile                       # Process definitions
│   └── deploy-railway.sh/.bat         # Deployment scripts
├── 📚 Documentation                   # Project documentation
│   ├── README.md                      # This file
│   ├── STARTUP_GUIDE.md               # Setup instructions
│   ├── RAILWAY_DEPLOY.md              # Deployment guide
│   ├── COMMERCIAL_STRATEGY.md         # Business strategy
│   └── docs/                          # Additional documentation
├── � Configuration                   # Environment & settings
│   ├── requirements-prediction.txt    # ML service dependencies
│   ├── requirements-railway.txt       # Railway dependencies
│   ├── requirements.txt               # Full dependencies
│   ├── .env.prediction                # ML service environment
│   ├── .github/                       # GitHub Actions CI/CD
│   └── config/                        # App configuration files
├── �️ Development Resources           # Development assets
│   ├── notebooks/                     # Jupyter analysis notebooks
│   ├── colab/                         # Google Colab notebooks
│   ├── analysis_output/               # Analysis results
│   ├── logs/                          # Application logs
│   ├── backups/                       # Data backups
│   └── archive/                       # Development history
└── 🧪 Testing & Validation            # Testing resources
    ├── test_prediction.py             # API testing script
    ├── test-prediction-url.html       # Web testing interface
    └── __pycache__/                   # Python cache files
```

---

## 🎯 Genres Supported

| Genre | Examples | CTR Support |
|-------|----------|-------------|
| 🎮 Gaming | Jacksepticeye, Call Me Kevin | ✅ Full |
| 🔬 Education/Science | Kurzgesagt, Veritasium | ✅ Full |
| 🎯 Challenges/Stunts | MrBeast, Ryan Trahan | ✅ Full |
| ⛪ Christian/Catholic | Bishop Barron, Ascension | ✅ Full |
| 👨‍👩‍👧‍👦 Kids/Family | Cocomelon, Diana and Roma | 🔶 Limited |

---

## 🚀 Quick Start

### 1. Try the Live Demo
Visit **[YouTube Performance Predictor](https://virtuous-insight-production-cc49.up.railway.app/)** to test immediately.

### 2. Local Development
```bash
# Clone repository
git clone https://github.com/mobius29er/youtubeExtractor.git
cd youtubeExtractor

# Backend setup
pip install -r requirements-prediction.txt
python src/prediction_api.py

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# Access at:
# API: http://localhost:8002
# Frontend: http://localhost:3000
```

### 3. Docker Deployment
```bash
# Build and run prediction service
docker build -f Dockerfile.prediction -t youtube-predictor .
docker run -p 8002:8002 youtube-predictor
```

---

## 📈 Model Performance

### Prediction Accuracy
- **CTR Model**: R² = 0.67, MAE = 0.12
- **RQS Model**: R² = 0.58, MAE = 89 points
- **Views Model**: R² = 0.72, MAE = 8,901 views

### Feature Importance
1. **Text Embeddings** (40%): Title, description, tags
2. **Thumbnail Features** (25%): Face detection, colors, brightness
3. **Channel Metrics** (20%): Subscriber count, genre
4. **Video Properties** (15%): Duration, upload timing

### Confidence Levels
- **High**: All features available, thumbnail uploaded
- **Medium**: Missing thumbnail or limited text
- **Low**: Minimal feature set or edge cases

---

## 🎨 API Documentation

### Prediction Endpoint
```http
POST /api/predict
Content-Type: multipart/form-data

title: string (required)
genre: string (required) 
subscriber_count: integer (required)
duration_seconds: integer (optional, default: 480)
thumbnail: file (optional)
```

### Response Format
```json
{
  "predicted_views": 2100,
  "predicted_rqs": 41.31,
  "predicted_ctr_percentage": 20.59,
  "performance_score": 85.2,
  "thumbnail_analysis": {
    "brightness": 180.8,
    "has_faces": false,
    "face_percentage": 0.0
  },
  "input_data": {
    "recommended_tags": ["challenge", "stunts", "extreme"],
    "duration_minutes": 8.0
  },
  "confidence_score": 0.85,
  "model_version": "3.1"
}
```

---

## 🔬 Research Applications

### Academic Use Cases
- **Creator Economy Research**: Understanding success factors
- **ML Model Comparison**: Benchmark against your models  
- **Computer Vision**: Thumbnail impact analysis
- **NLP Applications**: Text embedding effectiveness

### Business Applications
- **Creator Tools**: Integrate predictions into existing platforms
- **Content Strategy**: Data-driven video planning
- **Marketing Analytics**: Campaign performance forecasting
- **A/B Testing**: Compare different video concepts

---

## 🚧 Future Roadmap

### Short Term (Q4 2025)
- [ ] **User Accounts**: Save prediction history
- [ ] **Batch Processing**: Multiple video analysis
- [ ] **Model Metrics**: Display accuracy statistics
- [ ] **Export Features**: CSV/JSON download

### Medium Term (2026)
- [ ] **Real-Time Training**: User feedback improves models
- [ ] **Competitor Analysis**: Compare against similar channels
- [ ] **Trend Detection**: Identify emerging content patterns
- [ ] **API Rate Limiting**: Production-ready scaling

### Long Term (Future)
- [ ] **YouTube Studio Integration**: Official plugin
- [ ] **Multi-Platform Support**: TikTok, Instagram predictions
- [ ] **Advanced CV**: Thumbnail generation suggestions
- [ ] **Monetization**: Premium features and API access

---

## 🤝 Contributing

### Development Setup
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Areas for Contribution
- **Model Improvements**: Better algorithms, feature engineering
- **UI/UX Enhancements**: Design improvements, new components
- **Documentation**: Tutorials, API docs, examples
- **Testing**: Unit tests, integration tests, performance tests

---

## 📊 Model Training Data

If you're interested in the training process:

```bash
# Training data available in extracted_data/
api_only_ml_dataset.csv      # 1,000+ videos with features
youtube_channel_data.json    # Raw channel metrics
thumbnails/                  # Image training data
comments_raw/               # Sentiment analysis data
```

### Data Collection Methodology
- **Intelligent Sampling**: Top 10, bottom 10, random 20 per creator
- **Multi-Genre Coverage**: 5 distinct content categories  
- **Quality Filtering**: >3 minutes, English content
- **Ethical Sourcing**: Public data only, API compliant

---

## 📄 License

**MIT License** - Use this project for commercial and non-commercial purposes.

```
Copyright (c) 2025 Jeremy Foxx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙌 Acknowledgments

### Inspiration
- **MrBeast**: Data-driven content creation philosophy
- **Creator Economy**: The need for better prediction tools
- **Open Source ML**: Standing on the shoulders of giants

### Technology Credits
- **scikit-learn**: Machine learning framework
- **OpenCV**: Computer vision capabilities  
- **FastAPI**: High-performance web framework
- **React**: Modern UI development
- **Railway**: Seamless deployment platform

---

## 🎯 Author

**Jeremy Foxx**  
*Creator • Engineer • Catholic*

- 🌐 **Live Demo**: [YouTube Performance Predictor](https://virtuous-insight-production-cc49.up.railway.app/)
- 📧 **Contact**: [Your Email]
- 💼 **LinkedIn**: [Your Profile]
- 🐦 **Twitter**: [Your Handle]

---

⭐ **Star this repository** if you believe creators deserve AI-powered tools instead of guesswork!

*Built with ❤️ for the creator economy*