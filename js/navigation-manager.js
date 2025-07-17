/**
 * NavigationManager - Centralized navigation state management
 * Handles navigation history, context preservation, and proper back button behavior
 */
(function() {
    'use strict';

    /**
     * NavigationManager class
     * @class
     */
    function NavigationManager() {
        this.STORAGE_KEY = 'xbrush_nav_state';
        this.init();
    }

    /**
     * Initialize navigation manager
     */
    NavigationManager.prototype.init = function() {
        // Load navigation state from sessionStorage
        this.loadState();
        
        // Save current page to history if not already there
        this.recordCurrentPage();
        
        // Listen for browser back button
        window.addEventListener('popstate', this.handlePopState.bind(this));
    };

    /**
     * Load navigation state from storage
     */
    NavigationManager.prototype.loadState = function() {
        try {
            var stored = sessionStorage.getItem(this.STORAGE_KEY);
            var state = stored ? JSON.parse(stored) : {};
            
            this.history = state.history || [];
            this.context = state.context || {};
            this.referrer = document.referrer || state.referrer || '';
        } catch (e) {
            console.error('Error loading navigation state:', e);
            this.resetState();
        }
    };

    /**
     * Save navigation state to storage
     */
    NavigationManager.prototype.saveState = function() {
        try {
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                history: this.history,
                context: this.context,
                referrer: this.referrer
            }));
        } catch (e) {
            console.error('Error saving navigation state:', e);
        }
    };

    /**
     * Reset navigation state
     */
    NavigationManager.prototype.resetState = function() {
        this.history = [];
        this.context = {};
        this.referrer = '';
        this.saveState();
    };

    /**
     * Record current page in history
     */
    NavigationManager.prototype.recordCurrentPage = function() {
        var currentPath = window.location.pathname;
        var currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
        
        // Don't record if it's the same as the last entry
        var lastEntry = this.history[this.history.length - 1];
        if (!lastEntry || lastEntry.page !== currentPage) {
            this.history.push({
                page: currentPage,
                url: window.location.href,
                timestamp: Date.now(),
                context: this.getCurrentPageContext()
            });
            
            // Keep history size reasonable (max 10 entries)
            if (this.history.length > 10) {
                this.history.shift();
            }
            
            this.saveState();
        }
    };

    /**
     * Get current page context
     */
    NavigationManager.prototype.getCurrentPageContext = function() {
        var context = {};
        
        // Get page-specific context
        var currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index.html':
            case '':
                // Save selected model if any
                var selectedModel = document.querySelector('.model-card.selected');
                if (selectedModel) {
                    context.selectedModelId = selectedModel.dataset.modelId;
                }
                // Save current step
                if (window.app && window.app.stepManager) {
                    context.currentStep = window.app.stepManager.currentStep;
                }
                break;
                
            case 'models.html':
                // Save scroll position
                context.scrollPosition = window.scrollY;
                // Save any active filters
                var activeFilter = document.querySelector('.filter-btn.active');
                if (activeFilter) {
                    context.activeFilter = activeFilter.dataset.filter;
                }
                break;
                
            case 'model-register.html':
                // Save registration progress
                if (window.currentStep) {
                    context.registrationStep = window.currentStep;
                }
                break;
                
            case 'admin.html':
                // Save active tab
                var activeTab = document.querySelector('.tab-btn.active');
                if (activeTab) {
                    context.activeTab = activeTab.dataset.tab;
                }
                break;
        }
        
        return context;
    };

    /**
     * Navigate to a page with context
     * @param {string} page - Page to navigate to
     * @param {Object} context - Context to pass to the page
     */
    NavigationManager.prototype.navigate = function(page, context) {
        // Save context for the target page
        this.context[page] = Object.assign({}, this.context[page], context, {
            from: this.getCurrentPage(),
            timestamp: Date.now()
        });
        
        this.saveState();
        
        // Handle relative vs absolute URLs
        if (page.startsWith('http') || page.startsWith('/')) {
            window.location.href = page;
        } else {
            window.location.href = page;
        }
    };

    /**
     * Go back with proper context
     */
    NavigationManager.prototype.goBack = function() {
        // Remove current page from history
        this.history.pop();
        
        // Get previous page
        var previous = this.history[this.history.length - 1];
        
        if (previous) {
            // Restore context
            this.context[this.getCurrentPage()] = this.getCurrentPageContext();
            this.saveState();
            
            window.location.href = previous.url;
        } else {
            // Fallback behavior based on current page
            this.goToDefaultBack();
        }
    };

    /**
     * Default back navigation based on current page
     */
    NavigationManager.prototype.goToDefaultBack = function() {
        var currentPage = this.getCurrentPage();
        var referrer = this.referrer;
        
        switch (currentPage) {
            case 'model-register.html':
                // Check if came from models page
                if (referrer.includes('models.html')) {
                    window.location.href = 'models.html';
                } else {
                    window.location.href = 'index.html';
                }
                break;
                
            case 'models.html':
            case 'admin.html':
            case 'model-dashboard.html':
                window.location.href = 'index.html';
                break;
                
            default:
                window.location.href = 'index.html';
        }
    };

    /**
     * Get current page name
     */
    NavigationManager.prototype.getCurrentPage = function() {
        var path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    };

    /**
     * Get context for current page
     */
    NavigationManager.prototype.getContext = function() {
        var currentPage = this.getCurrentPage();
        var context = this.context[currentPage] || {};
        
        // Clean up old context (older than 30 minutes)
        var thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        if (context.timestamp && context.timestamp < thirtyMinutesAgo) {
            delete this.context[currentPage];
            this.saveState();
            return {};
        }
        
        return context;
    };

    /**
     * Set context for current page
     */
    NavigationManager.prototype.setContext = function(key, value) {
        var currentPage = this.getCurrentPage();
        if (!this.context[currentPage]) {
            this.context[currentPage] = {};
        }
        this.context[currentPage][key] = value;
        this.context[currentPage].timestamp = Date.now();
        this.saveState();
    };

    /**
     * Handle browser back button
     */
    NavigationManager.prototype.handlePopState = function(event) {
        // Browser back button was pressed
        // We could handle this more gracefully if needed
    };

    /**
     * Create breadcrumb HTML
     * @returns {string} Breadcrumb HTML
     */
    NavigationManager.prototype.getBreadcrumbHTML = function() {
        var currentPage = this.getCurrentPage();
        var breadcrumbs = ['<a href="index.html">홈</a>'];
        
        switch (currentPage) {
            case 'models.html':
                breadcrumbs.push('<span class="current">모델</span>');
                break;
                
            case 'model-register.html':
                var from = this.getContext().from;
                if (from === 'models.html') {
                    breadcrumbs.push('<a href="models.html">모델</a>');
                }
                breadcrumbs.push('<span class="current">모델 등록</span>');
                break;
                
            case 'admin.html':
                breadcrumbs.push('<span class="current">관리자</span>');
                break;
                
            case 'model-dashboard.html':
                breadcrumbs.push('<a href="models.html">모델</a>');
                breadcrumbs.push('<span class="current">대시보드</span>');
                break;
        }
        
        return breadcrumbs.join(' <span class="separator">›</span> ');
    };

    /**
     * Insert breadcrumb navigation
     */
    NavigationManager.prototype.insertBreadcrumb = function() {
        // Don't show breadcrumb on main page
        if (this.getCurrentPage() === 'index.html' || this.getCurrentPage() === '') {
            return;
        }
        
        var breadcrumbContainer = document.getElementById('breadcrumb-nav');
        if (!breadcrumbContainer) {
            // Create breadcrumb container if it doesn't exist
            var header = document.querySelector('header') || document.querySelector('.header');
            if (header) {
                breadcrumbContainer = document.createElement('nav');
                breadcrumbContainer.id = 'breadcrumb-nav';
                breadcrumbContainer.className = 'breadcrumb-navigation';
                breadcrumbContainer.setAttribute('aria-label', 'breadcrumb');
                
                // Insert after header
                header.parentNode.insertBefore(breadcrumbContainer, header.nextSibling);
            }
        }
        
        if (breadcrumbContainer) {
            breadcrumbContainer.innerHTML = this.getBreadcrumbHTML();
        }
    };

    /**
     * Utility method to handle model selection across pages
     */
    NavigationManager.prototype.selectModelAndNavigate = function(modelId, modelData) {
        this.setContext('selectedModel', {
            id: modelId,
            data: modelData
        });
        this.navigate('index.html', {
            autoSelectModel: modelId
        });
    };

    // Create global instance
    window.navigationManager = new NavigationManager();

    // Auto-insert breadcrumb on page load
    document.addEventListener('DOMContentLoaded', function() {
        window.navigationManager.insertBreadcrumb();
    });

    // Export for module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NavigationManager;
    }
})();