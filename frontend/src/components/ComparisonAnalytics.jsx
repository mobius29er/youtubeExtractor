import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Layers, 
  Download, 
  RefreshCw,
  ArrowRight,
  Award,
  Users,
  Eye,
  Heart
} from 'lucide-react';
import FilterControls from './FilterControls';

const ComparisonAnalytics = ({ data, loading, darkMode }) => {
  const [comparisonType, setComparisonType] = useState('genres');
  const [selectedItems, setSelectedItems] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    genre: 'all',
    tier: 'all',
    sortBy: 'name'
  });

  useEffect(() => {
    if (data) {
      generateComparisonData();
    }
  }, [data, comparisonType, selectedItems]);

  const generateComparisonData = () => {
    if (!data || !data.channels || data.channels.length === 0) {
      console.log('No data available for comparison analytics');
      setComparisonData({
        summary: [],
        radar: [],
        performance: [],
        topPerformers: [],
        comparison: []
      });
      return;
    }

    let compData = {};

    if (comparisonType === 'genres') {
      compData = generateGenreComparison(data.channels);
    } else if (comparisonType === 'tiers') {
      compData = generateTierComparison(data.channels);
    } else if (comparisonType === 'channels') {
      compData = generateChannelComparison(data.channels);
    }

    setComparisonData(compData);
  };

  const generateGenreComparison = (channels) => {
    if (!channels || channels.length === 0) {
      return {
        summary: [],
        radar: []
      };
    }

    // Default genre for channels without assigned genre
    const DEFAULT_GENRE = 'other';

    const genreMap = {};
    channels.forEach(channel => {
      // Normalize genre to match our filter options with explicit fallback
      let genre = (channel.genre || DEFAULT_GENRE).toLowerCase();
      
      // Map variations to our standard genres
      if (genre.includes('christian') || genre.includes('religious') || genre.includes('catholic')) {
        genre = 'catholic';
      } else if (genre.includes('challenge') || genre.includes('stunt')) {
        genre = 'challenge/stunts';
      } else if (genre.includes('science') || genre.includes('education')) {
        genre = 'education';
      } else if (genre.includes('kids') || genre.includes('family')) {
        genre = 'family';
      } else if (genre.includes('gaming')) {
        genre = 'gaming';
      } else {
        genre = 'education'; // Default fallback
      }

      if (!genreMap[genre]) {
        genreMap[genre] = {
          name: genre.charAt(0).toUpperCase() + genre.slice(1).replace('/', '/'),
          totalViews: 0,
          totalVideos: 0,
          totalChannels: 0,
          avgEngagement: 0,
          avgLikes: 0,
          avgComments: 0,
          topChannel: '',
          maxViews: 0
        };
      }
      
      const views = channel.totalViews || channel.views || 0;
      const videos = channel.videos || 0;
      const engagement = channel.avgEngagement || channel.engagementRate || 0;
      const likes = channel.avgLikes || channel.likes || 0;
      const comments = channel.avgComments || channel.comments || 0;
      
      genreMap[genre].totalViews += views;
      genreMap[genre].totalVideos += videos;
      genreMap[genre].totalChannels += 1;
      genreMap[genre].avgEngagement += engagement;
      genreMap[genre].avgLikes += likes;
      genreMap[genre].avgComments += comments;
      
      if (views > genreMap[genre].maxViews) {
        genreMap[genre].maxViews = views;
        genreMap[genre].topChannel = channel.name;
      }
    });

    // Calculate averages
    Object.values(genreMap).forEach(genre => {
      if (genre.totalChannels > 0) {
        genre.avgEngagement = genre.avgEngagement / genre.totalChannels;
        genre.avgLikes = genre.avgLikes / genre.totalChannels;
        genre.avgComments = genre.avgComments / genre.totalChannels;
        genre.avgViewsPerVideo = genre.totalViews / Math.max(genre.totalVideos, 1);
      }
    });

    return {
      summary: Object.values(genreMap),
      radar: Object.values(genreMap).map(genre => ({
        genre: genre.name,
        Views: Math.log10(genre.totalViews + 1) * 10,
        Engagement: Math.min(genre.avgEngagement * 100, 100),
        Videos: Math.min((genre.totalVideos / 100) * 100, 100),
        Channels: Math.min(genre.totalChannels * 10, 100)
      }))
    };
  };

  const generateTierComparison = (channels) => {
    if (!channels || channels.length === 0) {
      return {
        summary: [],
        performance: []
      };
    }

    const tierMap = { high: {}, mid: {}, low: {} };
    
    channels.forEach(channel => {
      const totalViews = channel.totalViews || channel.views || 0;
      let tier = 'low';
      if (totalViews >= 1000000) tier = 'high';
      else if (totalViews >= 100000) tier = 'mid';

      if (!tierMap[tier].name) {
        tierMap[tier] = {
          name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`,
          totalViews: 0,
          totalVideos: 0,
          totalChannels: 0,
          avgEngagement: 0,
          channels: []
        };
      }

      const engagement = channel.avgEngagement || channel.engagementRate || 0;
      const videos = channel.videos || 0;

      tierMap[tier].totalViews += totalViews;
      tierMap[tier].totalVideos += videos;
      tierMap[tier].totalChannels += 1;
      tierMap[tier].avgEngagement += engagement;
      tierMap[tier].channels.push(channel.name);
    });

    // Calculate averages
    Object.values(tierMap).forEach(tier => {
      if (tier.totalChannels > 0) {
        tier.avgEngagement = tier.avgEngagement / tier.totalChannels;
        tier.avgViewsPerChannel = tier.totalViews / tier.totalChannels;
        tier.avgVideosPerChannel = tier.totalVideos / tier.totalChannels;
      }
    });

    return {
      summary: Object.values(tierMap).filter(tier => tier.totalChannels > 0),
      performance: Object.values(tierMap).filter(tier => tier.totalChannels > 0).map(tier => ({
        tier: tier.name,
        avgViews: tier.avgViewsPerChannel || 0,
        avgVideos: tier.avgVideosPerChannel || 0,
        avgEngagement: tier.avgEngagement || 0,
        channels: tier.totalChannels
      }))
    };
  };

  const generateChannelComparison = (channels) => {
    if (!channels || channels.length === 0) {
      return {
        topPerformers: [],
        comparison: []
      };
    }

    const topChannels = channels
      .sort((a, b) => {
        const aViews = a.totalViews || a.views || 0;
        const bViews = b.totalViews || b.views || 0;
        return bViews - aViews;
      })
      .slice(0, 10)
      .map(channel => ({
        name: channel.name && channel.name.length > 15 ? channel.name.substring(0, 15) + '...' : (channel.name || 'Unknown'),
        fullName: channel.name || 'Unknown',
        totalViews: channel.totalViews || channel.views || 0,
        totalVideos: channel.videos || 0,
        avgEngagement: channel.avgEngagement || channel.engagementRate || 0,
        tier: getTierForChannel(channel),
        genre: channel.genre || 'Unknown'
      }));

    return {
      topPerformers: topChannels,
      comparison: topChannels.map(channel => ({
        Channel: channel.name,
        Views: Math.log10(Math.max(channel.totalViews, 1)),
        Videos: Math.max(channel.totalVideos / 10, 0.1),
        Engagement: Math.min(channel.avgEngagement * 100, 100)
      }))
    };
  };

  const getTierForChannel = (channel) => {
    const totalViews = channel.totalViews || channel.views || 0;
    if (totalViews >= 1000000) return 'high';
    if (totalViews >= 100000) return 'mid';
    return 'low';
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const exportComparison = () => {
    if (!comparisonData) return;
    
    const exportData = {
      type: comparisonType,
      timestamp: new Date().toISOString(),
      data: comparisonData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-comparison-${comparisonType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const comparisonTypes = [
    { id: 'genres', label: 'Genre Comparison', icon: Layers },
    { id: 'tiers', label: 'Tier Analysis', icon: Target },
    { id: 'channels', label: 'Top Channels', icon: Award }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Comparison Analytics
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Side-by-side analysis across genres, tiers, and channels
        </p>
      </div>

      {/* Comparison Type Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {comparisonTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setComparisonType(id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              comparisonType === id
                ? 'bg-blue-600 text-white shadow-lg'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportComparison}
          disabled={!comparisonData}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            comparisonData
              ? darkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Comparison Content */}
      {comparisonType === 'genres' && comparisonData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonData.summary.map((genre, index) => (
              <div key={index} className={`${darkMode ? 'card-dark' : 'card'} hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{genre.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    index % 3 === 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    index % 3 === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {genre.totalChannels} channels
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Views</span>
                    <span className="font-medium">{formatNumber(genre.totalViews)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Videos</span>
                    <span className="font-medium">{formatNumber(genre.totalVideos)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Engagement</span>
                    <span className="font-medium">{genre.avgEngagement.toFixed(2)}%</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Top Channel: </span>
                    <span className="text-xs font-medium">{genre.topChannel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className={`${darkMode ? 'card-dark' : 'card'} h-96`}>
            <h3 className="text-xl font-semibold mb-4">Multi-Dimensional Comparison</h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={comparisonData.radar}>
                <PolarGrid stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <PolarAngleAxis dataKey="genre" tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }} />
                <Radar name="Views" dataKey="Views" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Radar name="Engagement" dataKey="Engagement" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Radar name="Videos" dataKey="Videos" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {comparisonType === 'tiers' && comparisonData && (
        <div className="space-y-6">
          {/* Tier Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonData.summary.map((tier, index) => (
              <div key={index} className={`${darkMode ? 'card-dark' : 'card'}`}>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    tier.name.includes('High') ? 'bg-green-100 dark:bg-green-900' :
                    tier.name.includes('Mid') ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Target className={`w-6 h-6 ${
                      tier.name.includes('High') ? 'text-green-600 dark:text-green-400' :
                      tier.name.includes('Mid') ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-1">{tier.totalChannels}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Channels</p>
                  
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Views/Channel:</span>
                      <span className="font-medium">{formatNumber(tier.avgViewsPerChannel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Videos/Channel:</span>
                      <span className="font-medium">{tier.avgVideosPerChannel.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Engagement:</span>
                      <span className="font-medium">{tier.avgEngagement.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Comparison Chart */}
          <div className={`${darkMode ? 'card-dark' : 'card'} h-96`}>
            <h3 className="text-xl font-semibold mb-4">Tier Performance Comparison</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData.performance}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="tier" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="avgViews" fill="#3B82F6" name="Avg Views" />
                <Bar dataKey="avgVideos" fill="#10B981" name="Avg Videos" />
                <Bar dataKey="avgEngagement" fill="#F59E0B" name="Avg Engagement" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {comparisonType === 'channels' && comparisonData && (
        <div className="space-y-6">
          {/* Top Performers List */}
          <div className={`${darkMode ? 'card-dark' : 'card'}`}>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-500" />
              Top 10 Performing Channels
            </h3>
            
            <div className="space-y-3">
              {comparisonData.topPerformers.map((channel, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium" title={channel.fullName}>{channel.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {channel.genre} • {channel.tier.toUpperCase()} Tier
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>{formatNumber(channel.totalViews)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-green-500" />
                        <span>{channel.totalVideos}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{channel.avgEngagement.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Radar */}
          <div className={`${darkMode ? 'card-dark' : 'card'} h-96`}>
            <h3 className="text-xl font-semibold mb-4">Channel Performance Radar</h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={comparisonData.comparison.slice(0, 5)}>
                <PolarGrid stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <PolarAngleAxis dataKey="Channel" tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280', fontSize: 8 }} />
                <Radar name="Views (log scale)" dataKey="Views" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Radar name="Videos (/10)" dataKey="Videos" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Radar name="Engagement (%)" dataKey="Engagement" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonAnalytics;