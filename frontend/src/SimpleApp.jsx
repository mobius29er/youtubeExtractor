import React from 'react'

function SimpleApp() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Inter, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          🚀 YouTube Extractor Dashboard
        </h1>
        <div style={{
          backgroundColor: '#dcfce7',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#166534' }}>
            ✅ Dashboard is Loading Successfully!
          </h2>
          <p style={{ color: '#15803d', marginTop: '0.5rem' }}>
            CSS is working, no service worker conflicts detected.
          </p>
        </div>
        
        <TestAPIConnection />
      </div>
    </div>
  )
}

function TestAPIConnection() {
  const [status, setStatus] = React.useState('Ready to test...')
  const [data, setData] = React.useState(null)

  const testAPI = async () => {
    try {
      setStatus('🔄 Testing API connection...')
      const response = await fetch('/api/dashboard')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
      setStatus('✅ API Connected Successfully!')
    } catch (error) {
      setStatus(`❌ API Error: ${error.message}`)
      setData(null)
    }
  }

  return (
    <div style={{
      backgroundColor: '#eff6ff',
      padding: '1rem',
      borderRadius: '8px'
    }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem' }}>
        📊 API Connection Test
      </h3>
      <button 
        onClick={testAPI}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          border: 'none',
          fontWeight: '500',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
      >
        Test API Connection
      </button>
      
      <p style={{ color: '#1e40af', marginBottom: '1rem' }}>{status}</p>
      
      {data && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1rem', 
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}>
          <strong>API Response:</strong>
          <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default SimpleApp
