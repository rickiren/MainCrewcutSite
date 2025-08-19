#!/bin/bash

# Robust LinkedIn Agent Testing Script
# This script handles common failures and provides better error recovery

echo "🛡️  Robust LinkedIn Agent Testing"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
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
    exit 1
fi

print_success "Environment configuration found"
echo ""

# Function to check if a process is stuck (macOS compatible)
check_stuck_process() {
    local process_name=$1
    local timeout=$2
    
    print_status "Starting $process_name with $timeout second timeout..."
    
    # Start the process in background
    npm run $process_name &
    local pid=$!
    
    # Wait for the process with timeout (macOS compatible)
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if ! kill -0 $pid 2>/dev/null; then
            # Process finished
            wait $pid
            local exit_code=$?
            if [ $exit_code -eq 0 ]; then
                print_success "$process_name completed successfully"
                return 0
            else
                print_error "$process_name failed with exit code $exit_code"
                return 1
            fi
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    # Timeout reached
    print_warning "$process_name timed out after $timeout seconds"
    print_status "Killing stuck process..."
    
    # Kill the process and any related processes
    kill $pid 2>/dev/null || true
    pkill -f "tsx.*$process_name" 2>/dev/null || true
    pkill -f "node.*$process_name" 2>/dev/null || true
    
    return 1
}

# Step 1: Health Check (with timeout)
print_status "Step 1: Checking LinkedIn Health Status..."
echo "--------------------------------------------"

if check_stuck_process "health" 60; then
    print_success "LinkedIn health check passed"
else
    print_warning "LinkedIn health check failed or timed out"
    print_status "This might indicate login issues or rate limiting"
fi

echo ""

# Step 2: Discovery (with longer timeout and recovery)
print_status "Step 2: Discovering LinkedIn Posts..."
echo "----------------------------------------"

# Clear any existing data to start fresh
rm -f data/posts.json data/drafts.json

# Try discovery with timeout
if check_stuck_process "discover" 300; then  # 5 minute timeout
    print_success "LinkedIn discovery completed"
else
    print_warning "LinkedIn discovery failed or timed out"
    print_status "This is common with LinkedIn automation - let's try a different approach"
    
    # Check if we have any posts despite the timeout
    if [ -f "data/posts.json" ]; then
        POST_COUNT=$(cat data/posts.json 2>/dev/null | jq '.posts | length' 2>/dev/null || echo "0")
        if [ "$POST_COUNT" -gt "0" ]; then
            print_success "Found $POST_COUNT posts despite timeout - continuing with workflow"
        else
            print_error "No posts found - discovery failed completely"
            print_status "You may need to:"
            print_status "1. Check LinkedIn login status"
            print_status "2. Wait for rate limits to reset"
            print_status "3. Check for captcha on LinkedIn"
            exit 1
        fi
    else
        print_error "No posts.json file created - discovery failed completely"
        exit 1
    fi
fi

echo ""

# Step 3: Generate Engagement Drafts
print_status "Step 3: Generating Engagement Drafts..."
echo "------------------------------------------"

if check_stuck_process "engage" 120; then  # 2 minute timeout
    print_success "Engagement draft generation completed"
else
    print_error "Engagement draft generation failed or timed out"
    print_status "This might indicate Anthropic API issues"
    exit 1
fi

echo ""

# Step 4: Results Summary
print_status "Step 4: Results Summary"
echo "---------------------------"

# Check discovered posts
if [ -f "data/posts.json" ]; then
    POST_COUNT=$(cat data/posts.json | jq '.posts | length' 2>/dev/null || echo "0")
    print_success "Posts discovered: $POST_COUNT"
else
    print_warning "Posts discovered: 0 (no posts.json file)"
fi

# Check generated drafts
if [ -f "data/drafts.json" ]; then
    DRAFT_COUNT=$(cat data/drafts.json | jq 'length' 2>/dev/null || echo "0")
    print_success "Engagement drafts generated: $DRAFT_COUNT"
else
    print_warning "Engagement drafts generated: 0 (no drafts.json file)"
fi

echo ""
print_success "Workflow test completed!"
echo ""

# Recommendations based on results
if [ "$POST_COUNT" -eq "0" ]; then
    print_warning "No posts were discovered. This might indicate:"
    print_status "- LinkedIn login issues"
    print_status "- Rate limiting or captcha"
    print_status "- Network connectivity problems"
    print_status "- LinkedIn page structure changes"
elif [ "$POST_COUNT" -lt "5" ]; then
    print_warning "Few posts discovered. This might indicate:"
    print_status "- Discovery criteria too restrictive"
    print_status "- LinkedIn showing limited content"
    print_status "- Need to adjust niche configuration"
fi

if [ "$DRAFT_COUNT" -eq "0" ]; then
    print_warning "No drafts generated. This might indicate:"
    print_status "- Anthropic API key issues"
    print_status "- API rate limits"
    print_status "- No posts to work with"
fi

echo ""
print_status "Next steps:"
echo "1. Start the dashboard: npm run dev"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Check the Dashboard tab to see discovered posts"
echo "4. Check the Drafts tab to see generated comments/DMs"
echo ""
print_status "To monitor the process in real-time:"
echo "   tail -f data/drafts.json"
echo ""
print_status "If you encounter issues:"
echo "   - Check the TESTING_GUIDE.md for troubleshooting"
echo "   - Wait 10-15 minutes before retrying (rate limiting)"
echo "   - Verify your LinkedIn login status"
echo ""
