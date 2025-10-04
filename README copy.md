# 📺 YouTube Extractor — ML-Ready Insights for Creators

Welcome to `youtubeExtractor`, the ultimate open-source system for extracting **machine learning-ready datasets** from 1,000+ public YouTube videos. Designed for creators, researchers, and data scientists, this tool helps uncover **what makes YouTube videos successful**—using real data, not guesswork.

🔥 **Powered by Python, the YouTube Data API, and your brain.**

---

## � Project Structure

```
📦 YouTube Extractor
├── 📄 corrected_data_extractor.py    # Main data extraction script
├── 📄 api_server.py                 # FastAPI backend server
├── 📄 requirements.txt               # Python dependencies
├── 📄 .env                          # API keys (not in git)
├── 📁 extracted_data/               # Raw extracted data
│   ├── api_only_complete_data.json  # Complete dataset (560 videos)
│   ├── api_only_ml_dataset.csv      # ML-ready CSV format
│   ├── thumbnails/                  # Downloaded thumbnails
│   └── comments_raw/                # Raw comment data
├── 📁 frontend/                     # Interactive React Dashboard
│   ├── 📄 package.json              # Node.js dependencies
│   ├── 📁 src/                      # React components
│   │   ├── App.jsx                  # Main app component
│   │   ├── Dashboard.jsx            # Metrics overview
│   │   ├── DataVisualization.jsx    # Interactive charts
│   │   └── ExtractionStatus.jsx     # Real-time monitoring
│   └── 📁 public/                   # Static assets
├── 📄 setup_dashboard.bat/.sh       # Quick setup scripts
├── 📁 scripts/                      # Organized utility scripts
│   ├── analysis/                    # Data analysis & ML tools
│   ├── cleanup/                     # Data cleaning utilities  
│   ├── verification/                # Data validation tools
│   └── utilities/                   # General helper scripts
├── 📁 docs/                         # Documentation
├── 📁 colab/                        # Jupyter/Colab notebooks
└── 📁 archive/                      # Development history
```

## �🚀 Project Purpose

> “Why do some creators go viral while others fade?”  
> This project analyzes the top 25 YouTube creators across 5 major genres to find out.

Using intelligent sampling, structured metadata extraction, and optional sentiment/thumbnail/transcript analysis, we build a clean, exportable dataset for downstream machine learning tasks like:
- 📊 Retention modeling
- 🎯 Thumbnail impact on CTR
- 🧠 Hook/pacing analysis
- 🗣️ Comment sentiment scoring
- 🤖 K-Means clustering & PCA visualization

---

## 🎯 Genres + Creators Covered

This extractor targets **25 creators across 5 genres** (large to small):

- **Challenge/Stunts**: MrBeast, Zach King, Ryan Trahan, etc.
- **Catholic**: Ascension Presents, Bishop Barron, etc.
- **Education/Science**: Kurzgesagt, Veritasium, SciShow, etc.
- **Gaming**: Jacksepticeye, Call Me Kevin, RTGame, etc.
- **Kids/Family**: Cocomelon, Diana and Roma, Vlad and Niki, etc.

Each creator has:
- Top 10 videos by views
- Bottom 10 videos by views
- 20 random mid-tier videos  
> 💡 Total = 1,000 intelligently sampled videos

---

## 🧠 What This Extracts

✅ Complete metadata: `views`, `likes`, `comments`, `duration`, `tags`, etc.  
✅ Channel-level info: `subscribers`, `description`, `upload count`  
✅ Comment sampling (up to 100 per video)  
✅ Caption availability (manual/auto/English flags)  
✅ Local thumbnail download  
✅ ML-ready CSV dataset  
✅ RQS metrics (Retention Quality Score components)

---

## ❌ What This Doesn’t Extract (Yet)

🚫 Transcripts (due to API restrictions — consider `yt-dlp`)  
🚫 First 30 seconds of audio/video (manual or Whisper suggested)  
🚫 Shorts are mostly filtered by duration (>3 minutes recommended)

---

## 🛠️ Installation & Setup

