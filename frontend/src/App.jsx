import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import DataVisualization from './components/DataVisualization';
import ExtractionStatus from './components/ExtractionStatus';
import VideoPerformancePredictor from './components/VideoPerformancePredictor';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [extractionData, setExtractionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data when app starts
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading dashboard data...');
      
      // Try the proxied API endpoint
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API data loaded successfully:', data);
      setExtractionData(data);
      
    } catch (error) {
      console.error('❌ Error loading data from API:', error);
      console.log('🔄 Falling back to mock data...');
      
      // Use mock data as fallback
      setExtractionData({
        totalVideos: 773,
        totalChannels: 20,
        totalViews: 45000000,
        extractionComplete: true,
        healthScore: 77,
        dataSource: "Fallback (API Error)",
        lastUpdated: new Date().toISOString(),
        stats: {
          avgViews: 58000,
          avgLikes: 2400,
          avgComments: 150,
          topPerformingGenre: "Challenge/Stunts"
        },
        channels: [
          { name: 'MrBeast', videos: 40, status: 'complete' },
          { name: 'VeggieTales Official', videos: 40, status: 'complete' },
          { name: 'SciShow', videos: 40, status: 'complete' },
          { name: 'Kurzgesagt', videos: 40, status: 'complete' },
          { name: 'PewdiePie', videos: 40, status: 'complete' },
          { name: 'Ascension Presents', videos: 40, status: 'complete' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data loader - replace with actual API calls
  const loadMockData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalVideos: 560,
          totalChannels: 14,
          extractionComplete: true,
          healthScore: 100,
          lastUpdated: new Date().toISOString(),
          channels: [
            { name: 'MrBeast', videos: 40, status: 'complete' },
            { name: 'VeggieTales Official', videos: 40, status: 'complete' },
            { name: 'SciShow', videos: 40, status: 'complete' },
            // Add more mock channel data
          ],
          stats: {
            avgViews: 2500000,
            avgLikes: 85000,
            avgComments: 12500,
            topPerformingGenre: 'Challenge/Stunts'
          }
        });
      }, 1000);
    });
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <Navigation 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          onRefresh={loadData}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                data={extractionData} 
                loading={loading}
                darkMode={darkMode}
              />
            } />
            <Route path="/visualization" element={
              <DataVisualization 
                data={extractionData} 
                loading={loading}
                darkMode={darkMode}
              />
            } />
            <Route path="/predictor" element={
              <VideoPerformancePredictor 
                darkMode={darkMode}
              />
            } />
            <Route path="/status" element={
              <ExtractionStatus 
                data={extractionData} 
                loading={loading}
                darkMode={darkMode}
                onRefresh={loadData}
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
