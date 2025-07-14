#!/usr/bin/env python3
import subprocess
import os
import sys

def run_cmd(cmd):
    """Run command and return success status"""
    result = subprocess.run(cmd, capture_output=True, text=True, cwd='/Users/jpkim/moviemaker_mvp01')
    return result.returncode == 0, result.stdout, result.stderr

# Change to project directory
os.chdir('/Users/jpkim/moviemaker_mvp01')

print("Executing git fix...")

# Step 1: Configure git
run_cmd(['git', 'config', 'pull.rebase', 'false'])

# Step 2: Stash current changes
run_cmd(['git', 'stash', '-u'])  # -u includes untracked files

# Step 3: Pull and merge
success, out, err = run_cmd(['git', 'pull', 'origin', 'main', '--no-edit'])

# Step 4: Apply stashed changes back
run_cmd(['git', 'stash', 'pop'])

# Step 5: Add all changes
run_cmd(['git', 'add', '.'])

# Step 6: Commit
commit_message = """Complete database integration and flexible licensing system

- Unified database access using modelStorageAdapter  
- Created flexible licensing system
- Added model pricing dashboard
- Created admin review system
- Fixed git divergence

Co-Authored-By: Claude <noreply@anthropic.com>"""

run_cmd(['git', 'commit', '-m', commit_message])

# Step 7: Push (try normal first, then force if needed)
success, out, err = run_cmd(['git', 'push', 'origin', 'main'])
if not success:
    # Force push with lease (safer than --force)
    success, out, err = run_cmd(['git', 'push', '--force-with-lease', 'origin', 'main'])

# Final status check
success, status, err = run_cmd(['git', 'status', '--porcelain'])
if not status:
    print("SUCCESS: All changes pushed to GitHub!")
else:
    print("Some files remain:", status)

# Show remote status
run_cmd(['git', 'log', '--oneline', '-n', '1'])