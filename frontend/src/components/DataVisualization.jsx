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
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity, Filter, Layers, Target, Flame, BarChart2, Trophy } from 'lucide-react';
import FilterControls from './FilterControls';

// Scrollbar styles
const scrollbarStyles = `
  .scrollbar-light::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scrollbar-light::-webkit-scrollbar-track {
    background: #f9fafb;
    border-radius: 4px;
  }
  .scrollbar-light::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  .scrollbar-light::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  .scrollbar-dark::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scrollbar-dark::-webkit-scrollbar-track {
    background: #1f2937;
    border-radius: 4px;
  }
  .scrollbar-dark::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
  }
  .scrollbar-dark::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('scrollbar-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'scrollbar-styles';
    style.textContent = scrollbarStyles;
    document.head.appendChild(style);
  }
}

// YouTube thumbnail utility
const getYouTubeThumbnail = (videoId, quality = 'mqdefault') => {
  if (!videoId) return null;
  // Handle different video ID formats that might be in the data
  const cleanVideoId = videoId.toString().trim();
  // YouTube thumbnail qualities: default (120x90), mqdefault (320x180), hqdefault (480x360), sddefault (640x480), maxresdefault (1280x720)
  return `https://img.youtube.com/vi/${cleanVideoId}/${quality}.jpg`;
};

// Color analysis utilities for heatmap
const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [h * 360, s, l];
};

const getHueFamily = (h, s, l) => {
  // Handle neutrals first
  if (l <= 0.10) return 'Black';
  if (l >= 0.90) return 'White';
  if (s <= 0.10) return 'Gray';

  // 12-color wheel families
  const families = [
    'Red', 'Red-Orange', 'Orange', 'Yellow', 'Yellow-Green', 'Green',
    'Green-Cyan', 'Cyan', 'Blue', 'Blue-Violet', 'Violet', 'Magenta'
  ];
  
  const hueIndex = Math.floor((h + 15) / 30) % 12;
  return families[hueIndex];
};

const getContrastClass = (contrast) => {
  if (contrast < 0.25) return 'Low';
  if (contrast < 0.5) return 'Mid';
  return 'High';
};

const calculatePaletteContrast = (hslColors) => {
  if (hslColors.length === 0) return 0;
  const lightnesses = hslColors.map(([h, s, l]) => l);
  return Math.max(...lightnesses) - Math.min(...lightnesses);
};

const createPaletteCombo = (families) => {
  const neutrals = families.filter(f => ['Black', 'White', 'Gray'].includes(f));
  const hues = families.filter(f => !['Black', 'White', 'Gray'].includes(f));
  
  // Sort neutrals by preference and hues by color wheel order
  const sortedNeutrals = neutrals.sort((a, b) => {
    const order = ['Black', 'White', 'Gray'];
    return order.indexOf(a) - order.indexOf(b);
  });
  
  const hueOrder = [
    'Red', 'Red-Orange', 'Orange', 'Yellow', 'Yellow-Green', 'Green',
    'Green-Cyan', 'Cyan', 'Blue', 'Blue-Violet', 'Violet', 'Magenta'
  ];
  
  const sortedHues = hues.sort((a, b) => {
    return hueOrder.indexOf(a) - hueOrder.indexOf(b);
  }).slice(0, 3); // Cap at 3 hues
  
  const combo = [...sortedNeutrals, ...sortedHues].join(' + ');
  return combo || 'Mixed';
};

// Color frequency utilities
const getCoarseGrouping = (family) => {
  const warmColors = ['Red', 'Red-Orange', 'Orange', 'Yellow', 'Yellow-Green'];
  const coolColors = ['Green', 'Green-Cyan', 'Cyan', 'Blue', 'Blue-Violet', 'Violet', 'Magenta'];
  const neutrals = ['Black', 'White', 'Gray'];
  
  if (warmColors.includes(family)) return 'Warm';
  if (coolColors.includes(family)) return 'Cool';
  if (neutrals.includes(family)) return 'Neutral';
  return 'Other';
};

const getColorSwatch = (family) => {
  const colorMap = {
    'Red': '#EF4444',
    'Red-Orange': '#F97316',
    'Orange': '#F59E0B',
    'Yellow': '#EAB308',
    'Yellow-Green': '#84CC16',
    'Green': '#22C55E',
    'Green-Cyan': '#10B981',
    'Cyan': '#06B6D4',
    'Blue': '#3B82F6',
    'Blue-Violet': '#6366F1',
    'Violet': '#8B5CF6',
    'Magenta': '#D946EF',
    'Black': '#000000',
    'White': '#FFFFFF',
    'Gray': '#6B7280'
  };
  return colorMap[family] || '#9CA3AF';
};

const calculateBootstrapCI = (values, confidence = 0.95) => {
  if (values.length < 10) return null; // Need minimum samples for CI
  
  const numBootstraps = 1000;
  const bootstrapMeans = [];
  
  for (let i = 0; i < numBootstraps; i++) {
    const sample = [];
    for (let j = 0; j < values.length; j++) {
      sample.push(values[Math.floor(Math.random() * values.length)]);
    }
    bootstrapMeans.push(sample.reduce((a, b) => a + b, 0) / sample.length);
  }
  
  bootstrapMeans.sort((a, b) => a - b);
  const lowerIdx = Math.floor((1 - confidence) / 2 * numBootstraps);
  const upperIdx = Math.floor((1 + confidence) / 2 * numBootstraps);
  
  return {
    lower: bootstrapMeans[lowerIdx],
    upper: bootstrapMeans[upperIdx]
  };
};

