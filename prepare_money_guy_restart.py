#!/usr/bin/env python3
"""
Remove Money Guy from data to allow proper intelligent re-extraction
"""
import json

def remove_money_guy_for_clean_restart():
    # Load data
    with open('extracted_data/api_only_complete_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("🧹 PREPARING MONEY GUY FOR CLEAN RESTART")
    print("=" * 40)
    
    if 'Money Guy' in data['data']:
        print(f"📊 Current Money Guy data: {len(data['data']['Money Guy']['videos'])} videos")
        print("❌ Removing incomplete Money Guy data for clean restart")
        
        # Remove from main data
        del data['data']['Money Guy']
        
        # Update counters
        data['channels_processed'] = len(data['data'])
        data['videos_selected'] = sum(len(channel_data['videos']) 
                                     for channel_data in data['data'].values())
        
        # Save updated data
        with open('extracted_data/api_only_complete_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Updated dataset: {data['channels_processed']} channels, {data['videos_selected']} videos")
        print("🔄 Money Guy will be processed fresh with proper intelligent sampling")
    
    # Also remove from progress tracker
    with open('extracted_data/progress_tracker.json', 'r', encoding='utf-8') as f:
        progress = json.load(f)
    
    if 'Money Guy' in progress['processed_channels']:
        progress['processed_channels'].remove('Money Guy')
        
        with open('extracted_data/progress_tracker.json', 'w', encoding='utf-8') as f:
            json.dump(progress, f, indent=2)
        
        print("✅ Removed Money Guy from progress tracker")
    
    print("\n🎯 RESULT: Money Guy will be extracted fresh with:")
    print("  • 10 top performers")
    print("  • 10 bottom performers") 
    print("  • 20 random samples")
    print("  • Total: 40 videos with proper categorization")

if __name__ == '__main__':
    remove_money_guy_for_clean_restart()
