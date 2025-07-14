import subprocess
import os

os.chdir('/Users/jpkim/moviemaker_mvp01')

# Run git commands
commands = [
    ['git', 'config', 'pull.rebase', 'false'],
    ['git', 'fetch', 'origin'],
    ['git', 'reset', '--hard', 'origin/main'],
    ['git', 'add', '.'],
    ['git', 'commit', '-m', 'Complete database integration and flexible licensing system'],
    ['git', 'push', 'origin', 'main']
]

for cmd in commands:
    subprocess.run(cmd, capture_output=True)

# Check final status
result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
print("Done!" if not result.stdout else "Files remaining")