### 1. Quick Installation
```bash
git clone https://github.com/mobius29er/youtubeExtractor.git
cd youtubeExtractor
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create a `.env` file:
```bash
YOUTUBE_API_KEY=your-api-key-here
```

### 2. Local Development

#### Prerequisites
- **Python 3.11+** (recommended - avoid 3.13+ due to compatibility issues)
- **Node.js 18+** and npm
- **YouTube Data API v3 Key** (get from [Google Cloud Console](https://console.cloud.google.com/))

#### Complete Setup

```bash
# 1. Clone repository
git clone https://github.com/mobius29er/youtubeExtractor.git
cd youtubeExtractor

# 2. Backend setup
# Create virtual environment (recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# 3. Environment configuration
# Copy and configure environment files
cp .env.prediction .env
# Edit .env and add your YouTube API key:
# YOUTUBE_API_KEY=your_api_key_here
# PORT=8000
# CORS_ORIGINS=http://localhost:3000

# 4. Data setup (optional - for full functionality)
# If you have extracted data, place it in extracted_data/
# Or run data extraction first:
# python src/corrected_data_extractor.py

# 5. Start backend API server
python src/api_server.py
# Alternative for ML predictions:
# python src/prediction_api.py

# 6. Frontend setup (new terminal)
cd frontend
npm install

# Create local environment file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# Start frontend development server
npm run dev

# 7. Access your application:
# Main API: http://localhost:8000
# ML Prediction API: http://localhost:8002  
# Frontend Dashboard: http://localhost:3000
```

#### Troubleshooting
- **Port conflicts**: Change ports in `.env` files if needed
- **CORS issues**: Ensure backend CORS_ORIGINS includes `http://localhost:3000`
- **Missing data**: Run data extraction or use sample data from `extracted_data/`
- **API key**: Verify YouTube Data API v3 is enabled in Google Cloud Console

### 3. Basic Usage
### 3. Basic Usage

▶️ **Run Data Extraction**
```bash
python corrected_data_extractor.py
```
The extractor will:
- Smart-sample 40 videos per creator
- Save data to extracted_data/
- Track progress in progress_tracker.json so you can resume later

🧪 ML-Ready Output
Exports:
- api_only_ml_dataset.csv: Flat data for clustering, regression, PCA, etc.
- comments_raw/*.json: All extracted comments per creator
- metadata_only.json: Clean metadata for custom analysis
- caption_availability_report.json: For planning transcript scraping
- thumbnails/: Local copies for image feature analysis


🧠 Bonus Ideas
Want to go further?

- Use OpenAI Whisper or Gemini API for hook detection
- Analyze thumbnails with CLIP/Vision Transformers
- Cluster video types using K-Means or t-SNE
- Normalize engagement using views/subscribers and like/comment ratios

## 🎨 Interactive Dashboard

Experience your YouTube data through a modern, responsive web dashboard:

### Features
- 📊 **Real-time Metrics**: Live overview of extraction progress and data statistics
- 📈 **Interactive Charts**: Visualize views, engagement, and performance data with dynamic charts
- 🎯 **Channel Analytics**: Track individual channel performance and video metrics
- 🌙 **Dark/Light Theme**: Customizable interface that adapts to your preference
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Quick Start
```bash
# Windows
setup_dashboard.bat

# Linux/Mac
./setup_dashboard.sh
```

The dashboard will be available at:
- Frontend: http://localhost:3000
- API Server: http://localhost:8000

### Technology Stack
- **Frontend**: React 18 + Vite, Tailwind CSS, Recharts
- **Backend**: FastAPI with Python
- **Features**: Interactive charts, real-time updates, responsive design

💡 Inspiration
Inspired by:

- MrBeast’s creator interviews
- ML interpretability studies
- YouTube SEO data science
- The belief that data + art = audience magic

📜 License
MIT — Go build cool stuff. Tag me if you build something awesome.

🙌 Author

Built by Jeremy Foxx

Creator. Engineer. Catholic.

⭐ Star this repo if you believe creators deserve better tools than gut feelings.
