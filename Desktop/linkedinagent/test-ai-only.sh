#!/bin/bash

# AI-Only Test Script
# This tests just the Anthropic integration without LinkedIn automation

echo "🤖 Testing Anthropic AI Integration Only"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check environment setup
print_status "Checking environment configuration..."

if [ ! -f .env ]; then
    print_error ".env file not found!"
    echo "Please create a .env file with your ANTHROPIC_API_KEY"
    echo "You can copy from env.example: cp env.example .env"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$ANTHROPIC_API_KEY" ]; then
    print_error "ANTHROPIC_API_KEY not found in .env file!"
    echo "Please add your Anthropic API key to the .env file"
    echo "Current .env contents:"
    cat .env | grep -v PASSWORD
    exit 1
fi

print_success "Environment configuration found"
print_success "API Key: ${ANTHROPIC_API_KEY:0:20}..."
echo ""

# Create sample store data for testing (correct format and path for engage script)
print_status "Creating sample store data for AI testing..."

# Ensure .data directory exists
mkdir -p .data

cat > .data/store.json << 'EOF'
{
  "posts": [
    {
      "id": "sample-1",
      "url": "https://linkedin.com/posts/sample-1",
      "text": "Excited to share insights on multifamily real estate trends! The market is showing strong fundamentals with increasing demand for quality housing. Key factors driving growth include urbanization, demographic shifts, and investment interest. What trends are you seeing in your market?",
      "authorName": "Sarah Johnson",
      "authorTitle": "Real Estate Investment Manager",
      "authorCompany": "Metro Properties",
      "createdAtISO": "2024-01-19T10:00:00.000Z",
      "likeCount": 45,
      "commentCount": 12
    },
    {
      "id": "sample-2", 
      "url": "https://linkedin.com/posts/sample-2",
      "text": "Just completed a comprehensive analysis of Q4 multifamily performance across major markets. Key findings: rental growth remains strong, occupancy rates are stable, and cap rates are compressing. The data suggests continued investor confidence in the sector.",
      "authorName": "Michael Chen",
      "authorTitle": "Senior Analyst",
      "authorCompany": "Real Estate Analytics Co",
      "createdAtISO": "2024-01-19T09:30:00.000Z",
      "likeCount": 32,
      "commentCount": 8
    },
    {
      "id": "sample-3",
      "url": "https://linkedin.com/posts/sample-3", 
      "text": "Fascinating discussion today about the future of multifamily development. Technology integration, sustainability features, and community amenities are becoming table stakes. Investors are looking for properties that offer more than just housing - they want lifestyle experiences.",
      "authorName": "Emily Rodriguez",
      "authorTitle": "Development Director",
      "authorCompany": "Urban Living Partners",
      "createdAtISO": "2024-01-19T08:45:00.000Z",
      "likeCount": 28,
      "commentCount": 15
    }
  ],
  "queue": []
}
EOF

print_success "Created sample store data with 3 posts in .data/store.json"
echo ""

# Test AI generation
print_status "Testing Anthropic AI integration..."
echo "This will generate comments and DMs for the sample posts..."
echo ""

# Run the engage command directly
if npm run engage; then
    print_success "AI generation completed successfully!"
else
    print_error "AI generation failed"
    echo "This might indicate Anthropic API issues"
    echo ""
    echo "Debugging steps:"
    echo "1. Check your API key is correct"
    echo "2. Verify you have Anthropic API credits"
    echo "3. Check the error messages above"
    exit 1
fi

echo ""

# Show results
print_status "Results Summary:"
echo "-------------------"

if [ -f "data/drafts.json" ]; then
    DRAFT_COUNT=$(cat data/drafts.json | jq 'length' 2>/dev/null || echo "0")
    print_success "Engagement drafts generated: $DRAFT_COUNT"
    
    echo ""
    echo "📋 Sample of generated content:"
    echo "================================"
    
    # Show first draft as example
    cat data/drafts.json | jq '.[0] | {author: .author_name, comment: .draft_comment, dm: .draft_dm}' 2>/dev/null || echo "Could not parse drafts.json"
    
else
    echo "❌ No drafts were generated"
fi

echo ""
print_success "AI integration test completed!"
echo ""
echo "📱 Next steps:"
echo "1. Start the dashboard: npm run dev"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Check the Drafts tab to see AI-generated content"
echo ""
echo "🔍 To view all generated drafts:"
echo "   cat data/drafts.json | jq '.[] | {author: .author_name, comment: .draft_comment}'"
echo ""
echo "🧹 To clean up test data:"
echo "   rm -f .data/store.json data/drafts.json"
echo ""
