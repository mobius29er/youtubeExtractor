# Scripts Directory Structure

This directory contains organized utility scripts for the YouTube Data Extractor project.

## 📁 Directory Structure

# 🛠️ Scripts Directory - YouTube Data Extractor

Comprehensive collection of utility scripts for data processing, analysis, and maintenance of the YouTube Data Extractor project.

## 📁 Directory Structure

### 📊 `/analysis/` - Data Analysis & ML Scripts
Advanced scripts for dataset analysis and machine learning tasks:

**Core Analysis:**
- `analyze_dataset.py` - Basic dataset statistical analysis
- `comprehensive_analysis.py` - In-depth data exploration and insights
- `simple_analysis.py` - Quick dataset overview and summary stats
- `video_level_analysis.py` - Individual video performance analysis

**ML & Advanced Analytics:**
- `ml_analysis_robust.py` - Production-ready ML analysis with error handling
- `ml_analysis_text.py` - Text-based ML analysis (no matplotlib dependencies)
- `ml_exploration.py` - Exploratory data analysis for model development

**Reporting:**
- `final_comprehensive_report.py` - Generate comprehensive project reports
- `final_dataset_report.py` - Detailed dataset quality and completeness reports

### 🧹 `/cleanup/` - Data Cleaning & Maintenance
Scripts for data sanitization and repository maintenance:

**Data Quality:**
- `analyze_csv_duplicates.py` - Duplicate detection and intelligent removal
- `clean_csv_with_sampling.py` - CSV optimization with statistical sampling
- `clean_incomplete_channels.py` - Remove partial/corrupted channel data
- `fix_csv_format.py` - Repair CSV formatting and encoding issues

**Security & Privacy:**
- `clean_api_keys.py` - API key management and sanitization
- `remove_api_keys_from_data.py` - Strip sensitive data from datasets

**Data Processing:**
- `extract_complete_data.py` - Extract verified complete datasets
- `prepare_money_guy_restart.py` - Channel-specific data preparation

### 🔧 `/utilities/` - General Utilities & Helpers
Comprehensive utility scripts for system maintenance and data management:

**Data Management:**
- `analyze_data.py` - General data analysis utilities
- `extract_complete_data.py` - Complete data extraction workflows
- `safe_json_to_csv.py` - Robust JSON to CSV conversion
- `update_csv.py` - CSV update and maintenance utilities
- `update_summary.py` - Summary statistics updates

**System Maintenance:**
- `fix_all_scripts.py` - Batch script repair and optimization
- `fix_encoding_and_types.py` - Encoding and data type corrections
- `fix_progress_tracker.py` - Progress tracking system repairs
- `test_handle_fix.py` - Error handling and testing utilities

**Data Recovery & Analysis:**
- `analyze_discrepancies.py` - Data inconsistency detection
- `analyze_json_recovery.py` - JSON data recovery analysis
- `investigate_discrepancy.py` - Deep-dive discrepancy investigation
- `recover_lost_data.py` - Data recovery and restoration
- `archive_partial_channels.py` - Archive management for partial data

**Content Cleanup:**
- `cleanup_comments.py` - Comment data sanitization
- `cleanup_thumbnails.py` - Thumbnail file management and cleanup

### ✅ `/verification/` - Data Validation & Quality Assurance
Scripts for comprehensive data validation and integrity checking:

**Core Validation:**
- `check_data_structure.py` - Validate data structure integrity and schema
- `verify_datasets.py` - 5-stage comprehensive dataset verification
- `progress_verification.py` - Extraction progress validation and reporting
- `analyze_video_discrepancy.py` - Video-level data consistency checks

## 🚀 Usage Guidelines

### Running Scripts
All scripts should be executed from the project root directory to ensure proper path resolution:

```bash
# Analysis Examples
python scripts/analysis/comprehensive_analysis.py
python scripts/analysis/ml_analysis_text.py
python scripts/analysis/final_comprehensive_report.py

# Data Cleanup Examples  
python scripts/cleanup/clean_csv_with_sampling.py
python scripts/cleanup/analyze_csv_duplicates.py
python scripts/cleanup/extract_complete_data.py

# Utility Examples
python scripts/utilities/safe_json_to_csv.py
python scripts/utilities/cleanup_thumbnails.py
python scripts/utilities/recover_lost_data.py

# Verification Examples
python scripts/verification/verify_datasets.py
python scripts/verification/check_data_structure.py
python scripts/verification/progress_verification.py
```

### Best Practices
- **Environment**: Always activate your virtual environment before running scripts
- **Backups**: Create data backups before running cleanup scripts
- **Testing**: Use verification scripts to validate changes
- **Logging**: Monitor script outputs for errors and warnings

## 📋 Dependencies & Requirements

### Core Dependencies
Scripts require the project's virtual environment with these key packages:
- `pandas` - Data manipulation and analysis
- `numpy` - Numerical computing
- `joblib` - Model serialization (for ML scripts)
- `scikit-learn` - Machine learning utilities
- `matplotlib` (optional) - Visualization for some analysis scripts

### Installation
```bash
# Activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac  
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## 🎯 Script Categories by Use Case

### 🔍 **Data Exploration & Analysis**
- Start with: `scripts/analysis/simple_analysis.py`
- Deep dive: `scripts/analysis/comprehensive_analysis.py`
- ML insights: `scripts/analysis/ml_analysis_text.py`
- Final reports: `scripts/analysis/final_comprehensive_report.py`

### 🧼 **Data Quality & Cleanup**
- Duplicates: `scripts/cleanup/analyze_csv_duplicates.py`
- Formatting: `scripts/cleanup/fix_csv_format.py`
- Sampling: `scripts/cleanup/clean_csv_with_sampling.py`
- Security: `scripts/cleanup/remove_api_keys_from_data.py`

### � **Maintenance & Utilities**
- Data conversion: `scripts/utilities/safe_json_to_csv.py`
- File cleanup: `scripts/utilities/cleanup_thumbnails.py`
- Recovery: `scripts/utilities/recover_lost_data.py`
- System fixes: `scripts/utilities/fix_all_scripts.py`

### ✅ **Quality Assurance**
- Full validation: `scripts/verification/verify_datasets.py`
- Structure check: `scripts/verification/check_data_structure.py`
- Progress audit: `scripts/verification/progress_verification.py`

## 📈 Recent Enhancements

- **✅ Enhanced Analysis**: Added comprehensive reporting and video-level analysis
- **✅ Improved Cleanup**: Better duplicate detection and data sanitization
- **✅ Robust Utilities**: Enhanced error handling and recovery mechanisms
- **✅ Comprehensive Validation**: Multi-stage verification processes
- **✅ Better Organization**: Clear categorization for easier navigation

---

**💡 Tip**: Always run verification scripts after major data operations to ensure integrity!
