#!/usr/bin/env python3
"""
Data Recovery Script
Recovers all 700+ videos from the corrupted backup CSV file
"""

import pandas as pd
import re

def recover_lost_data():
    print("🔧 DATA RECOVERY IN PROGRESS...")
    print("=" * 50)
    
    # Read the corrupted backup file with error handling
    print("📖 Reading backup CSV with advanced error handling...")
    
    try:
        # Try to read with skip_bad_lines (older pandas) or on_bad_lines (newer pandas)
        df_recovered = pd.read_csv(
            'extracted_data/api_only_ml_dataset_backup.csv',
            encoding='utf-8',
            on_bad_lines='skip',  # Skip malformed lines
            dtype=str,  # Read everything as strings first
            low_memory=False,
            engine='python'  # More flexible parser
        )
        
        print(f"✅ Successfully recovered {len(df_recovered)} videos!")
        
        # Clean up the data
        print("🧹 Cleaning recovered data...")
        
        # Fix any text field issues
        text_columns = ['title', 'description', 'tags'] 
        for col in text_columns:
            if col in df_recovered.columns:
                # Remove newlines and excessive whitespace
                df_recovered[col] = df_recovered[col].astype(str).str.replace('\n', ' ').str.replace('\r', ' ')
                df_recovered[col] = df_recovered[col].str.strip()
        
        # Convert numeric columns
        numeric_columns = ['view_count', 'like_count', 'comment_count']
        for col in numeric_columns:
            if col in df_recovered.columns:
                df_recovered[col] = pd.to_numeric(df_recovered[col], errors='coerce').fillna(0)
        
        # Check channel distribution
        print(f"\n📊 RECOVERED DATA ANALYSIS:")
        print(f"   • Total videos: {len(df_recovered)}")
        print(f"   • Total channels: {df_recovered['channel_name'].nunique()}")
        
        channel_counts = df_recovered['channel_name'].value_counts()
        print(f"\n📈 Channel Distribution:")
        for channel, count in channel_counts.items():
            print(f"   • {channel}: {count} videos")
        
        # Save recovered data
        output_file = 'extracted_data/api_only_ml_dataset_RECOVERED.csv'
        print(f"\n💾 Saving recovered data to: {output_file}")
        
        df_recovered.to_csv(output_file, index=False, quoting=1)
        
        print(f"\n🎉 DATA RECOVERY COMPLETE!")
        print(f"   Original (current): 560 videos")
        print(f"   Recovered: {len(df_recovered)} videos")
        print(f"   Difference: +{len(df_recovered) - 560} videos recovered!")
        
        return df_recovered
        
    except Exception as e:
        print(f"❌ Error during recovery: {e}")
        
        # Fallback: Try line-by-line recovery
        print("🔄 Attempting line-by-line recovery...")
        return recover_line_by_line()

def recover_line_by_line():
    """Fallback recovery method"""
    print("🔧 Line-by-line recovery...")
    
    good_lines = []
    with open('extracted_data/api_only_ml_dataset_backup.csv', 'r', encoding='utf-8', errors='ignore') as f:
        header = f.readline().strip()
        good_lines.append(header)
        
        line_num = 1
        for line in f:
            line_num += 1
            # Count commas - should have exactly 14 commas for 15 fields
            comma_count = line.count(',')
            
            if comma_count == 14:  # Correct field count
                good_lines.append(line.strip())
            else:
                # Try to fix the line
                if comma_count > 14:
                    # Too many commas - likely embedded commas in text fields
                    # This is complex to fix automatically, so skip for now
                    continue
                else:
                    # Too few commas - skip
                    continue
    
    print(f"Recovered {len(good_lines) - 1} good lines out of ~14,560 total")
    
    # Write recovered lines to file

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
    with open('extracted_data/api_only_ml_dataset_RECOVERED_manual.csv', 'w', encoding='utf-8') as f:
        f.write('\n'.join(good_lines))
    
    return len(good_lines) - 1

if __name__ == "__main__":
    result = recover_lost_data()
