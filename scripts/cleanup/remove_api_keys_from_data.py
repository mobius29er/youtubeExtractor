#!/usr/bin/env python3
"""
Security cleanup script to remove leaked API keys from JSON data files.
This script finds and replaces any API keys in the extracted data files.
"""

import json
import re
import os
from pathlib import Path

def sanitize_text(text):
    """Remove API keys from any text"""
    if not isinstance(text, str):
        return text
    
    # Remove API keys from URLs (matches key=AIza... pattern)
    text = re.sub(r'key=AIza[a-zA-Z0-9_-]+', 'key=[REDACTED]', text)
    # Also remove any standalone API key patterns
    text = re.sub(r'AIza[a-zA-Z0-9_-]{35}', '[API_KEY_REDACTED]', text)
    return text

def sanitize_json_object(obj):
    """Recursively sanitize a JSON object"""
    if isinstance(obj, dict):
        return {key: sanitize_json_object(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json_object(item) for item in obj]
    elif isinstance(obj, str):
        return sanitize_text(obj)
    else:
        return obj

def clean_json_file(file_path):
    """Clean API keys from a JSON file"""
    print(f"🔍 Scanning {file_path}...")
    
    # Check if file contains API keys first
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Count occurrences
    api_key_pattern = r'AIza[a-zA-Z0-9_-]{35}'
    matches = re.findall(api_key_pattern, content)
    
    if not matches:
        print(f"✅ {file_path} is clean - no API keys found")
        return False
    
    print(f"🚨 Found {len(matches)} API key occurrence(s) in {file_path}")
    
    # Load and sanitize JSON
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Sanitize the data
        clean_data = sanitize_json_object(data)
        
        # Create backup
        backup_path = file_path + '.backup'
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"📦 Created backup: {backup_path}")
        
        # Write cleaned data
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(clean_data, f, indent=2)
        
        print(f"🧹 Cleaned {file_path} - API keys removed")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Clean all JSON files in the project"""
    print("🔐 YouTube Extractor - API Key Cleanup Tool")
    print("=" * 50)
    
    # Define files to clean
    files_to_clean = [
        "extracted_data/api_only_complete_data.json",
        "extracted_data/metadata_only.json",
        "extracted_data/api_only_ml_dataset.json"  # if it exists
    ]
    
    cleaned_files = 0
    total_files = 0
    
    for file_path in files_to_clean:
        if os.path.exists(file_path):
            total_files += 1
            if clean_json_file(file_path):
                cleaned_files += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print("\n" + "=" * 50)
    print(f"🏁 Cleanup complete!")
    print(f"📊 Processed {total_files} files")
    print(f"🧹 Cleaned {cleaned_files} files")
    
    if cleaned_files > 0:
        print("\n🚨 IMPORTANT NEXT STEPS:")
        print("1. Revoke the compromised API key in Google Cloud Console")
        print("2. Generate a new API key")
        print("3. Update your .env file with the new key")
        print("4. Commit these cleaned files to git")

if __name__ == "__main__":
    main()
