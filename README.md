# 📺 YouTube Extractor — ML-Ready Insights for Creators

Welcome to `youtubeExtractor`, the ultimate open-source system for extracting **machine learning-ready datasets** from 1,000+ public YouTube videos. Designed for creators, researchers, and data scientists, this tool helps uncover **what makes YouTube videos successful**—using real data, not guesswork.

🔥 **Powered by Python, the YouTube Data API, and your brain.**

---

## 🚀 Project Purpose

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
