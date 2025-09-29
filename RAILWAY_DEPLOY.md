# Railway Deployment Configuration

## Backend Service
**Start Command**: `uvicorn src.api_server:app --host 0.0.0.0 --port $PORT`
**Root Directory**: `/`
**Build Command**: `pip install -r requirements.txt`

## Frontend Service  
**Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`
**Root Directory**: `/frontend`
**Build Command**: `npm install && npm run build`

## Environment Variables Needed
```
NODE_ENV=production
ALLOWED_ORIGINS=https://youtubeextractor-frontend.up.railway.app
DATA_DIR=/app/extracted_data
MODELS_DIR=/app/extracted_data/models
```

## Deployment Steps
1. Connect GitHub repository to Railway
2. Create backend service (Python/FastAPI)
3. Create frontend service (Node.js/Vite)
4. Set environment variables
5. Deploy both services