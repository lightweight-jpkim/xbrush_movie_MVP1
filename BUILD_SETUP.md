# XBrush Movie MVP1 - Build Setup

This document describes the build setup for the XBrush Movie MVP1 project using Vite as the build tool.

## Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher

## Installation

1. Install dependencies:
```bash
npm install
```

## Available Scripts

### Development
```bash
npm run dev
```
Starts the Vite development server on http://localhost:3000 with hot module replacement.

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `dist` directory.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing on http://localhost:3001.

### Linting
```bash
npm run lint        # Fix linting issues
npm run lint:check  # Check for linting issues without fixing
```

### Formatting
```bash
npm run format       # Format all files
npm run format:check # Check formatting without fixing
```

### Clean
```bash
npm run clean      # Remove dist and node_modules
npm run clean:dist # Remove only dist directory
```

### Bundle Analysis
```bash
npm run analyze
```
Builds the project and opens a bundle visualization report.

## Build Features

### Vite Configuration

The build setup includes:

1. **Multiple Entry Points**: Builds all main HTML pages (index, models, admin, etc.)

2. **Optimizations**:
   - CSS code splitting
   - JavaScript minification with Terser
   - CSS minification with cssnano
   - Image optimization (JPEG, PNG, GIF, SVG)
   - Gzip and Brotli compression

3. **Legacy Browser Support**: Uses @vitejs/plugin-legacy for older browsers

4. **Asset Handling**:
   - Images → `assets/images/`
   - CSS → `assets/css/`
   - JS → `assets/js/`
   - Media → `assets/media/`

5. **Code Splitting**:
   - Firebase as a separate chunk
   - Vendor libraries in vendor chunk
   - Application code chunked by route

### CSS Processing

- Autoprefixer for browser compatibility
- CSS minification in production
- Source maps in development

### Development Features

- Hot Module Replacement (HMR)
- Source maps
- CORS enabled
- Console logs preserved

### Production Features

- Minified code
- Compressed assets (gzip & brotli)
- Optimized images
- Console logs removed
- No source maps

## Firebase Integration

The build maintains Firebase functionality:
- Firebase SDK loaded from CDN (currently)
- Firebase configuration preserved
- All Firebase services (Firestore, Storage, Auth) functional

## Static Assets

Static assets in the `images/` directory are:
- Optimized during build
- Hashed for cache busting
- Copied to `dist/assets/images/`

## Environment Variables

Environment variables prefixed with `VITE_` are available in the application:
```javascript
console.log(import.meta.env.VITE_MY_VARIABLE);
```

## Deployment

After building:
```bash
npm run build
```

The `dist/` directory contains all files ready for deployment:
- Optimized HTML files
- Minified and chunked JavaScript
- Minified CSS
- Optimized images
- All with proper cache headers via filename hashing

Deploy the contents of `dist/` to your hosting service.

## Troubleshooting

1. **Build fails**: Ensure all dependencies are installed with `npm install`
2. **Port already in use**: Change the port in `vite.config.js`
3. **Firebase not working**: Check that Firebase configuration is correct in `js/config.js`
4. **Images not loading**: Ensure image paths use relative paths (e.g., `./images/...`)

## Next Steps

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start development
3. Make your changes
4. Run `npm run build` to create production build
5. Deploy the `dist/` directory