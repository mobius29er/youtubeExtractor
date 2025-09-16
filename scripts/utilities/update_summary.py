#!/usr/bin/env python3
"""
Update the dataset summary with current data
"""
import json
import pandas as pd
from datetime import datetime

def update_summary():
    print("🔄 UPDATING DATASET SUMMARY")
    print("=" * 40)
    
    # Load current CSV data
    df = pd.read_csv('extracted_data/api_only_ml_SAFE.csv')
    
    # Create updated summary
    summary = {
        'dataset_shape': [len(df), len(df.columns)],
        'total_channels': df['channel_name'].nunique(),
        'total_videos': len(df),
        'extraction_date': datetime.now().isoformat(),
        'channel_distribution': df['channel_name'].value_counts().to_dict(),
        'performance_distribution': df['performance_category'].value_counts().to_dict()
    }
    
    # Save updated summary
    with open('analysis_output/dataset_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"✅ Updated dataset_summary.json")
    print(f"   Videos: {summary['total_videos']}")
    print(f"   Channels: {summary['total_channels']}")
    print(f"   Shape: {summary['dataset_shape']}")
    
    return summary

if __name__ == "__main__":
    update_summary()
