#!/usr/bin/env python3
"""
YouTube Video Performance Prediction API - Optimized Version
Addresses performance issues and improves prediction accuracy
"""

import os
import sys
import json
import warnings
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Union, Tuple
from datetime import datetime
import ast
from io import BytesIO
from PIL import Image
import cv2

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Suppress warnings
warnings.filterwarnings('ignore')


class ThumbnailProcessor:
    """Optimized thumbnail processor with pre-loaded models"""
    
    def __init__(self):
        """Initialize with pre-loaded face cascade"""
        try:
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            if self.face_cascade.empty():
                print("Warning: Face cascade not loaded properly")
                self.face_cascade = None
        except Exception as e:
            print(f"Warning: Could not load face cascade: {e}")
            self.face_cascade = None
    
    def extract_features(self, image_bytes: bytes) -> Dict:
        """Extract features using optimized methods"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array for OpenCV
            img_array = np.array(image)
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            
            features = {}
            
            # Basic properties
            height, width = img_bgr.shape[:2]
            features['aspect_ratio'] = width / height
            
            # Fast color extraction (no KMeans)
            features.update(self._extract_color_features_fast(image, img_bgr))
            
            # Face detection (using pre-loaded cascade)
            features['face_area_percentage'] = self._detect_faces(img_bgr)
            
            # Text detection
            features['has_text'] = self._detect_text_regions(img_bgr)
            
            # Quality metrics
            features.update(self._extract_quality_metrics(img_bgr))
            
            return features
            
        except Exception as e:
            print(f"Thumbnail processing error: {e}")
            return self._get_default_features()
    
    def _extract_color_features_fast(self, img_pil: Image.Image, img_bgr) -> Dict:
        """Fast color extraction using PIL quantization instead of KMeans"""
        features = {}
        
        try:
            # Use PIL's built-in quantization (much faster than KMeans)
            # Reduce to 5 colors
            # Use compatible quantization method
            try:
                quantized = img_pil.quantize(colors=5, method=Image.Resampling.FASTOCTREE)
            except AttributeError:
                # Fallback for older PIL versions
                quantized = img_pil.quantize(colors=5)
            palette = quantized.getpalette()
            
            # Extract dominant colors from palette
            dominant_colors = []
            for i in range(0, 15, 3):  # First 5 colors
                if i + 2 < len(palette):
                    dominant_colors.append([palette[i], palette[i+1], palette[i+2]])
            
            # Pad with defaults if needed
            while len(dominant_colors) < 5:
                dominant_colors.append([128, 128, 128])
            
            features['dominant_colors'] = dominant_colors[:3]
            features['color_palette'] = dominant_colors
            
            # Fast average color calculation using numpy
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            avg_color = np.mean(img_rgb.reshape(-1, 3), axis=0)
            features['average_rgb'] = avg_color.tolist()
            features['avg_r'] = float(avg_color[0])
            features['avg_g'] = float(avg_color[1])
            features['avg_b'] = float(avg_color[2])
            
            # Brightness and contrast
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            features['brightness'] = float(np.mean(gray))
            features['contrast'] = float(np.std(gray))
            
            # Saturation (simplified calculation)
            hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
            features['saturation'] = float(np.mean(hsv[:, :, 1]))
            
            # Color variance
            features['color_variance'] = float(np.std(img_rgb))
            
            # Warm/cool tone
            warm_cool = (avg_color[0] - avg_color[2]) / 255.0
            features['warm_cool'] = float(warm_cool)
            
        except Exception as e:
            print(f"Color extraction error: {e}")
            # Return defaults
            features.update(self._get_default_color_features())
        
        return features
    
    def _detect_faces(self, img_bgr) -> float:
        """Detect faces using pre-loaded cascade"""
        if self.face_cascade is None:
            return 0.0
        
        try:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            # Optimize detection parameters for speed
            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.2,  # Less aggressive scaling
                minNeighbors=3,   # Fewer neighbors required
                minSize=(30, 30)  # Minimum face size
            )
            
            if len(faces) == 0:
                return 0.0
            
            # Calculate total face area
            total_face_area = sum(w * h for (x, y, w, h) in faces)
            image_area = img_bgr.shape[0] * img_bgr.shape[1]
            
            return (total_face_area / image_area) * 100
            
        except Exception:
            return 0.0
    
    def _detect_text_regions(self, img_bgr) -> float:
        """Simple text detection using edge density"""
        try:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            height = edges.shape[0]
            # Check top and bottom thirds where text usually appears
            top_third = edges[:height//3, :]
            bottom_third = edges[2*height//3:, :]
            
            text_area_edges = np.sum(top_third > 0) + np.sum(bottom_third > 0)
            text_area_pixels = top_third.size + bottom_third.size
            
            edge_density = text_area_edges / text_area_pixels if text_area_pixels > 0 else 0
            
            return float(edge_density > 0.05)
            
        except Exception:
            return 0.0
    
    def _extract_quality_metrics(self, img_bgr) -> Dict:
        """Extract image quality metrics"""
        features = {}
        
        try:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            
            # Edge density
            edges = cv2.Canny(gray, 50, 150)
            features['edge_density'] = float(np.sum(edges > 0) / edges.size)
            
            # Sharpness (Laplacian variance)
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            features['sharpness'] = float(laplacian.var())
            
        except Exception:
            features['edge_density'] = 0.1
            features['sharpness'] = 100.0
        
        return features
    
    def _get_default_color_features(self) -> Dict:
        """Default color features for fallback"""
        return {
            'dominant_colors': [[128, 128, 128]] * 3,
            'color_palette': [[128, 128, 128]] * 5,
            'average_rgb': [128, 128, 128],
            'avg_r': 128.0,
            'avg_g': 128.0,
            'avg_b': 128.0,
            'brightness': 128.0,
            'contrast': 50.0,
            'saturation': 128.0,
            'color_variance': 30.0,
            'warm_cool': 0.0
        }
    
    def _get_default_features(self) -> Dict:
        """Complete default features"""
        features = {
            'aspect_ratio': 1.78,
            'face_area_percentage': 0.0,
            'has_text': 0.0,
            'edge_density': 0.1,
            'sharpness': 100.0
        }
        features.update(self._get_default_color_features())
        return features


class YouTubePredictionSystem:
    """ML prediction system with optimized embeddings and model loading"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_lists = {}
        self.baseline_models = {}
        self.guardrails = {}
        self.thumbnail_processor = ThumbnailProcessor()
        
        # TF-IDF and SVD for embeddings
        self.tfidf = None
        self.svd = None
        
        self.load_models()
        self.load_embedding_models()
    
    def load_models(self):
        """Load all trained ML models"""
        script_dir = Path(__file__).parent
        models_dir = script_dir.parent / "models"
        
        print(f"Loading models from: {models_dir}")
        
        if not models_dir.exists():
            raise FileNotFoundError(f"Models directory not found: {models_dir}")
        
        try:
            # Load CTR models
            if (models_dir / "ctr_model.joblib").exists():
                self.models['ctr'] = joblib.load(models_dir / "ctr_model.joblib")
                self.baseline_models['ctr'] = joblib.load(models_dir / "ctr_baseline.joblib")
                self.feature_lists['ctr'] = joblib.load(models_dir / "ctr_features.joblib")
                self.feature_lists['ctr_baseline'] = joblib.load(models_dir / "ctr_baseline_features.joblib")
                print(f"CTR model loaded ({len(self.feature_lists['ctr'])} features)")
            
            # Load RQS model
            if (models_dir / "rqs_model.joblib").exists():
                self.models['rqs'] = joblib.load(models_dir / "rqs_model.joblib")
                self.feature_lists['rqs'] = joblib.load(models_dir / "rqs_features.joblib")
                print(f"RQS model loaded ({len(self.feature_lists['rqs'])} features)")
                
                if (models_dir / "rqs_slice_stats.json").exists():
                    with open(models_dir / "rqs_slice_stats.json", 'r') as f:
                        self.rqs_slice_stats = json.load(f)
            
            # Load Views models
            if (models_dir / "views_residual_model.joblib").exists():
                self.models['views'] = joblib.load(models_dir / "views_residual_model.joblib")
                self.baseline_models['views'] = joblib.load(models_dir / "views_baseline_model.joblib")
                self.scalers['views'] = joblib.load(models_dir / "views_residual_scaler.joblib")
                self.feature_lists['views'] = joblib.load(models_dir / "views_residual_features.joblib")
                self.feature_lists['views_baseline'] = joblib.load(models_dir / "views_baseline_features.joblib")
                print(f"Views model loaded ({len(self.feature_lists['views'])} features)")
            
            # Load guardrails
            if (models_dir / "views_guardrails.json").exists():
                with open(models_dir / "views_guardrails.json", 'r') as f:
                    self.guardrails = json.load(f)
                print(f"Loaded guardrails for {len(self.guardrails)} segments")
                
        except Exception as e:
            print(f"Error loading models: {e}")
            raise
    
    def load_embedding_models(self):
        """Load TF-IDF and SVD models for proper embeddings"""
        models_dir = Path(__file__).parent.parent / "models"
        
        # Try to load saved TF-IDF and SVD models
        try:
            if (models_dir / "tfidf_title.joblib").exists():
                self.tfidf = {}
                self.svd = {}
                
                # Load different models for different text types
                for text_type in ['title', 'description', 'tags', 'thumb_text']:
                    tfidf_path = models_dir / f"tfidf_{text_type}.joblib"
                    svd_path = models_dir / f"svd_{text_type}.joblib"
                    
                    if tfidf_path.exists() and svd_path.exists():
                        self.tfidf[text_type] = joblib.load(tfidf_path)
                        self.svd[text_type] = joblib.load(svd_path)
                        print(f"Loaded TF-IDF/SVD for {text_type}")
                
                if not self.tfidf:
                    self.tfidf = None
                    self.svd = None
                    print("WARNING: No TF-IDF/SVD models found - using fallback embeddings")
            else:
                print("WARNING: TF-IDF/SVD models not found - predictions will be less accurate")
                print("To fix: Save TF-IDF and SVD models during training")
                
        except Exception as e:
            print(f"Error loading embedding models: {e}")
            self.tfidf = None
            self.svd = None
    
    def generate_embeddings(self, text: str, text_type: str, n_components: int = 30) -> np.ndarray:
        """Generate proper embeddings using TF-IDF/SVD if available"""
        # Use real embeddings if available
        if self.tfidf and self.svd and text_type in self.tfidf:
            try:
                tfidf_matrix = self.tfidf[text_type].transform([text])
                embedding = self.svd[text_type].transform(tfidf_matrix)
                return embedding.flatten()[:n_components]
            except Exception as e:
                print(f"Embedding generation error for {text_type}: {e}")
        
        # Fallback: Create simple feature-based embeddings (better than hash)
        # This is still not ideal but better than random hash values
        if not text:
            return np.zeros(n_components)
        
        # Create basic text features
        features = []
        features.append(len(text) / 100.0)  # Length feature
        features.append(len(text.split()) / 20.0)  # Word count
        features.append(text.count('!') / 5.0)  # Exclamations
        features.append(text.count('?') / 5.0)  # Questions
        features.append(sum(c.isupper() for c in text) / max(len(text), 1))  # Caps ratio
        
        # Pad with zeros to match expected dimensions
        while len(features) < n_components:
            features.append(0.0)
        
        return np.array(features[:n_components])
    
    def prepare_features_with_thumbnail(self, video_data: Dict, thumbnail_features: Dict, 
                                       feature_list: List[str]) -> pd.DataFrame:
        """Prepare features with proper embeddings and thumbnail data"""
        features = {}
        
        for col in feature_list:
            # Handle embedding features properly
            if 'title_embed_' in col:
                idx = int(col.split('_')[-1])
                title_embedding = self.generate_embeddings(
                    video_data.get('title', ''), 'title', 30
                )
                features[col] = title_embedding[idx] if idx < len(title_embedding) else 0.0
                
            elif 'description_embed_' in col:
                idx = int(col.split('_')[-1])
                desc_embedding = self.generate_embeddings(
                    video_data.get('description', ''), 'description', 30
                )
                features[col] = desc_embedding[idx] if idx < len(desc_embedding) else 0.0
                
            elif 'tags_embed_' in col:
                idx = int(col.split('_')[-1])
                tags_text = ' '.join(video_data.get('tags', [])) if isinstance(video_data.get('tags'), list) else ''
                tags_embedding = self.generate_embeddings(tags_text, 'tags', 20)
                features[col] = tags_embedding[idx] if idx < len(tags_embedding) else 0.0
                
            elif 'thumb_text_embed_' in col:
                idx = int(col.split('_')[-1])
                thumb_embedding = self.generate_embeddings(
                    video_data.get('thumbnail_text', ''), 'thumb_text', 15
                )
                features[col] = thumb_embedding[idx] if idx < len(thumb_embedding) else 0.0
            
            # Thumbnail visual features
            elif col in thumbnail_features:
                features[col] = float(thumbnail_features[col])
            
            # RGB features
            elif 'avg_r' in col or 'average_r' in col:
                features[col] = thumbnail_features.get('avg_r', 128.0)
            elif 'avg_g' in col or 'average_g' in col:
                features[col] = thumbnail_features.get('avg_g', 128.0)
            elif 'avg_b' in col or 'average_b' in col:
                features[col] = thumbnail_features.get('avg_b', 128.0)
            
            # Other visual features
            elif 'brightness' in col:
                features[col] = thumbnail_features.get('brightness', 128.0)
            elif 'contrast' in col:
                features[col] = thumbnail_features.get('contrast', 50.0)
            elif 'saturation' in col:
                features[col] = thumbnail_features.get('saturation', 128.0)
            elif 'warm_cool' in col:
                features[col] = thumbnail_features.get('warm_cool', 0.0)
            elif 'face' in col:
                features[col] = thumbnail_features.get('face_area_percentage', 0.0)
            elif 'edge_density' in col:
                features[col] = thumbnail_features.get('edge_density', 0.1)
            
            # Genre encoding
            elif col.startswith('genre_'):
                genre = video_data.get('genre', 'unknown')
                features[col] = 1.0 if col == f'genre_{genre}' else 0.0
            
            # Duration features
            elif 'duration' in col:
                features[col] = video_data.get('duration_seconds', 300.0)
            
            # Title features
            elif 'title_length' in col:
                features[col] = len(video_data.get('title', ''))
            elif 'title_word_count' in col:
                features[col] = len(video_data.get('title', '').split())
            
            # Other features
            elif col in video_data:
                features[col] = float(video_data[col])
            else:
                features[col] = 0.0
        
        return pd.DataFrame([features])[feature_list]
    
    def prepare_baseline_features(self, video_data: Dict, model_type: str = 'ctr') -> pd.DataFrame:
        """Prepare baseline features for CTR or Views model"""
        features = {
            'log_subs': np.log1p(video_data.get('channel_subscriber_count', 1000)),
            'log_age': np.log1p(video_data.get('age_days', 0))
        }
        
        # Add log_duration only for CTR baseline (not Views baseline)
        feature_list_key = f'{model_type}_baseline'
        if feature_list_key in self.feature_lists:
            if any('log_duration' in col for col in self.feature_lists[feature_list_key]):
                features['log_duration'] = np.log1p(video_data.get('duration_seconds', 300))
        
        # Add genre encoding
        genre = video_data.get('genre', 'unknown')
        for g in ['unknown', 'gaming', 'education_science', 'challenge_stunts', 'catholic', 'kids_family']:
            features[f'genre_{g}'] = 1.0 if genre == g else 0.0
        
        # Use appropriate feature list
        if feature_list_key in self.feature_lists:
            feature_cols = self.feature_lists[feature_list_key]
        else:
            feature_cols = list(features.keys())
        
        return pd.DataFrame([features])[feature_cols]
    
    def predict_ctr(self, video_data: Dict, thumbnail_features: Dict) -> float:
        """Predict CTR (views/subscribers ratio)"""
        if 'ctr' not in self.models:
            return 0.05  # 5% default
        
        try:
            X_residual = self.prepare_features_with_thumbnail(
                video_data, thumbnail_features, self.feature_lists['ctr']
            )
            
            if hasattr(self.models['ctr'], 'predict'):
                residual_pred = self.models['ctr'].predict(X_residual)[0]
            else:
                residual_pred = 0.0
            
            X_baseline = self.prepare_baseline_features(video_data, 'ctr')
            baseline_pred = self.baseline_models['ctr'].predict(X_baseline)[0]
            
            ctr_log = baseline_pred + residual_pred
            ctr = np.expm1(ctr_log)
            
            return np.clip(ctr, 0.01, 2.0)
            
        except Exception as e:
            print(f"CTR prediction error: {e}")
            return 0.05
    
    def predict_rqs(self, video_data: Dict, thumbnail_features: Dict) -> float:
        """Predict RQS (0-100 score)"""
        if 'rqs' not in self.models:
            return 50.0
        
        try:
            X_rqs = self.prepare_features_with_thumbnail(
                video_data, thumbnail_features, self.feature_lists['rqs']
            )
            
            if hasattr(self.models['rqs'], 'predict'):
                rqs_pred = self.models['rqs'].predict(X_rqs)[0]
            else:
                rqs_pred = 50.0
            
            return np.clip(rqs_pred, 10, 90)
            
        except Exception as e:
            print(f"RQS prediction error: {e}")
            return 50.0
    
    def predict_views(self, ctr_pred: float, rqs_pred: float, video_data: Dict) -> int:
        """Predict views with guardrails"""
        subs = video_data.get('channel_subscriber_count', 1000)
        genre = video_data.get('genre', 'unknown')
        
        if 'views' not in self.models:
            return max(int(subs * ctr_pred), 10)
        
        try:
            X_baseline = self.prepare_baseline_features(video_data, 'views')
            baseline_pred = self.baseline_models['views'].predict(X_baseline)[0]
            
            # Prepare residual features
            features = {
                'ctr_pred': ctr_pred,
                'ctr_pred_sq': ctr_pred ** 2,
                'ctr_pred_log': np.log1p(max(0, ctr_pred)),
                'rqs_pred': rqs_pred,
                'rqs_pred_sq': (rqs_pred / 100) ** 2,
                'rqs_pred_sigmoid': 1 / (1 + np.exp(-(rqs_pred - 50) / 10)),
                'ctr_rqs_interaction': ctr_pred * (rqs_pred / 100),
                'ctr_rqs_product': np.sqrt(max(0, ctr_pred * rqs_pred / 100)),
                'log_age': np.log1p(video_data.get('age_days', 0)),
                'log_age_sq': np.log1p(video_data.get('age_days', 0)) ** 2,
                'log_subs': np.log1p(subs),
                'ctr_subs_interaction': ctr_pred * np.log1p(subs)
            }
            
            for col in self.feature_lists.get('views', []):
                if col.startswith('genre_'):
                    features[col] = 1.0 if col == f'genre_{genre}' else 0.0
            
            X_residual = pd.DataFrame([features])[self.feature_lists['views']]
            X_scaled = self.scalers['views'].transform(X_residual)
            residual_pred = self.models['views'].predict(X_scaled)[0]
            
            views_log = baseline_pred + residual_pred
            views = np.expm1(views_log)
            
            # Apply guardrails
            if self.guardrails:
                log_subs = np.log1p(subs)
                if log_subs < 6.9:
                    subs_bucket = 0
                elif log_subs < 9.2:
                    subs_bucket = 1
                elif log_subs < 11.5:
                    subs_bucket = 2
                elif log_subs < 13.8:
                    subs_bucket = 3
                else:
                    subs_bucket = 4
                
                guardrail_key = f"{genre}|{subs_bucket}"
                if guardrail_key in self.guardrails:
                    max_views = self.guardrails[guardrail_key]
                    views = min(views, max_views)
            
            return max(int(views), 10)
            
        except Exception as e:
            print(f"Views prediction error: {e}")
            return max(int(subs * ctr_pred), 10)
    
    def generate_recommended_tags(self, title: str, genre: str) -> List[str]:
        """Generate recommended tags based on title and genre"""
        tags = []
        
        # Add genre-specific tags
        genre_tag_map = {
            'gaming': ['gaming', 'gameplay', 'gamer', 'video games', 'game review'],
            'education_science': ['education', 'learning', 'science', 'tutorial', 'explained'],
            'challenge_stunts': ['challenge', 'stunts', 'extreme', 'daredevil', 'amazing'],
            'catholic': ['christian', 'faith', 'spiritual', 'religion', 'bible'],
            'kids_family': ['kids', 'family', 'children', 'fun', 'entertainment'],
            'other': ['youtube', 'content', 'creator', 'viral', 'trending']
        }
        
        # Add genre-specific tags
        if genre in genre_tag_map:
            tags.extend(genre_tag_map[genre])
        else:
            tags.extend(genre_tag_map['other'])
        
        # Extract keywords from title for additional tags
        title_lower = title.lower()
        
        # Common YouTube keywords that boost discoverability
        if any(word in title_lower for word in ['how to', 'tutorial', 'guide']):
            tags.extend(['how to', 'tutorial', 'guide'])
        
        if any(word in title_lower for word in ['review', 'reaction']):
            tags.extend(['review', 'reaction'])
            
        if any(word in title_lower for word in ['tips', 'tricks', 'hacks']):
            tags.extend(['tips', 'life hacks', 'pro tips'])
            
        if any(word in title_lower for word in ['2024', '2025']):
            tags.append(str(datetime.now().year))
            
        # Remove duplicates and limit to 8 tags
        unique_tags = list(dict.fromkeys(tags))  # Preserves order while removing duplicates
        return unique_tags[:8]
    
    def predict_performance(self, title: str, genre: str, subscriber_count: int,
                          thumbnail_data: Optional[bytes] = None,
                          video_data: Optional[Dict] = None) -> Dict:
        """Main prediction with validation feedback"""
        
        # Genre validation with transparency
        valid_genres = ['gaming', 'education_science', 'challenge_stunts', 
                       'catholic', 'kids_family', 'unknown']
        warnings = []
        
        if genre not in valid_genres:
            warnings.append(f"Invalid genre '{genre}' changed to 'unknown'. Valid options: {', '.join(valid_genres)}")
            print(f"Warning: Invalid genre '{genre}' provided, using 'unknown'")
            genre = 'unknown'
        
        # Process thumbnail
        if thumbnail_data:
            thumbnail_features = self.thumbnail_processor.extract_features(thumbnail_data)
            print(f"Thumbnail analyzed: brightness={thumbnail_features['brightness']:.1f}, "
                  f"faces={thumbnail_features['face_area_percentage']:.1f}%")
        else:
            thumbnail_features = self.thumbnail_processor._get_default_features()
        
        # Prepare video data
        if video_data is None:
            video_data = {}
        
        video_data.update({
            'title': title,
            'genre': genre,
            'channel_subscriber_count': subscriber_count,
            'age_days': 0,
            'duration_seconds': video_data.get('duration_seconds', 300)
        })
        
        # Sequential predictions
        ctr_pred = self.predict_ctr(video_data, thumbnail_features)
        rqs_pred = self.predict_rqs(video_data, thumbnail_features)
        views_pred = self.predict_views(ctr_pred, rqs_pred, video_data)
        
        # Debug logging for CTR investigation
        print(f"Debug - CTR: {ctr_pred:.6f}, Duration: {video_data.get('duration_seconds', 'N/A')}s, Title: '{video_data.get('title', 'N/A')[:30]}...', Embeddings: {bool(self.tfidf)}")
        
        # Calculate performance score
        ctr_percentage = ctr_pred * 100
        ctr_score = min(ctr_pred / 0.2 * 100, 100)
        performance_score = (ctr_score * 0.3 + rqs_pred * 0.4 + 
                           min(views_pred / subscriber_count * 100, 100) * 0.3)
        
        result = {
            'predicted_views': views_pred,
            'predicted_rqs': round(rqs_pred, 2),
            'predicted_ctr': round(ctr_pred, 4),  # Keep more precision for very small values
            'predicted_ctr_percentage': round(ctr_percentage, 2),
            'performance_score': round(performance_score, 1),
            'thumbnail_analysis': {
                'brightness': thumbnail_features.get('brightness', 128),
                'has_faces': bool(thumbnail_features.get('face_area_percentage', 0) > 0),
                'face_percentage': thumbnail_features.get('face_area_percentage', 0),
                'has_text': bool(thumbnail_features.get('has_text', 0)),
                'color_variance': thumbnail_features.get('color_variance', 0),
                'sharpness': thumbnail_features.get('sharpness', 0)
            },
            'confidence_score': 0.85 if thumbnail_data and self.tfidf else 0.65,
            'confidence': {
                'views': 'High' if thumbnail_data and self.tfidf else 'Medium',
                'rqs': 'High' if thumbnail_data and self.tfidf else 'Medium', 
                'ctr': 'High' if thumbnail_data and self.tfidf else 'Medium'
            },
            'model_version': '3.1',
            'guardrails_applied': bool(self.guardrails),
            'embeddings_available': bool(self.tfidf)
        }
        
        if warnings:
            result['warnings'] = warnings
        
        return result


