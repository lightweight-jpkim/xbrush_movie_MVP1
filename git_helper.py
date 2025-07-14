#!/usr/bin/env python3
"""
Git helper script to work around shell environment issues
"""

import subprocess
import sys
import os

def run_git_command(args):
    """Execute a git command and return the result"""
    try:
        # Change to the working directory
        os.chdir('/Users/jpkim/moviemaker_mvp01')
        
        # Run the git command
        result = subprocess.run(['git'] + args, 
                              capture_output=True, 
                              text=True,
                              check=False)
        
        # Print output
        if result.stdout:
            print(result.stdout, end='')
        if result.stderr:
            print(result.stderr, end='', file=sys.stderr)
        
        return result.returncode
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 git_helper.py <command> [args]")
        print("Examples:")
        print("  python3 git_helper.py status")
        print("  python3 git_helper.py add .")
        print("  python3 git_helper.py commit -m 'Your message'")
        print("  python3 git_helper.py push origin main")
        print("  python3 git_helper.py pull")
        print("  python3 git_helper.py init")
        print("  python3 git_helper.py log --oneline -10")
        sys.exit(1)
    
    # Get git command and arguments
    git_args = sys.argv[1:]
    
    # Run the git command
    exit_code = run_git_command(git_args)
    sys.exit(exit_code)

if __name__ == "__main__":
    main()