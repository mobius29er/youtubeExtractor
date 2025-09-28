// RQS (Retention Quality Score) utility functions
// Centralized constants and functions for RQS color coding and thresholds

// RQS Color Thresholds - consistent across all components
export const RQS_THRESHOLDS = {
  EXCELLENT: 80,  // Green - Excellent performance
  GOOD: 60,       // Yellow - Good performance  
  FAIR: 40,       // Orange - Fair performance
  // Below 40 = Red - Needs improvement
};

/**
 * Get RQS color classes for styling based on score
 * @param {number} rqs - RQS score (0-100)
 * @param {string} variant - 'background' or 'text' styling variant
 * @returns {string} CSS class names for styling
 */
export const getRQSColor = (rqs, variant = 'background') => {
  if (variant === 'text') {
    // Text-only variant (for text color)
    if (rqs >= RQS_THRESHOLDS.EXCELLENT) return 'text-green-600';
    if (rqs >= RQS_THRESHOLDS.GOOD) return 'text-yellow-600';
    if (rqs >= RQS_THRESHOLDS.FAIR) return 'text-orange-600';
    return 'text-red-600';
  } else {
    // Background variant (text + background)
    if (rqs >= RQS_THRESHOLDS.EXCELLENT) return 'text-green-800 bg-green-100';
    if (rqs >= RQS_THRESHOLDS.GOOD) return 'text-yellow-800 bg-yellow-100';
    if (rqs >= RQS_THRESHOLDS.FAIR) return 'text-orange-800 bg-orange-100';
    return 'text-red-800 bg-red-100';
  }
};

/**
 * Get RQS badge classes for consistent badge styling
 * @param {number} rqs - RQS score (0-100)
 * @returns {string} CSS class names for badge styling
 */
export const getRQSBadgeColor = (rqs) => {
  if (rqs >= RQS_THRESHOLDS.EXCELLENT) return 'bg-green-100 text-green-800';
  if (rqs >= RQS_THRESHOLDS.GOOD) return 'bg-yellow-100 text-yellow-800';
  if (rqs >= RQS_THRESHOLDS.FAIR) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

/**
 * Get RQS performance label
 * @param {number} rqs - RQS score (0-100)
 * @returns {string} Human-readable performance label
 */
export const getRQSLabel = (rqs) => {
  if (rqs >= RQS_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (rqs >= RQS_THRESHOLDS.GOOD) return 'Good';
  if (rqs >= RQS_THRESHOLDS.FAIR) return 'Fair';
  return 'Needs Improvement';
};

/**
 * Get RQS performance emoji
 * @param {number} rqs - RQS score (0-100)
 * @returns {string} Emoji representing performance level
 */
export const getRQSEmoji = (rqs) => {
  if (rqs >= RQS_THRESHOLDS.EXCELLENT) return '🟢';
  if (rqs >= RQS_THRESHOLDS.GOOD) return '🟡';
  if (rqs >= RQS_THRESHOLDS.FAIR) return '🟠';
  return '🔴';
};