#!/bin/bash

# Navigate to the project directory
cd /Users/jpkim/moviemaker_mvp01

echo "=== Step 1: Adding all changes ==="
git add -A

echo -e "\n=== Step 2: Git status ==="
git status

echo -e "\n=== Step 3: Creating commit ==="
git commit -m "Add premium models feature and celebrity migration

- Implemented premium/VIP tier system for models
- Premium models appear at top of showcase and movie maker
- Added admin controls for managing premium status
- Created migration script for 7 celebrity models
- Updated database schema for face licensing model
- Added visual enhancements for premium model cards

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

echo -e "\n=== Step 4: Pushing to origin main ==="
git push origin main

echo -e "\n=== Complete! ==="