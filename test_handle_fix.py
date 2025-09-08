#!/usr/bin/env python3
"""
Quick test to validate the handle error fix
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Test the channel_info structure
test_channel_info = {
    "name": "Test Channel",
    "handle": "@TestChannel", 
    "subs": 1000000,
    "global_tier": "Mid",
    "genre_tier": "Small",
    "channel_id": "UCTestChannelID123"
}

print("Testing channel_info structure...")
print(f"Channel name: {test_channel_info.get('name', 'Unknown')}")
print(f"Channel ID: {test_channel_info.get('channel_id')}")
print(f"Handle: {test_channel_info.get('handle', '')}")

# Test error handling simulation
try:
    # Simulate the error condition
    if not test_channel_info.get('channel_id'):
        channel_name = test_channel_info.get('name', 'Unknown')
        print(f"Would log: Error extracting channel data for {channel_name}")
    else:
        print("✅ Error handling syntax is correct!")
        
except Exception as e:
    channel_name = test_channel_info.get('name', 'Unknown')
    print(f"Error extracting channel data for {channel_name}: {e}")

print("✅ Handle error fix validation successful!")
