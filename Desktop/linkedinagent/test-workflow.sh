#!/bin/bash

# LinkedIn Agent Complete Workflow Test Script
# This script tests the full pipeline: login -> discover -> engage

echo "🚀 Starting LinkedIn Agent Complete Workflow Test"
echo "=================================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your ANTHROPIC_API_KEY"
    echo "You can copy from env.example: cp env.example .env"
    exit 1
fi

# Check if ANTHROPIC_API_KEY is set
if ! grep -q "ANTHROPIC_API_KEY=" .env; then
    echo "❌ Error: ANTHROPIC_API_KEY not found in .env file!"
    echo "Please add your Anthropic API key to the .env file"
    exit 1
fi

echo "✅ Environment configuration found"
echo ""

# Step 1: Check LinkedIn Health/Login Status
echo "🔍 Step 1: Checking LinkedIn Health Status..."
echo "--------------------------------------------"
npm run health
echo ""

# Step 2: Discover LinkedIn Posts
echo "🔍 Step 2: Discovering LinkedIn Posts..."
echo "----------------------------------------"
echo "This will find posts based on your niche configuration..."
npm run discover
echo ""

# Step 3: Generate Engagement Drafts
echo "💬 Step 3: Generating Engagement Drafts..."
echo "------------------------------------------"
echo "This will use Claude to generate comments and DMs..."
npm run engage
echo ""

# Step 4: Display Results Summary
echo "📊 Step 4: Results Summary"
echo "---------------------------"
echo "Checking generated data..."

# Check if posts were discovered
if [ -f "data/posts.json" ]; then
    POST_COUNT=$(jq '.posts | length' data/posts.json 2>/dev/null || echo "0")
    echo "📝 Posts discovered: $POST_COUNT"
else
    echo "📝 Posts discovered: 0 (no posts.json file)"
fi

# Check if drafts were generated
if [ -f "data/drafts.json" ]; then
    DRAFT_COUNT=$(jq 'length' data/drafts.json 2>/dev/null || echo "0")
    echo "💬 Engagement drafts generated: $DRAFT_COUNT"
else
    echo "💬 Engagement drafts generated: 0 (no drafts.json file)"
fi

echo ""
echo "🎉 Workflow test completed!"
echo ""
echo "📱 Next steps:"
echo "1. Start the dashboard: npm run dev"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Check the Dashboard tab to see discovered posts"
echo "4. Check the Drafts tab to see generated comments/DMs"
echo ""
echo "🔍 To monitor the process in real-time:"
echo "   tail -f data/drafts.json"
echo ""
