#!/bin/bash
# Test all git helper solutions

echo "Testing Git Helper Solutions"
echo "============================"
echo

# Test claude-git.js
echo "1. Testing claude-git.js:"
echo "------------------------"
if node claude-git.js status > /dev/null 2>&1; then
    echo "✅ claude-git.js works!"
else
    echo "❌ claude-git.js failed"
fi
echo

# Test git-helper-enhanced.js
echo "2. Testing git-helper-enhanced.js:"
echo "---------------------------------"
if node git-helper-enhanced.js status > /dev/null 2>&1; then
    echo "✅ git-helper-enhanced.js works!"
else
    echo "❌ git-helper-enhanced.js failed"
fi
echo

# Test git-wrapper.sh
echo "3. Testing git-wrapper.sh:"
echo "-------------------------"
if ./git-wrapper.sh status > /dev/null 2>&1; then
    echo "✅ git-wrapper.sh works!"
else
    echo "❌ git-wrapper.sh failed"
fi
echo

# Test git_helper.py
echo "4. Testing git_helper.py:"
echo "------------------------"
if python3 git_helper.py status > /dev/null 2>&1; then
    echo "✅ git_helper.py works!"
else
    echo "❌ git_helper.py failed"
fi
echo

# Test direct git command
echo "5. Testing direct git command:"
echo "-----------------------------"
if git status > /dev/null 2>&1; then
    echo "✅ Direct git command works!"
else
    echo "❌ Direct git command failed"
fi
echo

echo "Test complete!"