import React, { useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const testAPI = async () => {
    console.log('🔘 Button clicked - testing API...');
    setLoading(true);
    setData({ status: 'Testing API connection...' });
    
    try {
      console.log('📡 Testing proxy: /api/dashboard...');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/dashboard', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ API Success:', result);
      setData(result);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('⏱️ API Timeout after 5 seconds');
        setData({ 
          error: 'API request timed out after 5 seconds',
          details: 'This suggests the proxy or backend might not be responding'
        });
      } else {
        console.error('❌ API Error:', error);
        setData({ 
          error: error.message,
          details: 'Check browser console and network tab for more info'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Test direct backend connection (bypass proxy)
  const testDirectAPI = async () => {
    console.log('🎯 Testing direct backend connection...');
    setLoading(true);
    setData({ status: 'Testing direct backend...' });
    
    try {
      const response = await fetch('http://localhost:8000/api/dashboard');
      const result = await response.json();
      console.log('✅ Direct API Success:', result);
      setData(result);
    } catch (error) {
      console.error('❌ Direct API Error:', error);
      setData({ 
        error: `Direct connection failed: ${error.message}`,
        details: 'This suggests CORS or backend issues'
      });
    } finally {
      setLoading(false);
    }
  };

  // Simple button click test
  const testButton = () => {
    console.log('🔘 Simple button test - this should log to console');
    alert('Button is working! Check console for logs.');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        🚀 YouTube Extractor Dashboard
      </h1>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <strong>✅ React App Working!</strong>
        <p>If you can see this, the React app is rendering correctly.</p>
      </div>

      <div className="mb-4 space-x-4">
        <button 
          onClick={testButton}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Button Click
        </button>
        
        <button 
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
        >
          {loading ? 'Testing...' : 'Test Proxy API'}
        </button>
        
        <button 
          onClick={testDirectAPI}
          disabled={loading}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-red-300"
        >
          Test Direct API
        </button>
      </div>

      {data && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-bold mb-2">API Response:</h3>
          <pre className="text-sm overflow-auto bg-white p-2 rounded border">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 bg-blue-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">📊 Expected Data</h2>
        <p>Backend should have: 773 videos from 20 channels</p>
        <p>API Server: http://localhost:8000</p>
        <p>Frontend: http://localhost:3001</p>
        <p className="text-sm text-gray-600 mt-2">
          💡 Tip: Open browser console (F12) to see detailed logs
        </p>
      </div>
    </div>
  );
}

export default App;
