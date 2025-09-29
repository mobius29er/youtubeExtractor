import React, { useState, useRef } from 'react';
import { Upload, Brain, TrendingUp, Eye, Target, Tag, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const VideoPerformancePredictor = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    subscriberCount: ''
  });
  
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  
  const genres = [
    { value: 'gaming', label: '🎮 Gaming', ctrSupported: true },
    { value: 'education_science', label: '🔬 Education & Science', ctrSupported: true },
    { value: 'challenge_stunts', label: '🎯 Challenges & Stunts', ctrSupported: true },
    { value: 'catholic', label: '⛪ Christian/Catholic', ctrSupported: true },
    { value: 'kids_family', label: '👨‍👩‍👧‍👦 Kids & Family', ctrSupported: false },
    { value: 'other', label: '🎬 Other', ctrSupported: true }
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPredictions(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('subscriber_count', formData.subscriberCount);
      
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }
      
      // Use environment-aware URL for predictions
      const predictionUrl = process.env.NODE_ENV === 'production' 
        ? '/api/predict'  // Railway will handle routing between services
        : '/api/predict'; // Vite proxy handles local development
      
      const response = await fetch(predictionUrl, {
        method: 'POST',
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setPredictions(result);
      
    } catch (err) {
      setError(`Prediction failed: ${err.message}`);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num?.toLocaleString();
  };
  
  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  const selectedGenre = genres.find(g => g.value === formData.genre);
  
  return (
    <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">🔮 Video Performance Predictor</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            AI-powered predictions using your trained ML models
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            📝 Video Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter your video title..."
            className={`w-full p-3 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            required
          />
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Length: {formData.title.length} characters • Words: {formData.title.split(' ').filter(w => w).length}
          </p>
        </div>
        
        {/* Genre Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🎯 Content Genre *
          </label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            className={`w-full p-3 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            required
          >
            <option value="">Select genre...</option>
            {genres.map(genre => (
              <option key={genre.value} value={genre.value}>
                {genre.label} {!genre.ctrSupported ? '(No CTR)' : ''}
              </option>
            ))}
          </select>
          {selectedGenre && !selectedGenre.ctrSupported && (
            <p className="text-yellow-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              CTR prediction not available for Kids & Family genre
            </p>
          )}
        </div>
        
        {/* Subscriber Count */}
        <div>
          <label className="block text-sm font-medium mb-2">
            👥 Subscriber Count *
          </label>
          <input
            type="number"
            name="subscriberCount"
            value={formData.subscriberCount}
            onChange={handleInputChange}
            placeholder="e.g., 100000"
            min="0"
            className={`w-full p-3 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            required
          />
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {formData.subscriberCount ? `${formatNumber(parseInt(formData.subscriberCount))} subscribers` : 'Enter your channel subscriber count'}
          </p>
        </div>
        
        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🖼️ Thumbnail (Optional)
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              darkMode 
                ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
            
            {thumbnailPreview ? (
              <div className="space-y-3">
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview" 
                  className="mx-auto max-h-32 rounded-lg shadow-md"
                />
                <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Thumbnail uploaded successfully
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnail(null);
                    setThumbnailPreview(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove thumbnail
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className={`w-8 h-8 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Click to upload thumbnail
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  JPG, PNG up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.title || !formData.genre || !formData.subscriberCount}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            loading || !formData.title || !formData.genre || !formData.subscriberCount
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Analyzing with AI...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" />
              Predict Performance
            </div>
          )}
        </button>
      </form>
      
      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Prediction Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}
      
      {/* Predictions Display */}
      {predictions && !predictions.error && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-bold">📊 AI Predictions</h3>
          </div>
          
          {/* Prediction Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Views Prediction */}
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Predicted Views</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(predictions.predicted_views)}
              </div>
              <div className={`text-xs mt-1 ${getConfidenceColor(predictions.confidence?.views)}`}>
                Confidence: {predictions.confidence?.views}
              </div>
            </div>
            
            {/* RQS Prediction */}
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="font-medium">RQS Score</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {predictions.predicted_rqs}%
              </div>
              <div className={`text-xs mt-1 ${getConfidenceColor(predictions.confidence?.rqs)}`}>
                Confidence: {predictions.confidence?.rqs}
              </div>
            </div>
            
            {/* CTR Prediction */}
            <div className={`p-4 rounded-lg border ${
              predictions.predicted_ctr 
                ? darkMode ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'
                : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-5 h-5 ${predictions.predicted_ctr ? 'text-purple-500' : 'text-gray-400'}`} />
                <span className="font-medium">Click-Through Rate</span>
              </div>
              <div className={`text-2xl font-bold ${predictions.predicted_ctr ? 'text-purple-600' : 'text-gray-400'}`}>
                {predictions.predicted_ctr ? `${predictions.predicted_ctr}%` : 'N/A'}
              </div>
              <div className={`text-xs mt-1 ${
                predictions.predicted_ctr 
                  ? getConfidenceColor(predictions.confidence?.ctr)
                  : 'text-gray-400'
              }`}>
                {predictions.ctr_note || `Confidence: ${predictions.confidence?.ctr}`}
              </div>
            </div>
          </div>
          
          {/* Recommended Tags */}
          {predictions.recommended_tags && predictions.recommended_tags.length > 0 && (
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">🏷️ Recommended Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {predictions.recommended_tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      darkMode 
                        ? 'bg-yellow-800 text-yellow-200' 
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Prediction Metadata */}
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} border-t pt-4`}>
            <p>🤖 Prediction generated using your trained ML models</p>
            <p>📅 Generated: {new Date(predictions.input_data?.prediction_date).toLocaleString()}</p>
            {predictions.input_data?.has_thumbnail && <p>🖼️ Thumbnail analysis included</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPerformancePredictor;