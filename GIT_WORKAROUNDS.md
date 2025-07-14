# Git Command Workarounds for Shell Environment Issue

## Problem Description

The Bash tool is experiencing a persistent error:
```
zsh:source:1: no such file or directory: /var/folders/qt/rqc5r9ps2937_tbl98g_46d40000gn/T/claude-shell-snapshot-f46e
```

This error prevents all shell commands from executing, including git commands.

## Root Cause

The issue appears to be related to a missing shell snapshot file that the Bash tool relies on for maintaining shell state between commands. This is likely a temporary file that should be created automatically but isn't.

## Workarounds

I've created three different workarounds for executing git commands:

### 1. Shell Script (git_helper.sh)

**File:** `/Users/jpkim/moviemaker_mvp01/git_helper.sh`

**Note:** This script requires making it executable first, which currently can't be done due to the Bash tool issue. You'll need to run this in your terminal:
```bash
chmod +x /Users/jpkim/moviemaker_mvp01/git_helper.sh
```

**Usage:**
```bash
./git_helper.sh status
./git_helper.sh add .
./git_helper.sh commit -m "Your commit message"
./git_helper.sh push origin main
./git_helper.sh pull
./git_helper.sh init
./git_helper.sh log
```

### 2. Python Script (git_helper.py) - RECOMMENDED

**File:** `/Users/jpkim/moviemaker_mvp01/git_helper.py`

**Usage:**
```bash
python3 git_helper.py status
python3 git_helper.py add .
python3 git_helper.py commit -m "Your commit message"
python3 git_helper.py push origin main
python3 git_helper.py pull
python3 git_helper.py init
python3 git_helper.py log --oneline -10
```

**Features:**
- Works without needing chmod +x
- Captures and displays both stdout and stderr
- Returns proper exit codes
- Changes to the correct directory automatically

### 3. Node.js Script (git_helper.js)

**File:** `/Users/jpkim/moviemaker_mvp01/git_helper.js`

**Usage:**
```bash
node git_helper.js status
node git_helper.js add .
node git_helper.js commit -m "Your commit message"
node git_helper.js push origin main
node git_helper.js pull
node git_helper.js init
node git_helper.js log --oneline -10
```

**Features:**
- Works if Node.js is installed
- Real-time output streaming
- Proper error handling

## Additional Solutions to Try

### 1. Direct Terminal Usage
Since the Bash tool isn't working within Claude, you can run git commands directly in your terminal:
```bash
cd /Users/jpkim/moviemaker_mvp01
git status
git add .
git commit -m "Your message"
git push
```

### 2. GUI Tools
Consider using Git GUI tools:
- **GitHub Desktop** - User-friendly interface for Git
- **SourceTree** - Free Git GUI by Atlassian
- **GitKraken** - Cross-platform Git GUI
- **Tower** - Powerful Git client for Mac

### 3. VS Code Integration
If you're using VS Code, it has excellent built-in Git support:
- Use the Source Control panel (Ctrl+Shift+G or Cmd+Shift+G)
- Stage, commit, and push changes through the UI
- View diffs and history

## Troubleshooting the Original Issue

The root cause appears to be a missing temporary file. Potential fixes:

1. **Restart Claude CLI**: Sometimes restarting the Claude CLI tool can resolve temporary file issues.

2. **Check Permissions**: Ensure the temp directory has proper permissions:
   ```bash
   ls -la /var/folders/qt/rqc5r9ps2937_tbl98g_46d40000gn/T/
   ```

3. **Clear Temp Files**: The temp directory might be corrupted. You could try clearing old temp files (be careful with this).

4. **Environment Variables**: Check if any environment variables are affecting the shell:
   ```bash
   echo $TMPDIR
   echo $SHELL
   ```

## Quick Reference

For the Python workaround (most reliable):

| Command | Usage |
|---------|-------|
| Check status | `python3 git_helper.py status` |
| Stage all files | `python3 git_helper.py add .` |
| Stage specific file | `python3 git_helper.py add filename.txt` |
| Commit | `python3 git_helper.py commit -m "message"` |
| Push | `python3 git_helper.py push origin main` |
| Pull | `python3 git_helper.py pull` |
| View log | `python3 git_helper.py log --oneline -10` |
| Initialize repo | `python3 git_helper.py init` |

## Notes

- All scripts automatically change to the `/Users/jpkim/moviemaker_mvp01` directory before executing git commands
- The Python script is the most reliable since it doesn't require special permissions
- These workarounds bypass the Claude Bash tool entirely
- You can modify these scripts to add more git commands as needed