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
  const [showDebugInfo, setShowDebugInfo] = useState(false);
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
      setFilteredData(data);
      processChartData(data);
    }
  }, [data]);

  // Handle filter changes
  const handleFilterChange = (filters) => {
    console.log('🔍 Filter change:', filters);
    setActiveFilters(filters);
    
    if (!data || !data.engagement) {
      console.warn('⚠️ No data available for filtering');
      return;
    }
    
    console.log('📊 Original data channels:', data.engagement.length);
    let filteredChannels = [...data.engagement];
    
    // Apply genre filter - check if channel data has genre information
    if (filters.genre !== 'all') {
      const beforeFilter = filteredChannels.length;
      filteredChannels = filteredChannels.filter(channel => {
        // Check if the channel has genre information
        const channelGenre = channel.genre?.toLowerCase();
        const filterGenre = filters.genre.toLowerCase();
        
        // For demonstration, map some channels to genres based on their names
        // In real implementation, this should come from the API data
        const channelName = channel.name.toLowerCase();
        let inferredGenre = '';
        
        // More comprehensive genre matching
        if (channelName.includes('mrbeast')) {
          inferredGenre = 'challenge/stunts';
        } else if (channelName.includes('scishow') || channelName.includes('kurzgesagt') || channelName.includes('up and atom') || channelName.includes('ed pratt')) {
          inferredGenre = 'education';
        } else if (channelName.includes('cocomelon') || channelName.includes('miss honey bear') || channelName.includes('veggietales')) {
          inferredGenre = 'kids/family';
        } else if (channelName.includes('lizz')) {
          inferredGenre = 'gaming';
        } else if (channelName.includes('catholic') || channelName.includes('bishop') || channelName.includes('father') || channelName.includes('cameron')) {
          inferredGenre = 'catholic';
        } else {
          inferredGenre = 'other';
        }
        
        const matches = channelGenre === filterGenre || inferredGenre === filterGenre;
        if (matches) {
          console.log(`✅ Channel "${channel.name}" matches genre "${filterGenre}" (inferred: ${inferredGenre})`);
        }
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

  const renderChart = () => {
    const chartProps = {
      width: '100%',
      height: 500,
    };

    switch (activeChart) {
      case 'engagement':
        const engagementData = chartData?.engagement || mockChartData.engagement;
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
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  name === 'views' ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString(),
                  name === 'views' ? 'Views' : name === 'likes' ? 'Likes' : 'Comments'
                ]}
              />
              <Bar dataKey="views" fill="#3B82F6" name="Views" />
              <Bar dataKey="likes" fill="#10B981" name="Likes" />
              <Bar dataKey="comments" fill="#F59E0B" name="Comments" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'genres':
        const genreData = chartData?.genreComparison || mockChartData.genres;
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
        const performanceData = chartData?.performanceMetrics || mockChartData.performance;
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
        const correlationData = chartData?.engagementTrends || mockChartData.correlation;
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
        totalChannels={data?.engagement?.length || 0}
        filteredChannels={filteredData?.engagement?.length || 0}
      />

      {/* Quick Actions */}
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
            Showing {filteredData?.engagement?.length || 0} of {data?.engagement?.length || 0} channels based on your filter selection
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
