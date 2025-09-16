#!/usr/bin/env python3
"""
Archive partial channels and clean dataset to exactly 25 channels × 40 videos
"""

import json
import os
import shutil
from typing import Dict, List

def archive_partial_channels():
    """Archive partial channels and create clean 1000-video dataset"""
    
    # Channels to archive (partial extractions)
    partial_channels = ['Money Guy', 'Bind', 'Evan Raugust']
    
    print("📦 Archiving Partial Channels")
    print("=" * 50)
    print(f"Channels to archive: {partial_channels}")
    print()
    
    # Load current dataset
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create archive structure
    archive_base = 'extracted_data/partial_channels_archive'
    os.makedirs(archive_base, exist_ok=True)
    
    # Archive data and track what we're removing
    archived_data = {}
    archived_videos = 0
    
    for channel_name in partial_channels:
        if channel_name in data['data']:
            channel_data = data['data'][channel_name]
            video_count = len(channel_data['videos'])
            
            print(f"📁 Archiving {channel_name}: {video_count} videos")
            
            # Archive the channel data
            archived_data[channel_name] = channel_data
            archived_videos += video_count
            
            # Archive thumbnails if they exist
            channel_folder_name = channel_name.replace(' ', '_')
            thumbnail_source = f'extracted_data/thumbnails/{channel_folder_name}'
            thumbnail_archive = f'{archive_base}/thumbnails/{channel_folder_name}'
            
            if os.path.exists(thumbnail_source):
                os.makedirs(f'{archive_base}/thumbnails', exist_ok=True)
                shutil.move(thumbnail_source, thumbnail_archive)
                print(f"  📸 Moved thumbnails: {thumbnail_source} → {thumbnail_archive}")
            
            # Remove from main dataset
            del data['data'][channel_name]
        else:
            print(f"⚠️  Channel not found in dataset: {channel_name}")
    
    # Save archived data
    archive_json_path = f'{archive_base}/partial_channels_data.json'
    with open(archive_json_path, 'w', encoding='utf-8') as f:
        json.dump({
            'metadata': {
                'archive_date': '2025-09-16',
                'reason': 'Partial extraction - insufficient content for 40 videos',
                'archived_channels': len(archived_data),
                'archived_videos': archived_videos
            },
            'data': archived_data
        }, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Archived data saved to: {archive_json_path}")
    
    # Update main dataset metadata
    remaining_channels = len(data['data'])
    remaining_videos = sum(len(ch['videos']) for ch in data['data'].values())
    
    data['metadata'] = {
        'extraction_date': '2025-09-16',
        'total_channels': remaining_channels,
        'total_videos': remaining_videos,
        'videos_per_channel': 40,
        'archived_partial_channels': len(partial_channels),
        'description': 'Clean dataset with exactly 25 channels × 40 videos each'
    }
    
    # Save cleaned dataset
    backup_path = 'extracted_data/api_only_complete_data_backup.json'
    shutil.copy('extracted_data/api_only_complete_data.json', backup_path)
    print(f"💾 Original data backed up to: {backup_path}")
    
    with open('extracted_data/api_only_complete_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Clean dataset saved")
    
    # Update CSV dataset too
    print("\n📊 Updating CSV dataset...")
    update_csv_dataset(data)
    
    # Summary
    print("\n✅ ARCHIVING COMPLETE")
    print("=" * 50)
    print(f"📈 Final dataset:")
    print(f"  Channels: {remaining_channels}")
    print(f"  Videos: {remaining_videos}")
    print(f"  Target achieved: {remaining_channels == 25 and remaining_videos == 1000}")
    print(f"\n📦 Archived:")
    print(f"  Channels: {len(partial_channels)}")
    print(f"  Videos: {archived_videos}")
    print(f"  Location: {archive_base}/")
    
    return remaining_channels, remaining_videos

def update_csv_dataset(data: Dict):
    """Update the CSV dataset to match the cleaned JSON"""
    
    # Collect all video records
    csv_records = []
    
    for channel_name, channel_data in data['data'].items():
        channel_info = channel_data['channel_info']
        
        for video in channel_data['videos']:
            record = {
                'channel_name': channel_name,
                'channel_id': channel_info.get('channel_id', ''),
                'subscriber_count': channel_info.get('subscriber_count', 0),
                'video_count': channel_info.get('video_count', 0),
                'genre': channel_data.get('genre', ''),
                'video_id': video['video_id'],
                'title': video['title'],
                'description': video['description'],
                'published_at': video['published_at'],
                'duration': video['duration'],
                'view_count': video['view_count'],
                'like_count': video['like_count'],
                'comment_count': video['comment_count'],
                'thumbnail_url': video['thumbnail_url'],
                'has_captions': video.get('caption_info', {}).get('has_captions', False),
                'caption_languages': ', '.join([
                    lang if isinstance(lang, str) else str(lang) 
                    for lang in video.get('caption_info', {}).get('languages', [])
                ]),
                'comments_sample': str(video.get('comments', [])[:3]) if video.get('comments') else '[]'
            }
            csv_records.append(record)
    
    # Save to CSV
    import pandas as pd
    df = pd.DataFrame(csv_records)
    
    # Backup original
    backup_csv = 'extracted_data/api_only_ml_dataset_backup.csv'
    if os.path.exists('extracted_data/api_only_ml_dataset.csv'):
        shutil.copy('extracted_data/api_only_ml_dataset.csv', backup_csv)
        print(f"💾 Original CSV backed up to: {backup_csv}")
    
    # Save cleaned CSV
    df.to_csv('extracted_data/api_only_ml_dataset.csv', index=False, encoding='utf-8')
    print(f"💾 Clean CSV saved: {len(df)} records")

def verify_clean_dataset():
    """Verify the cleaned dataset meets requirements"""
    
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    channels = len(data['data'])
    total_videos = sum(len(ch['videos']) for ch in data['data'].values())
    
    print("\n🔍 VERIFICATION")
    print("=" * 30)
    print(f"Channels: {channels} (target: 25)")
    print(f"Videos: {total_videos} (target: 1000)")
    print(f"Avg videos per channel: {total_videos / channels:.1f}")
    
    # Check each channel has exactly 40 videos
    all_forty = True
    for channel_name, channel_data in data['data'].items():
        video_count = len(channel_data['videos'])
        if video_count != 40:
            print(f"❌ {channel_name}: {video_count} videos")
            all_forty = False
    
    if all_forty:
        print("✅ All channels have exactly 40 videos")
    
    success = channels == 25 and total_videos == 1000 and all_forty
    print(f"\n{'✅ SUCCESS' if success else '❌ FAILED'}: Dataset meets 25×40 specification")
    
    return success

if __name__ == "__main__":
    try:
        channels, videos = archive_partial_channels()
        verify_clean_dataset()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
