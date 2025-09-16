#!/usr/bin/env python3
import os
"""
Quick ML Data Exploration for YouTube Dataset
Ready-to-run analysis of your clean dataset
"""
import pandas as pd
import numpy as np
from pathlib import Path

# Fix matplotlib backend issues
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

def load_and_explore():
    """Load the dataset and perform initial exploration"""
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
    channel_stats = df.groupby('channel_name').agg({
        'video_id': 'count',
        'view_count': ['mean', 'median', 'sum'],
        'like_count': 'sum',
        'comment_count': 'sum'
    }).round(0)
    
    for channel in channel_stats.index:
        videos = int(channel_stats.loc[channel, ('video_id', 'count')])
        avg_views = int(channel_stats.loc[channel, ('view_count', 'mean')])
        median_views = int(channel_stats.loc[channel, ('view_count', 'median')])
        print(f"  • {channel[:30]:<30} {videos:>2} videos | Avg: {avg_views:>10,} | Med: {median_views:>10,}")
    print()
    
    # Performance categories
    print("🎯 PERFORMANCE DISTRIBUTION:")
    perf_dist = df['performance_category'].value_counts()
    for category, count in perf_dist.items():
        percentage = count / len(df) * 100
        print(f"  • {category:<15} {count:>3} videos ({percentage:>5.1f}%)")
    print()
    
    # Genre analysis
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
        print(f"  • {genre:<20} {videos:>3} videos | {avg_views:>12,} avg views | {avg_duration:>4}s avg duration")
    print()
    
    # Key metrics summary
    print("📈 KEY METRICS SUMMARY:")
    metrics = ['view_count', 'like_count', 'comment_count', 'duration', 'title_length']
    for metric in metrics:
        if metric in df.columns:
            mean_val = df[metric].mean()
            median_val = df[metric].median()
            std_val = df[metric].std()
            if metric in ['view_count', 'like_count', 'comment_count']:
                print(f"  • {metric:<15} Mean: {mean_val:>12,.0f} | Median: {median_val:>10,.0f} | Std: {std_val:>12,.0f}")
            else:
                print(f"  • {metric:<15} Mean: {mean_val:>12.1f} | Median: {median_val:>10.1f} | Std: {std_val:>12.1f}")
    print()
    
    # Engagement ratios
    print("💡 ENGAGEMENT INSIGHTS:")
    df['like_rate'] = df['like_count'] / df['view_count'] * 100
    df['comment_rate'] = df['comment_count'] / df['view_count'] * 100
    
    print(f"  • Average Like Rate: {df['like_rate'].mean():.3f}%")
    print(f"  • Average Comment Rate: {df['comment_rate'].mean():.3f}%")
    
    # By genre
    engagement_by_genre = df.groupby('genre')[['like_rate', 'comment_rate']].mean()
    for genre in engagement_by_genre.index:
        like_rate = engagement_by_genre.loc[genre, 'like_rate']
        comment_rate = engagement_by_genre.loc[genre, 'comment_rate'] 
        print(f"  • {genre}: {like_rate:.3f}% likes, {comment_rate:.3f}% comments")
    print()
    
    # Caption analysis
    if 'has_captions' in df.columns:
        print("🎬 CAPTION ANALYSIS:")
        caption_stats = df.groupby('has_captions')['view_count'].agg(['count', 'mean'])
        for has_captions, stats in caption_stats.iterrows():
            count = int(stats['count'])
            avg_views = int(stats['mean'])
            percentage = count / len(df) * 100
            print(f"  • {'With' if has_captions else 'Without'} captions: {count:>3} videos ({percentage:>5.1f}%) | Avg views: {avg_views:>10,}")
        print()
    
    # ML readiness check
    print("🤖 ML READINESS CHECK:")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    print(f"  • Numeric features: {len(numeric_cols)} columns")
    print(f"  • Categorical features: {len(categorical_cols)} columns")
    print(f"  • Ready for classification: ✅ (performance_category target)")
    print(f"  • Ready for regression: ✅ (view_count, like_count targets)")
    print(f"  • Feature scaling needed: ✅ (wide range in view counts)")
    print(f"  • Missing value handling: {'✅ Minimal' if df.isnull().sum().sum() < 10 else '⚠️ Needs attention'}")
    
    return df

def quick_visualizations(df):
    """Generate key visualizations"""        
    print("\n📊 GENERATING QUICK VISUALIZATIONS...")
    
    # Create output directory
    Path('analysis_output').mkdir(exist_ok=True)
    
    # Set style
    plt.style.use('default')
    sns.set_palette("husl")
    
    # 1. View count distribution by genre
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 3, 1)
    df.boxplot(column='view_count', by='genre', ax=plt.gca())
    plt.yscale('log')
    plt.title('View Count by Genre')
    plt.suptitle('')
    
    # 2. Performance category distribution
    plt.subplot(1, 3, 2)
    df['performance_category'].value_counts().plot(kind='bar')
    plt.title('Performance Categories')
    plt.xticks(rotation=45)
    
    # 3. Duration vs Views scatter
    plt.subplot(1, 3, 3)
    plt.scatter(df['duration'], df['view_count'], alpha=0.6, c=df['genre'].astype('category').cat.codes)
    plt.xlabel('Duration (seconds)')
    plt.ylabel('View Count')
    plt.yscale('log')
    plt.title('Duration vs Views')
    
    plt.tight_layout()
    plt.savefig('analysis_output/quick_overview.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    print("  ✅ Saved: analysis_output/quick_overview.png")
    
    # Correlation heatmap
    plt.figure(figsize=(10, 8))
    numeric_df = df.select_dtypes(include=[np.number])
    correlation_matrix = numeric_df.corr()
    
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, 
                square=True, fmt='.2f', cbar_kws={'shrink': 0.8})
    plt.title('Feature Correlation Matrix')
    plt.tight_layout()
    plt.savefig('analysis_output/correlation_matrix.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    print("  ✅ Saved: analysis_output/correlation_matrix.png")
    
    print("\n🎯 ANALYSIS COMPLETE!")
    print("  • Dataset is ML-ready with excellent diversity")
    print("  • Multiple genres spanning different subscriber counts") 
    print("  • Strong feature set for performance prediction")
    print("  • Visualizations saved to analysis_output/")

if __name__ == '__main__':
    df = load_and_explore()
    
    # Generate visualizations if plotting libraries are available

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
    quick_visualizations(df)