const DataVisualization = ({ data, loading, darkMode }) => {
  const [activeChart, setActiveChart] = useState('engagement');
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [commentData, setCommentData] = useState(null); // New state for comment data
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [engagementViewMode, setEngagementViewMode] = useState('raw'); // 'raw' or 'per_subscriber'
  const [engagementMetricFilter, setEngagementMetricFilter] = useState('all'); // 'all', 'views', 'likes', 'comments', 'rqs'
  const [genreViewMode, setGenreViewMode] = useState('raw'); // 'raw' or 'per_subscriber'
  const [genreMetricFilter, setGenreMetricFilter] = useState('all'); // 'all', 'views', 'likes', 'comments', 'rqs'
  const [tierViewMode, setTierViewMode] = useState('raw'); // 'raw' or 'per_subscriber'
  const [tierMetricFilter, setTierMetricFilter] = useState('all'); // 'all', 'views', 'likes', 'comments', 'rqs'
  const [correlationViewMode, setCorrelationViewMode] = useState('raw'); // 'raw' or 'per_subscriber'
  const [correlationColorMode, setCorrelationColorMode] = useState('genre'); // 'genre' or 'tier'
  const [correlationDataMode, setCorrelationDataMode] = useState('channel'); // 'channel' or 'video'
  const [correlationYAxis, setCorrelationYAxis] = useState('engagement'); // 'engagement', 'rqs', 'like_ratio', 'comment_ratio', 'subscribers'
  const [thumbnailView, setThumbnailView] = useState('table'); // 'table' or 'matrix'
  const [thumbnailAnalysisView, setThumbnailAnalysisView] = useState('palette'); // 'palette', 'heatmap', 'frequency', 'face_analysis', 'leaderboard'
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Heatmap specific states
  const [heatmapMetric, setHeatmapMetric] = useState('rqs'); // 'rqs' or 'views'
  const [heatmapViewsMode, setHeatmapViewsMode] = useState('avg'); // 'avg' or 'median'
  const [heatmapColumns, setHeatmapColumns] = useState('n_colors'); // 'n_colors' or 'contrast'
  const [heatmapType, setHeatmapType] = useState('combinations'); // 'combinations' or 'single_colors'
  const [heatmapMinN, setHeatmapMinN] = useState(20);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState(null);
  
  // Color Frequency specific states
  const [frequencyMetric, setFrequencyMetric] = useState('rqs'); // 'rqs' or 'views'
  const [frequencyViewsMode, setFrequencyViewsMode] = useState('avg'); // 'avg' or 'median'
  const [frequencyGrouping, setFrequencyGrouping] = useState('12_family'); // '12_family' or 'coarse'
  const [frequencyView, setFrequencyView] = useState('bubble'); // 'bubble', 'ranked', 'composition', 'multiples', 'timeline'
  const [frequencyMinN, setFrequencyMinN] = useState(30);
  const [showNeutrals, setShowNeutrals] = useState(true);
  const [selectedFrequencyColor, setSelectedFrequencyColor] = useState(null);
  const [compareToCategory, setCompareToCategory] = useState(false);
  
  // Leaderboard specific states
  const [leaderboardMetric, setLeaderboardMetric] = useState('rqs'); // 'rqs' or 'views'
  const [leaderboardViewsMode, setLeaderboardViewsMode] = useState('avg'); // 'avg' or 'median'
  const [leaderboardEntity, setLeaderboardEntity] = useState('palettes'); // 'palettes' or 'single_colors'
  const [leaderboardGrouping, setLeaderboardGrouping] = useState('12_family'); // '12_family' or 'coarse'
  const [leaderboardView, setLeaderboardView] = useState('bars'); // 'bars', 'dartboard', 'grid'
  const [leaderboardMinN, setLeaderboardMinN] = useState(10);
  const [leaderboardDedup, setLeaderboardDedup] = useState(true);
  const [leaderboardShowCI, setLeaderboardShowCI] = useState(false);
  const [leaderboardNormalize, setLeaderboardNormalize] = useState(false);
  const [selectedLeaderboardItem, setSelectedLeaderboardItem] = useState(null);
  const [leaderboardExamples, setLeaderboardExamples] = useState(true);
  
  // Face analysis state
  const [faceMetric, setFaceMetric] = useState('rqs'); // 'rqs' or 'views'
  const [faceViewsMode, setFaceViewsMode] = useState('avg'); // 'avg' or 'median'
  const [faceBinScheme, setFaceBinScheme] = useState('standard'); // 'standard' or 'fine'
  const [faceMinN, setFaceMinN] = useState(5); // minimum n for valid bins
  const [faceAnalysisView, setFaceAnalysisView] = useState('leaderboard'); // 'leaderboard', 'curve', 'distribution'
  const [selectedFaceBin, setSelectedFaceBin] = useState(null); // for drill-down
  
  // Sentiment analysis enhanced state
  const [sentimentDisplayMode, setSentimentDisplayMode] = useState('unigrams'); // 'unigrams', 'bigrams', 'both'
  const [sentimentWeighting, setSentimentWeighting] = useState('count'); // 'count' or 'engagement'
  const [sentimentMinFreq, setSentimentMinFreq] = useState(10); // minimum word frequency (increased default)
  const [sentimentMaxWords, setSentimentMaxWords] = useState(50); // maximum words to display
  const [selectedSentimentWord, setSelectedSentimentWord] = useState(null); // for drill-down
  const [sentimentDrilldownOpen, setSentimentDrilldownOpen] = useState(false); // drill-down panel state
  
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

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isFullscreen]);

  // Helper function to get filtered channels based on current filters
  const getFilteredChannels = () => {
    if (!originalData || !originalData.engagement) {
      console.warn('⚠️ No original data available for filtering');
      return [];
    }
    
    let filteredChannels = [...originalData.engagement];
    console.log('📊 Starting with', filteredChannels.length, 'channels');
    console.log('🔍 Sample channel names:', filteredChannels.slice(0, 5).map(c => c.name));
    
    // Apply genre filter using the consistent getChannelGenre function
    if (activeFilters.genre !== 'all') {
      const beforeFilter = filteredChannels.length;
      const filterGenre = activeFilters.genre.toLowerCase();
      let targetGenre = '';
      
      if (filterGenre === 'education') targetGenre = 'Education';
      else if (filterGenre === 'gaming') targetGenre = 'Gaming';
      else if (filterGenre === 'music') targetGenre = 'Music';
      else if (filterGenre === 'news') targetGenre = 'News & Politics';
      else if (filterGenre === 'sports') targetGenre = 'Sports';
      else if (filterGenre === 'tech') targetGenre = 'Science & Technology';
      else if (filterGenre === 'catholic') targetGenre = 'Catholic';
      else if (filterGenre === 'challenge') targetGenre = 'Challenge/Stunts';
      else if (filterGenre === 'kids') targetGenre = 'Kids/Family';
      else targetGenre = activeFilters.genre;
      
      console.log(`🎯 Filtering for genre: "${targetGenre}"`);
      
      // Debug: Check which channels should match gaming
      if (targetGenre === 'Gaming') {
        console.log('🎮 Gaming channels in mapping:', ['PewdiePie', 'Jacksepticeye', 'Call Me Kevin', 'Floydson', 'Lizz']);
        console.log('🎮 Available channels to filter:', filteredChannels.map(c => c.name));
      }
      
      filteredChannels = filteredChannels.filter(channel => {
        const channelGenre = getChannelGenre(channel.name);
        const matches = channelGenre === targetGenre;
        
        if (targetGenre === 'Gaming') {
          console.log(`🎮 Gaming filter - Channel "${channel.name}" -> Genre: "${channelGenre}" (${matches ? 'MATCH' : 'no match'})`);
        } else if (matches) {
          console.log(`✅ Channel "${channel.name}" matches genre "${targetGenre}"`);
        }
        
        return matches;
      });
      console.log(`🎯 Genre filter result: ${beforeFilter} -> ${filteredChannels.length} channels`);
      console.log('🎯 Filtered channel names:', filteredChannels.map(c => c.name));
    }
    
    // Apply tier filter
    if (activeFilters.tier !== 'all') {
      filteredChannels = filteredChannels.filter(channel => {
        return channel.tier === activeFilters.tier;
      });
    }
    
    // Apply global tier filter
    if (activeFilters.globalTier !== 'all') {
      filteredChannels = filteredChannels.filter(channel => {
        return channel.global_tier === activeFilters.globalTier;
      });
    }
    
    // Apply genre tier filter
    if (activeFilters.genreTier !== 'all') {
      filteredChannels = filteredChannels.filter(channel => {
        return channel.genre_tier === activeFilters.genreTier;
      });
    }
    
    // Apply sorting
    if (activeFilters.sortBy !== 'name') {
      filteredChannels.sort((a, b) => {
        switch (activeFilters.sortBy) {
          case 'views':
            return (b.views || 0) - (a.views || 0);
          case 'videos':
            return (b.videos || 0) - (a.videos || 0);
          case 'engagement':
            const aEngagement = ((a.likes || 0) + (a.comments || 0)) / (a.views || 1);
            const bEngagement = ((b.likes || 0) + (b.comments || 0)) / (b.views || 1);
            return bEngagement - aEngagement;
          case 'rqs':
            return (b.rqs || 75) - (a.rqs || 75);
          default:
            return a.name.localeCompare(b.name);
        }
      });
    }
    
    return filteredChannels;
  };

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
          case 'rqs':
            return (b.rqs || 75) - (a.rqs || 75);
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
    const subscribers = channel.subscribers || 0;
    if (subscribers >= 50_000_000) return 'mega';    // 50M+ subscribers
    if (subscribers >= 10_000_000) return 'large';   // 10M-50M subscribers  
    if (subscribers >= 1_000_000) return 'mid';      // 1M-10M subscribers
    if (subscribers >= 100_000) return 'small';      // 100K-1M subscribers
    return 'new';                                     // <100K subscribers
  };

  // Helper function to get global tier (capitalized for filter matching)
  const getGlobalTierForChannel = (channel) => {
    const subscribers = channel.subscribers || 0;
    if (subscribers >= 100_000_000) return 'Mega';   // 100M+ subscribers
    if (subscribers >= 10_000_000) return 'Large';   // 10M+ subscribers  
    if (subscribers >= 1_000_000) return 'Mid';      // 1M+ subscribers
    if (subscribers >= 100_000) return 'Small';      // 100K+ subscribers
    return 'New';                                     // <100K subscribers
  };

  // Helper function to get view-based tier for regular tier filter
  const getViewTierForChannel = (channel) => {
    const views = channel.views || 0;
    if (views >= 10_000_000) return 'high';   // 10M+ views
    if (views >= 1_000_000) return 'mid';     // 1M+ views
    return 'low';                             // <1M views
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
    loadCommentData(); // Also load comment data on mount
  }, []); // Run once on mount

  // Update chart data when engagement view mode changes
  useEffect(() => {
    if (filteredData && activeChart === 'engagement') {
      processChartData(filteredData);
    }
  }, [engagementViewMode, engagementMetricFilter, activeChart, filteredData]);

  // Process chart data when genre toggles change
  useEffect(() => {
    if (filteredData && activeChart === 'genres') {
      processChartData(filteredData);
    }
  }, [genreViewMode, genreMetricFilter, activeChart, filteredData]);

  // Process chart data when tier toggles change
  useEffect(() => {
    if (filteredData && activeChart === 'tiers') {
      processChartData(filteredData);
    }
  }, [tierViewMode, tierMetricFilter, activeChart, filteredData]);

  // Regenerate sentiment analysis when sentiment toggles change
  useEffect(() => {
    if (activeChart === 'sentiment') {
      // Force re-render by updating a state that will trigger chart regeneration
      console.log('🔄 Sentiment analysis settings changed, regenerating word clouds...');
    }
  }, [sentimentDisplayMode, sentimentWeighting, sentimentMinFreq, sentimentMaxWords, activeFilters, activeChart]);

  // Process chart data when correlation toggles change
  useEffect(() => {
    if (filteredData && activeChart === 'correlation') {
      processChartData(filteredData);
    }
  }, [correlationViewMode, correlationColorMode, correlationDataMode, correlationYAxis, activeChart, filteredData]);

  // Helper function to get Y-axis label based on selected metric
  const getYAxisLabel = () => {
    switch (correlationYAxis) {
      case 'engagement':
        return 'Engagement Rate (%)';
      case 'rqs':
        return 'RQS Score';
      case 'like_ratio':
        return 'Like Ratio (%)';
      case 'comment_ratio':
        return 'Comment Ratio (%)';
      case 'subscribers':
        return 'Subscribers (Millions)';
      default:
        return 'Engagement Rate (%)';
    }
  };

  // Helper function to get Y-axis data key name
  const getYAxisDataKey = () => {
    return 'engagement'; // We use 'engagement' as the data key for all Y-axis metrics
  };

  // Helper function to format Y-axis value in tooltip
  const formatYAxisValue = (value) => {
    switch (correlationYAxis) {
      case 'engagement':
        return `${value?.toFixed(2)}%`;
      case 'rqs':
        return `${value?.toFixed(1)}`;
      case 'like_ratio':
        return `${value?.toFixed(3)}%`;
      case 'comment_ratio':
        return `${value?.toFixed(3)}%`;
      case 'subscribers':
        return `${value?.toFixed(1)}M`;
      default:
        return `${value?.toFixed(2)}%`;
    }
  };

  // Helper function to get dynamic chart title
  const getChartTitle = () => {
    if (activeChart === 'correlation') {
      const xAxisLabel = correlationViewMode === 'per_subscriber' ? 'Views/Sub' : 'Views';
      const yAxisLabel = getYAxisLabel().replace(' (%)', '').replace(' (Millions)', '');
      const dataType = correlationDataMode === 'video' ? 'Video' : 'Channel';
      return `${dataType} ${xAxisLabel} vs ${yAxisLabel}`;
    }
    // Return the default label for other charts
    return charts.find(c => c.id === activeChart)?.label;
  };

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

  const loadCommentData = async () => {
    try {
      console.log('🔄 Loading comment data from API...');
      const response = await fetch('/api/comments');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Comment data loaded:', data);
        setCommentData(data);
        return data;
      } else {
        console.warn('⚠️ Comment API failed');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading comment data:', error);
      return null;
    }
  };

  // Process heatmap data from thumbnail videos
  const processHeatmapData = (videos) => {
    if (!videos || videos.length === 0) return null;
    
    try {
      const processedRows = [];
      
      videos.forEach(video => {
        if (!video.colors || !Array.isArray(video.colors) || video.colors.length === 0) return;
        
        // Convert palette to HSL and analyze
        const hslColors = video.colors.map(hex => {
          try {
            return hexToHsl(hex);
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        if (hslColors.length === 0) return;
        
        const families = hslColors.map(([h, s, l]) => getHueFamily(h, s, l));
        const uniqueFamilies = [...new Set(families)];
        const nColors = hslColors.length;
        const contrast = calculatePaletteContrast(hslColors);
        const contrastClass = getContrastClass(contrast);
        const combo = createPaletteCombo(uniqueFamilies);
        
        processedRows.push({
          videoId: video.videoId,
          title: video.title,
          channelName: video.channelName,
          combo,
          nColors,
          contrast,
          contrastClass,
          families: uniqueFamilies,
          rqs: video.rqs,
          views: video.views,
          palette: video.colors,
          genre: video.genre,
          tier: video.tier
        });
      });
      
      return processedRows;
    } catch (error) {
      console.error('Error processing heatmap data:', error);
      return [];
    }
  };

  // Generate heatmap tables
  const generateHeatmapTables = (heatmapData) => {
    if (!heatmapData || heatmapData.length === 0) return null;
    
    try {
      const filteredData = heatmapData.filter(row => {
        // Apply current filters
        if (activeFilters.genre !== 'all') {
          const filterGenre = activeFilters.genre.toLowerCase();
          let targetGenre = '';
          
          if (filterGenre === 'education') targetGenre = 'Education';
          else if (filterGenre === 'gaming') targetGenre = 'Gaming';
          else if (filterGenre === 'music') targetGenre = 'Music';
          else if (filterGenre === 'news') targetGenre = 'News & Politics';
          else if (filterGenre === 'sports') targetGenre = 'Sports';
          else if (filterGenre === 'tech') targetGenre = 'Science & Technology';
          else if (filterGenre === 'catholic') targetGenre = 'Catholic';
          else if (filterGenre === 'challenge') targetGenre = 'Challenge/Stunts';
          else if (filterGenre === 'kids') targetGenre = 'Kids/Family';
          else targetGenre = activeFilters.genre;
          
          if (row.genre !== targetGenre) return false;
        }
        if (activeFilters.tier !== 'all' && row.tier !== activeFilters.tier) return false;
        return true;
      });
      
      if (filteredData.length === 0) return null;
      
      // Create combination heatmap
      const combinationData = {};
      const singleColorData = {};
      
      // Initialize all possible combinations to ensure we don't miss any
      const allCombos = [...new Set(filteredData.map(row => row.combo))];
      const allColumns = [...new Set(filteredData.map(row => 
        heatmapColumns === 'n_colors' ? row.nColors : row.contrastClass
      ))];
      
      console.log('🎨 Heatmap Generation Debug:', {
        filteredDataLength: filteredData.length,
        allCombos: allCombos.slice(0, 10),
        allColumns,
        heatmapColumns,
        heatmapMetric
      });
      
      filteredData.forEach(row => {
        const metric = heatmapMetric === 'views' ? row.views : row.rqs;
        const columnKey = heatmapColumns === 'n_colors' ? row.nColors : row.contrastClass;
        
        // Skip invalid metrics
        if (isNaN(metric) || metric === null || metric === undefined) return;
        
        // Combination heatmap
        const comboKey = `${row.combo}_${columnKey}`;
        if (!combinationData[comboKey]) {
          combinationData[comboKey] = {
            combo: row.combo,
            column: columnKey,
            values: [],
            examples: []
          };
        }
        combinationData[comboKey].values.push(metric);
        if (combinationData[comboKey].examples.length < 3) {
          combinationData[comboKey].examples.push({
            title: row.title,
            palette: row.palette,
            metric,
            videoId: row.videoId,
            facePercentage: row.facePercentage || 0
          });
        }
        
        // Single color heatmap
        row.families.forEach(family => {
          const colorKey = `${family}_${columnKey}`;
          if (!singleColorData[colorKey]) {
            singleColorData[colorKey] = {
              color: family,
              column: columnKey,
              withColor: [],
              withoutColor: []
            };
          }
          singleColorData[colorKey].withColor.push(metric);
        });
      });
      
      // Calculate single color contributions (with vs without)
      filteredData.forEach(row => {
        const metric = heatmapMetric === 'views' ? row.views : row.rqs;
        const columnKey = heatmapColumns === 'n_colors' ? row.nColors : row.contrastClass;
        
        // For each possible color family, check if this row contains it
        const allFamilies = ['Black', 'White', 'Gray', 'Red', 'Red-Orange', 'Orange', 'Yellow', 'Yellow-Green', 'Green', 'Green-Cyan', 'Cyan', 'Blue', 'Blue-Violet', 'Violet', 'Magenta'];
        
        allFamilies.forEach(family => {
          const colorKey = `${family}_${columnKey}`;
          if (!singleColorData[colorKey]) {
            singleColorData[colorKey] = {
              color: family,
              column: columnKey,
              withColor: [],
              withoutColor: []
            };
          }
          
          if (!row.families.includes(family)) {
            singleColorData[colorKey].withoutColor.push(metric);
          }
        });
      });
      
      // Process combination data
      const combinationTable = Object.values(combinationData).map(item => {
        const n = item.values.length;
        if (n < heatmapMinN) return null;
        
        const mean = item.values.reduce((a, b) => a + b, 0) / n;
        const sortedValues = [...item.values].sort((a, b) => a - b);
        const median = n % 2 === 0 
          ? (sortedValues[Math.floor(n / 2) - 1] + sortedValues[Math.floor(n / 2)]) / 2
          : sortedValues[Math.floor(n / 2)];
        const value = (heatmapMetric === 'views' && heatmapViewsMode === 'median') ? median : mean;
        
        return {
          combo: item.combo,
          column: item.column,
          value,
          mean,
          median,
          n,
          examples: item.examples
        };
      }).filter(Boolean);
      
      console.log('📊 Final combination table:', {
        totalCombinations: Object.keys(combinationData).length,
        validCombinations: combinationTable.length,
        minNFilter: heatmapMinN,
        sampleEntries: combinationTable.slice(0, 3)
      });
      
      // Process single color data
      const singleColorTable = Object.values(singleColorData).map(item => {
        const withN = item.withColor.length;
        const withoutN = item.withoutColor.length;
        
        if (withN < heatmapMinN || withoutN < heatmapMinN) return null;
        
        const withMean = item.withColor.reduce((a, b) => a + b, 0) / withN;
        const withoutMean = item.withoutColor.reduce((a, b) => a + b, 0) / withoutN;
        const delta = withMean - withoutMean;
        
        return {
          color: item.color,
          column: item.column,
          value: delta,
          withMean,
          withoutMean,
          withN,
          withoutN
        };
      }).filter(Boolean);
      
      return {
        combinations: combinationTable,
        singleColors: singleColorTable
      };
    } catch (error) {
      console.error('Error generating heatmap tables:', error);
      return null;
    }
  };

  // Generate color frequency analysis
  const generateColorFrequencyData = (heatmapData) => {
    if (!heatmapData || heatmapData.length === 0) return null;
    
    try {
      const filteredData = heatmapData.filter(row => {
        // Apply current filters
        if (activeFilters.genre !== 'all') {
          const filterGenre = activeFilters.genre.toLowerCase();
          let targetGenre = '';
          
          if (filterGenre === 'education') targetGenre = 'Education';
          else if (filterGenre === 'gaming') targetGenre = 'Gaming';
          else if (filterGenre === 'music') targetGenre = 'Music';
          else if (filterGenre === 'news') targetGenre = 'News & Politics';
          else if (filterGenre === 'sports') targetGenre = 'Sports';
          else if (filterGenre === 'tech') targetGenre = 'Science & Technology';
          else if (filterGenre === 'catholic') targetGenre = 'Catholic';
          else if (filterGenre === 'challenge') targetGenre = 'Challenge/Stunts';
          else if (filterGenre === 'kids') targetGenre = 'Kids/Family';
          else targetGenre = activeFilters.genre;
          
          if (row.genre !== targetGenre) return false;
        }
        if (activeFilters.tier !== 'all' && row.tier !== activeFilters.tier) return false;
        return true;
      });
      
      if (filteredData.length === 0) return null;
      
      console.log('📊 Color Frequency Analysis:', {
        totalVideos: filteredData.length,
        sampleFamilies: filteredData.slice(0, 3).map(row => row.families),
        frequencyMetric,
        frequencyGrouping
      });
      
      // Get all unique color families
      const allFamilies = [...new Set(
        filteredData.flatMap(row => row.families || [])
      )].filter(f => showNeutrals || !['Black', 'White', 'Gray'].includes(f));
      
      const colorStats = {};
      
      allFamilies.forEach(family => {
        const presentMask = filteredData.filter(row => row.families.includes(family));
        const absentMask = filteredData.filter(row => !row.families.includes(family));
        
        const nPresent = presentMask.length;
        const nAbsent = absentMask.length;
        const frequency = nPresent / filteredData.length;
        
        if (nPresent < frequencyMinN || nAbsent < frequencyMinN) {
          colorStats[family] = {
            color: family,
            frequency,
            nPresent,
            nAbsent,
            metricPresent: null,
            metricAbsent: null,
            delta: null,
            ci: null,
            insufficient: true
          };
          return;
        }
        
        // Get metric values
        const metricValues = (row) => {
          const metric = frequencyMetric === 'views' ? row.views : row.rqs;
          return isNaN(metric) ? null : metric;
        };
        
        const presentValues = presentMask.map(metricValues).filter(v => v !== null);
        const absentValues = absentMask.map(metricValues).filter(v => v !== null);
        
        if (presentValues.length === 0 || absentValues.length === 0) {
          colorStats[family] = {
            color: family,
            frequency,
            nPresent,
            nAbsent,
            metricPresent: null,
            metricAbsent: null,
            delta: null,
            ci: null,
            insufficient: true
          };
          return;
        }
        
        // Calculate statistics
        let metricPresent, metricAbsent;
        if (frequencyMetric === 'views' && frequencyViewsMode === 'median') {
          const sortedPresent = [...presentValues].sort((a, b) => a - b);
          const sortedAbsent = [...absentValues].sort((a, b) => a - b);
          metricPresent = sortedPresent[Math.floor(sortedPresent.length / 2)];
          metricAbsent = sortedAbsent[Math.floor(sortedAbsent.length / 2)];
        } else {
          metricPresent = presentValues.reduce((a, b) => a + b, 0) / presentValues.length;
          metricAbsent = absentValues.reduce((a, b) => a + b, 0) / absentValues.length;
        }
        
        const delta = metricPresent - metricAbsent;
        
        // Calculate confidence intervals
        const ci = calculateBootstrapCI(presentValues);
        
        // Group by coarse categories if needed
        const displayFamily = frequencyGrouping === 'coarse' ? getCoarseGrouping(family) : family;
        
        colorStats[displayFamily] = {
          color: displayFamily,
          originalFamily: family,
          frequency,
          nPresent,
          nAbsent,
          metricPresent,
          metricAbsent,
          delta,
          ci,
          insufficient: false,
          swatch: getColorSwatch(family),
          examples: presentMask.slice(0, 3).map(row => ({
            title: row.title,
            palette: row.palette,
            metric: metricValues(row),
            videoId: row.videoId,
            facePercentage: row.facePercentage || 0
          }))
        };
      });
      
      return Object.values(colorStats).filter(stat => stat.color);
      
    } catch (error) {
      console.error('Error generating color frequency data:', error);
      return null;
    }
  };

  // Face Analysis Data Processing
  const generateFaceAnalysisData = (videos) => {
    if (!videos || videos.length === 0) return null;

    try {
      console.log('👤 Face Analysis:', {
        totalVideos: videos.length,
        sampleWithFace: videos.filter(v => v.facePercentage > 0).length,
        faceRange: {
          min: Math.min(...videos.map(v => v.facePercentage || 0)),
          max: Math.max(...videos.map(v => v.facePercentage || 0))
        }
      });

      // Define face percentage bins
      const getBinFromFacePercentage = (facePercentage) => {
        if (faceBinScheme === 'standard') {
          if (facePercentage === 0) return { key: 'B0', label: '0% (no face)', range: [0, 0] };
          if (facePercentage <= 5) return { key: 'B1', label: '0-5%', range: [0.1, 5] };
          if (facePercentage <= 10) return { key: 'B2', label: '5-10%', range: [5, 10] };
          if (facePercentage <= 20) return { key: 'B3', label: '10-20%', range: [10, 20] };
          if (facePercentage <= 35) return { key: 'B4', label: '20-35%', range: [20, 35] };
          if (facePercentage <= 50) return { key: 'B5', label: '35-50%', range: [35, 50] };
          if (facePercentage <= 75) return { key: 'B6', label: '50-75%', range: [50, 75] };
          return { key: 'B7', label: '>75%', range: [75, 100] };
        } else if (faceBinScheme === 'fine') {
          // 12-bin scheme for finer granularity
          const binSize = 100 / 12;
          const binIndex = Math.min(11, Math.floor(facePercentage / binSize));
          const start = binIndex * binSize;
          const end = (binIndex + 1) * binSize;
          return {
            key: `F${binIndex}`,
            label: `${start.toFixed(0)}-${end.toFixed(0)}%`,
            range: [start, end]
          };
        }
      };

      // Group videos by face percentage bins
      const faceBins = {};
      const metricValues = faceMetric === 'rqs' ? 
        (video) => video.rqs : 
        (video) => video.views;

      videos.forEach(video => {
        const facePercentage = video.facePercentage || 0;
        const bin = getBinFromFacePercentage(facePercentage);
        const metric = metricValues(video);

        if (!faceBins[bin.key]) {
          faceBins[bin.key] = {
            ...bin,
            videos: [],
            metrics: []
          };
        }

        faceBins[bin.key].videos.push(video);
        faceBins[bin.key].metrics.push(metric);
      });

      // Calculate statistics for each bin
      const binStats = Object.values(faceBins).map(bin => {
        const n = bin.videos.length;
        if (n < faceMinN) {
          return {
            ...bin,
            n,
            mean: null,
            median: null,
            ci: null,
            insufficient: true,
            usageRate: (n / videos.length) * 100,
            examples: []
          };
        }

        const sortedMetrics = [...bin.metrics].sort((a, b) => a - b);
        const mean = bin.metrics.reduce((sum, val) => sum + val, 0) / n;
        const median = sortedMetrics[Math.floor(n / 2)];
        
        // Bootstrap 95% CI
        const bootstrapMeans = [];
        for (let i = 0; i < 100; i++) {
          const sample = Array.from({length: n}, () => 
            bin.metrics[Math.floor(Math.random() * n)]
          );
          bootstrapMeans.push(sample.reduce((sum, val) => sum + val, 0) / n);
        }
        bootstrapMeans.sort((a, b) => a - b);
        const ci = [
          bootstrapMeans[Math.floor(0.025 * bootstrapMeans.length)],
          bootstrapMeans[Math.floor(0.975 * bootstrapMeans.length)]
        ];

        // Get top examples
        const sortedVideos = [...bin.videos].sort((a, b) => 
          faceMetric === 'rqs' ? b.rqs - a.rqs : b.views - a.views
        );
        const examples = sortedVideos.slice(0, 3).map(video => ({
          videoId: video.videoId,
          title: video.title,
          channelName: video.channelName,
          metric: metricValues(video),
          facePercentage: video.facePercentage,
          palette: video.colors
        }));

        return {
          ...bin,
          n,
          mean,
          median,
          ci,
          insufficient: false,
          usageRate: (n / videos.length) * 100,
          examples
        };
      }).filter(bin => bin.n > 0); // Remove empty bins

      // Sort by metric performance
      const validBins = binStats.filter(bin => !bin.insufficient);
      const metricKey = faceMetric === 'rqs' ? 'mean' : 
                       (faceViewsMode === 'median' ? 'median' : 'mean');
      
      validBins.sort((a, b) => b[metricKey] - a[metricKey]);

      // Calculate baseline (overall mean/median)
      const allMetrics = videos.map(metricValues);
      const baseline = faceMetric === 'rqs' ? 
        allMetrics.reduce((sum, val) => sum + val, 0) / allMetrics.length :
        (faceViewsMode === 'median' ? 
          [...allMetrics].sort((a, b) => a - b)[Math.floor(allMetrics.length / 2)] :
          allMetrics.reduce((sum, val) => sum + val, 0) / allMetrics.length
        );

      // Add lift calculation
      binStats.forEach(bin => {
        if (!bin.insufficient) {
          const binValue = bin[metricKey];
          bin.lift = binValue - baseline;
          bin.liftPercent = ((binValue - baseline) / baseline) * 100;
        }
      });

      return {
        bins: binStats,
        validBins: validBins.slice(0, 10), // Top 10 for leaderboard
        baseline,
        totalVideos: videos.length,
        binScheme: faceBinScheme,
        metric: faceMetric,
        viewsMode: faceViewsMode
      };

    } catch (error) {
      console.error('Error generating face analysis data:', error);
      return null;
    }
  };

  // Leaderboard: Create palette signature
  const createPaletteSignature = (colorFamilies, grouping = '12_family') => {
    if (!colorFamilies || colorFamilies.length === 0) return 'Unknown';
    
    try {
      // Separate neutrals and hues
      const neutrals = colorFamilies.filter(f => ['Black', 'White', 'Gray'].includes(f));
      const hues = colorFamilies.filter(f => !['Black', 'White', 'Gray'].includes(f));
      
      // Apply grouping
      const processedFamilies = [...colorFamilies].map(f => 
        grouping === 'coarse' ? getCoarseGrouping(f) : f
      );
      
      // Get unique families in consistent order
      const uniqueNeutrals = [...new Set(processedFamilies.filter(f => ['Black', 'White', 'Gray'].includes(f)))]
        .sort((a, b) => ['Black', 'White', 'Gray'].indexOf(a) - ['Black', 'White', 'Gray'].indexOf(b));
      
      const uniqueHues = [...new Set(processedFamilies.filter(f => !['Black', 'White', 'Gray'].includes(f)))];
      
      // Limit to top 3 hues for readability
      const limitedHues = uniqueHues.slice(0, 3);
      
      // Combine in order: neutrals first, then hues
      const signature = [...uniqueNeutrals, ...limitedHues].join(' + ');
      
      return signature || 'Unknown';
    } catch (error) {
      console.warn('Error creating palette signature:', error);
      return 'Unknown';
    }
  };

  // Generate leaderboard data
  const generateLeaderboardData = (heatmapData) => {
    if (!heatmapData || heatmapData.length === 0) return null;
    
    try {
      // Apply filters
      const filteredData = heatmapData.filter(row => {
        if (activeFilters.genre !== 'all') {
          const filterGenre = activeFilters.genre.toLowerCase();
          let targetGenre = '';
          
          if (filterGenre === 'education') targetGenre = 'Education';
          else if (filterGenre === 'gaming') targetGenre = 'Gaming';
          else if (filterGenre === 'music') targetGenre = 'Music';
          else if (filterGenre === 'news') targetGenre = 'News & Politics';
          else if (filterGenre === 'sports') targetGenre = 'Sports';
          else if (filterGenre === 'tech') targetGenre = 'Science & Technology';
          else if (filterGenre === 'catholic') targetGenre = 'Catholic';
          else if (filterGenre === 'challenge') targetGenre = 'Challenge/Stunts';
          else if (filterGenre === 'kids') targetGenre = 'Kids/Family';
          else targetGenre = activeFilters.genre;
          
          if (row.genre !== targetGenre) return false;
        }
        if (activeFilters.tier !== 'all' && row.tier !== activeFilters.tier) return false;
        return true;
      });

      if (filteredData.length === 0) return null;

      // Group by palette signature or single color
      const groups = {};
      
      filteredData.forEach(video => {
        let key;
        
        if (leaderboardEntity === 'single_colors') {
          // Single color mode - create separate entries for each color family
          if (video.families && video.families.length > 0) {
            video.families.forEach(family => {
              if (!showNeutrals && ['Black', 'White', 'Gray'].includes(family)) return;
              
              const displayFamily = leaderboardGrouping === 'coarse' ? getCoarseGrouping(family) : family;
              key = displayFamily;
              
              if (!groups[key]) {
                groups[key] = {
                  signature: key,
                  type: 'single_color',
                  palette: [getColorSwatch(family)],
                  families: [family],
                  videos: [],
                  metrics: []
                };
              }
              
              groups[key].videos.push(video);
              groups[key].metrics.push(leaderboardMetric === 'rqs' ? video.rqs : video.views);
            });
          }
        } else {
          // Palette mode
          if (video.families && video.families.length > 0) {
            let filteredFamilies = video.families;
            if (!showNeutrals) {
              filteredFamilies = video.families.filter(f => !['Black', 'White', 'Gray'].includes(f));
            }
            
            if (filteredFamilies.length === 0) return; // Skip if no families after filtering
            
            key = createPaletteSignature(filteredFamilies, leaderboardGrouping);
            
            if (!groups[key]) {
              groups[key] = {
                signature: key,
                type: 'palette',
                palette: video.palette || [],
                families: filteredFamilies,
                videos: [],
                metrics: []
              };
            }
            
            groups[key].videos.push(video);
            groups[key].metrics.push(leaderboardMetric === 'rqs' ? video.rqs : video.views);
          }
        }
      });

      // Calculate statistics for each group
      const rankedGroups = Object.values(groups)
        .map(group => {
          const n = group.videos.length;
          if (n < leaderboardMinN) return null; // Filter out insufficient samples
          
          // Calculate metric
          let metricValue;
          if (leaderboardMetric === 'views' && leaderboardViewsMode === 'median') {
            const sorted = [...group.metrics].sort((a, b) => a - b);
            metricValue = sorted[Math.floor(sorted.length / 2)];
          } else {
            metricValue = group.metrics.reduce((sum, m) => sum + m, 0) / group.metrics.length;
          }
          
          // Calculate confidence interval
          const ci = leaderboardShowCI ? calculateBootstrapCI(group.metrics) : null;
          
          // Calculate usage rate
          const usageRate = (n / filteredData.length) * 100;
          
          // Get top genres using this palette
          const genreCounts = {};
          group.videos.forEach(video => {
            const genre = video.genre || 'Unknown';
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
          const topGenres = Object.entries(genreCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([genre]) => genre);

          // Get example thumbnails
          const examples = group.videos
            .sort((a, b) => (leaderboardMetric === 'rqs' ? b.rqs - a.rqs : b.views - a.views))
            .slice(0, 3)
            .map(video => ({
              videoId: video.videoId,
              title: video.title,
              channelName: video.channelName,
              metric: leaderboardMetric === 'rqs' ? video.rqs : video.views,
              palette: video.palette,
              facePercentage: video.facePercentage || 0 // Include face percentage
            }));
          
          return {
            ...group,
            n,
            metricValue,
            ci,
            usageRate,
            topGenres,
            examples,
            rank: 0 // Will be set after sorting
          };
        })
        .filter(Boolean); // Remove null entries

      // Sort and rank
      rankedGroups.sort((a, b) => {
        // Primary: metric value (descending)
        if (b.metricValue !== a.metricValue) {
          return b.metricValue - a.metricValue;
        }
        // Tie-breaker 1: sample size (larger wins)
        if (b.n !== a.n) {
          return b.n - a.n;
        }
        // Tie-breaker 2: usage rate (more common wins)
        if (b.usageRate !== a.usageRate) {
          return b.usageRate - a.usageRate;
        }
        // Tie-breaker 3: lexical order (deterministic)
        return a.signature.localeCompare(b.signature);
      });

      // Assign ranks and return top 10
      const top10 = rankedGroups.slice(0, 10).map((group, index) => ({
        ...group,
        rank: index + 1
      }));

      return {
        top10,
        totalEligible: rankedGroups.length,
        totalFiltered: filteredData.length,
        belowThreshold: Object.keys(groups).length - rankedGroups.length
      };
      
    } catch (error) {
      console.error('Error generating leaderboard data:', error);
      return null;
    }
  };

  // Generate sentiment word cloud data
  const generateSentimentWordClouds = () => {
    // Use filtered comment data based on current filters
    if (!commentData || !commentData.comments || commentData.comments.length === 0) {
      console.log('⚠️ No comment data available, using minimal mock data');
      return { positive: [], neutral: [], negative: [] };
    }

    console.log('✅ Using real comment data from API:', commentData.comments.length, 'videos with comments');
    
    // Debug: Check what channel names we have in comment data
    const commentChannelNames = [...new Set(commentData.comments.map(v => v.channel_name || v.channelName || ''))];
    console.log('📺 All channel names in comment data:', commentChannelNames);
    console.log('📺 Total unique channels with comments:', commentChannelNames.length);
    
    // Check for gaming-related channels specifically
    const gamingRelated = commentChannelNames.filter(name => 
      name.toLowerCase().includes('gaming') || 
      name.toLowerCase().includes('pewdie') ||
      name.toLowerCase().includes('jacksep') ||
      name.toLowerCase().includes('kevin') ||
      name.toLowerCase().includes('floydson') ||
      name.toLowerCase().includes('lizz')
    );
    console.log('🎮 Potential gaming channels found:', gamingRelated);
    
    const allComments = [];
    
    // Apply current genre/tier filters to comment data
    const filteredChannels = getFilteredChannels(); // Use existing filter logic
    const filteredChannelNames = new Set();
    
    // Create a more flexible channel name mapping
    filteredChannels.forEach(channel => {
      filteredChannelNames.add(channel.name);
      // Also add variations that might appear in comment data
      filteredChannelNames.add(channel.name.toLowerCase());
      filteredChannelNames.add(channel.name.replace(/\s+/g, ''));
      filteredChannelNames.add(channel.name.replace(/[^\w\s]/g, ''));
    });
    
    console.log('🎯 Available filtered channels:', Array.from(filteredChannelNames).slice(0, 10));
    console.log('🎯 Active filters:', activeFilters);
    
    commentData.comments.forEach(video => {
      const videoChannelName = video.channel_name || video.channelName || '';
      
      // Skip if video doesn't match current filters
      if (activeFilters.genre !== 'all' || activeFilters.tier !== 'all') {
        const videoChannelVariations = [
          videoChannelName,
          videoChannelName.toLowerCase(),
          videoChannelName.replace(/\s+/g, ''),
          videoChannelName.replace(/[^\w\s]/g, '')
        ];
        
        // Check if any variation matches
        const hasMatch = videoChannelVariations.some(variation => 
          filteredChannelNames.has(variation)
        );
        
        if (!hasMatch) {
          console.log('🚫 Skipping video from channel:', videoChannelName, '- not in filtered set');
          return; // Skip this video if channel doesn't match filters
        } else {
          console.log('✅ Including video from channel:', videoChannelName);
        }
      } else {
        console.log('📂 Including video from channel (no filters):', videoChannelName);
      }
      
      const sentimentScore = video.sentiment_score || 0.5;
      const comments = video.comments || [];
      const currentVideoChannelName = video.channel_name || video.channelName || '';
      
      comments.forEach(comment => {
        // Skip comments from the channel owner/creator
        const commentAuthor = comment.author || '';
        if (commentAuthor === currentVideoChannelName || 
            commentAuthor.toLowerCase() === currentVideoChannelName.toLowerCase() ||
            commentAuthor === 'MrBeast' && currentVideoChannelName === 'MrBeast' ||
            commentAuthor.includes(currentVideoChannelName) || 
            currentVideoChannelName.includes(commentAuthor)) {
          console.log('🚫 Skipping creator comment from:', commentAuthor, 'on channel:', currentVideoChannelName);
          return; // Skip creator's own comments
        }
        
        allComments.push({
          text: comment.text || comment,
          sentiment_score: sentimentScore,
          like_count: comment.like_count || 0,
          engagement: (comment.like_count || 0) + (comment.reply_count || 0),
          channel_name: currentVideoChannelName,
          author: commentAuthor
        });
      });
    });
    
    console.log('✅ Filtered comments processed:', allComments.length, 'from', filteredChannelNames.size, 'channels');
    
    if (allComments.length === 0) {
      return { positive: [], neutral: [], negative: [] };
    }
    
    return processCommentsByCategories(allComments);
  };

  const processCommentsByCategories = (allComments) => {
    // Categorize comments by sentiment score
    const positive = allComments.filter(c => c.sentiment_score > 0.6);
    const neutral = allComments.filter(c => c.sentiment_score >= 0.4 && c.sentiment_score <= 0.6);
    const negative = allComments.filter(c => c.sentiment_score < 0.4);
    
    // Extract and count words from each category
    const extractWords = (comments) => {
      const wordCounts = {};
      const wordExamples = {};
      const wordEngagement = {};
      
      try {
        comments.forEach(comment => {
          if (!comment || !comment.text) return;
          
          let words = [];
          
          // Handle different display modes
          if (sentimentDisplayMode === 'unigrams' || sentimentDisplayMode === 'both') {
            // Single words (unigrams)
            const unigrams = (comment.text || '').toLowerCase()
              .replace(/[^\w\s]/g, ' ')
              .split(/\s+/)
              .filter(word => {
                // Filter out short words
                if (word.length < 3) return false;
                
                // Filter out numbers (including mixed alphanumeric that are mostly numbers)
                if (/^\d+$/.test(word) || /^\d+[a-z]*$/.test(word) || /^[a-z]*\d+$/.test(word)) return false;
                
                // Filter out common stop words and artifacts
                const stopWords = [
                  // Common stop words
                  'the', 'and', 'you', 'for', 'are', 'with', 'this', 'that', 'was', 'but', 'not', 'have', 
                  'his', 'her', 'can', 'had', 'she', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 
                  'old', 'see', 'now', 'way', 'who', 'its', 'did', 'yes', 'been', 'each', 'than', 
                  'two', 'may', 'use', 'all', 'any', 'more', 'new', 'will', 'how', 'just', 'what',
                  'when', 'where', 'why', 'who', 'would', 'could', 'should', 'here', 'there', 'into',
                  'from', 'they', 'them', 'then', 'than', 'your', 'very', 'much', 'some', 'time',
                  'well', 'make', 'like', 'good', 'such', 'even', 'come', 'know', 'think', 'take',
                  'back', 'over', 'only', 'first', 'after', 'work', 'life', 'look', 'find', 'right',
                  'still', 'want', 'give', 'most', 'before', 'also', 'being', 'other', 'many',
                  'same', 'need', 'call', 'does', 'part', 'long', 'feel', 'fact', 'hand', 'high',
                  'last', 'next', 'place', 'state', 'week', 'year', 'years', 'best', 'great',
                  
                  // HTML/web artifacts
                  'quot', 'amp', 'nbsp', 'lt', 'gt', 'href', 'http', 'https', 'www', 'com', 'org', 'net',
                  'html', 'url', 'link', 'src', 'img', 'div', 'span', 'class', 'title', 'alt',
                  
                  // YouTube/video specific
                  'youtube', 'video', 'videos', 'channel', 'subscribe', 'comment', 'comments', 'like', 'likes',
                  'watch', 'link', 'description', 'playlist', 'upload', 'uploaded', 'views', 'view',
                  'thumbnail', 'duration', 'quality', 'resolution', 'streaming', 'stream',
                  'beast', 'mrbeast', 'mr', 'thank', 'thanks', 'please', 'sub', 'subs',
                  
                  // Common social media
                  'lol', 'omg', 'wtf', 'lmao', 'haha', 'yeah', 'yep', 'nah', 'nope', 'ok', 'okay',
                  'hahaha', 'lmfao', 'rofl', 'tbh', 'imo', 'imho', 'btw', 'fyi', 'aka',
                  
                  // Random YouTube artifacts observed
                  'got', 'bank', 'zxyjttxc', 'watch', '21efwbb48se', 'jyecrgp', 'sw8', 'shopkgs',
                  'kgs', 'kurzgesagt', 'shop', 'link', 'href', 'shipping', 'available', 'worldwide',
                  'sciency', 'products', 'designed', 'support', 'keep', 'free', 'everyone', 'getting',
                  'something', 'way', 'best', 'animations', 'internet', 'biggest', 'made', 'fastest',
                  'ever', 'talking', 'science', 'nature', 'show', 'situation', 'middle', 'world',
                  'earth', 'future', 'guys', 'weapons', 'nuclear', 'around', 'while', 'might',
                  'doing', 'great', 'work', 'excellent', 'say', 'love', 'use', 'know', 'thank',
                  'been', 'them', 'will', 'here', 'vids', 'channel'
                ];
                
                return !stopWords.includes(word);
              });
            words = words.concat(unigrams);
          }
          
          if (sentimentDisplayMode === 'bigrams' || sentimentDisplayMode === 'both') {
            // Two-word phrases (bigrams)
            const cleanText = (comment.text || '').toLowerCase().replace(/[^\w\s]/g, ' ');
            const textWords = cleanText.split(/\s+/)
              .filter(w => w.length > 2)
              .filter(word => {
                // Apply same aggressive filtering to individual words in bigrams
                if (/^\d+$/.test(word)) return false;
                if (/^\d+[a-z]*$/.test(word)) return false;
                if (/^[a-z]*\d+[a-z]*$/.test(word)) return false;
                if (/\d{3,}/.test(word)) return false;
                if (word.includes('http') || word.includes('www') || word.includes('.com')) return false;
                
                const artifactWords = [
                  // Core stop words
                  'the', 'and', 'you', 'for', 'are', 'with', 'this', 'that', 'was', 'but', 'not', 'have',
                  'his', 'her', 'can', 'had', 'she', 'one', 'our', 'out', 'day', 'get', 'has', 'him',
                  'old', 'see', 'now', 'way', 'who', 'its', 'did', 'yes', 'been', 'each', 'than',
                  'two', 'may', 'use', 'all', 'any', 'more', 'new', 'will', 'how', 'just', 'what',
                  'when', 'where', 'why', 'would', 'could', 'should', 'here', 'there', 'into',
                  'from', 'they', 'them', 'then', 'your', 'very', 'much', 'some', 'time', 'well',
                  'make', 'like', 'good', 'such', 'even', 'come', 'know', 'think', 'take', 'back',
                  'over', 'only', 'first', 'after', 'work', 'life', 'look', 'find', 'right', 'still',
                  'want', 'give', 'most', 'before', 'also', 'being', 'other', 'many', 'same', 'need',
                  // Web/HTML artifacts
                  'quot', 'amp', 'nbsp', 'href', 'http', 'https', 'www', 'com', 'org', 'net', 'link',
                  'html', 'url', 'src', 'img', 'div', 'span', 'class', 'title', 'alt', 'rel', 'target',
                  // YouTube specific
                  'youtube', 'youtu', 'video', 'videos', 'channel', 'subscribe', 'watch', 'vids',
                  'kurzgesagt', 'shop', 'shopkgs', 'kgs', 'shipping', 'available', 'worldwide',
                  'sciency', 'products', 'designed', 'love', 'support', 'keep', 'free', 'everyone',
                  // Random IDs and artifacts
                  '21efwbb48se', 'jyecrgp', 'sw8', 'amp'
                ];
                
                return !artifactWords.includes(word);
              });
              
            const bigrams = [];
            for (let i = 0; i < textWords.length - 1; i++) {
              const bigram = `${textWords[i]} ${textWords[i + 1]}`;
              // Additional filtering for common bigram patterns
              if (!bigram.includes('http') && 
                  !bigram.includes('www') && 
                  !bigram.includes('href') && 
                  !bigram.includes('quot') &&
                  !bigram.includes('amp') &&
                  !bigram.includes('kgs') &&
                  !bigram.includes('shop') &&
                  bigram.length > 6) { // Filter out very short bigrams
                bigrams.push(bigram);
              }
            }
            words = words.concat(bigrams);
          }
            
            words.forEach(word => {
              if (!word || typeof word !== 'string') return;
              
              // Additional post-processing filtering
              if (word.length < 4) return; // Increase minimum length
              if (word.includes('quot') || word.includes('href') || word.includes('http')) return;
              if (word.includes('www') || word.includes('youtube') || word.includes('com')) return;
              if (word.includes('kurzgesagt') || word.includes('shop') || word.includes('kgs')) return;
              if (word.includes('amp') || word.includes('link') || word.includes('watch')) return;
              
              // Skip common meaningless combinations
              const meaninglessWords = ['that', 'this', 'from', 'with', 'were', 'have', 'been', 'will', 'would', 'could', 'should'];
              if (meaninglessWords.includes(word)) return;
              
              if (!wordCounts[word]) {
                wordCounts[word] = 0;
                wordExamples[word] = [];
                wordEngagement[word] = [];
              }
              wordCounts[word]++;            // Ensure wordExamples[word] is still an array (defensive programming)
            if (!Array.isArray(wordExamples[word])) {
              wordExamples[word] = [];
            }
            if (!Array.isArray(wordEngagement[word])) {
              wordEngagement[word] = [];
            }
            
            if (wordExamples[word].length < 3) {
              wordExamples[word].push((comment.text || '').slice(0, 100));
            }
            wordEngagement[word].push(comment.engagement || 0);
          });
        });
      } catch (error) {
        console.error('Error in extractWords:', error);
        return [];
      }
      
      return Object.entries(wordCounts)
        .map(([word, count]) => {
          const avgEngagement = wordEngagement[word].length > 0 ? 
            wordEngagement[word].reduce((a, b) => a + b, 0) / wordEngagement[word].length : 0;
          
          // Apply weighting based on toggle
          const displayWeight = sentimentWeighting === 'engagement' ? 
            avgEngagement * count : count;
          
          return {
            text: word,
            count,
            engagement: avgEngagement,
            displayWeight,
            examples: wordExamples[word] || []
          };
        })
        .filter(word => word.count >= sentimentMinFreq)
        .sort((a, b) => b.displayWeight - a.displayWeight)
        .slice(0, sentimentMaxWords);
    };
    
    return {
      positive: extractWords(positive),
      neutral: extractWords(neutral),  
      negative: extractWords(negative)
    };
  };

  const generateMockComments = () => {
    // Fallback mock data for demonstration
    const mockComments = [];
    
    // Generate positive comments
    const positiveTexts = [
      "This is amazing! Great work!",
      "I love this video so much",
      "Awesome content as always",
      "Perfect explanation, thank you",
      "Best channel on YouTube",
      "Excellent quality and editing",
      "Incredible work, keep it up",
      "Fantastic video, learned a lot",
      "Brilliant idea and execution"
    ];
    
    const neutralTexts = [
      "When is the next video coming?",
      "Where can I find the link?",
      "How did you make this?",
      "What software do you use?",
      "Can you share the source?",
      "Music name please",
      "Make a tutorial on this",
      "When is part 2?"
    ];
    
    const negativeTexts = [
      "This video is too long",
      "Getting boring after 5 minutes",
      "Total clickbait title",
      "Music is too loud",
      "This looks fake to me",
      "Too slow paced",
      "Very confusing explanation"
    ];
    
    // Create mock comment objects
    positiveTexts.forEach(text => {
      mockComments.push({
        text,
        sentiment_score: 0.8,
        like_count: Math.floor(Math.random() * 100) + 10,
        engagement: Math.floor(Math.random() * 50) + 5
      });
    });
    
    neutralTexts.forEach(text => {
      mockComments.push({
        text,
        sentiment_score: 0.5,
        like_count: Math.floor(Math.random() * 50) + 5,
        engagement: Math.floor(Math.random() * 20) + 2
      });
    });
    
    negativeTexts.forEach(text => {
      mockComments.push({
        text,
        sentiment_score: 0.2,
        like_count: Math.floor(Math.random() * 30) + 1,
        engagement: Math.floor(Math.random() * 40) + 10
      });
    });
    
    return mockComments;
  };

  const getWordsForSentiment = (sentiment) => {
    // This function needs to work with the new word cloud data structure
    const wordClouds = generateSentimentWordClouds();
    const data = wordClouds[sentiment] || [];
    
    if (!data || data.length === 0) return [];

    let words = [...data]; // Copy the array

    // Apply frequency filter
    words = words.filter(word => word.count >= sentimentMinFreq);

    // Apply weighting
    if (sentimentWeighting === 'engagement') {
      words = words.map(word => ({
        ...word,
        displayWeight: word.count * (word.engagement || 1)
      }));
    } else {
      words = words.map(word => ({
        ...word,
        displayWeight: word.count
      }));
    }

    // Sort by display weight and limit results
    words.sort((a, b) => b.displayWeight - a.displayWeight);
    return words.slice(0, sentimentMaxWords);
  };

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
    sentiment: [
      { sentiment: 'Positive', videoCount: 150, channelCount: 12, avgViews: 2500000, totalViews: 375000000 },
      { sentiment: 'Neutral', videoCount: 200, channelCount: 15, avgViews: 1800000, totalViews: 360000000 },
      { sentiment: 'Negative', videoCount: 50, channelCount: 8, avgViews: 1200000, totalViews: 60000000 },
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

  // Handle loading and error states
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

  const charts = [
    { id: 'engagement', label: 'Channel Engagement', icon: BarChart3 },
    { id: 'genres', label: 'Genre Comparison', icon: PieIcon },
    { id: 'tiers', label: 'Tier Analysis', icon: Target },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: Activity },
    { id: 'correlation', label: 'Correlation Analysis', icon: TrendingUp },
    { id: 'thumbnails', label: 'Thumbnail Analysis', icon: Filter },
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
      
      // Gaming (expanded with potential name variations)
      'PewdiePie': 'Gaming',
      'PewDiePie': 'Gaming',
      'Jacksepticeye': 'Gaming',
      'JackSepticEye': 'Gaming',
      'Call Me Kevin': 'Gaming',
      'CallMeKevin': 'Gaming',
      'Floydson': 'Gaming', 
      'Lizz': 'Gaming',
      'Gaming': 'Gaming',
      'Lizz Gaming': 'Gaming',
      
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

  // Color mapping functions for scatter plot
  const getGenreColor = (genre) => {
    const genreColors = {
      'Challenge/Stunts': '#10B981', // Green
      'Education': '#3B82F6',        // Blue  
      'Kids/Family': '#F59E0B',      // Yellow
      'Gaming': '#EF4444',           // Red
      'Catholic': '#8B5CF6',         // Purple
    };
    return genreColors[genre] || '#6B7280'; // Gray fallback
  };

  const getTierColor = (tier) => {
    const tierColors = {
      'mega': '#DC2626',      // Red - Mega (50M+)
      'large': '#EA580C',     // Orange - Large (10M-50M)
      'mid': '#F59E0B',       // Yellow - Mid (1M-10M)
      'small': '#10B981',     // Green - Small (100K-1M)
      'new': '#3B82F6'        // Blue - New (<100K)
    };
    return tierColors[tier] || '#6B7280'; // Gray fallback
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
        // Dynamically calculate genre data from filtered channels with raw/per-subscriber support
        const genreStats = {};
        filteredData.engagement.forEach(channel => {
          const genre = getChannelGenre(channel.name);
          const subscribers = channel.subscribers || 1; // Avoid division by zero
          const isKidsFamily = genre === 'Kids/Family';
          
          if (!genreStats[genre]) {
            genreStats[genre] = { 
              totalViews: 0, 
              totalVideos: 0, 
              totalLikes: 0, 
              totalComments: 0,
              totalRqs: 0,
              channels: 0,
              totalSubscribers: 0
            };
          }
          
          // Calculate values based on view mode
          if (genreViewMode === 'raw') {
            genreStats[genre].totalViews += channel.views || 0;
            genreStats[genre].totalLikes += channel.likes || 0;
            genreStats[genre].totalComments += isKidsFamily ? 0 : (channel.comments || 0);
          } else {
            // Per-subscriber values
            genreStats[genre].totalViews += (channel.views || 0) / subscribers;
            genreStats[genre].totalLikes += (channel.likes || 0) / subscribers;
            genreStats[genre].totalComments += isKidsFamily ? 0 : (channel.comments || 0) / subscribers;
          }
          
          genreStats[genre].totalVideos += channel.videos || 0;
          genreStats[genre].totalSubscribers += subscribers;
          genreStats[genre].totalRqs += channel.videoDetails && channel.videoDetails.length > 0 
            ? channel.videoDetails.reduce((sum, video) => sum + (video.rqs || 75), 0) / channel.videoDetails.length
            : 75;
          genreStats[genre].channels += 1;
        });
        
        return Object.entries(genreStats).map(([genre, stats]) => ({
          genre,
          totalViews: Number(stats.totalViews) || 0,
          totalVideos: Number(stats.totalVideos) || 0,
          totalLikes: Number(stats.totalLikes) || 0,
          totalComments: Number(stats.totalComments) || 0,
          avgRqs: Number(stats.totalRqs / Math.max(stats.channels, 1)) || 75,
          avgEngagement: stats.totalViews > 0 ? Number(((stats.totalLikes / stats.totalViews) * 100).toFixed(2)) : 0,
          channels: Number(stats.channels) || 0,
          isPerSubscriberData: genreViewMode === 'per_subscriber'
        }));
      
      case 'tiers':
        // Dynamically calculate tier data from filtered channels with raw/per-subscriber support
        const tierStats = {
          'Mega (50M+)': { 
            totalViews: 0, 
            totalVideos: 0, 
            totalLikes: 0, 
            totalComments: 0,
            totalRqs: 0,
            channels: 0,
            totalSubscribers: 0
          },
          'Large (10M-50M)': { 
            totalViews: 0, 
            totalVideos: 0, 
            totalLikes: 0, 
            totalComments: 0,
            totalRqs: 0,
            channels: 0,
            totalSubscribers: 0
          },
          'Mid (1M-10M)': { 
            totalViews: 0, 
            totalVideos: 0, 
            totalLikes: 0, 
            totalComments: 0,
            totalRqs: 0,
            channels: 0,
            totalSubscribers: 0
          },
          'Small (100K-1M)': { 
            totalViews: 0, 
            totalVideos: 0, 
            totalLikes: 0, 
            totalComments: 0,
            totalRqs: 0,
            channels: 0,
            totalSubscribers: 0
          },
          'New (<100K)': { 
            totalViews: 0, 
            totalVideos: 0, 
            totalLikes: 0, 
            totalComments: 0,
            totalRqs: 0,
            channels: 0,
            totalSubscribers: 0
          }
        };
        
        filteredData.engagement.forEach(channel => {
          const subscribers = channel.subscribers || 1;
          const tier = getTierForChannel(channel);
          const genre = getChannelGenre(channel.name);
          const isKidsFamily = genre === 'Kids/Family';
          
          let tierName;
          if (tier === 'mega') tierName = 'Mega (50M+)';
          else if (tier === 'large') tierName = 'Large (10M-50M)';
          else if (tier === 'mid') tierName = 'Mid (1M-10M)';
          else if (tier === 'small') tierName = 'Small (100K-1M)';
          else tierName = 'New (<100K)';
          
          // Calculate values based on view mode
          if (tierViewMode === 'raw') {
            tierStats[tierName].totalViews += channel.views || 0;
            tierStats[tierName].totalLikes += channel.likes || 0;
            tierStats[tierName].totalComments += isKidsFamily ? 0 : (channel.comments || 0);
          } else {
            // Per-subscriber values
            tierStats[tierName].totalViews += (channel.views || 0) / subscribers;
            tierStats[tierName].totalLikes += (channel.likes || 0) / subscribers;
            tierStats[tierName].totalComments += isKidsFamily ? 0 : (channel.comments || 0) / subscribers;
          }
          
          tierStats[tierName].totalVideos += channel.videos || 0;
          tierStats[tierName].totalSubscribers += subscribers;
          tierStats[tierName].totalRqs += channel.videoDetails && channel.videoDetails.length > 0 
            ? channel.videoDetails.reduce((sum, video) => sum + (video.rqs || 75), 0) / channel.videoDetails.length
            : 75;
          tierStats[tierName].channels += 1;
        });
        
        return Object.entries(tierStats).map(([tier, stats]) => ({
          tier,
          totalViews: Number(stats.totalViews) || 0,
          totalVideos: Number(stats.totalVideos) || 0,
          totalLikes: Number(stats.totalLikes) || 0,
          totalComments: Number(stats.totalComments) || 0,
          avgRqs: Number(stats.totalRqs / Math.max(stats.channels, 1)) || 75,
          avgEngagement: stats.totalViews > 0 ? Number(((stats.totalLikes / stats.totalViews) * 100).toFixed(2)) : 0,
          channels: Number(stats.channels) || 0,
          isPerSubscriberData: tierViewMode === 'per_subscriber'
        })).filter(tierData => tierData.channels > 0); // Only show tiers with channels
      
      case 'sentiment':
        // Sentiment analysis data - categorize sentiment scores
        const sentimentData = {
          'Positive': { count: 0, channels: new Set(), avgViews: 0, totalViews: 0 },
          'Neutral': { count: 0, channels: new Set(), avgViews: 0, totalViews: 0 },
          'Negative': { count: 0, channels: new Set(), avgViews: 0, totalViews: 0 }
        };
        
        filteredData.engagement.forEach(channel => {
          // Process each channel's videos if available
          if (channel.videoDetails && channel.videoDetails.length > 0) {
            channel.videoDetails.forEach(video => {
              const sentimentScore = video.sentiment_score || 0.5; // Default to neutral
              const views = video.view_count || 0;
              
              let category;
              if (sentimentScore > 0.6) category = 'Positive';
              else if (sentimentScore < 0.4) category = 'Negative';
              else category = 'Neutral';
              
              sentimentData[category].count++;
              sentimentData[category].channels.add(channel.name);
              sentimentData[category].totalViews += views;
            });
          } else {
            // Fallback: use channel-level data with default neutral sentiment
            sentimentData['Neutral'].count++;
            sentimentData['Neutral'].channels.add(channel.name);
            sentimentData['Neutral'].totalViews += (channel.views || 0);
          }
        });
        
        return Object.entries(sentimentData).map(([sentiment, data]) => ({
          sentiment,
          videoCount: data.count,
          channelCount: data.channels.size,
          avgViews: data.count > 0 ? Math.round(data.totalViews / data.count) : 0,
          totalViews: data.totalViews
        })).filter(item => item.videoCount > 0);
      
      case 'correlation':
        // Correlation data from filtered channels with view mode support
        if (correlationDataMode === 'video') {
          // Video-level data
          const videoData = [];
          filteredData.engagement.forEach(channel => {
            const subscribers = channel.subscribers || 1;
            const channelGenre = getChannelGenre(channel.name);
            const channelTier = getTierForChannel(channel);
            
            // Process each video in the channel
            if (channel.videoDetails && Array.isArray(channel.videoDetails)) {
              channel.videoDetails.forEach(video => {
                // Calculate views (raw or per subscriber)
                const views = correlationViewMode === 'per_subscriber' 
                  ? (video.views || 0) / subscribers 
                  : (video.views || 0) / 1000000; // Convert to millions for raw
                
                // Calculate Y-axis metric based on selected option
                let yValue;
                switch (correlationYAxis) {
                  case 'engagement':
                    yValue = video.views > 0 ? (((video.likes || 0) + (video.comments || 0)) / video.views) * 100 : 0;
                    break;
                  case 'rqs':
                    yValue = video.rqs || 75;
                    break;
                  case 'like_ratio':
                    yValue = video.views > 0 ? ((video.likes || 0) / video.views) * 100 : 0;
                    break;
                  case 'comment_ratio':
                    yValue = video.views > 0 ? ((video.comments || 0) / video.views) * 100 : 0;
                    break;
                  case 'subscribers':
                    yValue = subscribers / 1000000; // Convert to millions
                    break;
                  default:
                    yValue = video.views > 0 ? (((video.likes || 0) + (video.comments || 0)) / video.views) * 100 : 0;
                }
                
                videoData.push({
                  views,
                  engagement: yValue,
                  name: video.title || 'Untitled Video',
                  channelName: channel.name,
                  subscribers,
                  genre: channelGenre,
                  tier: channelTier,
                  isPerSubscriberData: correlationViewMode === 'per_subscriber'
                });
              });
            }
          });
          return videoData;
        } else {
          // Channel-level data (existing logic with new Y-axis options)
          return filteredData.engagement.map(channel => {
            const subscribers = channel.subscribers || 1; // Avoid division by zero
            const genre = getChannelGenre(channel.name);
            const tier = getTierForChannel(channel);
            
            // Calculate views (raw or per subscriber)
            const views = correlationViewMode === 'per_subscriber' 
              ? (channel.views || 0) / subscribers 
              : (channel.views || 0) / 1000000; // Convert to millions for raw
            
            // Calculate Y-axis metric based on selected option
            let yValue;
            switch (correlationYAxis) {
              case 'engagement':
                yValue = channel.views > 0 ? (((channel.likes || 0) + (channel.comments || 0)) / channel.views) * 100 : 0;
                break;
              case 'rqs':
                // Calculate average RQS from video details
                if (channel.videoDetails && Array.isArray(channel.videoDetails)) {
                  const totalRqs = channel.videoDetails.reduce((sum, video) => sum + (video.rqs || 75), 0);
                  yValue = channel.videoDetails.length > 0 ? totalRqs / channel.videoDetails.length : 75;
                } else {
                  yValue = 75; // Default RQS
                }
                break;
              case 'like_ratio':
                yValue = channel.views > 0 ? ((channel.likes || 0) / channel.views) * 100 : 0;
                break;
              case 'comment_ratio':
                yValue = channel.views > 0 ? ((channel.comments || 0) / channel.views) * 100 : 0;
                break;
              case 'subscribers':
                yValue = subscribers / 1000000; // Convert to millions
                break;
              default:
                yValue = channel.views > 0 ? (((channel.likes || 0) + (channel.comments || 0)) / channel.views) * 100 : 0;
            }
            
            return {
              views,
              engagement: yValue,
              name: channel.name,
              subscribers,
              genre,
              tier,
              isPerSubscriberData: correlationViewMode === 'per_subscriber'
            };
          });
        }
      
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
              <YAxis 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
                fontSize={12}
                tickFormatter={(value) => {
                  if (genreMetricFilter === 'rqs') {
                    return value.toFixed(0);
                  } else if (genreViewMode === 'per_subscriber') {
                    return value >= 1 ? value.toFixed(1) : value.toFixed(3);
                  } else {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toString();
                  }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name, props) => {
                  // Get the data safely from the tooltip props
                  const data = props?.payload || {};
                  const isPerSub = data.isPerSubscriberData;
                  
                  // Format display based on metric and view mode
                  if (name === 'totalViews') {
                    if (isPerSub) {
                      return [`${Number(value).toFixed(3)} views/sub`, 'Views Per Subscriber'];
                    } else {
                      return [`${(value / 1000000).toFixed(1)}M views`, 'Total Views'];
                    }
                  } else if (name === 'totalLikes') {
                    if (isPerSub) {
                      return [`${Number(value).toFixed(4)} likes/sub`, 'Likes Per Subscriber'];
                    } else {
                      return [`${(value / 1000000).toFixed(1)}M likes`, 'Total Likes'];
                    }
                  } else if (name === 'totalComments') {
                    if (isPerSub) {
                      return [`${Number(value).toFixed(4)} comments/sub`, 'Comments Per Subscriber'];
                    } else {
                      return [`${(value / 1000000).toFixed(1)}M comments`, 'Total Comments'];
                    }
                  } else if (name === 'avgRqs') {
                    return [`${Number(value).toFixed(1)}`, 'Average RQS'];
                  } else if (name === 'totalVideos') {
                    return [`${value} videos`, 'Total Videos'];
                  }
                  
                  return [value, name];
                }}
              />
              {/* Conditional Bar rendering based on metric filter */}
              {(genreMetricFilter === 'all' || genreMetricFilter === 'views') && (
                <Bar dataKey="totalViews" fill="#3B82F6" name="totalViews" />
              )}
              {(genreMetricFilter === 'all' || genreMetricFilter === 'likes') && (
                <Bar dataKey="totalLikes" fill="#10B981" name="totalLikes" />
              )}
              {(genreMetricFilter === 'all' || genreMetricFilter === 'comments') && (
                <Bar dataKey="totalComments" fill="#F59E0B" name="totalComments" />
              )}
              {(genreMetricFilter === 'all' || genreMetricFilter === 'rqs') && (
                <Bar dataKey="avgRqs" fill="#8B5CF6" name="avgRqs" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'tiers':
        const tierData = getChartData('tiers') || [];
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart 
              data={tierData}
              margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="tier" 
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
                  if (tierMetricFilter === 'rqs') {
                    return value.toFixed(0);
                  } else if (tierViewMode === 'per_subscriber') {
                    return value >= 1 ? value.toFixed(1) : value.toFixed(3);
                  } else {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toString();
                  }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name, props) => {
                  // Get the data safely from the tooltip props
                  const data = props?.payload || {};
                  const isPerSub = data.isPerSubscriberData;
                  
                  // Format display based on metric and view mode
                  if (name === 'totalViews') {
                    if (isPerSub) {
                      return [`${Number(value).toFixed(3)} views/sub`, 'Views Per Subscriber'];
                    } else {
                      return [`${(value / 1000000).toFixed(1)}M views`, 'Total Views'];
                    }
                  } else if (name === 'totalLikes') {
                    if (isPerSub) {
                      return [`${Number(value).toFixed(4)} likes/sub`, 'Likes Per Subscriber'];
                    } else {
                      return [`${(value / 1000000).toFixed(1)}M likes`, 'Total Likes'];
                    }
                  } else if (name === 'totalComments') {
                    if (isPerSub) {
                      return [`${Number(value).toFixed(4)} comments/sub`, 'Comments Per Subscriber'];
                    } else {
                      return [`${(value / 1000000).toFixed(1)}M comments`, 'Total Comments'];
                    }
                  } else if (name === 'avgRqs') {
                    return [`${Number(value).toFixed(1)}`, 'Average RQS'];
                  } else if (name === 'totalVideos') {
                    return [`${value} videos`, 'Total Videos'];
                  }
                  
                  return [value, name];
                }}
              />
              {/* Conditional Bar rendering based on metric filter */}
              {(tierMetricFilter === 'all' || tierMetricFilter === 'views') && (
                <Bar dataKey="totalViews" fill="#3B82F6" name="totalViews" />
              )}
              {(tierMetricFilter === 'all' || tierMetricFilter === 'likes') && (
                <Bar dataKey="totalLikes" fill="#10B981" name="totalLikes" />
              )}
              {(tierMetricFilter === 'all' || tierMetricFilter === 'comments') && (
                <Bar dataKey="totalComments" fill="#F59E0B" name="totalComments" />
              )}
              {(tierMetricFilter === 'all' || tierMetricFilter === 'rqs') && (
                <Bar dataKey="avgRqs" fill="#8B5CF6" name="avgRqs" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'sentiment':
        const sentimentData = getChartData('sentiment') || [];
        let wordClouds;
        
        try {
          wordClouds = generateSentimentWordClouds();
        } catch (error) {
          console.error('Error generating word clouds:', error);
          wordClouds = { positive: [], neutral: [], negative: [] };
        }
        
        return (
          <div className={`${isFullscreen ? 'fixed inset-0 bg-white dark:bg-gray-900 z-50' : 'h-[500px]'} ${isFullscreen ? '' : 'overflow-y-auto'} ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}
               style={!isFullscreen ? {
                 scrollbarWidth: 'thin',
                 scrollbarColor: darkMode ? '#4B5563 #1F2937' : '#D1D5DB #F9FAFB'
               } : {}}>
            <div className={`${isFullscreen ? 'h-full flex flex-col overflow-hidden p-6' : 'p-4'} space-y-6`}>
              {/* Header with Fullscreen Toggle */}
              <div className="text-center space-y-2 relative flex-shrink-0">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`absolute top-0 right-0 p-2 rounded-md transition-colors z-10 ${
                    darkMode 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200 bg-gray-800/80' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800 bg-white/80'
                  } shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} pr-12`}>
                  💬 Comment Sentiment Analysis
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Overview of sentiment distribution + the words driving each category
                </p>
              </div>

              {/* Bar Chart */}
              <div className="flex-shrink-0">
                <ResponsiveContainer width="100%" height={isFullscreen ? 400 : 350}>
                  <BarChart 
                    data={sentimentData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis 
                      dataKey="sentiment" 
                      stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                      fontSize={12}
                      textAnchor="middle"
                    />
                    <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => {
                        if (name === 'videoCount') return [value.toLocaleString(), 'Videos'];
                        if (name === 'channelCount') return [value.toLocaleString(), 'Channels'];
                        if (name === 'avgViews') return [`${(value / 1000000).toFixed(1)}M`, 'Avg Views'];
                        if (name === 'totalViews') return [`${(value / 1000000).toFixed(1)}M`, 'Total Views'];
                        return [value, name];
                      }}
                    />
                    <Bar 
                      dataKey="videoCount" 
                      name="Video Count"
                      radius={[2, 2, 0, 0]}
                      fill="#8884d8"
                    >
                      {sentimentData.map((entry, index) => {
                        let fillColor;
                        if (entry.sentiment === 'Positive') fillColor = '#10B981'; // Green
                        else if (entry.sentiment === 'Negative') fillColor = '#EF4444'; // Red
                        else fillColor = '#FCD34D'; // Yellow for Neutral
                        
                        return <Cell key={`cell-${index}`} fill={fillColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Word Cloud Controls */}
              <div className="space-y-4 flex-shrink-0">
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  {/* Display Mode */}
                  <div className="flex items-center gap-2">
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Words:
                    </label>
                    <div className={`inline-flex rounded-lg p-1 ${
                      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                    }`}>
                      <button
                        onClick={() => setSentimentDisplayMode('unigrams')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          sentimentDisplayMode === 'unigrams'
                            ? 'bg-blue-600 text-white'
                            : darkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                        }`}
                      >
                        Single
                      </button>
                      <button
                        onClick={() => setSentimentDisplayMode('bigrams')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          sentimentDisplayMode === 'bigrams'
                            ? 'bg-blue-600 text-white'
                            : darkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                        }`}
                      >
                        Phrases
                      </button>
                      <button
                        onClick={() => setSentimentDisplayMode('both')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          sentimentDisplayMode === 'both'
                            ? 'bg-blue-600 text-white'
                            : darkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                        }`}
                      >
                        Both
                      </button>
                    </div>
                  </div>

                  {/* Weighting */}
                  <div className="flex items-center gap-2">
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Weight by:
                    </label>
                    <div className={`inline-flex rounded-lg p-1 ${
                      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                    }`}>
                      <button
                        onClick={() => setSentimentWeighting('count')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          sentimentWeighting === 'count'
                            ? 'bg-blue-600 text-white'
                            : darkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                        }`}
                      >
                        Count
                      </button>
                      <button
                        onClick={() => setSentimentWeighting('engagement')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          sentimentWeighting === 'engagement'
                            ? 'bg-blue-600 text-white'
                            : darkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                        }`}
                      >
                        Engagement
                      </button>
                    </div>
                  </div>

                  {/* Min Frequency */}
                  <div className="flex items-center gap-2">
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Min freq:
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={sentimentMinFreq}
                      onChange={(e) => setSentimentMinFreq(parseInt(e.target.value))}
                      className="w-16"
                    />
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {sentimentMinFreq}
                    </span>
                  </div>
                </div>
              </div>

              {/* Word Clouds - Visible Container */}
              <div className={`mt-8 ${isFullscreen ? 'flex-1' : ''}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Positive Word Cloud */}
                    <div className={`p-6 rounded-lg border-2 shadow-lg ${
                      darkMode ? 'bg-green-900/20 border-green-600/50' : 'bg-green-50 border-green-300'
                    }`}>
                      <h4 className={`font-semibold mb-4 text-center text-lg ${
                        darkMode ? 'text-green-200' : 'text-green-800'
                      }`}>
                        😊 Positive Comments
                      </h4>
                      <div className={`flex flex-wrap gap-2 justify-center ${isFullscreen ? 'min-h-96' : 'min-h-80'} p-4 rounded-md ${
                        darkMode ? 'bg-gray-800/30' : 'bg-white/70'
                      } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        {wordClouds.positive.map((word, index) => {
                          const maxWeight = Math.max(...wordClouds.positive.map(w => w.displayWeight));
                          const minWeight = Math.min(...wordClouds.positive.map(w => w.displayWeight));
                          const normalizedWeight = maxWeight === minWeight ? 1 : 
                            (word.displayWeight - minWeight) / (maxWeight - minWeight);
                          const fontSize = (isFullscreen ? 16 : 12) + (normalizedWeight * (isFullscreen ? 28 : 20));
                          const opacity = 0.6 + (normalizedWeight * 0.4);
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedSentimentWord(word);
                                setSentimentDrilldownOpen(true);
                              }}
                              onMouseEnter={(e) => {
                                e.target.title = `"${word.text}" - ${word.count} mentions, ${word.engagement.toFixed(1)}x engagement`;
                              }}
                              className={`px-2 py-1 rounded-md transition-all hover:scale-105 ${
                                darkMode ? 'bg-green-700/20 hover:bg-green-600/30 text-green-200' : 'bg-green-200 hover:bg-green-300 text-green-800'
                              }`}
                              style={{
                                fontSize: `${fontSize}px`,
                                opacity: opacity,
                                fontWeight: normalizedWeight > 0.7 ? 'bold' : 'normal'
                              }}
                            >
                              {word.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Neutral Word Cloud */}
                    <div className={`p-6 rounded-lg border-2 shadow-lg ${
                      darkMode ? 'bg-yellow-900/20 border-yellow-600/50' : 'bg-yellow-50 border-yellow-300'
                    }`}>
                      <h4 className={`font-semibold mb-4 text-center text-lg ${
                        darkMode ? 'text-yellow-200' : 'text-yellow-800'
                      }`}>
                        😐 Neutral Comments
                      </h4>
                      <div className={`flex flex-wrap gap-2 justify-center ${isFullscreen ? 'min-h-96' : 'min-h-80'} p-4 rounded-md ${
                        darkMode ? 'bg-gray-800/30' : 'bg-white/70'
                      } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        {wordClouds.neutral.map((word, index) => {
                          const maxWeight = Math.max(...wordClouds.neutral.map(w => w.displayWeight));
                          const minWeight = Math.min(...wordClouds.neutral.map(w => w.displayWeight));
                          const normalizedWeight = maxWeight === minWeight ? 1 : 
                            (word.displayWeight - minWeight) / (maxWeight - minWeight);
                          const fontSize = (isFullscreen ? 16 : 12) + (normalizedWeight * (isFullscreen ? 28 : 20));
                          const opacity = 0.6 + (normalizedWeight * 0.4);
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedSentimentWord(word);
                                setSentimentDrilldownOpen(true);
                              }}
                              onMouseEnter={(e) => {
                                e.target.title = `"${word.text}" - ${word.count} mentions, ${word.engagement.toFixed(1)}x engagement`;
                              }}
                              className={`px-2 py-1 rounded-md transition-all hover:scale-105 ${
                                darkMode ? 'bg-yellow-700/20 hover:bg-yellow-600/30 text-yellow-200' : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800'
                              }`}
                              style={{
                                fontSize: `${fontSize}px`,
                                opacity: opacity,
                                fontWeight: normalizedWeight > 0.7 ? 'bold' : 'normal'
                              }}
                            >
                              {word.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Negative Word Cloud */}
                    <div className={`p-6 rounded-lg border-2 shadow-lg ${
                      darkMode ? 'bg-red-900/20 border-red-600/50' : 'bg-red-50 border-red-300'
                    }`}>
                      <h4 className={`font-semibold mb-4 text-center text-lg ${
                        darkMode ? 'text-red-200' : 'text-red-800'
                      }`}>
                        😠 Negative Comments
                      </h4>
                      <div className={`flex flex-wrap gap-2 justify-center ${isFullscreen ? 'min-h-96' : 'min-h-80'} p-4 rounded-md ${
                        darkMode ? 'bg-gray-800/30' : 'bg-white/70'
                      } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        {wordClouds.negative.map((word, index) => {
                          const maxWeight = Math.max(...wordClouds.negative.map(w => w.displayWeight));
                          const minWeight = Math.min(...wordClouds.negative.map(w => w.displayWeight));
                          const normalizedWeight = maxWeight === minWeight ? 1 : 
                            (word.displayWeight - minWeight) / (maxWeight - minWeight);
                          const fontSize = (isFullscreen ? 16 : 12) + (normalizedWeight * (isFullscreen ? 28 : 20));
                          const opacity = 0.6 + (normalizedWeight * 0.4);
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedSentimentWord(word);
                                setSentimentDrilldownOpen(true);
                              }}
                              onMouseEnter={(e) => {
                                e.target.title = `"${word.text}" - ${word.count} mentions, ${word.engagement.toFixed(1)}x engagement`;
                              }}
                              className={`px-2 py-1 rounded-md transition-all hover:scale-105 ${
                                darkMode ? 'bg-red-700/20 hover:bg-red-600/30 text-red-200' : 'bg-red-200 hover:bg-red-300 text-red-800'
                              }`}
                              style={{
                                fontSize: `${fontSize}px`,
                                opacity: opacity,
                                fontWeight: normalizedWeight > 0.7 ? 'bold' : 'normal'
                              }}
                            >
                              {word.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              {/* Drill-down Panel */}
              {sentimentDrilldownOpen && selectedSentimentWord && (
                <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4`}>
                  <div className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-lg ${
                    darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-300'
                  } shadow-xl`}>
                    <div className={`p-6 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Comments mentioning "{selectedSentimentWord.text}"
                        </h3>
                        <button
                          onClick={() => setSentimentDrilldownOpen(false)}
                          className={`p-2 rounded-md hover:bg-gray-100 ${
                            darkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          ✕
                        </button>
                      </div>
                      <div className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedSentimentWord.count} mentions • {selectedSentimentWord.engagement.toFixed(1)}x average engagement
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Example Comments:
                      </h4>
                      {selectedSentimentWord.examples.map((example, index) => (
                        <div key={index} className={`p-3 rounded-lg ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            "{example}"
                          </p>
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t border-gray-600">
                        <button
                          onClick={() => setSentimentDrilldownOpen(false)}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'correlation':
        const correlationData = getChartData('correlation') || mockChartData.correlation;
        return (
          <div className="flex gap-4 h-full">
            {/* Chart Container */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart 
                  data={correlationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    type="number"
                    dataKey="views" 
                    name={correlationViewMode === 'per_subscriber' ? 'Views per Subscriber' : 'Views (M)'}
                    stroke={darkMode ? '#D1D5DB' : '#4B5563'}
                    fontSize={12}
                    tick={{ fill: darkMode ? '#D1D5DB' : '#4B5563' }}
                    label={{ 
                      value: correlationViewMode === 'per_subscriber' ? 'Views per Subscriber' : 'Views (Millions)', 
                      position: 'insideBottom', 
                      offset: -10,
                      style: { textAnchor: 'middle', fill: darkMode ? '#D1D5DB' : '#4B5563', fontSize: '12px' }
                    }}
                  />
                  <YAxis 
                    type="number"
                    dataKey="engagement" 
                    name={getYAxisLabel()}
                    stroke={darkMode ? '#D1D5DB' : '#4B5563'}
                    fontSize={12}
                    tick={{ fill: darkMode ? '#D1D5DB' : '#4B5563' }}
                    label={{ 
                      value: getYAxisLabel(), 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: darkMode ? '#D1D5DB' : '#4B5563', fontSize: '12px' }
                    }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      color: darkMode ? '#F3F4F6' : '#1F2937'
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        const viewLabel = data.isPerSubscriberData ? 'Views/Sub' : 'Views';
                        const viewValue = data.isPerSubscriberData 
                          ? `${data.views?.toFixed(3)}` 
                          : `${data.views?.toFixed(1)}M`;
                        
                        return (
                          <div className={`p-3 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
                            <p className="font-semibold mb-1">{data.name}</p>
                            {correlationDataMode === 'video' && data.channelName && (
                              <p className="text-xs text-gray-500 mb-1">Channel: {data.channelName}</p>
                            )}
                            <p className="text-sm">{`${viewLabel}: ${viewValue}`}</p>
                            <p className="text-sm">{`${getYAxisLabel().replace(' (%)', '').replace(' (Millions)', '')}: ${formatYAxisValue(data.engagement)}`}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {correlationColorMode === 'genre' ? `Genre: ${data.genre}` : `Tier: ${data.tier}`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter fill="#8B5CF6" stroke="#7C3AED" strokeWidth={1}>
                    {correlationData.map((entry, index) => {
                      const color = correlationColorMode === 'genre' 
                        ? getGenreColor(entry.genre) 
                        : getTierColor(entry.tier);
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className={`w-48 p-4 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'} rounded-lg`}>
              <h3 className="font-semibold text-sm mb-3">
                {correlationColorMode === 'genre' ? '🎨 Genres' : '🏆 Tiers'}
              </h3>
              <div className="space-y-2">
                {correlationColorMode === 'genre' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                      <span className="text-xs">Challenge/Stunts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                      <span className="text-xs">Education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EAB308' }}></div>
                      <span className="text-xs">Kids/Family</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                      <span className="text-xs">Gaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></div>
                      <span className="text-xs">Catholic</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                      <span className="text-xs">Mega (50M+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
                      <span className="text-xs">Large (10M-50M)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EAB308' }}></div>
                      <span className="text-xs">Mid (1M-10M)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
                      <span className="text-xs">Small (100K-1M)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                      <span className="text-xs">New (&lt;100K)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'thumbnails':
        // Debug the data structure
        console.log('=== THUMBNAIL DEBUG ===');
        console.log('filteredData:', filteredData);
        console.log('filteredData.engagement:', filteredData?.engagement);
        if (filteredData?.engagement?.[0]) {
          console.log('First channel:', filteredData.engagement[0]);
          console.log('First channel videoDetails:', filteredData.engagement[0].videoDetails);
          if (filteredData.engagement[0].videoDetails?.[0]) {
            console.log('First video:', filteredData.engagement[0].videoDetails[0]);
            console.log('Color palette:', filteredData.engagement[0].videoDetails[0].color_palette);
          }
        }
        
        // Sample some actual color palette data for debugging
        let sampleColorData = [];
        if (filteredData?.engagement) {
          for (let i = 0; i < Math.min(5, filteredData.engagement.length); i++) {
            const channel = filteredData.engagement[i];
            if (channel.videoDetails?.[0]) {
              sampleColorData.push({
                channel: channel.name,
                videoTitle: channel.videoDetails[0].title,
                colorPalette: channel.videoDetails[0].color_palette,
                faceArea: channel.videoDetails[0].face_area_percentage
              });
            }
          }
        }
        
        // Process thumbnail color palette data from real CSV data (Individual Videos)
        let individualVideos = [];
        let debugInfo = {
          totalChannels: 0,
          totalVideos: 0,
          videosWithColors: 0,
          parseErrors: 0,
          sampleData: []
        };
        
        // Get all channels from original data to extract videos, then filter the videos themselves
        const allChannels = originalData?.engagement || [];
        
        if (allChannels && allChannels.length > 0) {
          debugInfo.totalChannels = allChannels.length;
          
          allChannels.forEach(channel => {
            // Debug: log the first channel's structure to understand available fields
            if (debugInfo.totalChannels === 1) {
              console.log('🔍 Channel data structure:', {
                name: channel.name,
                tier: channel.tier,
                global_tier: channel.global_tier,
                genre_tier: channel.genre_tier,
                genre: channel.genre,
                category: channel.category,
                subscribers: channel.subscribers,
                availableFields: Object.keys(channel).slice(0, 20) // Show first 20 fields
              });
            }
            if (channel.videoDetails && Array.isArray(channel.videoDetails)) {
              channel.videoDetails.forEach((video, index) => {
                debugInfo.totalVideos++;
                
                // Collect sample data for debugging
                if (debugInfo.sampleData.length < 10) {
                  debugInfo.sampleData.push({
                    channel: channel.name,
                    title: video.title?.substring(0, 30),
                    colorPalette: video.color_palette,
                    dominantColors: video.dominant_colors,
                    averageRgb: video.average_rgb,
                    rqs: video.rqs,
                    views: video.views
                  });
                }
                
                // Parse color data - prioritize color_palette, then dominant_colors
                let colorData = null;
                let colorSource = '';
                
                try {
                  // First try color_palette (this has 5 colors and should be prioritized)
                  const colorPaletteStr = video.color_palette;
                  if (colorPaletteStr && colorPaletteStr !== '[]' && colorPaletteStr !== '' && colorPaletteStr !== 'null') {
                    const colorPalette = JSON.parse(colorPaletteStr);
                    if (Array.isArray(colorPalette) && colorPalette.length > 0) {
                      // Convert RGB arrays to hex
                      colorData = colorPalette.slice(0, 5).map(color => {
                        if (Array.isArray(color) && color.length >= 3) {
                          const [r, g, b] = color.map(c => Math.round(Math.max(0, Math.min(255, c))));
                          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                        }
                        return color;
                      });
                      colorSource = 'color_palette';
                    }
                  }
                  
                  // Only if color_palette failed, try dominant_colors
                  if (!colorData || colorData.length === 0) {
                    const dominantColorsStr = video.dominant_colors;
                    if (dominantColorsStr && dominantColorsStr !== '[]' && dominantColorsStr !== '' && dominantColorsStr !== 'null') {
                      const dominantColors = JSON.parse(dominantColorsStr);
                      if (Array.isArray(dominantColors) && dominantColors.length > 0) {
                        // Convert RGB arrays to hex - use actual number of colors available
                        colorData = dominantColors.slice(0, 5).map(color => {
                          if (Array.isArray(color) && color.length >= 3) {
                            const [r, g, b] = color.map(c => Math.round(Math.max(0, Math.min(255, c))));
                            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                          }
                          return color;
                        });
                        
                        colorSource = 'dominant_colors';
                      }
                    }
                  }
                  
                  // If we found color data, add this individual video
                  if (colorData && colorData.length > 0) {
                    debugInfo.videosWithColors++;
                    
                    const views = parseInt(video.views) || 0;
                    const rqs = parseFloat(video.rqs) || 0;
                    
                    // Enhanced debugging for color processing
                    if (debugInfo.videosWithColors <= 5) {
                      console.log(`🎨 Color Debug - Video ${debugInfo.videosWithColors}:`, {
                        title: video.title?.substring(0, 40),
                        colorSource: colorSource,
                        colorCount: colorData.length,
                        finalColors: colorData,
                        rawColorPalette: video.color_palette?.substring(0, 100) + '...',
                        rawDominantColors: video.dominant_colors?.substring(0, 100) + '...'
                      });
                    }
                    
                    individualVideos.push({
                      colors: colorData, // Use actual number of colors (1-5)
                      videoId: video.video_id,
                      title: video.title || 'Untitled Video',
                      channelName: channel.name,
                      views: views,
                      rqs: rqs,
                      facePercentage: video.face_area_percentage || 0, // Add face percentage
                      source: colorSource,
                      colorCount: colorData.length, // Track actual number of colors
                      // Add channel metadata for filtering (calculate tiers dynamically)
                      genre: getChannelGenre(channel.name),
                      tier: getViewTierForChannel(channel), // View-based tier for regular tier filter
                      global_tier: getGlobalTierForChannel(channel), // Global subscriber tier
                      genre_tier: getGlobalTierForChannel(channel), // Use same logic for genre tier
                      subscribers: channel.subscribers
                    });
                  }
                  
                } catch (e) {
                  debugInfo.parseErrors++;
                  console.warn('Error parsing color data for video:', video.video_id, e);
                }
              });
            }
          });
          
          // Sort individual videos by RQS (performance score)
          individualVideos.sort((a, b) => b.rqs - a.rqs);
          // Take top performing videos (limit to prevent UI slowdown)
          individualVideos = individualVideos.slice(0, 1000);
        }
        
        // Enhanced debugging
        console.log('=== THUMBNAIL ANALYSIS DEBUG (INDIVIDUAL VIDEOS) ===');
        console.log('Debug info:', debugInfo);
        console.log('Individual videos found:', individualVideos.length);
        console.log('Sample raw data:', debugInfo.sampleData);
        if (individualVideos.length > 0) {
          console.log('Sample processed videos:', individualVideos.slice(0, 3));
        }

        // Apply main page filtering and sorting to individual videos
        let filteredVideos = individualVideos;
        console.log('🎨 THUMBNAIL FILTERING DEBUG:');
        console.log('Total videos before filtering:', filteredVideos.length);
        console.log('Active filters:', activeFilters);
        if (filteredVideos.length > 0) {
          console.log('Sample video metadata:', {
            genre: filteredVideos[0].genre,
            tier: filteredVideos[0].tier,
            global_tier: filteredVideos[0].global_tier,
            genre_tier: filteredVideos[0].genre_tier
          });
        }

        // Apply filters to individual videos based on their inherited channel metadata
        if (activeFilters.genre !== 'all') {
          const filterGenre = activeFilters.genre.toLowerCase();
          let targetGenre = '';
          
          if (filterGenre === 'education') targetGenre = 'Education';
          else if (filterGenre === 'gaming') targetGenre = 'Gaming';
          else if (filterGenre === 'music') targetGenre = 'Music';
          else if (filterGenre === 'news') targetGenre = 'News & Politics';
          else if (filterGenre === 'sports') targetGenre = 'Sports';
          else if (filterGenre === 'tech') targetGenre = 'Science & Technology';
          else if (filterGenre === 'catholic') targetGenre = 'Catholic';
          else if (filterGenre === 'challenge') targetGenre = 'Challenge/Stunts';
          else if (filterGenre === 'kids') targetGenre = 'Kids/Family';
          else targetGenre = activeFilters.genre;
          
          console.log(`🔍 Filtering by genre: "${activeFilters.genre}" → "${targetGenre}"`);
          const beforeCount = filteredVideos.length;
          filteredVideos = filteredVideos.filter(video => video.genre === targetGenre);
          console.log(`Genre filter: ${beforeCount} → ${filteredVideos.length} videos`);
        }
        
        // Debug tier values before filtering
        if (filteredVideos.length > 0) {
          console.log('🎯 TIER DEBUG - Sample video tier data:', {
            tier: filteredVideos[0].tier,
            global_tier: filteredVideos[0].global_tier,
            genre_tier: filteredVideos[0].genre_tier,
            available_tiers: [...new Set(filteredVideos.slice(0, 10).map(v => v.tier))],
            available_global_tiers: [...new Set(filteredVideos.slice(0, 10).map(v => v.global_tier))],
            available_genre_tiers: [...new Set(filteredVideos.slice(0, 10).map(v => v.genre_tier))]
          });
        }
        
        // Apply tier filter to videos
        if (activeFilters.tier !== 'all') {
          console.log(`🔍 Filtering by tier: "${activeFilters.tier}"`);
          const beforeCount = filteredVideos.length;
          filteredVideos = filteredVideos.filter(video => video.tier === activeFilters.tier);
          console.log(`Tier filter: ${beforeCount} → ${filteredVideos.length} videos`);
        }
        
        // Apply global tier filter to videos
        if (activeFilters.globalTier !== 'all') {
          console.log(`🔍 Filtering by global tier: "${activeFilters.globalTier}"`);
          const beforeCount = filteredVideos.length;
          filteredVideos = filteredVideos.filter(video => video.global_tier === activeFilters.globalTier);
          console.log(`Global tier filter: ${beforeCount} → ${filteredVideos.length} videos`);
        }
        
        // Apply genre tier filter to videos
        if (activeFilters.genreTier !== 'all') {
          console.log(`🔍 Filtering by genre tier: "${activeFilters.genreTier}"`);
          const beforeCount = filteredVideos.length;
          filteredVideos = filteredVideos.filter(video => video.genre_tier === activeFilters.genreTier);
          console.log(`Genre tier filter: ${beforeCount} → ${filteredVideos.length} videos`);
        }

        console.log('🎨 Final filtered videos count:', filteredVideos.length);

        // Apply sorting based on main filter controls
        if (activeFilters.sortBy !== 'name') {
          filteredVideos.sort((a, b) => {
            switch (activeFilters.sortBy) {
              case 'views':
                return (b.views || 0) - (a.views || 0);
              case 'videos':
                // For individual videos, we don't have video count, so sort by RQS instead
                return (b.rqs || 75) - (a.rqs || 75);
              case 'engagement':
                // For individual videos, use views as proxy for engagement
                return (b.views || 0) - (a.views || 0);
              case 'rqs':
                return (b.rqs || 75) - (a.rqs || 75);
              default:
                return (a.title || '').localeCompare(b.title || '');
            }
          });
        } else {
          // Sort by title/name alphabetically
          filteredVideos.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        // Limit results for performance
        filteredVideos = filteredVideos.slice(0, 500);

        return (
          <div 
            className={`chart-section w-full overflow-y-auto overflow-x-hidden transition-all duration-300 ${
              darkMode ? 'bg-gray-900' : 'bg-gray-50'
            } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
            style={{ height: isFullscreen ? '100vh' : '500px', maxHeight: isFullscreen ? '100vh' : '500px' }}
          >
            <div className="w-full space-y-6 p-6 pb-96">
              <div className={`sticky top-0 py-4 z-10 ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              } border-b`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      🎨 Thumbnail Analysis
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Analyzing color palettes and performance metrics from YouTube thumbnails
                    </p>
                  </div>
                  
                  {/* Fullscreen Toggle Button */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                    }`}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* View Toggle Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setThumbnailAnalysisView('palette')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      thumbnailAnalysisView === 'palette'
                        ? darkMode
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-blue-600 text-white border border-blue-500'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    🎨 Palette List
                  </button>
                  
                  <button
                    onClick={() => setThumbnailAnalysisView('heatmap')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      thumbnailAnalysisView === 'heatmap'
                        ? darkMode
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-blue-600 text-white border border-blue-500'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    🔥 Heatmap
                  </button>
                  
                  <button
                    onClick={() => setThumbnailAnalysisView('frequency')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      thumbnailAnalysisView === 'frequency'
                        ? darkMode
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-blue-600 text-white border border-blue-500'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    📊 Color Frequency
                  </button>
                  
                  <button
                    onClick={() => setThumbnailAnalysisView('face_analysis')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      thumbnailAnalysisView === 'face_analysis'
                        ? darkMode
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-blue-600 text-white border border-blue-500'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    👤 Face Analysis
                  </button>
                  
                  <button
                    onClick={() => setThumbnailAnalysisView('leaderboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      thumbnailAnalysisView === 'leaderboard'
                        ? darkMode
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-blue-600 text-white border border-blue-500'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    🏆 Leaderboard
                  </button>
                </div>
              </div>
              
              {/* Main Content Container */}
              <div className={`w-full rounded-xl shadow-xl mb-96 border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
                  : 'bg-white border-gray-200 shadow-gray-300/50'
              }`}>
                <div className="p-8">
                  {/* Palette List View */}
                  {thumbnailAnalysisView === 'palette' && (
                    <>
                      <div className="mb-8">
                        <h4 className={`text-xl font-semibold mb-3 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Individual Video Color Palettes & Performance
                        </h4>
                        <p className={`text-sm leading-relaxed ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Each row shows a unique video with its extracted thumbnail color palette (1-5 actual colors), 
                          ranked by RQS performance score. Shows the real color data without artificial padding.
                    </p>
                  </div>
                  
                  {filteredVideos.length > 0 ? (
                    <div className="w-full pb-48">
                      <div className={`rounded-lg overflow-hidden border ${
                        darkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className={`${
                              darkMode ? 'bg-gray-700/80' : 'bg-gray-100/80'
                            } backdrop-blur-sm`}>
                              <th className={`text-left px-8 py-5 text-sm font-semibold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              } border-b-2 ${
                                darkMode ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                Rank
                              </th>
                              <th className={`text-left px-8 py-5 text-sm font-semibold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              } border-b-2 ${
                                darkMode ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                Thumbnail
                              </th>
                              <th className={`text-left px-8 py-5 text-sm font-semibold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              } border-b-2 ${
                                darkMode ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                Video Title
                              </th>
                              <th className={`text-left px-8 py-5 text-sm font-semibold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              } border-b-2 ${
                                darkMode ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                Color Palette (1-5 colors)
                              </th>
                              <th className={`text-left px-8 py-5 text-sm font-semibold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              } border-b-2 ${
                                darkMode ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                Views
                              </th>
                              <th className={`text-left px-8 py-5 text-sm font-semibold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              } border-b-2 ${
                                darkMode ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                Face %
                              </th>
                              <th className={`text-left px-8 py-5 text-sm font-semibold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              } border-b-2 ${
                                darkMode ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                RQS Score
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredVideos.map((video, index) => (
                              <tr key={`${video.videoId}-${index}`} className={`transition-all duration-200 border-b ${
                                darkMode 
                                  ? 'hover:bg-gray-700/50 border-gray-700/50' 
                                  : 'hover:bg-blue-50/50 border-gray-200/50'
                              }`}>
                                <td className="px-8 py-10">
                                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg ${
                                    index < 3 
                                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg'
                                      : darkMode
                                        ? 'bg-gray-600 text-gray-200'
                                        : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    #{index + 1}
                                  </div>
                                  {/* Sort indicator */}
                                  <div className={`text-xs text-center mt-1 ${
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    RQS Rank
                                  </div>
                                </td>
                                <td className="px-8 py-10">
                                  {/* YouTube thumbnail */}
                                  {(() => {
                                    const thumbnailUrl = getYouTubeThumbnail(video.videoId, 'mqdefault');
                                    return thumbnailUrl ? (
                                      <img
                                        src={thumbnailUrl}
                                        alt={video.title}
                                        className={`w-24 h-16 rounded-lg border-2 object-cover shadow-md hover:shadow-lg transition-all cursor-pointer ${
                                          darkMode ? 'border-gray-600' : 'border-gray-300'
                                        }`}
                                        onError={(e) => {
                                          // Fallback to placeholder if thumbnail fails to load
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null;
                                  })()}
                                  
                                  {/* Fallback placeholder */}
                                  {(() => {
                                    const thumbnailUrl = getYouTubeThumbnail(video.videoId, 'mqdefault');
                                    return (
                                      <div 
                                        className={`w-24 h-16 rounded-lg border-2 flex items-center justify-center ${
                                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-600'
                                        } ${thumbnailUrl ? 'hidden' : 'flex'}`}
                                        style={{
                                          background: thumbnailUrl ? undefined : `linear-gradient(45deg, ${video.colors[0] || '#gray'}, ${video.colors[1] || video.colors[0] || '#gray'})`
                                        }}
                                      >
                                        🖼️
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="px-8 py-10 max-w-xs">
                                  <div className="space-y-2">
                                    <h5 className={`font-semibold text-sm leading-tight line-clamp-2 ${
                                      darkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {video.title}
                                    </h5>
                                    <div className={`flex items-center text-xs ${
                                      darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      <span className="mr-2">📺</span>
                                      {video.channelName}
                                      {video.source && (
                                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                          video.source === 'dominant_colors' ? 'bg-green-100 text-green-800' :
                                          video.source === 'average_rgb' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-purple-100 text-purple-800'
                                        }`}>
                                          {video.source === 'dominant_colors' ? 'DOM' :
                                           video.source === 'average_rgb' ? 'AVG' : 'PAL'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-10">
                                  <div className="flex items-center space-x-4">
                                    {video.colors.map((color, colorIndex) => (
                                      <div key={colorIndex} className="group flex flex-col items-center space-y-3">
                                        <div
                                          className={`w-20 h-20 rounded-xl shadow-lg border-3 transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-xl ${
                                            darkMode ? 'border-gray-600' : 'border-gray-300'
                                          }`}
                                          style={{ backgroundColor: color }}
                                          title={`Color ${colorIndex + 1}: ${color}`}
                                        />
                                        <span className={`text-xs font-mono px-3 py-1 rounded-full transition-colors ${
                                          darkMode 
                                            ? 'bg-gray-700 text-gray-300 group-hover:bg-gray-600' 
                                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                        }`}>
                                          {color}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-8 py-10">
                                  <div className="flex flex-col space-y-1">
                                    <span className={`text-xl font-bold ${
                                      darkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {video.views >= 1000000 
                                        ? `${(video.views / 1000000).toFixed(1)}M`
                                        : video.views >= 1000
                                          ? `${(video.views / 1000).toFixed(1)}K`
                                          : video.views.toLocaleString()}
                                    </span>
                                    <span className={`text-xs ${
                                      darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      views
                                    </span>
                                  </div>
                                </td>
                                <td className="px-8 py-10">
                                  <div className="flex flex-col items-center space-y-2">
                                    {/* Face percentage visualization */}
                                    <div className="relative w-16 h-16">
                                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                      }`}>
                                        😊
                                      </div>
                                      {/* Face percentage overlay */}
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`text-xs font-bold px-1 py-0.5 rounded ${
                                          video.facePercentage >= 20 
                                            ? 'bg-green-500 text-white' 
                                            : video.facePercentage >= 10
                                              ? 'bg-yellow-500 text-yellow-900'
                                              : 'bg-red-500 text-white'
                                        }`}>
                                          {video.facePercentage ? `${video.facePercentage.toFixed(0)}%` : '0%'}
                                        </div>
                                      </div>
                                    </div>
                                    <div className={`text-xs text-center ${
                                      darkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                      Face Area
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-10">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex flex-col space-y-2">
                                      <div className={`flex-1 rounded-full h-4 shadow-inner ${
                                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                      }`}>
                                        <div
                                          className={`h-4 rounded-full shadow-sm transition-all duration-700 relative overflow-hidden ${
                                            video.rqs >= 80 
                                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                              : video.rqs >= 60
                                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                                : video.rqs >= 40
                                                  ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                                  : 'bg-gradient-to-r from-red-400 to-red-600'
                                          }`}
                                          style={{
                                            width: `${Math.min(100, video.rqs)}%`
                                          }}
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className={`text-lg font-bold ${
                                          darkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                          {video.rqs.toFixed(1)}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          video.rqs >= 80
                                            ? 'bg-green-100 text-green-800'
                                            : video.rqs >= 60
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : video.rqs >= 40
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                          {video.rqs >= 80 ? 'Excellent' : 
                                           video.rqs >= 60 ? 'Good' : 
                                           video.rqs >= 40 ? 'Fair' : 'Poor'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-20 rounded-lg ${
                      darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'
                    }`}>
                      <div className="text-8xl mb-6">🎨</div>
                      <h5 className={`text-xl font-semibold mb-3 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        No color palette data available
                      </h5>
                      <div className={`text-sm space-y-2 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <p>Debug Information:</p>
                        <p>• Total videos processed: {debugInfo.totalVideos}</p>
                        <p>• Individual videos found: {individualVideos.length}</p>
                        <p>• Filtered videos shown: {filteredVideos.length}</p>
                        <p>• Parse errors: {debugInfo.parseErrors}</p>
                        <p className="mt-4 font-medium">
                          {debugInfo.totalVideos > 0 
                            ? debugInfo.videosWithColors === 0 
                              ? "All color_palette fields appear to be empty []" 
                              : individualVideos.length === 0
                                ? "Color palettes found but filtered out"
                                : "Try adjusting your search or filter criteria"
                            : "No video data loaded"}
                        </p>
                        <details className="mt-4">
                          <summary className="cursor-pointer font-medium">Sample Raw Data</summary>
                          <pre className={`mt-2 p-3 rounded text-xs overflow-x-auto ${
                            darkMode ? 'bg-gray-800' : 'bg-gray-100'
                          }`}>
                            {JSON.stringify(debugInfo.sampleData.slice(0, 3), null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  )}
                    </>
                  )}

                  {/* Heatmap View */}
                  {thumbnailAnalysisView === 'heatmap' && (
                    <>
                      {/* Heatmap Controls */}
                      <div className="mb-6 space-y-4">
                        <div className="flex flex-wrap gap-4">
                          {/* Metric Toggle */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Metric:
                            </label>
                            <select
                              value={heatmapMetric}
                              onChange={(e) => setHeatmapMetric(e.target.value)}
                              className={`px-3 py-1 rounded border text-sm ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="rqs">RQS Score</option>
                              <option value="views">Views</option>
                            </select>
                          </div>

                          {/* Views Mode (only when views selected) */}
                          {heatmapMetric === 'views' && (
                            <div className="flex items-center gap-2">
                              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Views Mode:
                              </label>
                              <select
                                value={heatmapViewsMode}
                                onChange={(e) => setHeatmapViewsMode(e.target.value)}
                                className={`px-3 py-1 rounded border text-sm ${
                                  darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="avg">Average</option>
                                <option value="median">Median</option>
                              </select>
                            </div>
                          )}

                          {/* Columns Toggle */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Group by:
                            </label>
                            <select
                              value={heatmapColumns}
                              onChange={(e) => setHeatmapColumns(e.target.value)}
                              className={`px-3 py-1 rounded border text-sm ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="n_colors"># of Colors</option>
                              <option value="contrast">Contrast Level</option>
                            </select>
                          </div>

                          {/* Min N Slider */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Min n:
                            </label>
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={heatmapMinN}
                              onChange={(e) => setHeatmapMinN(parseInt(e.target.value))}
                              className="w-20"
                            />
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {heatmapMinN}
                            </span>
                          </div>
                        </div>

                        {/* Heatmap Type Toggle */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setHeatmapType('combinations')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              heatmapType === 'combinations'
                                ? 'bg-blue-600 text-white'
                                : darkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            🎨 Color Combinations
                          </button>
                          <button
                            onClick={() => setHeatmapType('single_colors')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              heatmapType === 'single_colors'
                                ? 'bg-blue-600 text-white'
                                : darkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            🎯 Single Color Impact
                          </button>
                        </div>
                      </div>

                      {(() => {
                        // Process heatmap data from the current filtered videos
                        const heatmapData = processHeatmapData(filteredVideos);
                        const heatmapTables = heatmapData ? generateHeatmapTables(heatmapData) : null;
                        
                        if (!heatmapTables) {
                          return (
                            <div className={`text-center py-20 rounded-lg ${
                              darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'
                            }`}>
                              <div className="text-6xl mb-4">🔥</div>
                              <h5 className={`text-lg font-semibold mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                No Heatmap Data Available
                              </h5>
                              <p className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Try adjusting filters or lowering the minimum sample size
                              </p>
                            </div>
                          );
                        }

                        const currentTable = heatmapType === 'combinations' 
                          ? heatmapTables.combinations 
                          : heatmapTables.singleColors;

                        console.log('🎨 Heatmap Tables Debug:', {
                          heatmapType,
                          combinationsCount: heatmapTables.combinations?.length || 0,
                          singleColorsCount: heatmapTables.singleColors?.length || 0,
                          currentTableLength: currentTable?.length || 0,
                          sampleRows: currentTable?.slice(0, 3) || []
                        });

                        if (!currentTable || currentTable.length === 0) {
                          return (
                            <div className={`text-center py-20 rounded-lg ${
                              darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'
                            }`}>
                              <div className="text-6xl mb-4">📊</div>
                              <h5 className={`text-lg font-semibold mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Insufficient Data
                              </h5>
                              <p className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Need more samples (min: {heatmapMinN}) for this view
                              </p>
                            </div>
                          );
                        }

                        // Get unique columns and rows for the grid
                        const columns = [...new Set(currentTable.map(item => item.column))].sort((a, b) => {
                          if (heatmapColumns === 'n_colors') {
                            return Number(a) - Number(b);
                          }
                          // For contrast: Low, Mid, High
                          const order = { 'Low': 1, 'Mid': 2, 'High': 3 };
                          return (order[a] || 999) - (order[b] || 999);
                        });
                        const rows = [...new Set(currentTable.map(item => 
                          heatmapType === 'combinations' ? item.combo : item.color
                        ))].sort((a, b) => {
                          // Sort combinations by performance (best first)
                          if (heatmapType === 'combinations') {
                            const aAvg = currentTable.filter(item => item.combo === a).reduce((sum, item) => sum + item.value, 0) / currentTable.filter(item => item.combo === a).length;
                            const bAvg = currentTable.filter(item => item.combo === b).reduce((sum, item) => sum + item.value, 0) / currentTable.filter(item => item.combo === b).length;
                            return bAvg - aAvg;
                          }
                          // Sort colors alphabetically for single color view
                          return a.localeCompare(b);
                        });

                        // Calculate value range for color scaling
                        const values = currentTable.map(item => item.value).filter(v => !isNaN(v));
                        const minValue = Math.min(...values);
                        const maxValue = Math.max(...values);
                        const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));

                        const getHeatmapColor = (value) => {
                          if (isNaN(value)) return darkMode ? 'bg-gray-700' : 'bg-gray-200';
                          
                          if (heatmapType === 'single_colors') {
                            // Diverging color scale for contributions (red-white-green)
                            const intensity = Math.min(Math.abs(value) / absMax, 1);
                            const colorStrength = Math.max(1, Math.min(5, Math.ceil(intensity * 5)));
                            
                            if (value > 0) {
                              // Positive contribution (green shades)
                              const greenShades = ['bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500'];
                              return greenShades[colorStrength - 1];
                            } else {
                              // Negative contribution (red shades)
                              const redShades = ['bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500'];
                              return redShades[colorStrength - 1];
                            }
                          } else {
                            // Sequential color scale for absolute performance (blue)
                            const normalized = Math.min((value - minValue) / (maxValue - minValue), 1);
                            const colorStrength = Math.max(1, Math.min(5, Math.ceil(normalized * 5)));
                            const blueShades = ['bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500'];
                            return blueShades[colorStrength - 1];
                          }
                        };

                        return (
                          <div className="space-y-4">
                            {/* Heatmap Grid */}
                            <div className="overflow-x-auto">
                              <table className={`w-full border-collapse rounded-lg overflow-hidden ${
                                darkMode ? 'border border-gray-600' : 'border border-gray-300'
                              }`}>
                                <thead>
                                  <tr className={`${
                                    darkMode ? 'bg-gray-700/80' : 'bg-gray-100/80'
                                  }`}>
                                    <th className={`text-left px-4 py-3 text-sm font-semibold ${
                                      darkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                      {heatmapType === 'combinations' ? 'Color Combination' : 'Color Family'}
                                    </th>
                                    {columns.map(col => (
                                      <th key={col} className={`text-center px-4 py-3 text-sm font-semibold ${
                                        darkMode ? 'text-gray-200' : 'text-gray-800'
                                      }`}>
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map(row => (
                                    <tr key={row} className={`border-t ${
                                      darkMode ? 'border-gray-600' : 'border-gray-200'
                                    }`}>
                                      <td className={`px-4 py-3 font-medium text-sm ${
                                        darkMode ? 'text-gray-200' : 'text-gray-800'
                                      }`}>
                                        {row}
                                      </td>
                                      {columns.map(col => {
                                        const item = currentTable.find(item => 
                                          (heatmapType === 'combinations' ? item.combo : item.color) === row && 
                                          item.column === col
                                        );
                                        
                                        if (!item) {
                                          return (
                                            <td key={col} className={`px-4 py-3 text-center text-sm ${
                                              darkMode ? 'bg-gray-700/30 text-gray-500' : 'bg-gray-100/30 text-gray-400'
                                            }`}>
                                              -
                                            </td>
                                          );
                                        }

                                        return (
                                          <td
                                            key={col}
                                            className={`px-4 py-3 text-center text-sm cursor-pointer transition-all hover:scale-105 ${
                                              getHeatmapColor(item.value)
                                            } text-gray-900 font-semibold shadow-sm`}
                                            onClick={() => setSelectedHeatmapCell(item)}
                                            title={
                                              heatmapType === 'combinations'
                                                ? `${item.combo} (${col}): ${item.value.toFixed(2)} (n=${item.n})`
                                                : `${item.color} impact: ${item.value > 0 ? '+' : ''}${item.value.toFixed(2)} (n=${item.withN}/${item.withoutN})`
                                            }
                                          >
                                            <div className="font-bold text-base">
                                              {heatmapType === 'single_colors' && item.value > 0 ? '+' : ''}
                                              {item.value.toFixed(1)}
                                            </div>
                                            <div className="text-xs opacity-75 font-medium">
                                              n={heatmapType === 'combinations' ? item.n : item.withN}
                                            </div>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Legend */}
                            <div className={`p-4 rounded-lg ${
                              darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
                            }`}>
                              <h6 className={`text-sm font-semibold mb-2 ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                Reading the Heatmap
                              </h6>
                              <div className="text-xs space-y-1">
                                {heatmapType === 'combinations' ? (
                                  <>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • <strong>Higher values</strong> (darker blue) = better performance
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • Each cell shows {heatmapMetric === 'rqs' ? 'average RQS score' : `${heatmapViewsMode} views`}
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • Click cells to see example thumbnails
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • <strong>Green</strong> = positive impact when color is present
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • <strong>Red</strong> = negative impact when color is present
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • Values show difference: with color - without color
                                    </p>
                                  </>
                                )}
                                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                  • Gray cells have insufficient data (n &lt; {heatmapMinN})
                                </p>
                              </div>
                            </div>

                            {/* Selected Cell Details */}
                            {selectedHeatmapCell && (
                              <div className={`p-4 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-800 border-gray-600' 
                                  : 'bg-white border-gray-300'
                              }`}>
                                <div className="flex justify-between items-start mb-3">
                                  <h6 className={`text-lg font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-800'
                                  }`}>
                                    {heatmapType === 'combinations' 
                                      ? selectedHeatmapCell.combo 
                                      : `${selectedHeatmapCell.color} Impact`
                                    } ({selectedHeatmapCell.column})
                                  </h6>
                                  <button
                                    onClick={() => setSelectedHeatmapCell(null)}
                                    className={`text-sm px-2 py-1 rounded ${
                                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    ✕
                                  </button>
                                </div>
                                
                                {heatmapType === 'combinations' ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          {heatmapMetric === 'rqs' ? 'Avg RQS' : `${heatmapViewsMode.charAt(0).toUpperCase() + heatmapViewsMode.slice(1)} Views`}
                                        </div>
                                        <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {selectedHeatmapCell.value.toLocaleString()}
                                        </div>
                                      </div>
                                      <div>
                                        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Sample Size
                                        </div>
                                        <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {selectedHeatmapCell.n}
                                        </div>
                                      </div>
                                      <div>
                                        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Median
                                        </div>
                                        <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {selectedHeatmapCell.median?.toFixed(1) || 'N/A'}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {selectedHeatmapCell.examples && selectedHeatmapCell.examples.length > 0 && (
                                      <div>
                                        <h7 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Example Thumbnails:
                                        </h7>
                                        <div className="mt-2 space-y-2">
                                          {selectedHeatmapCell.examples.map((example, idx) => {
                                            const thumbnailUrl = getYouTubeThumbnail(example.videoId, 'mqdefault');
                                            return (
                                              <div key={idx} className={`p-3 rounded flex items-center gap-3 ${
                                                darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
                                              }`}>
                                                {/* Thumbnail */}
                                                {thumbnailUrl ? (
                                                  <img
                                                    src={thumbnailUrl}
                                                    alt={example.title}
                                                    className={`w-16 h-10 rounded border object-cover flex-shrink-0 ${
                                                      darkMode ? 'border-gray-600' : 'border-gray-300'
                                                    }`}
                                                    onError={(e) => {
                                                      e.target.style.display = 'none';
                                                      e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                  />
                                                ) : null}
                                                
                                                {/* Fallback placeholder */}
                                                <div 
                                                  className={`w-16 h-10 rounded border flex items-center justify-center text-xs flex-shrink-0 ${
                                                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-600'
                                                  } ${thumbnailUrl ? 'hidden' : 'flex'}`}
                                                  style={{
                                                    background: thumbnailUrl ? undefined : `linear-gradient(45deg, ${example.palette?.[0] || '#gray'}, ${example.palette?.[1] || example.palette?.[0] || '#gray'})`
                                                  }}
                                                >
                                                  🖼️
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex gap-1">
                                                      {example.palette?.map((color, colorIdx) => (
                                                        <div
                                                          key={colorIdx}
                                                          className="w-3 h-3 rounded border border-gray-400"
                                                          style={{ backgroundColor: color }}
                                                          title={color}
                                                        />
                                                      ))}
                                                    </div>
                                                    <span className={`font-medium text-xs ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                      {heatmapMetric === 'rqs' ? example.metric.toFixed(1) : example.metric.toLocaleString()} 
                                                      {heatmapMetric === 'rqs' ? ' RQS' : ' views'}
                                                    </span>
                                                    {example.facePercentage !== undefined && (
                                                      <span className={`text-xs px-1 py-0.5 rounded ${
                                                        example.facePercentage >= 20 ? 'bg-green-500 text-white' :
                                                        example.facePercentage >= 10 ? 'bg-yellow-500 text-yellow-900' :
                                                        'bg-red-500 text-white'
                                                      }`}>
                                                        👤{example.facePercentage.toFixed(0)}%
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {example.title}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Impact
                                        </div>
                                        <div className={`text-lg font-bold ${
                                          selectedHeatmapCell.value > 0 
                                            ? 'text-green-500' 
                                            : selectedHeatmapCell.value < 0 
                                              ? 'text-red-500' 
                                              : darkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                          {selectedHeatmapCell.value > 0 ? '+' : ''}{selectedHeatmapCell.value.toFixed(2)}
                                        </div>
                                      </div>
                                      <div>
                                        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          With Color
                                        </div>
                                        <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {selectedHeatmapCell.withMean.toFixed(1)} (n={selectedHeatmapCell.withN})
                                        </div>
                                      </div>
                                      <div>
                                        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Without Color  
                                        </div>
                                        <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {selectedHeatmapCell.withoutMean.toFixed(1)} (n={selectedHeatmapCell.withoutN})
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {/* Color Frequency View */}
                  {thumbnailAnalysisView === 'frequency' && (
                    <>
                      {/* Color Frequency Controls */}
                      <div className="mb-6 space-y-4">
                        <div className="flex flex-wrap gap-4">
                          {/* Metric Toggle */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Metric:
                            </label>
                            <select
                              value={frequencyMetric}
                              onChange={(e) => setFrequencyMetric(e.target.value)}
                              className={`px-3 py-1 rounded border text-sm ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="rqs">RQS Score</option>
                              <option value="views">Views</option>
                            </select>
                          </div>

                          {/* Views Mode */}
                          {frequencyMetric === 'views' && (
                            <div className="flex items-center gap-2">
                              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Mode:
                              </label>
                              <select
                                value={frequencyViewsMode}
                                onChange={(e) => setFrequencyViewsMode(e.target.value)}
                                className={`px-3 py-1 rounded border text-sm ${
                                  darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="avg">Average</option>
                                <option value="median">Median</option>
                              </select>
                            </div>
                          )}

                          {/* Grouping Toggle */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Grouping:
                            </label>
                            <select
                              value={frequencyGrouping}
                              onChange={(e) => setFrequencyGrouping(e.target.value)}
                              className={`px-3 py-1 rounded border text-sm ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="12_family">12 Color Families</option>
                              <option value="coarse">Warm/Cool/Neutral</option>
                            </select>
                          </div>

                          {/* Min N Slider */}
                          <div className="flex items-center gap-2">
                            <label 
                              className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                              title="Minimum number of videos that must contain a color for it to be included in the analysis. Lower values show more colors but may be less statistically reliable."
                            >
                              Min n:
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={frequencyMinN}
                              onChange={(e) => setFrequencyMinN(parseInt(e.target.value))}
                              className="w-20"
                              title={`Currently requiring at least ${frequencyMinN} videos to contain each color`}
                            />
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {frequencyMinN}
                            </span>
                          </div>

                          {/* Show Neutrals Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showNeutrals}
                              onChange={(e) => setShowNeutrals(e.target.checked)}
                              className="rounded"
                            />
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Show Neutrals
                            </span>
                          </label>
                        </div>

                        {/* Explanation for Min n */}
                        <div className={`p-3 rounded text-xs ${
                          darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
                        }`}>
                          <p>
                            <strong>Min n:</strong> Minimum sample size for each color. 
                            Set to 1 to include all colors (even rare ones), 
                            or higher values (like 30+) for more statistically reliable results.
                          </p>
                        </div>

                        {/* View Type Toggle */}
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setFrequencyView('bubble')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              frequencyView === 'bubble'
                                ? 'bg-blue-600 text-white'
                                : darkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            🫧 Frequency-Performance
                          </button>
                          <button
                            onClick={() => setFrequencyView('ranked')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              frequencyView === 'ranked'
                                ? 'bg-blue-600 text-white'
                                : darkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            📊 Ranked Impact
                          </button>
                          <button
                            onClick={() => setFrequencyView('composition')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              frequencyView === 'composition'
                                ? 'bg-blue-600 text-white'
                                : darkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            🎨 Composition
                          </button>
                        </div>
                      </div>

                      {(() => {
                        // Process color frequency data
                        const heatmapData = processHeatmapData(filteredVideos);
                        const frequencyData = heatmapData ? generateColorFrequencyData(heatmapData) : null;
                        
                        if (!frequencyData || frequencyData.length === 0) {
                          return (
                            <div className={`text-center py-20 rounded-lg ${
                              darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'
                            }`}>
                              <div className="text-6xl mb-4">📊</div>
                              <h5 className={`text-lg font-semibold mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                No Frequency Data Available
                              </h5>
                              <p className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Try adjusting filters or lowering the minimum sample size
                              </p>
                            </div>
                          );
                        }

                        const validData = frequencyData.filter(d => !d.insufficient);
                        const insufficientData = frequencyData.filter(d => d.insufficient);

                        if (frequencyView === 'bubble') {
                          return (
                            <div className="space-y-6">
                              {/* Bubble Chart */}
                              <div className={`p-6 rounded-lg border ${
                                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                              }`}>
                                <h6 className={`text-lg font-semibold mb-4 ${
                                  darkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                  Frequency vs Performance Impact
                                </h6>
                                
                                {/* SVG Bubble Chart */}
                                <div className="w-full" style={{ height: '500px' }}>
                                  <svg width="100%" height="100%" viewBox="0 0 800 500">
                                    {/* Grid lines */}
                                    <defs>
                                      <pattern id="grid" width="80" height="50" patternUnits="userSpaceOnUse">
                                        <path d="M 80 0 L 0 0 0 50" fill="none" stroke={darkMode ? '#374151' : '#E5E7EB'} strokeWidth="1"/>
                                      </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                    
                                    {/* Axes */}
                                    <line x1="80" y1="450" x2="750" y2="450" stroke={darkMode ? '#6B7280' : '#4B5563'} strokeWidth="2"/>
                                    <line x1="80" y1="50" x2="80" y2="450" stroke={darkMode ? '#6B7280' : '#4B5563'} strokeWidth="2"/>
                                    
                                    {/* Quadrant labels */}
                                    <text x="200" y="80" fill={darkMode ? '#9CA3AF' : '#6B7280'} fontSize="12" fontWeight="bold">
                                      Rare but Helpful
                                    </text>
                                    <text x="550" y="80" fill={darkMode ? '#9CA3AF' : '#6B7280'} fontSize="12" fontWeight="bold">
                                      Common & Helpful
                                    </text>
                                    <text x="200" y="430" fill={darkMode ? '#9CA3AF' : '#6B7280'} fontSize="12" fontWeight="bold">
                                      Rare & Hurts
                                    </text>
                                    <text x="550" y="430" fill={darkMode ? '#9CA3AF' : '#6B7280'} fontSize="12" fontWeight="bold">
                                      Common but Hurts
                                    </text>
                                    
                                    {/* Zero line */}
                                    <line x1="80" y1="250" x2="750" y2="250" stroke={darkMode ? '#6B7280' : '#9CA3AF'} strokeWidth="1" strokeDasharray="5,5"/>
                                    
                                    {/* Axis labels */}
                                    <text x="415" y="485" textAnchor="middle" fill={darkMode ? '#D1D5DB' : '#4B5563'} fontSize="14" fontWeight="semibold">
                                      Frequency (% of thumbnails using this color)
                                    </text>
                                    <text x="25" y="250" textAnchor="middle" fill={darkMode ? '#D1D5DB' : '#4B5563'} fontSize="14" fontWeight="semibold" transform="rotate(-90 25 250)">
                                      Performance Impact (Δ {frequencyMetric === 'rqs' ? 'RQS' : 'Views'})
                                    </text>
                                    
                                    {/* Bubbles */}
                                    {validData.map((d, idx) => {
                                      const x = 80 + (d.frequency * 670); // Scale to chart width
                                      const maxDelta = Math.max(...validData.map(item => Math.abs(item.delta)));
                                      const y = 250 - (d.delta / maxDelta * 180); // Scale to chart height, center at 250
                                      const r = Math.max(5, Math.min(30, Math.sqrt(d.nPresent) * 2)); // Bubble size based on sample size
                                      
                                      return (
                                        <g key={d.color}>
                                          <circle
                                            cx={x}
                                            cy={y}
                                            r={r}
                                            fill={d.swatch}
                                            stroke={darkMode ? '#1F2937' : '#FFFFFF'}
                                            strokeWidth="2"
                                            opacity="0.8"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setSelectedFrequencyColor(d)}
                                          />
                                          <text
                                            x={x}
                                            y={y + r + 15}
                                            textAnchor="middle"
                                            fill={darkMode ? '#D1D5DB' : '#4B5563'}
                                            fontSize="10"
                                            fontWeight="medium"
                                          >
                                            {d.color}
                                          </text>
                                        </g>
                                      );
                                    })}
                                  </svg>
                                </div>
                                
                                {/* Legend */}
                                <div className={`mt-4 p-4 rounded ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                                  <div className="text-sm space-y-1">
                                    <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                      Reading the Chart:
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • <strong>X-axis:</strong> How often this color appears in thumbnails
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • <strong>Y-axis:</strong> Performance boost when color is present vs absent
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • <strong>Bubble size:</strong> Sample size (larger = more reliable)
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • <strong>Top-right quadrant:</strong> Colors to keep using and lean into
                                    </p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                      • <strong>Top-left quadrant:</strong> Untapped opportunities (rare but helpful)
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Insufficient data warning */}
                              {insufficientData.length > 0 && (
                                <div className={`p-4 rounded border-l-4 ${
                                  darkMode 
                                    ? 'bg-yellow-900/20 border-yellow-600 text-yellow-200' 
                                    : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                                }`}>
                                  <p className="text-sm font-medium mb-1">
                                    Insufficient Data ({insufficientData.length} colors):
                                  </p>
                                  <p className="text-xs">
                                    {insufficientData.map(d => d.color).join(', ')} need at least {frequencyMinN} samples each.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (frequencyView === 'ranked') {
                          const rankedData = [...validData].sort((a, b) => b.delta - a.delta);
                          
                          return (
                            <div className="space-y-4">
                              <h6 className={`text-lg font-semibold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                Ranked by Performance Impact
                              </h6>
                              
                              {rankedData.map((d, idx) => (
                                <div
                                  key={d.color}
                                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                    darkMode 
                                      ? 'bg-gray-800 border-gray-600 hover:border-gray-500' 
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => setSelectedFrequencyColor(d)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${
                                          idx < 3 
                                            ? 'text-yellow-500' 
                                            : darkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                          #{idx + 1}
                                        </span>
                                        <div
                                          className="w-6 h-6 rounded border-2 border-gray-400"
                                          style={{ backgroundColor: d.swatch }}
                                        />
                                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                          {d.color}
                                        </span>
                                      </div>
                                      <div className="text-sm space-x-4">
                                        <span className={`${d.delta > 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>
                                          {d.delta > 0 ? '+' : ''}{d.delta.toFixed(2)} {frequencyMetric === 'rqs' ? 'RQS' : 'views'}
                                        </span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                          {(d.frequency * 100).toFixed(1)}% usage
                                        </span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                          n={d.nPresent}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Impact bar */}
                                    <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${d.delta > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{
                                          width: `${Math.min(100, Math.abs(d.delta) / Math.max(...rankedData.map(item => Math.abs(item.delta))) * 100)}%`
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        if (frequencyView === 'composition') {
                          // Debug: Let's see what data we have
                          console.log('Composition debug - sample video:', filteredVideos[0]);
                          
                          // Group data for composition view with proper percentages
                          const genreData = {};
                          const colorTotals = {};
                          
                          filteredVideos.forEach(video => {
                            const genre = video.genre || 'Unknown';
                            if (!genreData[genre]) {
                              genreData[genre] = { total: 0, colors: {} };
                            }
                            genreData[genre].total++;
                            
                            // Get color families from the video - process the colors field
                            let videoFamilies = [];
                            
                            // Check if video has pre-processed families property (from heatmap processing)
                            if (video.families && Array.isArray(video.families)) {
                              videoFamilies = video.families;
                            } else if (video.colors && Array.isArray(video.colors)) {
                              // Process the colors array to get families
                              try {
                                const hslColors = video.colors.map(hex => {
                                  try {
                                    if (typeof hex === 'string' && hex.startsWith('#')) {
                                      return hexToHsl(hex);
                                    }
                                    return null;
                                  } catch {
                                    return null;
                                  }
                                }).filter(Boolean);
                                
                                videoFamilies = hslColors.map(([h, s, l]) => getHueFamily(h, s, l));
                              } catch (error) {
                                console.warn('Error processing colors for video:', video.videoId, error);
                              }
                            }
                            
                            // Count unique colors per video (not per occurrence)
                            const uniqueFamilies = [...new Set(videoFamilies)].filter(family => family && family !== 'undefined');
                            
                            uniqueFamilies.forEach(family => {
                              const displayFamily = frequencyGrouping === 'coarse' ? getCoarseGrouping(family) : family;
                              if (!showNeutrals && ['Black', 'White', 'Gray'].includes(family)) return;
                              if (!displayFamily || displayFamily === 'undefined') return;
                              
                              genreData[genre].colors[displayFamily] = (genreData[genre].colors[displayFamily] || 0) + 1;
                              colorTotals[displayFamily] = (colorTotals[displayFamily] || 0) + 1;
                            });
                          });

                          console.log('Genre data:', genreData);
                          console.log('Color totals:', colorTotals);

                          // Get all unique colors across all genres for consistent ordering
                          const allColors = Object.keys(colorTotals).filter(color => color && color !== 'undefined').sort((a, b) => colorTotals[b] - colorTotals[a]);
                          const maxGenreTotal = Math.max(...Object.values(genreData).map(g => g.total), 1);
                          
                          return (
                            <div className="space-y-6">
                              <div>
                                <h6 className={`text-lg font-semibold mb-4 ${
                                  darkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                  Color Usage Composition by Genre
                                </h6>
                                <p className={`text-sm mb-6 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Shows what percentage of videos in each genre contain specific colors.
                                  <span className="font-semibold"> Percentages exceed 100% because videos often use multiple colors.</span>
                                  Compare your genre's color usage patterns to others.
                                </p>
                              </div>

                              {/* Stacked Bar Chart */}
                              <div className={`p-6 rounded-lg border ${
                                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                              }`}>
                                <div className="space-y-4">
                                  {Object.entries(genreData)
                                    .sort(([,a], [,b]) => b.total - a.total)
                                    .map(([genre, data]) => {
                                      return (
                                        <div key={genre} className="space-y-2">
                                          <div className="flex justify-between items-center">
                                            <h7 className={`font-medium ${
                                              darkMode ? 'text-gray-200' : 'text-gray-800'
                                            }`}>
                                              {genre}
                                            </h7>
                                            <span className={`text-sm ${
                                              darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                              {data.total} videos
                                            </span>
                                          </div>
                                          
                                          {/* Individual color bars instead of stacked */}
                                          <div className="space-y-2">
                                            {allColors.map((color, idx) => {
                                              const count = data.colors[color] || 0;
                                              const percentage = (count / data.total) * 100;
                                              
                                              if (percentage === 0) return null;
                                              
                                              return (
                                                <div key={color} className="flex items-center gap-3">
                                                  <div className="flex items-center gap-2 min-w-[120px]">
                                                    <div
                                                      className="w-4 h-4 rounded border"
                                                      style={{ 
                                                        backgroundColor: getColorSwatch(color),
                                                        borderColor: darkMode ? '#4B5563' : '#D1D5DB'
                                                      }}
                                                    />
                                                    <span className={`text-sm font-medium ${
                                                      darkMode ? 'text-gray-200' : 'text-gray-800'
                                                    }`}>
                                                      {color}
                                                    </span>
                                                  </div>
                                                  
                                                  <div className="flex-1">
                                                    <div className={`w-full h-6 rounded-lg overflow-hidden ${
                                                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                                    }`}>
                                                      <div
                                                        className="h-full flex items-center justify-end pr-2 text-xs font-semibold text-white drop-shadow-sm"
                                                        style={{
                                                          width: `${Math.min(100, percentage)}%`,
                                                          backgroundColor: getColorSwatch(color),
                                                          minWidth: '50px'
                                                        }}
                                                        title={`${color}: ${count} videos (${percentage.toFixed(1)}%)`}
                                                      >
                                                        {percentage.toFixed(1)}%
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>

                              {/* Color comparison matrix */}
                              {allColors.length > 0 ? (
                              <div className={`p-6 rounded-lg border ${
                                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                              }`}>
                                <h6 className={`text-lg font-semibold mb-4 ${
                                  darkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                  Cross-Genre Color Usage Matrix
                                </h6>
                                
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr>
                                        <th className={`text-left p-3 text-sm font-semibold ${
                                          darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                          Color
                                        </th>
                                        {Object.keys(genreData).sort().map(genre => (
                                          <th key={genre} className={`text-center p-3 text-sm font-semibold ${
                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                          }`}>
                                            <div className="whitespace-pre-line text-xs">
                                              {genre.replace(/\//g, '/\n')}
                                            </div>
                                          </th>
                                        ))}
                                        <th className={`text-center p-3 text-sm font-semibold ${
                                          darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                          Overall
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {allColors.slice(0, 10).map(color => { // Limit to top 10 colors
                                        const overallCount = Object.values(genreData).reduce((sum, data) => sum + (data.colors[color] || 0), 0);
                                        const overallTotal = Object.values(genreData).reduce((sum, data) => sum + data.total, 0);
                                        const overallPercentage = overallTotal > 0 ? (overallCount / overallTotal) * 100 : 0;
                                        
                                        return (
                                          <tr key={color} className={`border-t ${
                                            darkMode ? 'border-gray-600' : 'border-gray-200'
                                          }`}>
                                            <td className="p-3">
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className="w-4 h-4 rounded border"
                                                  style={{ 
                                                    backgroundColor: getColorSwatch(color),
                                                    borderColor: darkMode ? '#4B5563' : '#D1D5DB'
                                                  }}
                                                />
                                                <span className={`text-sm font-medium ${
                                                  darkMode ? 'text-gray-200' : 'text-gray-800'
                                                }`}>
                                                  {color}
                                                </span>
                                              </div>
                                            </td>
                                            {Object.keys(genreData).sort().map(genre => {
                                              const count = genreData[genre].colors[color] || 0;
                                              const total = genreData[genre].total || 1;
                                              const percentage = (count / total) * 100;
                                              const intensity = Math.max(0.1, percentage / 100);
                                              
                                              // Determine if we need light or dark text based on the color
                                              const needsLightText = (color === 'Black' || 
                                                color === 'Blue' || 
                                                color === 'Violet' || 
                                                color === 'Blue-Violet' ||
                                                (color === 'Red' && percentage > 30) ||
                                                (color === 'Green' && percentage > 30) ||
                                                (color === 'Orange' && percentage > 50));
                                              
                                              return (
                                                <td key={genre} className="p-3 text-center">
                                                  <div
                                                    className={`inline-block px-2 py-1 rounded text-xs font-semibold min-w-[50px] ${
                                                      percentage === 0 
                                                        ? darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
                                                        : needsLightText ? 'text-white' : 'text-gray-900'
                                                    }`}
                                                    style={{
                                                      backgroundColor: percentage > 0 
                                                        ? `${getColorSwatch(color)}${Math.round(intensity * 128 + 127).toString(16).padStart(2, '0')}` 
                                                        : undefined
                                                    }}
                                                    title={`${count} videos (${percentage.toFixed(1)}%)`}
                                                  >
                                                    {percentage.toFixed(1)}%
                                                  </div>
                                                </td>
                                              );
                                            })}
                                            <td className="p-3 text-center">
                                              <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                                darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                              }`}>
                                                {overallPercentage.toFixed(1)}%
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                                
                                <div className={`mt-4 p-3 rounded text-sm ${
                                  darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                }`}>
                                  <p className="font-medium mb-1">How to read this matrix:</p>
                                  <p>• Each cell shows what percentage of videos in that genre <strong>contain</strong> the color</p>
                                  <p>• <strong>Percentages exceed 100%</strong> because most videos use multiple colors</p>
                                  <p>• Darker backgrounds = higher usage in that genre</p>
                                  <p>• Compare across rows to see which genres favor which colors</p>
                                  <p>• The "Overall" column shows usage across all genres combined</p>
                                </div>
                              </div>
                              ) : (
                              <div className={`p-6 rounded-lg border ${
                                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                              }`}>
                                <div className="text-center py-8">
                                  <div className={`text-lg font-semibold mb-2 ${
                                    darkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                    No Color Data Available
                                  </div>
                                  <p className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    The current filter settings don't show any color data. 
                                    Try adjusting your filters or check if your data includes color information.
                                  </p>
                                </div>
                              </div>
                              )}

                              {/* Key insights */}
                              <div className={`p-4 rounded-lg ${
                                darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                              }`}>
                                <h6 className={`font-semibold mb-2 ${
                                  darkMode ? 'text-blue-200' : 'text-blue-800'
                                }`}>
                                  📊 Quick Insights
                                </h6>
                                <div className="text-sm space-y-1">
                                  {(() => {
                                    const insights = [];
                                    
                                    if (allColors.length === 0) {
                                      insights.push("• No color data available for the current filters");
                                      return insights.map((insight, idx) => (
                                        <p key={idx} className={darkMode ? 'text-blue-300' : 'text-blue-700'}>
                                          {insight}
                                        </p>
                                      ));
                                    }
                                    
                                    // Find most used color overall
                                    const topColor = allColors[0];
                                    const totalVideos = Object.values(genreData).reduce((sum, data) => sum + data.total, 0);
                                    const topColorUsage = totalVideos > 0 ? (colorTotals[topColor] / totalVideos * 100).toFixed(1) : '0';
                                    insights.push(`• **${topColor}** is the most popular color (${topColorUsage}% of all thumbnails)`);
                                    
                                    // Find genre with most diverse color usage
                                    const diversityScores = Object.entries(genreData).map(([genre, data]) => ({
                                      genre,
                                      diversity: Object.keys(data.colors).length,
                                      total: data.total
                                    })).filter(item => item.total > 0);
                                    
                                    if (diversityScores.length > 0) {
                                      const mostDiverse = diversityScores.reduce((a, b) => a.diversity > b.diversity ? a : b);
                                      insights.push(`• **${mostDiverse.genre}** uses the most diverse color palette (${mostDiverse.diversity} different colors)`);
                                    }
                                    
                                    // Find color with biggest genre preference
                                    if (allColors.length > 1) {
                                      let maxVariance = 0;
                                      let mostPolarizedColor = '';
                                      allColors.slice(0, 5).forEach(color => {
                                        const usages = Object.values(genreData).map(data => (data.colors[color] || 0) / Math.max(data.total, 1) * 100);
                                        const mean = usages.reduce((a, b) => a + b, 0) / usages.length;
                                        const variance = usages.reduce((sum, usage) => sum + Math.pow(usage - mean, 2), 0) / usages.length;
                                        if (variance > maxVariance) {
                                          maxVariance = variance;
                                          mostPolarizedColor = color;
                                        }
                                      });
                                      if (mostPolarizedColor) {
                                        insights.push(`• **${mostPolarizedColor}** shows the biggest variation across genres (some love it, some avoid it)`);
                                      }
                                    }
                                    
                                    return insights.map((insight, idx) => (
                                      <p key={idx} className={darkMode ? 'text-blue-300' : 'text-blue-700'}>
                                        {insight}
                                      </p>
                                    ));
                                  })()}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })()}

                      {/* Selected Color Details Modal */}
                      {selectedFrequencyColor && (
                        <div className={`mt-6 p-6 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-600' 
                            : 'bg-white border-gray-300'
                        }`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded border-2 border-gray-400"
                                style={{ backgroundColor: selectedFrequencyColor.swatch }}
                              />
                              <h6 className={`text-xl font-bold ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                {selectedFrequencyColor.color} Analysis
                              </h6>
                            </div>
                            <button
                              onClick={() => setSelectedFrequencyColor(null)}
                              className={`text-sm px-3 py-1 rounded hover:bg-opacity-80 ${
                                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                              }`}
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div>
                              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Usage Frequency
                              </div>
                              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {(selectedFrequencyColor.frequency * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Performance Impact
                              </div>
                              <div className={`text-2xl font-bold ${
                                selectedFrequencyColor.delta > 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {selectedFrequencyColor.delta > 0 ? '+' : ''}{selectedFrequencyColor.delta.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                With Color
                              </div>
                              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {selectedFrequencyColor.metricPresent.toFixed(1)}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                n={selectedFrequencyColor.nPresent}
                              </div>
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Without Color
                              </div>
                              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {selectedFrequencyColor.metricAbsent.toFixed(1)}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                n={selectedFrequencyColor.nAbsent}
                              </div>
                            </div>
                          </div>
                          
                          {selectedFrequencyColor.examples && (
                            <div>
                              <h7 className={`text-sm font-semibold mb-3 block ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Example Thumbnails Using {selectedFrequencyColor.color}:
                              </h7>
                              <div className="space-y-2">
                                {selectedFrequencyColor.examples.map((example, idx) => {
                                  const thumbnailUrl = getYouTubeThumbnail(example.videoId, 'mqdefault');
                                  return (
                                    <div key={idx} className={`p-3 rounded flex items-center gap-3 ${
                                      darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
                                    }`}>
                                      {/* Thumbnail */}
                                      {thumbnailUrl ? (
                                        <img
                                          src={thumbnailUrl}
                                          alt={example.title}
                                          className={`w-16 h-10 rounded border object-cover flex-shrink-0 ${
                                            darkMode ? 'border-gray-600' : 'border-gray-300'
                                          }`}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      
                                      {/* Fallback placeholder */}
                                      <div 
                                        className={`w-16 h-10 rounded border flex items-center justify-center text-xs flex-shrink-0 ${
                                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-600'
                                        } ${thumbnailUrl ? 'hidden' : 'flex'}`}
                                        style={{
                                          background: thumbnailUrl ? undefined : `linear-gradient(45deg, ${example.palette?.[0] || selectedFrequencyColor.color}, ${example.palette?.[1] || selectedFrequencyColor.color})`
                                        }}
                                      >
                                        🖼️
                                      </div>
                                      
                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="flex gap-1">
                                            {example.palette?.map((color, colorIdx) => (
                                              <div
                                                key={colorIdx}
                                                className="w-4 h-4 rounded border border-gray-400"
                                                style={{ backgroundColor: color }}
                                              />
                                            ))}
                                          </div>
                                          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                            {frequencyMetric === 'rqs' 
                                              ? example.metric.toFixed(1) + ' RQS' 
                                              : example.metric.toLocaleString() + ' views'
                                            }
                                          </span>
                                          {example.facePercentage !== undefined && (
                                            <span className={`text-xs px-1 py-0.5 rounded ${
                                              example.facePercentage >= 20 ? 'bg-green-500 text-white' :
                                              example.facePercentage >= 10 ? 'bg-yellow-500 text-yellow-900' :
                                              'bg-red-500 text-white'
                                            }`}>
                                              👤{example.facePercentage.toFixed(0)}%
                                            </span>
                                          )}
                                        </div>
                                        <div className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {example.title}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Face Analysis View */}
                  {thumbnailAnalysisView === 'face_analysis' && (
                    <div className="space-y-6">
                      {/* Face Analysis Header */}
                      <div className="text-center space-y-4">
                        <h4 className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          👤 How Much Face Should Fill Your Thumbnails?
                        </h4>
                        <p className={`text-sm max-w-3xl mx-auto leading-relaxed ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Analysis shows face coverage directly impacts performance. Find your sweet spot - the face percentage ranges where your audience engages most.
                        </p>
                      </div>

                      {/* Face Analysis Controls */}
                      <div className="space-y-4">
                        {/* Primary Controls Row */}
                        <div className="flex flex-wrap gap-4 items-center justify-center">
                          {/* Metric Toggle */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Metric:
                            </label>
                            <div className={`inline-flex rounded-lg p-1 ${
                              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                            }`}>
                              <button
                                onClick={() => setFaceMetric('rqs')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  faceMetric === 'rqs'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : darkMode
                                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                }`}
                              >
                                RQS
                              </button>
                              <button
                                onClick={() => setFaceMetric('views')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  faceMetric === 'views'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : darkMode
                                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                }`}
                              >
                                Views
                              </button>
                            </div>
                          </div>

                          {/* Views Mode (when Views is selected) */}
                          {faceMetric === 'views' && (
                            <div className="flex items-center gap-2">
                              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Mode:
                              </label>
                              <select
                                value={faceViewsMode}
                                onChange={(e) => setFaceViewsMode(e.target.value)}
                                className={`px-3 py-2 text-sm rounded-md border ${
                                  darkMode 
                                    ? 'bg-gray-800 border-gray-600 text-gray-200' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="avg">Average</option>
                                <option value="median">Median</option>
                              </select>
                            </div>
                          )}

                          {/* Bin Scheme */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Bins:
                            </label>
                            <select
                              value={faceBinScheme}
                              onChange={(e) => setFaceBinScheme(e.target.value)}
                              className={`px-3 py-2 text-sm rounded-md border ${
                                darkMode 
                                  ? 'bg-gray-800 border-gray-600 text-gray-200' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="standard">Quick View (8 ranges)</option>
                              <option value="fine">Detailed View (12 ranges)</option>
                            </select>
                          </div>

                          {/* Min-n Slider */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Min n:
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={faceMinN}
                              onChange={(e) => setFaceMinN(parseInt(e.target.value))}
                              className="w-20"
                            />
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {faceMinN}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* View Toggle */}
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={() => setFaceAnalysisView('leaderboard')}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            faceAnalysisView === 'leaderboard'
                              ? 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          🏆 Best Face Ranges
                        </button>
                        <button
                          onClick={() => setFaceAnalysisView('curve')}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            faceAnalysisView === 'curve'
                              ? 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          📈 Face % vs Performance
                        </button>
                        <button
                          onClick={() => setFaceAnalysisView('distribution')}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            faceAnalysisView === 'distribution'
                              ? 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          📊 Usage vs Effectiveness
                        </button>
                      </div>

                      {/* Face Analysis Content */}
                      <div>
                        {(() => {
                          // Process data for face analysis
                          const processedHeatmapData = processHeatmapData(individualVideos);
                          const faceAnalysisData = generateFaceAnalysisData(processedHeatmapData);

                          if (!faceAnalysisData || faceAnalysisData.bins.length === 0) {
                            return (
                              <div className={`text-center py-20 rounded-lg ${
                                darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'
                              }`}>
                                <div className="text-4xl mb-4">👤</div>
                                <h5 className={`text-lg font-semibold mb-2 ${
                                  darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  No Face Data Available
                                </h5>
                                <p className={`text-sm ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Not enough face percentage data. Try lowering Min n or check data availability.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-6">
                              {/* Sweet-Spot Gauge Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Best RQS Bin */}
                                {(() => {
                                  const rqsBins = faceAnalysisData.bins.filter(b => !b.insufficient && b.mean);
                                  const bestRQS = rqsBins.sort((a, b) => b.mean - a.mean)[0];
                                  return bestRQS ? (
                                    <div className={`p-4 rounded-lg border ${
                                      darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                                    }`}>
                                      <h6 className={`font-semibold mb-2 ${
                                        darkMode ? 'text-green-200' : 'text-green-800'
                                      }`}>
                                        🏆 Sweet Spot for Engagement
                                      </h6>
                                      <div className={`text-lg font-bold ${
                                        darkMode ? 'text-green-100' : 'text-green-900'
                                      }`}>
                                        {bestRQS.label} face
                                      </div>
                                      <div className={`text-sm ${
                                        darkMode ? 'text-green-300' : 'text-green-700'
                                      }`}>
                                        Avg RQS: {bestRQS.mean.toFixed(1)} (n={bestRQS.n})
                                      </div>
                                    </div>
                                  ) : null;
                                })()}

                                {/* Best Views Bin */}
                                {(() => {
                                  const viewsBins = faceAnalysisData.bins.filter(b => !b.insufficient);
                                  const bestViews = viewsBins.sort((a, b) => 
                                    (faceViewsMode === 'median' ? b.median : b.mean) - (faceViewsMode === 'median' ? a.median : a.mean)
                                  )[0];
                                  return bestViews ? (
                                    <div className={`p-4 rounded-lg border ${
                                      darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                                    }`}>
                                      <h6 className={`font-semibold mb-2 ${
                                        darkMode ? 'text-blue-200' : 'text-blue-800'
                                      }`}>
                                        📈 Sweet Spot for Views
                                      </h6>
                                      <div className={`text-lg font-bold ${
                                        darkMode ? 'text-blue-100' : 'text-blue-900'
                                      }`}>
                                        {bestViews.label} face
                                      </div>
                                      <div className={`text-sm ${
                                        darkMode ? 'text-blue-300' : 'text-blue-700'
                                      }`}>
                                        {faceViewsMode === 'median' ? 'Median' : 'Avg'} Views: {
                                          ((faceViewsMode === 'median' ? bestViews.median : bestViews.mean) / 1000000).toFixed(1)
                                        }M (n={bestViews.n})
                                      </div>
                                    </div>
                                  ) : null;
                                })()}

                                {/* Avoid Bin */}
                                {(() => {
                                  const validBins = faceAnalysisData.bins.filter(b => !b.insufficient && b.lift !== undefined);
                                  const worstBin = validBins.sort((a, b) => a.lift - b.lift)[0];
                                  return worstBin && worstBin.lift < 0 ? (
                                    <div className={`p-4 rounded-lg border ${
                                      darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                                    }`}>
                                      <h6 className={`font-semibold mb-2 ${
                                        darkMode ? 'text-red-200' : 'text-red-800'
                                      }`}>
                                        ⚠️ Range to Avoid
                                      </h6>
                                      <div className={`text-lg font-bold ${
                                        darkMode ? 'text-red-100' : 'text-red-900'
                                      }`}>
                                        {worstBin.label} face
                                      </div>
                                      <div className={`text-sm ${
                                        darkMode ? 'text-red-300' : 'text-red-700'
                                      }`}>
                                        Lift: {worstBin.lift.toFixed(1)} ({worstBin.liftPercent.toFixed(1)}%)
                                      </div>
                                    </div>
                                  ) : null;
                                })()}
                              </div>

                              {/* Render based on selected view */}
                              {faceAnalysisView === 'leaderboard' && (
                                <div className="space-y-4">
                                  <h5 className={`text-lg font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-800'
                                  }`}>
                                    🏆 Best Performing Face Coverage Ranges ({faceMetric === 'rqs' ? 'Engagement' : 'Views'})
                                  </h5>
                                  
                                  {faceAnalysisData.validBins.map((bin, index) => (
                                    <div key={bin.key} className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                                      darkMode ? 'bg-gray-800 border-gray-600 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`} onClick={() => setSelectedFaceBin(bin)}>
                                      <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                          index === 0 ? 'bg-yellow-500 text-yellow-900' :
                                          index === 1 ? 'bg-gray-400 text-gray-900' :
                                          index === 2 ? 'bg-orange-600 text-orange-100' :
                                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                          #{index + 1}
                                        </div>

                                        {/* Face Range */}
                                        <div className="flex items-center gap-2">
                                          <div className="text-2xl">👤</div>
                                          <div>
                                            <div className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                              {bin.label}
                                            </div>
                                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                              Face Coverage
                                            </div>
                                          </div>
                                        </div>

                                        {/* Metric Value */}
                                        <div className="flex-1">
                                          <div className="flex items-center gap-4">
                                            <div>
                                              <div className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                {faceMetric === 'rqs' 
                                                  ? bin.mean.toFixed(1)
                                                  : ((faceViewsMode === 'median' ? bin.median : bin.mean) / 1000000).toFixed(1) + 'M'
                                                }
                                              </div>
                                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {faceMetric === 'rqs' ? 'Avg RQS' : `${faceViewsMode === 'median' ? 'Median' : 'Avg'} Views`}
                                              </div>
                                            </div>

                                            {/* Performance Bar */}
                                            <div className="flex-1 max-w-xs">
                                              <div className={`w-full h-2 rounded-full overflow-hidden ${
                                                darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                              }`}>
                                                <div
                                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                                  style={{
                                                    width: `${Math.min(100, (
                                                      (faceMetric === 'rqs' ? bin.mean : (faceViewsMode === 'median' ? bin.median : bin.mean)) / 
                                                      (faceMetric === 'rqs' ? faceAnalysisData.validBins[0].mean : (faceViewsMode === 'median' ? faceAnalysisData.validBins[0].median : faceAnalysisData.validBins[0].mean))
                                                    ) * 100)}%`
                                                  }}
                                                />
                                              </div>
                                            </div>

                                            {/* Metadata */}
                                            <div className={`text-right text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                              <div>n={bin.n}</div>
                                              <div>{bin.usageRate.toFixed(1)}% usage</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Example Thumbnails */}
                                      {bin.examples.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-600">
                                          <div className="flex gap-2 items-center">
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                              Examples:
                                            </span>
                                            {bin.examples.map((example, i) => {
                                              const thumbnailUrl = getYouTubeThumbnail(example.videoId, 'mqdefault');
                                              return (
                                                <div key={i} className="flex items-center gap-2">
                                                  {thumbnailUrl ? (
                                                    <img
                                                      src={thumbnailUrl}
                                                      alt={example.title}
                                                      className={`w-12 h-8 rounded border object-cover ${
                                                        darkMode ? 'border-gray-600' : 'border-gray-300'
                                                      }`}
                                                      onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                      }}
                                                    />
                                                  ) : null}
                                                  
                                                  <div 
                                                    className={`w-12 h-8 rounded border flex items-center justify-center text-xs ${
                                                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-600'
                                                    } ${thumbnailUrl ? 'hidden' : 'flex'}`}
                                                  >
                                                    👤
                                                  </div>
                                                  
                                                  <span className={`text-xs px-1 py-0.5 rounded ${
                                                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                                  }`}>
                                                    {example.title.length > 20 
                                                      ? example.title.substring(0, 20) + '...'
                                                      : example.title
                                                    }
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {faceAnalysisView === 'curve' && (
                                <div className="space-y-4">
                                  <h5 className={`text-lg font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-800'
                                  }`}>
                                    📈 How Face Coverage Affects Performance
                                  </h5>
                                  
                                  {/* Simple curve visualization */}
                                  <div className={`p-8 rounded-lg ${
                                    darkMode ? 'bg-gray-800' : 'bg-gray-50'
                                  }`}>
                                    <div className="space-y-4">
                                      {faceAnalysisData.bins.filter(b => !b.insufficient).map((bin, index) => (
                                        <div key={bin.key} className="flex items-center gap-4">
                                          <div className={`w-20 text-sm font-mono ${
                                            darkMode ? 'text-gray-400' : 'text-gray-600'
                                          }`}>
                                            {bin.label}
                                          </div>
                                          <div className="flex-1 flex items-center gap-2">
                                            <div className={`h-4 rounded-full ${
                                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                            } flex-1 relative overflow-hidden`}>
                                              <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                                style={{
                                                  width: `${Math.min(100, (
                                                    (faceMetric === 'rqs' ? bin.mean : (faceViewsMode === 'median' ? bin.median : bin.mean)) / 
                                                    Math.max(...faceAnalysisData.bins.filter(b => !b.insufficient).map(b => 
                                                      faceMetric === 'rqs' ? b.mean : (faceViewsMode === 'median' ? b.median : b.mean)
                                                    ))
                                                  ) * 100)}%`
                                                }}
                                              />
                                            </div>
                                            <div className={`text-sm font-bold min-w-16 text-right ${
                                              darkMode ? 'text-gray-200' : 'text-gray-800'
                                            }`}>
                                              {faceMetric === 'rqs' 
                                                ? bin.mean.toFixed(1)
                                                : ((faceViewsMode === 'median' ? bin.median : bin.mean) / 1000000).toFixed(1) + 'M'
                                              }
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {faceAnalysisView === 'distribution' && (
                                <div className="space-y-4">
                                  <h5 className={`text-lg font-semibold ${
                                    darkMode ? 'text-gray-200' : 'text-gray-800'
                                  }`}>
                                    📊 What You Use vs What Works Best
                                  </h5>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Distribution */}
                                    <div className={`p-4 rounded-lg ${
                                      darkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    }`}>
                                      <h6 className={`font-medium mb-4 ${
                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                                      }`}>
                                        How Often You Use Each Face %
                                      </h6>
                                      <div className="space-y-2">
                                        {faceAnalysisData.bins.map(bin => (
                                          <div key={bin.key} className="flex items-center gap-2">
                                            <div className={`w-16 text-xs ${
                                              darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                              {bin.label}
                                            </div>
                                            <div className={`h-6 rounded ${
                                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                            } flex-1 relative overflow-hidden`}>
                                              <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                                                style={{
                                                  width: `${(bin.n / faceAnalysisData.totalVideos) * 100}%`
                                                }}
                                              />
                                            </div>
                                            <div className={`w-12 text-xs text-right ${
                                              darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                              {bin.n}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Lift Analysis */}
                                    <div className={`p-4 rounded-lg ${
                                      darkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    }`}>
                                      <h6 className={`font-medium mb-4 ${
                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                                      }`}>
                                        Which Ranges Over/Under Perform
                                      </h6>
                                      <div className="space-y-2">
                                        {faceAnalysisData.bins.filter(b => !b.insufficient && b.lift !== undefined).map(bin => (
                                          <div key={bin.key} className="flex items-center gap-2">
                                            <div className={`w-16 text-xs ${
                                              darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                              {bin.label}
                                            </div>
                                            <div className="flex-1 flex justify-center">
                                              <div className={`h-6 rounded ${
                                                bin.lift > 0 ? 'bg-green-500' : bin.lift < 0 ? 'bg-red-500' : 'bg-gray-500'
                                              } transition-all duration-500`}
                                              style={{
                                                width: `${Math.min(50, Math.abs(bin.liftPercent))}%`,
                                                marginLeft: bin.lift < 0 ? `${50 - Math.min(50, Math.abs(bin.liftPercent))}%` : '50%'
                                              }}
                                              />
                                            </div>
                                            <div className={`w-16 text-xs text-right font-bold ${
                                              bin.lift > 0 ? 'text-green-500' : bin.lift < 0 ? 'text-red-500' : 'text-gray-500'
                                            }`}>
                                              {bin.liftPercent > 0 ? '+' : ''}{bin.liftPercent.toFixed(1)}%
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Leaderboard View */}
                  {thumbnailAnalysisView === 'leaderboard' && (
                    <div className="space-y-6">
                      {/* Leaderboard Controls */}
                      <div className="space-y-4">
                        {/* Primary Controls */}
                        <div className="flex flex-wrap gap-4 items-center">
                          {/* Metric Toggle */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Metric:
                            </label>
                            <div className={`inline-flex rounded-lg p-1 ${
                              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                            }`}>
                              <button
                                onClick={() => setLeaderboardMetric('rqs')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  leaderboardMetric === 'rqs'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : darkMode
                                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                }`}
                              >
                                RQS
                              </button>
                              <button
                                onClick={() => setLeaderboardMetric('views')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  leaderboardMetric === 'views'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : darkMode
                                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                }`}
                              >
                                Views
                              </button>
                            </div>
                          </div>

                          {/* Views Mode (when Views is selected) */}
                          {leaderboardMetric === 'views' && (
                            <div className="flex items-center gap-2">
                              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Mode:
                              </label>
                              <select
                                value={leaderboardViewsMode}
                                onChange={(e) => setLeaderboardViewsMode(e.target.value)}
                                className={`px-3 py-2 text-sm rounded-md border ${
                                  darkMode 
                                    ? 'bg-gray-800 border-gray-600 text-gray-200' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="avg">Average</option>
                                <option value="median">Median</option>
                              </select>
                            </div>
                          )}

                          {/* Entity Toggle */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Entity:
                            </label>
                            <div className={`inline-flex rounded-lg p-1 ${
                              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                            }`}>
                              <button
                                onClick={() => setLeaderboardEntity('palettes')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  leaderboardEntity === 'palettes'
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : darkMode
                                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                }`}
                              >
                                Palettes
                              </button>
                              <button
                                onClick={() => setLeaderboardEntity('single_colors')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  leaderboardEntity === 'single_colors'
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : darkMode
                                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                }`}
                              >
                                Single Colors
                              </button>
                            </div>
                          </div>

                          {/* Grouping Toggle */}
                          <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Grouping:
                            </label>
                            <select
                              value={leaderboardGrouping}
                              onChange={(e) => setLeaderboardGrouping(e.target.value)}
                              className={`px-3 py-2 text-sm rounded-md border ${
                                darkMode 
                                  ? 'bg-gray-800 border-gray-600 text-gray-200' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="12_family">12 Color Families</option>
                              <option value="coarse">Warm/Cool/Neutral</option>
                            </select>
                          </div>

                          {/* Min N Slider */}
                          <div className="flex items-center gap-2">
                            <label 
                              className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                              title="Minimum number of videos required for a palette/color to be eligible for top 10"
                            >
                              Min n:
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="50"
                              value={leaderboardMinN}
                              onChange={(e) => setLeaderboardMinN(parseInt(e.target.value))}
                              className="w-20"
                            />
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {leaderboardMinN}
                            </span>
                          </div>

                          {/* Show Neutrals Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showNeutrals}
                              onChange={(e) => setShowNeutrals(e.target.checked)}
                              className="rounded"
                            />
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Show Neutrals
                            </span>
                          </label>
                        </div>

                        {/* Secondary Controls */}
                        <div className="flex flex-wrap gap-4 items-center">
                          {/* Dedup Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={leaderboardDedup}
                              onChange={(e) => setLeaderboardDedup(e.target.checked)}
                              className="rounded"
                            />
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Collapse near-duplicates
                            </span>
                          </label>

                          {/* Show CI Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={leaderboardShowCI}
                              onChange={(e) => setLeaderboardShowCI(e.target.checked)}
                              className="rounded"
                            />
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Show CI
                            </span>
                          </label>

                          {/* Examples Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={leaderboardExamples}
                              onChange={(e) => setLeaderboardExamples(e.target.checked)}
                              className="rounded"
                            />
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Show examples
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* View Style Toggle */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setLeaderboardView('bars')}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            leaderboardView === 'bars'
                              ? 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          📊 Bars
                        </button>
                        <button
                          onClick={() => setLeaderboardView('dartboard')}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            leaderboardView === 'dartboard'
                              ? 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          🎯 Dartboard
                        </button>
                        <button
                          onClick={() => setLeaderboardView('grid')}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            leaderboardView === 'grid'
                              ? 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          🗂️ Grid
                        </button>
                      </div>

                      {/* Leaderboard Content */}
                      <div>
                        {(() => {
                          // Process heatmap data for leaderboard
                          const processedHeatmapData = processHeatmapData(individualVideos);
                          const leaderboardData = generateLeaderboardData(processedHeatmapData);

                          if (!leaderboardData || leaderboardData.top10.length === 0) {
                            return (
                              <div className={`text-center py-20 rounded-lg ${
                                darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'
                              }`}>
                                <div className="text-4xl mb-4">📊</div>
                                <h5 className={`text-lg font-semibold mb-2 ${
                                  darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  No Data Available
                                </h5>
                                <p className={`text-sm ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Not enough data to generate top 10 leaderboard. Try lowering Min n or adjusting filters.
                                </p>
                              </div>
                            );
                          }

                          // Render based on selected view
                          return (
                            <div className="space-y-6">
                              {/* Header with stats */}
                              <div className={`p-4 rounded-lg ${
                                darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                              }`}>
                                <h6 className={`font-semibold mb-2 ${
                                  darkMode ? 'text-blue-200' : 'text-blue-800'
                                }`}>
                                  🏆 Top 10 {leaderboardEntity === 'palettes' ? 'Palettes' : 'Single Colors'} by {leaderboardMetric === 'rqs' ? 'RQS' : 'Views'}
                                </h6>
                                <div className={`text-sm space-y-1 ${
                                  darkMode ? 'text-blue-300' : 'text-blue-700'
                                }`}>
                                  <p>• Found {leaderboardData.totalEligible} eligible items from {leaderboardData.totalFiltered} videos</p>
                                  <p>• {leaderboardData.belowThreshold} items excluded (below Min n = {leaderboardMinN})</p>
                                  <p>• {leaderboardEntity === 'palettes' ? 'Ranking complete color combinations' : 'Ranking individual color families'}</p>
                                </div>
                              </div>

                              {/* Render based on view style */}
                              {leaderboardView === 'bars' && (
                                <div className="space-y-4">
                                  {leaderboardData.top10.map((item, index) => (
                                    <div key={item.signature} className={`p-4 rounded-lg border ${
                                      darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                                    }`}>
                                      {/* Rank and signature */}
                                      <div className="flex items-center gap-4 mb-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                          index === 0 ? 'bg-yellow-500 text-yellow-900' :
                                          index === 1 ? 'bg-gray-400 text-gray-900' :
                                          index === 2 ? 'bg-orange-600 text-orange-100' :
                                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                          #{item.rank}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 flex-1">
                                          {/* Palette/Color Swatch */}
                                          <div className="flex gap-1">
                                            {item.type === 'single_color' ? (
                                              <div
                                                className="w-8 h-8 rounded border"
                                                style={{ 
                                                  backgroundColor: item.palette[0],
                                                  borderColor: darkMode ? '#4B5563' : '#D1D5DB'
                                                }}
                                                title={item.signature}
                                              />
                                            ) : (
                                              item.palette.slice(0, 5).map((color, i) => (
                                                <div
                                                  key={i}
                                                  className="w-6 h-8 border-r last:border-r-0"
                                                  style={{ 
                                                    backgroundColor: color,
                                                    borderColor: darkMode ? '#374151' : '#E5E7EB'
                                                  }}
                                                  title={`Color ${i + 1}: ${color}`}
                                                />
                                              ))
                                            )}
                                          </div>
                                          
                                          {/* Signature */}
                                          <div>
                                            <h6 className={`font-medium ${
                                              darkMode ? 'text-gray-200' : 'text-gray-800'
                                            }`}>
                                              {item.signature}
                                            </h6>
                                            <div className="flex gap-2 text-xs">
                                              {item.families.map(family => (
                                                <span key={family} className={`px-2 py-1 rounded ${
                                                  ['Black', 'White', 'Gray'].includes(family)
                                                    ? darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
                                                    : getCoarseGrouping(family) === 'Warm'
                                                      ? darkMode ? 'bg-red-900 text-red-300' : 'bg-red-200 text-red-800'
                                                      : darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-200 text-blue-800'
                                                }`}>
                                                  {family}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Metric Value */}
                                        <div className="text-right">
                                          <div className={`text-lg font-bold ${
                                            darkMode ? 'text-gray-200' : 'text-gray-800'
                                          }`}>
                                            {leaderboardMetric === 'rqs' 
                                              ? item.metricValue.toFixed(2)
                                              : (item.metricValue / 1000000).toFixed(1) + 'M'
                                            }
                                          </div>
                                          <div className={`text-sm ${
                                            darkMode ? 'text-gray-400' : 'text-gray-600'
                                          }`}>
                                            {leaderboardMetric === 'rqs' ? 'RQS' : 'Views'}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Performance Bar */}
                                      <div className="mb-3">
                                        <div className={`w-full h-3 rounded-full overflow-hidden ${
                                          darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}>
                                          <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                            style={{
                                              width: `${Math.min(100, (item.metricValue / leaderboardData.top10[0].metricValue) * 100)}%`
                                            }}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Metadata */}
                                      <div className="flex justify-between items-center text-sm">
                                        <div className={`space-x-4 ${
                                          darkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                          <span>📊 {item.n} videos</span>
                                          <span>📈 {item.usageRate.toFixed(1)}% usage</span>
                                          {item.examples.length > 0 && item.examples[0].facePercentage !== undefined && (
                                            <span>👤 Avg Face: {(item.examples.reduce((sum, ex) => sum + (ex.facePercentage || 0), 0) / item.examples.length).toFixed(0)}%</span>
                                          )}
                                          {item.topGenres.length > 0 && (
                                            <span>🎯 Top genres: {item.topGenres.join(', ')}</span>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => setSelectedLeaderboardItem(item)}
                                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                            darkMode 
                                              ? 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                          }`}
                                        >
                                          View Details
                                        </button>
                                      </div>
                                      
                                      {/* Example thumbnails */}
                                      {leaderboardExamples && item.examples.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-600">
                                          <div className="space-y-2">
                                            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                              Examples:
                                            </span>
                                            <div className="flex gap-2 flex-wrap">
                                              {item.examples.slice(0, 3).map((example, i) => {
                                                const thumbnailUrl = getYouTubeThumbnail(example.videoId, 'mqdefault');
                                                return (
                                                  <div key={i} className="flex items-center gap-2">
                                                    {/* Thumbnail */}
                                                    {thumbnailUrl ? (
                                                      <img
                                                        src={thumbnailUrl}
                                                        alt={example.title}
                                                        className={`w-16 h-10 rounded border object-cover ${
                                                          darkMode ? 'border-gray-600' : 'border-gray-300'
                                                        }`}
                                                        onError={(e) => {
                                                          // Fallback to placeholder if thumbnail fails to load
                                                          e.target.style.display = 'none';
                                                          e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                      />
                                                    ) : null}
                                                    
                                                    {/* Fallback placeholder */}
                                                    <div 
                                                      className={`w-16 h-10 rounded border flex items-center justify-center text-xs ${
                                                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-600'
                                                      } ${thumbnailUrl ? 'hidden' : 'flex'}`}
                                                      style={{
                                                        background: thumbnailUrl ? undefined : `linear-gradient(45deg, ${item.palette[0] || '#gray'}, ${item.palette[1] || item.palette[0] || '#gray'})`
                                                      }}
                                                    >
                                                      🖼️
                                                    </div>
                                                    
                                                    {/* Title */}
                                                    <span className={`text-xs px-2 py-1 rounded flex-1 ${
                                                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                                    }`}>
                                                      {example.title.length > 25 
                                                        ? example.title.substring(0, 25) + '...'
                                                        : example.title
                                                      }
                                                      {example.facePercentage !== undefined && (
                                                        <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                                                          example.facePercentage >= 20 ? 'bg-green-500 text-white' :
                                                          example.facePercentage >= 10 ? 'bg-yellow-500 text-yellow-900' :
                                                          'bg-red-500 text-white'
                                                        }`}>
                                                          👤{example.facePercentage.toFixed(0)}%
                                                        </span>
                                                      )}
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Dartboard View */}
                              {leaderboardView === 'dartboard' && (
                                <div className="space-y-4">
                                  {/* Dartboard Container */}
                                  <div className="flex justify-center">
                                    <div className="relative">
                                      <svg width="600" height="600" className="rounded-lg">
                                        {/* Background */}
                                        <circle
                                          cx="300"
                                          cy="300"
                                          r="290"
                                          fill={darkMode ? '#1f2937' : '#f9fafb'}
                                          stroke={darkMode ? '#374151' : '#e5e7eb'}
                                          strokeWidth="2"
                                        />
                                        
                                        {/* Ring guidelines */}
                                        <circle cx="300" cy="300" r="80" fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1" opacity="0.3" />
                                        <circle cx="300" cy="300" r="140" fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1" opacity="0.3" />
                                        <circle cx="300" cy="300" r="200" fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1" opacity="0.3" />
                                        <circle cx="300" cy="300" r="260" fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1" opacity="0.3" />

                                        {/* Family segment lines */}
                                        {(() => {
                                          const segments = leaderboardGrouping === 'coarse' 
                                            ? ['Warm', 'Cool', 'Neutral', 'Mixed']
                                            : ['Red', 'Red-Orange', 'Orange', 'Yellow', 'Yellow-Green', 'Green', 'Green-Cyan', 'Cyan', 'Blue', 'Blue-Violet', 'Violet', 'Magenta'];
                                          
                                          return segments.map((segment, i) => {
                                            const angle = (i / segments.length) * 360;
                                            const radian = (angle * Math.PI) / 180;
                                            const x2 = 300 + 290 * Math.cos(radian);
                                            const y2 = 300 + 290 * Math.sin(radian);
                                            
                                            return (
                                              <g key={segment}>
                                                <line
                                                  x1="300"
                                                  y1="300"
                                                  x2={x2}
                                                  y2={y2}
                                                  stroke={darkMode ? '#4b5563' : '#d1d5db'}
                                                  strokeWidth="1"
                                                  opacity="0.4"
                                                />
                                                {/* Segment labels */}
                                                <text
                                                  x={300 + 270 * Math.cos(radian)}
                                                  y={300 + 270 * Math.sin(radian)}
                                                  textAnchor="middle"
                                                  dominantBaseline="middle"
                                                  className={`text-xs font-medium ${darkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
                                                  transform={`rotate(${angle > 90 && angle < 270 ? angle + 180 : angle}, ${300 + 270 * Math.cos(radian)}, ${300 + 270 * Math.sin(radian)})`}
                                                >
                                                  {segment}
                                                </text>
                                              </g>
                                            );
                                          });
                                        })()}

                                        {/* Palette nodes */}
                                        {leaderboardData.top10.map((item, index) => {
                                          // Determine ring based on rank
                                          let radius;
                                          if (index === 0) radius = 40; // Bullseye
                                          else if (index <= 4) radius = 110; // Ring 1
                                          else radius = 170; // Ring 2
                                          
                                          // Determine segment angle based on primary color family
                                          let segmentAngle = 0;
                                          if (item.families && item.families.length > 0) {
                                            const primaryFamily = item.families[0];
                                            
                                            if (leaderboardGrouping === 'coarse') {
                                              const coarseGroup = getCoarseGrouping(primaryFamily);
                                              const segments = ['Warm', 'Cool', 'Neutral', 'Mixed'];
                                              const segmentIndex = segments.indexOf(coarseGroup);
                                              segmentAngle = (segmentIndex / segments.length) * 360;
                                            } else {
                                              const families = ['Red', 'Red-Orange', 'Orange', 'Yellow', 'Yellow-Green', 'Green', 'Green-Cyan', 'Cyan', 'Blue', 'Blue-Violet', 'Violet', 'Magenta'];
                                              const familyIndex = families.indexOf(primaryFamily);
                                              if (familyIndex !== -1) {
                                                segmentAngle = (familyIndex / families.length) * 360;
                                              }
                                            }
                                          }
                                          
                                          // Add slight random offset within segment for multiple items
                                          const segmentWidth = 360 / (leaderboardGrouping === 'coarse' ? 4 : 12);
                                          const offsetAngle = segmentAngle + (index * 15) % segmentWidth - segmentWidth/2;
                                          const radian = (offsetAngle * Math.PI) / 180;
                                          
                                          // Position
                                          const x = 300 + radius * Math.cos(radian);
                                          const y = 300 + radius * Math.sin(radian);
                                          
                                          // Node size based on sample size (normalized)
                                          const maxN = Math.max(...leaderboardData.top10.map(i => i.n));
                                          const nodeSize = 15 + (item.n / maxN) * 25; // 15-40px radius
                                          
                                          // Performance glow
                                          const topPerformance = leaderboardData.top10[0].metricValue;
                                          const relativePerformance = item.metricValue / topPerformance;
                                          const glowColor = relativePerformance > 0.8 ? '#10b981' : 
                                                          relativePerformance > 0.6 ? '#f59e0b' : 
                                                          '#ef4444';
                                          const glowIntensity = relativePerformance;
                                          
                                          return (
                                            <g key={item.signature}>
                                              {/* Glow effect */}
                                              <circle
                                                cx={x}
                                                cy={y}
                                                r={nodeSize + 8}
                                                fill={glowColor}
                                                opacity={glowIntensity * 0.3}
                                                className="animate-pulse"
                                              />
                                              
                                              {/* Main node - concentric color rings */}
                                              {item.type === 'single_color' ? (
                                                <circle
                                                  cx={x}
                                                  cy={y}
                                                  r={nodeSize}
                                                  fill={item.palette[0]}
                                                  stroke={darkMode ? '#374151' : '#ffffff'}
                                                  strokeWidth="2"
                                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                                />
                                              ) : (
                                                // Multi-color palette as concentric rings
                                                item.palette.slice(0, 5).reverse().map((color, i) => (
                                                  <circle
                                                    key={i}
                                                    cx={x}
                                                    cy={y}
                                                    r={nodeSize - (i * (nodeSize / 5))}
                                                    fill={color}
                                                    stroke={darkMode ? '#374151' : '#ffffff'}
                                                    strokeWidth={i === item.palette.length - 1 ? "2" : "1"}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                  />
                                                ))
                                              )}
                                              
                                              {/* Rank indicator for bullseye */}
                                              {index === 0 && (
                                                <text
                                                  x={x}
                                                  y={y + 4}
                                                  textAnchor="middle"
                                                  dominantBaseline="middle"
                                                  className="text-xs font-bold fill-white drop-shadow-md"
                                                  style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.7))' }}
                                                >
                                                  #1
                                                </text>
                                              )}
                                              
                                              {/* Rank badges for other positions */}
                                              {index > 0 && (
                                                <g>
                                                  <circle
                                                    cx={x - nodeSize + 8}
                                                    cy={y - nodeSize + 8}
                                                    r="8"
                                                    fill={index < 3 ? '#fbbf24' : darkMode ? '#4b5563' : '#6b7280'}
                                                    stroke={darkMode ? '#1f2937' : '#ffffff'}
                                                    strokeWidth="1"
                                                  />
                                                  <text
                                                    x={x - nodeSize + 8}
                                                    y={y - nodeSize + 8 + 2}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-xs font-bold fill-white"
                                                  >
                                                    #{item.rank}
                                                  </text>
                                                </g>
                                              )}
                                              
                                              {/* Invisible hover area for tooltip */}
                                              <circle
                                                cx={x}
                                                cy={y}
                                                r={nodeSize + 10}
                                                fill="transparent"
                                                className="cursor-pointer"
                                                onClick={() => setSelectedLeaderboardItem(item)}
                                              >
                                                <title>
                                                  {item.signature}
                                                  {'\n'}#{item.rank} • {leaderboardMetric === 'rqs' 
                                                    ? item.metricValue.toFixed(2) + ' RQS'
                                                    : (item.metricValue / 1000000).toFixed(1) + 'M Views'
                                                  }
                                                  {'\n'}{item.n} videos • {item.usageRate.toFixed(1)}% usage
                                                  {item.examples.length > 0 && item.examples[0].facePercentage !== undefined && 
                                                    '\nAvg Face: ' + (item.examples.reduce((sum, ex) => sum + (ex.facePercentage || 0), 0) / item.examples.length).toFixed(0) + '%'
                                                  }
                                                  {item.topGenres.length > 0 && '\nTop genres: ' + item.topGenres.join(', ')}
                                                </title>
                                              </circle>
                                            </g>
                                          );
                                        })}
                                        
                                        {/* Center label */}
                                        <text
                                          x="300"
                                          y="320"
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                          className={`text-sm font-bold ${darkMode ? 'fill-gray-300' : 'fill-gray-700'}`}
                                        >
                                          Top {leaderboardEntity === 'palettes' ? 'Palettes' : 'Colors'}
                                        </text>
                                        
                                        {/* Ring labels */}
                                        <text x="320" y="180" className={`text-xs ${darkMode ? 'fill-gray-400' : 'fill-gray-600'}`}>Top 5</text>
                                        <text x="320" y="120" className={`text-xs ${darkMode ? 'fill-gray-400' : 'fill-gray-600'}`}>Top 10</text>
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Dartboard Legend */}
                                  <div className={`p-4 rounded-lg ${
                                    darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                                  } border`}>
                                    <h6 className={`font-semibold mb-3 ${
                                      darkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                      🎯 How to Read the Dartboard
                                    </h6>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Center (Bullseye):</strong> #1 performer
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Inner Ring:</strong> Top 2-5 performers
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full border border-gray-400"></div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Outer Ring:</strong> Top 6-10 performers
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded-full bg-green-500 opacity-50"></div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Green Glow:</strong> High performance
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-50"></div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Yellow Glow:</strong> Good performance
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded-full bg-red-500 opacity-50"></div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Red Glow:</strong> Lower performance
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-gray-600">
                                      <p className={`text-xs ${
                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        <strong>Node Size:</strong> Larger = more videos use this palette • 
                                        <strong> Segments:</strong> Color families grouped by hue • 
                                        <strong> Click:</strong> View detailed breakdown
                                      </p>
                                    </div>
                                  </div>

                                  {/* Quick Actions */}
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => {
                                        // Export dartboard as PNG (placeholder)
                                        console.log('Export dartboard functionality would go here');
                                      }}
                                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                                        darkMode 
                                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      📸 Export PNG
                                    </button>
                                    <button
                                      onClick={() => setLeaderboardView('bars')}
                                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                                        darkMode 
                                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      📊 Switch to Bars
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Grid View - Instagram/Dribbble Style */}
                              {leaderboardView === 'grid' && (
                                <div className="space-y-6">
                                  {/* Grid Container - Responsive 2x5 → 2x5 → 1x10 */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                    {leaderboardData.top10.map((item, index) => (
                                      <div
                                        key={item.signature}
                                        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                                          darkMode 
                                            ? 'bg-gray-800 border-gray-600 hover:border-gray-500 hover:bg-gray-750' 
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSelectedLeaderboardItem(item)}
                                      >
                                        {/* Rank Badge - Top Left */}
                                        <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                          index === 0 ? 'bg-yellow-500 text-yellow-900 shadow-lg' :
                                          index === 1 ? 'bg-gray-400 text-gray-900 shadow-lg' :
                                          index === 2 ? 'bg-orange-600 text-orange-100 shadow-lg' :
                                          darkMode ? 'bg-gray-700 text-gray-200 shadow-lg' : 'bg-gray-300 text-gray-700 shadow-lg'
                                        }`}>
                                          #{item.rank}
                                        </div>

                                        {/* Metric Badge - Top Right */}
                                        <div className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-xs font-semibold ${
                                          // Color-code based on relative performance
                                          item.metricValue / leaderboardData.top10[0].metricValue > 0.8
                                            ? 'bg-green-500 text-white' // Strong
                                            : item.metricValue / leaderboardData.top10[0].metricValue > 0.6
                                              ? 'bg-yellow-500 text-yellow-900' // Baseline
                                              : 'bg-red-500 text-white' // Weak
                                        }`}>
                                          {leaderboardMetric === 'rqs' 
                                            ? item.metricValue.toFixed(1)
                                            : (item.metricValue / 1000000).toFixed(1) + 'M'
                                          }
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-4 pt-12">
                                          {/* Swatch Strip */}
                                          <div className="mb-4">
                                            <div className="flex justify-center mb-2">
                                              <div className="flex rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                                {item.type === 'single_color' ? (
                                                  <div
                                                    className="w-12 h-8 flex-shrink-0 transition-all group-hover:w-16 group-hover:h-10"
                                                    style={{ backgroundColor: item.palette[0] }}
                                                    title={`${item.signature}: ${item.palette[0]}`}
                                                  />
                                                ) : (
                                                  item.palette.slice(0, 5).map((color, i) => (
                                                    <div
                                                      key={i}
                                                      className="w-8 h-8 flex-shrink-0 border-r border-gray-300 last:border-r-0 transition-all group-hover:w-10 group-hover:h-10 relative"
                                                      style={{ backgroundColor: color }}
                                                      title={`Color ${i + 1}: ${color}`}
                                                    >
                                                      {/* Hex code on hover */}
                                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                        <span className="text-white text-xs font-mono">
                                                          {color.length > 7 ? color.substring(0, 7) : color}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  ))
                                                )}
                                              </div>
                                            </div>

                                            {/* Signature Label */}
                                            <h6 className={`text-center font-semibold text-sm mb-1 ${
                                              darkMode ? 'text-gray-200' : 'text-gray-800'
                                            }`}>
                                              {item.signature}
                                            </h6>

                                            {/* Family Badge */}
                                            <div className="flex justify-center">
                                              <div className="flex gap-1 flex-wrap justify-center">
                                                {item.families.slice(0, 2).map(family => (
                                                  <span key={family} className={`text-xs px-2 py-1 rounded-full ${
                                                    ['Black', 'White', 'Gray'].includes(family)
                                                      ? darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
                                                      : getCoarseGrouping(family) === 'Warm'
                                                        ? darkMode ? 'bg-red-900 text-red-300' : 'bg-red-200 text-red-800'
                                                        : darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-200 text-blue-800'
                                                  }`}>
                                                    {leaderboardGrouping === 'coarse' ? getCoarseGrouping(family) : family}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Metric Value + Context */}
                                          <div className="text-center mb-4">
                                            <div className={`text-lg font-bold ${
                                              darkMode ? 'text-gray-200' : 'text-gray-800'
                                            }`}>
                                              {leaderboardMetric === 'rqs' ? (
                                                <>Avg RQS {item.metricValue.toFixed(1)}</>
                                              ) : (
                                                <>{leaderboardViewsMode === 'median' ? 'Median' : 'Average'} Views {(item.metricValue / 1000000).toFixed(1)}M</>
                                              )}
                                            </div>
                                            <div className={`text-xs ${
                                              darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                              n={item.n} • {item.usageRate.toFixed(1)}% usage
                                              {item.examples.length > 0 && item.examples[0].facePercentage !== undefined && (
                                                <> • Avg Face: {(item.examples.reduce((sum, ex) => sum + (ex.facePercentage || 0), 0) / item.examples.length).toFixed(0)}%</>
                                              )}
                                            </div>
                                          </div>

                                          {/* Example Thumbnails */}
                                          <div className="space-y-2">
                                            <div className={`text-xs font-medium text-center ${
                                              darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                              Example Thumbnails
                                            </div>
                                            
                                            {item.examples.length > 0 ? (
                                              <div className="flex justify-center gap-1">
                                                {item.examples.slice(0, 3).map((example, i) => {
                                                  const thumbnailUrl = getYouTubeThumbnail(example.videoId, 'mqdefault');
                                                  return (
                                                    <div
                                                      key={i}
                                                      className="relative group/thumb cursor-pointer"
                                                      title={`${example.title} - ${example.channel}`}
                                                    >
                                                      {/* Actual YouTube thumbnail */}
                                                      {thumbnailUrl ? (
                                                        <img
                                                          src={thumbnailUrl}
                                                          alt={example.title}
                                                          className={`w-12 h-8 rounded border-2 border-opacity-20 object-cover transition-all group-hover/thumb:w-16 group-hover/thumb:h-10 group-hover/thumb:shadow-lg ${
                                                            darkMode ? 'border-gray-500' : 'border-gray-400'
                                                          }`}
                                                          onError={(e) => {
                                                            // Fallback to placeholder if thumbnail fails to load
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                          }}
                                                        />
                                                      ) : null}
                                                      
                                                      {/* Fallback placeholder */}
                                                      <div 
                                                        className={`w-12 h-8 rounded border-2 border-opacity-20 flex items-center justify-center text-xs transition-all group-hover/thumb:w-16 group-hover/thumb:h-10 ${
                                                          darkMode ? 'bg-gray-700 border-gray-500 text-gray-400' : 'bg-gray-200 border-gray-400 text-gray-600'
                                                        } ${thumbnailUrl ? 'hidden' : 'flex'}`}
                                                        style={{
                                                          background: thumbnailUrl ? undefined : `linear-gradient(45deg, ${item.palette[0] || '#gray'}, ${item.palette[1] || item.palette[0] || '#gray'})`
                                                        }}
                                                      >
                                                        🖼️
                                                      </div>
                                                      
                                                      {/* Hover overlay with title */}
                                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover/thumb:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                        {example.title.length > 20 
                                                          ? example.title.substring(0, 20) + '...'
                                                          : example.title
                                                        }
                                                        {example.facePercentage !== undefined && (
                                                          <span className="ml-2">👤{example.facePercentage.toFixed(0)}%</span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <div className={`text-center text-xs italic ${
                                                darkMode ? 'text-gray-500' : 'text-gray-400'
                                              }`}>
                                                No examples available
                                              </div>
                                            )}
                                          </div>

                                          {/* Top Genres (if space) */}
                                          {item.topGenres.length > 0 && (
                                            <div className="mt-3 text-center">
                                              <div className={`text-xs ${
                                                darkMode ? 'text-gray-400' : 'text-gray-600'
                                              }`}>
                                                Top: {item.topGenres.slice(0, 2).join(', ')}
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Hover Effect Overlay */}
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                                          darkMode ? 'bg-blue-500' : 'bg-blue-400'
                                        } bg-opacity-5`} />
                                      </div>
                                    ))}
                                  </div>

                                  {/* Grid Actions */}
                                  <div className="flex justify-center gap-4 pt-4">
                                    <button
                                      onClick={() => {
                                        // Export grid as PNG (placeholder)
                                        console.log('Export grid as PNG functionality would go here');
                                      }}
                                      className={`px-4 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                                        darkMode 
                                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      📸 Export Grid
                                    </button>
                                    <button
                                      onClick={() => {
                                        // Export as CSV (placeholder)
                                        console.log('Export CSV functionality would go here');
                                      }}
                                      className={`px-4 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                                        darkMode 
                                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      📊 Export CSV
                                    </button>
                                    <button
                                      onClick={() => setLeaderboardView('bars')}
                                      className={`px-4 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                                        darkMode 
                                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      📊 Switch to Bars
                                    </button>
                                  </div>

                                  {/* Grid Legend */}
                                  <div className={`p-4 rounded-lg ${
                                    darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                                  } border`}>
                                    <h6 className={`font-semibold mb-3 ${
                                      darkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                      🗂️ How to Read the Grid
                                    </h6>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold">#1</div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Rank Badge:</strong> Gold (#1), Silver (#2), Bronze (#3)
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-4 bg-green-500 rounded"></div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Metric Badge:</strong> Green = strong, Yellow = good, Red = weak
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="flex">
                                            <div className="w-3 h-3 bg-red-400"></div>
                                            <div className="w-3 h-3 bg-blue-400"></div>
                                            <div className="w-3 h-3 bg-green-400"></div>
                                          </div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Swatch Strip:</strong> Hover to see hex codes
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-3 bg-gray-400 rounded border text-xs flex items-center justify-center">🖼️</div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Thumbnails:</strong> Hover to see video titles
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="text-lg">📊</div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Usage:</strong> Percentage of videos using this palette
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="text-lg">👆</div>
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            <strong>Click Card:</strong> View detailed breakdown
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Legend component for scatter plot
  const renderLegend = () => {
    if (activeChart !== 'correlation') return null;

    const legendItems = correlationColorMode === 'genre' 
      ? [
          { key: 'Challenge/Stunts', color: getGenreColor('challenge'), label: '🎯 Challenge/Stunts' },
          { key: 'Education', color: getGenreColor('education'), label: '🎓 Education' },
          { key: 'Kids/Family', color: getGenreColor('kids'), label: '👶 Kids/Family' },
          { key: 'Gaming', color: getGenreColor('gaming'), label: '🎮 Gaming' },
          { key: 'Catholic', color: getGenreColor('catholic'), label: '✝️ Catholic' },
          { key: 'Music', color: getGenreColor('music'), label: '🎵 Music' }
        ]
      : [
          { key: 'mega', color: getTierColor('mega'), label: '🔴 Mega (50M+)' },
          { key: 'large', color: getTierColor('large'), label: '🟠 Large (10M-50M)' },
          { key: 'mid', color: getTierColor('mid'), label: '🟡 Mid (1M-10M)' },
          { key: 'small', color: getTierColor('small'), label: '🟢 Small (100K-1M)' },
          { key: 'new', color: getTierColor('new'), label: '🔵 New (<100K)' }
        ];

    return (
      <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
        <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {correlationColorMode === 'genre' ? 'Genre Colors' : 'Tier Colors'}
        </h4>
        <div className="flex flex-wrap gap-4">
          {legendItems.map(item => (
            <div key={item.key} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-opacity-30 border-gray-400"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
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
          onClick={() => handleFilterChange({...activeFilters, genre: 'gaming', sortBy: 'views'})}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilters.genre === 'gaming'
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

      {/* Genre Toggle Controls */}
      {activeChart === 'genres' && (
        <div className="flex flex-col items-center gap-4 mb-4">
          {/* Raw vs Per Subscriber Toggle */}
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setGenreViewMode('raw')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                genreViewMode === 'raw'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              📊 Raw Values
            </button>
            <button
              onClick={() => setGenreViewMode('per_subscriber')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                genreViewMode === 'per_subscriber'
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
              onClick={() => setGenreMetricFilter('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                genreMetricFilter === 'all'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              🔍 All
            </button>
            <button
              onClick={() => setGenreMetricFilter('views')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                genreMetricFilter === 'views'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              👁️ Views
            </button>
            <button
              onClick={() => setGenreMetricFilter('likes')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                genreMetricFilter === 'likes'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              👍 Likes
            </button>
            <button
              onClick={() => setGenreMetricFilter('comments')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                genreMetricFilter === 'comments'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              💬 Comments
            </button>
            <button
              onClick={() => setGenreMetricFilter('rqs')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                genreMetricFilter === 'rqs'
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

      {/* Tier Toggle Controls */}
      {activeChart === 'tiers' && (
        <div className="flex flex-col items-center gap-4 mb-4">
          {/* Raw vs Per Subscriber Toggle */}
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setTierViewMode('raw')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                tierViewMode === 'raw'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              📊 Raw Values
            </button>
            <button
              onClick={() => setTierViewMode('per_subscriber')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                tierViewMode === 'per_subscriber'
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
              onClick={() => setTierMetricFilter('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                tierMetricFilter === 'all'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              🔍 All
            </button>
            <button
              onClick={() => setTierMetricFilter('views')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                tierMetricFilter === 'views'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              👁️ Views
            </button>
            <button
              onClick={() => setTierMetricFilter('likes')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                tierMetricFilter === 'likes'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              👍 Likes
            </button>
            <button
              onClick={() => setTierMetricFilter('comments')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                tierMetricFilter === 'comments'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              💬 Comments
            </button>
            <button
              onClick={() => setTierMetricFilter('rqs')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                tierMetricFilter === 'rqs'
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

      {/* Correlation Toggle Controls */}
      {activeChart === 'correlation' && (
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          {/* Channel vs Video Data Toggle */}
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setCorrelationDataMode('channel')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationDataMode === 'channel'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              📺 Channel Data
            </button>
            <button
              onClick={() => setCorrelationDataMode('video')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationDataMode === 'video'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              🎬 Individual Videos
            </button>
          </div>

          {/* Raw vs Per Subscriber Toggle */}
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setCorrelationViewMode('raw')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationViewMode === 'raw'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              📊 Raw Values
            </button>
            <button
              onClick={() => setCorrelationViewMode('per_subscriber')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationViewMode === 'per_subscriber'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              📈 Per Subscriber
            </button>
          </div>

          {/* Color Mode Toggle */}
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setCorrelationColorMode('genre')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationColorMode === 'genre'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              🎨 Color by Genre
            </button>
            <button
              onClick={() => setCorrelationColorMode('tier')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationColorMode === 'tier'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              🏆 Color by Tier
            </button>
          </div>

          {/* Y-axis Metric Toggle */}
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setCorrelationYAxis('engagement')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationYAxis === 'engagement'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              💬 Engagement
            </button>
            <button
              onClick={() => setCorrelationYAxis('rqs')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationYAxis === 'rqs'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              ⭐ RQS
            </button>
            <button
              onClick={() => setCorrelationYAxis('like_ratio')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationYAxis === 'like_ratio'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              👍 Likes
            </button>
            <button
              onClick={() => setCorrelationYAxis('comment_ratio')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationYAxis === 'comment_ratio'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              💬 Comments
            </button>
            <button
              onClick={() => setCorrelationYAxis('subscribers')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                correlationYAxis === 'subscribers'
                  ? 'bg-green-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              👥 Subscribers
            </button>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className={`${darkMode ? 'card-dark' : 'card'} h-[600px] relative overflow-hidden`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {getChartTitle()}
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
            <>
              {renderChart()}
              {renderLegend()}
            </>
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
