# 📺 YouTube Extractor — ML-Ready Dataset from 1,000 Creator Videos

Welcome to `youtubeExtractor`, a comprehensive system for extracting **machine learning-ready datasets** from YouTube. Successfully extracted **1,000 videos from 25 top creators** across 8 genres, this tool provides real data insights for creators, researchers, and data scientists.

🔥 **Powered by Python, YouTube Data API v3, and intelligent video selection algorithms.**

---

## 📊 **Current Dataset Status**

✅ **COMPLETE**: 1,000 videos successfully extracted  
✅ **25 channels** × **40 videos each** = perfect dataset balance  
✅ **8 genres** represented with top creators in each category  
✅ **Intelligent sampling**: Top 10 + Bottom 10 + 20 random middle videos per channel  
✅ **All data cleaned and organized** with archived partial extractions

### **Final Dataset Composition:**
- **Challenge/Stunts**: MrBeast, Zach King, Ryan Trahan, Hangtime, Ed Pratt
- **Catholic**: Ascension Presents, Bishop Robert Barron, The Catholic Talk Show, The Father Leo Show  
- **Education/Science**: Kurzgesagt, Veritasium, SciShow, Fun Science, Up and Atom
- **Gaming**: PewdiePie, Jacksepticeye, Call Me Kevin, Lizz
- **Kids/Family**: Cocomelon, Kids Roma Show, Sheriff Labrador, VeggieTales Official, Miss Honey Bear

---

## 🏗️ **Project Structure**

```
📦 YouTube Extractor
├── � src/                          # Core application code
│   ├── corrected_data_extractor.py  # Main extraction engine
│   ├── api_server.py                # FastAPI backend server
│   └── dataset_analyzer.py          # Analysis utilities
├── 📁 extracted_data/               # Complete dataset output
│   ├── api_only_complete_data.json  # Full dataset (1,000 videos)
│   ├── api_only_ml_dataset.csv      # ML-ready CSV format  
│   ├── metadata_only.json           # Clean metadata subset
│   ├── caption_availability_report.json # Caption analysis
│   ├── thumbnails/                  # Downloaded thumbnails (25 channels)
│   ├── thumbnails_archive/          # Extra thumbnails from previous runs
│   ├── partial_channels_archive/    # Archived incomplete channels
│   └── comments_raw/                # Raw comment data by channel
├── 📁 scripts/                      # Organized utilities
│   ├── analysis/                    # Data analysis & ML exploration
│   ├── cleanup/                     # Data cleaning & organization tools
│   ├── verification/                # Dataset validation utilities
│   └── utilities/                   # General helper scripts
├── 📁 frontend/                     # Interactive React dashboard
│   ├── package.json                 # Node.js dependencies
│   └── src/                         # React components & visualizations
├── 📁 config/                       # Configuration files
│   └── channel_lists/               # Channel definitions by genre
├── 📁 docs/                         # Comprehensive documentation
├── 📁 notebooks/                    # Jupyter analysis notebooks
└── � requirements.txt              # Python dependencies
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

## 🛠️ Installation

```
git clone https://github.com/mobius29er/youtubeExtractor.git
cd youtubeExtractor
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```
Create a .env file:
```
YOUTUBE_API_KEY=your-api-key-here
```
▶️ Run
```
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
