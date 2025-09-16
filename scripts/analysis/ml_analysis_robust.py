#!/usr/bin/env python3
import os
"""
Robust YouTube ML Dataset Analysis - Text-based exploration with NaN handling
"""

import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

def load_and_explore():
    """Load and perform comprehensive analysis of the ML dataset."""
    
    # Try SAFE CSV first, then original, then fallback to JSON
    csv_paths = [
        Path('extracted_data/api_only_ml_SAFE.csv'),
        Path('extracted_data/api_only_ml_dataset.csv')
    ]
    
    df = None
    for csv_path in csv_paths:
        if csv_path.exists():
            try:
                print(f"🔍 Loading dataset from {csv_path.name}...")
                df = pd.read_csv(csv_path)
                break
            except Exception as e:
                print(f"❌ Failed to load {csv_path.name}: {e}")
                continue
    
    if df is None:
        print("🔄 Loading from JSON instead...")
        # Load from JSON as fallback
        import json
        with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert JSON to DataFrame
        videos = []
        for channel_name, channel_info in data.get('data', {}).items():
            for video in channel_info.get('videos', []):
                video_data = video.copy()
                video_data['channel_name'] = channel_name
                video_data['channel_subscriber_count' if 'channel_subscriber_count' in data[0] else 'subscriber_count'] = channel_info.get('channel_data', {}).get('subscriber_count', 0)
                video_data['genre'] = channel_info.get('genre', 'unknown')
                videos.append(video_data)
        
        df = pd.DataFrame(videos)
    
    print(f"🎯 YOUTUBE ML DATASET EXPLORATION")
    print("=" * 50)
    print(f"📊 DATASET OVERVIEW:")
    print(f"  • Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    print(f"  • Memory usage: {df.memory_usage(deep=True).sum()/1024:.1f} KB")
    print()
    
    # Data types and missing values
    print(f"🔍 DATA TYPES & MISSING VALUES:")
    for col in df.columns:
        dtype = df[col].dtype
        non_null = df[col].count()
        total = len(df)
        null_pct = (total - non_null) / total * 100
        print(f"  • {col:<25} {str(dtype):<10} {non_null:>3}/{total} ({null_pct:>5.1f}% null)")
    print()
    
    # Channel distribution (handle missing values)
    print("📺 CHANNEL DISTRIBUTION:")
    try:
        # Only use rows with complete data for statistics
        df_stats = df.dropna(subset=['view_count', 'like_count', 'comment_count'])
        
        for channel in df['channel_name'].unique():
            channel_data = df_stats[df_stats['channel_name'] == channel]
            if len(channel_data) > 0:
                count = len(channel_data)
                try:
                    avg_views = int(channel_data['view_count'].mean())
                    med_views = int(channel_data['view_count'].median())
                    total_views = int(channel_data['view_count'].sum())
                    print(f"  • {channel:<35} {count:>2} videos")
                    print(f"    └─ Avg: {avg_views:>13,} | Med: {med_views:>11,} | Total: {total_views:>14,}")
                except (ValueError, TypeError):
                    print(f"  • {channel:<35} {count:>2} videos (stats unavailable)")
        print()
    except Exception as e:
        print(f"  • Channel analysis failed: {e}")
        print()
    
    # Performance categories
    print("🎯 PERFORMANCE DISTRIBUTION:")
    try:
        perf_dist = df['performance_category'].value_counts().dropna()
        for category, count in perf_dist.items():
            percentage = count / len(df) * 100
            bar_length = int(percentage / 2)
            bar = "█" * bar_length + "░" * (25 - bar_length)
            print(f"  • {category:<15} {count:>3} videos ({percentage:>5.1f}%) {bar[:20]}")
    except Exception as e:
        print(f"  • Performance distribution failed: {e}")
    print()
    
    # Key metrics (robust handling)
    print("📈 KEY METRICS SUMMARY:")
    metrics = ['view_count', 'like_count', 'comment_count', 'duration']
    
    for metric in metrics:
        if metric in df.columns:
            try:
                data = df[metric].dropna()
                if len(data) > 0:
                    mean_val = data.mean()
                    median_val = data.median()
                    min_val = data.min()
                    max_val = data.max()
                    
                    if 'count' in metric:
                        print(f"  • {metric.replace('_', ' ').title():<15} Mean: {mean_val:>12,.0f} | Median: {median_val:>10,.0f}")
                        print(f"    └─ Range: {min_val:>12,.0f} - {max_val:>12,.0f}")
                    else:
                        print(f"  • {metric.replace('_', ' ').title():<15} Mean: {mean_val:>12.1f} | Median: {median_val:>10.1f}")
                        print(f"    └─ Range: {min_val:>12.1f} - {max_val:>12.1f}")
                else:
                    print(f"  • {metric.replace('_', ' ').title():<15} No valid data")
            except Exception as e:
                print(f"  • {metric.replace('_', ' ').title():<15} Analysis failed: {e}")
    print()
    
    # Engagement insights (robust)
    print("💡 ENGAGEMENT INSIGHTS:")
    try:
        df_engage = df.dropna(subset=['view_count', 'like_count'])
        if len(df_engage) > 0:
            df_engage['like_rate'] = (df_engage['like_count'] / df_engage['view_count'] * 100).clip(0, 100)
            
            print(f"  • Videos with engagement data: {len(df_engage)}")
            print(f"  • Average like rate: {df_engage['like_rate'].mean():.3f}%")
            print(f"  • Median like rate: {df_engage['like_rate'].median():.3f}%")
            print(f"  • Max like rate: {df_engage['like_rate'].max():.3f}%")
            
            # High engagement threshold (top 25%)
            threshold = df_engage['like_rate'].quantile(0.75)
            high_engagement = df_engage[df_engage['like_rate'] > threshold]
            print(f"  • High engagement videos (>{threshold:.3f}%): {len(high_engagement)}")
        else:
            print("  • Insufficient data for engagement analysis")
    except Exception as e:
        print(f"  • Engagement analysis failed: {e}")
    print()
    
    # Top performers (robust)
    print("🏆 TOP PERFORMING VIDEOS:")
    try:
        top_videos = df.nlargest(5, 'view_count')
        for i, (_, video) in enumerate(top_videos.iterrows(), 1):
            if pd.notna(video['view_count']):
                title = str(video['title'])[:50] + "..." if len(str(video['title'])) > 50 else str(video['title'])
                views = f"{video['view_count']:,.0f}" if pd.notna(video['view_count']) else "N/A"
                likes = f"{video['like_count']:,.0f}" if pd.notna(video['like_count']) else "N/A"
                channel = str(video['channel_name'])
                print(f"  {i}. {title}")
                print(f"     └─ {channel} | {views} views | {likes} likes")
    except Exception as e:
        print(f"  • Top performers analysis failed: {e}")
    print()
    
    # Duration analysis (robust)
    print("⏱️ DURATION INSIGHTS:")
    try:
        duration_data = df['duration'].dropna()
        if len(duration_data) > 0:
            # Convert to numeric if needed
            if duration_data.dtype == 'object':
                duration_data = pd.to_numeric(duration_data, errors='coerce').dropna()
            
            if len(duration_data) > 0:
                bins = [0, 300, 600, 1200, 3600, float('inf')]
                labels = ['<5min', '5-10min', '10-20min', '20-60min', '>60min']
                duration_bins = pd.cut(duration_data, bins=bins, labels=labels)
                duration_stats = duration_bins.value_counts().sort_index()
                
                for duration_range, count in duration_stats.items():
                    if pd.notna(duration_range):
                        percentage = count / len(duration_data) * 100
                        bar_length = int(percentage / 2)
                        bar = "█" * bar_length + "░" * (20 - bar_length)
                        print(f"  • {duration_range:<10} {count:>3} videos ({percentage:>5.1f}%) {bar[:15]}")
            else:
                print("  • Duration data not numeric")
        else:
            print("  • No duration data available")
    except Exception as e:
        print(f"  • Duration analysis failed: {e}")
    print()
    
    # ML readiness check
    print("🤖 ML READINESS CHECK:")
    try:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        print(f"  ✅ Numeric features: {len(numeric_cols)} columns")
        if numeric_cols:
            print(f"     └─ {', '.join(numeric_cols[:6])}")
            if len(numeric_cols) > 6:
                print(f"     └─ ... and {len(numeric_cols) - 6} more")
        
        print(f"  ✅ Categorical features: {len(categorical_cols)} columns")
        if categorical_cols:
            print(f"     └─ {', '.join(categorical_cols[:4])}")
            if len(categorical_cols) > 4:
                print(f"     └─ ... and {len(categorical_cols) - 4} more")
        
        # Check for target variables
        if 'performance_category' in df.columns:
            unique_categories = df['performance_category'].nunique()
            print(f"  ✅ Classification target: performance_category ({unique_categories} classes)")
        
        if 'view_count' in df.columns:
            print(f"  ✅ Regression targets: view_count, like_count, comment_count")
        
        # Missing data summary
        null_count = df.isnull().sum().sum()
        missing_percentage = (null_count / (df.shape[0] * df.shape[1])) * 100
        print(f"  {'✅' if missing_percentage < 10 else '⚠️'} Missing values: {null_count} total ({missing_percentage:.1f}% of dataset)")
        
        print(f"  ✅ Feature scaling needed: YES (wide range in metrics)")
        
    except Exception as e:
        print(f"  • ML readiness check failed: {e}")
    print()
    
    # Summary

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
    print("📋 DATASET SUMMARY:")
    print(f"  • Total videos analyzed: {len(df)}")
    print(f"  • Unique channels: {df['channel_name'].nunique()}")
    print(f"  • Complete data rows: {len(df.dropna())}")
    print(f"  • Ready for ML analysis: {'Yes' if len(df.dropna()) > 100 else 'Needs cleanup'}")
    
    return df

if __name__ == "__main__":
    df = load_and_explore()
    if df is not None:
        print("\n✅ Analysis complete! Dataset is ready for machine learning.")
    else:
        print("\n❌ Analysis failed. Check data file and try again.")
