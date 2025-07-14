#!/bin/bash

# Setup branches for xBrush project
echo "🌿 Setting up branches for xBrush project..."

# Make sure we're on main and up to date
git checkout main
git pull origin main

# Create page-specific branches
echo "📄 Creating page branches..."

# Index/Video Creation Page
git checkout -b pages/index-video-creation
git push -u origin pages/index-video-creation
echo "✅ Created pages/index-video-creation"

# Models Showcase Page  
git checkout main
git checkout -b pages/models-showcase
git push -u origin pages/models-showcase
echo "✅ Created pages/models-showcase"

# Model Registration Page
git checkout main
git checkout -b pages/model-registration
git push -u origin pages/model-registration
echo "✅ Created pages/model-registration"

# Admin Panel
git checkout main
git checkout -b pages/admin-panel
git push -u origin pages/admin-panel
echo "✅ Created pages/admin-panel"

# Feature branches
echo "🚀 Creating feature branches..."

# Refactor app.js
git checkout main
git checkout -b refactor/split-app-js
git push -u origin refactor/split-app-js
echo "✅ Created refactor/split-app-js"

# Premium features
git checkout main
git checkout -b feature/premium-enhancements
git push -u origin feature/premium-enhancements
echo "✅ Created feature/premium-enhancements"

# Performance optimization
git checkout main
git checkout -b feature/performance-optimization
git push -u origin feature/performance-optimization
echo "✅ Created feature/performance-optimization"

# Return to main
git checkout main

echo "🎉 All branches created successfully!"
echo ""
echo "📋 Available branches:"
git branch -a | grep -E "pages/|feature/|refactor/"
echo ""
echo "💡 To work on a specific page:"
echo "   git checkout pages/index-video-creation"
echo "   git checkout pages/models-showcase"
echo "   etc."