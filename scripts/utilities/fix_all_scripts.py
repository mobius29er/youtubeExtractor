#!/usr/bin/env python3
"""
Universal Script Fixer
Updates all analysis scripts to handle CSV parsing errors and use SAFE CSV files
"""

import os
import re
from pathlib import Path

def fix_csv_loading_in_file(file_path):
    """Fix CSV loading issues in a Python file"""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern 1: Simple pd.read_csv calls
        pattern1 = r"pd\.read_csv\('extracted_data/api_only_ml_dataset\.csv'\)"
        replacement1 = """pd.read_csv('extracted_data/api_only_ml_SAFE.csv') if os.path.exists('extracted_data/api_only_ml_SAFE.csv') else pd.read_csv('extracted_data/api_only_ml_SAFE.csv') if os.path.exists('extracted_data/api_only_ml_SAFE.csv') else pd.read_csv('extracted_data/api_only_ml_dataset.csv')"""
        
        content = re.sub(pattern1, replacement1, content)
        
        # Pattern 2: CSV path variables
        pattern2 = r"csv_path = Path\('extracted_data/api_only_ml_dataset\.csv'\)"
        replacement2 = """csv_path = Path('extracted_data/api_only_ml_SAFE.csv') if Path('extracted_data/api_only_ml_SAFE.csv').exists() else Path('extracted_data/api_only_ml_dataset.csv')"""
        
        content = re.sub(pattern2, replacement2, content)
        
        # Add import os if not present
        if 'import os' not in content and 'extracted_data/api_only_ml_SAFE.csv' in content:
            # Find the imports section and add os
            import_lines = []
            other_lines = []
            in_imports = True
            
            for line in content.split('\n'):
                if line.startswith('import ') or line.startswith('from ') or line.strip() == '' or line.startswith('#'):
                    if in_imports:
                        import_lines.append(line)
                    else:
                        other_lines.append(line)
                else:
                    in_imports = False
                    other_lines.append(line)
            
            if 'import os' not in '\n'.join(import_lines):
                import_lines.append('import os')
            
            content = '\n'.join(import_lines) + '\n' + '\n'.join(other_lines)
        
        # Fix common column name issues
        column_fixes = {
            "videos[0].get('channel_subscriber_count' if 'channel_subscriber_count' in data[0] else 'subscriber_count', 0) if videos and isinstance(videos[0], dict) else 0": "videos[0].get('channel_subscriber_count' if 'channel_subscriber_count' in data[0] else 'subscriber_count', 0) if videos and isinstance(videos[0], dict) else 0",
            "'channel_subscriber_count' if 'channel_subscriber_count' in data[0] else 'subscriber_count'": "'channel_subscriber_count' if 'channel_subscriber_count' in data[0] else 'subscriber_count' if 'channel_subscriber_count' if 'channel_subscriber_count' in data[0] else 'subscriber_count' in data[0] else 'subscriber_count'",
        }
        
        for old, new in column_fixes.items():
            content = content.replace(old, new)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def fix_all_scripts():
    """Fix all scripts in the project"""
    
    print("🔧 UNIVERSAL SCRIPT FIXER")
    print("=" * 50)
    
    script_dirs = [
        'scripts/analysis',
        'scripts/utilities', 
        'scripts/verification'
    ]
    
    fixed_count = 0
    total_count = 0
    
    for script_dir in script_dirs:
        if os.path.exists(script_dir):
            print(f"\n📂 Fixing scripts in {script_dir}/")
            
            for file_path in Path(script_dir).glob('*.py'):
                total_count += 1
                print(f"   Checking {file_path.name}...", end=' ')
                
                if fix_csv_loading_in_file(file_path):
                    print("✅ Fixed")
                    fixed_count += 1
                else:
                    print("⏭️  No changes needed")
    
    print(f"\n📊 SUMMARY:")
    print(f"   Total scripts checked: {total_count}")
    print(f"   Scripts fixed: {fixed_count}")
    print(f"   Scripts unchanged: {total_count - fixed_count}")
    
    print(f"\n🎉 Script fixing complete!")
    
    # Test a few key scripts
    print(f"\n🧪 TESTING FIXED SCRIPTS:")
    test_scripts = [
        'scripts/analysis/simple_analysis.py',
        'scripts/utilities/investigate_discrepancy.py',
        'scripts/verification/verify_datasets.py'
    ]
    
    for script in test_scripts:
        if os.path.exists(script):
            print(f"   Testing {script}...", end=' ')
            try:
                # Just check if it can be imported/parsed
                with open(script, 'r') as f:
                    compile(f.read(), script, 'exec')
                print("✅ Syntax OK")
            except Exception as e:
                print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_all_scripts()
