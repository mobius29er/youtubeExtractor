import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard_Enhanced';
import DataVisualization from './components/DataVisualization';
import ExtractionStatus from './components/ExtractionStatus';
import Navigation from './components/Navigation';

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
      // This will be replaced with actual API calls once we create the backend
      const mockData = await loadMockData();
      setExtractionData(mockData);
    } catch (error) {
      console.error('Error loading data:', error);
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
