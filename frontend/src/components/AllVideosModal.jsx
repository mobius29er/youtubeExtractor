import React, { useState, useMemo } from 'react';
import { X, Search, SlidersHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { getRQSColor } from '../utils/rqsUtils';

const AllVideosModal = ({ isOpen, onClose, allVideos, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('views'); // views, rqs, engagement, likes, comments
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [showFilters, setShowFilters] = useState(false);
  const [rqsFilter, setRqsFilter] = useState({ min: '', max: '' });
  const [viewsFilter, setViewsFilter] = useState({ min: '', max: '' });
  const [likesFilter, setLikesFilter] = useState({ min: '', max: '' });
  const [commentsFilter, setCommentsFilter] = useState({ min: '', max: '' });
  const [engagementFilter, setEngagementFilter] = useState({ min: '', max: '' });

  // Process and filter videos
  const processedVideos = useMemo(() => {
    if (!allVideos || !Array.isArray(allVideos)) return [];

    return allVideos.map(video => ({
      ...video,
      engagement_rate: video.likes && video.views ? ((video.likes / video.views) * 100) : 0,
      rqs: video.rqs != null ? video.rqs : 75, // Use actual RQS if available, else fallback to 75
    }));
  }, [allVideos]);

  const filteredAndSortedVideos = useMemo(() => {
    let filtered = processedVideos.filter(video => {
      // Search filter
      if (searchTerm && !video.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !video.channel_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // RQS filter
      if (rqsFilter.min && video.rqs < parseFloat(rqsFilter.min)) return false;
      if (rqsFilter.max && video.rqs > parseFloat(rqsFilter.max)) return false;

      // Views filter
      if (viewsFilter.min && video.views < parseFloat(viewsFilter.min)) return false;
      if (viewsFilter.max && video.views > parseFloat(viewsFilter.max)) return false;

      // Likes filter
      if (likesFilter.min && video.likes < parseFloat(likesFilter.min)) return false;
      if (likesFilter.max && video.likes > parseFloat(likesFilter.max)) return false;

      // Comments filter
      if (commentsFilter.min && video.comments < parseFloat(commentsFilter.min)) return false;
      if (commentsFilter.max && video.comments > parseFloat(commentsFilter.max)) return false;

      // Engagement filter
      if (engagementFilter.min && video.engagement_rate < parseFloat(engagementFilter.min)) return false;
      if (engagementFilter.max && video.engagement_rate > parseFloat(engagementFilter.max)) return false;

      return true;
    });

    // Sort videos
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'rqs':
          aValue = a.rqs || 0;
          bValue = b.rqs || 0;
          break;
        case 'engagement':
          aValue = a.engagement_rate || 0;
          bValue = b.engagement_rate || 0;
          break;
        case 'likes':
          aValue = a.likes || 0;
          bValue = b.likes || 0;
          break;
        case 'comments':
          aValue = a.comments || 0;
          bValue = b.comments || 0;
          break;
        case 'views':
        default:
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [processedVideos, searchTerm, sortBy, sortOrder, rqsFilter, viewsFilter, likesFilter, commentsFilter, engagementFilter]);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatEngagement = (rate) => {
    return `${rate.toFixed(2)}%`;
  };

  const clearAllFilters = () => {
    setRqsFilter({ min: '', max: '' });
    setViewsFilter({ min: '', max: '' });
    setLikesFilter({ min: '', max: '' });
    setCommentsFilter({ min: '', max: '' });
    setEngagementFilter({ min: '', max: '' });
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-videos-modal-title"
    >
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 id="all-videos-modal-title" className="text-2xl font-bold">All Videos</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredAndSortedVideos.length} videos shown
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
          {/* Search and Sort */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos or channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="views">Views</option>
              <option value="rqs">RQS Score</option>
              <option value="engagement">Engagement</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className={`px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center gap-2`}
            >
              {sortOrder === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {sortOrder === 'desc' ? 'High to Low' : 'Low to High'}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } transition-colors flex items-center gap-2`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">RQS Score</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={rqsFilter.min}
                    onChange={(e) => setRqsFilter(prev => ({ ...prev, min: e.target.value }))}
                    className={`flex-1 px-3 py-2 rounded border ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={rqsFilter.max}
                    onChange={(e) => setRqsFilter(prev => ({ ...prev, max: e.target.value }))}
                    className={`flex-1 px-3 py-2 rounded border ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Views</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={viewsFilter.min}
                    onChange={(e) => setViewsFilter(prev => ({ ...prev, min: e.target.value }))}
                    className={`flex-1 px-3 py-2 rounded border ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={viewsFilter.max}
                    onChange={(e) => setViewsFilter(prev => ({ ...prev, max: e.target.value }))}
                    className={`flex-1 px-3 py-2 rounded border ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Engagement %</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={engagementFilter.min}
                    onChange={(e) => setEngagementFilter(prev => ({ ...prev, min: e.target.value }))}
                    className={`flex-1 px-3 py-2 rounded border ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={engagementFilter.max}
                    onChange={(e) => setEngagementFilter(prev => ({ ...prev, max: e.target.value }))}
                    className={`flex-1 px-3 py-2 rounded border ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Videos Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} sticky top-0`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">RQS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Engagement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Likes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Comments</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredAndSortedVideos.map((video, index) => (
                  <tr key={`${video.video_id || index}`} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-sm" 
                           style={{ 
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical',
                             overflow: 'hidden'
                           }}
                           title={video.title}>
                          {video.title || 'No Title'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          {video.duration || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{video.channel_name || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{formatNumber(video.views)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRQSColor(video.rqs)}`}>
                        {video.rqs}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{formatEngagement(video.engagement_rate)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{formatNumber(video.likes)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{formatNumber(video.comments)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} rounded-b-lg`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredAndSortedVideos.length} of {processedVideos.length} total videos
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllVideosModal;