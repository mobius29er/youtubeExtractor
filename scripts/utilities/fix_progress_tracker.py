#!/usr/bin/env python3
"""
Fix Progress Tracker - Remove incomplete channels
This script removes channels from progress tracker that have <40 videos
so they can be reprocessed properly.
"""

import json

def fix_progress_tracker():
    # Load main data
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Load progress tracker
    with open('extracted_data/progress_tracker.json', 'r', encoding='utf-8') as f:
        progress = json.load(f)
    
    print("=== FIXING PROGRESS TRACKER ===")
    print(f"Current progress tracker has: {len(progress['processed_channels'])} channels")
    
    # Find channels with <40 videos
    incomplete_channels = []
    complete_channels = []
    
    for channel_name in progress['processed_channels']:
        if channel_name in data['data']:
            video_count = len(data['data'][channel_name].get('videos', []))
            if video_count < 40:
                incomplete_channels.append(channel_name)
                print(f"❌ {channel_name}: {video_count} videos (INCOMPLETE - will remove)")
            else:
                complete_channels.append(channel_name)
                print(f"✅ {channel_name}: {video_count} videos (complete)")
        else:
            incomplete_channels.append(channel_name)
            print(f"❌ {channel_name}: Not found in data (INCOMPLETE - will remove)")
    
    # Update progress tracker with only complete channels
    progress['processed_channels'] = complete_channels
    
    # Save updated progress tracker
    with open('extracted_data/progress_tracker.json', 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2)
    
    print(f"\n=== RESULTS ===")
    print(f"Removed {len(incomplete_channels)} incomplete channels: {incomplete_channels}")
    print(f"Kept {len(complete_channels)} complete channels")
    print(f"Progress tracker now has: {len(complete_channels)} channels")
    print("\n✅ Incomplete channels will now be reprocessed on next run!")

if __name__ == "__main__":
    fix_progress_tracker()