# Global predictor instance (will be initialized on startup)
predictor = None

def initialize_predictor():
    """Initialize the prediction system with error handling"""
    global predictor
    try:
        print("🔄 Initializing prediction system...")
        predictor = YouTubePredictionSystem()
        print("✅ Prediction system initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize prediction system: {e}")
        import traceback
        traceback.print_exc()
        return False

# FastAPI app
app = FastAPI(title="YouTube Performance Predictor", version="3.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize predictor on app startup"""
    success = initialize_predictor()
    if not success:
        print("⚠️ Running with fallback predictions only")

@app.post("/api/predict")
async def predict_video_performance(
    title: str = Form(...),
    genre: str = Form(...),
    subscriber_count: int = Form(...),
    thumbnail: Optional[UploadFile] = File(None),
    duration_seconds: Optional[int] = Form(None)
):
    """Predict with optimized performance and transparency"""
    
    try:
        if predictor is None:
            raise HTTPException(status_code=503, detail="Prediction system not initialized")
        
        video_data = {
            'title': title,
            'genre': genre,
            'subscriber_count': subscriber_count,
            'duration_seconds': duration_seconds or 480,  # 8 minutes - more typical for YouTube
            'description': f"Learn about {title.lower()}" if title else "",  # Generate basic description
            'tags': predictor.generate_recommended_tags(title, genre),  # Smart tag recommendations
            'age_days': 0,  # New video
        }
        
        thumbnail_data = None
        if thumbnail:
            thumbnail_data = await thumbnail.read()
        
        predictions = predictor.predict_performance(
            title=title,
            genre=genre,
            subscriber_count=subscriber_count,
            thumbnail_data=thumbnail_data,
            video_data=video_data
        )
        
        # Add input metadata
        predictions['input_data'] = {
            'title': title,
            'genre': genre,
            'subscriber_count': subscriber_count,
            'duration_minutes': (duration_seconds or 480) / 60,
            'recommended_tags': video_data['tags'],
            'has_thumbnail': bool(thumbnail is not None),
            'prediction_date': datetime.now().isoformat()
        }
        
        return JSONResponse(content=predictions)
        
    except Exception as e:
        print(f"API error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "service": "YouTube Predictor API",
        "version": "3.1",
        "status": "active" if predictor else "initializing",
        "models_loaded": len(predictor.models) if predictor else 0,
        "embeddings_available": predictor.tfidf is not None if predictor else False,
        "thumbnail_processor": "optimized" if predictor else "unavailable"
    }

@app.get("/api/health")
async def health_check():
    if predictor is None:
        return JSONResponse(
            status_code=503,
            content={
                "status": "initializing",
                "models_loaded": 0,
                "embeddings_available": False,
                "guardrails_loaded": False,
                "timestamp": datetime.now().isoformat(),
                "message": "Prediction system still initializing"
            }
        )
    
    return {
        "status": "healthy",
        "models_loaded": len(predictor.models),
        "embeddings_available": predictor.tfidf is not None,
        "guardrails_loaded": bool(predictor.guardrails),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    print("🚀 Starting YouTube Predictor API v3.1 (Optimized)...")
    
    # Initialize prediction system
    success = initialize_predictor()
    
    if predictor:
        print(f"✅ Models loaded: {list(predictor.models.keys())}")
        print(f"✅ Embeddings available: {predictor.tfidf is not None}")
        if not predictor.tfidf:
            print("⚠️ WARNING: TF-IDF models not found. For best accuracy:")
            print("   1. Re-run training to save TF-IDF/SVD models")
            print("   2. Place them in the models/ directory")
        print("🎯 Ready for predictions!")
    else:
        print("⚠️ Running with limited functionality - some models failed to load")
    
    # Start server regardless
    print(f"🌐 Starting server on port 8002...")
    uvicorn.run(app, host="0.0.0.0", port=8002)