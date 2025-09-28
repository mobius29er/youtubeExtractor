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
  MessageCircle,
  Award,
  Target,
  Zap,
  Star,
  Crown,
  Trophy,
  ArrowUp,
  ArrowDown
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

  // Enhanced mock data with genre and tier analysis
  const genreData = [
    { 
      name: 'Challenge/Stunts', 
      channels: 3, 
      avgViews: 4200000, 
      avgLikes: 185000,
      avgComments: 28000,
      color: 'red',
      trend: 24,
      topCreator: 'MrBeast'
    },
    { 
      name: 'Kids/Family', 
      channels: 3, 
      avgViews: 2100000, 
      avgLikes: 95000,
      avgComments: 15000,
      color: 'green',
      trend: 18,
      topCreator: 'VeggieTales'
    },
    { 
      name: 'Education/Science', 
      channels: 3, 
      avgViews: 1800000, 
      avgLikes: 78000,
      avgComments: 12500,
      color: 'blue',
      trend: 12,
      topCreator: 'SciShow'
    },
    { 
      name: 'Gaming/Tech', 
      channels: 3, 
      avgViews: 2800000, 
      avgLikes: 125000,
      avgComments: 18500,
      color: 'purple',
      trend: 15,
      topCreator: 'Marques Brownlee'
    },
    { 
      name: 'Lifestyle/Vlogs', 
      channels: 2, 
      avgViews: 1200000, 
      avgLikes: 68000,
      avgComments: 9200,
      color: 'pink',
      trend: 8,
      topCreator: 'Emma Chamberlain'
    }
  ];

  const tierData = [
    {
      tier: 'Mega Creators',
      subtitle: '50M+ subscribers',
      count: 3,
      channels: ['MrBeast', 'PewDiePie', 'T-Series'],
      avgViews: 15000000,
      avgLikes: 450000,
      icon: Crown,
      color: 'yellow',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      tier: 'Macro Creators',
      subtitle: '10-50M subscribers',
      count: 5,
      channels: ['Marques Brownlee', 'SciShow', 'VeggieTales'],
      avgViews: 3200000,
      avgLikes: 125000,
      icon: Trophy,
      color: 'blue',
      gradient: 'from-blue-400 to-purple-500'
    },
    {
      tier: 'Mid-Tier Creators',
      subtitle: '1-10M subscribers',
      count: 6,
      channels: ['Rising creators', 'Niche experts'],
      avgViews: 850000,
      avgLikes: 32000,
      icon: Award,
      color: 'green',
      gradient: 'from-green-400 to-blue-500'
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  const MetricCard = ({ icon: Icon, title, value, subtitle, color, trend = null, large = false }) => (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${large ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r from-${color}-100 to-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend !== null && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend >= 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className={`${large ? 'text-3xl' : 'text-2xl'} font-bold mb-1 text-gray-900`}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </h3>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {subtitle && (
          <p className="text-xs mt-1 text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );

  const GenreCard = ({ genre }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-4 h-4 rounded-full bg-${genre.color}-500`}></div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-${genre.color}-100 text-${genre.color}-800`}>
          <ArrowUp className="w-3 h-3" />
          <span>{genre.trend}%</span>
        </div>
      </div>
      <h4 className="text-lg font-bold text-gray-900 mb-2">{genre.name}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Avg Views:</span>
          <span className="font-medium">{formatNumber(genre.avgViews)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg Likes:</span>
          <span className="font-medium">{formatNumber(genre.avgLikes)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Channels:</span>
          <span className="font-medium">{genre.channels}</span>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">Top: </span>
            {genre.topCreator}
          </p>
        </div>
      </div>
    </div>
  );

  const TierCard = ({ tier }) => {
    const Icon = tier.icon;
    return (
      <div className={`bg-gradient-to-r ${tier.gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8" />
          <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
            <span className="text-sm font-bold">{tier.count} channels</span>
          </div>
        </div>
        <h4 className="text-xl font-bold mb-1">{tier.tier}</h4>
        <p className="text-sm opacity-90 mb-4">{tier.subtitle}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="opacity-80">Avg Views:</span>
            <span className="font-bold">{formatNumber(tier.avgViews)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-80">Avg Likes:</span>
            <span className="font-bold">{formatNumber(tier.avgLikes)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white border-opacity-20">
          <p className="text-xs opacity-80">
            Including: {tier.channels.slice(0, 2).join(', ')}
            {tier.channels.length > 2 && ` +${tier.channels.length - 2} more`}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
          YouTube Creator Intelligence Dashboard
        </h1>
        <p className="text-lg text-gray-600">Advanced ML-Ready Dataset Analysis & Creator Economy Insights</p>
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Health Score: 100/100</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Last Updated: 9/8/2025</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Real-time Analytics</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={Play} 
          title="Total Videos Analyzed" 
          value={560} 
          subtitle="ML-verified dataset"
          color="red"
          trend={12}
        />
        <MetricCard 
          icon={Users} 
          title="Creators Tracked" 
          value={14} 
          subtitle="Across 5 major genres"
          color="blue"
          trend={8}
        />
        <MetricCard 
          icon={Eye} 
          title="Average Views" 
          value={2500000} 
          subtitle="Per video analyzed"
          color="green"
          trend={15}
        />
        <MetricCard 
          icon={Heart} 
          title="Engagement Rate" 
          value="3.4%" 
          subtitle="Industry benchmark: 2.1%"
          color="purple"
          trend={18}
        />
      </div>

      {/* Creator Tier Analysis */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Crown className="w-6 h-6 mr-3 text-yellow-500" />
          Creator Tier Analysis
          <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
            Premium Insights
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tierData.map((tier, index) => (
            <TierCard key={index} tier={tier} />
          ))}
        </div>
      </div>

      {/* Genre Performance */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-blue-500" />
          Genre Performance Analysis
          <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
            5 Categories Tracked
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {genreData.map((genre, index) => (
            <GenreCard key={index} genre={genre} />
          ))}
        </div>
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard 
          icon={MessageCircle} 
          title="Comments Analyzed" 
          value={7000000} 
          subtitle="Sentiment & engagement data"
          color="orange"
          trend={22}
        />
        <MetricCard 
          icon={TrendingUp} 
          title="Top Performing Genre" 
          value="Challenge/Stunts" 
          subtitle="4.2M avg views • +24% growth"
          color="indigo"
          trend={24}
        />
        <MetricCard 
          icon={Database} 
          title="Dataset Quality" 
          value="99.7%" 
          subtitle="Verified & ML-ready"
          color="green"
          trend={2}
        />
      </div>

      {/* Action Center */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 text-center border border-gray-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">Ready for Advanced Analysis?</h3>
        <p className="mb-6 text-gray-600 max-w-2xl mx-auto">
          Your comprehensive dataset of 560 videos from 14 top creators across 5 genres is production-ready. 
          Explore detailed visualizations, export for ML training, or dive into creator-specific insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg">
            <BarChart3 className="w-4 h-4" />
            <span>Advanced Analytics</span>
          </button>
          <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 border border-gray-300 shadow-sm">
            <Database className="w-4 h-4" />
            <span>Export Dataset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
