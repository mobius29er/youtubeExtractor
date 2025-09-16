#!/usr/bin/env python3
"""
Clean up comment files to match the final 25-channel dataset
"""

import json
import os
import shutil

def cleanup_comment_files():
    """Archive extra comment files and identify missing ones"""
    
    # Load current dataset
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    current_channels = set(data['data'].keys())
    archived_channels = {'Money Guy', 'Bind', 'Evan Raugust'}
    old_channels = {'Austen Alexander', 'Zach D. Films'}
    
    print("🧹 Cleaning Up Comment Files")
    print("=" * 50)
    
    # Create archive directory
    archive_dir = 'extracted_data/comments_archive'
    os.makedirs(archive_dir, exist_ok=True)
    
    # Get existing comment files
    comment_files = [f for f in os.listdir('extracted_data/comments_raw/') 
                    if f.endswith('_comments.json')]
    
    archived_count = 0
    
    # Process each comment file
    for file in comment_files:
        channel_name = file.replace('_comments.json', '').replace('_', ' ')
        file_path = f'extracted_data/comments_raw/{file}'
        
        # Check if this channel should be archived
        should_archive = False
        archive_reason = ""
        
        if channel_name in archived_channels:
            should_archive = True
            archive_reason = "partial channel"
        elif channel_name in old_channels:
            should_archive = True
            archive_reason = "old extraction"
        elif channel_name not in current_channels:
            # Check with underscore format
            underscore_name = channel_name.replace(' ', '_')
            if underscore_name not in {ch.replace(' ', '_') for ch in current_channels}:
                should_archive = True
                archive_reason = "not in final dataset"
        
        if should_archive:
            archive_path = f'{archive_dir}/{file}'
            shutil.move(file_path, archive_path)
            print(f"📦 Archived {file} ({archive_reason})")
            archived_count += 1
        else:
            print(f"✅ Keeping {file}")
    
    # Check for missing comment files
    print(f"\n🔍 Checking for missing comment files...")
    missing_files = []
    
    for channel_name in current_channels:
        # Check both formats
        underscore_name = channel_name.replace(' ', '_')
        expected_file = f'{underscore_name}_comments.json'
        file_path = f'extracted_data/comments_raw/{expected_file}'
        
        if not os.path.exists(file_path):
            missing_files.append(channel_name)
            print(f"❌ Missing: {expected_file}")
    
    # Summary
    print(f"\n📊 CLEANUP SUMMARY")
    print("=" * 30)
    print(f"Comment files archived: {archived_count}")
    print(f"Missing comment files: {len(missing_files)}")
    
    if missing_files:
        print(f"\n⚠️  Missing comment files for:")
        for channel in missing_files:
            # Check if comments exist in main JSON
            channel_data = data['data'][channel]
            videos_with_comments = sum(1 for v in channel_data['videos'] if v.get('comments'))
            total_comments = sum(len(v.get('comments', [])) for v in channel_data['videos'])
            print(f"  - {channel}: {videos_with_comments} videos have comments ({total_comments} total)")
            
            # These channels have comments in JSON but missing separate files
            # We can regenerate the files if needed
    
    return missing_files, archived_count

def regenerate_missing_comment_files(missing_channels):
    """Generate separate comment files for channels that have comments in JSON"""
    
    if not missing_channels:
        print("✅ No missing comment files to regenerate")
        return
    
    print(f"\n🔄 Regenerating missing comment files...")
    
    # Load dataset
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for channel_name in missing_channels:
        channel_data = data['data'][channel_name]
        
        # Extract all comments for this channel
        channel_comments = []
        for video in channel_data['videos']:
            video_comments = video.get('comments', [])
            if video_comments:
                channel_comments.extend([
                    {
                        'video_id': video['video_id'],
                        'video_title': video['title'],
                        'comments': video_comments
                    }
                ])
        
        if channel_comments:
            # Save to separate file
            underscore_name = channel_name.replace(' ', '_')
            output_file = f'extracted_data/comments_raw/{underscore_name}_comments.json'
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(channel_comments, f, indent=2, ensure_ascii=False)
            
            total_comments = sum(len(item['comments']) for item in channel_comments)
            print(f"✅ Generated {output_file}: {len(channel_comments)} videos, {total_comments} comments")
        else:
            print(f"⚠️  {channel_name}: No comments found in JSON data")

if __name__ == "__main__":
    try:
        missing_channels, archived_count = cleanup_comment_files()
        regenerate_missing_comment_files(missing_channels)
        
        print(f"\n🎉 Comment cleanup complete!")
        print(f"   Files archived: {archived_count}")
        print(f"   Files regenerated: {len(missing_channels)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
