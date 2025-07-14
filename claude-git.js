#!/usr/bin/env node
/**
 * Claude Code Git Integration
 * Specifically designed to work around Claude Code's shell environment limitations
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

class ClaudeGitHelper {
    constructor() {
        this.projectDir = '/Users/jpkim/moviemaker_mvp01';
        this.debug = process.env.CLAUDE_GIT_DEBUG === 'true';
        this.gitPath = this.findGitExecutable();
        
        // Store shell state between commands
        this.shellState = {
            lastExitCode: 0,
            lastOutput: '',
            lastError: ''
        };
    }
    
    log(message) {
        if (this.debug) {
            console.error(`[claude-git] ${message}`);
        }
    }
    
    findGitExecutable() {
        const possiblePaths = [
            '/usr/bin/git',
            '/usr/local/bin/git',
            '/opt/homebrew/bin/git',
            process.env.GIT_EXECUTABLE
        ].filter(Boolean);
        
        for (const gitPath of possiblePaths) {
            if (fs.existsSync(gitPath)) {
                this.log(`Found git at: ${gitPath}`);
                return gitPath;
            }
        }
        
        // Try to find git using which
        try {
            const gitPath = execSync('which git', { encoding: 'utf8' }).trim();
            if (gitPath) {
                this.log(`Found git via which: ${gitPath}`);
                return gitPath;
            }
        } catch (e) {
            this.log('Could not find git with which command');
        }
        
        // Default fallback
        return 'git';
    }
    
    /**
     * Execute git command with proper error handling
     */
    async execute(args) {
        return new Promise((resolve) => {
            this.log(`Executing: ${this.gitPath} ${args.join(' ')}`);
            
            const gitProcess = spawn(this.gitPath, args, {
                cwd: this.projectDir,
                env: this.createSafeEnv(),
                stdio: ['inherit', 'pipe', 'pipe']
            });
            
            let stdout = '';
            let stderr = '';
            
            gitProcess.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                process.stdout.write(output);
            });
            
            gitProcess.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                process.stderr.write(output);
            });
            
            gitProcess.on('close', (code) => {
                this.shellState.lastExitCode = code;
                this.shellState.lastOutput = stdout;
                this.shellState.lastError = stderr;
                
                this.log(`Command completed with code: ${code}`);
                resolve(code);
            });
            
            gitProcess.on('error', (err) => {
                console.error(`Failed to execute git: ${err.message}`);
                this.shellState.lastExitCode = 1;
                this.shellState.lastError = err.message;
                resolve(1);
            });
        });
    }
    
    /**
     * Create a minimal safe environment for git execution
     */
    createSafeEnv() {
        const safeEnv = {
            PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
            HOME: process.env.HOME || '/Users/jpkim',
            USER: process.env.USER || 'jpkim',
            LANG: process.env.LANG || 'en_US.UTF-8',
            LC_ALL: process.env.LC_ALL || 'en_US.UTF-8'
        };
        
        // Preserve git-specific environment variables
        const gitEnvVars = Object.keys(process.env).filter(key => 
            key.startsWith('GIT_') || key === 'SSH_AUTH_SOCK'
        );
        
        gitEnvVars.forEach(key => {
            safeEnv[key] = process.env[key];
        });
        
        return safeEnv;
    }
    
    /**
     * Parse git command arguments intelligently
     */
    parseArgs(args) {
        const parsed = [];
        let i = 0;
        
        while (i < args.length) {
            const arg = args[i];
            
            // Handle commit message flag
            if (arg === '-m' && i + 1 < args.length) {
                parsed.push(arg, args[i + 1]);
                i += 2;
            }
            // Handle combined short flags (e.g., -am)
            else if (arg.match(/^-[a-zA-Z]{2,}$/)) {
                // Split into individual flags
                const flags = arg.substring(1).split('');
                flags.forEach(flag => parsed.push(`-${flag}`));
                i++;
            }
            // Handle long options with equals (e.g., --author="Name")
            else if (arg.includes('=')) {
                parsed.push(arg);
                i++;
            }
            else {
                parsed.push(arg);
                i++;
            }
        }
        
        return parsed;
    }
    
    /**
     * Special handling for common git workflows
     */
    async handleSpecialCommands(args) {
        const command = args[0];
        
        switch (command) {
            case 'quick-commit':
                // Shortcut for add and commit
                await this.execute(['add', '.']);
                if (this.shellState.lastExitCode === 0) {
                    const message = args[1] || 'Update files';
                    await this.execute(['commit', '-m', message]);
                }
                return this.shellState.lastExitCode;
                
            case 'sync':
                // Pull and push
                await this.execute(['pull']);
                if (this.shellState.lastExitCode === 0) {
                    await this.execute(['push']);
                }
                return this.shellState.lastExitCode;
                
            case 'amend':
                // Amend last commit
                const amendArgs = ['commit', '--amend'];
                if (args[1]) {
                    amendArgs.push('-m', args[1]);
                } else {
                    amendArgs.push('--no-edit');
                }
                return await this.execute(amendArgs);
                
            default:
                return null;
        }
    }
    
    /**
     * Main execution method
     */
    async run(args) {
        // Check for special commands first
        const specialResult = await this.handleSpecialCommands(args);
        if (specialResult !== null) {
            return specialResult;
        }
        
        // Parse and execute normal git command
        const parsedArgs = this.parseArgs(args);
        return await this.execute(parsedArgs);
    }
    
    /**
     * Show helpful information
     */
    showHelp() {
        console.log(`Claude Code Git Helper

Usage: node claude-git.js <command> [args]

Standard Git Commands:
  status                    - Show working tree status
  add <files>              - Stage files for commit
  commit -m "message"      - Commit staged changes
  push [remote] [branch]   - Push commits to remote
  pull [remote] [branch]   - Pull changes from remote
  log [options]            - Show commit logs
  diff [files]             - Show changes in files
  branch [options]         - List or manage branches
  checkout <branch>        - Switch branches

Special Commands:
  quick-commit "message"   - Stage all changes and commit
  sync                     - Pull then push (sync with remote)
  amend ["new message"]    - Amend the last commit

Examples:
  node claude-git.js status
  node claude-git.js add .
  node claude-git.js commit -m "Add new feature"
  node claude-git.js push origin main
  node claude-git.js quick-commit "Quick update"
  node claude-git.js sync

Environment Variables:
  CLAUDE_GIT_DEBUG=true    - Enable debug output
  GIT_EXECUTABLE=/path/to/git - Override git executable path`);
    }
}

// Main entry point
async function main() {
    const helper = new ClaudeGitHelper();
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        helper.showHelp();
        process.exit(0);
    }
    
    try {
        // Change to project directory
        process.chdir(helper.projectDir);
        helper.log(`Changed to directory: ${helper.projectDir}`);
        
        // Run the git command
        const exitCode = await helper.run(args);
        process.exit(exitCode);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Export for use as module
module.exports = ClaudeGitHelper;

// Run if called directly
if (require.main === module) {
    main();
}