#!/usr/bin/env python3
"""
Final Dataset Integrity Report
Complete analysis of the finished YouTube extraction dataset
"""

import json
import os
from datetime import datetime
from collections import defaultdict

def analyze_final_dataset():
    """Comprehensive analysis of the completed dataset"""
    
    print("🎯 FINAL DATASET INTEGRITY REPORT")
    print("=" * 60)
    
    # Load main data
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Load progress tracker
    with open('extracted_data/progress_tracker.json', 'r', encoding='utf-8') as f:
        progress = json.load(f)
    
    # Basic statistics
    extraction_date = data.get('extraction_date', 'Unknown')
    metadata_channels = data.get('channels_processed', 0)
    metadata_videos = data.get('videos_selected', 0)
    quota_used = data.get('quota_used', 0)
    
    print(f"📅 Extraction Completed: {extraction_date}")
    print(f"⚡ API Quota Used: {quota_used:,} units")
    print()
    
    # Actual data analysis
    channels_data = data.get('data', {})
    actual_channels = len(channels_data)
    
    # Count actual videos and analyze channels
    channel_stats = []
    total_videos = 0
    genre_stats = defaultdict(lambda: {'channels': 0, 'videos': 0, 'subs': 0})
    tier_stats = defaultdict(lambda: {'channels': 0, 'videos': 0})
    replacement_channels = []
    
    for channel_name, channel_info in channels_data.items():
        videos = channel_info.get('videos', [])
        video_count = len(videos)
        total_videos += video_count
        
        # Get channel details
        channel_data = channel_info.get('channel_data', {})
        subs = channel_data.get('subscriber_count', 0)
        genre = channel_info.get('genre', 'unknown')
        tier = channel_data.get('global_tier', 'unknown')
        
        # Check if replacement channel
        if channel_name in ['Money Guy', 'Bind', 'Evan Raugust', 'Floydson']:
            replacement_channels.append({
                'name': channel_name,
                'videos': video_count,
                'reason': 'Original channel had insufficient videos' if video_count < 40 else 'Replacement channel'
            })
        
        channel_stats.append({
            'name': channel_name,
            'videos': video_count,
            'subs': subs,
            'genre': genre,
            'tier': tier
        })
        
        # Update genre stats
        genre_stats[genre]['channels'] += 1
        genre_stats[genre]['videos'] += video_count
        genre_stats[genre]['subs'] += subs
        
        # Update tier stats
        tier_stats[tier]['channels'] += 1
        tier_stats[tier]['videos'] += video_count
    
    print("📊 DATASET OVERVIEW:")
    print(f"  Channels in metadata: {metadata_channels}")
    print(f"  Channels with data: {actual_channels}")
    print(f"  Videos in metadata: {metadata_videos}")
    print(f"  Videos with data: {total_videos}")
    print(f"  Progress tracker channels: {len(progress['processed_channels'])}")
    print()
    
    # Data integrity check
    print("🔍 DATA INTEGRITY:")
    integrity_issues = []
    
    if metadata_channels != actual_channels:
        integrity_issues.append(f"Channel count mismatch: metadata={metadata_channels}, actual={actual_channels}")
    
    if metadata_videos != total_videos:
        integrity_issues.append(f"Video count mismatch: metadata={metadata_videos}, actual={total_videos}")
    
    if actual_channels != len(progress['processed_channels']):
        integrity_issues.append(f"Progress tracker mismatch: tracker={len(progress['processed_channels'])}, data={actual_channels}")
    
    if integrity_issues:
        print("  ❌ Issues found:")
        for issue in integrity_issues:
            print(f"    • {issue}")
    else:
        print("  ✅ All data integrity checks passed")
    print()
    
    # Replacement channels analysis
    print("🔄 REPLACEMENT CHANNELS ANALYSIS:")
    if replacement_channels:
        for replacement in replacement_channels:
            print(f"  • {replacement['name']}: {replacement['videos']} videos - {replacement['reason']}")
        
        replacement_videos = sum(r['videos'] for r in replacement_channels)
        print(f"  📊 Total replacement videos: {replacement_videos}")
    else:
        print("  ✅ No replacement channels detected")
    print()
    
    # Genre breakdown
    print("📂 GENRE BREAKDOWN:")
    for genre, stats in sorted(genre_stats.items()):
        avg_subs = stats['subs'] // stats['channels'] if stats['channels'] > 0 else 0
        print(f"  {genre.replace('_', ' ').title():20} | {stats['channels']:2d} channels | {stats['videos']:3d} videos | {avg_subs:8,} avg subs")
    print()
    
    # Creator tier analysis
    print("🏆 CREATOR TIER BREAKDOWN:")
    for tier in ['Mega', 'Large', 'Medium', 'Small']:
        if tier in tier_stats:
            stats = tier_stats[tier]
            print(f"  {tier:8} | {stats['channels']:2d} channels | {stats['videos']:3d} videos")
    print()
    
    # Top and bottom performers
    print("🎯 PERFORMANCE ANALYSIS:")
    
    # Sort by subscriber count
    channel_stats.sort(key=lambda x: x['subs'], reverse=True)
    
    print("  🔝 TOP 5 CHANNELS (by subscribers):")
    for i, channel in enumerate(channel_stats[:5], 1):
        print(f"    {i}. {channel['name']:30} | {channel['subs']:10,} subs | {channel['videos']:2d} videos")
    
    print("\n  📉 BOTTOM 5 CHANNELS (by subscribers):")
    for i, channel in enumerate(channel_stats[-5:], 1):
        print(f"    {i}. {channel['name']:30} | {channel['subs']:10,} subs | {channel['videos']:2d} videos")
    
    print("\n  📊 CHANNELS WITH NON-STANDARD VIDEO COUNTS:")
    non_standard = [ch for ch in channel_stats if ch['videos'] != 40]
    if non_standard:
        for channel in sorted(non_standard, key=lambda x: x['videos']):
            print(f"    • {channel['name']:30} | {channel['videos']:2d} videos | {channel['subs']:8,} subs")
    else:
        print("    ✅ All channels have standard 40 video count")
    
    print()
    
    # Goal achievement
    print("🎯 GOAL ACHIEVEMENT:")
    target = 1000
    progress_pct = (total_videos / target) * 100
    remaining = target - total_videos
    
    print(f"  Target: {target:,} videos")
    print(f"  Achieved: {total_videos:,} videos")
    print(f"  Progress: {progress_pct:.1f}%")
    
    if total_videos >= target:
        print(f"  🎉 GOAL ACHIEVED! (+{total_videos - target} videos)")
    else:
        print(f"  📋 Remaining: {remaining} videos needed")
    
    print()
    
    # Data quality assessment
    print("🏥 DATASET HEALTH ASSESSMENT:")
    health_score = 100
    
    # Deduct points for issues
    if integrity_issues:
        health_score -= len(integrity_issues) * 10
    
    if replacement_channels:
        health_score -= len(replacement_channels) * 5
    
    non_forty_count = len([ch for ch in channel_stats if ch['videos'] != 40])
    if non_forty_count > 0:
        health_score -= non_forty_count * 3
    
    if health_score >= 90:
        status = "EXCELLENT"
        color = "🟢"
    elif health_score >= 70:
        status = "GOOD"
        color = "🟡"
    elif health_score >= 50:
        status = "FAIR"
        color = "🟠"
    else:
        status = "NEEDS ATTENTION"
        color = "🔴"
    
    print(f"  {color} Health Score: {health_score}/100 ({status})")
    
    return {
        'total_channels': actual_channels,
        'total_videos': total_videos,
        'health_score': health_score,
        'integrity_issues': integrity_issues,
        'replacement_channels': replacement_channels
    }

if __name__ == "__main__":
    try:
        results = analyze_final_dataset()
        print(f"\n✅ Analysis complete! Dataset has {results['total_videos']} videos across {results['total_channels']} channels.")
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
