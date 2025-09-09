# Scripts Directory Structure

This directory contains organized utility scripts for the YouTube Data Extractor project.

## 📁 Directory Structure

### `/analysis/`
Scripts for data analysis and machine learning tasks:
- `analyze_dataset.py` - Basic dataset analysis
- `comprehensive_analysis.py` - Comprehensive data analysis
- `ml_analysis_robust.py` - Robust ML analysis with error handling
- `ml_analysis_text.py` - Text-based ML analysis (no matplotlib)
- `ml_exploration.py` - Exploratory data analysis
- `simple_analysis.py` - Simple dataset overview

### `/cleanup/`
Scripts for data cleaning and maintenance:
- `analyze_csv_duplicates.py` - Duplicate detection and removal
- `clean_api_keys.py` - API key management and cleaning
- `clean_csv_with_sampling.py` - CSV cleaning with intelligent sampling
- `clean_incomplete_channels.py` - Remove incomplete channel data
- `prepare_money_guy_restart.py` - Prepare Money Guy channel for re-extraction

### `/utilities/`
General utility and helper scripts:
- `fix_progress_tracker.py` - Progress tracking fixes
- `test_handle_fix.py` - Test and handle error fixes

### `/verification/`
Scripts for data validation and verification:
- `check_data_structure.py` - Validate data structure integrity
- `progress_verification.py` - Verify extraction progress
- `verify_datasets.py` - Comprehensive dataset verification (5-stage validation)

## 🚀 Usage

All scripts maintain their original functionality but are now organized for better maintainability. Run them from the project root directory:

```bash
# Example: Run dataset verification
python scripts/verification/verify_datasets.py

# Example: Run ML analysis
python scripts/analysis/ml_analysis_text.py
```

## 📋 Dependencies

Scripts may require the project's virtual environment and dependencies listed in `requirements.txt`.
