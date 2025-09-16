#!/usr/bin/env python3
import os
"""
Comprehensive analysis of the YouTube extraction dataset
"""
import json
import pandas as pd
from pathlib import Path

def analyze_dataset():
    print('🎯 YOUTUBE DATA EXTRACTION ANALYSIS')
    print('=' * 50)

    # Load JSON data
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f'📊 OVERVIEW:')
    print(f'  • Total Channels Processed: {data["channels_processed"]}')
    print(f'  • Total Videos Selected: {data["videos_selected"]}')  
    print(f'  • API Quota Used: {data["quota_used"]:,} units')
    print(f'  • Extraction Date: {data["extraction_date"][:19]}')
    print()

    # Analyze by channel
    print('📺 CHANNEL BREAKDOWN:')
    total_videos = 0
    for channel_name, channel_data in data['data'].items():
        if 'selection_result' in channel_data and 'selected_videos' in channel_data['selection_result']:
            video_count = len(channel_data['selection_result']['selected_videos'])
            total_videos += video_count
            subs = channel_data['channel_info']['subs']
            genre = channel_data.get('genre', 'Unknown')
            print(f'  • {channel_name}: {video_count} videos | {subs:,} subs | {genre}')
        else:
            print(f'  • {channel_name}: No videos extracted')

    print(f'\n📈 TOTAL VIDEOS VERIFIED: {total_videos}')
    print()

    # Load CSV for additional metrics
    try:
        csv_data = pd.read_csv('extracted_data/api_only_ml_SAFE.csv') if os.path.exists('extracted_data/api_only_ml_SAFE.csv') else pd.read_csv('extracted_data/api_only_ml_dataset.csv')
        print(f'📊 CSV DATASET METRICS:')
        print(f'  • Total Rows: {len(csv_data):,}')
        print(f'  • Unique Channels: {csv_data["channel_name"].nunique()}')
        
        # Get date range if available
        if 'published_date' in csv_data.columns:
            print(f'  • Date Range: {csv_data["published_date"].min()} to {csv_data["published_date"].max()}')
        elif 'published_at' in csv_data.columns:
            print(f'  • Date Range: {csv_data["published_at"].min()} to {csv_data["published_at"].max()}')
        print()
        
        # Channel stats from CSV
        channel_stats = csv_data.groupby('channel_name').agg({
            'video_id': 'count',
            'view_count': ['mean', 'sum'],
            'like_count': 'sum',
            'comment_count': 'sum'
        }).round(0)
        
        print('📊 DETAILED CHANNEL METRICS:')
        for channel in channel_stats.index:
            videos = int(channel_stats.loc[channel, ('video_id', 'count')])
            avg_views = int(channel_stats.loc[channel, ('view_count', 'mean')])
            total_views = int(channel_stats.loc[channel, ('view_count', 'sum')])
            total_likes = int(channel_stats.loc[channel, ('like_count', 'sum')])
            total_comments = int(channel_stats.loc[channel, ('comment_count', 'sum')])
            
            print(f'  • {channel}:')
            print(f'    - Videos: {videos}')
            print(f'    - Avg Views: {avg_views:,}')
            print(f'    - Total Views: {total_views:,}')
            print(f'    - Total Likes: {total_likes:,}')
            print(f'    - Total Comments: {total_comments:,}')
            print()
            
    except Exception as e:
        print(f'CSV Analysis Error: {e}')

    # File structure analysis
    print('📁 EXTRACTED FILES STRUCTURE:')
    extracted_path = Path('extracted_data')
    if extracted_path.exists():
        file_count = 0
        total_size = 0
        for file_path in extracted_path.rglob('*'):
            if file_path.is_file():
                file_count += 1
                total_size += file_path.stat().st_size
        
        print(f'  • Total Files: {file_count:,}')
        print(f'  • Total Size: {total_size / (1024*1024):.2f} MB')
        
        # Check for specific file types

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
        json_files = list(extracted_path.glob('*.json'))
        csv_files = list(extracted_path.glob('*.csv'))
        thumbnail_dir = extracted_path / 'thumbnails'
        comments_dir = extracted_path / 'comments_raw'
        
        print(f'  • JSON files: {len(json_files)}')
        print(f'  • CSV files: {len(csv_files)}')
        if thumbnail_dir.exists():
            thumbnail_count = len(list(thumbnail_dir.glob('*')))
            print(f'  • Thumbnails: {thumbnail_count}')
        if comments_dir.exists():
            comment_files = len(list(comments_dir.glob('*')))
            print(f'  • Comment files: {comment_files}')

if __name__ == '__main__':
    analyze_dataset()
