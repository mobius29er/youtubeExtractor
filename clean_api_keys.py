#!/usr/bin/env python3
"""
Clean API keys from all remaining files
"""

import os

# Files to clean
files_to_clean = [
    'extracted_data/api_only_complete_data_backup.json',
    'corrected_extraction.log'
]

api_key = '[REDACTED_API_KEY]'  # This was the old compromised key
replacement = '[REDACTED_API_KEY]'

for file_path in files_to_clean:
    if os.path.exists(file_path):
        print(f"Cleaning {file_path}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_size = len(content)
        content = content.replace(api_key, replacement)
        new_size = len(content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  {original_size} -> {new_size} characters")
        print(f"  Removed {original_size - new_size} characters (API keys)")
    else:
        print(f"File not found: {file_path}")

print("\nAPI key cleanup complete!")
