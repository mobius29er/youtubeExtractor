#!/usr/bin/env python3
"""
Final Data Recovery - Extract Real Data from JSON
"""

import json
import pandas as pd

def extract_real_data():
    print("🎯 EXTRACTING REAL DATA FROM JSON")
    print("=" * 50)
    
    # Load the JSON with the real structure
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        full_data = json.load(f)
    
    print(f"📊 Extraction summary from JSON:")
    print(f"   • Extraction date: {full_data['extraction_date']}")
    print(f"   • Channels processed: {full_data['channels_processed']}")
    print(f"   • Videos selected: {full_data['videos_selected']}")
    print(f"   • Quota used: {full_data['quota_used']}")
    
    # Extract the actual channel data
    channel_data = full_data['data']
    
    print(f"\n🔍 Analyzing extracted channel data:")
    
    all_videos = []
    channel_summary = {}
    
    for channel_name, channel_info in channel_data.items():
        if 'videos' in channel_info:
            videos = channel_info['videos']
            video_count = len(videos)
            channel_summary[channel_name] = video_count
            
            # Extract video data
            for video in videos:
                video_record = {
                    'video_id': video.get('video_id', ''),
                    'title': video.get('title', ''),
                    'description': video.get('description', ''),
                    'published_at': video.get('published_at', ''),
                    'duration': video.get('duration', ''),
                    'view_count': video.get('view_count', 0),
                    'like_count': video.get('like_count', 0),
                    'comment_count': video.get('comment_count', 0),
                    'tags': str(video.get('tags', [])),
                    'thumbnail_url': video.get('thumbnail_url', ''),
                    'performance_category': video.get('performance_category', ''),
                    'comments': str(video.get('comments', [])),
                    'caption_info': str(video.get('caption_info', {})),
                    'thumbnail_local_path': video.get('thumbnail_local_path', ''),
                    'channel_name': channel_name
                }
                all_videos.append(video_record)
    
    # Display channel summary
    total_extracted = sum(channel_summary.values())
    print(f"\n📈 Channel breakdown ({len(channel_summary)} channels):")
    for channel, count in sorted(channel_summary.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {channel}: {count} videos")
    
    print(f"\n🎉 RECOVERY RESULTS:")
    print(f"   • Total videos found in JSON: {total_extracted}")
    print(f"   • Current CSV has: 560 videos")
    print(f"   • Missing from CSV: {total_extracted - 560} videos")
    
    if total_extracted > 560:
        # Create the complete dataset
        df = pd.DataFrame(all_videos)
        
        # Save complete data
        output_file = 'extracted_data/api_only_ml_dataset_COMPLETE.csv'
        df.to_csv(output_file, index=False, quoting=1)
        
        print(f"\n💾 COMPLETE DATASET SAVED: {output_file}")
        print(f"   📊 Total videos: {len(df)}")
        print(f"   📈 Total channels: {df['channel_name'].nunique()}")
        
        # Compare with current dataset
        missing_channels = set(df['channel_name'].unique()) - set(pd.read_csv('extracted_data/api_only_ml_dataset.csv')['channel_name'].unique())
        if missing_channels:
            print(f"\n❌ CHANNELS MISSING FROM CURRENT CSV:")
            for channel in missing_channels:
                count = len(df[df['channel_name'] == channel])
                print(f"   • {channel}: {count} videos")
        
        return df
    
    return None

if __name__ == "__main__":
    result = extract_real_data()
