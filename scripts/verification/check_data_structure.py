#!/usr/bin/env python3
"""
Check data structure to understand why channels keep getting reprocessed
"""
import json

# Load the data and check the structure
with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('=== DATA STRUCTURE ANALYSIS ===')
print(f'Top-level keys: {list(data.keys())}')
print()

# Check a sample channel structure
sample_channel = list(data['data'].keys())[0]
print(f'Sample channel: {sample_channel}')
print(f'Channel keys: {list(data["data"][sample_channel].keys())}')
print()

# Check if it uses 'videos' instead of 'selection_result'
if 'videos' in data['data'][sample_channel]:
    video_count = len(data['data'][sample_channel]['videos'])
    print(f'Found "videos" key with {video_count} videos')
    print('First video keys:', list(data['data'][sample_channel]['videos'][0].keys())[:5])
else:
    print('No "videos" key found')

if 'selection_result' in data['data'][sample_channel]:
    print('Found "selection_result" key')
    if 'selected_videos' in data['data'][sample_channel]['selection_result']:
        video_count = len(data['data'][sample_channel]['selection_result']['selected_videos'])
        print(f'Found "selected_videos" with {video_count} videos')
    else:
        print('No "selected_videos" in selection_result')
        print('selection_result keys:', list(data['data'][sample_channel]['selection_result'].keys()))
else:
    print('No "selection_result" key found')
