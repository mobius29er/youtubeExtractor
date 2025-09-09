#!/usr/bin/env python3
"""
Comprehensive Dataset Verification Script
Validates integrity, consistency, and accuracy of all YouTube extraction datasets
"""

import json
import pandas as pd
from pathlib import Path
import numpy as np
from datetime import datetime

def verify_datasets():
    """Comprehensive verification of all dataset files"""
    
    print("🔍 COMPREHENSIVE DATASET VERIFICATION")
    print("=" * 55)
    
    errors = []
    warnings = []
    
    # 1. VERIFY MAIN JSON DATA
    print("\n📊 1. VERIFYING MAIN JSON DATA")
    try:
        with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        # Check metadata
        print(f"  ✅ JSON file loaded successfully")
        print(f"  • Extraction date: {json_data['extraction_date']}")
        print(f"  • Channels processed: {json_data['channels_processed']}")
        print(f"  • Videos selected: {json_data['videos_selected']}")
        print(f"  • Quota used: {json_data['quota_used']:,}")
        
        # Verify channel count
        actual_channels = len(json_data['data'])
        if actual_channels != json_data['channels_processed']:
            errors.append(f"Channel count mismatch: metadata says {json_data['channels_processed']}, but found {actual_channels}")
        
        # Count actual videos
        total_videos = 0
        channels_with_videos = 0
        for channel_name, channel_data in json_data['data'].items():
            if 'selection_result' in channel_data and 'selected_videos' in channel_data['selection_result']:
                video_count = len(channel_data['selection_result']['selected_videos'])
                total_videos += video_count
                channels_with_videos += 1
                print(f"    • {channel_name}: {video_count} videos")
            else:
                warnings.append(f"Channel {channel_name} has no selected videos")
        
        if total_videos != json_data['videos_selected']:
            errors.append(f"Video count mismatch: metadata says {json_data['videos_selected']}, but found {total_videos}")
        
        print(f"  • Total videos verified: {total_videos}")
        print(f"  • Channels with videos: {channels_with_videos}")
        
    except Exception as e:
        errors.append(f"Failed to load main JSON data: {e}")
    
    # 2. VERIFY CSV DATA
    print("\n📊 2. VERIFYING CSV DATASET")
    try:
        csv_data = pd.read_csv('extracted_data/api_only_ml_dataset.csv')
        print(f"  ✅ CSV file loaded successfully")
        print(f"  • Shape: {csv_data.shape[0]:,} rows × {csv_data.shape[1]} columns")
        
        # Check for duplicates
        duplicates = csv_data.duplicated(subset=['video_id']).sum()
        if duplicates > 0:
            errors.append(f"Found {duplicates} duplicate video IDs in CSV")
        else:
            print(f"  ✅ No duplicate video IDs found")
        
        # Verify column completeness
        required_columns = ['video_id', 'title', 'view_count', 'like_count', 'comment_count', 'channel_name', 'performance_category']
        missing_columns = [col for col in required_columns if col not in csv_data.columns]
        if missing_columns:
            errors.append(f"Missing required columns: {missing_columns}")
        
        # Check data quality
        null_counts = csv_data.isnull().sum()
        critical_nulls = null_counts[['video_id', 'title', 'channel_name']]
        if critical_nulls.sum() > 0:
            errors.append(f"Critical fields have null values: {critical_nulls[critical_nulls > 0].to_dict()}")
        
        # Verify performance categories
        if 'performance_category' in csv_data.columns:
            perf_dist = csv_data['performance_category'].value_counts()
            print(f"  • Performance distribution: {perf_dist.to_dict()}")
            
            # Check for proper intelligent sampling (should be close to 280-140-140)
            expected = {'random_sample': 280, 'top_performer': 140, 'bottom_performer': 140}
            for category, expected_count in expected.items():
                actual_count = perf_dist.get(category, 0)
                if abs(actual_count - expected_count) > 10:  # Allow some variance
                    warnings.append(f"Performance category {category}: expected ~{expected_count}, got {actual_count}")
        
        # Verify channel counts
        channel_counts = csv_data['channel_name'].value_counts()
        print(f"  • Unique channels: {len(channel_counts)}")
        for channel, count in channel_counts.items():
            print(f"    • {channel}: {count} videos")
            if count != 40:  # Expected 40 videos per channel
                warnings.append(f"Channel {channel} has {count} videos (expected 40)")
        
        # Check data ranges
        if 'view_count' in csv_data.columns:
            view_stats = csv_data['view_count'].describe()
            print(f"  • View count range: {view_stats['min']:,.0f} - {view_stats['max']:,.0f}")
            if view_stats['min'] < 0:
                errors.append("Found negative view counts")
        
    except Exception as e:
        errors.append(f"Failed to verify CSV data: {e}")
    
    # 3. VERIFY ANALYSIS OUTPUT
    print("\n📊 3. VERIFYING ANALYSIS OUTPUT")
    try:
        analysis_file = Path('analysis_output/dataset_summary.json')
        if analysis_file.exists():
            with open(analysis_file, 'r') as f:
                analysis_data = json.load(f)
            
            print(f"  ✅ Analysis summary found")
            print(f"  • Dataset shape: {analysis_data['dataset_shape']}")
            print(f"  • Total channels: {analysis_data['total_channels']}")
            print(f"  • Total videos: {analysis_data['total_videos']}")
            
            # Cross-verify with CSV data if available
            if 'csv_data' in locals():
                if analysis_data['total_videos'] != len(csv_data):
                    errors.append(f"Analysis summary video count ({analysis_data['total_videos']}) doesn't match CSV ({len(csv_data)})")
                if analysis_data['total_channels'] != csv_data['channel_name'].nunique():
                    errors.append(f"Analysis summary channel count ({analysis_data['total_channels']}) doesn't match CSV ({csv_data['channel_name'].nunique()})")
        else:
            warnings.append("Analysis summary file not found")
    except Exception as e:
        warnings.append(f"Failed to verify analysis output: {e}")
    
    # 4. VERIFY FILE STRUCTURE
    print("\n📊 4. VERIFYING FILE STRUCTURE")
    try:
        extracted_path = Path('extracted_data')
        
        # Check main files
        main_files = [
            'api_only_complete_data.json',
            'api_only_ml_dataset.csv',
            'metadata_only.json',
            'caption_availability_report.json'
        ]
        
        for file_name in main_files:
            file_path = extracted_path / file_name
            if file_path.exists():
                size_mb = file_path.stat().st_size / (1024 * 1024)
                print(f"  ✅ {file_name}: {size_mb:.2f} MB")
            else:
                warnings.append(f"Missing file: {file_name}")
        
        # Check thumbnails
        thumbnail_dir = extracted_path / 'thumbnails'
        if thumbnail_dir.exists():
            thumbnail_count = len([f for f in thumbnail_dir.rglob('*') if f.is_file()])
            print(f"  ✅ Thumbnails directory: {thumbnail_count} files")
            
            # Verify thumbnail organization by channel
            channel_dirs = [d for d in thumbnail_dir.iterdir() if d.is_dir()]
            print(f"    • Channel directories: {len(channel_dirs)}")
            for channel_dir in channel_dirs:
                thumb_count = len([f for f in channel_dir.iterdir() if f.is_file()])
                print(f"      - {channel_dir.name}: {thumb_count} thumbnails")
        else:
            warnings.append("Thumbnails directory not found")
        
        # Check comments
        comments_dir = extracted_path / 'comments_raw'
        if comments_dir.exists():
            comment_files = len([f for f in comments_dir.iterdir() if f.is_file()])
            print(f"  ✅ Comments directory: {comment_files} files")
        else:
            warnings.append("Comments directory not found")
            
    except Exception as e:
        warnings.append(f"Failed to verify file structure: {e}")
    
    # 5. DATA CONSISTENCY CHECKS
    print("\n📊 5. DATA CONSISTENCY CHECKS")
    try:
        if 'json_data' in locals() and 'csv_data' in locals():
            # Extract video IDs from JSON
            json_video_ids = set()
            for channel_name, channel_data in json_data['data'].items():
                if 'selection_result' in channel_data and 'selected_videos' in channel_data['selection_result']:
                    for video in channel_data['selection_result']['selected_videos']:
                        json_video_ids.add(video['video_id'])
            
            # Extract video IDs from CSV
            csv_video_ids = set(csv_data['video_id'].dropna())
            
            # Compare
            json_only = json_video_ids - csv_video_ids
            csv_only = csv_video_ids - json_video_ids
            
            if json_only:
                warnings.append(f"{len(json_only)} videos in JSON but not in CSV")
            if csv_only:
                warnings.append(f"{len(csv_only)} videos in CSV but not in JSON")
            
            if not json_only and not csv_only:
                print(f"  ✅ Video IDs consistent between JSON and CSV")
            
            print(f"  • JSON videos: {len(json_video_ids)}")
            print(f"  • CSV videos: {len(csv_video_ids)}")
            print(f"  • Common videos: {len(json_video_ids & csv_video_ids)}")
    
    except Exception as e:
        warnings.append(f"Failed consistency checks: {e}")
    
    # 6. FINAL REPORT
    print("\n" + "=" * 55)
    print("📋 VERIFICATION SUMMARY")
    print("=" * 55)
    
    if not errors and not warnings:
        print("🎉 ALL CHECKS PASSED! Dataset is fully verified and consistent.")
    else:
        if errors:
            print(f"❌ ERRORS FOUND ({len(errors)}):")
            for i, error in enumerate(errors, 1):
                print(f"  {i}. {error}")
        
        if warnings:
            print(f"\n⚠️  WARNINGS ({len(warnings)}):")
            for i, warning in enumerate(warnings, 1):
                print(f"  {i}. {warning}")
    
    # Dataset health score
    total_issues = len(errors) + len(warnings)
    if total_issues == 0:
        health_score = 100
    elif len(errors) == 0:
        health_score = max(90 - len(warnings) * 5, 70)
    else:
        health_score = max(50 - len(errors) * 10 - len(warnings) * 5, 0)
    
    print(f"\n🏥 DATASET HEALTH SCORE: {health_score}/100")
    
    if health_score >= 95:
        print("   Status: EXCELLENT - Ready for production ML")
    elif health_score >= 85:
        print("   Status: GOOD - Minor issues, still ML-ready")
    elif health_score >= 70:
        print("   Status: ACCEPTABLE - Some concerns, review warnings")
    elif health_score >= 50:
        print("   Status: NEEDS ATTENTION - Fix errors before proceeding")
    else:
        print("   Status: CRITICAL - Major issues require immediate fixes")
    
    return len(errors) == 0

if __name__ == "__main__":
    success = verify_datasets()
    exit(0 if success else 1)
