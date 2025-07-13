#!/usr/bin/env python3
"""
Corrected YouTube Data Extractor
API-only approach for public videos (no transcript download via API)
Focus: Reliable data extraction with realistic expectations
"""

import os
import json
import csv
import logging
from datetime import datetime
from typing import Dict, List, Optional
import requests
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import time
import random
from dotenv import load_dotenv

load_dotenv()
PROGRESS_FILE = "extracted_data/progress_tracker.json"

class CorrectedDataExtractor:
    """
    Corrected data extraction system - API-only for public videos
    No transcript download (requires video ownership)
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.youtube = build('youtube', 'v3', developerKey=api_key)
        self.setup_logging()
        
        # Track extraction progress
        self.quota_used = 0
        self.videos_processed = 0
        self.errors_encountered = []
        self.processed_channels = self._load_progress()
        
    def setup_logging(self):
        """Setup logging for extraction process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('corrected_extraction.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def _load_progress(self) -> set:
        """Load progress tracker if exists"""
        if os.path.exists(PROGRESS_FILE):
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                return set(json.load(f).get("processed_channels", []))
        return set()

    def _save_progress(self):
        """Save progress tracker"""
        os.makedirs(os.path.dirname(PROGRESS_FILE), exist_ok=True)
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump({"processed_channels": list(self.processed_channels)}, f, indent=2)

    
    def get_channel_configuration(self) -> Dict:
        """Get the 25-channel configuration"""
        return {
            "challenge_stunts": [
                {"name": "MrBeast", "handle": "@MrBeast", "tier": "Large"},
                {"name": "Zach King", "handle": "@ZachKing", "tier": "Mid"},
                {"name": "Ryan Trahan", "handle": "@RyanTrahan", "tier": "Mid"},
                {"name": "Austen Alexander", "handle": "@AustenAlexander", "tier": "Small"},
                {"name": "Zach D. Films", "handle": "@ZachDFilms", "tier": "New"}
            ],
            "catholic": [
                {"name": "Ascension Presents", "handle": "@AscensionPresents", "tier": "Large"},
                {"name": "Bishop Robert Barron", "handle": "@BishopRobertBarron", "tier": "Mid"},
                {"name": "Breaking in the Habit", "handle": "@BreakingInTheHabit", "tier": "Mid"},
                {"name": "GabiAfterHours", "handle": "@GabiAfterHours", "tier": "Small"},
                {"name": "The Traditional Thomist", "handle": "@TheTraditionalThomist", "tier": "New"}
            ],
            "education_science": [
                {"name": "Kurzgesagt", "handle": "@kurzgesagt", "tier": "Large"},
                {"name": "SciShow", "handle": "@SciShow", "tier": "Mid"},
                {"name": "Veritasium", "handle": "@veritasium", "tier": "Mid"},
                {"name": "Steve Mould", "handle": "@SteveMould", "tier": "Small"},
                {"name": "Up and Atom", "handle": "@UpandAtom", "tier": "New"}
            ],
            "gaming": [
                {"name": "Jacksepticeye", "handle": "@jacksepticeye", "tier": "Large"},
                {"name": "Call Me Kevin", "handle": "@CallMeKevin", "tier": "Mid"},
                {"name": "RTGame", "handle": "@RTGame", "tier": "Mid"},
                {"name": "Lets Game It Out", "handle": "@LetsGameItOut", "tier": "Small"},
                {"name": "DougDoug", "handle": "@DougDoug", "tier": "New"}
            ],
            "kids_family": [
                {"name": "Cocomelon", "handle": "@Cocomelon", "tier": "Large"},
                {"name": "Vlad and Niki", "handle": "@VladandNiki", "tier": "Mid"},
                {"name": "Diana and Roma", "handle": "@KidsRoma", "tier": "Mid"},
                {"name": "Genevieve's Playhouse", "handle": "@GenevievesPlayhouse", "tier": "Small"},
                {"name": "Tiny Tots Adventures", "handle": "@TinyTotsAdventures", "tier": "New"}
            ]
        }
    
    def resolve_channel_handle(self, handle: str) -> Optional[str]:
        """Resolve @handle to channel ID"""
        try:
            # Remove @ if present
            handle = handle.lstrip('@')
            
            # Search for channel by handle
            response = self.youtube.search().list(
                part='snippet',
                q=handle,
                type='channel',
                maxResults=1
            ).execute()
            
            self.quota_used += 100  # Search costs 100 units
            
            if response['items']:
                return response['items'][0]['snippet']['channelId']
            
        except Exception as e:
            self.logger.error(f"Error resolving handle {handle}: {e}")
        
        return None
    
    def extract_channel_data(self, handle: str) -> Dict:
        """Extract basic channel information"""
        try:
            # Resolve handle to channel ID
            channel_id = self.resolve_channel_handle(handle)
            if not channel_id:
                self.logger.error(f"Could not resolve channel handle: {handle}")
                return {}
            
            # Get channel details
            response = self.youtube.channels().list(
                part='snippet,statistics,contentDetails',
                id=channel_id
            ).execute()
            
            self.quota_used += 1
            
            if not response['items']:
                return {}
            
            channel = response['items'][0]
            
            return {
                'channel_id': channel_id,
                'handle': handle,
                'title': channel['snippet']['title'],
                'description': channel['snippet']['description'],
                'subscriber_count': int(channel['statistics'].get('subscriberCount', 0)),
                'video_count': int(channel['statistics'].get('videoCount', 0)),
                'view_count': int(channel['statistics'].get('viewCount', 0)),
                'thumbnail_url': channel['snippet']['thumbnails']['high']['url'],
                'uploads_playlist_id': channel['contentDetails']['relatedPlaylists']['uploads']
            }
            
        except Exception as e:
            self.logger.error(f"Error extracting channel data for {handle}: {e}")
            return {}
    
    def get_all_channel_videos(self, uploads_playlist_id: str) -> List[Dict]:
        """Get all videos from a channel's uploads playlist"""
        videos = []
        next_page_token = None
        
        try:
            while True:
                response = self.youtube.playlistItems().list(
                    part='snippet',
                    playlistId=uploads_playlist_id,
                    maxResults=50,
                    pageToken=next_page_token
                ).execute()
                
                self.quota_used += 1
                
                for item in response['items']:
                    video_data = {
                        'video_id': item['snippet']['resourceId']['videoId'],
                        'title': item['snippet']['title'],
                        'published_at': item['snippet']['publishedAt'],
                        'thumbnail_url': item['snippet']['thumbnails']['high']['url']
                    }
                    videos.append(video_data)
                
                next_page_token = response.get('nextPageToken')
                if not next_page_token:
                    break
                
                # Rate limiting
                time.sleep(0.1)
                
        except Exception as e:
            self.logger.error(f"Error getting channel videos: {e}")
        
        return videos
    
    def get_video_details(self, video_ids: List[str]) -> List[Dict]:
        """Get detailed information for videos"""
        detailed_videos = []
        
        # Process in batches of 50 (API limit)
        for i in range(0, len(video_ids), 50):
            batch_ids = video_ids[i:i+50]
            
            try:
                response = self.youtube.videos().list(
                    part='snippet,statistics,contentDetails',
                    id=','.join(batch_ids)
                ).execute()
                
                self.quota_used += 1
                
                for video in response['items']:
                    video_data = {
                        'video_id': video['id'],
                        'title': video['snippet']['title'],
                        'description': video['snippet']['description'],
                        'published_at': video['snippet']['publishedAt'],
                        'duration': video['contentDetails']['duration'],
                        'view_count': int(video['statistics'].get('viewCount', 0)),
                        'like_count': int(video['statistics'].get('likeCount', 0)),
                        'comment_count': int(video['statistics'].get('commentCount', 0)),
                        'tags': video['snippet'].get('tags', []),
                        'thumbnail_url': video['snippet']['thumbnails']['high']['url']
                    }
                    detailed_videos.append(video_data)
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                self.logger.error(f"Error getting video details: {e}")
                continue
        
        return detailed_videos
    
    def intelligent_video_selection(self, videos: List[Dict], target_count: int = 40) -> Dict:
        """Intelligent video selection: top 10 + bottom 10 + random 20"""
        
        if len(videos) <= target_count:
            return {
                'selected_videos': videos,
                'selection_method': 'all_available',
                'total_selected': len(videos)
            }
        
        # Get detailed stats for all videos to sort by views
        video_ids = [v['video_id'] for v in videos]
        detailed_videos = self.get_video_details(video_ids)
        
        # Sort by view count
        sorted_videos = sorted(
            detailed_videos, 
            key=lambda x: x.get('view_count', 0), 
            reverse=True
        )
        
        # Select top 10, bottom 10, and random 20 from middle
        top_10 = sorted_videos[:10]
        bottom_10 = sorted_videos[-10:]
        
        # Random 20 from middle (excluding top 10 and bottom 10)
        if len(sorted_videos) > 20:
            middle_videos = sorted_videos[10:-10]
            random_20 = random.sample(middle_videos, min(20, len(middle_videos)))
        else:
            random_20 = []
        
        selected = top_10 + bottom_10 + random_20
        
        # Add performance categories
        for video in selected:
            if video in top_10:
                video['performance_category'] = 'top_performer'
            elif video in bottom_10:
                video['performance_category'] = 'bottom_performer'
            else:
                video['performance_category'] = 'random_sample'
        
        return {
            'selected_videos': selected,
            'selection_method': 'intelligent_sampling',
            'total_selected': len(selected),
            'breakdown': {
                'top_performers': len(top_10),
                'bottom_performers': len(bottom_10),
                'random_sample': len(random_20)
            }
        }
    
    def extract_video_comments(self, video_id: str, max_comments: int = 100) -> List[Dict]:
        """Extract comments for a video (raw data for user's sentiment analysis)"""
        comments = []
        
        try:
            response = self.youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=min(max_comments, 100),
                order='relevance'
            ).execute()
            
            self.quota_used += 1
            
            for item in response['items']:
                comment = item['snippet']['topLevelComment']['snippet']
                comment_data = {
                    'comment_id': item['snippet']['topLevelComment']['id'],
                    'text': comment['textDisplay'],
                    'author': comment['authorDisplayName'],
                    'published_at': comment['publishedAt'],
                    'like_count': comment.get('likeCount', 0),
                    'reply_count': item['snippet'].get('totalReplyCount', 0)
                }
                comments.append(comment_data)
            
        except Exception as e:
            self.logger.error(f"Error extracting comments for {video_id}: {e}")
        
        return comments
    
    def check_caption_availability(self, video_id: str) -> Dict:
        """Check what captions are available (but don't download - requires ownership)"""
        try:
            # List available captions
            captions_response = self.youtube.captions().list(
                part='snippet',
                videoId=video_id
            ).execute()
            
            self.quota_used += 50  # Caption list costs 50 units
            
            caption_info = {
                'has_captions': len(captions_response['items']) > 0,
                'caption_count': len(captions_response['items']),
                'languages': [],
                'has_english': False,
                'has_auto_generated': False,
                'has_manual': False
            }
            
            for caption in captions_response['items']:
                lang = caption['snippet']['language']
                track_kind = caption['snippet'].get('trackKind', 'standard')
                
                caption_info['languages'].append({
                    'language': lang,
                    'name': caption['snippet']['name'],
                    'track_kind': track_kind
                })
                
                if lang == 'en':
                    caption_info['has_english'] = True
                
                if track_kind == 'asr':
                    caption_info['has_auto_generated'] = True
                else:
                    caption_info['has_manual'] = True
            
            return caption_info
            
        except Exception as e:
            self.logger.error(f"Error checking captions for {video_id}: {e}")
            return {
                'has_captions': False,
                'caption_count': 0,
                'languages': [],
                'has_english': False,
                'has_auto_generated': False,
                'has_manual': False,
                'error': str(e)
            }
    
    def download_thumbnail(self, video_id: str, thumbnail_url: str, output_dir: str) -> str:
        """Download video thumbnail"""
        try:
            os.makedirs(output_dir, exist_ok=True)
            
            response = requests.get(thumbnail_url)
            if response.status_code == 200:
                filename = f"{video_id}_thumbnail.jpg"
                filepath = os.path.join(output_dir, filename)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                return filepath
            
        except Exception as e:
            self.logger.error(f"Error downloading thumbnail for {video_id}: {e}")
        
        return None
    
    def execute_api_only_extraction(self, output_dir: str = "extracted_data") -> Dict:
        """Execute API-only extraction (no transcript download)"""
        
        self.logger.info("🚀 Starting API-Only Data Extraction")
        self.logger.info("📝 Note: Transcript content requires separate extraction (not available via API for public videos)")
        
        os.makedirs(output_dir, exist_ok=True)
        channels_config = self.get_channel_configuration()
        
        results = {
            'extraction_date': datetime.now().isoformat(),
            'extraction_type': 'api_only_public_videos',
            'transcript_note': 'Caption availability checked, but content requires yt-dlp or similar',
            'channels_processed': 0,
            'videos_selected': 0,
            'quota_used': 0,
            'data': {}
        }
        
        for genre, channels in channels_config.items():
            self.logger.info(f"Processing genre: {genre}")
            
            for channel_info in channels:
                channel_name = channel_info['name']
                channel_handle = channel_info['handle']
                # Skip if already processed
                if channel_name in self.processed_channels:
                    self.logger.info(f"🔁 Skipping {channel_name} (already processed)")
                    continue
                self.logger.info(f"Extracting data for: {channel_name} ({channel_handle})")
                
                try:
                    # Extract channel data
                    channel_data = self.extract_channel_data(channel_handle)
                    if not channel_data:
                        self.logger.warning(f"❌ Could not extract data for {channel_name}")
                        continue
                    
                    # Get all videos
                    all_videos = self.get_all_channel_videos(
                        channel_data['uploads_playlist_id']
                    )
                    
                    if not all_videos:
                        self.logger.warning(f"❌ No videos found for {channel_name}")
                        continue
                    
                    # Intelligent selection
                    selection_result = self.intelligent_video_selection(all_videos)
                    selected_videos = selection_result['selected_videos']
                    
                    # Extract comments and check captions for selected videos
                    for video in selected_videos:
                        # Extract comments
                        video['comments'] = self.extract_video_comments(video['video_id'])
                        
                        # Check caption availability (but don't download content)
                        video['caption_info'] = self.check_caption_availability(video['video_id'])
                        
                        # Download thumbnail
                        thumbnail_path = self.download_thumbnail(
                            video['video_id'],
                            video['thumbnail_url'],
                            os.path.join(output_dir, 'thumbnails')
                        )
                        video['thumbnail_local_path'] = thumbnail_path
                        
                        time.sleep(0.1)  # Rate limiting
                    
                    # Store results
                    results['data'][channel_name] = {
                        'channel_info': channel_info,
                        'channel_data': channel_data,
                        'genre': genre,
                        'selection_result': selection_result,
                        'videos': selected_videos
                    }
                    
                    results['channels_processed'] += 1
                    results['videos_selected'] += len(selected_videos)
                    
                    self.logger.info(f"✅ {channel_name}: {len(selected_videos)} videos selected")
                    self.processed_channels.add(channel_name)
                    self._save_progress()
                    self.logger.info(f"💾 Progress saved to {PROGRESS_FILE}")

                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to process {channel_name}: {e}")
                    continue
        
        results['quota_used'] = self.quota_used
        
        # Save results
        self._save_api_only_data(results, output_dir)
        
        self.logger.info(f"🎉 API-Only Extraction Complete!")
        self.logger.info(f"📊 {results['videos_selected']} videos from {results['channels_processed']} channels")
        self.logger.info(f"📈 Quota used: {results['quota_used']} units")
        
        return results
    
    def _save_api_only_data(self, results: Dict, output_dir: str):
        """Save API-only data in multiple formats"""
        
        # JSON format (complete data)
        with open(f"{output_dir}/api_only_complete_data.json", 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # CSV format (flattened for ML)
        self._create_ml_csv(results, f"{output_dir}/api_only_ml_dataset.csv")
        
        # Separate files for different data types
        self._save_comments_data(results, output_dir)
        self._save_metadata_only(results, output_dir)
        self._save_caption_availability_report(results, output_dir)
        
        self.logger.info(f"API-only data saved to {output_dir}/")
    
    def _create_ml_csv(self, results: Dict, filename: str):
        """Create ML-ready CSV dataset"""
        
        fieldnames = [
            'video_id', 'channel_name', 'genre', 'tier', 'title', 'view_count',
            'like_count', 'comment_count', 'duration', 'published_at',
            'tags_count', 'title_length', 'description_length',
            'channel_subscriber_count', 'performance_category',
            'has_captions', 'has_english_captions', 'has_auto_captions', 'has_manual_captions'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for channel_name, channel_data in results['data'].items():
                for video in channel_data['videos']:
                    caption_info = video.get('caption_info', {})
                    
                    row = {
                        'video_id': video['video_id'],
                        'channel_name': channel_name,
                        'genre': channel_data['genre'],
                        'tier': channel_data['channel_info']['tier'],
                        'title': video['title'],
                        'view_count': video.get('view_count', 0),
                        'like_count': video.get('like_count', 0),
                        'comment_count': video.get('comment_count', 0),
                        'duration': video.get('duration', ''),
                        'published_at': video.get('published_at', ''),
                        'tags_count': len(video.get('tags', [])),
                        'title_length': len(video.get('title', '')),
                        'description_length': len(video.get('description', '')),
                        'channel_subscriber_count': channel_data['channel_data'].get('subscriber_count', 0),
                        'performance_category': video.get('performance_category', 'unknown'),
                        'has_captions': caption_info.get('has_captions', False),
                        'has_english_captions': caption_info.get('has_english', False),
                        'has_auto_captions': caption_info.get('has_auto_generated', False),
                        'has_manual_captions': caption_info.get('has_manual', False)
                    }
                    writer.writerow(row)
    
    def _save_comments_data(self, results: Dict, output_dir: str):
        """Save raw comments data for sentiment analysis"""
        
        comments_dir = os.path.join(output_dir, 'comments_raw')
        os.makedirs(comments_dir, exist_ok=True)
        
        all_comments = []
        
        for channel_name, channel_data in results['data'].items():
            for video in channel_data['videos']:
                for comment in video.get('comments', []):
                    comment_record = {
                        'video_id': video['video_id'],
                        'channel_name': channel_name,
                        'genre': channel_data['genre'],
                        'tier': channel_data['channel_info']['tier'],
                        'performance_category': video.get('performance_category', 'unknown'),
                        **comment
                    }
                    all_comments.append(comment_record)
        
        # Save all comments in one file
        with open(f"{comments_dir}/all_comments_raw.json", 'w', encoding='utf-8') as f:
            json.dump(all_comments, f, indent=2, ensure_ascii=False)
        
        # Save by channel for easier processing
        for channel_name, channel_data in results['data'].items():
            channel_comments = []
            for video in channel_data['videos']:
                for comment in video.get('comments', []):
                    channel_comments.append({
                        'video_id': video['video_id'],
                        'performance_category': video.get('performance_category', 'unknown'),
                        **comment
                    })
            
            if channel_comments:
                safe_name = channel_name.replace(' ', '_').replace('/', '_')
                with open(f"{comments_dir}/{safe_name}_comments.json", 'w', encoding='utf-8') as f:
                    json.dump(channel_comments, f, indent=2, ensure_ascii=False)
    
    def _save_metadata_only(self, results: Dict, output_dir: str):
        """Save clean metadata without comments"""
        
        clean_data = {}
        for channel_name, channel_data in results['data'].items():
            clean_videos = []
            for video in channel_data['videos']:
                clean_video = {k: v for k, v in video.items() 
                             if k not in ['comments']}
                clean_videos.append(clean_video)
            
            clean_data[channel_name] = {
                **channel_data,
                'videos': clean_videos
            }
        
        with open(f"{output_dir}/metadata_only.json", 'w', encoding='utf-8') as f:
            json.dump(clean_data, f, indent=2, ensure_ascii=False)
    
    def _save_caption_availability_report(self, results: Dict, output_dir: str):
        """Save caption availability report for transcript planning"""
        
        caption_report = {
            'summary': {
                'total_videos': 0,
                'videos_with_captions': 0,
                'videos_with_english': 0,
                'videos_with_auto_captions': 0,
                'videos_with_manual_captions': 0
            },
            'by_channel': {},
            'transcript_extraction_candidates': []
        }
        
        for channel_name, channel_data in results['data'].items():
            channel_stats = {
                'total_videos': len(channel_data['videos']),
                'videos_with_captions': 0,
                'videos_with_english': 0,
                'videos_with_auto_captions': 0,
                'videos_with_manual_captions': 0
            }
            
            for video in channel_data['videos']:
                caption_info = video.get('caption_info', {})
                
                caption_report['summary']['total_videos'] += 1
                channel_stats['total_videos'] += 1
                
                if caption_info.get('has_captions'):
                    caption_report['summary']['videos_with_captions'] += 1
                    channel_stats['videos_with_captions'] += 1
                
                if caption_info.get('has_english'):
                    caption_report['summary']['videos_with_english'] += 1
                    channel_stats['videos_with_english'] += 1
                    
                    # Add to transcript extraction candidates
                    caption_report['transcript_extraction_candidates'].append({
                        'video_id': video['video_id'],
                        'title': video['title'],
                        'channel_name': channel_name,
                        'view_count': video.get('view_count', 0),
                        'caption_info': caption_info
                    })
                
                if caption_info.get('has_auto_generated'):
                    caption_report['summary']['videos_with_auto_captions'] += 1
                    channel_stats['videos_with_auto_captions'] += 1
                
                if caption_info.get('has_manual'):
                    caption_report['summary']['videos_with_manual_captions'] += 1
                    channel_stats['videos_with_manual_captions'] += 1
            
            caption_report['by_channel'][channel_name] = channel_stats
        
        with open(f"{output_dir}/caption_availability_report.json", 'w', encoding='utf-8') as f:
            json.dump(caption_report, f, indent=2, ensure_ascii=False)

def main():
    RESET_PROGRESS = False  # Set this to True if you want to re-run from scratch
    if RESET_PROGRESS and os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
    print("🔄 Progress reset! Starting from scratch.\n")

    """Main execution function for corrected data extraction"""
    
    print("📊 Corrected YouTube Data Extractor")
    print("API-only approach for public videos (realistic expectations)")
    print("=" * 60)
    
    # Check for API key
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        print("❌ ERROR: YouTube API key not found!")
        print("Please set YOUTUBE_API_KEY environment variable")
        return
    
    # Initialize extractor
    extractor = CorrectedDataExtractor(api_key)
    
    print("\\n📋 What This Extracts (API-Only):")
    print("✅ Complete video metadata (views, likes, comments, etc.)")
    print("✅ Channel information and subscriber counts")
    print("✅ Raw comment data (for your sentiment analysis)")
    print("✅ Caption availability flags (but not transcript content)")
    print("✅ Thumbnail downloads")
    print("✅ Intelligent video sampling (top 10 + bottom 10 + random 20)")
    print()
    
    print("❌ What This CANNOT Extract:")
    print("❌ Transcript content (requires video ownership for API)")
    print("❌ First 30 seconds text (depends on transcripts)")
    print()
    
    print("💡 For Transcripts:")
    print("• Use yt-dlp separately (moderate IP risk)")
    print("• Or implement your own transcript extraction")
    print("• Caption availability report provided for planning")
    print()
    
    print("🎯 Perfect for:")
    print("• Immediate ML analysis with core metrics")
    print("• Sentiment analysis of comments")
    print("• Performance modeling and RQS calculations")
    print("• Zero-risk data extraction")
    print()
    
    # Uncomment to run actual extraction
    print("⏳ Starting API-only extraction...")
    results = extractor.execute_api_only_extraction()
    print(f"✅ Extraction complete: {results['videos_selected']} videos")
    print("🎯 ML dataset ready for your analysis!")

if __name__ == "__main__":
    main()

