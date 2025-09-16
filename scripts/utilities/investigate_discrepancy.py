#!/usr/bin/env python3
import os
"""
Data Discrepancy Analysis
Compare extracted data across different files to find missing videos
"""

import json
import pandas as pd

def analyze_data_discrepancy():
    print("🔍 INVESTIGATING DATA DISCREPANCY")
    print("=" * 50)
    
    # Check progress tracker
    with open('extracted_data/progress_tracker.json', 'r') as f:
        progress = json.load(f)
    
    print(f"📊 Progress Tracker shows: {len(progress['processed_channels'])} channels")
    print("Channels processed:")
    for i, channel in enumerate(progress['processed_channels'], 1):
        print(f"  {i:2d}. {channel}")
    
    # Try to check CSV data - use SAFE version if available
    csv_df = None
    csv_files = ['extracted_data/api_only_ml_SAFE.csv', 'extracted_data/api_only_ml_dataset.csv']
    
    for csv_file in csv_files:
        try:
            csv_df = pd.read_csv(csv_file)
            print(f"\n📈 Successfully loaded: {csv_file}")
            break
        except Exception as e:
            print(f"❌ Failed to load {csv_file}: {e}")
            continue
    
    if csv_df is not None:
        csv_channels = csv_df['channel_name'].unique()
        csv_counts = csv_df['channel_name'].value_counts()
        
        print(f"   Contains: {len(csv_df)} videos from {len(csv_channels)} channels")
        print("   CSV channels with video counts:")
        for channel in csv_counts.index:
            count = csv_counts[channel]
            print(f"     {channel}: {count} videos")
    else:
        print("❌ Could not load any CSV file")
    
    # Check JSON data
    try:
        with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        json_channels = json_data.get('data', {})
        json_total_videos = sum(len(ch.get('videos', [])) for ch in json_channels.values())
        
        print(f"\n📋 JSON file contains: {json_total_videos} videos from {len(json_channels)} channels")
        print("JSON channels with video counts:")
        for name, ch_data in json_data.items():
            video_count = len(ch_data.get('videos', []))
            print(f"  {name}: {video_count} videos")
        
        # Find discrepancies
        print(f"\n⚠️  DISCREPANCY ANALYSIS:")
        
        progress_channels = set(progress['processed_channels'])
        csv_channels_set = set(csv_channels)
        json_channels_set = set(json_data.keys())
        
        print(f"Progress tracker: {len(progress_channels)} channels")
        print(f"CSV file: {len(csv_channels_set)} channels")
        print(f"JSON file: {len(json_channels_set)} channels")
        
        missing_from_csv = progress_channels - csv_channels_set
        if missing_from_csv:
            print(f"\n❌ Channels in progress but MISSING from CSV ({len(missing_from_csv)}):")
            for channel in missing_from_csv:
                print(f"  • {channel}")
        
        missing_from_json = progress_channels - json_channels_set  
        if missing_from_json:
            print(f"\n❌ Channels in progress but MISSING from JSON ({len(missing_from_json)}):")
            for channel in missing_from_json:
                print(f"  • {channel}")
        
        # Calculate expected vs actual
        expected_videos = len(progress['processed_channels']) * 40  # Assuming 40 per channel
        actual_csv = len(csv_df)
        actual_json = json_total_videos
        
        print(f"\n📊 VIDEO COUNT COMPARISON:")
        print(f"Expected (20 channels × ~40 videos): ~{expected_videos}")
        print(f"Actual in CSV: {actual_csv}")
        print(f"Actual in JSON: {actual_json}")
        print(f"Difference (CSV): {expected_videos - actual_csv}")
        print(f"Difference (JSON): {expected_videos - actual_json}")
        
    except Exception as e:
        print(f"Error reading JSON file: {e}")

if __name__ == "__main__":
    analyze_data_discrepancy()
