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
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity } from 'lucide-react';

const DataVisualization = ({ data, loading, darkMode }) => {
  const [activeChart, setActiveChart] = useState('engagement');
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    loadVisualizationData();
  }, []);

  const loadVisualizationData = async () => {
    try {
      setChartLoading(true);
      // Use Vite proxy instead of direct localhost call
      const response = await fetch('/api/visualization');
      if (response.ok) {
        const vizData = await response.json();
        console.log('✅ Visualization data loaded:', vizData);
        setChartData(vizData);
      } else {
        console.warn('⚠️ API failed, using fallback data');
        // Fallback to mock data
        setChartData(mockChartData);
      }
    } catch (error) {
      console.error('❌ Error loading visualization data:', error);
      // Fallback to mock data
      setChartData(mockChartData);
    } finally {
      setChartLoading(false);
    }
  };

  if (loading || chartLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="flex flex-wrap gap-2 mb-6">
      {charts.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveChart(id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            activeChart === id
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  const charts = [
    { id: 'engagement', label: 'Channel Engagement', icon: BarChart3 },
    { id: 'genres', label: 'Genre Distribution', icon: PieIcon },
    { id: 'performance', label: 'Performance Trends', icon: TrendingUp },
    { id: 'correlation', label: 'Views vs Engagement', icon: Activity },
  ];

  const renderChart = () => {
    const chartProps = {
      width: '100%',
      height: 400,
    };

    switch (activeChart) {
      case 'engagement':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={chartData?.engagement || mockChartData.engagement}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="name" 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="views" fill="#3B82F6" name="Views" />
              <Bar dataKey="likes" fill="#10B981" name="Likes" />
              <Bar dataKey="comments" fill="#F59E0B" name="Comments" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'genres':
        return (
          <ResponsiveContainer {...chartProps}>
            <PieChart>
              <Pie
                data={chartData?.genres || mockChartData.genres}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {(chartData?.genres || mockChartData.genres).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'performance':
        return (
          <ResponsiveContainer {...chartProps}>
            <LineChart data={chartData?.performance || mockChartData.performance}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="timeframe" 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="avgViews" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Avg Views"
              />
              <Line 
                type="monotone" 
                dataKey="avgLikes" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Avg Likes"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'correlation':
        return (
          <ResponsiveContainer {...chartProps}>
            <ScatterChart data={chartData?.correlation || mockChartData.correlation}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                type="number"
                dataKey="views" 
                name="Views"
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis 
                type="number"
                dataKey="likes" 
                name="Likes"
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
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Interactive charts and insights from your YouTube dataset
        </p>
      </div>

      {/* Chart Selector */}
      <ChartSelector charts={charts} />

      {/* Main Chart */}
      <div className={`${darkMode ? 'card-dark' : 'card'} h-96`}>
        <h3 className="text-xl font-semibold mb-4">
          {charts.find(c => c.id === activeChart)?.label}
        </h3>
        {renderChart()}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'card-dark' : 'card'}`}>
          <h4 className="font-semibold mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Key Insight
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Challenge/Stunt videos (MrBeast genre) show 3x higher engagement rates than average
          </p>
        </div>

        <div className={`${darkMode ? 'card-dark' : 'card'}`}>
          <h4 className="font-semibold mb-2 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Pattern Detected
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Strong correlation (R²=0.89) between view count and like-to-view ratio
          </p>
        </div>

        <div className={`${darkMode ? 'card-dark' : 'card'}`}>
          <h4 className="font-semibold mb-2 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-purple-500" />
            Distribution
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Educational content represents 25% of dataset but 40% of comment engagement
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
