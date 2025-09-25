import React, { useState, useEffect } from 'react';
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
import FilterControls from './FilterControls';
import VideoDetailsModal from './VideoDetailsModal';
import AllVideosModal from './AllVideosModal';

// Helper function to assign genres based on channel name
const getChannelGenre = (channelName) => {
  if (!channelName) return 'Unknown';
  
  const name = channelName.toLowerCase();
  
  // Catholic/Christian channels
  if (name.includes('ascension presents') || name.includes('bishop robert barron') || 
      name.includes('catholic talk show') || name.includes('father leo show') ||
      name.includes('veggie') || name.includes('veggie tales') ||
      name.includes('catholic') || name.includes('christian') || name.includes('bishop') || name.includes('church')) {
    return 'Catholic';
  }
  
  // Challenge/Stunts channels
  if (name.includes('mrbeast') || name.includes('mr beast') || name.includes('zach king') || 
      name.includes('hangtime') || name.includes('ryan trahan') ||
      name.includes('stunt') || name.includes('challenge') || name.includes('dude perfect')) {
    return 'Challenge/Stunts';
  }
  
  // Education channels
  if (name.includes('kurzgesagt') || name.includes('veritasium') || name.includes('scishow') || 
      name.includes('fun science') || name.includes('up and atom') ||
      name.includes('education') || name.includes('learn') || name.includes('science') || 
      name.includes('crash course') || name.includes('khan') || name.includes('ted') || name.includes('vsauce')) {
    return 'Education';
  }
  
  // Family channels
  if (name.includes('cocomelon') || name.includes('kids roma show') || name.includes('sheriff labrador') ||
      name.includes('miss honey bear') || name.includes('veggietal') ||
      name.includes('family') || name.includes('kids') || name.includes('children') || 
      name.includes('blippi') || name.includes('ryan')) {
    return 'Family';
  }
  
  // Gaming channels
  if (name.includes('pewdiepie') || name.includes('jacksepticeye') || name.includes('call me kevin') ||
      name.includes('gaming') || name.includes('gamer') || name.includes('gameplay') || 
      name.includes('markiplier') || name.includes('ninja') || name.includes('fortnite')) {
    return 'Gaming';
  }
  
  return 'Unknown';
};

  // Helper function to determine global tier based on subscriber count
  const getGlobalTier = (channelName) => {
    if (!channelName) return 'Unknown';
    
    const name = channelName.toLowerCase();
    
    // Mega tier (100M+ subscribers)
    if (name.includes('mrbeast') || name.includes('pewdiepie') || name.includes('cocomelon')) {
      return 'Mega';
    }
    
    // Large tier (10M+ subscribers)
    if (name.includes('zach king') || name.includes('ryan trahan') || name.includes('kurzgesagt') || 
        name.includes('veritasium') || name.includes('jacksepticeye') || name.includes('kids roma show')) {
      return 'Large';
    }
    
    // Mid tier (1M+ subscribers)
    if (name.includes('hangtime') || name.includes('ascension presents') || name.includes('bishop robert barron') ||
        name.includes('scishow') || name.includes('call me kevin') || name.includes('sheriff labrador')) {
      return 'Mid';
    }
    
    // Small tier (100K+ subscribers)
    if (name.includes('ed pratt') || name.includes('catholic talk show') || name.includes('father leo show') ||
        name.includes('fun science') || name.includes('up and atom') || name.includes('floydson') || 
        name.includes('veggie')) {
      return 'Small';
    }
    
    // New tier (<100K subscribers)
    if (name.includes('cameron riecker') || name.includes('lizz') || name.includes('miss honey bear')) {
      return 'New';
    }
    
    return 'Unknown';
  };

  // Helper function to determine genre tier based on subscriber count within genre
  const getGenreTier = (channelName) => {
    if (!channelName) return 'Unknown';
    
    const name = channelName.toLowerCase();
    
    // Challenge/Stunts genre tiers
    if (name.includes('mrbeast')) return 'Large';
    if (name.includes('zach king') || name.includes('ryan trahan')) return 'Mid';
    if (name.includes('hangtime')) return 'Small';
    if (name.includes('ed pratt')) return 'New';
    
    // Catholic genre tiers
    if (name.includes('ascension presents') || name.includes('bishop robert barron')) return 'Large';
    if (name.includes('catholic talk show')) return 'Mid';
    if (name.includes('father leo show')) return 'Small';
    if (name.includes('cameron riecker')) return 'New';
    
    // Education/Science genre tiers
    if (name.includes('kurzgesagt')) return 'Large';
    if (name.includes('veritasium') || name.includes('scishow')) return 'Mid';
    if (name.includes('fun science')) return 'Small';
    if (name.includes('up and atom')) return 'New';
    
    // Gaming genre tiers
    if (name.includes('pewdiepie') || name.includes('jacksepticeye')) return 'Large';
    if (name.includes('call me kevin')) return 'Mid';
    if (name.includes('floydson')) return 'Small';
    if (name.includes('lizz')) return 'New';
    
    // Kids/Family genre tiers
    if (name.includes('cocomelon')) return 'Large';
    if (name.includes('kids roma show') || name.includes('sheriff labrador')) return 'Mid';
    if (name.includes('veggie')) return 'Small';
    if (name.includes('miss honey bear')) return 'New';
    
    return 'Unknown';
  };

  // Helper function to determine tier based on views
  const getTierFromViews = (views) => {
    if (views >= 1000000) return 'high';   // 1M+ views = high tier
    if (views >= 100000) return 'mid';     // 100K-1M views = mid tier  
    return 'low';                          // <100K views = low tier
  };const Dashboard = ({ data, loading, darkMode }) => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [allVideosModalOpen, setAllVideosModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [originalEnhancedData, setOriginalEnhancedData] = useState(null); // Store the original enhanced data
  const [activeFilters, setActiveFilters] = useState({
    genre: 'all',
    tier: 'all',
    globalTier: 'all',
    genreTier: 'all',
    sortBy: 'name'
  });

  // Initialize filteredData and enhance with real channel details
  useEffect(() => {
    if (data) {
      enhanceDataWithChannelDetails();
    }
  }, [data]);

  const enhanceDataWithChannelDetails = async () => {
    try {
      // Fetch detailed channel data from visualization endpoint
      const response = await fetch('/api/visualization');
      if (response.ok) {
        const vizData = await response.json();
        
        // Merge the detailed engagement data with the basic channel data
        const enhancedChannels = data.channels.map(channel => {
          const detailedChannel = vizData.engagement?.find(eng => eng.name === channel.name);
          if (detailedChannel) {
            const genre = getChannelGenre(channel.name);
            const globalTier = getGlobalTier(channel.name);
            const genreTier = getGenreTier(channel.name);
            console.log(`✅ Channel: "${channel.name}" → Genre: "${genre}", Global: "${globalTier}", Genre Tier: "${genreTier}"`);
            console.log(`📊 Views data for ${channel.name}:`, {
              originalViews: channel.views,
              detailedViews: detailedChannel.views,
              totalViews: detailedChannel.views || 0
            });
            
            return {
              ...channel,
              totalViews: detailedChannel.views || 0,
              totalLikes: detailedChannel.likes || 0,
              totalComments: detailedChannel.comments || 0,
              videos: detailedChannel.videos || channel.videos || 0,
              avgEngagement: detailedChannel.views > 0 ? 
                ((detailedChannel.likes + detailedChannel.comments) / detailedChannel.views * 100) : 0,
              genre: genre,
              tier: getTierFromViews(detailedChannel.views || 0),
              globalTier: globalTier,
              genreTier: genreTier
            };
          } else {
            const genre = getChannelGenre(channel.name);
            const globalTier = getGlobalTier(channel.name);
            const genreTier = getGenreTier(channel.name);
            console.log(`⚠️ Channel: "${channel.name}" → Genre: "${genre}", Global: "${globalTier}", Genre Tier: "${genreTier}" (no detailed data)`);
            console.log(`📊 No detailed data for ${channel.name}, using fallback:`, {
              originalViews: channel.views,
              fallbackViews: channel.views || 0
            });
            return {
              ...channel,
              totalViews: channel.views || 0, // Use original views as fallback
              totalLikes: 0,
              totalComments: 0,
              avgEngagement: 0,
              genre: genre,
              tier: getTierFromViews(channel.views || 0), // Use original views for tier calculation
              globalTier: globalTier,
              genreTier: genreTier
            };
          }
        });

        const enhancedDataObj = {
          ...data,
          channels: enhancedChannels
        };

        // Collect all videos from all channels for the AllVideosModal
        const allVideos = [];
        if (vizData && vizData.engagement) {
          vizData.engagement.forEach(channelData => {
            if (channelData.videoDetails && Array.isArray(channelData.videoDetails)) {
              channelData.videoDetails.forEach(video => {
                allVideos.push({
                  ...video,
                  channel_name: channelData.name
                });
              });
            }
          });
        }
        enhancedDataObj.allVideos = allVideos;
        console.log('📹 Collected', allVideos.length, 'total videos from all channels');

        // Store both the original enhanced data and set it as filtered data
        setOriginalEnhancedData(enhancedDataObj);
        setFilteredData(enhancedDataObj);
        
        console.log('✅ Enhanced data created with', enhancedChannels.length, 'channels');
      } else {
        // If API fails, just use basic data
        setFilteredData(data);
      }
    } catch (error) {
      console.error('Error enhancing channel data:', error);
      setFilteredData(data);
    }
  };

  const getChannelGenre = (channelName) => {
    if (!channelName) return 'Unknown';
    
    const name = channelName.toLowerCase();
    
    // Challenge/Stunts channels - exact matches from your configuration
    if (name.includes('mrbeast') || name.includes('mr beast') || 
        name.includes('zach king') || name.includes('ryan trahan') || 
        name.includes('hangtime') || name.includes('ed pratt')) {
      return 'Challenge/Stunts';
    }
    
    // Catholic channels - exact matches from your configuration  
    if (name.includes('ascension presents') || name.includes('bishop robert barron') || 
        name.includes('catholic talk show') || name.includes('father leo show') || 
        name.includes('cameron riecker')) {
      return 'Catholic';
    }
    
    // Education/Science channels - exact matches from your configuration
    if (name.includes('kurzgesagt') || name.includes('veritasium') || 
        name.includes('scishow') || name.includes('fun science') || 
        name.includes('up and atom')) {
      return 'Education';
    }
    
    // Gaming channels - exact matches from your configuration
    if (name.includes('pewdiepie') || name.includes('jacksepticeye') || 
        name.includes('call me kevin') || name.includes('floydson') || 
        name.includes('lizz')) {
      return 'Gaming';
    }
    
    // Kids/Family channels - exact matches from your configuration
    if (name.includes('cocomelon') || name.includes('kids roma show') || 
        name.includes('sheriff labrador') || name.includes('veggie') || 
        name.includes('miss honey bear')) {
      return 'Family';
    }
    
    // Fallback for any unmatched channels
    console.warn(`Channel "${channelName}" not matched to any genre`);
    return 'Unknown';
  };

  const getTierFromViews = (views) => {
    if (views >= 1000000) return 'high';   // 1M+ views = high tier
    if (views >= 100000) return 'mid';     // 100K-1M views = mid tier  
    return 'low';                          // <100K views = low tier
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    console.log('=== FILTER CHANGE START ===');
    console.log('New filters received:', filters);
    console.log('Previous activeFilters:', activeFilters);
    console.log('Current filteredData:', filteredData ? filteredData.channels?.length : 'null');
    console.log('Original data:', data ? data.channels?.length : 'null');
    
    setActiveFilters(filters);
    
    if (!data || !originalEnhancedData) {
      console.log('❌ Missing data or originalEnhancedData');
      console.log('data:', !!data, 'originalEnhancedData:', !!originalEnhancedData);
      return;
    }
    
    // Always start with the original enhanced data, not the current filteredData
    let channelsToFilter = [...originalEnhancedData.channels]; // Create a copy
    console.log('Starting with original enhanced channels:', channelsToFilter.length);
    console.log('Channel names:', channelsToFilter.map(c => c.name));
    
    // Apply genre filter
    if (filters.genre && filters.genre !== 'all') {
      console.log('Filtering by genre:', filters.genre);
      channelsToFilter = channelsToFilter.filter(channel => {
        const channelGenre = channel.genre?.toLowerCase() || 'unknown';
        const filterGenre = filters.genre.toLowerCase();
        
        console.log(`Checking channel: ${channel.name}, genre: ${channelGenre} vs filter: ${filterGenre}`);
        
        // Direct genre matching with proper case handling
        if (filterGenre === 'catholic' && channelGenre === 'catholic') {
          return true;
        }
        if (filterGenre === 'challenge/stunts' && channelGenre === 'challenge/stunts') {
          return true;
        }
        if (filterGenre === 'education' && channelGenre === 'education') {
          return true;
        }
        if (filterGenre === 'gaming' && channelGenre === 'gaming') {
          return true;
        }
        if (filterGenre === 'family' && channelGenre === 'family') {
          return true;
        }
        
        return false; // No match found
      });
      console.log(`Found ${channelsToFilter.length} channels for genre ${filters.genre}`);
    } else {
      console.log('No genre filter applied, showing all channels');
    }
    
    // Apply tier filter
    if (filters.tier && filters.tier !== 'all') {
      console.log('Filtering by tier:', filters.tier);
      channelsToFilter = channelsToFilter.filter(channel => {
        const tier = channel.tier || getTierFromViews(channel.totalViews || 0);
        console.log(`Channel ${channel.name} has tier: ${tier}`);
        return tier === filters.tier;
      });
      console.log(`Found ${channelsToFilter.length} channels for tier ${filters.tier}`);
    }
    
    // Apply global tier filter
    if (filters.globalTier && filters.globalTier !== 'all') {
      console.log('Filtering by global tier:', filters.globalTier);
      channelsToFilter = channelsToFilter.filter(channel => {
        const globalTier = channel.globalTier || getGlobalTier(channel.name);
        console.log(`Channel ${channel.name} has global tier: ${globalTier}`);
        return globalTier === filters.globalTier;
      });
      console.log(`Found ${channelsToFilter.length} channels for global tier ${filters.globalTier}`);
    } else {
      console.log('No global tier filter applied');
    }
    
    // Apply genre tier filter
    if (filters.genreTier && filters.genreTier !== 'all') {
      console.log('Filtering by genre tier:', filters.genreTier);
      channelsToFilter = channelsToFilter.filter(channel => {
        const genreTier = channel.genreTier || getGenreTier(channel.name);
        console.log(`Channel ${channel.name} has genre tier: ${genreTier}`);
        return genreTier === filters.genreTier;
      });
      console.log(`Found ${channelsToFilter.length} channels for genre tier ${filters.genreTier}`);
    } else {
      console.log('No genre tier filter applied');
    }
    
    console.log(`Final channel count before sorting: ${channelsToFilter.length}`);
    
    // Apply sorting
    channelsToFilter = channelsToFilter.sort((a, b) => {
      switch (filters.sortBy) {
        case 'videos':
          return (b.videos || 0) - (a.videos || 0);
        case 'engagement':
          return (b.avgEngagement || 0) - (a.avgEngagement || 0);
        case 'views':
          return (b.totalViews || 0) - (a.totalViews || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });
    
    console.log(`Final channels after filtering and sorting: ${channelsToFilter.length}`);
    
    const filteredResult = {
      ...originalEnhancedData,
      channels: channelsToFilter
    };
    
    setFilteredData(filteredResult);
    
    console.log('Updated filteredData with channels:', filteredResult.channels.length);
    console.log('=== FILTER CHANGE END ===');
  };

  // Helper function to determine tier for a channel
  const getTierForChannel = (channel) => {
    const totalViews = channel.totalViews || channel.views || 0;
    if (totalViews >= 1000000) return 'high';
    if (totalViews >= 100000) return 'mid';
    return 'low';
  };

  // Handle channel click - fetch real videos for that channel
  const handleChannelClick = async (channel) => {
    console.log('Clicking channel:', channel.name);
    setSelectedChannel(channel);
    
    try {
      // Fetch real video details for this channel from the API
      const encodedName = encodeURIComponent(channel.name);
      console.log('Fetching videos for:', encodedName);
      
      const response = await fetch(`/api/channel/${encodedName}/videos`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const videoData = await response.json();
        console.log('Video data received:', videoData);
        
        setSelectedChannel({
          ...channel,
          videoDetails: videoData.videos || []
        });
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch videos:', response.status, errorData);
        
        // Use empty array if API fails
        setSelectedChannel({
          ...channel,
          videoDetails: []
        });
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      // Use empty array if request fails
      setSelectedChannel({
        ...channel,
        videoDetails: []
      });
    }
    
    setModalOpen(true);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const displayData = filteredData || data || {};

  // Provide safe defaults
  const safeDisplayData = {
    totalVideos: displayData.totalVideos || 0,
    totalChannels: displayData.totalChannels || 0,
    healthScore: displayData.healthScore || 0,
    lastUpdated: displayData.lastUpdated || new Date().toISOString(),
    stats: displayData.stats || {
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      topPerformingGenre: 'Unknown'
    },
    channels: displayData.channels || []
  };
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

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend = null, onClick = null }) => (
    <div 
      className={`${darkMode ? 'card-dark' : 'card'} group hover:scale-105 transition-transform duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
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
    <div 
      className={`${darkMode ? 'card-dark' : 'card'} hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105`}
      onClick={() => handleChannelClick(channel)}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">{channel.name}</h4>
        <span className={`metric-badge ${
          channel.status === 'complete' ? 'metric-badge-success' : 'metric-badge-warning'
        }`}>
          {channel.status}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Play className="w-4 h-4 text-gray-500" />
            <span>{channel.videos} videos</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3 text-blue-500" />
            <span className="text-xs">{formatNumber(channel.totalViews || channel.views || 0)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {channel.genre || 'Unknown Genre'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            getTierForChannel(channel) === 'high' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : getTierForChannel(channel) === 'mid'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {getTierForChannel(channel).toUpperCase()} TIER
          </span>
        </div>
        
        {/* Tier Descriptors */}
        <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              View Tier:
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              getTierForChannel(channel) === 'high' 
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : getTierForChannel(channel) === 'mid'
                ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {getTierForChannel(channel).charAt(0).toUpperCase() + getTierForChannel(channel).slice(1)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Global Sub Tier:
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              channel.globalTier === 'mega' 
                ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                : channel.globalTier === 'large'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : channel.globalTier === 'mid'
                ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                : channel.globalTier === 'small'
                ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {channel.globalTier ? channel.globalTier.charAt(0).toUpperCase() + channel.globalTier.slice(1) : 'Unknown'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Genre Sub Tier:
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              channel.genreTier === 'mega' 
                ? 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300'
                : channel.genreTier === 'large'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                : channel.genreTier === 'mid'
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
                : channel.genreTier === 'small'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {channel.genreTier ? channel.genreTier.charAt(0).toUpperCase() + channel.genreTier.slice(1) : 'Unknown'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 pt-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600">Click to explore videos</span>
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
            Health Score: {safeDisplayData.healthScore}/100
          </span>
          <span className="metric-badge-info">
            <Clock className="w-4 h-4 mr-1" />
            Last Updated: {new Date(safeDisplayData.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <FilterControls 
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        darkMode={darkMode}
        totalChannels={safeDisplayData.totalChannels}
        filteredChannels={safeDisplayData.channels?.length || 0}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Play}
          title="Total Videos"
          value={safeDisplayData.totalVideos}
          subtitle="Extracted & Verified"
          color="red"
          trend={12}
          onClick={() => setAllVideosModalOpen(true)}
        />
        <StatCard
          icon={Users}
          title="Channels Analyzed"
          value={safeDisplayData.totalChannels}
          subtitle="Across 5 genres"
          color="blue"
        />
        <StatCard
          icon={Eye}
          title="Avg Views"
          value={safeDisplayData.stats.avgViews}
          subtitle="Per video"
          color="green"
          trend={8}
        />
        <StatCard
          icon={Heart}
          title="Avg Engagement"
          value={safeDisplayData.stats.avgLikes}
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
          value={safeDisplayData.stats.avgComments}
          subtitle="Average per video"
          color="orange"
        />
        <StatCard
          icon={TrendingUp}
          title="Top Genre"
          value={safeDisplayData.stats.topPerformingGenre}
          subtitle="By engagement"
          color="indigo"
        />
        <StatCard
          icon={Database}
          title="Data Quality"
          value={`${safeDisplayData.healthScore}%`}
          subtitle="Verification passed"
          color="green"
        />
      </div>

      {/* Channel Status */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          Channel Extraction Status
          <span className={`ml-3 text-sm font-normal px-3 py-1 rounded-full ${
            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {safeDisplayData.channels?.length || 0} channels
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeDisplayData.channels?.map((channel, index) => (
            <ChannelCard key={index} channel={channel} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${darkMode ? 'card-dark' : 'card'} text-center`}>
        <h3 className="text-xl font-bold mb-4">Ready to Analyze?</h3>
        <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your dataset is production-ready with {safeDisplayData.totalVideos} videos from {safeDisplayData.totalChannels} channels.
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

      {/* Video Details Modal */}
      <VideoDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        channel={selectedChannel?.name}
        videos={selectedChannel?.videoDetails || []}
        darkMode={darkMode}
      />

      <AllVideosModal
        isOpen={allVideosModalOpen}
        onClose={() => setAllVideosModalOpen(false)}
        allVideos={filteredData?.allVideos || []}
        darkMode={darkMode}
      />
    </div>
  );
};

export default Dashboard;
