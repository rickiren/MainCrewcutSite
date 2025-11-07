#!/bin/bash

echo "🚀 Starting production deployment..."

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not logged into Firebase. Run: firebase login"
    exit 1
fi

# Install function dependencies
echo "📦 Installing function dependencies..."
cd functions && npm install && cd ..

# Deploy function
echo "☁️  Deploying Firebase Function..."
firebase deploy --only functions

# Get the function URL
echo ""
echo "📋 Getting function URL..."
FUNCTION_URL=$(firebase functions:list 2>/dev/null | grep claude | awk '{print $2}' || echo "")

if [ -z "$FUNCTION_URL" ]; then
    echo "⚠️  Could not automatically detect function URL."
    echo "   Please check Firebase Console → Functions to get the URL"
    echo "   Then update VITE_FIREBASE_FUNCTION_URL in your .env file"
else
    echo "✅ Function URL: $FUNCTION_URL"
    echo "   Make sure VITE_FIREBASE_FUNCTION_URL is set to this URL"
fi

# Build frontend
echo ""
echo "🏗️  Building frontend..."
npm run build

# Deploy frontend
echo ""
echo "🌐 Deploying frontend..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "🌍 Visit: https://crewcut-main.web.app"
