import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  RefreshCw,
  Shield
} from 'lucide-react';

const ExtractionStatus = ({ data, loading, darkMode, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatusBadge = ({ status, label }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'complete': return 'bg-green-100 text-green-800';
        case 'running': return 'bg-blue-100 text-blue-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'error': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'complete': return CheckCircle;
        case 'running': return Activity;
        case 'pending': return Clock;
        case 'error': return AlertCircle;
        default: return Clock;
      }
    };

    const Icon = getStatusIcon(status);

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
        <Icon className="w-4 h-4 mr-1" />
        {label || status}
      </span>
    );
  };

  const ProgressBar = ({ current, total, label }) => {
    const percentage = Math.min((current / total) * 100, 100);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{current}/{total} ({percentage.toFixed(1)}%)</span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : ''}`}>
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const SystemStatus = () => (
    <div className={`${darkMode ? 'card-dark' : 'card'} mb-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-500" />
          System Status
        </h3>
        <StatusBadge status="complete" label="Healthy" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">99.9%</div>
          <div className="text-sm text-gray-500">Uptime</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">&lt; 1s</div>
          <div className="text-sm text-gray-500">API Response</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{data?.healthScore || 100}%</div>
          <div className="text-sm text-gray-500">Data Quality</div>
        </div>
      </div>
    </div>
  );

  const ExtractionProgress = () => (
    <div className={`${darkMode ? 'card-dark' : 'card'} mb-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-500" />
          Extraction Progress
        </h3>
        <button
          onClick={onRefresh}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <ProgressBar 
          current={data?.totalVideos || 560} 
          total={1000} 
          label="Total Videos Extracted" 
        />
        <ProgressBar 
          current={data?.totalChannels || 14} 
          total={25} 
          label="Channels Processed" 
        />
      </div>
    </div>
  );

  const ChannelStatus = () => (
    <div className={`${darkMode ? 'card-dark' : 'card'} mb-6`}>
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-purple-500" />
        Channel Status
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.channels?.map((channel, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{channel.name}</h4>
              <StatusBadge status={channel.status} />
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <div>Videos: {channel.videos}/40</div>
              <div>Last updated: 2 mins ago</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Extraction Status
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Real-time monitoring and system health
        </p>
      </div>

      <SystemStatus />
      <ExtractionProgress />
      <ChannelStatus />
    </div>
  );
};

export default ExtractionStatus;
