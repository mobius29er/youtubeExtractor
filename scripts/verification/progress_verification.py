import json
import pandas as pd

# Check the main data file
import os
with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== DATASET ANALYSIS ===")
print(f"Total channels: {len(data['data'])}")
print(f"Total videos: {data.get('videos_selected', 'N/A')}")
print(f"API quota used: {data.get('api_quota_used', 'N/A')}")

# Check each channel for proper video counts
print("\n=== CHANNEL ANALYSIS ===")
for channel_name, channel_data in data['data'].items():
    videos = channel_data.get('videos', [])
    print(f"{channel_name}: {len(videos)} videos")
    
    # Check for duplicates within each channel
    video_ids = [v.get('video_id') for v in videos]
    duplicates = len(video_ids) - len(set(video_ids))
    if duplicates > 0:
        print(f"  ⚠️  {duplicates} duplicate video IDs found!")
    
    # Check performance categories
    categories = {}
    for video in videos:
        cat = video.get('performance_category', 'unknown')
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"  Categories: {categories}")

# Check progress tracker
with open('extracted_data/progress_tracker.json', 'r', encoding='utf-8') as f:
    progress = json.load(f)

print(f"\n=== PROGRESS TRACKER ===")
print(f"Processed channels: {len(progress['processed_channels'])}")
print("Channels marked complete:")
for channel in progress['processed_channels']:
    print(f"  - {channel}")

# Check CSV file
try:
    df = pd.read_csv('extracted_data/api_only_ml_SAFE.csv') if os.path.exists('extracted_data/api_only_ml_SAFE.csv') else pd.read_csv('extracted_data/api_only_ml_dataset.csv')
    print(f"\n=== CSV DATASET ===")
    print(f"Total rows: {len(df)}")
    print(f"Unique videos: {df['video_id'].nunique()}")
    print(f"Unique channels: {df['channel_name'].nunique()}")
    
    # Check for duplicates in CSV
    csv_duplicates = len(df) - df['video_id'].nunique()
    if csv_duplicates > 0:
        print(f"⚠️  {csv_duplicates} duplicate videos in CSV!")
    
    # Channel breakdown
    print("\nChannel breakdown:")
    channel_counts = df['channel_name'].value_counts()
    for channel, count in channel_counts.items():
        print(f"  {channel}: {count} videos")
        
    # Check for proper intelligent sampling
    print("\n=== INTELLIGENT SAMPLING CHECK ===")
    for channel in df['channel_name'].unique():
        channel_df = df[df['channel_name'] == channel]
        categories = channel_df['performance_category'].value_counts()
        print(f"{channel}:")
        for cat, count in categories.items():
            print(f"  {cat}: {count}")
            
except Exception as e:
    print(f"Error reading CSV: {e}")

# Additional verification checks
print(f"\n=== DATA CONSISTENCY CHECK ===")
# Check if progress tracker matches actual data
json_channels = set(data['data'].keys())
progress_channels = set(progress['processed_channels'])

print(f"Channels in JSON: {len(json_channels)}")
print(f"Channels in progress tracker: {len(progress_channels)}")

# Find mismatches
missing_from_progress = json_channels - progress_channels
extra_in_progress = progress_channels - json_channels

if missing_from_progress:
    print(f"⚠️  Channels in data but NOT in progress tracker: {missing_from_progress}")
if extra_in_progress:
    print(f"⚠️  Channels in progress tracker but NOT in data: {extra_in_progress}")

print(f"\n=== QUOTA ANALYSIS ===")
quota_used = data.get('api_quota_used', 0)
if quota_used > 0:
    print(f"Total API quota used: {quota_used} units")
    print(f"Average quota per channel: {quota_used / len(data['data']):.1f} units")
    print(f"Expected quota per channel: ~1 unit (optimized)")
    
    if quota_used / len(data['data']) > 2:
        print("⚠️  Higher than expected quota usage - check for inefficiencies")
    else:
        print("✅ Quota usage looks optimal")
else:
    print("No quota information found in dataset")

print("\n=== ANALYSIS COMPLETE ===")