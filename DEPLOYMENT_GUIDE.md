# xBrush Deployment Guide

## 🚀 Quick Start

### Prerequisites
1. Firebase project created
2. Git repository access
3. Google Cloud SDK installed (for CORS setup)

### Deployment Steps

## 1. Firebase Configuration

### Enable Anonymous Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/project/xbrush-moviemaker-mvp/authentication/providers)
2. Click on "Anonymous" in the Sign-in providers list
3. Toggle "Enable" and click "Save"

### Configure Firebase Storage CORS
```bash
# Install Google Cloud SDK if not already installed
curl https://sdk.cloud.google.com | bash

# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project xbrush-moviemaker-mvp

# Apply CORS configuration
gsutil cors set firebase-storage-cors.json gs://xbrush-moviemaker-mvp.firebasestorage.app
```

### Update Firebase Security Rules

**Firestore Rules** (firestore.rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users (including anonymous)
    match /models/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid != null;
    }
    
    // Admin collection - restricted access
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

**Storage Rules** (storage.rules):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read for model images
    match /models/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Temporary uploads
    match /temp/{allPaths=**} {
      allow read, write: if request.auth != null;
      // Auto-delete after 24 hours (set up lifecycle rule)
    }
  }
}
```

## 2. Environment Configuration

### For GitHub Pages Deployment
GitHub Pages doesn't support environment variables, but the app is configured to work with the default Firebase config securely.

### For Firebase Hosting
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init hosting
```

3. Deploy:
```bash
firebase deploy --only hosting
```

## 3. Security Headers

### For Firebase Hosting
Add to `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "SAMEORIGIN"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://*.firebaseio.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com; font-src 'self' data:; object-src 'none'; frame-ancestors 'self';"
          }
        ]
      }
    ]
  }
}
```

### For GitHub Pages
Create `.htaccess` file (if using custom domain with Apache):
```apache
# Security Headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

## 4. Performance Optimization

### Enable Caching
Add to `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg)",
        "headers": [{
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [{
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }]
      }
    ]
  }
}
```

## 5. Monitoring and Maintenance

### Set up Firebase Monitoring
1. Enable Google Analytics in Firebase Console
2. Enable Performance Monitoring
3. Set up Cloud Logging for errors

### Regular Maintenance Tasks
- [ ] Review Firebase usage and costs monthly
- [ ] Update dependencies quarterly
- [ ] Review and rotate API keys annually
- [ ] Monitor storage usage and clean up old files
- [ ] Review security rules and audit logs

## 6. Troubleshooting

### Common Issues

**CORS Errors**
- Ensure CORS configuration is applied: `gsutil cors get gs://xbrush-moviemaker-mvp.firebasestorage.app`
- Check browser console for specific CORS errors
- Verify origins in firebase-storage-cors.json

**Authentication Errors**
- Verify Anonymous Auth is enabled in Firebase Console
- Check browser console for auth errors
- Ensure firebase-config.js is loaded before other scripts

**Image Upload Failures**
- Check Firebase Storage rules
- Verify file size limits (5MB default)
- Ensure proper MIME types

## 7. Production Checklist

Before going live:
- [ ] Enable all security rules
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate
- [ ] Enable Firebase App Check
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Configure backup strategy
- [ ] Document API endpoints
- [ ] Set up uptime monitoring
- [ ] Create runbook for common issues

## 8. Cost Optimization

### Firebase Free Tier Limits
- Firestore: 50K reads/day, 20K writes/day
- Storage: 5GB storage, 1GB/day download
- Hosting: 10GB storage, 360MB/day transfer

### Cost Saving Tips
1. Use Firebase Storage instead of base64 in Firestore
2. Enable client-side caching
3. Optimize image sizes before upload
4. Use Firebase CDN for static assets
5. Monitor usage in Firebase Console

## 9. Backup and Recovery

### Automated Backups
```bash
# Schedule daily Firestore exports
gcloud firestore export gs://xbrush-backups/$(date +%Y%m%d)

# Set up Cloud Scheduler for automated backups
gcloud scheduler jobs create app-engine backup-firestore \
  --schedule="0 2 * * *" \
  --description="Daily Firestore backup" \
  --time-zone="Asia/Seoul"
```

### Manual Backup
```bash
# Export all data
firebase firestore:export backup-$(date +%Y%m%d)

# Import data
firebase firestore:import backup-20240315
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/JPJPKIMJP/xbrush_movie_MVP1/issues
- Firebase Support: https://firebase.google.com/support