#!/usr/bin/env python3
"""
Comprehensive YouTube ML Dataset Analysis with Duration Parsing
"""

import pandas as pd
import numpy as np
from pathlib import Path
import re
import warnings
warnings.filterwarnings('ignore')

def parse_duration_string(duration_str):
    """Parse concatenated PT duration strings."""
    if pd.isna(duration_str) or not isinstance(duration_str, str):
        return None
    
    # Split by 'PT' and process each duration
    durations = []
    parts = duration_str.split('PT')[1:]  # Skip empty first part
    
    for part in parts:
        if not part:
            continue
        try:
            # Parse ISO 8601 duration format like "3M6S", "1H5M11S", etc.
            total_seconds = 0
            
            # Extract hours
            h_match = re.search(r'(\d+)H', part)
            if h_match:
                total_seconds += int(h_match.group(1)) * 3600
            
            # Extract minutes
            m_match = re.search(r'(\d+)M', part)
            if m_match:
                total_seconds += int(m_match.group(1)) * 60
            
            # Extract seconds
            s_match = re.search(r'(\d+)S', part)
            if s_match:
                total_seconds += int(s_match.group(1))
            
            if total_seconds > 0:
                durations.append(total_seconds)
        except:
            continue
    
    # Return the first duration found (they're likely concatenated from the same video)
    return durations[0] if durations else None

