#!/bin/bash
# Railway build script for YouTube Extractor
set -e

echo "🚀 Starting YouTube Extractor build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements-railway.txt

# Check if Node.js is available and install frontend dependencies
if command -v node >/dev/null 2>&1; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    
    echo "🔨 Building React frontend..."
    npm run build
    
    echo "📁 Moving built files to root..."
    cd ..
    
    # Create dist directory in the right location for FastAPI
    mkdir -p dist
    cp -r frontend/dist/* dist/
    
    echo "✅ Frontend build complete!"
else
    echo "⚠️  Node.js not available, skipping frontend build"
    echo "Creating minimal index.html fallback..."
    mkdir -p dist
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>YouTube Extractor</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
        .status { color: #28a745; font-weight: bold; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .api-link { color: #007bff; text-decoration: none; }
        .api-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 YouTube Extractor</h1>
        <p class="status">✅ Backend API is running successfully!</p>
        
        <div class="info">
            <h3>📡 API Endpoints Available:</h3>
            <ul>
                <li><a href="/api/data" class="api-link">/api/data</a> - Get YouTube channel data</li>
                <li><a href="/api/metadata" class="api-link">/api/metadata</a> - Get extraction metadata</li>
                <li><a href="/api/status" class="api-link">/api/status</a> - System status</li>
                <li><a href="/docs" class="api-link">/docs</a> - Interactive API documentation</li>
            </ul>
        </div>
        
        <p><strong>Note:</strong> This is a simplified interface. The full React dashboard will be available after frontend build setup.</p>
        
        <script>
            // Auto-redirect to API docs for better user experience
            setTimeout(() => {
                if (confirm('Would you like to view the interactive API documentation?')) {
                    window.location.href = '/docs';
                }
            }, 3000);
        </script>
    </div>
</body>
</html>
EOF
fi

echo "🎉 Build process complete!"