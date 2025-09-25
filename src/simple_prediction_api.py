#!/usr/bin/env python3
"""
Simple prediction API without complex ML models
Provides basic YouTube performance predictions using heuristics
"""

import json
import re
from typing import Dict, Optional
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="YouTube Prediction API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimplePredictionSystem:
    """Simple prediction system using heuristics"""
    
    def extract_title_features(self, title: str) -> Dict:
        """Extract basic features from title"""
        features = {
            'char_count': len(title),
            'word_count': len(title.split()),
            'has_question': '?' in title,
            'has_exclamation': '!' in title,
            'has_numbers': bool(re.search(r'\d', title)),
            'has_caps': bool(re.search(r'[A-Z]{2,}', title)),
            'engagement_score': 0
        }
        
        # Calculate engagement score
        engagement_words = ['how', 'why', 'what', 'amazing', 'incredible', 'shocking', 'must', 'watch']
        engagement_count = sum(1 for word in engagement_words if word.lower() in title.lower())
        features['engagement_score'] = min(engagement_count / len(engagement_words), 1.0)
        
        return features
    
    def predict_performance(self, title: str, genre: str, subscriber_count: int) -> Dict:
        """Predict video performance using heuristics"""
        
        title_features = self.extract_title_features(title)
        
        # Base predictions on subscriber count and title quality
        base_views = max(int(subscriber_count * 0.05), 100)
        engagement_multiplier = 1 + (title_features['engagement_score'] * 0.5)
        predicted_views = int(base_views * engagement_multiplier)
        
        # RQS based on multiple factors
        title_score = min(title_features['engagement_score'] * 30, 30)
        subscriber_score = min((subscriber_count / 100000) * 20, 40)  # Up to 40 points for 100k+ subs
        base_rqs = 30 + title_score + subscriber_score
        predicted_rqs = round(min(max(base_rqs, 10), 95), 2)
        
        # CTR prediction (if supported)
        predicted_ctr = None
        ctr_note = None
        
        if genre != 'kids_family':
            base_ctr = 2.5  # Average YouTube CTR
            engagement_bonus = title_features['engagement_score'] * 1.0
            predicted_ctr = round(max(min(base_ctr + engagement_bonus, 8.0), 0.5), 2)
        else:
            ctr_note = "CTR prediction not available for kids/family content"
        
        # Generate recommended tags
        recommended_tags = self.generate_tags(title, genre)
        
        return {
            'predicted_views': predicted_views,
            'predicted_rqs': predicted_rqs,
            'predicted_ctr': predicted_ctr,
            'ctr_note': ctr_note,
            'recommended_tags': recommended_tags,
            'confidence': {
                'views': 'Medium' if subscriber_count > 10000 else 'Low',
                'rqs': 'Medium',
                'ctr': 'Medium' if predicted_ctr else 'N/A'
            }
        }
    
    def generate_tags(self, title: str, genre: str) -> list:
        """Generate recommended tags"""
        
        # Extract potential tags from title
        title_words = [word.lower().strip('.,!?') for word in title.split() if len(word) > 3]
        
        # Genre-specific base tags
        genre_tags = {
            'gaming': ['gaming', 'gameplay', 'review', 'tips', 'strategy'],
            'education_science': ['education', 'learning', 'tutorial', 'science', 'knowledge'],
            'challenge_stunts': ['challenge', 'stunt', 'extreme', 'fun', 'entertainment'],
            'catholic': ['faith', 'spiritual', 'catholic', 'religious', 'inspiration'],
            'kids_family': ['kids', 'family', 'children', 'fun', 'educational'],
            'other': ['entertainment', 'video', 'content', 'watch', 'youtube']
        }
        
        base_tags = genre_tags.get(genre, genre_tags['other'])
        
        # Combine and limit
        all_tags = base_tags + title_words[:3]
        return list(set(all_tags))[:8]  # Max 8 unique tags

# Initialize prediction system
predictor = SimplePredictionSystem()

@app.get("/")
async def root():
    return {"message": "YouTube Prediction API", "status": "active", "version": "1.0.0"}

@app.post("/predict")
async def predict_performance(
    title: str,
    genre: str,
    subscriber_count: int,
    thumbnail: Optional[UploadFile] = None
):
    """Predict video performance"""
    
    try:
        # Validate inputs
        if not title or len(title.strip()) == 0:
            raise HTTPException(status_code=400, detail="Title is required")
        
        if subscriber_count < 0:
            raise HTTPException(status_code=400, detail="Subscriber count must be positive")
        
        valid_genres = ['gaming', 'education_science', 'challenge_stunts', 'catholic', 'kids_family', 'other']
        if genre not in valid_genres:
            raise HTTPException(status_code=400, detail=f"Invalid genre. Must be one of: {valid_genres}")
        
        # Make prediction
        predictions = predictor.predict_performance(title, genre, subscriber_count)
        
        return {
            "status": "success",
            "predictions": predictions,
            "input": {
                "title": title,
                "genre": genre,
                "subscriber_count": subscriber_count,
                "has_thumbnail": thumbnail is not None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2024-01-15T22:30:00Z"}

if __name__ == "__main__":
    print("🚀 Starting Simple Prediction API...")
    print("📊 API will be available at: http://localhost:8002")
    print("🔧 API docs at: http://localhost:8002/docs")
    
    uvicorn.run(
        "simple_prediction_api:app",
        host="0.0.0.0",
        port=8002,
        reload=True
    )