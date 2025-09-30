#!/usr/bin/env python3
"""
Test script for the YouTube prediction system
"""

import sys
import os
sys.path.append('src')

from prediction_api import YouTubePredictionSystem

def test_prediction():
    """Test the prediction system with your trained models"""
    try:
        # Initialize the system
        print("🚀 Initializing prediction system...")
        predictor = YouTubePredictionSystem()
        
        print(f"✅ System initialized successfully")
        print(f"📋 Loaded models: {list(predictor.models.keys())}")
        print(f"📋 Loaded scalers: {list(predictor.scalers.keys())}")
        
        # Test prediction with various scenarios
        test_cases = [
            {
                'title': 'How to Build Amazing Thumbnails That Get Clicks!',
                'genre': 'education_science',
                'subscriber_count': 50000,
                'video_data': {
                    'thumbnail_text': 'Click Here!', 
                    'tags': ['tutorial', 'design', 'youtube'],
                    'description': 'Learn how to create eye-catching thumbnails',
                    'duration_seconds': 600,
                    'like_count': 100,
                    'comment_count': 25
                }
            },
            {
                'title': 'EPIC MINECRAFT BUILD CHALLENGE!',
                'genre': 'gaming',
                'subscriber_count': 100000,
                'video_data': {
                    'thumbnail_text': 'EPIC BUILD', 
                    'tags': ['minecraft', 'gaming', 'challenge'],
                    'description': 'Amazing minecraft building challenge',
                    'duration_seconds': 900
                }
            },
            {
                'title': 'Family Fun Day at the Park!',
                'genre': 'kids_family',
                'subscriber_count': 25000,
                'video_data': {
                    'thumbnail_text': 'FUN!', 
                    'tags': ['family', 'kids', 'fun'],
                    'description': 'A wonderful day out with the family'
                }
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n🧪 Test Case {i}: {test_case['title'][:30]}...")
            
            result = predictor.predict_performance(
                title=test_case['title'],
                genre=test_case['genre'],
                subscriber_count=test_case['subscriber_count'],
                thumbnail_data=None,
                video_data=test_case['video_data']
            )
            
            print(f"📊 Results for {test_case['genre']} ({test_case['subscriber_count']:,} subs):")
            print(f"  📈 Views: {result['predicted_views']:,}")
            print(f"  📊 RQS: {result['predicted_rqs']:.1f}")
            print(f"  👆 CTR: {result['predicted_ctr']:.4f}")
            
            if 'model_source' in result:
                print(f"  🤖 Source: {result['model_source']}")
            if 'features_used' in result:
                print(f"  🔧 Features: {result['features_used']}")
                
        print(f"\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_prediction()