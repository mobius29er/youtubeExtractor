#!/usr/bin/env python3
"""
JSON Data Recovery
Attempts to read the main JSON file and count total videos
"""

import json
import sys

def analyze_json_files():
    print("🔍 ANALYZING JSON FILES FOR MISSING DATA")
    print("=" * 50)
    
    files_to_check = [
        'extracted_data/api_only_complete_data.json',
        'extracted_data/api_only_complete_data.json.backup'
    ]
    
    for json_file in files_to_check:
        print(f"\n📄 Checking: {json_file}")
        
        try:
            # Try different encodings
            for encoding in ['utf-8', 'latin1', 'cp1252']:
                try:
                    with open(json_file, 'r', encoding=encoding) as f:
                        data = json.load(f)
                    
                    if isinstance(data, dict):
                        channels = len(data)
                        total_videos = 0
                        
                        print(f"   ✅ Successfully read with {encoding} encoding")
                        print(f"   📊 Channels found: {channels}")
                        
                        # Count videos per channel
                        channel_video_counts = {}
                        for channel_name, channel_data in data.items():
                            if isinstance(channel_data, dict) and 'videos' in channel_data:
                                video_count = len(channel_data['videos'])
                                channel_video_counts[channel_name] = video_count
                                total_videos += video_count
                            else:
                                channel_video_counts[channel_name] = 0
                        
                        print(f"   🎬 Total videos: {total_videos}")
                        print(f"   📈 Channel breakdown:")
                        
                        for channel, count in sorted(channel_video_counts.items(), key=lambda x: x[1], reverse=True):
                            print(f"      • {channel}: {count} videos")
                        
                        if total_videos > 560:
                            print(f"\n   🎉 FOUND YOUR MISSING DATA!")
                            print(f"      Missing videos: {total_videos - 560}")
                            
                            # Generate new CSV from this JSON
                            return generate_csv_from_json(data, json_file)
                        
                        break  # Successfully processed
                        
                except (UnicodeDecodeError, json.JSONDecodeError) as e:
                    continue  # Try next encoding
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            continue
    
    return None

def generate_csv_from_json(data, source_file):
    """Convert JSON data back to CSV format"""
    print(f"\n🔄 GENERATING CSV FROM {source_file}")
    
    import pandas as pd
    
    # Collect all video records
    all_videos = []
    
    for channel_name, channel_data in data.items():
        if isinstance(channel_data, dict) and 'videos' in channel_data:
            videos = channel_data['videos']
            
            for video in videos:
                if isinstance(video, dict):
                    # Add channel name to video record
                    video['channel_name'] = channel_name
                    all_videos.append(video)
    
    if all_videos:
        # Create DataFrame
        df = pd.DataFrame(all_videos)
        
        # Ensure we have the expected columns
        expected_columns = ['video_id', 'title', 'description', 'published_at', 'duration', 
                          'view_count', 'like_count', 'comment_count', 'tags', 'thumbnail_url',
                          'performance_category', 'comments', 'caption_info', 
                          'thumbnail_local_path', 'channel_name']
        
        # Reorder columns and fill missing ones
        for col in expected_columns:
            if col not in df.columns:
                df[col] = ''
        
        df = df[expected_columns]
        
        # Save recovered CSV

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
        output_file = 'extracted_data/api_only_ml_dataset_FULL_RECOVERY.csv'
        df.to_csv(output_file, index=False, quoting=1)
        
        print(f"   💾 Saved recovered data: {output_file}")
        print(f"   📊 Recovered videos: {len(df)}")
        print(f"   📈 Recovered channels: {df['channel_name'].nunique()}")
        
        return df
    
    return None

if __name__ == "__main__":
    result = analyze_json_files()
