# Firebase Hosting Deployment Guide

## Setup (One-time)

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

## Deploy Your App

From your project root directory (`/Users/jpsmac/xbrush_movie_MVP1/`), run:

```bash
firebase deploy
```

## Your App URLs

After deployment, your app will be available at:
- https://xbrush-moviemaker-mvp.web.app
- https://xbrush-moviemaker-mvp.firebaseapp.com

## What Gets Deployed

The current configuration deploys all files in your root directory except:
- Hidden files (starting with .)
- node_modules
- Markdown files
- Test/debug HTML files

## Important Files

- `firebase.json` - Hosting configuration
- `.firebaserc` - Project settings
- All your HTML, CSS, JS files

## Updating Your Site

1. Make changes to your files
2. Run `firebase deploy` again
3. Changes appear instantly!

## Useful Commands

- `firebase deploy --only hosting` - Deploy only hosting
- `firebase serve` - Test locally before deploying
- `firebase hosting:disable` - Temporarily disable site

## Note

The Firebase configuration is set to serve `index.html` for all routes (Single Page App behavior).