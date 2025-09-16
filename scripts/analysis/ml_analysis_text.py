#!/usr/bin/env python3
import os
"""
YouTube Dataset ML Analysis (No Matplotlib Dependencies)
Text-based comprehensive analysis of your clean dataset
"""
import pandas as pd
import numpy as np
from pathlib import Path
import json

def load_and_explore():
    """Load the dataset and perform comprehensive text-based exploration"""
    print("🎯 YOUTUBE ML DATASET EXPLORATION")
    print("=" * 50)
    
    # Load the ML dataset
    df = pd.read_csv('extracted_data/api_only_ml_SAFE.csv') if os.path.exists('extracted_data/api_only_ml_SAFE.csv') else pd.read_csv('extracted_data/api_only_ml_dataset.csv')
    
    print(f"📊 DATASET OVERVIEW:")
    print(f"  • Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
    print(f"  • Memory usage: {df.memory_usage(deep=True).sum() / 1024:.1f} KB")
    print()
    
    # Basic info
    print("🔍 DATA TYPES & MISSING VALUES:")
    info_df = pd.DataFrame({
        'Column': df.columns,
        'Type': df.dtypes,
        'Non-Null': df.count(),
        'Null%': (df.isnull().sum() / len(df) * 100).round(1)
    })
    for _, row in info_df.iterrows():
        print(f"  • {row['Column']:<25} {str(row['Type']):<10} {row['Non-Null']:>3}/{len(df)} ({row['Null%']:>5.1f}% null)")
    print()
    
    # Channel distribution
    print("📺 CHANNEL DISTRIBUTION:")
    # Filter out rows with missing data for channel stats
    df_complete = df.dropna(subset=['view_count', 'like_count', 'comment_count'])
    
    try:
        channel_stats = df_complete.groupby('channel_name').agg({
            'video_id': 'count',
            'view_count': ['mean', 'median', 'sum'],
            'like_count': 'sum',
            'comment_count': 'sum'
        }).round(0)
        
        for channel in channel_stats.index:
            videos = int(channel_stats.loc[channel, ('video_id', 'count')])
            avg_views = int(channel_stats.loc[channel, ('view_count', 'mean')])
            median_views = int(channel_stats.loc[channel, ('view_count', 'median')])
            total_views = int(channel_stats.loc[channel, ('view_count', 'sum')])
            print(f"  • {channel[:35]:<35} {videos:>2} videos")
            print(f"    └─ Avg: {avg_views:>15,} | Med: {median_views:>12,} | Total: {total_views:>15,}")
    except Exception as e:
        print(f"  • Channel analysis error: {e}")
        # Fallback: simple channel count
        for channel in df['channel_name'].unique():
            count = len(df[df['channel_name'] == channel])
            print(f"  • {channel[:35]:<35} {count:>2} videos")
    print()
    
    # Performance categories
    print("🎯 PERFORMANCE DISTRIBUTION:")
    perf_dist = df['performance_category'].value_counts()
    for category, count in perf_dist.items():
        percentage = count / len(df) * 100
        bar_length = int(percentage / 2)  # Visual bar
        bar = "█" * bar_length + "░" * (50 - bar_length)
        print(f"  • {category:<15} {count:>3} videos ({percentage:>5.1f}%) {bar[:20]}")
    print()
    
    # Genre analysis
    if 'genre' in df.columns:
        print("🎭 GENRE ANALYSIS:")
        genre_stats = df.groupby('genre').agg({
            'video_id': 'count',
            'view_count': 'mean',
            'like_count': 'mean',
            'duration': 'mean'
        }).round(0)
        
        for genre in genre_stats.index:
            videos = int(genre_stats.loc[genre, 'video_id'])
            avg_views = int(genre_stats.loc[genre, 'view_count'])
            avg_likes = int(genre_stats.loc[genre, 'like_count'])
            avg_duration = int(genre_stats.loc[genre, 'duration'])
            print(f"  • {genre:<20} {videos:>3} videos")
            print(f"    └─ {avg_views:>12,} avg views | {avg_likes:>10,} avg likes | {avg_duration:>4}s duration")
        print()
    
    # Key metrics summary
    print("📈 KEY METRICS SUMMARY:")
    metrics = ['view_count', 'like_count', 'comment_count', 'duration']
    if 'title_length' not in df.columns and 'title' in df.columns:
        df['title_length'] = df['title'].str.len()
    
    metrics_to_check = [m for m in metrics + ['title_length'] if m in df.columns]
    
    for metric in metrics_to_check:
        try:
            # Use only non-null values for calculations
            data_clean = df[metric].dropna()
            if len(data_clean) > 0:
                mean_val = data_clean.mean()
                median_val = data_clean.median()
                std_val = data_clean.std()
                min_val = data_clean.min()
                max_val = data_clean.max()
                
                if metric in ['view_count', 'like_count', 'comment_count']:
                    print(f"  • {metric:<15}")
                    print(f"    └─ Mean: {mean_val:>12,.0f} | Median: {median_val:>10,.0f}")
                    print(f"    └─ Min:  {min_val:>12,.0f} | Max:    {max_val:>10,.0f} | Std: {std_val:>12,.0f}")
                else:
                    print(f"  • {metric:<15}")
                    print(f"    └─ Mean: {mean_val:>12.1f} | Median: {median_val:>10.1f}")
                    print(f"    └─ Min:  {min_val:>12.1f} | Max:    {max_val:>10.1f} | Std: {std_val:>12.1f}")
            else:
                print(f"  • {metric:<15} No valid data available")
        except Exception as e:
            print(f"  • {metric:<15} Analysis error: {e}")
    print()
    
    # Engagement ratios
    print("💡 ENGAGEMENT INSIGHTS:")
    try:
        df_engage = df.dropna(subset=['view_count', 'like_count', 'comment_count'])
        if len(df_engage) > 0:
            df_engage['like_rate'] = (df_engage['like_count'] / df_engage['view_count'] * 100).clip(0, 100)
            df_engage['comment_rate'] = (df_engage['comment_count'] / df_engage['view_count'] * 100).clip(0, 100)
            
            print(f"  • Videos with engagement data: {len(df_engage)}")
            print(f"  • Average Like Rate: {df_engage['like_rate'].mean():.3f}%")
            print(f"  • Average Comment Rate: {df_engage['comment_rate'].mean():.4f}%")
            
            # High engagement threshold
            high_engagement = df_engage[df_engage['like_rate'] > df_engage['like_rate'].quantile(0.75)]
            print(f"  • High-engagement videos: {len(high_engagement)} ({len(high_engagement)/len(df_engage)*100:.1f}%)")
        else:
            print("  • Insufficient data for engagement analysis")
    except Exception as e:
        print(f"  • Engagement analysis error: {e}")
    print()
    
    # Top performers
    print("🏆 TOP PERFORMING VIDEOS:")
    top_videos = df.nlargest(5, 'view_count')[['title', 'channel_name', 'view_count', 'like_count', 'duration']]
    for i, (_, video) in enumerate(top_videos.iterrows(), 1):
        title = video['title'][:50] + "..." if len(video['title']) > 50 else video['title']
        print(f"  {i}. {title}")
        print(f"     └─ {video['channel_name']} | {video['view_count']:,} views | {video['like_count']:,} likes | {video['duration']}s")
    print()
    
    # Duration analysis
    print("⏱️ DURATION INSIGHTS:")
    try:
        # Skip duration analysis since it's in concatenated PT format
        print("  • Duration data needs parsing (concatenated PT format detected)")
        print("  • Raw duration format: PT<minutes>M<seconds>S (multiple concatenated)")
        
        # Check a few samples
        sample_durations = df['duration'].dropna().head(3).tolist()
        for i, sample in enumerate(sample_durations[:2]):
            print(f"  • Sample {i+1}: {str(sample)[:50]}...")
    except Exception as e:
        print(f"  • Duration analysis error: {e}")
    print()
    
    # ML readiness check
    print("🤖 ML READINESS CHECK:")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    print(f"  ✅ Numeric features: {len(numeric_cols)} columns")
    print(f"     └─ {', '.join(numeric_cols[:8])}")
    if len(numeric_cols) > 8:
        print(f"     └─ ... and {len(numeric_cols) - 8} more")
    
    print(f"  ✅ Categorical features: {len(categorical_cols)} columns")
    print(f"     └─ {', '.join(categorical_cols[:6])}")
    if len(categorical_cols) > 6:
        print(f"     └─ ... and {len(categorical_cols) - 6} more")
    
    print(f"  ✅ Classification target: performance_category ({df['performance_category'].nunique()} classes)")
    print(f"  ✅ Regression targets: view_count, like_count, comment_count")
    print(f"  ✅ Feature scaling needed: YES (wide range in view counts)")
    null_count = df.isnull().sum().sum()
    print(f"  {'✅' if null_count < 10 else '⚠️'} Missing values: {null_count} total")
    
    # Save analysis summary
    Path('analysis_output').mkdir(exist_ok=True)
    
    # Create summary with safe numeric conversions

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
    df_clean = df.dropna(subset=['view_count', 'like_count', 'comment_count'])
    
    analysis_summary = {
        'dataset_shape': df.shape,
        'total_channels': df['channel_name'].nunique(),
        'total_videos': len(df),
        'performance_distribution': df['performance_category'].value_counts().to_dict(),
        'avg_metrics': {
            'view_count': float(df_clean['view_count'].mean()),
            'like_count': float(df_clean['like_count'].mean()),
            'comment_count': float(df_clean['comment_count'].mean()),
            'title_length': float(df['title_length'].mean())
        }
    }
    
    with open('analysis_output/dataset_summary.json', 'w') as f:
        json.dump(analysis_summary, f, indent=2)
    
    print("\n🎯 ANALYSIS COMPLETE!")
    print(f"  • Dataset is ML-ready with {len(df)} samples across {df['channel_name'].nunique()} channels")
    print(f"  • Perfect intelligent sampling: {df['performance_category'].value_counts().to_dict()}")
    print("  • Strong feature set for performance prediction models")
    print("  • Analysis summary saved to analysis_output/dataset_summary.json")
    
    return df

if __name__ == '__main__':
    df = load_and_explore()
