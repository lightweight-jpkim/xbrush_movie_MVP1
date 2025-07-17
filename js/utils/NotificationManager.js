/**
 * NotificationManager - Centralized notification/toast management
 * Handles all toast notifications, alerts, and user feedback messages
 */
(function() {
    'use strict';

    /**
     * @typedef {Object} NotificationOptions
     * @property {'success'|'error'|'warning'|'info'} type - Notification type
     * @property {number} duration - Display duration in milliseconds
     * @property {boolean} persistent - Whether the notification stays until dismissed
     * @property {Function} onClose - Callback when notification is closed
     */

    /**
     * NotificationManager class for handling all notifications
     * @class
     */
    function NotificationManager() {
        this.toastContainer = null;
        this.activeToasts = [];
        this.init();
    }

    /**
     * Initialize the notification system
     */
    NotificationManager.prototype.init = function() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(this.toastContainer);
        } else {
            this.toastContainer = document.getElementById('toast-container');
        }
    };

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string|NotificationOptions} typeOrOptions - Type or full options object
     * @returns {HTMLElement} The toast element
     */
    NotificationManager.prototype.showToast = function(message, typeOrOptions) {
        var options = typeof typeOrOptions === 'string' 
            ? { type: typeOrOptions } 
            : (typeOrOptions || {});
        
        options = Object.assign({
            type: 'info',
            duration: 3000,
            persistent: false,
            onClose: null
        }, options);

        var toast = this.createToastElement(message, options);
        this.toastContainer.appendChild(toast);
        this.activeToasts.push(toast);

        // Trigger animation
        requestAnimationFrame(function() {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Auto remove if not persistent
        if (!options.persistent) {
            setTimeout(function() {
                this.removeToast(toast, options.onClose);
            }.bind(this), options.duration);
        }

        return toast;
    };

    /**
     * Create toast element
     * @private
     */
    NotificationManager.prototype.createToastElement = function(message, options) {
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + options.type;
        toast.style.cssText = `
            background: ${this.getBackgroundColor(options.type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 250px;
            max-width: 400px;
            pointer-events: all;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateX(100%);
        `;

        var icon = document.createElement('span');
        icon.innerHTML = this.getIcon(options.type);
        icon.style.fontSize = '20px';
        
        var text = document.createElement('span');
        text.textContent = message;
        text.style.flex = '1';

        toast.appendChild(icon);
        toast.appendChild(text);

        // Click to dismiss
        toast.addEventListener('click', function() {
            this.removeToast(toast, options.onClose);
        }.bind(this));

        return toast;
    };

    /**
     * Remove a toast
     * @private
     */
    NotificationManager.prototype.removeToast = function(toast, onClose) {
        if (!toast || !toast.parentElement) return;

        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';

        setTimeout(function() {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            var index = this.activeToasts.indexOf(toast);
            if (index > -1) {
                this.activeToasts.splice(index, 1);
            }
            if (onClose) onClose();
        }.bind(this), 300);
    };

    /**
     * Get background color for toast type
     * @private
     */
    NotificationManager.prototype.getBackgroundColor = function(type) {
        var colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    };

    /**
     * Get icon for toast type
     * @private
     */
    NotificationManager.prototype.getIcon = function(type) {
        var icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    };

    /**
     * Show a confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Object} options - Options including onConfirm and onCancel callbacks
     * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
     */
    NotificationManager.prototype.confirm = function(message, options) {
        options = options || {};
        
        return new Promise(function(resolve) {
            // Use native confirm for now, can be replaced with custom modal
            var result = window.confirm(message);
            
            if (result) {
                if (options.onConfirm) options.onConfirm();
                resolve(true);
            } else {
                if (options.onCancel) options.onCancel();
                resolve(false);
            }
        });
    };

    /**
     * Show an alert dialog
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, error, warning, info)
     */
    NotificationManager.prototype.alert = function(message, type) {
        type = type || 'info';
        
        // For now, use toast for alerts
        // Can be replaced with modal in the future
        this.showToast(message, {
            type: type,
            duration: 5000
        });
    };

    /**
     * Clear all active toasts
     */
    NotificationManager.prototype.clearAll = function() {
        this.activeToasts.forEach(function(toast) {
            this.removeToast(toast);
        }.bind(this));
        this.activeToasts = [];
    };

    /**
     * Show success message
     * @param {string} message
     * @param {Object} options
     */
    NotificationManager.prototype.success = function(message, options) {
        return this.showToast(message, Object.assign({ type: 'success' }, options));
    };

    /**
     * Show error message
     * @param {string} message
     * @param {Object} options
     */
    NotificationManager.prototype.error = function(message, options) {
        return this.showToast(message, Object.assign({ type: 'error' }, options));
    };

    /**
     * Show warning message
     * @param {string} message
     * @param {Object} options
     */
    NotificationManager.prototype.warning = function(message, options) {
        return this.showToast(message, Object.assign({ type: 'warning' }, options));
    };

    /**
     * Show info message
     * @param {string} message
     * @param {Object} options
     */
    NotificationManager.prototype.info = function(message, options) {
        return this.showToast(message, Object.assign({ type: 'info' }, options));
    };

    // Create global instance
    window.notificationManager = new NotificationManager();

    // Legacy support - redirect showToast calls to NotificationManager
    window.showToast = function(message, type) {
        return window.notificationManager.showToast(message, type);
    };

    // Export for potential module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NotificationManager;
    }
})();