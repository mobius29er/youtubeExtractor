#!/usr/bin/env python3
"""
Analyze CSV duplicates - find why channels like MrBeast appear multiple times
"""
import pandas as pd
import json

def analyze_csv_duplicates():
    # Load CSV data
    df = pd.read_csv('extracted_data/api_only_ml_dataset.csv')
    
    print('=== CSV DUPLICATE ANALYSIS ===')
    print(f'Total CSV rows: {len(df)}')
    print(f'Unique videos: {df["video_id"].nunique()}')
    print(f'Unique channels: {df["channel_name"].nunique()}')
    
    print('\n=== CHANNEL BREAKDOWN ===')
    
    # Check each channel for duplicates
    problem_channels = []
    for channel in sorted(df['channel_name'].unique()):
        channel_df = df[df['channel_name'] == channel]
        unique_videos = channel_df['video_id'].nunique()
        total_rows = len(channel_df)
        duplicates = total_rows - unique_videos
        
        print(f'{channel}:')
        print(f'  Total rows: {total_rows}')
        print(f'  Unique videos: {unique_videos}')
        
        if duplicates > 0:
            problem_channels.append(channel)
            print(f'  🚨 DUPLICATES: {duplicates} duplicate entries!')
            
            # Show some duplicate video IDs
            dup_videos = channel_df[channel_df.duplicated('video_id', keep=False)]
            if len(dup_videos) > 0:
                print(f'  Sample duplicate video IDs:')
                dup_counts = dup_videos['video_id'].value_counts()
                for video_id, count in dup_counts.head(3).items():
                    print(f'    {video_id}: appears {count} times')
        else:
            print(f'  ✅ No duplicates')
        print()
    
    print(f'\n=== SUMMARY ===')
    print(f'Channels with duplicates: {len(problem_channels)}')
    if problem_channels:
        print(f'Problem channels: {problem_channels}')
    
    # Check if we need to regenerate CSV from clean JSON
    print(f'\n=== RECOMMENDATION ===')
    if problem_channels:
        print('🛠️  The CSV file needs to be regenerated from the clean JSON data')
        print('   This will remove all duplicates and ensure data integrity')
    else:
        print('✅ CSV file looks clean!')

if __name__ == '__main__':
    analyze_csv_duplicates()
