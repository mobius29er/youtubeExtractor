import React, { useState } from 'react';
import { X, Eye, Heart, MessageCircle, Clock, TrendingUp, ExternalLink, Play } from 'lucide-react';
import { getRQSBadgeColor } from '../utils/rqsUtils';

const VideoDetailsModal = ({ 
  isOpen, 
  onClose, 
  channel, 
  videos = [], 
  darkMode,
  sortBy = 'rqs' 
}) => {
  const [currentSort, setCurrentSort] = useState(sortBy);

  if (!isOpen || !channel) return null;

  // Sort videos based on current sort option
  const sortedVideos = [...videos].sort((a, b) => {
    switch (currentSort) {
      case 'rqs':
        return (b.rqs || 0) - (a.rqs || 0);
      case 'views':
        return (b.view_count || 0) - (a.view_count || 0);
      case 'likes':
        return (b.like_count || 0) - (a.like_count || 0);
      case 'comments':
        return (b.comment_count || 0) - (a.comment_count || 0);
      case 'engagement':
        const aEngagement = ((a.like_count || 0) + (a.comment_count || 0)) / Math.max(a.view_count || 1, 1);
        const bEngagement = ((b.like_count || 0) + (b.comment_count || 0)) / Math.max(b.view_count || 1, 1);
        return bEngagement - aEngagement;
      default:
        return 0;
    }
  });

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    
    // Handle if it's already in seconds format (number)
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const secs = duration % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Handle ISO 8601 format (PT3M6S, PT38M32S, etc.)
    if (typeof duration === 'string' && duration.startsWith('PT')) {
      try {
        const timeMatch = duration.match(/PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10) || 0;
          const minutes = parseInt(timeMatch[2], 10) || 0;
          const seconds = parseInt(timeMatch[3], 10) || 0;
          
          if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          }
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      } catch (error) {
        console.warn('Error parsing duration:', duration, error);
      }
    }
    
    // If it's already in readable format, return as is
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    return 'N/A';
  };

  const getEngagementRate = (video) => {
    if (!video.view_count) return 0;
    return (((video.like_count || 0) + (video.comment_count || 0)) / video.view_count * 100);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-details-modal-title"
    >
      <div className={`max-w-5xl w-full max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 id="video-details-modal-title" className="text-2xl font-bold flex items-center gap-3">
                <Play className="w-6 h-6 text-red-500" />
                {channel} Videos
                <span className={`text-sm font-normal px-3 py-1 rounded-full ${
                  darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  {videos.length} videos
                </span>
              </h2>
              <p className={`text-sm mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Click any video to explore its performance metrics
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-4 mt-4">
            <span className={`text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Sort by:
            </span>
            <select
              value={currentSort}
              onChange={(e) => setCurrentSort(e.target.value)}
              className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
              } focus:ring-2 focus:border-transparent`}
            >
              <option value="rqs">📊 RQS Score</option>
              <option value="views">👀 Views</option>
              <option value="likes">❤️ Likes</option>
              <option value="comments">💬 Comments</option>
              <option value="engagement">⚡ Engagement Rate</option>
            </select>
          </div>
        </div>

        {/* Video List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {sortedVideos.length === 0 ? (
            <div className="p-8 text-center">
              <div className={`text-gray-400 mb-4`}>
                <Eye className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <p className={`text-lg font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                No videos found for this channel
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {/* Table Header */}
                <thead className={`sticky top-0 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <tr className={`border-b ${
                    darkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" />
                        Views
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3" />
                        Likes
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Comments
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        RQS Score
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Duration
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Engagement Rate
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className={`divide-y ${
                  darkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {sortedVideos.map((video, index) => (
                    <tr 
                      key={video.video_id || index}
                      className={`transition-colors ${
                        darkMode 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Video Title and Thumbnail */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          {/* YouTube Thumbnail */}
                          <div className="w-16 h-10 rounded flex-shrink-0 overflow-hidden">
                            <img
                              src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to placeholder if thumbnail fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className={`w-16 h-10 rounded flex-shrink-0 items-center justify-center ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`} style={{display: 'none'}}>
                              <Eye className={`w-4 h-4 ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm line-clamp-2 mb-1">
                              {video.title || 'Untitled Video'}
                            </h3>
                            {video.published_at && (
                              <div className={`text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {new Date(video.published_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium">
                          {formatNumber(video.view_count)}
                        </span>
                      </td>

                      {/* Likes */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium">
                          {formatNumber(video.like_count)}
                        </span>
                      </td>

                      {/* Comments */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium">
                          {formatNumber(video.comment_count)}
                        </span>
                      </td>

                      {/* RQS Score */}
                      <td className="px-4 py-4 text-center">
                        <span className={`font-bold text-sm px-2 py-1 rounded ${getRQSBadgeColor(video.rqs)}`}>
                          {video.rqs ? `${Math.round(video.rqs)}%` : 'N/A'}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium">
                          {formatDuration(video.duration)}
                        </span>
                      </td>

                      {/* Engagement Rate */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium">
                          {getEngagementRate(video).toFixed(2)}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        {video.video_id && (
                          <a
                            href={`https://youtube.com/watch?v=${video.video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                              darkMode 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title="Watch on YouTube"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Watch
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${
          darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Showing {sortedVideos.length} videos sorted by {currentSort}
            </div>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailsModal;