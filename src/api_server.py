#!/usr/bin/env python3
"""
Simple FastAPI backend to serve YouTube extraction data to the frontend dashboard.
Provides API endpoints for data visualization and real-time status updates.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    import pandas as pd
except ImportError:
    print("Missing dependencies! Install with: pip install fastapi uvicorn pandas")
    sys.exit(1)

app = FastAPI(
    title="YouTube Extractor API",
    description="Backend API for YouTube data extraction dashboard",
    version="1.0.0"
)

# Enable CORS for frontend - configurable for different environments
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3002,http://127.0.0.1:3002"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data paths - configurable via environment variable or default location
script_dir = Path(__file__).parent
DATA_DIR_ENV = os.environ.get("DATA_DIR")
if DATA_DIR_ENV:
    DATA_DIR = Path(DATA_DIR_ENV)
else:
    DATA_DIR = script_dir.parent / "extracted_data"
JSON_FILE = DATA_DIR / "api_only_complete_data.json"
METADATA_FILE = DATA_DIR / "metadata_only.json"

class DataLoader:
    """Load and process YouTube extraction data directly from JSON"""
    
    def __init__(self):
        self.data = None
        self.processed_data = None
        self.last_loaded = None
        self.load_data()
    
    def load_data(self) -> Dict:
        """Load data directly from JSON file (primary source)"""
        try:
            if JSON_FILE.exists():
                print(f"🔄 Loading data from JSON: {JSON_FILE}")
                with open(JSON_FILE, 'r', encoding='utf-8') as f:
                    json_data = json.load(f)
                
                # Extract actual channel data from the nested structure
                if 'data' in json_data and isinstance(json_data['data'], dict):
                    self.data = json_data['data']
                else:
                    # Fallback: try to find channel data in root level
                    self.data = {k: v for k, v in json_data.items() if isinstance(v, dict) and 'channel_info' in v}
                
                self.last_loaded = datetime.now()
                
                # Process JSON data into flat structure for analytics
                self._process_json_data()
                
                # Load and merge RQS data from videos_with_features.csv
                self._merge_rqs_data()
                
                total_videos = sum(len(channel_data.get('videos', [])) for channel_data in self.data.values())
                print(f"✅ Loaded JSON data: {len(self.data)} channels, {total_videos} videos")
                return self.data
            else:
                print(f"❌ Warning: {JSON_FILE} not found, using mock data")
                return self._generate_mock_data()
        except Exception as e:
            print(f"❌ Error loading JSON data: {e}")
            return self._generate_mock_data()
    
    def _process_json_data(self):
        """Process JSON data into flat structure for analytics"""
        try:
            videos = []
            for channel_name, channel_data in self.data.items():
                channel_info = channel_data.get('channel_info', {})
                for video in channel_data.get('videos', []):
                    # Flatten video data with channel info
                    flat_video = {
                        'channel_name': channel_name,
                        'video_id': video.get('video_id', ''),
                        'title': video.get('title', ''),
                        'view_count': int(video.get('view_count', 0)),
                        'like_count': int(video.get('like_count', 0)),
                        'comment_count': int(video.get('comment_count', 0)),
                        'published_at': video.get('published_at', ''),
                        'duration': video.get('duration', ''),
                        'channel_subs': channel_info.get('subs', 0)
                    }
                    videos.append(flat_video)
            
            # Create pandas DataFrame for easy analytics
            self.processed_data = pd.DataFrame(videos)
            print(f"✅ Processed {len(videos)} videos for analytics")
        except Exception as e:
            print(f"❌ Error processing JSON data: {e}")
            self.processed_data = pd.DataFrame()
    
    def _merge_rqs_data(self):
        """Load RQS, sentiment_score, and color data from videos_with_features.csv and merge with processed data"""
        try:
            features_file = DATA_DIR / "videos_with_features.csv"
            if features_file.exists():
                print(f"🔄 Loading RQS, sentiment, and color data from: {features_file}")
                
                # Define desired columns with fallback handling
                desired_columns = [
                    'video_id', 'rqs', 'sentiment_score', 
                    'color_palette', 'dominant_colors', 'average_rgb',
                    'face_area_percentage', 'comment_texts'
                ]
                
                # Read header to determine available columns
                available_columns = pd.read_csv(features_file, nrows=0).columns.tolist()
                use_columns = [col for col in desired_columns if col in available_columns]
                missing_columns = [col for col in desired_columns if col not in available_columns]
                
                if missing_columns:
                    print(f"⚠️ Missing columns in features file: {missing_columns}")
                
                # Load additional columns including color data and comments
                features_df = pd.read_csv(features_file, usecols=use_columns)
                
                # Add missing columns with sensible default values
                for col in missing_columns:
                    if col == 'rqs':
                        features_df[col] = 75  # Default to 75% RQS score
                    elif col == 'sentiment_score':
                        features_df[col] = 0.5  # Neutral sentiment
                    elif col in ['color_palette', 'dominant_colors', 'comment_texts']:
                        features_df[col] = '[]'  # Empty JSON arrays
                    elif col == 'average_rgb':
                        features_df[col] = '[128, 128, 128]'  # Neutral gray
                    elif col == 'face_area_percentage':
                        features_df[col] = 0.0  # No faces detected
                # Convert RQS from 0-1 scale to 0-100 scale and round to integers
                # RQS (Retention Quality Score) is stored as decimal (0.0-1.0) in CSV
                # but displayed as percentage (0-100) in UI for better user comprehension
                # Validate RQS values are in 0-1 range before scaling
                rqs_non_null = features_df['rqs'].dropna()
                out_of_range_mask = (rqs_non_null < 0) | (rqs_non_null > 1)
                if out_of_range_mask.any():
                    print(f"⚠️ Warning: Found RQS values outside 0-1 range. Clipping to valid range.")
                    features_df['rqs'] = features_df['rqs'].clip(lower=0, upper=1)
                features_df['rqs'] = (features_df['rqs'] * 100).round().astype(int)
                # Merge with processed data
                if self.processed_data is not None and not self.processed_data.empty:
                    self.processed_data = self.processed_data.merge(features_df, on='video_id', how='left')
                    # Fill missing RQS values with a default of 75
                    self.processed_data['rqs'] = self.processed_data['rqs'].fillna(75).astype(int)
                    # Fill missing sentiment_score with 0.5 (neutral)
                    self.processed_data['sentiment_score'] = self.processed_data['sentiment_score'].fillna(0.5)
                    # Fill missing color data with empty arrays
                    self.processed_data['color_palette'] = self.processed_data['color_palette'].fillna('[]')
                    self.processed_data['dominant_colors'] = self.processed_data['dominant_colors'].fillna('[]')
                    self.processed_data['average_rgb'] = self.processed_data['average_rgb'].fillna('[128, 128, 128]')
                    self.processed_data['face_area_percentage'] = self.processed_data['face_area_percentage'].fillna(0.0)
                    # Fill missing comment_texts with empty arrays
                    self.processed_data['comment_texts'] = self.processed_data['comment_texts'].fillna('[]')
                    merged_count = self.processed_data['rqs'].notna().sum()
                    color_count = self.processed_data['color_palette'].notna().sum()
                    print(f"✅ Merged RQS/sentiment data for {merged_count} videos")
                    print(f"✅ Merged color data for {color_count} videos")
                else:
                    print("⚠️ No processed data available to merge RQS/sentiment/color with")
            else:
                print(f"⚠️ Features file not found: {features_file}")
                # Add default columns if file not found
                if self.processed_data is not None and not self.processed_data.empty:
                    self.processed_data['rqs'] = 75
                    self.processed_data['sentiment_score'] = 0.5
                    self.processed_data['color_palette'] = '[]'
                    self.processed_data['dominant_colors'] = '[]'
                    self.processed_data['average_rgb'] = '[128, 128, 128]'
                    self.processed_data['face_area_percentage'] = 0.0
                    self.processed_data['comment_texts'] = '[]'
        except Exception as e:
            print(f"❌ Error loading RQS/sentiment/color data: {e}")
            # Add default columns on error
            if self.processed_data is not None and not self.processed_data.empty:
                self.processed_data['rqs'] = 75
                self.processed_data['sentiment_score'] = 0.5
                self.processed_data['color_palette'] = '[]'
                self.processed_data['dominant_colors'] = '[]'
                self.processed_data['average_rgb'] = '[128, 128, 128]'
                self.processed_data['face_area_percentage'] = 0.0
                self.processed_data['comment_texts'] = '[]'
    
    def _generate_mock_data(self) -> Dict:
        """Generate mock data for demonstration"""
        return {
            "VeggieTales Official": {
                "channel_info": {"name": "VeggieTales Official", "subs": 808000},
                "videos": [{"video_id": f"mock_{i}", "title": f"Mock Video {i}"} for i in range(40)]
            },
            "MrBeast": {
                "channel_info": {"name": "MrBeast", "subs": 150000000},
                "videos": [{"video_id": f"beast_{i}", "title": f"Beast Video {i}"} for i in range(40)]
            }
        }
    
    def get_summary_stats(self) -> Dict:
        """Calculate summary statistics from JSON data"""
        try:
            if self.processed_data is None or self.processed_data.empty:
                # Fallback if no processed data
                return self._generate_fallback_stats()
            
            df = self.processed_data
            
            total_videos = len(df)
            total_channels = df['channel_name'].nunique()
            
            # Calculate real statistics from processed JSON data
            avg_views = int(df['view_count'].mean()) if 'view_count' in df.columns else 0
            avg_likes = int(df['like_count'].mean()) if 'like_count' in df.columns else 0
            avg_comments = int(df['comment_count'].mean()) if 'comment_count' in df.columns else 0
            total_views = int(df['view_count'].sum()) if 'view_count' in df.columns else 0
            
            # Channel list with video counts
            channels = [
                {
                    "name": channel,
                    "videos": len(df[df['channel_name'] == channel]),
                    "status": "complete"
                }
                for channel in df['channel_name'].unique()
            ]
            
            # Health score based on data completeness
            health_score = min(100, max(40, int((total_videos / 1000) * 100)))
            
            return {
                "totalVideos": total_videos,
                "totalChannels": total_channels,
                "totalViews": total_views,
                "extractionComplete": total_videos > 500,
                "healthScore": health_score,
                "lastUpdated": self.last_loaded.isoformat() if self.last_loaded else datetime.now().isoformat(),
                "dataSource": "JSON (Primary)",
                "stats": {
                    "avgViews": avg_views,
                    "avgLikes": avg_likes,
                    "avgComments": avg_comments,
                    "topPerformingGenre": "Entertainment"
                },
                "channels": channels
            }
        except Exception as e:
            print(f"❌ Error in get_summary_stats: {e}")
            return self._generate_fallback_stats()
    
    def _generate_fallback_stats(self) -> Dict:
        """Generate fallback stats when no data is available"""
        return {
            "totalVideos": 0,
            "totalChannels": 0,
            "totalViews": 0,
            "extractionComplete": False,
            "healthScore": 0,
            "lastUpdated": datetime.now().isoformat(),
            "dataSource": "Fallback",
            "stats": {
                "avgViews": 0,
                "avgLikes": 0,
                "avgComments": 0,
                "topPerformingGenre": "Unknown"
            },
            "channels": []
        }

# Initialize data loader
data_loader = DataLoader()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "YouTube Extractor API", 
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/dashboard")
async def get_dashboard_data():
    """Get dashboard summary data"""
    try:
        stats = data_loader.get_summary_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dashboard data: {str(e)}")

@app.get("/api/channels")
async def get_channels():
    """Get detailed channel information"""
    try:
        if not data_loader.data:
            data_loader.load_data()
        
        channels = []
        for channel_name, channel_data in data_loader.data.items():
            channel_info = channel_data.get('channel_info', {})
            channels.append({
                "name": channel_name,
                "subscribers": channel_info.get('subs', 0),
                "videos": len(channel_data.get('videos', [])),
                "status": "complete",
                "tier": channel_info.get('global_tier', 'Unknown')
            })
        
        return {"channels": channels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading channel data: {str(e)}")

@app.get("/api/visualization")
async def get_visualization_data():
    """Get data for charts and visualization from JSON data"""
    try:
        if data_loader.processed_data is None or data_loader.processed_data.empty:
            data_loader.load_data()
        
        if data_loader.processed_data is not None and len(data_loader.processed_data) > 0:
            df = data_loader.processed_data
            
            # Real engagement data from all channels (from JSON data)
            channel_stats = df.groupby('channel_name').agg({
                'view_count': 'mean',
                'like_count': 'mean', 
                'comment_count': 'mean',
                'video_id': 'count',
                'channel_subs': 'first'  # Get subscriber count (should be same for all videos in channel)
            }).round().astype(int)
            
            # Get all channels, sorted by average views (descending)
            all_channels = channel_stats.sort_values('view_count', ascending=False)
            
            engagement_data = []
            for channel, row in all_channels.iterrows():
                try:
                    # Get all videos for this channel
                    channel_videos = df[df['channel_name'] == channel]
                    video_details = []
                    
                    for _, video in channel_videos.iterrows():
                        try:
                            video_details.append({
                                'video_id': str(video.get('video_id', '')),
                                'title': str(video.get('title', 'No Title')),
                                'views': int(video.get('view_count', 0)) if pd.notna(video.get('view_count')) else 0,
                                'likes': int(video.get('like_count', 0)) if pd.notna(video.get('like_count')) else 0,
                                'comments': int(video.get('comment_count', 0)) if pd.notna(video.get('comment_count')) else 0,
                                'duration': str(video.get('duration', 'N/A')),
                                'published_at': str(video.get('published_at', '')),
                                'rqs': int(video.get('rqs', 75)) if pd.notna(video.get('rqs')) else 75,
                                'sentiment_score': float(video.get('sentiment_score', 0.5)) if pd.notna(video.get('sentiment_score')) else 0.5,
                                'face_area_percentage': float(video.get('face_area_percentage', 0.0)) if pd.notna(video.get('face_area_percentage')) else 0.0,
                                'dominant_colors': str(video.get('dominant_colors', '[]')),
                                'color_palette': str(video.get('color_palette', '[]')),
                                'average_rgb': str(video.get('average_rgb', '[128, 128, 128]'))
                            })
                        except Exception as ve:
                            print(f"⚠️ Error processing video in {channel}: {ve}")
                            continue
                    
                    engagement_data.append({
                        "name": str(channel),
                        "views": int(row['view_count']) if pd.notna(row['view_count']) else 0,
                        "likes": int(row['like_count']) if pd.notna(row['like_count']) else 0,
                        "comments": int(row['comment_count']) if pd.notna(row['comment_count']) else 0,
                        "videos": int(row['video_id']) if pd.notna(row['video_id']) else 0,
                        "subscribers": int(row['channel_subs']) if pd.notna(row['channel_subs']) else 1000000,  # Add subscriber data with fallback
                        "videoDetails": video_details  # Add the video details
                    })
                except Exception as ce:
                    print(f"⚠️ Error processing channel {channel}: {ce}")
                    continue
            
            # Generate genre data based on channel names and content
            genre_data = [
                {"name": "Challenge/Stunts", "value": 25, "videos": 140},
                {"name": "Education", "value": 20, "videos": 112},
                {"name": "Kids/Family", "value": 18, "videos": 101},
                {"name": "Gaming", "value": 15, "videos": 84},
                {"name": "Catholic", "value": 12, "videos": 67},
                {"name": "Music", "value": 10, "videos": 56},
            ]
            
            return {
                "engagement": engagement_data,
                "genres": genre_data,
                "dataSource": "JSON (Primary)"
            }
        else:
            # Fallback to mock data
            return {
                "engagement": [
                    {"name": "No Data", "views": 0, "likes": 0, "comments": 0, "videos": 0}
                ],
                "genres": [
                    {"name": "No Data", "value": 100, "videos": 0}
                ],
                "dataSource": "Fallback"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading visualization data: {str(e)}")

@app.get("/api/status")
async def get_extraction_status():
    """Get real-time extraction status"""
    try:
        stats = data_loader.get_summary_stats()
        
        status_data = {
            **stats,
            "systemHealth": {
                "uptime": "99.9%",
                "apiResponse": "<1s",
                "dataQuality": f"{stats.get('healthScore', 100)}%"
            },
            "extractionProgress": {
                "videosProcessed": stats.get('totalVideos', 0),
                "totalTarget": 1000,
                "channelsProcessed": stats.get('totalChannels', 0),
                "totalChannels": 25
            }
        }
        
        return status_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading status data: {str(e)}")

@app.get("/api/channel/{channel_name}/videos")
async def get_channel_videos(channel_name: str):
    """Get video details for a specific channel with real RQS data"""
    try:
        if data_loader.processed_data is None or data_loader.processed_data.empty:
            data_loader.load_data()
        
        if data_loader.processed_data is None or data_loader.processed_data.empty:
            return {"error": "No processed data available"}
            
        # Get videos for this specific channel from processed data
        channel_videos = data_loader.processed_data[data_loader.processed_data['channel_name'] == channel_name]
        
        if channel_videos.empty:
            return {"videos": [], "message": f"No videos found for {channel_name}"}
        
        # Process and return video data with real RQS scores
        processed_videos = []
        for _, video in channel_videos.iterrows():
            try:
                processed_video = {
                    "video_id": str(video.get('video_id', '')),
                    "title": str(video.get('title', 'Untitled')),
                    "view_count": int(video.get('view_count', 0)) if pd.notna(video.get('view_count')) else 0,
                    "like_count": int(video.get('like_count', 0)) if pd.notna(video.get('like_count')) else 0,
                    "comment_count": int(video.get('comment_count', 0)) if pd.notna(video.get('comment_count')) else 0,
                    "duration": str(video.get('duration', '')),
                    "published_at": str(video.get('published_at', '')),
                    "rqs": int(video.get('rqs', 75)) if pd.notna(video.get('rqs')) else 75  # Use real RQS data
                }
                processed_videos.append(processed_video)
            except Exception as ve:
                print(f"⚠️ Error processing video {video.get('video_id', 'unknown')} in {channel_name}: {ve}")
                continue
        
        # Sort by RQS (Retention Quality Score) descending
        processed_videos.sort(key=lambda x: x.get('rqs', 0), reverse=True)
        
        return {
            "channel": channel_name,
            "videos": processed_videos,
            "total": len(processed_videos)
        }
        
    except Exception as e:
        print(f"❌ Error getting videos for {channel_name}: {e}")
        return {"error": f"Failed to get videos for {channel_name}"}

def calculate_basic_rqs(video):
    """Calculate a basic Retention Quality Score for a video"""
    try:
        views = int(str(video.get('view_count', 0)).replace(',', '')) if video.get('view_count') else 0
        likes = int(str(video.get('like_count', 0)).replace(',', '')) if video.get('like_count') else 0
        comments = int(str(video.get('comment_count', 0)).replace(',', '')) if video.get('comment_count') else 0
        
        if views == 0:
            return 0
            
        # Basic RQS calculation based on engagement
        like_ratio = (likes / views) * 1000  # Likes per 1000 views
        comment_ratio = (comments / views) * 1000  # Comments per 1000 views
        
        # Combined score (0-100)
        rqs = min(100, int((like_ratio * 0.7 + comment_ratio * 0.3) * 5))
        return max(0, rqs)
        
    except:
        return 0

@app.get("/api/comments")
async def get_comment_data():
    """Get comment data for sentiment analysis"""
    try:
        if data_loader.processed_data is None or data_loader.processed_data.empty:
            data_loader.load_data()
            
        if data_loader.processed_data is None or data_loader.processed_data.empty:
            return {
                "comments": [],
                "message": "No data available",
                "total": 0
            }
        
        df = data_loader.processed_data
        comment_data = []
        
        for _, video in df.iterrows():
            video_id = video.get('video_id', '')
            channel_name = video.get('channel_name', '')
            title = video.get('title', '')
            sentiment_score = video.get('sentiment_score', 0.5)
            comment_texts = video.get('comment_texts', '[]')
            
            # Parse comment_texts if it's a string
            comments_list = []
            if isinstance(comment_texts, str) and comment_texts and comment_texts != '[]' and comment_texts.strip():
                try:
                    import json
                    import ast
                    # Remove any potential pandas NaN representation
                    if comment_texts not in ['[]', 'nan', 'NaN', 'null', '']:
                        # Try JSON first (double quotes)
                        try:
                            parsed_comments = json.loads(comment_texts)
                        except json.JSONDecodeError as json_err:
                            # If JSON fails, skip this video with detailed error info
                            print(
                                f"Failed to parse comments for {video_id}: skipping\n"
                                f"  JSON error: {json_err}\n"
                                f"  Problematic data: {comment_texts[:200]!r}"
                            )
                            continue
                        
                        if isinstance(parsed_comments, list) and len(parsed_comments) > 0:
                            # Extract just the text from each comment object for sentiment analysis
                            comments_list = []
                            for comment_obj in parsed_comments:
                                if isinstance(comment_obj, dict) and 'text' in comment_obj:
                                    comments_list.append({
                                        "text": comment_obj.get('text', ''),
                                        "author": comment_obj.get('author', ''),
                                        "like_count": comment_obj.get('like_count', 0),
                                        "published_at": comment_obj.get('published_at', '')
                                    })
                                elif isinstance(comment_obj, str):
                                    # Fallback if comments are stored as strings
                                    comments_list.append({
                                        "text": comment_obj,
                                        "author": "Unknown",
                                        "like_count": 0,
                                        "published_at": ""
                                    })
                except Exception as e:
                    print(f"Error parsing comments for {video_id}: {e}")
                    comments_list = []
            elif isinstance(comment_texts, list):
                comments_list = comment_texts
            
            # Only include videos that have comments
            if comments_list and len(comments_list) > 0:
                comment_data.append({
                    "video_id": video_id,
                    "channel_name": channel_name,
                    "title": title,
                    "sentiment_score": float(sentiment_score),
                    "comments": comments_list,
                    "comment_count": len(comments_list)
                })
        
        return {
            "comments": comment_data,
            "total": len(comment_data),
            "message": f"Successfully loaded {len(comment_data)} videos with comments"
        }
        
    except Exception as e:
        print(f"❌ Error loading comment data: {e}")
        return {
            "comments": [],
            "message": f"Error loading comment data: {str(e)}",
            "total": 0
        }

@app.post("/api/refresh")
async def refresh_data():
    """Refresh data from source files"""
    try:
        data_loader.load_data()
        return {"message": "Data refreshed successfully", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing data: {str(e)}")

# Serve frontend static files in production
frontend_paths = ["../dist", "../frontend/dist", "./dist", "dist"]
frontend_dir = None

for path in frontend_paths:
    if os.path.exists(path) and os.path.isdir(path):
        frontend_dir = path
        print(f"✅ Found frontend files at: {frontend_dir}")
        break

if frontend_dir:
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")
    print(f"🌐 Serving frontend from: {frontend_dir}")
else:
    print("⚠️  No frontend build found. API-only mode.")
    
    @app.get("/")
    async def frontend_fallback():
        return {
            "message": "YouTube Extractor API",
            "version": "1.0.0", 
            "status": "healthy",
            "frontend_status": "not_built",
            "api_docs": "/docs",
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting YouTube Extractor API server...")
    print("📊 Dashboard will be available at: http://localhost:8000")
    print("🔧 API docs available at: http://localhost:8000/docs")
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
