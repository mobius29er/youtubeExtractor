#!/usr/bin/env python3
"""
Clean incomplete channels from main data file
"""
import json

def clean_incomplete_channels():
    # Load the main data file
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print('=== BEFORE CLEANUP ===')
    print(f'Total channels: {len(data["data"])}')
    print(f'Total videos: {data["videos_selected"]}')

    # Check which channels are incomplete
    incomplete_channels = []
    for channel_name, channel_data in data['data'].items():
        if 'selection_result' in channel_data and 'selected_videos' in channel_data['selection_result']:
            video_count = len(channel_data['selection_result']['selected_videos'])
            if video_count < 40:  # Target is 40 videos per channel
                incomplete_channels.append(channel_name)
                print(f'{channel_name}: {video_count} videos (INCOMPLETE)')
            else:
                print(f'{channel_name}: {video_count} videos (COMPLETE)')
        else:
            incomplete_channels.append(channel_name)
            print(f'{channel_name}: NO VIDEO DATA (INCOMPLETE)')

    # Remove incomplete channels from main data
    print(f'\n=== REMOVING INCOMPLETE CHANNELS ===')
    for channel in incomplete_channels:
        if channel in data['data']:
            del data['data'][channel]
            print(f'✅ Removed {channel} from main data')

    # Update counters
    data['channels_processed'] = len(data['data'])
    data['videos_selected'] = sum(len(channel_data['selection_result']['selected_videos']) 
                                 for channel_data in data['data'].values() 
                                 if 'selection_result' in channel_data and 'selected_videos' in channel_data['selection_result'])

    print('\n=== AFTER CLEANUP ===')
    print(f'Total channels: {data["channels_processed"]}')
    print(f'Total videos: {data["videos_selected"]}')

    # Save the cleaned data
    with open('extracted_data/api_only_complete_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print('✅ Main data file updated - incomplete channels can now be reprocessed')

if __name__ == '__main__':
    clean_incomplete_channels()
