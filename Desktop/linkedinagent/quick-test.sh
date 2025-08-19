#!/bin/bash

echo "🚀 Quick LinkedIn Agent Test" && echo "=========================" && echo "" && npm run health && echo "" && npm run discover && echo "" && npm run engage && echo "" && echo "📊 Results:" && echo "Posts: $(cat data/posts.json 2>/dev/null | jq '.posts | length' 2>/dev/null || echo '0')" && echo "Drafts: $(cat data/drafts.json 2>/dev/null | jq 'length' 2>/dev/null || echo '0')" && echo "" && echo "✅ Test complete! Start dashboard with: npm run dev"
