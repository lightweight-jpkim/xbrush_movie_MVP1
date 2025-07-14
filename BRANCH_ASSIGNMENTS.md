# Branch Assignments for Claude Instances

## 🎯 Page-Specific Branches

### Branch: `pages/index-video-creation`
**Owner**: Claude Instance 1
**Files**: 
- index.html
- app.js (main video flow)
- Step-related components
**Current Tasks**:
- Split app.js into modules
- Improve step navigation
- Add progress saving

### Branch: `pages/models-showcase`
**Owner**: Claude Instance 2
**Files**:
- models.html
- model-showcase.css
- Model display components
**Current Tasks**:
- Implement search functionality
- Add filtering options
- Improve grid layout

### Branch: `pages/model-registration`
**Owner**: Claude Instance 3
**Files**:
- model-register.html
- model-register.js
- model-register.css
**Current Tasks**:
- Enhance validation
- Add image preview
- Improve form UX

### Branch: `pages/admin-panel`
**Owner**: Claude Instance 4
**Files**:
- admin.html
- Admin-related scripts
**Current Tasks**:
- Create admin dashboard
- Add model approval system
- Implement analytics

## 🚀 Feature Branches

### Branch: `refactor/split-app-js`
**Purpose**: Break down the monolithic app.js
**Files**: app.js → multiple modules

### Branch: `feature/premium-enhancements`
**Purpose**: Improve premium model features
**Files**: premium-models.js, pricing components

### Branch: `feature/performance-optimization`
**Purpose**: Optimize loading and performance
**Files**: Image services, lazy loading, caching

## 📋 Workflow for Each Claude

### Starting Work
```bash
# 1. Make sure you have latest main
git checkout main
git pull origin main

# 2. Switch to your assigned branch
git checkout pages/your-assigned-page

# 3. Merge latest main into your branch
git merge main

# 4. Start working!
```

### During Work
```bash
# Regular commits
git add .
git commit -m "Descriptive message"

# Push to your branch
git push origin pages/your-assigned-page
```

### Completing Work
```bash
# 1. Push all changes
git push origin pages/your-assigned-page

# 2. Create Pull Request on GitHub
# Or merge locally:
git checkout main
git merge pages/your-assigned-page
git push origin main
```

## ⚠️ Important Rules

1. **Stay in Your Lane**: Only edit files related to your assigned page/feature
2. **Regular Syncing**: Merge main into your branch daily
3. **Small Commits**: Make frequent, focused commits
4. **Clear Messages**: Write descriptive commit messages
5. **Update Docs**: Keep WORK_IN_PROGRESS.md updated

## 🔄 Handling Conflicts

If you get merge conflicts:
```bash
# 1. See conflicting files
git status

# 2. Open conflicting files and resolve
# Look for <<<<<<< HEAD markers

# 3. After resolving
git add .
git commit -m "Resolved merge conflicts"
```

## 🎯 Example: Claude 1 Working on Video Creation

```bash
# Start of day
git checkout main
git pull origin main
git checkout pages/index-video-creation
git merge main

# Work on splitting app.js
# Create new file: js/video-creation/step-manager.js
git add js/video-creation/step-manager.js
git commit -m "Extract step management logic from app.js"

# More work...
git add .
git commit -m "Complete video step refactoring"

# End of day
git push origin pages/index-video-creation
```