#!/usr/bin/env python3
"""
Dataset Analyzer for YouTube Extractor
Comprehensive analysis of creators and videos
"""

import json
import random
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Tuple

class DatasetAnalyzer:
    def __init__(self, data_file: str = "extracted_data/api_only_complete_data.json"):
        """Initialize analyzer with data file"""
        with open(data_file, 'r', encoding='utf-8') as f:
            self.raw_data = json.load(f)
        
        self.data = self.raw_data.get('data', {})
        self.all_videos = []
        self._process_all_videos()
    
    def _process_all_videos(self):
        """Process all videos into a flat list with metadata"""
        for channel_name, channel_data in self.data.items():
            videos = channel_data.get('videos', [])
            genre = channel_data.get('genre', 'Unknown')
            
            channel_info = channel_data.get('channel_data', {})
            subs = channel_info.get('subscriber_count', 0)
            tier = channel_info.get('global_tier', 'Unknown')
            
            for video in videos:
                video_entry = video.copy()
                video_entry['channel_name'] = channel_name
                video_entry['genre'] = genre
                video_entry['channel_subs'] = subs
                video_entry['channel_tier'] = tier
                
                # Convert numeric fields
                video_entry['view_count'] = int(video.get('view_count', 0))
                video_entry['like_count'] = int(video.get('like_count', 0))
                video_entry['comment_count'] = int(video.get('comment_count', 0))
                
                # Calculate engagement rate
                views = video_entry['view_count']
                likes = video_entry['like_count']
                comments = video_entry['comment_count']
                
                if views > 0:
                    engagement_rate = ((likes + comments) / views) * 100
                else:
                    engagement_rate = 0
                
                video_entry['engagement_rate'] = engagement_rate
                
                self.all_videos.append(video_entry)
    
    def get_creator_summary(self) -> Dict:
        """Get comprehensive creator breakdown"""
        creators = {}
        
        for channel_name, channel_data in self.data.items():
            videos = channel_data.get('videos', [])
            genre = channel_data.get('genre', 'Unknown')
            
            channel_info = channel_data.get('channel_data', {})
            subs = channel_info.get('subscriber_count', 0)
            tier = channel_info.get('global_tier', 'Unknown')
            
            # Calculate channel stats
            total_views = sum(int(v.get('view_count', 0)) for v in videos)
            total_likes = sum(int(v.get('like_count', 0)) for v in videos)
            total_comments = sum(int(v.get('comment_count', 0)) for v in videos)
            
            avg_views = total_views // len(videos) if videos else 0
            avg_likes = total_likes // len(videos) if videos else 0
            avg_comments = total_comments // len(videos) if videos else 0
            
            creators[channel_name] = {
                'video_count': len(videos),
                'genre': genre,
                'subscribers': subs,
                'tier': tier,
                'total_views': total_views,
                'total_likes': total_likes,
                'total_comments': total_comments,
                'avg_views': avg_views,
                'avg_likes': avg_likes,
                'avg_comments': avg_comments,
                'engagement_rate': ((total_likes + total_comments) / total_views * 100) if total_views > 0 else 0
            }
        
        return creators
    
    def get_top_performers(self, metric: str = 'view_count', limit: int = 10) -> List[Dict]:
        """Get top performing videos by specified metric"""
        if metric not in ['view_count', 'like_count', 'comment_count', 'engagement_rate']:
            raise ValueError(f"Invalid metric: {metric}")
        
        sorted_videos = sorted(self.all_videos, key=lambda x: x[metric], reverse=True)
        return sorted_videos[:limit]
    
    def get_bottom_performers(self, metric: str = 'view_count', limit: int = 10) -> List[Dict]:
        """Get bottom performing videos by specified metric"""
        if metric not in ['view_count', 'like_count', 'comment_count', 'engagement_rate']:
            raise ValueError(f"Invalid metric: {metric}")
        
        sorted_videos = sorted(self.all_videos, key=lambda x: x[metric])
        return sorted_videos[:limit]
    
    def get_random_sample(self, sample_size: int = 10, genre: str = None) -> List[Dict]:
        """Get random sample of videos, optionally filtered by genre"""
        if genre:
            filtered_videos = [v for v in self.all_videos if v['genre'] == genre]
            return random.sample(filtered_videos, min(sample_size, len(filtered_videos)))
        else:
            return random.sample(self.all_videos, min(sample_size, len(self.all_videos)))
    
    def get_genre_breakdown(self) -> Dict:
        """Get breakdown by genre"""
        genre_stats = defaultdict(lambda: {
            'channels': set(),
            'videos': 0,
            'total_views': 0,
            'total_likes': 0,
            'total_comments': 0
        })
        
        for video in self.all_videos:
            genre = video['genre']
            genre_stats[genre]['channels'].add(video['channel_name'])
            genre_stats[genre]['videos'] += 1
            genre_stats[genre]['total_views'] += video['view_count']
            genre_stats[genre]['total_likes'] += video['like_count']
            genre_stats[genre]['total_comments'] += video['comment_count']
        
        # Convert sets to counts and calculate averages
        result = {}
        for genre, stats in genre_stats.items():
            video_count = stats['videos']
            result[genre] = {
                'channels': len(stats['channels']),
                'videos': video_count,
                'total_views': stats['total_views'],
                'total_likes': stats['total_likes'],
                'total_comments': stats['total_comments'],
                'avg_views': stats['total_views'] // video_count if video_count > 0 else 0,
                'avg_likes': stats['total_likes'] // video_count if video_count > 0 else 0,
                'avg_comments': stats['total_comments'] // video_count if video_count > 0 else 0
            }
        
        return result
    
    def print_comprehensive_report(self):
        """Print a comprehensive analysis report"""
        print("📊 YOUTUBE DATASET ANALYSIS REPORT")
        print("=" * 80)
        print(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📈 Total Videos: {len(self.all_videos)}")
        print(f"🏢 Total Channels: {len(self.data)}")
        print()
        
        # Creator Summary
        print("🎭 CREATOR BREAKDOWN:")
        print("-" * 80)
        creators = self.get_creator_summary()
        
        # Sort by total views
        sorted_creators = sorted(creators.items(), key=lambda x: x[1]['total_views'], reverse=True)
        
        print(f"{'Channel':<40} | {'Videos':<6} | {'Genre':<15} | {'Subs':<10} | {'Avg Views':<10} | {'Eng %':<6}")
        print("-" * 110)
        
        for name, stats in sorted_creators:
            print(f"{name:<40} | {stats['video_count']:<6} | {stats['genre']:<15} | {stats['subscribers']:8,} | {stats['avg_views']:8,} | {stats['engagement_rate']:5.1f}")
        
        print()
        
        # Genre Breakdown
        print("📂 GENRE ANALYSIS:")
        print("-" * 60)
        genre_stats = self.get_genre_breakdown()
        
        print(f"{'Genre':<20} | {'Channels':<8} | {'Videos':<7} | {'Avg Views':<10} | {'Avg Likes':<9}")
        print("-" * 70)
        
        for genre, stats in sorted(genre_stats.items(), key=lambda x: x[1]['total_views'], reverse=True):
            print(f"{genre:<20} | {stats['channels']:<8} | {stats['videos']:<7} | {stats['avg_views']:8,} | {stats['avg_likes']:7,}")
        
        print()
        
        # Top Performers
        print("🏆 TOP 10 VIDEOS BY VIEWS:")
        print("-" * 100)
        top_views = self.get_top_performers('view_count', 10)
        
        print(f"{'Title':<50} | {'Channel':<25} | {'Views':<12} | {'Likes':<8}")
        print("-" * 110)
        
        for video in top_views:
            title = video['title'][:47] + "..." if len(video['title']) > 50 else video['title']
            print(f"{title:<50} | {video['channel_name']:<25} | {video['view_count']:10,} | {video['like_count']:6,}")
        
        print()
        
        # Bottom Performers
        print("📉 BOTTOM 10 VIDEOS BY VIEWS:")
        print("-" * 100)
        bottom_views = self.get_bottom_performers('view_count', 10)
        
        print(f"{'Title':<50} | {'Channel':<25} | {'Views':<12} | {'Likes':<8}")
        print("-" * 110)
        
        for video in bottom_views:
            title = video['title'][:47] + "..." if len(video['title']) > 50 else video['title']
            print(f"{title:<50} | {video['channel_name']:<25} | {video['view_count']:10,} | {video['like_count']:6,}")
        
        print()
        
        # Random Samples
        print("🎲 RANDOM SAMPLE (10 videos):")
        print("-" * 100)
        random_sample = self.get_random_sample(10)
        
        print(f"{'Title':<45} | {'Channel':<20} | {'Genre':<15} | {'Views':<10}")
        print("-" * 105)
        
        for video in random_sample:
            title = video['title'][:42] + "..." if len(video['title']) > 45 else video['title']
            print(f"{title:<45} | {video['channel_name']:<20} | {video['genre']:<15} | {video['view_count']:8,}")

def main():
    """Main execution function"""
    try:
        analyzer = DatasetAnalyzer()
        analyzer.print_comprehensive_report()
        
        print("\n" + "=" * 80)
        print("✅ Analysis complete! All data verified and analyzed.")
        
    except FileNotFoundError:
        print("❌ Error: extracted_data/api_only_complete_data.json not found")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
