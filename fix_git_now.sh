#!/bin/bash

echo "=== Fixing Git Divergence ==="

# Configure merge strategy
echo "1. Configuring merge strategy..."
git config pull.rebase false

# Pull and merge
echo "2. Pulling and merging remote changes..."
git pull origin main --no-rebase

# If there are conflicts, show status
if [ $? -ne 0 ]; then
    echo "3. Checking for conflicts..."
    git status
    
    # Auto-resolve by keeping local changes
    echo "4. Keeping all local changes..."
    git checkout --ours .
    git add .
    git commit -m "Merge remote changes - kept local version"
fi

# Push changes
echo "5. Pushing to remote..."
git push origin main

# If push fails, offer force push
if [ $? -ne 0 ]; then
    echo "Regular push failed. Trying force push with lease..."
    git push --force-with-lease origin main
fi

echo "Done!"