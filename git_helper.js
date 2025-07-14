#!/usr/bin/env node
/**
 * Git helper script to work around shell environment issues
 */

const { execSync } = require('child_process');
const process = require('process');

function runGitCommand(args) {
    try {
        // Change to the working directory
        process.chdir('/Users/jpkim/moviemaker_mvp01');
        
        // Build the git command
        const command = `git ${args.join(' ')}`;
        
        // Execute the command
        const result = execSync(command, { 
            encoding: 'utf8',
            stdio: 'inherit'
        });
        
        return 0;
    } catch (error) {
        if (error.status !== undefined) {
            return error.status;
        }
        console.error(`Error: ${error.message}`);
        return 1;
    }
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("Usage: node git_helper.js <command> [args]");
        console.log("Examples:");
        console.log("  node git_helper.js status");
        console.log("  node git_helper.js add .");
        console.log("  node git_helper.js commit -m 'Your message'");
        console.log("  node git_helper.js push origin main");
        console.log("  node git_helper.js pull");
        console.log("  node git_helper.js init");
        console.log("  node git_helper.js log --oneline -10");
        process.exit(1);
    }
    
    // Run the git command
    const exitCode = runGitCommand(args);
    process.exit(exitCode);
}

main();