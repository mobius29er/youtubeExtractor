#!/usr/bin/env python3
"""
Analyze why we have 1,050 videos instead of expected 1,000
"""

import json

def analyze_video_counts():
    # Load the final dataset
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print('=== CHANNEL COUNT ANALYSIS ===')
    print(f'Total channels in dataset: {len(data["data"])}')
    print(f'Expected channels: 25')
    print(f'Difference: {len(data["data"]) - 25}')
    print()

    print('=== VIDEO COUNT BY CHANNEL ===')
    total_videos = 0
    channels_by_count = {}

    for channel_name, channel_data in data['data'].items():
        video_count = len(channel_data['videos'])
        total_videos += video_count
        
        if video_count not in channels_by_count:
            channels_by_count[video_count] = []
        channels_by_count[video_count].append(channel_name)

    print(f'Total videos: {total_videos}')
    print(f'Expected videos: 1000 (25 × 40)')
    print(f'Extra videos: {total_videos - 1000}')
    print()

    print('=== CHANNELS BY VIDEO COUNT ===')
    for count in sorted(channels_by_count.keys(), reverse=True):
        channels = channels_by_count[count]
        print(f'{count} videos: {len(channels)} channels')
        for channel in channels:
            print(f'  - {channel}')
        print()

    print('=== ANALYSIS SUMMARY ===')
    non_forty = []
    for channel_name, channel_data in data['data'].items():
        video_count = len(channel_data['videos'])
        if video_count != 40:
            non_forty.append((channel_name, video_count))

    if non_forty:
        print('Channels that don\'t have exactly 40 videos:')
        for channel, count in non_forty:
            print(f'  {channel}: {count} videos')
        
        print(f'\nExtra videos breakdown:')
        extra_videos = sum(count for _, count in non_forty if count < 40)
        missing_videos = sum(40 - count for _, count in non_forty if count < 40)
        print(f'  Videos from partial channels: {extra_videos}')
        print(f'  Missing videos to reach 40 each: {missing_videos}')
    else:
        print('All channels have exactly 40 videos')

    # Check if we should have exactly 25 channels
    print(f'\n=== EXPECTED VS ACTUAL ===')
    print(f'We have {len(data["data"])} channels instead of 25')
    print(f'Extra channels: {len(data["data"]) - 25}')
    
    # Calculate what the total should be
    should_be_total = 25 * 40
    actual_total = total_videos
    print(f'Should have: {should_be_total} videos')
    print(f'Actually have: {actual_total} videos')
    print(f'Difference: {actual_total - should_be_total} videos')

if __name__ == "__main__":
    analyze_video_counts()
