#!/usr/bin/env node
/**
 * Enhanced Git Helper for Claude Code
 * Handles shell environment issues with multiple fallback strategies
 */

const { spawn, execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const process = require('process');

// Configuration
const PROJECT_DIR = '/Users/jpkim/moviemaker_mvp01';
const DEBUG = process.env.GIT_HELPER_DEBUG === 'true';

// Logging functions
function log(message) {
    if (DEBUG) {
        console.error(`[git-helper] ${message}`);
    }
}

function error(message) {
    console.error(`[git-helper ERROR] ${message}`);
}

// Strategy 1: Direct execution with spawn
function executeWithSpawn(args) {
    return new Promise((resolve, reject) => {
        log(`Attempting spawn strategy: git ${args.join(' ')}`);
        
        const gitProcess = spawn('git', args, {
            cwd: PROJECT_DIR,
            stdio: 'pipe',
            env: { ...process.env, PATH: process.env.PATH }
        });
        
        let stdout = '';
        let stderr = '';
        
        gitProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        gitProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        gitProcess.on('close', (code) => {
            if (code === 0) {
                if (stdout) process.stdout.write(stdout);
                if (stderr) process.stderr.write(stderr);
                resolve(code);
            } else {
                reject({ code, stdout, stderr });
            }
        });
        
        gitProcess.on('error', (err) => {
            reject({ error: err, stdout, stderr });
        });
    });
}

// Strategy 2: Using execSync with shell
function executeWithExecSync(args) {
    log(`Attempting execSync strategy: git ${args.join(' ')}`);
    
    try {
        const command = `git ${args.map(arg => {
            // Properly escape arguments
            if (arg.includes(' ') || arg.includes('"') || arg.includes("'")) {
                return `"${arg.replace(/"/g, '\\"')}"`;
            }
            return arg;
        }).join(' ')}`;
        
        const result = execSync(command, {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
            stdio: 'inherit',
            env: { ...process.env }
        });
        
        return 0;
    } catch (error) {
        if (error.status !== undefined) {
            return error.status;
        }
        throw error;
    }
}

// Strategy 3: Python fallback
function executeWithPython(args) {
    log(`Attempting Python fallback strategy`);
    
    const pythonScript = path.join(PROJECT_DIR, 'git_helper.py');
    if (!fs.existsSync(pythonScript)) {
        throw new Error('Python helper script not found');
    }
    
    try {
        execSync(`python3 "${pythonScript}" ${args.map(arg => `"${arg}"`).join(' ')}`, {
            cwd: PROJECT_DIR,
            stdio: 'inherit'
        });
        return 0;
    } catch (error) {
        if (error.status !== undefined) {
            return error.status;
        }
        throw error;
    }
}

// Strategy 4: Direct shell command with absolute path
function executeWithAbsolutePath(args) {
    log(`Attempting absolute path strategy`);
    
    return new Promise((resolve, reject) => {
        // Find git executable
        let gitPath = '/usr/bin/git';
        try {
            gitPath = execSync('which git', { encoding: 'utf8' }).trim();
        } catch (e) {
            log('Could not find git with which, using default path');
        }
        
        const command = `cd "${PROJECT_DIR}" && "${gitPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;
        
        exec(command, { 
            maxBuffer: 10 * 1024 * 1024,
            env: { ...process.env }
        }, (error, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
            
            if (error) {
                reject({ code: error.code || 1, stdout, stderr });
            } else {
                resolve(0);
            }
        });
    });
}

// Main execution function with fallback strategies
async function executeGitCommand(args) {
    const strategies = [
        { name: 'spawn', fn: () => executeWithSpawn(args) },
        { name: 'execSync', fn: () => executeWithExecSync(args) },
        { name: 'absolutePath', fn: () => executeWithAbsolutePath(args) },
        { name: 'python', fn: () => executeWithPython(args) }
    ];
    
    for (const strategy of strategies) {
        try {
            log(`Trying strategy: ${strategy.name}`);
            const result = await strategy.fn();
            log(`Strategy ${strategy.name} succeeded`);
            return result;
        } catch (err) {
            log(`Strategy ${strategy.name} failed: ${err.message || err}`);
            if (strategy === strategies[strategies.length - 1]) {
                // Last strategy failed
                error(`All strategies failed. Last error: ${err.message || err}`);
                if (err.stderr) {
                    process.stderr.write(err.stderr);
                }
                return err.code || 1;
            }
        }
    }
    
    return 1;
}

// Helper function to parse complex git commands
function parseGitArgs(args) {
    // Handle cases where arguments might be combined
    const parsed = [];
    let i = 0;
    
    while (i < args.length) {
        const arg = args[i];
        
        // Handle -m "message with spaces"
        if (arg === '-m' && i + 1 < args.length) {
            parsed.push(arg);
            parsed.push(args[i + 1]);
            i += 2;
        }
        // Handle combined short options like -am
        else if (arg.startsWith('-') && arg.length > 2 && !arg.startsWith('--')) {
            // Split combined options
            for (let j = 1; j < arg.length; j++) {
                parsed.push(`-${arg[j]}`);
            }
            i++;
        }
        else {
            parsed.push(arg);
            i++;
        }
    }
    
    return parsed;
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("Enhanced Git Helper for Claude Code");
        console.log("\nUsage: node git-helper-enhanced.js <command> [args]");
        console.log("\nExamples:");
        console.log("  node git-helper-enhanced.js status");
        console.log("  node git-helper-enhanced.js add .");
        console.log("  node git-helper-enhanced.js commit -m 'Your message'");
        console.log("  node git-helper-enhanced.js push origin main");
        console.log("  node git-helper-enhanced.js pull");
        console.log("  node git-helper-enhanced.js log --oneline -10");
        console.log("\nDebug mode: Set GIT_HELPER_DEBUG=true");
        process.exit(1);
    }
    
    // Change to project directory
    try {
        process.chdir(PROJECT_DIR);
        log(`Changed directory to: ${PROJECT_DIR}`);
    } catch (err) {
        error(`Failed to change directory: ${err.message}`);
        process.exit(1);
    }
    
    // Parse and execute git command
    const parsedArgs = parseGitArgs(args);
    log(`Executing: git ${parsedArgs.join(' ')}`);
    
    const exitCode = await executeGitCommand(parsedArgs);
    process.exit(exitCode);
}

// Run main function
if (require.main === module) {
    main().catch(err => {
        error(`Unexpected error: ${err.message}`);
        process.exit(1);
    });
}

// Export for use as module
module.exports = { executeGitCommand, parseGitArgs };