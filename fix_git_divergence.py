#!/usr/bin/env python3
"""
Script to fix git divergence issue automatically
"""

import subprocess
import sys
import os

def run_command(cmd):
    """Execute a command and return the result"""
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(f"Error: {result.stderr}")
    
    return result.returncode == 0, result.stdout, result.stderr

def main():
    os.chdir('/Users/jpkim/moviemaker_mvp01')
    
    print("=== Fixing Git Divergence ===")
    
    # Step 1: Configure merge strategy
    print("\n1. Configuring merge strategy...")
    run_command(['git', 'config', 'pull.rebase', 'false'])
    
    # Step 2: Check current status
    print("\n2. Checking current status...")
    success, stdout, stderr = run_command(['git', 'status'])
    
    # Step 3: Pull with merge
    print("\n3. Pulling remote changes with merge...")
    success, stdout, stderr = run_command(['git', 'pull', 'origin', 'main'])
    
    if not success and "CONFLICT" in stderr + stdout:
        print("\n4. Merge conflicts detected. Auto-resolving...")
        # List conflicted files
        run_command(['git', 'status', '--porcelain'])
        
        # For now, let's accept all local changes (yours)
        print("Accepting all local changes...")
        run_command(['git', 'checkout', '--ours', '.'])
        run_command(['git', 'add', '.'])
        run_command(['git', 'commit', '-m', 'Merge remote changes - kept local version'])
    
    # Step 4: Push the changes
    print("\n5. Pushing to remote...")
    success, stdout, stderr = run_command(['git', 'push', 'origin', 'main'])
    
    if success:
        print("\n✅ Successfully fixed divergence and pushed changes!")
    else:
        print("\n❌ Push failed. You may need to force push.")
        response = input("Do you want to force push? (yes/no): ")
        if response.lower() == 'yes':
            print("\nForce pushing...")
            success, stdout, stderr = run_command(['git', 'push', '--force-with-lease', 'origin', 'main'])
            if success:
                print("\n✅ Force push successful!")
            else:
                print("\n❌ Force push failed. Manual intervention needed.")

if __name__ == "__main__":
    main()