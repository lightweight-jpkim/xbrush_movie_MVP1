# Admin Pages Consolidation Plan

## 1. Consolidate Admin Plan Review into Admin.html

### Current Structure:
- `admin.html` - Main admin dashboard
- `admin-plan-review.html` - Separate plan review page (to be merged)

### New Structure:
- `admin.html` - Unified admin dashboard with all features

### Implementation Steps:

1. **Add Navigation Tabs to admin.html**
```html
<div class="admin-nav-tabs">
    <button class="tab-btn active" data-tab="dashboard">Dashboard</button>
    <button class="tab-btn" data-tab="models">Model Management</button>
    <button class="tab-btn" data-tab="plan-review">Plan Review</button>
    <button class="tab-btn" data-tab="users">User Management</button>
    <button class="tab-btn" data-tab="analytics">Analytics</button>
</div>
```

2. **Add Plan Review Section**
```html
<div id="plan-review" class="tab-content" style="display: none;">
    <!-- Content from admin-plan-review.html goes here -->
    <h2>Plan Review & Approval</h2>
    <div class="plan-review-container">
        <!-- Plan review functionality -->
    </div>
</div>
```

3. **JavaScript for Tab Switching**
```javascript
// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show selected tab
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).style.display = 'block';
        
        // Update active button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
```

4. **Delete admin-plan-review.html** after merging

## 2. Rename Model Pricing Dashboard

### File Rename:
```bash
# Old name
model-pricing-dashboard.html

# New name
model-dashboard.html
```

### Content Updates:

1. **Update Page Title**
```html
<!-- Old -->
<title>Model Pricing Dashboard - xBrush</title>

<!-- New -->
<title>Model Dashboard - xBrush</title>
```

2. **Update Headers**
```html
<!-- Old -->
<h1>Model Pricing Dashboard</h1>

<!-- New -->
<h1>Model Dashboard</h1>
```

3. **Expand Functionality**
Add sections for:
- Profile Management
- Portfolio Management
- Pricing Settings
- Analytics & Earnings
- Availability Calendar
- Reviews & Ratings

### Navigation Updates:

1. **Update all links pointing to the old file**

In `models.html`:
```html
<!-- Old -->
<a href="model-pricing-dashboard.html">Manage Pricing</a>

<!-- New -->
<a href="model-dashboard.html">My Dashboard</a>
```

In navigation menus:
```html
<!-- Old -->
<a href="model-pricing-dashboard.html" class="nav-link">Pricing</a>

<!-- New -->
<a href="model-dashboard.html" class="nav-link">Model Dashboard</a>
```

## 3. File Structure After Changes

```
xbrush_movie_MVP1/
├── admin.html              # Unified admin dashboard (includes plan review)
├── model-dashboard.html    # Model self-service portal (renamed from pricing)
├── models.html            # Model showcase (unchanged)
├── model-register.html    # Model registration (unchanged)
└── index.html             # Main app (unchanged)
```

## 4. Git Commands

```bash
# 1. Rename the file
git mv model-pricing-dashboard.html model-dashboard.html

# 2. After merging admin-plan-review content into admin.html
git rm admin-plan-review.html

# 3. Commit changes
git add .
git commit -m "Consolidate admin pages and rename model dashboard

- Merged admin-plan-review.html into admin.html
- Renamed model-pricing-dashboard.html to model-dashboard.html
- Updated all references to new filenames
- Added tab navigation to admin dashboard"
```

## 5. Benefits

### Admin Consolidation:
- Single point of entry for all admin tasks
- Better UX with tab navigation
- Reduced page load times
- Easier maintenance

### Model Dashboard Rename:
- Clearer purpose (not just pricing)
- More professional naming
- Room for feature expansion
- Better reflects comprehensive functionality

## 6. Next Steps

1. Pull latest changes to get the new files
2. Implement the consolidation
3. Test all navigation links
4. Update any JavaScript references
5. Update documentation