#!/bin/bash

# Git helper script to work around shell environment issues

case "$1" in
    "status")
        git status
        ;;
    "add")
        shift
        git add "$@"
        ;;
    "commit")
        shift
        git commit "$@"
        ;;
    "push")
        shift
        git push "$@"
        ;;
    "pull")
        shift
        git pull "$@"
        ;;
    "init")
        git init
        ;;
    "log")
        git log --oneline -10
        ;;
    *)
        echo "Usage: $0 {status|add|commit|push|pull|init|log} [args]"
        echo "Examples:"
        echo "  $0 status"
        echo "  $0 add ."
        echo "  $0 commit -m 'Your message'"
        echo "  $0 push origin main"
        exit 1
        ;;
esac