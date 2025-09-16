import json
import pandas as pd

with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

records = []
for channel_name, channel_data in data['data'].items():
    channel_info = channel_data['channel_info']
    
    for video in channel_data['videos']:
        record = {
            'channel_name': channel_name,
            'channel_id': channel_info.get('channel_id', ''),
            'subscriber_count': channel_info.get('subscriber_count', 0),
            'genre': channel_data.get('genre', ''),
            'video_id': video['video_id'],
            'title': video['title'],
            'view_count': video['view_count'],
            'like_count': video['like_count'],
            'comment_count': video['comment_count']
        }
        records.append(record)

df = pd.DataFrame(records)
df.to_csv('extracted_data/api_only_ml_dataset.csv', index=False, encoding='utf-8')

print(f'CSV updated: {len(df)} records')
print(f'Channels: {df["channel_name"].nunique()}')
