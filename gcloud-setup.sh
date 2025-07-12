#!/bin/bash

echo "🚀 Setting up Google Cloud SDK for xBrush MovieMaker MVP"
echo ""

# Set the project
echo "Setting default project to xbrush-moviemaker-mvp..."
gcloud config set project xbrush-moviemaker-mvp

# Show current configuration
echo ""
echo "Current configuration:"
gcloud config list

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: gcloud auth login"
echo "2. Enable any additional APIs you need"
echo "3. You can now use gcloud commands!"
echo ""
echo "Useful commands:"
echo "- gcloud projects describe xbrush-moviemaker-mvp"
echo "- gcloud services list --enabled"
echo "- gcloud app deploy (if using App Engine)"
echo "- gcloud functions list (if using Cloud Functions)"