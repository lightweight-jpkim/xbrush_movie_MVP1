# Migration Guide: CDN to Bundled Build

This guide helps transition from CDN-based imports to the Vite bundled build system.

## Current Setup (CDN-based)

The project currently loads Firebase from CDN:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
```

## Future Migration (Optional)

To fully leverage the build system, you can migrate to npm packages:

### Step 1: Update HTML files

Remove CDN script tags:
```html
<!-- Remove these -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
```

### Step 2: Update Firebase imports

In `js/firebase-config.js`, add:
```javascript
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/auth';

// Make firebase global for compatibility
window.firebase = firebase;
```

### Step 3: Update script tags

Change script tags to use type="module":
```html
<script type="module" src="js/firebase-config.js"></script>
```

## Benefits of Migration

1. **Smaller bundle size**: Only import what you use
2. **Better caching**: Hashed filenames for optimal caching
3. **Tree shaking**: Remove unused code
4. **Type safety**: Better IDE support
5. **Faster loads**: Compressed and optimized bundles

## Current Build Compatibility

The current Vite setup works with your existing CDN approach:
- All JavaScript files are processed and optimized
- CSS files are bundled and minified
- Images are optimized
- HTML files are minified
- Firebase from CDN continues to work

No immediate changes are required to use the build system!