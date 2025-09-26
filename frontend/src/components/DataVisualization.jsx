import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity, Filter, Layers, Target } from 'lucide-react';
import FilterControls from './FilterControls';

const DataVisualization = ({ data, loading, darkMode }) => {
  const [activeChart, setActiveChart] = useState('engagement');
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [engagementViewMode, setEngagementViewMode] = useState('raw'); // 'raw' or 'per_subscriber'
  const [engagementMetricFilter, setEngagementMetricFilter] = useState('all'); // 'all', 'views', 'likes', 'comments', 'rqs'
  const [activeFilters, setActiveFilters] = useState({
    genre: 'all',
    tier: 'all',
    globalTier: 'all',
    genreTier: 'all',
    sortBy: 'name'
  });

  // Initialize filteredData when data changes
  useEffect(() => {
    if (data && data.engagement) {
      setOriginalData(data);
      setFilteredData(data);
      processChartData(data);
    }
  }, [data]);

  // Reprocess chart data when filteredData changes
  useEffect(() => {
    if (filteredData && filteredData.engagement) {
      console.log('📊 Chart data updated for', filteredData.engagement.length, 'channels');
      processChartData(filteredData);
    }
  }, [filteredData]);

  // Handle filter changes
  const handleFilterChange = (filters) => {
    console.log('🔍 Filter change:', filters);
    setActiveFilters(filters);
    
    // Use the original loaded data for filtering
    if (!originalData || !originalData.engagement) {
      console.warn('⚠️ No original data available for filtering');
      return;
    }
    
    console.log('📊 Original data channels:', originalData.engagement.length);
    let filteredChannels = [...originalData.engagement];
    
    // Apply genre filter using the consistent getChannelGenre function
    if (filters.genre !== 'all') {
      const beforeFilter = filteredChannels.length;
      console.log(`🔍 Applying genre filter "${filters.genre}" to ${beforeFilter} channels`);
      
        // Map filter values to our exact genre categories
        const filterGenre = filters.genre.toLowerCase();
        let targetGenre = '';
        if (filterGenre === 'education') {
          targetGenre = 'Education';
        } else if (filterGenre === 'gaming') {
          targetGenre = 'Gaming';
        } else if (filterGenre === 'entertainment') {
          targetGenre = 'Gaming';  // Keep this for backwards compatibility with quick action buttons
        } else if (filterGenre === 'kids') {
          targetGenre = 'Kids/Family';
        } else if (filterGenre === 'catholic') {
          targetGenre = 'Catholic';
        } else if (filterGenre === 'challenge') {
          targetGenre = 'Challenge/Stunts';
        } else {
          // For exact matches, capitalize first letter
          targetGenre = filterGenre.charAt(0).toUpperCase() + filterGenre.slice(1);
        }      console.log(`🎯 Looking for channels with genre "${targetGenre}"`);
      
      filteredChannels = filteredChannels.filter(channel => {
        const channelGenre = getChannelGenre(channel.name);
        const matches = channelGenre === targetGenre;
        
        console.log(`📋 Channel "${channel.name}" -> Genre: "${channelGenre}" (${matches ? 'MATCH' : 'no match'})`);
        
        return matches;
      });
      console.log(`🎯 Genre filter "${filters.genre}": ${beforeFilter} -> ${filteredChannels.length} channels`);
    }
    
    // Apply tier filter based on total views
    if (filters.tier !== 'all') {
      const beforeFilter = filteredChannels.length;
      filteredChannels = filteredChannels.filter(channel => {
        const tier = getTierForChannel(channel);
        const matches = tier === filters.tier;
        if (matches) {
          console.log(`✅ Channel "${channel.name}" matches tier "${filters.tier}" (${channel.views} views)`);
        }
        return matches;
      });
      console.log(`📈 Tier filter "${filters.tier}": ${beforeFilter} -> ${filteredChannels.length} channels`);
    }
    
    // Apply global subscriber tier filter (placeholder - would need subscriber data)
    if (filters.globalTier !== 'all') {
      // For now, just map based on view counts as a proxy
      filteredChannels = filteredChannels.filter(channel => {
        const views = channel.views || 0;
        let globalTier = '';
        
        if (views >= 500000000) globalTier = 'Mega';
        else if (views >= 50000000) globalTier = 'Large';
        else if (views >= 5000000) globalTier = 'Mid';
        else if (views >= 500000) globalTier = 'Small';
        else globalTier = 'New';
        
        return globalTier === filters.globalTier;
      });
    }
    
    // Apply genre tier filter (placeholder)
    if (filters.genreTier !== 'all') {
      // This would require genre-specific ranking data
      // For now, just apply a basic filter
      filteredChannels = filteredChannels.filter(channel => {
        const views = channel.views || 0;
        let genreTier = '';
        
        if (views >= 100000000) genreTier = 'Large';
        else if (views >= 10000000) genreTier = 'Mid';
        else if (views >= 1000000) genreTier = 'Small';
        else genreTier = 'New';
        
        return genreTier === filters.genreTier;
      });
    }
    
    // Apply sorting
    if (filters.sortBy !== 'name') {
      filteredChannels.sort((a, b) => {
        switch (filters.sortBy) {
          case 'views':
            return (b.views || 0) - (a.views || 0);
          case 'videos':
            return (b.videos || 0) - (a.videos || 0);
          case 'engagement':
            const aEngagement = ((a.likes || 0) + (a.comments || 0)) / (a.views || 1);
            const bEngagement = ((b.likes || 0) + (b.comments || 0)) / (b.views || 1);
            return bEngagement - aEngagement;
          default:
            return a.name.localeCompare(b.name);
        }
      });
      console.log(`🔤 Sorted by "${filters.sortBy}"`);
    }
    
    // Create filtered data object
    const filtered = {
      ...data,
      engagement: filteredChannels,
      channels: filteredChannels // For consistency with other parts of the code
    };
    
    console.log(`✨ Final filtered data: ${filteredChannels.length} channels`);
    setFilteredData(filtered);
    // Update chart data based on filtered data
    processChartData(filtered);
  };

  // Helper function to determine tier for a channel
  const getTierForChannel = (channel) => {
    const totalViews = channel.views || 0;
    if (totalViews >= 10000000) return 'high'; // 10M+ views
    if (totalViews >= 1000000) return 'mid';   // 1M-10M views
    return 'low';                              // <1M views
  };

  // Process chart data based on filtered data
  const processChartData = (currentData) => {
    if (!currentData || !currentData.engagement) return;
    
    const channels = currentData.engagement;
    
    // Generate chart data from filtered channels
    const processedData = {
      engagement: channels.map(channel => ({
        name: channel.name.substring(0, 15) + (channel.name.length > 15 ? '...' : ''),
        views: channel.views || 0,
        likes: channel.likes || 0,
        comments: channel.comments || 0
      })),
      genreComparison: generateGenreComparisonData(channels),
      tierAnalysis: generateTierAnalysisData(channels),
      performanceMetrics: generatePerformanceMetricsData(channels),
      engagementTrends: generateEngagementTrendsData(channels)
    };
    
    setChartData(processedData);
  };

  const generateGenreComparisonData = (channels) => {
    const genreMap = {};
    
    channels.forEach(channel => {
      // Infer genre from channel name (this should ideally come from API)
      const channelName = channel.name.toLowerCase();
      let genre = 'Other';
      
      // More comprehensive genre mapping
      if (channelName.includes('mrbeast')) {
        genre = 'Challenge/Stunts';
      } else if (channelName.includes('scishow') || channelName.includes('kurzgesagt') || channelName.includes('up and atom') || channelName.includes('ed pratt')) {
        genre = 'Education';
      } else if (channelName.includes('cocomelon') || channelName.includes('miss honey bear') || channelName.includes('veggietales')) {
        genre = 'Kids/Family';
      } else if (channelName.includes('lizz')) {
        genre = 'Gaming';
      } else if (channelName.includes('catholic') || channelName.includes('bishop') || channelName.includes('father') || channelName.includes('cameron')) {
        genre = 'Catholic';
      }
      
      if (!genreMap[genre]) {
        genreMap[genre] = {
          genre,
          totalViews: 0,
          totalVideos: 0,
          avgEngagement: 0,
          channelCount: 0
        };
      }
      
      const engagement = ((channel.likes || 0) + (channel.comments || 0)) / (channel.views || 1) * 100;
      
      genreMap[genre].totalViews += channel.views || 0;
      genreMap[genre].totalVideos += channel.videos || 0;
      genreMap[genre].avgEngagement += engagement;
      genreMap[genre].channelCount += 1;
    });
    
    return Object.values(genreMap).map(genre => ({
      ...genre,
      avgEngagement: Math.round((genre.avgEngagement / genre.channelCount) * 100) / 100
    }));
  };

  const generateTierAnalysisData = (channels) => {
    const tierMap = { high: 0, mid: 0, low: 0 };
    
    channels.forEach(channel => {
      const tier = getTierForChannel(channel);
      tierMap[tier]++;
    });
    
    console.log('📊 Tier distribution:', tierMap);
    
    return [
      { name: 'High Tier (10M+)', value: tierMap.high, color: '#10B981' },
      { name: 'Mid Tier (1M-10M)', value: tierMap.mid, color: '#F59E0B' },
      { name: 'Low Tier (<1M)', value: tierMap.low, color: '#6B7280' }
    ].filter(tier => tier.value > 0); // Only show tiers with actual channels
  };

  const generatePerformanceMetricsData = (channels) => {
    return channels.map(channel => ({
      name: channel.name.substring(0, 15) + (channel.name.length > 15 ? '...' : ''),
      views: channel.views || 0,
      videos: channel.videos || 0,
      engagement: Math.round(((channel.likes || 0) + (channel.comments || 0)) / (channel.views || 1) * 10000) / 100, // Engagement rate as percentage
      tier: getTierForChannel(channel)
    }));
  };

  const generateEngagementTrendsData = (channels) => {
    return channels.map((channel, index) => ({
      index: index + 1,
      engagement: Math.round(((channel.likes || 0) + (channel.comments || 0)) / (channel.views || 1) * 10000) / 100,
      views: Math.round((channel.views || 0) / 1000000 * 100) / 100, // Convert to millions with 2 decimals
      name: channel.name
    }));
  };

  useEffect(() => {
    loadVisualizationData();
  }, []); // Run once on mount

  // Update chart data when engagement view mode changes
  useEffect(() => {
    if (filteredData && activeChart === 'engagement') {
      processChartData(filteredData);
    }
  }, [engagementViewMode, engagementMetricFilter, activeChart, filteredData]);

  const loadVisualizationData = async () => {
    try {
      setChartLoading(true);
      // Use Vite proxy instead of direct localhost call
      const response = await fetch('/api/visualization');
      if (response.ok) {
        const vizData = await response.json();
        console.log('✅ Visualization data loaded:', vizData);
        
        // Process the data immediately when loaded
        if (vizData && vizData.engagement) {
          setOriginalData(vizData);
          setFilteredData(vizData);
          processChartData(vizData);
        } else {
          console.warn('⚠️ No engagement data in API response');
          setChartData(mockChartData);
        }
      } else {
        console.warn('⚠️ API failed, using fallback data');
        setChartData(mockChartData);
      }
    } catch (error) {
      console.error('❌ Error loading visualization data:', error);
      setChartData(mockChartData);
    } finally {
      setChartLoading(false);
    }
  };

  if (loading || chartLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading visualization data...
        </p>
      </div>
    );
  }

  if (chartLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900 border-blue-600' : 'bg-blue-100 border-blue-400'} border`}>
          <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            Loading visualization data...
          </p>
        </div>
      </div>
    );
  }

  if (!filteredData || !filteredData.engagement) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-100 border-yellow-400'} border`}>
          <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
            No data available for visualization. Please check your API connection.
          </p>
        </div>
      </div>
    );
  }

  // Mock visualization data - replace with real data processing
  const mockChartData = {
    engagement: [
      { name: 'MrBeast', views: 15000000, likes: 850000, comments: 125000 },
      { name: 'VeggieTales', views: 2500000, likes: 65000, comments: 8500 },
      { name: 'SciShow', views: 1800000, likes: 75000, comments: 12000 },
      { name: 'Kurzgesagt', views: 8500000, likes: 650000, comments: 85000 },
      { name: 'Cocomelon', views: 25000000, likes: 450000, comments: 35000 },
    ],
    genres: [
      { name: 'Challenge/Stunts', value: 30, videos: 120 },
      { name: 'Education', value: 25, videos: 100 },
      { name: 'Kids/Family', value: 20, videos: 80 },
      { name: 'Gaming', value: 15, videos: 60 },
      { name: 'Catholic', value: 10, videos: 40 },
    ],
    performance: [
      { timeframe: 'Week 1', avgViews: 1200000, avgLikes: 45000 },
      { timeframe: 'Week 2', avgViews: 1450000, avgLikes: 52000 },
      { timeframe: 'Week 3', avgViews: 1800000, avgLikes: 68000 },
      { timeframe: 'Week 4', avgViews: 2200000, avgLikes: 85000 },
    ],
    correlation: [
      { views: 1000000, likes: 45000, comments: 5500 },
      { views: 2500000, likes: 85000, comments: 12000 },
      { views: 5000000, likes: 180000, comments: 25000 },
      { views: 8500000, likes: 320000, comments: 45000 },
      { views: 15000000, likes: 650000, comments: 95000 },
    ]
  };

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  const ChartSelector = ({ charts }) => (
    <div className="space-y-3">
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Choose Visualization Type
      </h3>
      <div className="flex flex-wrap gap-3">
        {charts.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveChart(id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 border ${
              activeChart === id
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 hover:border-gray-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {activeChart === id && (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const charts = [
    { id: 'engagement', label: 'Channel Engagement', icon: BarChart3 },
    { id: 'genres', label: 'Genre Comparison', icon: PieIcon },
    { id: 'tiers', label: 'Tier Analysis', icon: Target },
    { id: 'performance', label: 'Performance Metrics', icon: TrendingUp },
    { id: 'correlation', label: 'Views vs Engagement', icon: Activity },
  ];

  // Helper function to determine channel genre based on exact channel configuration
  const getChannelGenre = (channelName) => {
    // Exact mapping based on your actual channel configuration
    const genreMap = {
      // Challenge/Stunts
      'MrBeast': 'Challenge/Stunts',
      'Zach King': 'Challenge/Stunts', 
      'Ryan Trahan': 'Challenge/Stunts',
      'Hangtime': 'Challenge/Stunts',
      'Ed Pratt': 'Challenge/Stunts',
      
      // Catholic
      'Ascension Presents': 'Catholic',
      'Bishop Robert Barron': 'Catholic',
      'The Catholic Talk Show': 'Catholic', 
      'The Father Leo Show': 'Catholic',
      'Cameron Riecker': 'Catholic',
      
      // Education/Science
      'Kurzgesagt': 'Education',
      'Veritasium': 'Education',
      'SciShow': 'Education',
      'Fun Science': 'Education',
      'Up and Atom': 'Education',
      
      // Gaming
      'PewdiePie': 'Gaming',
      'Jacksepticeye': 'Gaming',
      'Call Me Kevin': 'Gaming',
      'Floydson': 'Gaming', 
      'Lizz': 'Gaming',
      
      // Kids/Family
      'Cocomelon': 'Kids/Family',
      'Kids Roma Show': 'Kids/Family',
      'Sheriff Labrador - Kids Cartoon': 'Kids/Family',
      'VeggieTales Official': 'Kids/Family',
      'Miss Honey Bear - Speech Therapist - Read Aloud': 'Kids/Family'
    };
    
    const mappedGenre = genreMap[channelName] || 'Other';
    if (mappedGenre === 'Other') {
      console.log(`⚠️ Channel "${channelName}" not found in genre mapping - assigned to "Other"`);
    }
    
    return mappedGenre;
  };

  // Process filtered data for different chart types
  const getChartData = (type) => {
    if (!filteredData?.engagement) return null;

    switch (type) {
      case 'engagement':
        let processedData;
        if (engagementViewMode === 'raw') {
          processedData = filteredData.engagement.map(channel => ({
            ...channel,
            // Calculate average RQS from video details if available
            rqs: channel.videoDetails && channel.videoDetails.length > 0 
              ? channel.videoDetails.reduce((sum, video) => sum + (video.rqs || 75), 0) / channel.videoDetails.length
              : 75
          }));
        } else {
          // Per-subscriber percentage view
          processedData = filteredData.engagement.map(channel => {
            const subscribers = channel.subscribers || 1; // Avoid division by zero
            const genre = getChannelGenre(channel.name);
            const isKidsFamily = genre === 'Kids/Family';
            
            return {
              ...channel,
              // Convert to per-subscriber ratios (views per subscriber, likes per subscriber, etc.)
              views: (channel.views || 0) / subscribers,
              likes: (channel.likes || 0) / subscribers,
              // Set comments to 0 for Kids/Family channels or calculate per subscriber
              comments: isKidsFamily ? 0 : (channel.comments || 0) / subscribers,
              // RQS doesn't need per-subscriber conversion since it's already a quality score
              rqs: channel.videoDetails && channel.videoDetails.length > 0 
                ? channel.videoDetails.reduce((sum, video) => sum + (video.rqs || 75), 0) / channel.videoDetails.length
                : 75,
              // Add a flag to identify this as per-subscriber data
              isPerSubscriberData: true
            };
          });
        }
        return processedData;
      
      case 'genres':
        // Dynamically calculate genre data from filtered channels
        const genreStats = {};
        filteredData.engagement.forEach(channel => {
          const genre = getChannelGenre(channel.name);
          if (!genreStats[genre]) {
            genreStats[genre] = { totalViews: 0, totalVideos: 0, totalLikes: 0, channels: 0 };
          }
          genreStats[genre].totalViews += channel.views || 0;
          genreStats[genre].totalVideos += channel.videos || 0;
          genreStats[genre].totalLikes += channel.likes || 0;
          genreStats[genre].channels += 1;
        });
        
        return Object.entries(genreStats).map(([genre, stats]) => ({
          genre,
          totalViews: stats.totalViews,
          totalVideos: stats.totalVideos,
          avgEngagement: stats.totalViews > 0 ? ((stats.totalLikes / stats.totalViews) * 100).toFixed(2) : 0,
          channels: stats.channels
        }));
      
      case 'performance':
        // Performance metrics based on filtered data
        return filteredData.engagement.map(channel => ({
          name: channel.name,
          views: channel.views || 0,
          videos: channel.videos || 40,
          engagement: channel.views > 0 ? (((channel.likes || 0) / channel.views) * 100).toFixed(2) : 0
        }));
      
      case 'correlation':
        // Correlation data from filtered channels
        return filteredData.engagement.map(channel => ({
          views: (channel.views || 0) / 1000000, // Convert to millions
          engagement: channel.views > 0 ? (((channel.likes || 0) + (channel.comments || 0)) / channel.views) * 100 : 0,
          name: channel.name
        }));
      
      default:
        return null;
    }
  };

  const renderChart = () => {
    const chartProps = {
      width: '100%',
      height: 500,
    };

    switch (activeChart) {
      case 'engagement':
        const engagementData = getChartData('engagement') || mockChartData.engagement;
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart 
              data={engagementData}
              margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="name" 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
                fontSize={12}
                tickFormatter={(value) => {
                  const isPerSubscriberData = engagementData && engagementData[0]?.isPerSubscriberData;
                  
                  // Special handling for RQS metric
                  if (engagementMetricFilter === 'rqs') {
                    return value.toFixed(0);
                  }
                  
                  if (isPerSubscriberData) {
                    // For per-subscriber data, show decimal values
                    if (value >= 1) return value.toFixed(1);
                    if (value >= 0.1) return value.toFixed(2);
                    return value.toFixed(3);
                  }
                  // For raw values, format large numbers
                  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value.toString();
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isKidsChannel = ['Cocomelon', 'Kids Roma Show', 'VeggieTales Official', 'Sheriff Labrador - Kids Cartoon', 'Miss Honey Bear - Speech Therapist - Read Aloud'].includes(label);
                    const isPerSubscriberData = data.isPerSubscriberData;
                    
                    return (
                      <div className={`p-3 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <p className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                        <div className="space-y-1">
                          {(engagementMetricFilter === 'all' || engagementMetricFilter === 'views') && (
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Views: {isPerSubscriberData 
                                  ? `${data.views.toFixed(2)} per subscriber`
                                  : `${(data.views / 1000000).toFixed(1)}M`
                                }
                              </span>
                            </div>
                          )}
                          {(engagementMetricFilter === 'all' || engagementMetricFilter === 'likes') && (
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Likes: {isPerSubscriberData 
                                  ? `${data.likes.toFixed(3)} per subscriber`
                                  : data.likes.toLocaleString()
                                }
                              </span>
                            </div>
                          )}
                          {(engagementMetricFilter === 'all' || engagementMetricFilter === 'comments') && (
                            (data.comments > 0 ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                  Comments: {isPerSubscriberData 
                                    ? `${data.comments.toFixed(4)} per subscriber`
                                    : data.comments.toLocaleString()
                                  }
                                </span>
                              </div>
                            ) : isKidsChannel ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                                <span className={`text-xs italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Comments disabled (Kids content)
                                </span>
                              </div>
                            ) : null)
                          )}
                          {(engagementMetricFilter === 'all' || engagementMetricFilter === 'rqs') && (
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-purple-500 rounded"></div>
                              <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                RQS: {data.rqs ? data.rqs.toFixed(1) : '75.0'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(engagementMetricFilter === 'all' || engagementMetricFilter === 'views') && (
                <Bar dataKey="views" fill="#3B82F6" name="Views" />
              )}
              {(engagementMetricFilter === 'all' || engagementMetricFilter === 'likes') && (
                <Bar dataKey="likes" fill="#10B981" name="Likes" />
              )}
              {(engagementMetricFilter === 'all' || engagementMetricFilter === 'comments') && (
                <Bar dataKey="comments" fill="#F59E0B" name="Comments" />
              )}
              {(engagementMetricFilter === 'all' || engagementMetricFilter === 'rqs') && (
                <Bar dataKey="rqs" fill="#8B5CF6" name="RQS" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'genres':
        const genreData = getChartData('genres') || mockChartData.genres;
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart 
              data={genreData}
              margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="genre" 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  name === 'totalViews' ? `${(value / 1000000).toFixed(1)}M` : value,
                  name === 'totalViews' ? 'Total Views' : name === 'totalVideos' ? 'Total Videos' : 'Avg Engagement %'
                ]}
              />
              <Bar dataKey="totalViews" fill="#3B82F6" name="Total Views" />
              <Bar dataKey="totalVideos" fill="#10B981" name="Total Videos" />
              <Bar dataKey="avgEngagement" fill="#F59E0B" name="Avg Engagement" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'tiers':
        const tierData = chartData?.tierAnalysis || [
          { name: 'High Tier (10M+)', value: 8, color: '#10B981' },
          { name: 'Mid Tier (1M-10M)', value: 12, color: '#F59E0B' },
          { name: 'Low Tier (<1M)', value: 5, color: '#6B7280' }
        ];
        return (
          <ResponsiveContainer {...chartProps}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={tierData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {tierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} channels`, name]} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'performance':
        const performanceData = getChartData('performance') || mockChartData.performance;
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart 
              data={performanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="name" 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  name === 'views' ? `${(value / 1000000).toFixed(1)}M` : 
                  name === 'engagement' ? `${value}%` : value,
                  name === 'views' ? 'Total Views' : 
                  name === 'videos' ? 'Video Count' : 'Engagement Rate'
                ]}
              />
              <Bar dataKey="views" fill="#3B82F6" name="Total Views" />
              <Bar dataKey="videos" fill="#10B981" name="Video Count" />
              <Bar dataKey="engagement" fill="#F59E0B" name="Engagement Rate" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'correlation':
        const correlationData = getChartData('correlation') || mockChartData.correlation;
        return (
          <ResponsiveContainer {...chartProps}>
            <ScatterChart 
              data={correlationData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                type="number"
                dataKey="views" 
                name="Views (M)"
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis 
                type="number"
                dataKey="engagement" 
                name="Engagement Rate (%)"
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name, props) => [
                  `${value}${name === 'Views (M)' ? 'M' : '%'}`,
                  name,
                  props.payload.name
                ]}
              />
              <Scatter fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Data Visualization
        </h1>
        <div className="flex items-center justify-center space-x-4">
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Interactive charts and insights from your YouTube dataset
          </p>
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className={`text-xs px-2 py-1 rounded border ${
              darkMode 
                ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Debug
          </button>
        </div>
      </div>

      {/* Debug Info Panel */}
      {showDebugInfo && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Debug Information</h4>
            <button
              onClick={() => setShowDebugInfo(false)}
              className={`text-sm px-2 py-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              Hide
            </button>
          </div>
          <div className="space-y-2 text-sm font-mono">
            <div>Total Data: {data?.engagement?.length || 0} channels</div>
            <div>Filtered Data: {filteredData?.engagement?.length || 0} channels</div>
            <div>Active Filters: {JSON.stringify(activeFilters, null, 2)}</div>
            <div>Chart Data Keys: {chartData ? Object.keys(chartData).join(', ') : 'None'}</div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <FilterControls
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        darkMode={darkMode}
        totalChannels={originalData?.engagement?.length || 0}
        filteredChannels={filteredData?.engagement?.length || 0}
      />      {/* Quick Actions */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleFilterChange({
            genre: 'all',
            tier: 'all',
            globalTier: 'all',
            genreTier: 'all',
            sortBy: 'name'
          })}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          🔄 Reset All Filters
        </button>
        <button
          onClick={() => handleFilterChange({...activeFilters, genre: 'education', sortBy: 'views'})}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilters.genre === 'education'
              ? 'bg-blue-600 text-white'
              : darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          🎓 Education Channels
        </button>
        <button
          onClick={() => handleFilterChange({...activeFilters, genre: 'entertainment', sortBy: 'views'})}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilters.genre === 'entertainment'
              ? 'bg-purple-600 text-white'
              : darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          🎮 Gaming & Fun
        </button>
        <button
          onClick={() => handleFilterChange({...activeFilters, tier: 'high', sortBy: 'views'})}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilters.tier === 'high'
              ? 'bg-red-600 text-white'
              : darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          🔥 Top Performers
        </button>
        <button
          onClick={() => handleFilterChange({...activeFilters, genre: 'catholic', sortBy: 'views'})}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilters.genre === 'catholic'
              ? 'bg-indigo-600 text-white'
              : darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          ✝️ Catholic Content
        </button>
        <button
          onClick={() => handleFilterChange({...activeFilters, genre: 'challenge', sortBy: 'views'})}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilters.genre === 'challenge'
              ? 'bg-orange-600 text-white'
              : darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          🎯 Challenge/Stunts
        </button>
        <button
          onClick={() => handleFilterChange({...activeFilters, genre: 'kids', sortBy: 'views'})}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilters.genre === 'kids'
              ? 'bg-green-600 text-white'
              : darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          👶 Kids Content
        </button>
      </div>

      {/* Chart Selector */}
      <ChartSelector charts={charts} />

      {/* Engagement View Toggle - Only show when engagement chart is active */}
      {activeChart === 'engagement' && (
        <div className="flex flex-col items-center gap-4 mb-4">
          {/* Raw vs Per Subscriber Toggle */}
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setEngagementViewMode('raw')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                engagementViewMode === 'raw'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              📊 Raw Values
            </button>
            <button
              onClick={() => setEngagementViewMode('per_subscriber')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                engagementViewMode === 'per_subscriber'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              📈 Per Subscriber
            </button>
          </div>

          {/* Metrics Filter Toggle */}
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setEngagementMetricFilter('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                engagementMetricFilter === 'all'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              🔍 All
            </button>
            <button
              onClick={() => setEngagementMetricFilter('views')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                engagementMetricFilter === 'views'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              👁️ Views
            </button>
            <button
              onClick={() => setEngagementMetricFilter('likes')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                engagementMetricFilter === 'likes'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              👍 Likes
            </button>
            <button
              onClick={() => setEngagementMetricFilter('comments')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                engagementMetricFilter === 'comments'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              💬 Comments
            </button>
            <button
              onClick={() => setEngagementMetricFilter('rqs')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                engagementMetricFilter === 'rqs'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              ⭐ RQS
            </button>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className={`${darkMode ? 'card-dark' : 'card'} h-[600px] relative overflow-hidden`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {charts.find(c => c.id === activeChart)?.label}
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
          }`}>
            {filteredData?.engagement?.length || 0} channels
          </div>
        </div>
        <div className="relative h-full">
          {chartLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderChart()
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'card-dark' : 'card'}`}>
          <h4 className="font-semibold mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Filtered Results
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing {filteredData?.engagement?.length || 0} of {originalData?.engagement?.length || 0} channels based on your filter selection
          </p>
        </div>

        <div className={`${darkMode ? 'card-dark' : 'card'}`}>
          <h4 className="font-semibold mb-2 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Chart Data
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Charts update automatically when you change filters. Try selecting different genres or view tiers!
          </p>
        </div>

        <div className={`${darkMode ? 'card-dark' : 'card'}`}>
          <h4 className="font-semibold mb-2 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-purple-500" />
            Current View
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Currently viewing: <span className="font-medium">{charts.find(c => c.id === activeChart)?.label}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
