# Branch Organization Guide for xBrush Project

## 📁 Current File Inventory

We have **30 HTML files** + numerous JS/CSS files. Here's how to organize them:

## 🌿 Branch Structure

### 1. `main` Branch (Production)
**Only stable, tested code**
```
├── index.html                 # Main video creation app
├── models.html               # Model showcase
├── model-register.html       # Model registration
├── admin.html                # Admin panel
├── app.js                    # Main app logic
├── All production JS/CSS files
└── firebase.json             # Deployment config
```

### 2. `pages/video-creation` Branch
**Owner: Claude Instance 1**
```
Focus files:
├── index.html (video creation sections)
├── app.js (needs refactoring)
├── constants.js
├── utils.js
└── New files to create:
    ├── js/video-creation/step-manager.js
    ├── js/video-creation/data-service.js
    └── js/video-creation/ui-controller.js
```

### 3. `pages/models` Branch  
**Owner: Claude Instance 2**
```
Focus files:
├── models.html
├── model-showcase.css
├── js/model-display.js
├── premium-models.js
└── New files to create:
    ├── js/models/search-service.js
    └── js/models/filter-service.js
```

### 4. `pages/registration` Branch
**Owner: Claude Instance 3**
```
Focus files:
├── model-register.html
├── model-register.js
├── model-register.css
├── js/validation.js
└── js/models/model-schema.js
```

### 5. `pages/admin` Branch
**Owner: Claude Instance 4**
```
Focus files:
├── admin.html
├── New files to create:
    ├── js/admin/dashboard.js
    ├── js/admin/analytics.js
    └── js/admin/moderation.js
```

### 6. `feature/testing` Branch
**For all test files**
```
All test files:
├── test*.html (12 files)
├── debug-*.html (3 files)
└── test-specific scripts
```

### 7. `feature/firebase-migration` Branch
**Firebase integration work**
```
├── firebase-*.html (5 files)
├── migrate-*.html (2 files)
├── js/firebase-*.js files
└── Migration scripts
```

### 8. `cleanup/archive` Branch
**Files to remove/archive**
```
├── index_backup.html
├── index_new.html (after merging)
├── database-schema-*.html (move to docs)
├── navigation-comparison.html (after decision)
└── Old debug files
```

## 🗂️ Suggested File Reorganization

```
xbrush_movie_MVP1/
├── src/                      # Source code
│   ├── pages/               # HTML pages
│   │   ├── index.html
│   │   ├── models.html
│   │   ├── model-register.html
│   │   └── admin.html
│   ├── js/                  # JavaScript
│   │   ├── core/           # Core functionality
│   │   ├── pages/          # Page-specific JS
│   │   ├── components/     # Reusable components
│   │   └── services/       # Services (Firebase, etc.)
│   └── css/                 # Stylesheets
├── tests/                   # All test files
│   ├── integration/
│   ├── unit/
│   └── debug/
├── docs/                    # Documentation
│   ├── database-schemas/
│   └── guides/
└── archive/                 # Old/deprecated files
```

## 🔄 Migration Plan

### Phase 1: Branch Setup (Immediate)
```bash
# Create main branches
git checkout -b pages/video-creation
git checkout -b pages/models
git checkout -b pages/registration
git checkout -b pages/admin
git checkout -b feature/testing
git checkout -b cleanup/archive
```

### Phase 2: File Movement (This Week)
1. Move test files to `feature/testing`
2. Archive old files in `cleanup/archive`
3. Each Claude works on their branch

### Phase 3: Refactoring (Next Week)
1. Split app.js in `pages/video-creation`
2. Create proper module structure
3. Remove duplicate code

## 📋 Quick Reference for Each Claude

### Claude 1 (Video Creation)
```bash
git checkout pages/video-creation
# Work on: index.html, app.js refactoring
# Create: js/video-creation/* modules
```

### Claude 2 (Models)
```bash
git checkout pages/models
# Work on: models.html, showcase features
# Create: search, filter, gallery features
```

### Claude 3 (Registration)
```bash
git checkout pages/registration
# Work on: model-register.html, validation
# Create: better form UX, image preview
```

### Claude 4 (Admin)
```bash
git checkout pages/admin
# Work on: admin.html, dashboard
# Create: analytics, moderation tools
```

## ⚠️ Important Notes

1. **Test Files**: Currently 15 test/debug files cluttering root
2. **Database Schemas**: 3 HTML files that should be in docs
3. **Duplicates**: index_new.html seems to be a WIP version
4. **Migration Files**: 7 Firebase-related test files

## 🎯 Action Items

1. **Immediate**: Create branches for each major section
2. **Today**: Move test files out of root directory  
3. **This Week**: Each Claude picks their branch and starts work
4. **Document**: Update WORK_IN_PROGRESS.md with branch assignments

## 🚀 Commands to Get Started

```bash
# See all current HTML files
find . -name "*.html" -type f | sort

# Create your working branch
git checkout -b pages/[your-section]

# Move files (example)
mkdir -p tests/integration
git mv test*.html tests/integration/

# Clean up
mkdir -p archive
git mv index_backup.html archive/
```