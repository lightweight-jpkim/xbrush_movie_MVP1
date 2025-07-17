#!/bin/bash

echo "🚀 Pushing to both repositories..."
echo "================================="

# Push to original (JPJPKIMJP)
echo "1. Pushing to JPJPKIMJP..."
git push origin main && echo "✅ Success" || echo "❌ Failed"

# Push to lightweight-jpkim
echo ""
echo "2. Pushing to lightweight-jpkim..."
git push neworigin main && echo "✅ Success" || echo "❌ Failed"

echo ""
echo "📋 Status:"
echo "- JPJPKIMJP: https://jpjpkimjp.github.io/xbrush_movie_MVP1/"
echo "- lightweight-jpkim: https://lightweight-jpkim.github.io/xbrush_movie_MVP1/"
echo ""

# Check deployment status
echo "🔍 Checking deployments..."
sleep 5
echo "- JPJPKIMJP Actions: https://github.com/JPJPKIMJP/xbrush_movie_MVP1/actions"
echo "- lightweight-jpkim Actions: https://github.com/lightweight-jpkim/xbrush_movie_MVP1/actions"
echo ""
echo "✨ Done!"