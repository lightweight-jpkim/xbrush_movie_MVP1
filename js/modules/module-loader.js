/**
 * Module Loader
 * Loads and initializes all modular components
 */

(function(window) {
    'use strict';

    const ModuleLoader = {
        /**
         * List of modules to load
         */
        modules: [
            'js/modules/lazy-loading-module.js',
            'js/modules/accessibility-module.js',
            'js/modules/error-handling-module.js',
            'js/modules/form-validation-module.js',
            'js/modules/video-creation-module.js'
        ],

        /**
         * Load all modules
         */
        loadModules: async function() {
            console.log('Loading application modules...');
            
            for (const module of this.modules) {
                try {
                    await this.loadScript(module);
                    console.log(`✓ Loaded: ${module}`);
                } catch (error) {
                    console.error(`✗ Failed to load: ${module}`, error);
                }
            }

            console.log('All modules loaded. Initializing...');
            this.initializeModules();
        },

        /**
         * Load script dynamically
         */
        loadScript: function(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                
                document.head.appendChild(script);
            });
        },

        /**
         * Initialize all loaded modules
         */
        initializeModules: function() {
            // Form validation
            if (window.FormValidationModule) {
                window.FormValidationModule.initialize();
            }

            // The other modules auto-initialize
            console.log('Application modules initialized successfully');
        },

        /**
         * Check if all required modules are loaded
         */
        checkModules: function() {
            const requiredModules = [
                'LazyLoadingModule',
                'AccessibilityModule',
                'ErrorHandlingModule',
                'FormValidationModule',
                'VideoCreationModule'
            ];

            const missingModules = requiredModules.filter(module => !window[module]);
            
            if (missingModules.length > 0) {
                console.warn('Missing modules:', missingModules);
                return false;
            }

            return true;
        }
    };

    // Export to global scope
    window.ModuleLoader = ModuleLoader;

    // Auto-load modules when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ModuleLoader.loadModules();
        });
    } else {
        ModuleLoader.loadModules();
    }

})(window);