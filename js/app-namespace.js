/**
 * xBrush Application Namespace
 * Centralizes all global objects to reduce namespace pollution
 */

(function() {
    'use strict';
    
    // Create the main namespace
    window.xBrush = window.xBrush || {};
    
    // Sub-namespaces
    window.xBrush.config = window.AppConfig; // Reference to configuration
    window.xBrush.services = {};
    window.xBrush.utils = {};
    window.xBrush.models = {};
    window.xBrush.ui = {};
    window.xBrush.data = {};
    
    // Move existing globals into namespace as they become available
    window.xBrush.init = function() {
        // Services
        if (window.firebaseDB) {
            window.xBrush.services.firebaseDB = window.firebaseDB;
        }
        if (window.firebaseStorage) {
            window.xBrush.services.firebaseStorage = window.firebaseStorage;
        }
        if (window.firebaseAuth) {
            window.xBrush.services.firebaseAuth = window.firebaseAuth;
        }
        if (window.imageStorageService) {
            window.xBrush.services.imageStorage = window.imageStorageService;
        }
        if (window.firebaseModelStorage) {
            window.xBrush.services.modelStorage = window.firebaseModelStorage;
        }
        if (window.modelStorageAdapter) {
            window.xBrush.services.storageAdapter = window.modelStorageAdapter;
        }
        if (window.premiumManager) {
            window.xBrush.services.premiumManager = window.premiumManager;
        }
        
        // Utils
        if (window.ImageUtils) {
            window.xBrush.utils.ImageUtils = window.ImageUtils;
        }
        if (window.imageLoader) {
            window.xBrush.utils.imageLoader = window.imageLoader;
        }
        
        // Models
        if (window.ModelSchema) {
            window.xBrush.models.ModelSchema = window.ModelSchema;
        }
        
        // Keep references for backward compatibility but log deprecation
        if (window.xBrush.config.features.debugMode) {
            console.log('xBrush namespace initialized. Global variables are deprecated, use xBrush.* instead');
        }
    };
    
    // Auto-initialize when Firebase is ready
    if (window.addEventListener) {
        window.addEventListener('firebaseReady', function() {
            setTimeout(window.xBrush.init, 100);
        });
    }
    
    // Manual initialization fallback
    setTimeout(function() {
        if (!window.xBrush.services.firebaseDB && window.firebaseDB) {
            window.xBrush.init();
        }
    }, 3000);
    
})();