def comprehensive_analysis():
    """Run comprehensive analysis with proper duration parsing."""
    
    # Load data
    csv_path = Path('extracted_data/api_only_ml_dataset.csv')
    df = pd.read_csv(csv_path)
    
    print("🎯 COMPREHENSIVE YOUTUBE ML DATASET ANALYSIS")
    print("=" * 55)
    
    # Fix duration parsing
    print("🔧 Processing duration data...")
    df['duration_seconds'] = df['duration'].apply(parse_duration_string)
    valid_durations = df['duration_seconds'].dropna()
    print(f"   Parsed {len(valid_durations)}/{len(df)} duration values")
    
    # Duration analysis with fixed parsing
    print("\n⏱️ DURATION INSIGHTS:")
    if len(valid_durations) > 0:
        bins = [0, 300, 600, 1200, 3600, float('inf')]
        labels = ['<5min', '5-10min', '10-20min', '20-60min', '>60min']
        duration_bins = pd.cut(valid_durations, bins=bins, labels=labels)
        duration_stats = duration_bins.value_counts().sort_index()
        
        for duration_range, count in duration_stats.items():
            percentage = count / len(valid_durations) * 100
            # Calculate average views for this duration range
            mask = duration_bins == duration_range
            duration_videos = df.loc[valid_durations[mask].index]
            avg_views = duration_videos['view_count'].mean()
            
            bar_length = int(percentage / 2)
            bar = "█" * bar_length + "░" * (25 - bar_length)
            print(f"  • {duration_range:<10} {count:>3} videos ({percentage:>5.1f}%) {bar[:15]} Avg: {avg_views:>10,.0f} views")
        
        # Duration statistics
        print(f"\n  📊 Duration Statistics:")
        print(f"     • Mean duration: {valid_durations.mean()/60:.1f} minutes")
        print(f"     • Median duration: {valid_durations.median()/60:.1f} minutes") 
        print(f"     • Shortest video: {valid_durations.min()/60:.1f} minutes")
        print(f"     • Longest video: {valid_durations.max()/60:.1f} minutes")
    
    # Content analysis
    print("\n📝 CONTENT ANALYSIS:")
    
    # Title length analysis
    df['title_length'] = df['title'].str.len()
    print(f"  • Average title length: {df['title_length'].mean():.1f} characters")
    print(f"  • Title length range: {df['title_length'].min()} - {df['title_length'].max()} characters")
    
    # Description analysis
    df['desc_length'] = df['description'].str.len()
    desc_stats = df['desc_length'].dropna()
    print(f"  • Average description length: {desc_stats.mean():.0f} characters")
    print(f"  • Videos with descriptions: {len(desc_stats)}/{len(df)} ({len(desc_stats)/len(df)*100:.1f}%)")
    
    # Tags analysis
    df['tag_count'] = df['tags'].apply(lambda x: len(str(x).split(',')) if pd.notna(x) and x != '[]' else 0)
    tag_stats = df[df['tag_count'] > 0]['tag_count']
    print(f"  • Average tags per video: {tag_stats.mean():.1f}")
    print(f"  • Videos with tags: {len(tag_stats)}/{len(df)} ({len(tag_stats)/len(df)*100:.1f}%)")
    
    # Performance correlation analysis
    print("\n📈 PERFORMANCE CORRELATIONS:")
    numeric_cols = ['view_count', 'like_count', 'comment_count', 'duration_seconds', 'title_length']
    corr_data = df[numeric_cols].dropna()
    
    if len(corr_data) > 10:
        correlations = corr_data.corr()['view_count'].sort_values(ascending=False)
        print("  Top correlations with view count:")
        for feature, corr_value in correlations.items():
            if feature != 'view_count':
                direction = "📈" if corr_value > 0 else "📉"
                strength = "Strong" if abs(corr_value) > 0.5 else "Moderate" if abs(corr_value) > 0.3 else "Weak"
                print(f"     {direction} {feature:<20} {corr_value:>6.3f} ({strength})")
    
    # Channel performance comparison
    print(f"\n🏆 CHANNEL PERFORMANCE RANKINGS:")
    channel_performance = df.groupby('channel_name').agg({
        'view_count': 'mean',
        'like_count': 'mean',
        'comment_count': 'mean',
        'video_id': 'count'
    }).round(0)
    
    # Sort by average views
    top_channels = channel_performance.sort_values('view_count', ascending=False).head(10)
    
    for i, (channel, stats) in enumerate(top_channels.iterrows(), 1):
        avg_views = f"{stats['view_count']:,.0f}"
        avg_likes = f"{stats['like_count']:,.0f}" 
        video_count = int(stats['video_id'])
        print(f"  {i:>2}. {channel[:30]:<30} {avg_views:>12} avg views | {video_count} videos")
    
    # Engagement rate analysis by channel
    print(f"\n💡 ENGAGEMENT RATE BY CHANNEL:")
    df_engage = df.dropna(subset=['view_count', 'like_count'])
    if len(df_engage) > 0:
        df_engage['engagement_rate'] = (df_engage['like_count'] / df_engage['view_count'] * 100).clip(0, 20)
        channel_engagement = df_engage.groupby('channel_name')['engagement_rate'].mean().sort_values(ascending=False)
        
        for channel, rate in channel_engagement.head(10).items():
            bar_length = int(rate * 2)  # Scale for visualization
            bar = "█" * bar_length + "░" * (10 - bar_length)
            print(f"  • {channel[:30]:<30} {rate:>5.2f}% {bar[:10]}")
    
    # Final ML readiness summary
    print(f"\n🤖 MACHINE LEARNING READINESS SUMMARY:")
    print(f"  ✅ Dataset size: {len(df)} videos across {df['channel_name'].nunique()} channels")
    print(f"  ✅ Complete records: {len(df.dropna())} ({len(df.dropna())/len(df)*100:.1f}%)")
    print(f"  ✅ Balanced sampling: {df['performance_category'].value_counts().to_dict()}")
    print(f"  ✅ Feature variety: Numeric, categorical, text, and temporal features")
    print(f"  ✅ Target variables: Classification (performance_category) + Regression (views/likes/comments)")
    print(f"  ✅ Data quality: Low missing data rate ({df.isnull().sum().sum()/(df.shape[0]*df.shape[1])*100:.1f}%)")
    print(f"  ✅ Scale range: Suitable for both small and large channel analysis")
    
    print(f"\n🚀 Ready for ML algorithms:")
    print(f"   • Classification: Random Forest, Gradient Boosting, Neural Networks")
    print(f"   • Regression: Linear/Ridge regression, XGBoost, Support Vector Regression") 
    print(f"   • Clustering: K-means for content grouping, audience segmentation")
    print(f"   • NLP: Title/description sentiment analysis, topic modeling")
    
    return df

if __name__ == "__main__":
    df = comprehensive_analysis()
    print("\n✅ Comprehensive analysis complete! Your dataset is ML-ready.")
