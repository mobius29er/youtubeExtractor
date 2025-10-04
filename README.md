# 🎯 YouTube Performance Predictor — AI-Powered Creator Analytics

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-brightgreen)](https://youtubeextractor-production.up.railway.app/)
[![ML Models](https://img.shields.io/badge/ML%20Models-24%20Trained-blue)](#ml-architecture)
[![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%2B%20React%20%2B%20Docker-orange)](#technology-stack)

> **Predict YouTube video performance before you publish.** Get AI-powered insights on CTR, retention scores, and view predictions using advanced machine learning and computer vision.

**🚀 [Try the Live Demo](https://youtubeextractor-production.up.railway.app/)**

---

# YouTube Performance Prediction Using Pre-Publication Features

## Problem Statement

The goal of this project was to determine whether the success of a YouTube video can be predicted using only its pre-publication features. Specifically, the research asks:

**Can the success of a YouTube video, measured by normalized viewership and a custom-developed Retention Quality Score (RQS), be predicted and replicated by analyzing patterns in its metadata, thumbnail, and text-based content?**
> “Why do some creators go viral while others fade?”  
> This project analyzes the top 25 YouTube creators across 5 major genres to find out.

Using intelligent sampling, structured metadata extraction, and optional sentiment/thumbnail/transcript analysis, we build a clean, exportable dataset for downstream machine learning tasks like:
- 📊 Retention modeling
- 🎯 Thumbnail impact on CTR
- 🧠 Hook/pacing analysis
- 🗣️ Comment sentiment scoring
- 🤖 K-Means clustering & PCA visualization


The motivation behind this study is the inconsistency and unpredictability of success on YouTube. Many creators invest substantial time, creativity, and resources into videos that fail to perform, while others achieve viral reach. This research seeks to identify and quantify the underlying structural and visual factors that contribute to a video’s success, allowing creators to make data-informed decisions before uploading content.

The potential benefit is a predictive framework that enables video creators to optimize their titles, thumbnails, and tags for engagement and retention, rather than relying on guesswork or anecdotal strategies.

**📓 [Open Main Jupyter Notebook](https://github.com/mobius29er/youtubeExtractor/blob/main/notebooks/YoutubeExtractorAnalysis.ipynb)**

---

## Model Outcomes or Predictions

The project focused on **regression-based supervised learning** to predict quantitative performance metrics rather than categorical labels. Three core predictive models were developed:

1. **Retention Quality Score (RQS) Model** – Predicts the strength of audience retention based on sentiment, metadata, and textual embeddings.  
2. **Views Model** – Predicts total view counts, using a two-stage residual fitting method that first explains core variance through physics-like features and then models residual variance through non-linear relationships.  
3. **CTR (Click-Through Rate) Model** – Estimates the likelihood of viewer engagement at the impression level, informed by metadata and embedding signals.

These models together create a holistic framework capable of forecasting both engagement (CTR) and sustained attention (RQS), which in turn drive total views.

---

## Data Acquisition

The dataset consisted of approximately **1,000 YouTube videos** drawn from **25 creators across five genres** from New channels to "Mega" channels:

- **Challenge/Stunts**: MrBeast, Zach King, Ryan Trahan, etc.
- **Catholic**: Ascension Presents, Bishop Barron, etc.
- **Education/Science**: Kurzgesagt, Veritasium, SciShow, etc.
- **Gaming**: Jacksepticeye, Call Me Kevin, RTGame, etc.
- **Kids/Family**: Cocomelon, Diana and Roma, Vlad and Niki, etc.

- **Mega**: >50 million subs
- **Large**: >10 million subs
- **Mid**: >1 million subs
- **Small**: >100,000 subs
- **New**: <100,000 subs

Each creator contributed **40 videos**:

- 10 top-performing by view count  
- 10 low-performing  
- 20 randomly sampled  

All data were sourced from **public YouTube pages**, including:

- **Video metadata:** title, tags, description, views, likes, comments, duration, and publish date  
- **Channel data:** subscriber count (for normalization)  
- **Thumbnails:** processed for color, facial detection, and textual overlays  
- **Textual content:** extracted embeddings from titles, descriptions, captions, and tags (when available)  

This structure ensured a balanced, genre-diverse dataset capable of modeling both high- and low-performance dynamics while mitigating outlier bias.

---

## Data Preprocessing and Preparation

Data preparation included several key stages to ensure clean and usable inputs for modeling:

- **Cleaning and Normalization:** Removed missing or corrupted records, standardized numerical metrics, and normalized by subscriber count to reduce channel-size bias.  
- **Feature Engineering:** Constructed a comprehensive feature matrix including:  
  - **RQS components** (like ratio, comment ratio, sentiment score, comment depth, and timestamp density)  
  - **Visual features** (average RGB values, dominant color clusters, face detection area, and brightness)  
  - **Text embeddings** from titles, descriptions, captions, and tags  
- **Splitting:** The data were divided into training and testing sets using stratified sampling to preserve performance category representation.  
- **Encoding:** All categorical and text-based features were embedded using high-dimensional numerical representations to capture semantic relationships.  

This preparation yielded over **160 total features**, forming a multi-modal dataset that integrates language, image, and engagement metrics.

---

## Modeling

### Unsupervised Learning

- **Principal Component Analysis (PCA):** PCA was applied to reduce feature dimensionality and reveal the dominant sources of variance within the dataset. This allowed the most meaningful numerical and textual signals to emerge without noise inflation.  
- **K-Means Clustering:** K-Means grouped the dataset into **five distinct clusters**, each representing a unique content archetype based on metadata, thumbnail composition, and engagement ratios. Cluster interpretation provided qualitative insight into how certain feature combinations correspond to higher viewer interest or specific genre styles.

### Supervised Learning

#### 1. Raw Views Prediction
- Predicting raw view counts was initially difficult due to the heavy-tailed nature of YouTube data. Early models performed worse than a simple mean predictor, resulting in negative R² values.  
- Applying a **logarithmic transformation** to the target variable stabilized the variance and significantly improved performance, with **Gradient Boosting** and **Random Forest** achieving R² values between **0.94 and 0.97** after inverse transformation.  
- The **Random Forest model on log-transformed views** proved most reliable, balancing complexity and generalization while capturing the nonlinear patterns of audience scale and exposure.

#### 2. Views per Subscriber Prediction
- Predicting normalized success (views per subscriber) achieved consistent results, with both Gradient Boosting and Random Forest models reaching **R² values around 0.83 to 0.85**.  
- This model focused on engagement-driven metrics rather than raw exposure, identifying how viewer loyalty, content tone, and thumbnail quality predict proportional success.

#### 3. Retention Quality Score (RQS) Model
- The RQS model achieved a strong and valid **R² of 0.7859**, making it the foundation of this system.  
- RQS was designed to **mirror the internal logic of the YouTube recommendation algorithm**, which prioritizes videos that sustain viewer attention and evoke strong emotional engagement.  
- The model replicates this mechanism by integrating **five weighted components**:

  1. **Like Ratio (30%)** – Measures satisfaction and perceived content quality.  
  2. **Comment Ratio (20%)** – Reflects active viewer engagement and emotional response.  
  3. **Views per Subscriber (25%)** – Normalizes reach relative to audience size.  
  4. **Sentiment Score (15%)** – Captures the emotional polarity of comments, serving as a proxy for audience resonance.  
  5. **Comment Depth and Timestamp Density (10%)** – Estimates retention through the presence of detailed or time-stamped feedback.  

- Together, these components emulate how YouTube’s algorithm balances click performance, retention, and satisfaction signals when recommending content.  
- Feature importance analysis confirmed that **sentiment_score** is the dominant variable, followed by textual embeddings from the description and captions. This indicates that emotional tone and linguistic clarity drive sustained watch behavior, much like how YouTube’s engagement-weighted ranking system prioritizes emotionally compelling and clear communication.

#### 4. CTR (Click-Through Rate) Model
- The CTR model achieved **R² = 0.4742**, reflecting moderate but actionable predictive power.  
- The strongest predictor was the **predicted RQS**, implying that users are more likely to click on content they subconsciously associate with high retention quality.  
- Embeddings from titles, tags, and thumbnail text further refined the model, capturing the importance of linguistic framing and presentation in generating clicks.

---

## Model Evaluation

Evaluation relied primarily on **R²**, **MAE**, and **RMSE** metrics to quantify accuracy and generalization.

| Model | Final R² | Core Predictors | Interpretation |
|-------|-----------|----------------|----------------|
| **RQS Model** | 0.7859 | sentiment_score, description/caption embeddings | Emotional tone predicts retention strength |
| **Views Model** | 0.6974 | ctr_subs_interaction, rqs_pred, log_subs | Engagement and audience size synergy drives views |
| **CTR Model** | 0.4742 | rqs_pred, tag/title embeddings | Retention and textual clarity influence click rate |
| **Log Views (Raw)** | 0.94–0.97 | subscriber normalization, engagement ratios | Log transformation enables stable high accuracy |
| **Views per Subscriber** | 0.83–0.85 | engagement ratios, performance category, thumbnail colors | Normalized success captured effectively |

### Key Findings

- The **logarithmic transformation** was critical for modeling raw views due to the heavy-tailed distribution of the data.  
- **Engagement metrics** (like_ratio, comment_ratio, sentiment_score) and **metadata embeddings** consistently ranked among the most important predictors.  
- **Thumbnail color composition** correlated with performance, suggesting visual tonality may play a subconscious role in attracting viewers.  
- **High RQS videos** tended to share “success signatures” of emotional positivity, strong early engagement, and well-composed thumbnails.

---

## Conclusions and Future Work

This research successfully demonstrated that YouTube video success can be predicted using pre-publication features alone. The combination of textual, visual, and engagement-based signals produces a coherent framework capable of forecasting retention, engagement, and viewership before a video is released.

The **RQS model** not only serves as the most generalizable predictor of performance but also **reconstructs the fundamental logic of YouTube’s recommendation system**. Just as YouTube optimizes for viewer satisfaction and sustained attention, the RQS model captures the same dynamics through sentiment, engagement ratios, and audience normalization. In this sense, the model acts as a transparent external approximation of how the platform’s opaque ranking algorithm likely prioritizes content.

The **log-views model** offers precision forecasting for reach, while the **CTR model** contextualizes pre-click interest with post-click retention. Together, they form a scalable framework that can forecast outcomes and guide optimization before a video ever goes live.

### Future Development Priorities

1. Incorporating full video transcripts and hook analysis to better quantify narrative quality.  
2. Refining the RQS formula using additional sentiment layers and long-tail engagement metrics.   

Ultimately, this project lays the groundwork for a **predictive YouTube optimization platform** that transforms the art of content creation into a measurable, data-informed science, while offering a rare external mirror to the platform’s own engagement logic.

---

## Application Implementation and Visualization Layer

Following model development, the complete web application titled **YouTube Extractor** was built to operationalize the findings. The app provides a **production-grade dashboard and ML interface** that allows creators, researchers, and analysts to interact with the trained models and visualize performance data.

### Platform Overview

The system is hosted at [youtubeextractor-production.up.railway.app](https://youtubeextractor-production.up.railway.app) and integrates all core modules:

- **Dashboard:** Overview of extracted data (1,000 videos across 25 channels) with real-time health scoring and data verification metrics.  
- **Data Visualization:** Interactive insights across genre, engagement tier, sentiment, correlation, and thumbnail color analytics.  
- **AI Predictor:** User-facing form that allows prediction of view counts, RQS, and engagement by inputting title, genre, subscriber count, duration, and optional thumbnail upload.  
- **Status Module:** Real-time monitoring of system uptime, channel extraction completion, and dataset integrity.

### Key Visualization Modules

#### 1. Genre and Tier Analysis
- Displays comparative engagement and RQS metrics across genres such as Kids/Family, Gaming, Challenge/Stunts, Education, and Catholic content.  
- Channel tier segmentation (Mega, Large, Mid, Small, New) reveals how scale interacts with engagement efficiency.

#### 2. Sentiment Analysis Dashboard
- Visualizes positive, neutral, and negative comment distributions and generates corresponding word clouds.  
- Demonstrates that positive sentiment words (“Jesus,” “Catholic,” “bless,” “pray”) correlate strongly with higher RQS outcomes.

#### 3. Thumbnail Analysis Suite
- Extracts and ranks dominant thumbnail colors, face detection percentages, and composition ratios.  
- Identifies high-performing color combinations such as **Black + White + Red-Orange**, which achieved top RQS values (~22.0).  
- Face detection analysis revealed that thumbnails with **0% face presence** performed best for large-scale Kids and Family content, highlighting genre-dependent optimization.

#### 4. Title Analysis Engine
- Evaluates over 1,000 titles, identifying optimal structures and lengths.  
- The highest RQS performance occurred for **titles between 40–49 characters** and “How to {skill}” structures, with “Catholic” emerging as the single most performance-boosting word (+40%).  
- Word cloud and leaderboard features quantify which linguistic features statistically improve retention and engagement.

#### 5. Correlation and Engagement Tools
- The correlation matrix plots relationships between engagement ratios (like_ratio, comment_ratio), RQS, and views per subscriber.  
- Provides actionable insights into which metrics most strongly predict success, validated visually through scatter and bar plots.

### Operational Impact

This application moves the research beyond theory. It **translates the model suite into a dynamic visual intelligence platform** capable of:

- Running **live predictions** through trained ML models.  
- Generating **AI-driven insights** on thumbnails, titles, and engagement factors.  
- Offering creators a **replicable success framework** by identifying high-performing “signatures” across visual and textual elements.

The **YouTube Extractor** thus serves as both a **machine learning research artifact** and a **working prototype for an AI-powered creator analytics platform**, bridging the gap between academic modeling and practical industry application.

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

### Try the Live Demo
Visit **[YouTube Performance Predictor](https://youtubeextractor-production.up.railway.app/)** to test immediately.

## 🛠️ Installation & Setup

### 1. Quick Installation
```
git clone https://github.com/mobius29er/youtubeExtractor.git
cd youtubeExtractor
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create a `.env` file:
```
YOUTUBE_API_KEY=your-api-key-here
```

### 2. Local Development

#### Prerequisites
- **Python 3.11+** (recommended - avoid 3.13+ due to compatibility issues)
- **Node.js 18+** and npm
- **YouTube Data API v3 Key** (get from [Google Cloud Console](https://console.cloud.google.com/))

#### Complete Setup
##### 1. Clone repository
```
git clone https://github.com/mobius29er/youtubeExtractor.git
cd youtubeExtractor
```
##### 2. Backend setup
##### Create virtual environment (recommended)
```
python -m venv venv
```
##### Windows:
```
venv\Scripts\activate
```
##### macOS/Linux:
```
source venv/bin/activate
```

##### Install dependencies
```
pip install -r requirements.txt
```
##### 3. Environment configuration
##### Copy and configure environment files
```
cp .env.prediction .env
```
##### Edit .env and add your YouTube API key:
```
YOUTUBE_API_KEY=your_api_key_here
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

##### 4. Data setup (optional - for full functionality)
##### If you have extracted data, place it in extracted_data/
##### Or run data extraction first:
```
python src/corrected_data_extractor.py
```
##### 5. Start backend API server
```
python src/api_server.py
```
##### Alternative for ML predictions:
```
python src/prediction_api.py
```
##### 6. Frontend setup (new terminal)
```
cd frontend
npm install
```

##### Create local environment file
```
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```
##### Start frontend development server
```
npm run dev
```
##### 7. Access your application:
##### Main API: http://localhost:8000
##### ML Prediction API: http://localhost:8002  
##### Frontend Dashboard: http://localhost:3000


#### Troubleshooting
- **Port conflicts**: Change ports in `.env` files if needed
- **CORS issues**: Ensure backend CORS_ORIGINS includes `http://localhost:3000`
- **Missing data**: Run data extraction or use sample data from `extracted_data/`
- **API key**: Verify YouTube Data API v3 is enabled in Google Cloud Console

### 3. Docker Deployment
# Build and run prediction service
```
docker build -f Dockerfile.prediction -t youtube-predictor .
docker run -p 8002:8002 youtube-predictor
```

---

## 📈 Model Performance

### Prediction Accuracy
- **CTR Model**: R² = 0.4742
- **RQS Model**: R² = 0.7859
- **Views Model**: R² = 0.6974

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
- [ ] **Monetization**: Premium features and API access

### Medium Term (2026)
- [ ] **Real-Time Training**: User feedback improves models
- [ ] **Competitor Analysis**: Compare against similar channels
- [ ] **Trend Detection**: Identify emerging content patterns
- [ ] **API Rate Limiting**: Production-ready scaling

### Long Term (Future)
- [ ] **YouTube Studio Integration**: Official plugin
- [ ] **Multi-Platform Support**: TikTok, Instagram predictions
- [ ] **Advanced CV**: Thumbnail generation suggestions

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

```
Copyright (c) 2025 Jeremy Foxx

```

---

## 🙌 Acknowledgments

### Inspiration
- **MrBeast**: Data-driven content creation philosophy
- **Creator Economy**: The need for better prediction tools
- **Open Source ML**: Providing all the frameworks to help me complete this project

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

- 🌐 **Live Demo**: [YouTube Performance Predictor](https://youtubeextractor-production.up.railway.app/)
- 📧 **Contact**: jeremy@foxxception.com
- 💼 **LinkedIn**: https://www.linkedin.com/in/jeremyfoxx/
- 🐦 **Twitter**: https://x.com/jeremydfoxx

---

⭐ **Star this repository** if you believe creators deserve AI-powered tools!

*Built for the creator economy*
