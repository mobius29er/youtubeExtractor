"""
Fix encoding and data type issues in Python scripts
"""
import os
import re
import json

def fix_encoding_and_types():
    """Fix encoding and data type issues in all scripts"""
    scripts_dir = "scripts"
    fixes_applied = 0
    
    # Walk through all directories
    for root, dirs, files in os.walk(scripts_dir):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                
                try:
                    # Try reading with UTF-8 first
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    except UnicodeDecodeError:
                        # Fallback to latin-1 for problematic files
                        with open(file_path, 'r', encoding='latin-1') as f:
                            content = f.read()
                    
                    original_content = content
                    
                    # Fix duration calculation to handle string/int conversion
                    if "sum(int(v['duration']) if isinstance(v['duration'], str) and v['duration'].isdigit() else (v['duration'] if isinstance(v['duration'], int) else 0) for v in videos)" in content:
                        content = re.sub(
                            r"sum\(v\['duration'\] for v in videos\)",
                            "sum(int(v['duration']) if isinstance(v['duration'], str) and v['duration'].isdigit() else (v['duration'] if isinstance(v['duration'], int) else 0) for v in videos)",
                            content
                        )
                    
                    # Fix other common type issues
                    if "int(sum(" in content and "duration" in content:
                        content = re.sub(
                            r"int\(sum\(([^)]+)\)\)",
                            r"int(sum(\1) if sum(\1) > 0 else 0)",
                            content
                        )
                    
                    # Fix view count calculations that might have string values
                    if "sum(int(v['view_count']) if isinstance(v['view_count'], (str, int)) and str(v['view_count']).isdigit() else 0" in content:
                        content = re.sub(
                            r"sum\(v\['view_count'\]([^)]*)\)",
                            "sum(int(v['view_count']) if isinstance(v['view_count'], (str, int)) and str(v['view_count']).isdigit() else 0\\1)",
                            content
                        )
                    
                    # Add safe conversion functions at the top of files that need them
                    if ("duration" in content or "view_count" in content) and "def safe_int" not in content:
                        # Add helper function after imports
                        import_section = ""
                        code_section = content
                        
                        # Find where imports end
                        lines = content.split('\n')
                        last_import_line = 0
                        for i, line in enumerate(lines):
                            if line.strip().startswith(('import ', 'from ')) or line.strip().startswith('#'):
                                last_import_line = i
                        
                        if last_import_line > 0:
                            import_section = '\n'.join(lines[:last_import_line + 1])
                            code_section = '\n'.join(lines[last_import_line + 1:])
                        
                        helper_functions = '''

def safe_int(value, default=0):
    """Safely convert value to int"""
    if isinstance(value, int):
                return value
    if isinstance(value, str) and value.isdigit():
        return int(value)
    return default

def safe_float(value, default=0.0):
    """Safely convert value to float"""
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return default
    return default
'''
                        
                        content = import_section + helper_functions + code_section
                    
                    # Only write if content changed
                    if content != original_content:
                        # Write back with UTF-8 encoding
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        fixes_applied += 1
                        print(f"✅ Fixed: {file_path}")
                    
                except Exception as e:
                    print(f"❌ Error processing {file_path}: {e}")
    
    print(f"\n🔧 Total fixes applied: {fixes_applied}")
    return fixes_applied

if __name__ == "__main__":
    print("🔧 FIXING ENCODING AND TYPE ISSUES")
    print("=" * 50)
    fix_encoding_and_types()
