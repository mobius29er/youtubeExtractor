import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

const FilterControls = ({ 
  onFilterChange, 
  activeFilters, 
  darkMode, 
  totalChannels = 0, 
  filteredChannels = 0 
}) => {
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...activeFilters, [filterType]: value };
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = { 
      genre: 'all', 
      tier: 'all', 
      globalTier: 'all',
      genreTier: 'all',
      sortBy: 'name' 
    };
    onFilterChange(resetFilters);
  };

  const genreOptions = [
    { value: 'all', label: 'All Genres' },
    { value: 'catholic', label: 'Catholic' },
    { value: 'challenge', label: 'Challenge/Stunts' },
    { value: 'education', label: 'Education' },
    { value: 'kids', label: 'Kids/Family' },
    { value: 'gaming', label: 'Gaming' }
  ];

  const tierOptions = [
    { value: 'all', label: 'All Tiers' },
    { value: 'high', label: 'High Tier (10M+ views)' },
    { value: 'mid', label: 'Mid Tier (1M-10M views)' },
    { value: 'low', label: 'Low Tier (<1M views)' }
  ];

  const globalTierOptions = [
    { value: 'all', label: 'All Global Tiers' },
    { value: 'Mega', label: 'Mega (100M+ subs)' },
    { value: 'Large', label: 'Large (10M+ subs)' },
    { value: 'Mid', label: 'Mid (1M+ subs)' },
    { value: 'Small', label: 'Small (100K+ subs)' },
    { value: 'New', label: 'New (<100K subs)' }
  ];

  const genreTierOptions = [
    { value: 'all', label: 'All Genre Tiers' },
    { value: 'Large', label: 'Large (within genre)' },
    { value: 'Mid', label: 'Mid (within genre)' },
    { value: 'Small', label: 'Small (within genre)' },
    { value: 'New', label: 'New (within genre)' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'videos', label: 'Video Count' },
    { value: 'views', label: 'Total Views' },
    { value: 'engagement', label: 'Engagement Rate' }
  ];

  const hasActiveFilters = activeFilters.genre !== 'all' || 
                          activeFilters.tier !== 'all' || 
                          activeFilters.globalTier !== 'all' ||
                          activeFilters.genreTier !== 'all' ||
                          activeFilters.sortBy !== 'name';

  return (
    <div className={`p-6 rounded-xl border transition-colors ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            darkMode ? 'bg-blue-900' : 'bg-blue-100'
          }`}>
            <Filter className={`w-5 h-5 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Filter & Sort</h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Showing {filteredChannels} of {totalChannels} channels
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* Genre Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Genre
          </label>
          <select
            value={activeFilters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            } focus:ring-2 focus:border-transparent`}
          >
            {genreOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tier Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Channel Tier
          </label>
          <select
            value={activeFilters.tier}
            onChange={(e) => handleFilterChange('tier', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            } focus:ring-2 focus:border-transparent`}
          >
            {tierOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Global Subscriber Tier Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Global Subscriber Tier
          </label>
          <select
            value={activeFilters.globalTier}
            onChange={(e) => handleFilterChange('globalTier', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            } focus:ring-2 focus:border-transparent`}
          >
            {globalTierOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Genre Subscriber Tier Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Genre Subscriber Tier
          </label>
          <select
            value={activeFilters.genreTier}
            onChange={(e) => handleFilterChange('genreTier', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            } focus:ring-2 focus:border-transparent`}
          >
            {genreTierOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Sort By
          </label>
          <select
            value={activeFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            } focus:ring-2 focus:border-transparent`}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className={`text-sm font-medium ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Active filters:
          </span>
          
          {activeFilters.genre !== 'all' && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              darkMode
                ? 'bg-blue-900 text-blue-200'
                : 'bg-blue-100 text-blue-800'
            }`}>
              Genre: {genreOptions.find(g => g.value === activeFilters.genre)?.label}
              <button
                onClick={() => handleFilterChange('genre', 'all')}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.tier !== 'all' && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              darkMode
                ? 'bg-green-900 text-green-200'
                : 'bg-green-100 text-green-800'
            }`}>
              Tier: {tierOptions.find(t => t.value === activeFilters.tier)?.label.split(' ')[0]}
              <button
                onClick={() => handleFilterChange('tier', 'all')}
                className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.globalTier !== 'all' && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              darkMode
                ? 'bg-orange-900 text-orange-200'
                : 'bg-orange-100 text-orange-800'
            }`}>
              Global: {globalTierOptions.find(t => t.value === activeFilters.globalTier)?.label}
              <button
                onClick={() => handleFilterChange('globalTier', 'all')}
                className="ml-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.genreTier !== 'all' && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              darkMode
                ? 'bg-pink-900 text-pink-200'
                : 'bg-pink-100 text-pink-800'
            }`}>
              Genre: {genreTierOptions.find(t => t.value === activeFilters.genreTier)?.label}
              <button
                onClick={() => handleFilterChange('genreTier', 'all')}
                className="ml-1 hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.sortBy !== 'name' && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              darkMode
                ? 'bg-purple-900 text-purple-200'
                : 'bg-purple-100 text-purple-800'
            }`}>
              Sort: {sortOptions.find(s => s.value === activeFilters.sortBy)?.label}
              <button
                onClick={() => handleFilterChange('sortBy', 'name')}
                className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterControls;