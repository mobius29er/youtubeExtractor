#!/usr/bin/env python3
"""
Thumbnail Archive Script
Archives thumbnails that don't correspond to videos in the final dataset.
Preserves all data by moving extra thumbnails to an archive folder.
"""

import json
import os
import shutil
from typing import Dict, Set

def load_final_data() -> Dict:
    """Load the final extraction data."""
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_video_ids(data: Dict) -> Dict[str, Set[str]]:
    """Get all video IDs by channel from the final dataset."""
    channel_video_ids = {}
    
    for channel_name, channel_data in data['data'].items():
        videos = channel_data['videos']
        video_ids = {video['video_id'] for video in videos}
        
        # Convert channel name to folder format (spaces to underscores)
        folder_name = channel_name.replace(' ', '_')
        channel_video_ids[folder_name] = video_ids
        
    return channel_video_ids

def cleanup_thumbnails(channel_video_ids: Dict[str, Set[str]], dry_run: bool = True) -> Dict:
    """Archive extra thumbnails to a separate folder."""
    base_dir = 'extracted_data/thumbnails'
    archive_dir = 'extracted_data/thumbnails_archive'
    
    results = {
        'channels_processed': 0,
        'thumbnails_kept': 0,
        'thumbnails_archived': 0,
        'space_organized_mb': 0,
        'details': {}
    }
    
    # Create archive directory structure if not dry run
    if not dry_run:
        os.makedirs(archive_dir, exist_ok=True)
    
    for channel_name, video_ids in channel_video_ids.items():
        channel_dir = os.path.join(base_dir, channel_name)
        archive_channel_dir = os.path.join(archive_dir, channel_name)
        
        if not os.path.exists(channel_dir):
            print(f"❌ Channel directory not found: {channel_name}")
            continue
            
        # Get all thumbnail files
        thumbnail_files = [f for f in os.listdir(channel_dir) if f.endswith('.jpg')]
        
        kept = 0
        archived = 0
        space_organized = 0
        
        for thumb_file in thumbnail_files:
            video_id = thumb_file.split('.')[0]
            thumb_path = os.path.join(channel_dir, thumb_file)
            
            if video_id in video_ids:
                # Keep this thumbnail in active directory
                kept += 1
            else:
                # Archive this thumbnail
                if not dry_run:
                    # Create archive channel directory if needed
                    os.makedirs(archive_channel_dir, exist_ok=True)
                    
                    # Move thumbnail to archive
                    archive_path = os.path.join(archive_channel_dir, thumb_file)
                    file_size = os.path.getsize(thumb_path)
                    shutil.move(thumb_path, archive_path)
                    space_organized += file_size
                else:
                    try:
                        space_organized += os.path.getsize(thumb_path)
                    except:
                        pass
                archived += 1
        
        results['channels_processed'] += 1
        results['thumbnails_kept'] += kept
        results['thumbnails_archived'] += archived
        results['space_organized_mb'] += space_organized / (1024 * 1024)
        
        results['details'][channel_name] = {
            'kept': kept,
            'archived': archived,
            'space_organized_mb': space_organized / (1024 * 1024)
        }
        
        if archived > 0:
            action = "Would archive" if dry_run else "Archived"
            print(f"📁 {channel_name}: {kept} kept, {action} {archived} extra thumbnails ({space_organized/1024/1024:.1f} MB)")
        else:
            print(f"✅ {channel_name}: {kept} thumbnails, all match final dataset")
    
    return results

def main():
    print("📦 Thumbnail Archive Analysis")
    print("=" * 50)
    
    # Load data
    data = load_final_data()
    channel_video_ids = get_all_video_ids(data)
    
    print(f"📊 Final dataset: {len(channel_video_ids)} channels")
    total_videos = sum(len(ids) for ids in channel_video_ids.values())
    print(f"📊 Total videos: {total_videos}")
    print()
    
    # Dry run first
    print("🔍 DRY RUN - Analyzing extra thumbnails...")
    print("-" * 50)
    
    results = cleanup_thumbnails(channel_video_ids, dry_run=True)
    
    print("\n📈 SUMMARY")
    print("=" * 50)
    print(f"Channels processed: {results['channels_processed']}")
    print(f"Thumbnails to keep: {results['thumbnails_kept']}")
    print(f"Extra thumbnails found: {results['thumbnails_archived']}")
    print(f"Space to organize: {results['space_organized_mb']:.1f} MB")
    
    if results['thumbnails_archived'] > 0:
        print(f"\n💡 To archive the extra thumbnails, run:")
        print(f"   python cleanup_thumbnails.py --execute")
        print(f"\n📂 Extra thumbnails will be moved to: extracted_data/thumbnails_archive/")
    else:
        print(f"\n✅ No extra thumbnails found! All thumbnails match the final dataset.")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--execute":
        print("📦 EXECUTING THUMBNAIL ARCHIVING")
        print("=" * 50)
        
        data = load_final_data()
        channel_video_ids = get_all_video_ids(data)
        
        results = cleanup_thumbnails(channel_video_ids, dry_run=False)
        
        print("\n✅ ARCHIVING COMPLETE")
        print("=" * 50)
        print(f"Thumbnails archived: {results['thumbnails_archived']}")
        print(f"Space organized: {results['space_organized_mb']:.1f} MB")
        print(f"📂 Archived thumbnails location: extracted_data/thumbnails_archive/")
    else:
        main()
