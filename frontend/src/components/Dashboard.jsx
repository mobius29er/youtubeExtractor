import React from 'react';
import { 
  Play, 
  Users, 
  TrendingUp, 
  Database, 
  CheckCircle, 
  Clock,
  BarChart3,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';

const Dashboard = ({ data, loading, darkMode }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend = null }) => (
    <div className={`${darkMode ? 'card-dark' : 'card'} group hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-1">{value.toLocaleString()}</h3>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );

  const ChannelCard = ({ channel }) => (
    <div className={`${darkMode ? 'card-dark' : 'card'} hover:shadow-lg transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{channel.name}</h4>
        <span className={`metric-badge ${
          channel.status === 'complete' ? 'metric-badge-success' : 'metric-badge-warning'
        }`}>
          {channel.status}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Play className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{channel.videos} videos</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600">Extracted</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          YouTube Extractor Dashboard
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          ML-Ready Dataset Analysis & Insights
        </p>
        <div className="mt-4 flex items-center justify-center space-x-4">
          <span className="metric-badge-success">
            <CheckCircle className="w-4 h-4 mr-1" />
            Health Score: {data.healthScore}/100
          </span>
          <span className="metric-badge-info">
            <Clock className="w-4 h-4 mr-1" />
            Last Updated: {new Date(data.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Play}
          title="Total Videos"
          value={data.totalVideos}
          subtitle="Extracted & Verified"
          color="red"
          trend={12}
        />
        <StatCard
          icon={Users}
          title="Channels Analyzed"
          value={data.totalChannels}
          subtitle="Across 5 genres"
          color="blue"
        />
        <StatCard
          icon={Eye}
          title="Avg Views"
          value={data.stats.avgViews}
          subtitle="Per video"
          color="green"
          trend={8}
        />
        <StatCard
          icon={Heart}
          title="Avg Engagement"
          value={data.stats.avgLikes}
          subtitle="Likes per video"
          color="purple"
          trend={15}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          icon={MessageCircle}
          title="Comments"
          value={data.stats.avgComments}
          subtitle="Average per video"
          color="orange"
        />
        <StatCard
          icon={TrendingUp}
          title="Top Genre"
          value={data.stats.topPerformingGenre}
          subtitle="By engagement"
          color="indigo"
        />
        <StatCard
          icon={Database}
          title="Data Quality"
          value={`${data.healthScore}%`}
          subtitle="Verification passed"
          color="green"
        />
      </div>

      {/* Channel Status */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          Channel Extraction Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.channels.map((channel, index) => (
            <ChannelCard key={index} channel={channel} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${darkMode ? 'card-dark' : 'card'} text-center`}>
        <h3 className="text-xl font-bold mb-4">Ready to Analyze?</h3>
        <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your dataset is production-ready with {data.totalVideos} videos from {data.totalChannels} channels.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>View Data Visualization</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Export Dataset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
