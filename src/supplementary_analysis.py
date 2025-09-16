#!/usr/bin/env python3
"""
Supplementary Analysis for YouTube Dataset
"""
import json
import random

def analyze_dataset():
    # Load data
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("📊 SUPPLEMENTARY ANALYSIS")
    print("=" * 60)
    
    # Process all videos
    all_videos = []
    for channel_name, channel_data in data.get('data', {}).items():
        videos = channel_data.get('videos', [])
        for video in videos:
            video['channel_name'] = channel_name
            video['genre'] = channel_data.get('genre', 'Unknown')
            all_videos.append(video)
    
    print(f"Total videos analyzed: {len(all_videos)}")
    
    # Top 5 by engagement
    print("\n🏆 TOP 5 BY ENGAGEMENT:")
    for video in all_videos[:5]:
        views = int(video.get('view_count', 0))
        likes = int(video.get('like_count', 0))
        engagement = (likes / views * 100) if views > 0 else 0
        title = video['title'][:50] + "..." if len(video['title']) > 50 else video['title']
        print(f"  • {title}")
        print(f"    {video['channel_name']} | {engagement:.1f}% engagement | {views:,} views")
    
    # Random samples by genre
    print("\n🎲 RANDOM SAMPLES BY GENRE:")
    genres = set(v['genre'] for v in all_videos)
    for genre in sorted(genres):
        genre_videos = [v for v in all_videos if v['genre'] == genre]
        if genre_videos:
            sample = random.choice(genre_videos)
            title = sample['title'][:40] + "..." if len(sample['title']) > 40 else sample['title']
            print(f"  {genre.replace('_', ' ').title()}: {title} ({sample['channel_name']})")
    
    # Channel tier analysis
    print("\n📈 CHANNEL DISTRIBUTION:")
    channels = data.get('data', {})
    tiers = {'Mega (100M+)': 0, 'Large (10M-100M)': 0, 'Medium (1M-10M)': 0, 'Small (<1M)': 0}
    
    for channel_data in channels.values():
        subs = channel_data.get('channel_data', {}).get('subscriber_count', 0)
        if subs >= 100000000:
            tiers['Mega (100M+)'] += 1
        elif subs >= 10000000:
            tiers['Large (10M-100M)'] += 1
        elif subs >= 1000000:
            tiers['Medium (1M-10M)'] += 1
        else:
            tiers['Small (<1M)'] += 1
    
    for tier, count in tiers.items():
        print(f"  {tier}: {count} channels")

if __name__ == "__main__":
    analyze_dataset()
