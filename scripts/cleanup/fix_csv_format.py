#!/usr/bin/env python3
"""
CSV Data Cleaner
Fixes formatting issues in the ML dataset CSV file
"""

import pandas as pd
import json
import re
import os
from pathlib import Path

def clean_csv_data():
    """Clean and fix CSV formatting issues"""
    
    # Set paths relative to project root
    data_dir = Path("extracted_data")
    input_file = data_dir / "api_only_ml_dataset.csv"
    output_file = data_dir / "api_only_ml_dataset_clean.csv"
    backup_file = data_dir / "api_only_ml_dataset_backup.csv"
    
    print("🧹 Starting CSV Data Cleanup...")
    
    # Create backup
    if input_file.exists():
        print(f"📦 Creating backup: {backup_file}")
        # Remove existing backup if it exists
        if backup_file.exists():
            backup_file.unlink()
        input_file.rename(backup_file)
    else:
        print("❌ Original CSV file not found!")
        print(f"   Looking for: {input_file.absolute()}")
        return False
    
    try:
        # Read the problematic CSV with error handling
        print("📖 Reading CSV data...")
        df = pd.read_csv(str(backup_file), on_bad_lines='skip', low_memory=False)
        
        print(f"✅ Successfully loaded {len(df)} rows")
        print(f"📊 Columns: {list(df.columns)}")
        
        # Clean up data issues
        print("🔧 Cleaning data...")
        
        # Fix any embedded quotes/commas in text fields
        text_columns = ['title', 'description', 'tags']
        for col in text_columns:
            if col in df.columns:
                # Replace any problematic characters
                df[col] = df[col].astype(str).apply(lambda x: x.replace('\n', ' ').replace('\r', ' '))
                # Remove excessive whitespace
                df[col] = df[col].str.strip()
        
        # Ensure proper data types
        numeric_columns = ['view_count', 'like_count', 'comment_count']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # Save cleaned data
        print(f"💾 Saving cleaned data to: {output_file}")
        df.to_csv(str(output_file), index=False, quoting=1)  # Quote all fields to prevent issues
        
        # Rename cleaned file to original name
        output_file.rename(input_file)
        
        # Verify the cleaned file
        print("🔍 Verifying cleaned data...")
        test_df = pd.read_csv(str(input_file), low_memory=False)
        
        print(f"✅ Verification successful!")
        print(f"📊 Final dataset: {len(test_df)} rows, {len(test_df.columns)} columns")
        
        # Generate summary
        print("\n📈 DATASET SUMMARY:")
        print(f"   • Total Videos: {len(test_df):,}")
        print(f"   • Channels: {test_df['channel_name'].nunique() if 'channel_name' in test_df.columns else 'Unknown'}")
        print(f"   • Date Range: {test_df['published_at'].min() if 'published_at' in test_df.columns else 'Unknown'} to {test_df['published_at'].max() if 'published_at' in test_df.columns else 'Unknown'}")
        
        if 'view_count' in test_df.columns:
            total_views = test_df['view_count'].sum()
            avg_views = test_df['view_count'].mean()
            print(f"   • Total Views: {total_views:,.0f}")
            print(f"   • Average Views: {avg_views:,.0f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        # Restore backup if cleanup failed
        if backup_file.exists():
            backup_file.rename(input_file)
            print("🔄 Restored original file")
        return False

if __name__ == "__main__":
    success = clean_csv_data()
    if success:
        print("\n🎉 CSV cleanup completed successfully!")
    else:
        print("\n💥 CSV cleanup failed!")
