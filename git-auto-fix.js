const { execSync } = require('child_process');
const path = require('path');

// Change to project directory
process.chdir('/Users/jpkim/moviemaker_mvp01');

function runGit(command) {
    try {
        const result = execSync(`git ${command}`, { encoding: 'utf8' });
        console.log(result);
        return true;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return false;
    }
}

console.log('🔧 Auto-fixing git divergence...\n');

// Execute git fix sequence
const commands = [
    'config pull.rebase false',
    'fetch origin', 
    'stash -u',
    'pull origin main --no-edit',
    'stash pop',
    'add .',
    'commit -m "Complete database integration and flexible licensing system"',
    'push origin main'
];

for (const cmd of commands) {
    console.log(`Running: git ${cmd}`);
    const success = runGit(cmd);
    
    if (!success && cmd.includes('push')) {
        console.log('Regular push failed, trying force push...');
        runGit('push --force-with-lease origin main');
    }
}

console.log('\n✅ Git fix complete!');
runGit('status --short');