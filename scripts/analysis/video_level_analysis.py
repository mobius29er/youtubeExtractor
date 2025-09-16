#!/usr/bin/env python3
"""
Video-Level Analysis Script
Analyze individual videos for top performers, bottom performers, and random samples
"""

import json
import random
from datetime import datetime

def analyze_videos():
    """Analyze individual videos in the dataset"""
    
    print("🎬 VIDEO-LEVEL ANALYSIS")
    print("=" * 60)
    
    # Load data
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract all videos with metadata
    all_videos = []
    
    for channel_name, channel_info in data.get('data', {}).items():
        videos = channel_info.get('videos', [])
        channel_data = channel_info.get('channel_data', {})
        channel_subs = channel_data.get('subscriber_count', 0)
        genre = channel_info.get('genre', 'unknown')
        
        for video in videos:
            video_entry = {
                'channel': channel_name,
                'channel_subs': channel_subs,
                'genre': genre,
                'video_id': video.get('video_id', ''),
                'title': video.get('title', '')[:80] + ('...' if len(video.get('title', '')) > 80 else ''),
                'views': int(video.get('view_count', 0)),
                'likes': int(video.get('like_count', 0)),
                'comments': int(video.get('comment_count', 0)),
                'duration': video.get('duration', ''),
                'published': video.get('published_at', '')[:10]  # Just date part
            }
            all_videos.append(video_entry)
    
    print(f"📊 Total Videos Analyzed: {len(all_videos):,}")
    print()
    
    # Sort by views for top/bottom analysis
    videos_by_views = sorted(all_videos, key=lambda x: x['views'], reverse=True)
    
    # TOP PERFORMERS
    print("🏆 TOP 10 PERFORMING VIDEOS (by views):")
    print("Rank | Channel                     | Title                                    | Views      | Likes   | Comments")
    print("-" * 120)
    for i, video in enumerate(videos_by_views[:10], 1):
        print(f"{i:4d} | {video['channel'][:25]:25} | {video['title'][:40]:40} | {video['views']:10,} | {video['likes']:7,} | {video['comments']:8,}")
    
    print()
    
    # BOTTOM PERFORMERS
    print("📉 BOTTOM 10 PERFORMING VIDEOS (by views):")
    print("Rank | Channel                     | Title                                    | Views      | Likes   | Comments")
    print("-" * 120)
    bottom_videos = videos_by_views[-10:]
    for i, video in enumerate(bottom_videos, 1):
        print(f"{i:4d} | {video['channel'][:25]:25} | {video['title'][:40]:40} | {video['views']:10,} | {video['likes']:7,} | {video['comments']:8,}")
    
    print()
    
    # RANDOM SAMPLE
    print("🎲 RANDOM SAMPLE (10 videos):")
    print("     | Channel                     | Title                                    | Views      | Likes   | Comments")
    print("-" * 120)
    random_sample = random.sample(all_videos, 10)
    for i, video in enumerate(random_sample, 1):
        print(f"{i:4d} | {video['channel'][:25]:25} | {video['title'][:40]:40} | {video['views']:10,} | {video['likes']:7,} | {video['comments']:8,}")
    
    print()
    
    # ENGAGEMENT ANALYSIS
    print("📈 ENGAGEMENT METRICS:")
    
    # Calculate engagement rates (likes per view)
    for video in all_videos:
        if video['views'] > 0:
            video['like_rate'] = (video['likes'] / video['views']) * 100
            video['comment_rate'] = (video['comments'] / video['views']) * 100
        else:
            video['like_rate'] = 0
            video['comment_rate'] = 0
    
    # Top engagement
    videos_by_engagement = sorted(all_videos, key=lambda x: x['like_rate'], reverse=True)
    
    print("  🔥 TOP 5 VIDEOS BY ENGAGEMENT RATE (likes/views):")
    for i, video in enumerate(videos_by_engagement[:5], 1):
        print(f"    {i}. {video['channel'][:20]:20} | {video['like_rate']:5.2f}% | {video['views']:8,} views | {video['likes']:6,} likes")
    
    print()
    
    # GENRE PERFORMANCE
    print("📂 PERFORMANCE BY GENRE:")
    genre_stats = {}
    
    for video in all_videos:
        genre = video['genre']
        if genre not in genre_stats:
            genre_stats[genre] = {'videos': 0, 'total_views': 0, 'total_likes': 0}
        
        genre_stats[genre]['videos'] += 1
        genre_stats[genre]['total_views'] += video['views']
        genre_stats[genre]['total_likes'] += video['likes']
    
    for genre, stats in sorted(genre_stats.items()):
        avg_views = stats['total_views'] // stats['videos'] if stats['videos'] > 0 else 0
        avg_likes = stats['total_likes'] // stats['videos'] if stats['videos'] > 0 else 0
        print(f"  {genre.replace('_', ' ').title():20} | {stats['videos']:3d} videos | {avg_views:8,} avg views | {avg_likes:6,} avg likes")
    
    print()
    
    # SUMMARY STATISTICS
    total_views = sum(v['views'] for v in all_videos)
    total_likes = sum(v['likes'] for v in all_videos)
    total_comments = sum(v['comments'] for v in all_videos)
    
    avg_views = total_views // len(all_videos)
    avg_likes = total_likes // len(all_videos)
    avg_comments = total_comments // len(all_videos)
    
    print("📊 DATASET SUMMARY STATISTICS:")
    print(f"  Total Views Across Dataset: {total_views:,}")
    print(f"  Total Likes Across Dataset: {total_likes:,}")
    print(f"  Total Comments Across Dataset: {total_comments:,}")
    print(f"  Average Views per Video: {avg_views:,}")
    print(f"  Average Likes per Video: {avg_likes:,}")
    print(f"  Average Comments per Video: {avg_comments:,}")
    print(f"  Overall Engagement Rate: {(total_likes/total_views)*100:.2f}% (likes/views)")
    
    return {
        'total_videos': len(all_videos),
        'total_views': total_views,
        'avg_views': avg_views,
        'top_video': videos_by_views[0] if videos_by_views else None,
        'bottom_video': videos_by_views[-1] if videos_by_views else None
    }

if __name__ == "__main__":
    try:
        # Set random seed for reproducible random samples

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
        random.seed(42)
        results = analyze_videos()
        print(f"\n✅ Video analysis complete!")
    except Exception as e:
        print(f"❌ Error during video analysis: {e}")
