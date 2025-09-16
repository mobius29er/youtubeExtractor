#!/usr/bin/env python3
import os
"""
YouTube Data Quality Analysis
Analyzes the extracted YouTube data for accuracy and completeness
"""

import pandas as pd
import numpy as np
from datetime import datetime

def analyze_youtube_data():
    """Comprehensive analysis of extracted YouTube data"""
    
    print("🔍 YOUTUBE DATA QUALITY ANALYSIS")
    print("=" * 50)
    
    # Load the data
    df = pd.read_csv('extracted_data/api_only_ml_SAFE.csv') if os.path.exists('extracted_data/api_only_ml_SAFE.csv') else pd.read_csv('extracted_data/api_only_ml_dataset.csv')
    
    # Basic statistics
    print(f"📊 BASIC STATISTICS:")
    print(f"   • Total videos extracted: {len(df):,}")
    print(f"   • Unique channels: {df['channel_name'].nunique()}")
    print(f"   • Date range: {df['published_at'].min()} to {df['published_at'].max()}")
    print(f"   • Missing values: {df.isnull().sum().sum()}")
    
    # Channel breakdown
    print(f"\n📈 CHANNEL DISTRIBUTION:")
    channel_counts = df['channel_name'].value_counts()
    for channel, count in channel_counts.items():
        print(f"   • {channel}: {count} videos")
    
    # View statistics
    print(f"\n👀 VIEW STATISTICS:")
    total_views = df['view_count'].sum()
    avg_views = df['view_count'].mean()
    median_views = df['view_count'].median()
    
    print(f"   • Total views: {total_views:,.0f}")
    print(f"   • Average views per video: {avg_views:,.0f}")
    print(f"   • Median views: {median_views:,.0f}")
    
    # Top performers
    print(f"\n🏆 TOP 5 MOST VIEWED VIDEOS:")
    top_videos = df.nlargest(5, 'view_count')
    for i, (_, row) in enumerate(top_videos.iterrows(), 1):
        title = row['title'][:60] + '...' if len(row['title']) > 60 else row['title']
        print(f"   {i}. {row['view_count']:,.0f} views - {title}")
        print(f"      Channel: {row['channel_name']}")
    
    # Channel performance
    print(f"\n🎯 CHANNEL PERFORMANCE (by total views):")
    channel_stats = df.groupby('channel_name').agg({
        'view_count': ['sum', 'mean'],
        'like_count': 'sum',
        'comment_count': 'sum'
    }).round(0)
    
    channel_stats.columns = ['total_views', 'avg_views', 'total_likes', 'total_comments']
    channel_stats = channel_stats.sort_values('total_views', ascending=False)
    
    for channel, stats in channel_stats.iterrows():
        print(f"   • {channel}:")
        print(f"     - Total views: {stats['total_views']:,.0f}")
        print(f"     - Avg views/video: {stats['avg_views']:,.0f}")
        print(f"     - Total likes: {stats['total_likes']:,.0f}")
    
    # Data quality assessment
    print(f"\n✅ DATA QUALITY ASSESSMENT:")
    
    # Check for complete records
    complete_records = len(df.dropna())
    completeness = (complete_records / len(df)) * 100
    print(f"   • Complete records: {complete_records}/{len(df)} ({completeness:.1f}%)")
    
    # Check data consistency
    consistent_channel_counts = all(count == 40 for count in channel_counts.values())
    print(f"   • Consistent channel sampling: {'✅ Yes' if consistent_channel_counts else '❌ No'}")
    
    # Check for duplicate videos
    duplicates = df['video_id'].duplicated().sum()
    print(f"   • Duplicate videos: {duplicates} ({'✅ None' if duplicates == 0 else '⚠️ Found'})")
    
    # Overall health score

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
    health_factors = [
        completeness > 95,  # High completeness
        consistent_channel_counts,  # Consistent sampling
        duplicates == 0,  # No duplicates
        len(df) > 500,  # Good volume
        df['channel_name'].nunique() >= 10  # Good diversity
    ]
    
    health_score = sum(health_factors) / len(health_factors) * 100
    
    print(f"\n🎉 OVERALL DATA HEALTH SCORE: {health_score:.0f}%")
    
    if health_score >= 80:
        print("   ✅ EXCELLENT - Data is high quality and ready for analysis!")
    elif health_score >= 60:
        print("   ⚠️  GOOD - Data is usable with minor issues")
    else:
        print("   ❌ POOR - Data has significant quality issues")
    
    return df, health_score

if __name__ == "__main__":
    df, score = analyze_youtube_data()
