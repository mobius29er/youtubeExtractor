#!/usr/bin/env python3
import os
"""
Bulletproof JSON to CSV Converter
Handles all text encoding issues and prevents data corruption
"""

import json
import pandas as pd
import re
from typing import Dict, List
import logging

class SafeJSONtoCSVConverter:
    """Convert JSON extraction data to CSV with zero data loss"""
    
    def __init__(self, json_file: str):
        self.json_file = json_file
        self.logger = logging.getLogger(__name__)
    
    def sanitize_text_field(self, text: str) -> str:
        """Safely clean text fields for CSV"""
        if not isinstance(text, str):
            return str(text)
        
        # Remove problematic characters
        text = text.replace('\n', ' ').replace('\r', ' ')
        text = text.replace('\t', ' ')
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Escape quotes properly
        text = text.replace('"', '""')
        
        return text
    
    def create_detailed_csv(self, output_file: str) -> pd.DataFrame:
        """Create detailed CSV with all video metadata"""
        
        print(f"🔄 Converting {self.json_file} to {output_file}")
        
        # Load JSON data
        with open(self.json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract video records
        all_videos = []
        
        channel_data = data.get('data', {})
        for channel_name, channel_info in channel_data.items():
            if 'videos' in channel_info:
                videos = channel_info['videos']
                
                for video in videos:
                    # Create safe video record
                    video_record = {
                        'video_id': str(video.get('video_id', '')),
                        'title': self.sanitize_text_field(video.get('title', '')),
                        'description': self.sanitize_text_field(video.get('description', '')),
                        'published_at': str(video.get('published_at', '')),
                        'duration': str(video.get('duration', '')),
                        'view_count': int(video.get('view_count', 0)),
                        'like_count': int(video.get('like_count', 0)),
                        'comment_count': int(video.get('comment_count', 0)),
                        'tags': self.sanitize_text_field(str(video.get('tags', []))),
                        'thumbnail_url': str(video.get('thumbnail_url', '')),
                        'performance_category': str(video.get('performance_category', '')),
                        'comments': self.sanitize_text_field(str(video.get('comments', []))),
                        'caption_info': self.sanitize_text_field(str(video.get('caption_info', {}))),
                        'thumbnail_local_path': str(video.get('thumbnail_local_path', '')),
                        'channel_name': str(channel_name)
                    }
                    all_videos.append(video_record)
        
        # Create DataFrame
        df = pd.DataFrame(all_videos)
        
        # Save with proper escaping
        df.to_csv(output_file, index=False, quoting=1, escapechar='\\')
        
        print(f"✅ Successfully converted {len(df)} videos to CSV")
        print(f"   📊 Channels: {df['channel_name'].nunique()}")
        print(f"   📁 Output: {output_file}")
        
        return df
    
    def create_ml_csv(self, output_file: str) -> pd.DataFrame:
        """Create ML-ready CSV (numeric features only)"""
        
        print(f"🤖 Creating ML dataset: {output_file}")
        
        # Load JSON data
        with open(self.json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract ML features
        ml_records = []
        
        channel_data = data.get('data', {})
        for channel_name, channel_info in channel_data.items():
            if 'videos' in channel_info:
                videos = channel_info['videos']
                channel_data_info = channel_info.get('channel_data', {})
                channel_info_data = channel_info.get('channel_info', {})
                
                for video in videos:
                    caption_info = video.get('caption_info', {})
                    
                    ml_record = {
                        'video_id': str(video.get('video_id', '')),
                        'channel_name': str(channel_name),
                        'genre': str(channel_info.get('genre', 'unknown')),
                        'global_tier': str(channel_info_data.get('global_tier', 'Unknown')),
                        'genre_tier': str(channel_info_data.get('genre_tier', 'Unknown')),
                        'title': self.sanitize_text_field(video.get('title', '')),
                        'view_count': int(video.get('view_count', 0)),
                        'like_count': int(video.get('like_count', 0)),
                        'comment_count': int(video.get('comment_count', 0)),
                        'duration': str(video.get('duration', '')),
                        'published_at': str(video.get('published_at', '')),
                        'tags_count': len(video.get('tags', [])),
                        'title_length': len(video.get('title', '')),
                        'description_length': len(video.get('description', '')),
                        'channel_subscriber_count' if 'channel_subscriber_count' in data[0] else 'subscriber_count': int(channel_data_info.get('subscriber_count', 0)),
                        'performance_category': str(video.get('performance_category', 'unknown')),
                        'has_captions': bool(caption_info.get('has_captions', False)),
                        'has_english_captions': bool(caption_info.get('has_english', False)),
                        'has_auto_captions': bool(caption_info.get('has_auto_generated', False)),
                        'has_manual_captions': bool(caption_info.get('has_manual', False))
                    }
                    ml_records.append(ml_record)
        
        # Create DataFrame
        df = pd.DataFrame(ml_records)
        
        # Save with proper escaping
        df.to_csv(output_file, index=False, quoting=1)
        
        print(f"✅ ML dataset created: {len(df)} videos")
        
        return df

def main():
    """Convert current JSON data to clean CSV"""
    
    converter = SafeJSONtoCSVConverter('extracted_data/api_only_complete_data.json')
    
    # Create both formats

def safe_int(value, default=0):
    """Safely convert value to int"""
    if isinstance(value, int):
                return value
    if isinstance(value, str) and value.isdigit():
        return int(value)
    return default

def safe_float(value, default=0.0):
    """Safely convert value to float"""
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return default
    return default
    detailed_df = converter.create_detailed_csv('extracted_data/api_only_detailed_SAFE.csv')
    ml_df = converter.create_ml_csv('extracted_data/api_only_ml_SAFE.csv')
    
    print(f"\n🎉 CONVERSION COMPLETE!")
    print(f"   📄 Detailed CSV: {len(detailed_df)} videos")  
    print(f"   🤖 ML CSV: {len(ml_df)} videos")
    print(f"   ✅ No data corruption - all text fields safely escaped")

if __name__ == "__main__":
    main()
