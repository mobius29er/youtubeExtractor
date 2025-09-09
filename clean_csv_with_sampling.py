#!/usr/bin/env python3
"""
Clean CSV while preserving intelligent sampling (10 top + 10 bottom + 20 random)
"""
import json
import pandas as pd

def clean_csv_with_intelligent_sampling():
    # Load the clean JSON data
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("🧹 CLEANING CSV WITH INTELLIGENT SAMPLING")
    print("=" * 50)
    
    all_videos = []
    
    for channel_name, channel_data in data['data'].items():
        print(f"\n📺 Processing {channel_name}:")
        
        # Get videos from the correct location
        videos = []
        if 'videos' in channel_data:
            videos = channel_data['videos']
        elif 'selection_result' in channel_data and 'selected_videos' in channel_data['selection_result']:
            videos = channel_data['selection_result']['selected_videos']
        
        if not videos:
            print(f"  ⚠️  No videos found")
            continue
            
        print(f"  📊 Found {len(videos)} videos")
        
        # Verify intelligent sampling categories
        categories = {}
        for video in videos:
            # Add channel name to each video
            video['channel_name'] = channel_name
            
            # Count categories
            cat = video.get('performance_category', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1
            
            all_videos.append(video)
        
        print(f"  🎯 Categories: {categories}")
        
        # Validate intelligent sampling
        expected = {'top_performer': 10, 'bottom_performer': 10, 'random_sample': 20}
        if len(videos) == 40 and categories == expected:
            print(f"  ✅ Perfect intelligent sampling!")
        elif len(videos) < 40:
            print(f"  🔄 Incomplete channel ({len(videos)}/40 videos)")
        else:
            print(f"  ⚠️  Unexpected sampling: {categories}")
    
    # Create clean DataFrame
    df = pd.DataFrame(all_videos)
    
    print(f"\n📊 FINAL RESULTS:")
    print(f"  • Total videos: {len(df)}")
    print(f"  • Unique videos: {df['video_id'].nunique()}")
    print(f"  • Channels: {df['channel_name'].nunique()}")
    
    # Check for any remaining duplicates
    duplicates = len(df) - df['video_id'].nunique()
    if duplicates > 0:
        print(f"  🚨 Found {duplicates} duplicates - removing them")
        df = df.drop_duplicates(subset='video_id', keep='first')
    else:
        print(f"  ✅ No duplicates found")
    
    # Verify sampling distribution
    print(f"\n🎯 SAMPLING VERIFICATION:")
    sampling_counts = df['performance_category'].value_counts()
    for category, count in sampling_counts.items():
        print(f"  • {category}: {count} videos")
    
    # Save clean CSV
    df.to_csv('extracted_data/api_only_ml_dataset.csv', index=False)
    print(f"\n✅ Clean CSV saved with intelligent sampling preserved!")
    print(f"   Final count: {len(df)} unique videos")
    
    return df

if __name__ == '__main__':
    clean_csv_with_intelligent_sampling()
