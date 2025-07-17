/**
 * URL State Manager - Manages URL parameters for filters, pagination, etc.
 * Ensures browser back/forward buttons work correctly with in-page navigation
 */
(function() {
    'use strict';

    /**
     * URLStateManager class
     * @class
     */
    function URLStateManager() {
        this.listeners = {};
        this.init();
    }

    /**
     * Initialize URL state manager
     */
    URLStateManager.prototype.init = function() {
        // Listen for browser back/forward buttons
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Initialize state from current URL
        this.currentState = this.getStateFromURL();
    };

    /**
     * Get current state from URL parameters
     * @returns {Object} Current state object
     */
    URLStateManager.prototype.getStateFromURL = function() {
        var params = new URLSearchParams(window.location.search);
        var state = {};
        
        // Get all parameters
        params.forEach(function(value, key) {
            // Handle numeric values
            if (!isNaN(value) && value !== '') {
                state[key] = parseInt(value, 10);
            } else {
                state[key] = value;
            }
        });
        
        return state;
    };

    /**
     * Update URL with new state
     * @param {Object} newState - New state to set
     * @param {boolean} replace - Whether to replace current history entry
     */
    URLStateManager.prototype.updateState = function(newState, replace) {
        // Merge with current state
        this.currentState = Object.assign({}, this.currentState, newState);
        
        // Remove null/undefined values
        for (var key in this.currentState) {
            if (this.currentState[key] === null || this.currentState[key] === undefined || this.currentState[key] === '') {
                delete this.currentState[key];
            }
        }
        
        // Build URL
        var params = new URLSearchParams();
        for (var key in this.currentState) {
            params.set(key, this.currentState[key]);
        }
        
        var newURL = window.location.pathname;
        var queryString = params.toString();
        if (queryString) {
            newURL += '?' + queryString;
        }
        
        // Update browser URL
        if (replace) {
            window.history.replaceState(this.currentState, '', newURL);
        } else {
            window.history.pushState(this.currentState, '', newURL);
        }
        
        // Notify listeners
        this.notifyListeners();
    };

    /**
     * Get a specific state value
     * @param {string} key - State key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} State value
     */
    URLStateManager.prototype.getState = function(key, defaultValue) {
        return this.currentState[key] !== undefined ? this.currentState[key] : defaultValue;
    };

    /**
     * Clear specific state values
     * @param {string|Array} keys - Key(s) to clear
     */
    URLStateManager.prototype.clearState = function(keys) {
        if (typeof keys === 'string') {
            keys = [keys];
        }
        
        keys.forEach(function(key) {
            delete this.currentState[key];
        }.bind(this));
        
        this.updateState({}, true);
    };

    /**
     * Handle browser back/forward buttons
     * @param {PopStateEvent} event
     */
    URLStateManager.prototype.handlePopState = function(event) {
        // Update current state from URL
        this.currentState = this.getStateFromURL();
        
        // Notify listeners
        this.notifyListeners();
    };

    /**
     * Add a state change listener
     * @param {string} key - State key to listen for (or '*' for all)
     * @param {Function} callback - Callback function
     */
    URLStateManager.prototype.addListener = function(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    };

    /**
     * Remove a state change listener
     * @param {string} key - State key
     * @param {Function} callback - Callback function
     */
    URLStateManager.prototype.removeListener = function(key, callback) {
        if (this.listeners[key]) {
            var index = this.listeners[key].indexOf(callback);
            if (index > -1) {
                this.listeners[key].splice(index, 1);
            }
        }
    };

    /**
     * Notify all relevant listeners of state change
     */
    URLStateManager.prototype.notifyListeners = function() {
        // Notify global listeners
        if (this.listeners['*']) {
            this.listeners['*'].forEach(function(callback) {
                callback(this.currentState);
            }.bind(this));
        }
        
        // Notify specific listeners
        for (var key in this.currentState) {
            if (this.listeners[key]) {
                this.listeners[key].forEach(function(callback) {
                    callback(this.currentState[key], key);
                }.bind(this));
            }
        }
    };

    /**
     * Helper method for models.html filter handling
     */
    URLStateManager.prototype.setFilter = function(filter) {
        this.updateState({ 
            filter: filter === 'all' ? null : filter,
            page: null // Reset page when filter changes
        });
    };

    /**
     * Helper method for pagination
     */
    URLStateManager.prototype.setPage = function(page) {
        this.updateState({ 
            page: page > 1 ? page : null 
        });
    };

    /**
     * Helper method for search
     */
    URLStateManager.prototype.setSearch = function(query) {
        this.updateState({ 
            search: query || null,
            page: null // Reset page when search changes
        });
    };

    /**
     * Get all current state
     */
    URLStateManager.prototype.getAllState = function() {
        return Object.assign({}, this.currentState);
    };

    // Create global instance
    window.urlStateManager = new URLStateManager();

    // Export for module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = URLStateManager;
    }
})();