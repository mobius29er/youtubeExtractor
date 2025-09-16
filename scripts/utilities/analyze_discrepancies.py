#!/usr/bin/env python3
"""
Analyze data discrepancies and thumbnail counts
"""
import json
import os

def analyze_discrepancies():
    print("🔍 ANALYZING DATA DISCREPANCIES")
    print("=" * 50)
    
    # Load JSON data
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("📊 METADATA ANALYSIS:")
    print(f"  • Extraction date: {data.get('extraction_date', 'N/A')}")
    print(f"  • Channels processed: {data.get('channels_processed', 'N/A')}")
    print(f"  • Videos selected: {data.get('videos_selected', 'N/A')}")
    print(f"  • Quota used: {data.get('quota_used', 'N/A')}")
    
    print("\n📺 ACTUAL VIDEO COUNTS:")
    total_videos = 0
    channel_counts = {}
    
    for channel_name, channel_data in data['data'].items():
        video_count = len(channel_data['videos'])
        total_videos += video_count
        channel_counts[channel_name] = video_count
        print(f"  • {channel_name}: {video_count} videos")
    
    print(f"\n📈 SUMMARY:")
    print(f"  • Metadata says: {data.get('videos_selected', 'N/A')} videos")
    print(f"  • Actually found: {total_videos} videos")
    print(f"  • Difference: {total_videos - data.get('videos_selected', 0)}")
    
    # Analyze thumbnails
    print("\n🖼️ THUMBNAIL ANALYSIS:")
    thumbnail_dir = 'extracted_data/thumbnails'
    total_thumbnails = 0
    thumbnail_counts = {}
    
    if os.path.exists(thumbnail_dir):
        for channel_dir in sorted(os.listdir(thumbnail_dir)):
            if os.path.isdir(os.path.join(thumbnail_dir, channel_dir)):
                thumb_path = os.path.join(thumbnail_dir, channel_dir)
                thumb_count = len([f for f in os.listdir(thumb_path) 
                                 if f.endswith(('.jpg', '.png', '.webp'))])
                total_thumbnails += thumb_count
                thumbnail_counts[channel_dir] = thumb_count
                
                # Compare with video count
                video_count = channel_counts.get(channel_dir.replace('_', ' '), 0)
                if video_count == 0:
                    # Try different name formats
                    for name in channel_counts.keys():
                        if name.replace(' ', '_') == channel_dir:
                            video_count = channel_counts[name]
                            break
                
                diff = thumb_count - video_count
                status = "✅" if diff == 0 else ("⚠️" if diff > 0 else "❌")
                print(f"  {status} {channel_dir}: {thumb_count} thumbnails, {video_count} videos (diff: {diff:+d})")
    
    print(f"\n📊 THUMBNAIL SUMMARY:")
    print(f"  • Total thumbnails: {total_thumbnails}")
    print(f"  • Total videos: {total_videos}")
    print(f"  • Extra thumbnails: {total_thumbnails - total_videos}")
    
    # Check for multiple thumbnails per video
    if total_thumbnails > total_videos:
        print(f"\n🔍 WHY MORE THUMBNAILS THAN VIDEOS?")
        print(f"  Possible reasons:")
        print(f"  1. Multiple thumbnail sizes downloaded per video")
        print(f"  2. Thumbnails from failed/removed videos still present")
        print(f"  3. Channel thumbnails mixed with video thumbnails")
        
        # Check a sample channel for multiple files per video
        sample_channel = None
        for channel_dir in os.listdir(thumbnail_dir):
            if os.path.isdir(os.path.join(thumbnail_dir, channel_dir)):
                sample_channel = channel_dir
                break
        
        if sample_channel:
            sample_path = os.path.join(thumbnail_dir, sample_channel)
            files = os.listdir(sample_path)[:10]  # First 10 files
            print(f"\n📂 SAMPLE FILES FROM {sample_channel}:")
            for file in files:
                print(f"     {file}")
    
    # Analyze CSV for comparison
    print(f"\n📋 CSV VERIFICATION:")
    try:
        import pandas as pd
        df = pd.read_csv('extracted_data/api_only_ml_SAFE.csv')
        print(f"  • CSV rows: {len(df)}")
        print(f"  • Unique video IDs: {df['video_id'].nunique()}")
        print(f"  • Unique channels: {df['channel_name'].nunique()}")
        
        # Channel distribution in CSV
        csv_channels = df['channel_name'].value_counts()
        print(f"\n📺 CSV CHANNEL DISTRIBUTION:")
        for channel, count in csv_channels.items():
            print(f"     {channel}: {count} videos")
            
    except Exception as e:
        print(f"  ❌ Error reading CSV: {e}")

if __name__ == "__main__":
    analyze_discrepancies()
