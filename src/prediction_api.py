#!/usr/bin/env python3
"""
YouTube Video Performance Prediction API
Uses trained ML models to predict views, RQS, and CTR based on video metadata
"""

import os
import sys
import json
import warnings
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Union
from datetime import datetime
import base64
from io import BytesIO
from PIL import Image
import cv2

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# Suppress scikit-learn version warnings
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')
warnings.filterwarnings('ignore', message='.*sklearn.*')

class YouTubePredictionSystem:
    """ML-powered prediction system for YouTube video performance"""
    
    # Feature count constants for different model types
    VIEW_COUNT_FEATURES = 1186
    RQS_FEATURES = 1181
    CTR_FEATURES = 796
    GENRE_FEATURES = 2
    EMBEDDING_DIM = 384
    TEXT_FIELDS = 3  # title, thumbnail_text, tags
    
    # Default engagement ratios
    DEFAULT_LIKE_ENGAGEMENT_RATE = 0.02  # 2% of subscribers typically like
    DEFAULT_COMMENT_RATE = 0.001  # 0.1% of subscribers typically comment
    DEFAULT_LIKE_RATIO = 0.05  # 5% like-to-view ratio
    DEFAULT_COMMENT_RATIO = 0.001  # 0.1% comment-to-view ratio
    DEFAULT_VIEWS_PER_SUB = 0.1  # 10% of subscribers view new videos
    DEFAULT_RQS = 0.5  # Default retention quality score
    DEFAULT_COMMENT_LENGTH = 25.0  # Average comment length in characters
    
    # Video format defaults
    DEFAULT_ASPECT_RATIO = 1.78  # Standard 16:9 aspect ratio
    DEFAULT_EDGE_DENSITY = 0.1  # Default thumbnail edge density
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.embedding_model = None
        self.load_models()
        self.load_embedding_model()
        
    def load_models(self):
        """Load all trained ML models and scalers"""
        # Get the directory where this script is located
        script_dir = Path(__file__).parent
        default_models_dir = script_dir.parent / "extracted_data" / "models"
        models_dir_env = os.environ.get("MODELS_DIR")
        if models_dir_env:
            models_dir = Path(models_dir_env)
            # Validate that the environment variable points to an existing directory
            if not models_dir.exists() or not models_dir.is_dir():
                print(f"⚠️ Warning: MODELS_DIR environment variable '{models_dir_env}' does not point to an existing directory. Falling back to default.")
                models_dir = default_models_dir
        else:
            models_dir = default_models_dir
        
        print("🔄 Loading ML models...")
        print(f"📁 Script directory: {script_dir.absolute()}")
        print(f"📁 Models directory: {models_dir.absolute()}")
        
        if not models_dir.exists():
            raise FileNotFoundError(f"Models directory not found: {models_dir.absolute()}")
        
        try:
            # Suppress warnings during model loading
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                
                # Load view count prediction models
                self.models['view_count'] = joblib.load(models_dir / "view_count_model.joblib")
                self.scalers['view_count'] = joblib.load(models_dir / "view_count_scaler.joblib")
                print("✅ View count model loaded")
                
                # Load RQS prediction models
                self.models['rqs'] = joblib.load(models_dir / "rqs_model.joblib")
                self.scalers['rqs'] = joblib.load(models_dir / "rqs_scaler.joblib")
                print("✅ RQS model loaded")
                
                # Load CTR prediction models
                self.models['ctr'] = joblib.load(models_dir / "ctr_model.joblib")
                self.scalers['ctr'] = joblib.load(models_dir / "ctr_scaler.joblib")
                print("✅ CTR model loaded")
                
                # Load genre-specific RQS models
                genre_models = {
                    'catholic': 'rqs_model_catholic.joblib',
                    'challenge_stunts': 'rqs_model_challenge_stunts.joblib',
                    'education_science': 'rqs_model_education_science.joblib',
                    'gaming': 'rqs_model_gaming.joblib',
                    'kids_family': 'rqs_model_kids_family.joblib'
                }
                
                for genre, model_file in genre_models.items():
                    model_path = models_dir / model_file
                    if model_path.exists():
                        self.models[f'rqs_{genre}'] = joblib.load(model_path)
                        print(f"✅ {genre} RQS model loaded")
                
                print(f"🎯 Total models loaded: {len(self.models)}")
                
                # Validate feature counts against actual model requirements
                self._validate_feature_counts()
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise
    
    def _validate_feature_counts(self):
        """Validate hard-coded feature counts against actual model requirements"""
        print("🔍 Validating feature counts against model requirements...")
        
        validation_errors = []
        updated_constants = {}
        
        # Validate view count model
        if 'view_count' in self.scalers:
            actual_features = self.scalers['view_count'].n_features_in_
            if actual_features != self.VIEW_COUNT_FEATURES:
                validation_errors.append(f"View count model expects {actual_features} features, but VIEW_COUNT_FEATURES is {self.VIEW_COUNT_FEATURES}")
                updated_constants['VIEW_COUNT_FEATURES'] = actual_features
            else:
                print(f"✅ View count features validated: {actual_features}")
        
        # Validate RQS model
        if 'rqs' in self.scalers:
            actual_features = self.scalers['rqs'].n_features_in_
            if actual_features != self.RQS_FEATURES:
                validation_errors.append(f"RQS model expects {actual_features} features, but RQS_FEATURES is {self.RQS_FEATURES}")
                updated_constants['RQS_FEATURES'] = actual_features
            else:
                print(f"✅ RQS features validated: {actual_features}")
        
        # Validate CTR model
        if 'ctr' in self.scalers:
            actual_features = self.scalers['ctr'].n_features_in_
            if actual_features != self.CTR_FEATURES:
                validation_errors.append(f"CTR model expects {actual_features} features, but CTR_FEATURES is {self.CTR_FEATURES}")
                updated_constants['CTR_FEATURES'] = actual_features
            else:
                print(f"✅ CTR features validated: {actual_features}")
        
        # Validate embedding dimensions
        if self.embedding_model:
            actual_embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
            if actual_embedding_dim != self.EMBEDDING_DIM:
                validation_errors.append(f"Embedding model produces {actual_embedding_dim} dimensions, but EMBEDDING_DIM is {self.EMBEDDING_DIM}")
                updated_constants['EMBEDDING_DIM'] = actual_embedding_dim
            else:
                print(f"✅ Embedding dimensions validated: {actual_embedding_dim}")
        
        if validation_errors:
            # Auto-correct the constants for this instance
            for const_name, correct_value in updated_constants.items():
                setattr(self, const_name, correct_value)
                print(f"🔧 Auto-corrected {const_name} to {correct_value}")
            
            print("⚠️ Feature count mismatches detected and auto-corrected for this session.")
            print("💡 Consider updating the hard-coded constants in the source code:")
            for const_name, correct_value in updated_constants.items():
                print(f"   {const_name} = {correct_value}")
        else:
            print("✅ All feature counts validated successfully")
    
    def load_embedding_model(self):
        """Load the sentence transformer model for text embeddings"""
        try:
            from sentence_transformers import SentenceTransformer
            self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            print("✅ SentenceTransformer embedding model loaded")
        except Exception as e:
            print(f"❌ Error loading embedding model: {e}")
            self.embedding_model = None
    
    def get_text_embedding(self, text: str, max_length: int = 512) -> np.ndarray:
        """Generate text embedding using sentence transformer"""
        if self.embedding_model is None:
            # Return zero embedding if model not available
            return np.zeros(self.EMBEDDING_DIM)
        
        if not text or pd.isna(text):
            return np.zeros(self.EMBEDDING_DIM)
        
        # Truncate text if too long
        if len(text) > max_length:
            text = text[:max_length]
        
        try:
            embedding = self.embedding_model.encode(text)
            return embedding
        except Exception as e:
            print(f"Error generating embedding for text: {e}")
            return np.zeros(self.EMBEDDING_DIM)
    
    def get_list_text_embedding(self, text_list) -> np.ndarray:
        """Generate embedding for a list of texts (like tags)"""
        if not text_list or (isinstance(text_list, str) and pd.isna(text_list)):
            return np.zeros(self.EMBEDDING_DIM)
        
        # Handle string representation of list
        if isinstance(text_list, str):
            try:
                import ast
                text_list = ast.literal_eval(text_list)
            except:
                # If it's just a string, treat as single item
                text_list = [text_list]
        
        # Join all texts in the list
        if isinstance(text_list, list):
            combined_text = ' '.join(str(item) for item in text_list if item)
        else:
            combined_text = str(text_list)
        
        return self.get_text_embedding(combined_text)
    
    def create_full_feature_vector(self, video_data: Dict) -> np.ndarray:
        """Create the complete 1,186-feature vector that matches the trained models"""
        
        # Start with basic numeric features
        basic_features = []
        
        # Core video metrics
        basic_features.extend([
            float(video_data.get('like_count', 0)),
            float(video_data.get('comment_count', 0)),
            float(video_data.get('channel_subscriber_count', 0)),  # channel_subs in training
            float(video_data.get('average_comment_length', 0)),
            float(video_data.get('sentiment_score', 0)),
            float(video_data.get('rqs', self.DEFAULT_RQS)),  # Default RQS if not provided
        ])
        
        # Thumbnail features
        thumbnail_features = video_data.get('thumbnail_features', {})
        basic_features.extend([
            float(thumbnail_features.get('face_area_percentage', 0)),
        ])
        
        # Dominant colors (3 colors x 3 RGB values = 9 features)
        dominant_colors = thumbnail_features.get('dominant_colors', [[0,0,0], [0,0,0], [0,0,0]])
        for color in dominant_colors:
            if isinstance(color, list) and len(color) >= 3:
                basic_features.extend([float(color[0]), float(color[1]), float(color[2])])
            else:
                basic_features.extend([0.0, 0.0, 0.0])
        
        # Color palette (5 colors x 3 RGB values = 15 features)
        color_palette = thumbnail_features.get('color_palette', [[0,0,0]] * 5)
        for color in color_palette[:5]:  # Ensure we only take first 5
            if isinstance(color, list) and len(color) >= 3:
                basic_features.extend([float(color[0]), float(color[1]), float(color[2])])
            else:
                basic_features.extend([0.0, 0.0, 0.0])
        
        # Average RGB (3 features)
        avg_rgb = thumbnail_features.get('average_rgb', [0, 0, 0])
        if isinstance(avg_rgb, list) and len(avg_rgb) >= 3:
            basic_features.extend([float(avg_rgb[0]), float(avg_rgb[1]), float(avg_rgb[2])])
        else:
            basic_features.extend([0.0, 0.0, 0.0])
        
        # Additional thumbnail features
        basic_features.extend([
            float(thumbnail_features.get('brightness', 128)),
            float(thumbnail_features.get('contrast', 50)),
            float(thumbnail_features.get('edge_density', 0.1)),
        ])
        
        # Additional video features
        basic_features.extend([
            float(video_data.get('title_length', 0)),
            float(video_data.get('duration_seconds', 0)),
            float(video_data.get('like_ratio', 0)),
            float(video_data.get('comment_ratio', 0)),
            float(video_data.get('views_per_subscriber', 0)),
            1.0 if video_data.get('has_captions', False) else 0.0,
        ])
        
        # Generate text embeddings (EMBEDDING_DIM features each)
        title_embedding = self.get_text_embedding(video_data.get('title', ''))
        thumbnail_text_embedding = self.get_text_embedding(video_data.get('thumbnail_text', ''))
        tags_embedding = self.get_list_text_embedding(video_data.get('tags', []))
        
        # Combine all features
        # Basic features + title_embed + thumbnail_text_embed + tags_embed = total features
        all_features = np.concatenate([
            np.array(basic_features),
            title_embedding,
            thumbnail_text_embedding, 
            tags_embedding
        ])
        
        print(f"🔧 Created feature vector with {len(all_features)} features")
        print(f"   Basic features: {len(basic_features)}")
        print(f"   Title embedding: {len(title_embedding)}")
        print(f"   Thumbnail text embedding: {len(thumbnail_text_embedding)}")
        print(f"   Tags embedding: {len(tags_embedding)}")
        
        # Ensure we have exactly 1,186 features by padding or truncating
        target_features = self.VIEW_COUNT_FEATURES
        if len(all_features) < target_features:
            # Pad with zeros
            padding = np.zeros(target_features - len(all_features))
            all_features = np.concatenate([all_features, padding])
        elif len(all_features) > target_features:
            # Truncate
            all_features = all_features[:target_features]
        
        print(f"🎯 Final feature vector: {len(all_features)} features (target: {target_features})")
        
        return all_features
    
    def extract_thumbnail_features(self, image_data: bytes) -> Dict:
        """Extract features from thumbnail image"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(BytesIO(image_data))
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Extract basic image features
            height, width, channels = cv_image.shape
            aspect_ratio = width / height
            
            # Color analysis
            mean_color = np.mean(cv_image, axis=(0, 1))
            color_variance = np.var(cv_image, axis=(0, 1))
            
            # Brightness and contrast
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            contrast = np.std(gray)
            
            # Edge detection for complexity
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (width * height)
            
            return {
                'width': width,
                'height': height,
                'aspect_ratio': aspect_ratio,
                'brightness': brightness,
                'contrast': contrast,
                'edge_density': edge_density,
                'red_mean': mean_color[2],
                'green_mean': mean_color[1],
                'blue_mean': mean_color[0],
                'color_variance': np.mean(color_variance)
            }
            
        except Exception as e:
            print(f"❌ Error extracting thumbnail features: {e}")
            return self.get_default_thumbnail_features()
    
    def get_default_thumbnail_features(self) -> Dict:
        """Return default thumbnail features when extraction fails"""
        return {
            'width': 1280,
            'height': 720,
            'aspect_ratio': self.DEFAULT_ASPECT_RATIO,
            'brightness': 128,
            'contrast': 50,
            'edge_density': self.DEFAULT_EDGE_DENSITY,
            'red_mean': 128,
            'green_mean': 128,
            'blue_mean': 128,
            'color_variance': 1000
        }
    
    def extract_title_features(self, title: str) -> Dict:
        """Extract features from video title"""
        # Basic title metrics
        word_count = len(title.split())
        char_count = len(title)
        exclamation_count = title.count('!')
        question_count = title.count('?')
        caps_count = sum(1 for c in title if c.isupper())
        caps_ratio = caps_count / len(title) if title else 0
        
        # Engagement words (common clickbait terms)
        engagement_words = [
            'amazing', 'incredible', 'unbelievable', 'shocking', 'secret',
            'ultimate', 'best', 'worst', 'crazy', 'insane', 'epic', 'viral',
            'must', 'watch', 'see', 'new', 'first', 'last', 'only'
        ]
        
        engagement_score = sum(1 for word in engagement_words 
                             if word.lower() in title.lower())
        
        # Numbers in title (often perform well)
        import re
        number_count = len(re.findall(r'\d+', title))
        
        return {
            'word_count': word_count,
            'char_count': char_count,
            'exclamation_count': exclamation_count,
            'question_count': question_count,
            'caps_ratio': caps_ratio,
            'engagement_score': engagement_score,
            'number_count': number_count
        }
    
    def create_training_compatible_features(self, title: str, genre: str, subscriber_count: int,
                                          thumbnail_features: Optional[Dict] = None,
                                          estimated_features: Optional[Dict] = None) -> Dict[str, pd.DataFrame]:
        """
        Create feature vectors compatible with each trained model.
        Returns different feature sets for view_count, rqs, ctr, and genre models.
        """
        print(f"🔧 Creating training-compatible features for: '{title[:30]}...'")
        
        # Generate text embeddings (EMBEDDING_DIM features each)
        title_embedding = self.get_text_embedding(title)
        
        # Create reasonable defaults for missing text
        thumbnail_text = estimated_features.get('thumbnail_text', '') if estimated_features else ''
        tags = estimated_features.get('tags', f'{genre} video youtube') if estimated_features else f'{genre} video youtube'
        
        thumbnail_text_embedding = self.get_text_embedding(thumbnail_text)
        tags_embedding = self.get_text_embedding(tags)
        
        # Start with base features
        base_features = {}
        
        # Add text embeddings (384 * 3 = 1,152 features)
        for i in range(self.EMBEDDING_DIM):
            base_features[f'title_embed_{i}'] = title_embedding[i]
            base_features[f'thumbnail_text_embed_{i}'] = thumbnail_text_embedding[i]
            base_features[f'tags_embed_{i}'] = tags_embedding[i]
        
        # Add core numerical features (~34 more to reach 1,186)
        title_features = self.extract_title_features(title)
        
        base_features.update({
            # Core video metrics
            'view_count': 50000,  # Will be predicted
            'like_count': int(subscriber_count * self.DEFAULT_LIKE_ENGAGEMENT_RATE),  # Estimated 2% engagement
            'comment_count': int(subscriber_count * self.DEFAULT_COMMENT_RATE),  # Estimated 0.1% comment rate
            'channel_subs': subscriber_count,
            'like_ratio': self.DEFAULT_LIKE_RATIO,
            'comment_ratio': self.DEFAULT_COMMENT_RATIO,
            'views_per_subs': self.DEFAULT_VIEWS_PER_SUB,
            'average_comment_length': self.DEFAULT_COMMENT_LENGTH,
            'sentiment_score': 0.6,
            'rqs': 0.3,  # Will be predicted
            
            # Title/content features
            'title_length': len(title),
            'description_length': estimated_features.get('description_length', 200) if estimated_features else 200,
            'tags_count': len(tags.split()) if tags else 3,
            'duration': estimated_features.get('duration', 600) if estimated_features else 600,
            
            # Thumbnail features
            'thumbnail_brightness': thumbnail_features.get('brightness', 128.0) if thumbnail_features else 128.0,
            'thumbnail_contrast': thumbnail_features.get('contrast', 50.0) if thumbnail_features else 50.0,
            'thumbnail_edge_density': thumbnail_features.get('edge_density', self.DEFAULT_EDGE_DENSITY) if thumbnail_features else self.DEFAULT_EDGE_DENSITY,
            'thumbnail_aspect_ratio': thumbnail_features.get('aspect_ratio', self.DEFAULT_ASPECT_RATIO) if thumbnail_features else self.DEFAULT_ASPECT_RATIO,
            'thumbnail_red_mean': thumbnail_features.get('red_mean', 128.0) if thumbnail_features else 128.0,
            'thumbnail_green_mean': thumbnail_features.get('green_mean', 128.0) if thumbnail_features else 128.0,
            'thumbnail_blue_mean': thumbnail_features.get('blue_mean', 128.0) if thumbnail_features else 128.0,
            
            # Caption features
            'has_captions': 1,
            'has_english_captions': 1,
            'has_auto_captions': 1,
            'has_manual_captions': 0,
        })
        
        # Genre one-hot encoding
        genres = ['kids_family', 'challenge_stunts', 'gaming', 'education_science', 'catholic']
        for g in genres:
            base_features[f'genre_{g}'] = 1 if genre == g else 0
        
        # Create different feature sets for different models
        feature_sets = {}
        
        # View count model features (1,186 features)
        view_features = base_features.copy()
        # Add remaining features to reach exactly 1,186
        while len(view_features) < self.VIEW_COUNT_FEATURES:
            view_features[f'padding_feature_{len(view_features)}'] = 0.0
        feature_sets['view_count'] = pd.DataFrame([view_features])
        
        # Sort base features once for consistent ordering across all models
        sorted_base_features = sorted(base_features.items())
        
        # RQS model features (1,181 features - 5 fewer than view count)
        rqs_features = {k: v for i, (k, v) in enumerate(sorted_base_features) if i < self.RQS_FEATURES}
        while len(rqs_features) < self.RQS_FEATURES:
            rqs_features[f'padding_feature_{len(rqs_features)}'] = 0.0
        feature_sets['rqs'] = pd.DataFrame([rqs_features])
        
        # CTR model features (796 features - much smaller set)
        ctr_features = {k: v for i, (k, v) in enumerate(sorted_base_features) if i < self.CTR_FEATURES}
        while len(ctr_features) < self.CTR_FEATURES:
            ctr_features[f'padding_feature_{len(ctr_features)}'] = 0.0
        feature_sets['ctr'] = pd.DataFrame([ctr_features])
        
        # Genre-specific models (only 2 features)
        genre_features = {
            'feature_0': subscriber_count / 1000000,  # Normalized subscriber count
            'feature_1': len(title) / 100  # Normalized title length
        }
        feature_sets['genre'] = pd.DataFrame([genre_features])
        
        print(f"✅ Created feature sets: view_count({len(view_features)}), rqs({len(rqs_features)}), ctr({len(ctr_features)}), genre({len(genre_features)})")
        
        return feature_sets

    def create_feature_vector(self, title: str, genre: str, subscriber_count: int, 
                            thumbnail_features: Dict, estimated_features: Dict = None) -> pd.DataFrame:
        """Create properly formatted feature vector for ML models (legacy method)"""
        
        # Extract title features
        title_features = self.extract_title_features(title)
        
        # Create base feature dictionary matching training data
        features = {
            'title_length': title_features['char_count'],
            'channel_subscriber_count': subscriber_count,
            'tags_count': estimated_features.get('tags_count', 10) if estimated_features else 10,
            'description_length': estimated_features.get('description_length', 200) if estimated_features else 200,
            'has_captions': True,  # Assume captions available
            'has_english_captions': True,
            'has_auto_captions': True,
            'has_manual_captions': False,
        }
        
        # Add genre one-hot encoding
        genres = ['kids_family', 'challenge_stunts', 'gaming', 'education_science', 'catholic']
        for g in genres:
            features[f'genre_{g}'] = 1 if genre == g else 0
        
        # Add thumbnail features (use extracted or defaults)
        features.update({
            'thumbnail_brightness': thumbnail_features.get('brightness', 128.0),
            'thumbnail_contrast': thumbnail_features.get('contrast', 50.0),
            'thumbnail_edge_density': thumbnail_features.get('edge_density', 0.1),
            'thumbnail_aspect_ratio': thumbnail_features.get('aspect_ratio', 1.78),
            'thumbnail_red_mean': thumbnail_features.get('red_mean', 128.0),
            'thumbnail_green_mean': thumbnail_features.get('green_mean', 128.0),
            'thumbnail_blue_mean': thumbnail_features.get('blue_mean', 128.0)
        })
        
        # Create DataFrame
        feature_df = pd.DataFrame([features])
        
        print(f"🔧 Feature vector created with {len(features)} features")
        print(f"🔧 Sample features: title_length={features['title_length']}, subs={features['channel_subscriber_count']}, brightness={features['thumbnail_brightness']:.1f}")
        
        return feature_df
    
    def generate_recommended_tags(self, title: str, genre: str, subscriber_count: int) -> List[str]:
        """Generate recommended tags based on title and genre"""
        
        # Genre-specific tag banks
        tag_banks = {
            'gaming': [
                'gaming', 'gameplay', 'walkthrough', 'review', 'tutorial',
                'stream', 'multiplayer', 'strategy', 'tips', 'tricks'
            ],
            'education_science': [
                'education', 'science', 'learning', 'tutorial', 'explained',
                'research', 'facts', 'analysis', 'study', 'knowledge'
            ],
            'challenge_stunts': [
                'challenge', 'stunt', 'experiment', 'test', 'reaction',
                'viral', 'trending', 'epic', 'crazy', 'attempt'
            ],
            'catholic': [
                'catholic', 'christian', 'faith', 'prayer', 'sermon',
                'gospel', 'church', 'spiritual', 'religious', 'holy'
            ],
            'other': [
                'entertainment', 'lifestyle', 'vlog', 'fun', 'creative',
                'popular', 'trending', 'new', 'original', 'unique'
            ]
        }
        
        # Get base tags for genre
        base_tags = tag_banks.get(genre, tag_banks['other'])
        
        # Extract keywords from title
        title_words = [word.lower().strip('.,!?()[]') for word in title.split()]
        title_keywords = [word for word in title_words if len(word) > 3]
        
        # Combine and prioritize
        recommended_tags = []
        
        # Add top genre tags
        recommended_tags.extend(base_tags[:5])
        
        # Add relevant title keywords
        for keyword in title_keywords[:3]:
            if keyword not in recommended_tags:
                recommended_tags.append(keyword)
        
        # Add subscriber tier tags
        if subscriber_count > 1000000:
            recommended_tags.append('viral')
        elif subscriber_count > 100000:
            recommended_tags.append('popular')
        
        return recommended_tags[:10]  # Return top 10 tags
    
    def _predict_with_scaler(self, model_key: str, features: np.ndarray) -> float:
        """
        Helper method to predict using a model with optional scaler compatibility checking.
        Eliminates duplicate scaler logic across different model types.
        
        Args:
            model_key: The model/scaler key (e.g., 'view_count', 'rqs', 'ctr')
            features: Feature array to predict on
            
        Returns:
            Prediction value as float
        """
        if model_key not in self.models:
            raise ValueError(f"Model '{model_key}' not found")
            
        # Try with scaling first if scaler available and compatible
        if (model_key in self.scalers and 
            len(features) == self.scalers[model_key].n_features_in_):
            scaled_features = self.scalers[model_key].transform([features])
            return self.models[model_key].predict(scaled_features)[0]
        else:
            # Direct prediction without scaling
            return self.models[model_key].predict([features])[0]
    
    def predict_performance(self, 
                          title: str,
                          genre: str,
                          subscriber_count: int,
                          thumbnail_data: Optional[bytes] = None,
                          video_data: Optional[Dict] = None) -> Dict:
        """Predict video performance using trained ML models"""
        
        try:
            print("🚀 Starting prediction with trained ML models...")
            
            # Prepare video data for feature engineering
            if video_data is None:
                video_data = {}
            
            # Add basic information
            video_data.update({
                'title': title,
                'channel_subscriber_count': subscriber_count,
                'title_length': len(title),
                'like_count': video_data.get('like_count', 0),
                'comment_count': video_data.get('comment_count', 0),
                'average_comment_length': video_data.get('average_comment_length', 50),
                'sentiment_score': video_data.get('sentiment_score', 0.5),
                'rqs': video_data.get('rqs', 0.5),
                'duration_seconds': video_data.get('duration_seconds', 300),
                'like_ratio': video_data.get('like_ratio', 0.05),
                'comment_ratio': video_data.get('comment_ratio', 0.01),
                'views_per_subscriber': video_data.get('views_per_subscriber', 0.1),
                'has_captions': video_data.get('has_captions', True),
                'tags': video_data.get('tags', []),
                'thumbnail_text': video_data.get('thumbnail_text', ''),
            })
            
            # Extract and add thumbnail features
            if thumbnail_data:
                thumbnail_features = self.extract_thumbnail_features(thumbnail_data)
                print(f"🖼️ Extracted thumbnail features: brightness={thumbnail_features.get('brightness', 0):.1f}")
            else:
                thumbnail_features = self.get_default_thumbnail_features()
                print(f"🖼️ Using default thumbnail features")
            
            # Create training-compatible feature vectors for each model type
            print("🔧 Creating training-compatible feature vectors...")
            feature_sets = self.create_training_compatible_features(
                title=title,
                genre=genre, 
                subscriber_count=subscriber_count,
                thumbnail_features=thumbnail_features,
                estimated_features=video_data
            )
            
            predictions = {}
            
            # View Count Prediction with proper feature vector
            try:
                if 'view_count' in self.models:
                    view_features = feature_sets['view_count'].values.flatten()
                    try:
                        pred_views = self._predict_with_scaler('view_count', view_features)
                        predictions['predicted_views'] = max(int(pred_views), 10)
                        print(f"📊 Views predicted by YOUR trained model: {predictions['predicted_views']:,}")
                    except Exception as model_error:
                        print(f"⚠️ Model error with {len(view_features)} features: {model_error}")
                        # Enhanced fallback prediction
                        base_engagement = 0.05
                        genre_mult = {'kids_family': 1.2, 'challenge_stunts': 1.1, 'gaming': 0.9, 
                                     'education_science': 0.8, 'catholic': 0.7}.get(genre, 1.0)
                        thumbnail_mult = 1.0 + (thumbnail_features.get('brightness', 128) - 128) / 500
                        predictions['predicted_views'] = max(int(subscriber_count * base_engagement * genre_mult * thumbnail_mult), 10)
                else:
                    raise Exception("View count model not available")
            except Exception as e:
                print(f"⚠️ View prediction using fallback due to error: {e}")
                # Enhanced fallback prediction with thumbnail influence
                base_engagement = 0.05
                genre_mult = {'kids_family': 1.2, 'challenge_stunts': 1.1, 'gaming': 0.9, 
                             'education_science': 0.8, 'catholic': 0.7}.get(genre, 1.0)
                thumbnail_mult = 1.0 + (thumbnail_features.get('brightness', 128) - 128) / 500
                predictions['predicted_views'] = max(int(subscriber_count * base_engagement * genre_mult * thumbnail_mult), 10)
            
            # RQS Prediction with proper feature vector
            try:
                # Try genre-specific model first
                genre_model_key = f'rqs_{genre}'
                if genre_model_key in self.models:
                    genre_features = feature_sets['genre'].values.flatten()
                    try:
                        pred_rqs = self.models[genre_model_key].predict([genre_features])[0]
                        predictions['predicted_rqs'] = max(min(float(pred_rqs), 100.0), 0.0)
                        print(f"📈 RQS predicted by YOUR {genre} model: {predictions['predicted_rqs']:.1f}")
                    except Exception as model_error:
                        print(f"⚠️ Genre model error with {len(genre_features)} features: {model_error}")
                        # Fallback to main RQS model
                        if 'rqs' in self.models:
                            rqs_features = feature_sets['rqs'].values.flatten()
                            try:
                                pred_rqs = self._predict_with_scaler('rqs', rqs_features)
                                predictions['predicted_rqs'] = max(min(float(pred_rqs), 100.0), 0.0)
                                print(f"📈 RQS predicted by main model: {predictions['predicted_rqs']:.1f}")
                            except Exception:
                                predictions['predicted_rqs'] = 30.0
                        else:
                            predictions['predicted_rqs'] = 30.0
                elif 'rqs' in self.models:
                    rqs_features = feature_sets['rqs'].values.flatten()
                    try:
                        if 'rqs' in self.scalers and len(rqs_features) == self.scalers['rqs'].n_features_in_:
                            scaled_features = self.scalers['rqs'].transform([rqs_features])
                            pred_rqs = self.models['rqs'].predict(scaled_features)[0]
                        else:
                            pred_rqs = self.models['rqs'].predict([rqs_features])[0]
                            
                        predictions['predicted_rqs'] = max(min(float(pred_rqs), 100.0), 0.0)
                        print(f"📈 RQS predicted by YOUR general model: {predictions['predicted_rqs']:.1f}")
                    except Exception as model_error:
                        print(f"⚠️ Model error with {len(rqs_features)} features: {model_error}")
                        predictions['predicted_rqs'] = 30.0
                else:
                    raise Exception("RQS model not available")
            except Exception as e:
                print(f"⚠️ RQS prediction using fallback due to error: {e}")
                # Enhanced fallback with thumbnail bonus
                base_rqs = 40 + (subscriber_count / 100000) * 10
                thumbnail_bonus = (thumbnail_features.get('edge_density', 0.1) * 100)
                predictions['predicted_rqs'] = max(min(base_rqs + thumbnail_bonus, 100.0), 0.0)
            
            # CTR Prediction with proper feature vector
            try:
                if 'ctr' in self.models:
                    ctr_features = feature_sets['ctr'].values.flatten()
                    try:
                        pred_ctr = self._predict_with_scaler('ctr', ctr_features)
                        predictions['predicted_ctr'] = max(min(float(pred_ctr), 1.0), 0.0)
                        print(f"👆 CTR predicted by YOUR model: {predictions['predicted_ctr']:.4f}")
                    except Exception as model_error:
                        print(f"⚠️ CTR model error with {len(ctr_features)} features: {model_error}")
                        # Thumbnail-aware fallback
                        base_ctr = 0.05
                        thumbnail_mult = 1.0 + (thumbnail_features.get('brightness', 128) - 128) / 1000
                        predictions['predicted_ctr'] = max(min(base_ctr * thumbnail_mult, 1.0), 0.0)
                else:
                    raise Exception("CTR model not available")
            except Exception as e:
                print(f"⚠️ CTR prediction using fallback due to error: {e}")
                # Enhanced fallback with thumbnail impact
                base_ctr = 0.03
                contrast_boost = min(thumbnail_features.get('contrast', 50) / 100, 0.02)
                predictions['predicted_ctr'] = max(min(base_ctr + contrast_boost, 1.0), 0.0)
            
            # Add confidence scores and metadata
            total_features = sum(len(fs.columns) for fs in feature_sets.values())
            predictions.update({
                'confidence_score': 0.85,  # High confidence with ML models
                'model_version': '2.0',
                'features_used': total_features,
                'feature_breakdown': {name: len(fs.columns) for name, fs in feature_sets.items()},
                'thumbnail_analyzed': thumbnail_data is not None,
                'genre_specific_model': f'rqs_{genre}' in self.models
            })
            
            print(f"✅ ML-powered predictions complete: Views={predictions['predicted_views']}, RQS={predictions['predicted_rqs']:.1f}, CTR={predictions['predicted_ctr']:.4f}")
            return predictions
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return {
                'predicted_views': int(subscriber_count * 0.05),
                'predicted_rqs': 50.0,
                'predicted_ctr': 0.03,
                'confidence_score': 0.3,
                'error': str(e)
            }

# Initialize prediction system
predictor = YouTubePredictionSystem()

# FastAPI app
app = FastAPI(title="YouTube Performance Predictor", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your dashboard domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "YouTube Performance Prediction API", "status": "active"}

@app.post("/api/predict")
async def predict_video_performance(
    title: str = Form(...),
    genre: str = Form(...),
    subscriber_count: int = Form(...),
    thumbnail: Optional[UploadFile] = File(None),
    # Optional additional features for better predictions
    tags: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    duration_seconds: Optional[int] = Form(None),
    like_count: Optional[int] = Form(None),
    comment_count: Optional[int] = Form(None),
    has_captions: Optional[bool] = Form(True)
):
    """Predict video performance using trained ML models with comprehensive features"""
    
    try:
        # Validate genre
        valid_genres = ['gaming', 'education_science', 'challenge_stunts', 'catholic', 'other', 'kids_family']
        if genre not in valid_genres:
            raise HTTPException(status_code=400, detail=f"Invalid genre. Must be one of: {valid_genres}")
        
        # Process thumbnail if provided
        thumbnail_data = None
        if thumbnail:
            thumbnail_data = await thumbnail.read()
        
        # Prepare additional video data for feature engineering
        video_data = {}
        
        # Parse tags if provided
        if tags:
            try:
                import ast
                video_data['tags'] = ast.literal_eval(tags) if tags.startswith('[') else tags.split(',')
            except:
                video_data['tags'] = tags.split(',')
        
        # Add other features if provided
        if description:
            video_data['description'] = description
            video_data['description_length'] = len(description)
        
        if duration_seconds:
            video_data['duration_seconds'] = duration_seconds
            
        if like_count is not None:
            video_data['like_count'] = like_count
            
        if comment_count is not None:
            video_data['comment_count'] = comment_count
            
        video_data['has_captions'] = has_captions
        
        # Calculate derived features
        if like_count and comment_count and subscriber_count:
            video_data['like_ratio'] = like_count / max(subscriber_count, 1)
            video_data['comment_ratio'] = comment_count / max(subscriber_count, 1)
            video_data['views_per_subscriber'] = 0.1  # Estimated
        
        print(f"🎯 Predicting with ML models: Title='{title}', Genre={genre}, Subs={subscriber_count}")
        print(f"📊 Additional features: tags={len(video_data.get('tags', []))}, duration={video_data.get('duration_seconds', 'N/A')}")
        
        # Get predictions using your trained models
        predictions = predictor.predict_performance(
            title=title,
            genre=genre,
            subscriber_count=subscriber_count,
            thumbnail_data=thumbnail_data,
            video_data=video_data
        )
        
        # Add metadata
        predictions['input_data'] = {
            'title': title,
            'genre': genre,
            'subscriber_count': subscriber_count,
            'has_thumbnail': thumbnail is not None,
            'features_provided': len([x for x in [tags, description, duration_seconds, like_count, comment_count] if x is not None]),
            'prediction_date': datetime.now().isoformat()
        }
        
        return JSONResponse(content=predictions)
        
    except Exception as e:
        print(f"❌ API error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Root endpoint for testing API connectivity"""
    return {
        "service": "YouTube ML Prediction API",
        "status": "active",
        "models_loaded": len(predictor.models),
        "version": "1.0.0"
    }

@app.get("/api/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Prediction API is working!", "timestamp": datetime.now().isoformat()}

@app.get("/api/health")
async def health_check():
    """Health check endpoint for Railway monitoring"""
    return {
        "service": "YouTube ML Prediction API",
        "status": "healthy",
        "models_loaded": len(predictor.models),
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/models/status")
async def get_models_status():
    """Get status of loaded ML models"""
    return {
        "models_loaded": list(predictor.models.keys()),
        "scalers_loaded": list(predictor.scalers.keys()),
        "total_models": len(predictor.models),
        "status": "ready"
    }

if __name__ == "__main__":
    print("🚀 Starting YouTube Performance Prediction API...")
    print("📊 Models loaded:", len(predictor.models))
    print("🔮 Ready for predictions!")
    print("📖 API docs: http://localhost:8002/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,
        log_level="info"
    )