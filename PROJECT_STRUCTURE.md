# xBrush Project Structure & Work Assignment Guide

## 📁 Project Organization

### Core Application Files
```
├── index.html                 # Main video creation page
├── models.html               # Model showcase page  
├── model-register.html       # Model registration page
├── admin.html                # Admin panel
└── app.js                    # Main application logic (needs splitting)
```

### JavaScript Modules
```
js/
├── config.js                 # ✅ Centralized configuration
├── app-namespace.js          # ✅ Namespace management
├── validation.js             # ✅ Input validation
├── firebase-config.js        # ✅ Firebase initialization
├── firebase-model-storage.js # Firebase model operations
├── model-storage-adapter.js  # Storage abstraction layer
├── image-storage-service.js  # ✅ Image upload service
├── image-utils.js           # Image compression utilities
├── image-loader.js          # Lazy loading implementation
├── image-cache.js           # Image caching (disabled)
├── default-avatars.js       # Placeholder avatars
├── components/
│   └── model-detail-modal.js # Model detail popup
└── models/
    └── model-schema.js       # Model data structure
```

### CSS Files
```
css/
├── styles.css                # Main styles
├── model-showcase.css        # Model display styles
├── model-register.css        # Registration form styles
├── premium-models.css        # Premium features styles
├── thumbnail-optimization.css # Image optimization styles
├── validation.css            # ✅ Form validation styles
└── navigation-option*.css    # Navigation variants (unused)
```

## 🎯 Work Assignment Strategy

### Zone 1: Video Creation Flow (Claude Instance 1)
**Files to focus on:**
- `index.html` (Step 1-8 of video creation)
- `app.js` (needs refactoring into modules)
- `constants.js`
- `utils.js`

**Tasks:**
- Split app.js into smaller modules:
  - `js/video-creation/step-manager.js`
  - `js/video-creation/data-service.js`
  - `js/video-creation/ui-controller.js`
  - `js/video-creation/video-generator.js`
- Improve step navigation UX
- Add progress saving/resuming

### Zone 2: Model Management (Claude Instance 2)
**Files to focus on:**
- `models.html`
- `model-register.html`
- `js/firebase-model-storage.js`
- `js/model-storage-adapter.js`
- `model-register.js`

**Tasks:**
- Improve model registration flow
- Add model search and filtering
- Implement model approval workflow
- Add model analytics

### Zone 3: Premium Features & Monetization (Claude Instance 3)
**Files to focus on:**
- `premium-models.js`
- `premium-models.css`
- `js/models/model-schema.js`
- Payment integration files (to be created)

**Tasks:**
- Implement payment processing
- Add subscription tiers
- Create premium model features
- Add usage tracking

### Zone 4: Performance & Infrastructure (Claude Instance 4)
**Files to focus on:**
- `js/image-storage-service.js`
- `js/image-loader.js`
- `js/image-utils.js`
- Firebase configuration files

**Tasks:**
- Optimize image loading
- Implement CDN integration
- Add service worker for offline
- Performance monitoring

## 🔒 Avoiding Conflicts

### 1. Communication Files
Always check these before starting work:
- `RECENT_CHANGES.md` - Recent updates
- `WORK_IN_PROGRESS.md` - Current tasks being worked on
- `TODO.md` - Pending tasks

### 2. Git Branch Strategy
```bash
# Each Claude instance uses a feature branch
git checkout -b feature/video-creation-refactor  # Claude 1
git checkout -b feature/model-management        # Claude 2
git checkout -b feature/premium-features        # Claude 3
git checkout -b feature/performance-opt         # Claude 4

# Regular syncing with main
git pull origin main
git merge main
```

### 3. File Locking Convention
When working on a file, add a comment at the top:
```javascript
// WORK IN PROGRESS: Claude Instance 1 - Refactoring video creation
// Started: 2024-07-14
// Expected completion: 2024-07-15
```

### 4. Naming Conventions
- New files: `[feature]-[function].js`
  - Example: `video-step-manager.js`
  - Example: `model-search-service.js`
- CSS classes: `[component]__[element]--[modifier]`
  - Example: `video-step__button--active`

## 📋 Current Status Overview

### ✅ Completed
- Configuration system
- Firebase Storage integration
- Input validation
- Namespace management
- CORS configuration

### 🚧 In Progress
- app.js refactoring
- Image optimization
- Model search improvements

### 📌 TODO Priority
1. Split app.js into modules
2. Add error tracking system
3. Implement model search
4. Add payment processing
5. Create admin dashboard
6. Add analytics
7. Implement A/B testing
8. Add multi-language support

## 🛠️ Development Guidelines

### Before Starting Work
1. Pull latest changes: `git pull origin main`
2. Check `WORK_IN_PROGRESS.md`
3. Create/update your feature branch
4. Add your task to `WORK_IN_PROGRESS.md`

### While Working
1. Make small, focused commits
2. Update relevant documentation
3. Add tests for new features
4. Follow existing code patterns

### After Completing Work
1. Update `RECENT_CHANGES.md`
2. Remove task from `WORK_IN_PROGRESS.md`
3. Create pull request with clear description
4. Update `TODO.md` if needed

## 🔍 Quick Reference

### Key Global Objects
- `window.AppConfig` - Application configuration
- `window.xBrush` - Main namespace
- `window.imageStorageService` - Image uploads
- `window.validationService` - Form validation
- `window.firebaseDB` - Firestore instance
- `window.firebaseStorage` - Storage instance

### Important Patterns
```javascript
// Configuration access
const config = window.AppConfig.getFirebaseConfig();

// Image upload
const url = await window.imageStorageService.uploadModelThumbnail(file, modelId);

// Validation
const result = window.validationService.validateModelRegistration(formData);

// Firebase operations
const models = await window.firebaseModelStorage.getActiveModels();
```

### Testing Checklist
- [ ] Test in Chrome, Safari, Firefox
- [ ] Test on mobile devices
- [ ] Test with slow network
- [ ] Test error scenarios
- [ ] Check console for errors
- [ ] Verify Firebase usage