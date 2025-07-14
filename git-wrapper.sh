#!/bin/bash
# Enhanced Git Wrapper for Claude Code
# Handles shell environment issues with multiple strategies

# Configuration
PROJECT_DIR="/Users/jpkim/moviemaker_mvp01"
DEBUG="${GIT_WRAPPER_DEBUG:-false}"

# Logging functions
log() {
    if [ "$DEBUG" = "true" ]; then
        echo "[git-wrapper] $1" >&2
    fi
}

error() {
    echo "[git-wrapper ERROR] $1" >&2
}

# Check if we're in a problematic shell environment
check_shell_env() {
    log "Checking shell environment..."
    
    # Check if we can access basic commands
    if ! command -v git >/dev/null 2>&1; then
        log "Git not found in PATH, attempting to locate..."
        
        # Try common git locations
        for git_path in /usr/bin/git /usr/local/bin/git /opt/homebrew/bin/git; do
            if [ -x "$git_path" ]; then
                log "Found git at: $git_path"
                export PATH="$(dirname "$git_path"):$PATH"
                return 0
            fi
        done
        
        error "Git executable not found"
        return 1
    fi
    
    return 0
}

# Strategy 1: Direct git execution
execute_direct() {
    log "Attempting direct execution: git $*"
    cd "$PROJECT_DIR" || return 1
    git "$@"
}

# Strategy 2: Using env to clean environment
execute_with_env() {
    log "Attempting execution with cleaned environment"
    cd "$PROJECT_DIR" || return 1
    /usr/bin/env -i PATH="$PATH" HOME="$HOME" USER="$USER" git "$@"
}

# Strategy 3: Using absolute paths
execute_with_absolute_path() {
    log "Attempting execution with absolute path"
    local git_path
    git_path=$(which git 2>/dev/null || echo "/usr/bin/git")
    
    cd "$PROJECT_DIR" || return 1
    "$git_path" "$@"
}

# Strategy 4: Node.js fallback
execute_with_node() {
    log "Attempting Node.js fallback"
    if [ -f "$PROJECT_DIR/git-helper-enhanced.js" ]; then
        node "$PROJECT_DIR/git-helper-enhanced.js" "$@"
    else
        return 1
    fi
}

# Strategy 5: Python fallback
execute_with_python() {
    log "Attempting Python fallback"
    if [ -f "$PROJECT_DIR/git_helper.py" ]; then
        python3 "$PROJECT_DIR/git_helper.py" "$@"
    else
        return 1
    fi
}

# Main execution logic
main() {
    # Check shell environment first
    if ! check_shell_env; then
        error "Shell environment check failed"
        exit 1
    fi
    
    # Try each strategy in order
    strategies=(
        "execute_direct"
        "execute_with_env"
        "execute_with_absolute_path"
        "execute_with_node"
        "execute_with_python"
    )
    
    for strategy in "${strategies[@]}"; do
        log "Trying strategy: $strategy"
        if $strategy "$@"; then
            log "Strategy $strategy succeeded"
            exit $?
        else
            log "Strategy $strategy failed with code $?"
        fi
    done
    
    error "All strategies failed"
    exit 1
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    cat << EOF
Enhanced Git Wrapper for Claude Code

Usage: $0 <git-command> [args]

Examples:
  $0 status
  $0 add .
  $0 commit -m "Your message"
  $0 push origin main
  $0 pull
  $0 log --oneline -10

Debug mode: export GIT_WRAPPER_DEBUG=true
EOF
    exit 1
fi

# Run main function with all arguments
main "$@"