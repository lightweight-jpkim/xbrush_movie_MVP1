#!/usr/bin/env python3
import subprocess
import os

# Make the command file executable
os.chmod('/Users/jpkim/moviemaker_mvp01/CLICK_TO_FIX_GIT.command', 0o755)

# Run the auto fix
exec(open('/Users/jpkim/moviemaker_mvp01/auto_fix_git.py').read())