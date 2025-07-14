# Git Helper Solutions for Claude Code

## Problem Summary
Claude Code has issues executing git commands due to shell environment limitations, resulting in errors like:
```
zsh:source:1: no such file or directory: /var/folders/.../claude-shell-snapshot-...
```

## Solutions Created

### 1. **claude-git.js** (RECOMMENDED)
The most robust solution specifically designed for Claude Code's environment.

**Features:**
- Multiple fallback strategies for finding git executable
- Clean environment handling
- Special commands for common workflows
- Detailed debug logging
- Handles complex git arguments properly

**Usage:**
```bash
# Basic commands
node claude-git.js status
node claude-git.js add .
node claude-git.js commit -m "Your message"
node claude-git.js push origin main

# Special commands
node claude-git.js quick-commit "Quick update"  # Adds all and commits
node claude-git.js sync                         # Pull then push
node claude-git.js amend "New message"          # Amend last commit

# Enable debug mode
export CLAUDE_GIT_DEBUG=true
node claude-git.js status
```

### 2. **git-helper-enhanced.js**
Advanced Node.js solution with multiple execution strategies.

**Features:**
- Four different execution strategies with automatic fallback
- Comprehensive error handling
- Argument parsing for complex commands
- Can be used as a module or standalone script

**Usage:**
```bash
node git-helper-enhanced.js status
node git-helper-enhanced.js commit -m "Message with spaces"

# Debug mode
export GIT_HELPER_DEBUG=true
node git-helper-enhanced.js status
```

### 3. **git-wrapper.sh**
Shell script wrapper with environment detection and multiple strategies.

**Features:**
- Checks and fixes shell environment issues
- Multiple execution strategies
- Falls back to Node.js or Python helpers

**Usage:**
```bash
./git-wrapper.sh status
./git-wrapper.sh add .
./git-wrapper.sh commit -m "Your message"

# Debug mode
export GIT_WRAPPER_DEBUG=true
./git-wrapper.sh status
```

### 4. **git_helper.py** (Original)
Simple Python solution that works reliably.

**Usage:**
```bash
python3 git_helper.py status
python3 git_helper.py add .
python3 git_helper.py commit -m "Your message"
```

## Why These Solutions Work

1. **Environment Isolation**: They create clean environments for git execution
2. **Path Resolution**: They find git executable even when PATH is corrupted
3. **No Shell State Dependency**: They don't rely on shell initialization files
4. **Error Recovery**: Multiple strategies ensure at least one will work

## Recommended Approach

Use **claude-git.js** as your primary solution because:
1. It's specifically designed for Claude Code's limitations
2. Has the most comprehensive feature set
3. Provides helpful special commands
4. Best error messages and debugging

## Quick Setup

1. All scripts are already created and executable
2. Test which works best in your environment:
   ```bash
   node claude-git.js status
   ```

3. Create an alias for convenience (add to your shell config):
   ```bash
   alias cgit='node /Users/jpkim/moviemaker_mvp01/claude-git.js'
   ```

4. Then use simply:
   ```bash
   cgit status
   cgit add .
   cgit commit -m "Your message"
   cgit push origin main
   ```

## Troubleshooting

If you still have issues:

1. **Enable debug mode**:
   ```bash
   export CLAUDE_GIT_DEBUG=true
   node claude-git.js status
   ```

2. **Check git location**:
   ```bash
   which git
   ```

3. **Verify permissions**:
   ```bash
   ls -la $(which git)
   ```

4. **Test with absolute path**:
   ```bash
   /usr/bin/git status
   ```

## Integration with Claude Code

When Claude Code needs to execute git commands, it can use:

```javascript
// In Claude Code context
const gitCommand = `node /Users/jpkim/moviemaker_mvp01/claude-git.js status`;
// Execute using Bash tool
```

This avoids shell environment issues while maintaining full git functionality.