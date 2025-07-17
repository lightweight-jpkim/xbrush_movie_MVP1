import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import legacy from '@vitejs/plugin-legacy';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  root: '.',
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    
    // Rollup options
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        models: path.resolve(__dirname, 'models.html'),
        modelRegister: path.resolve(__dirname, 'model-register.html'),
        modelDashboard: path.resolve(__dirname, 'model-dashboard.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Firebase as a separate chunk
          firebase: ['firebase'],
          // Vendor chunk for other dependencies
          vendor: [],
        },
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(1);
          if (/css/.test(extType)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/mp4|webm|ogg|mp3|wav|flac|aac/i.test(extType)) {
            return 'assets/media/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Performance options
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
  },
  
  // CSS processing
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        require('autoprefixer')(),
        mode === 'production' && require('cssnano')({
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
          }],
        }),
      ].filter(Boolean),
    },
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
    // Proxy for Firebase services if needed
    proxy: {
      // Add any proxy rules if needed
    },
  },
  
  // Preview server configuration
  preview: {
    port: 3001,
    open: true,
  },
  
  // Plugins
  plugins: [
    // HTML plugin for processing HTML files
    createHtmlPlugin({
      minify: mode === 'production',
      inject: {
        data: {
          title: 'XBrush AI Video Creator',
        },
      },
    }),
    
    // Legacy browser support
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.promise',
        'es.symbol',
        'es.array.iterator',
        'es.object.assign',
        'es.object.keys',
      ],
    }),
    
    // Compression plugin for gzip/brotli
    mode === 'production' && viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    
    mode === 'production' && viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    
    // Image optimization
    mode === 'production' && viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
    
    // Bundle analyzer in analyze mode
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@js': path.resolve(__dirname, './js'),
      '@css': path.resolve(__dirname, './css'),
      '@images': path.resolve(__dirname, './images'),
      '@components': path.resolve(__dirname, './js/components'),
      '@models': path.resolve(__dirname, './js/models'),
    },
  },
  
  // Optimizations
  optimizeDeps: {
    include: ['firebase'],
    exclude: [],
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_',
}))