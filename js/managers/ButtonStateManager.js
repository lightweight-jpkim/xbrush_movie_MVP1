/**
 * ButtonStateManager - Manages button states across the application
 * Handles enabling/disabling, CSS class management, and batch updates
 * @class
 */
class ButtonStateManager {
    /**
     * Create a ButtonStateManager instance
     * @constructor
     */
    constructor() {
        this.buttonStates = new Map();
        this.defaultClasses = {
            enabled: 'btn-primary',
            disabled: 'btn-disabled'
        };
    }

    /**
     * Update a single button's state
     * @param {string|HTMLElement} buttonOrId - Button element or ID
     * @param {boolean} enabled - Whether the button should be enabled
     * @param {Object} options - Additional options
     * @param {string} options.enabledClass - CSS class for enabled state
     * @param {string} options.disabledClass - CSS class for disabled state
     * @param {string} options.text - Text to set on the button
     * @param {string} options.title - Title attribute to set
     * @returns {boolean} Success status
     */
    updateButtonState(buttonOrId, enabled, options = {}) {
        try {
            const button = typeof buttonOrId === 'string' 
                ? document.getElementById(buttonOrId) 
                : buttonOrId;
            
            if (!button) {
                console.warn(`Button not found: ${buttonOrId}`);
                return false;
            }

            const enabledClass = options.enabledClass || this.defaultClasses.enabled;
            const disabledClass = options.disabledClass || this.defaultClasses.disabled;

            // Update disabled property
            button.disabled = !enabled;

            // Update CSS classes
            if (enabled) {
                button.classList.remove(disabledClass);
                button.classList.add(enabledClass);
            } else {
                button.classList.add(disabledClass);
                button.classList.remove(enabledClass);
            }

            // Update text if provided
            if (options.text !== undefined) {
                button.textContent = options.text;
            }

            // Update title if provided
            if (options.title !== undefined) {
                button.title = options.title;
            }

            // Store state for persistence
            this.buttonStates.set(button.id || buttonOrId, {
                enabled,
                text: options.text || button.textContent,
                title: options.title || button.title
            });

            return true;
        } catch (error) {
            console.error('Error updating button state:', error);
            return false;
        }
    }

    /**
     * Batch update multiple buttons
     * @param {Array<Object>} updates - Array of update configurations
     * @param {string|HTMLElement} updates[].button - Button element or ID
     * @param {boolean} updates[].enabled - Whether the button should be enabled
     * @param {Object} updates[].options - Additional options (same as updateButtonState)
     * @returns {Object} Results object with success/failure counts
     */
    batchUpdate(updates) {
        const results = {
            successful: 0,
            failed: 0,
            details: []
        };

        for (const update of updates) {
            const success = this.updateButtonState(
                update.button || update.buttonId,
                update.enabled,
                update.options || {}
            );

            if (success) {
                results.successful++;
            } else {
                results.failed++;
            }

            results.details.push({
                button: update.button || update.buttonId,
                success
            });
        }

        return results;
    }

    /**
     * Enable a button with optional configuration
     * @param {string|HTMLElement} buttonOrId - Button element or ID
     * @param {Object} options - Additional options
     * @returns {boolean} Success status
     */
    enableButton(buttonOrId, options = {}) {
        return this.updateButtonState(buttonOrId, true, options);
    }

    /**
     * Disable a button with optional configuration
     * @param {string|HTMLElement} buttonOrId - Button element or ID
     * @param {Object} options - Additional options
     * @returns {boolean} Success status
     */
    disableButton(buttonOrId, options = {}) {
        return this.updateButtonState(buttonOrId, false, options);
    }

    /**
     * Toggle button state
     * @param {string|HTMLElement} buttonOrId - Button element or ID
     * @param {Object} options - Additional options
     * @returns {boolean} Success status
     */
    toggleButton(buttonOrId, options = {}) {
        try {
            const button = typeof buttonOrId === 'string' 
                ? document.getElementById(buttonOrId) 
                : buttonOrId;
            
            if (!button) return false;
            
            return this.updateButtonState(button, button.disabled, options);
        } catch (error) {
            console.error('Error toggling button:', error);
            return false;
        }
    }

    /**
     * Add custom CSS class to button
     * @param {string|HTMLElement} buttonOrId - Button element or ID
     * @param {string|Array<string>} classes - CSS class(es) to add
     * @returns {boolean} Success status
     */
    addClass(buttonOrId, classes) {
        try {
            const button = typeof buttonOrId === 'string' 
                ? document.getElementById(buttonOrId) 
                : buttonOrId;
            
            if (!button) return false;

            const classArray = Array.isArray(classes) ? classes : [classes];
            button.classList.add(...classArray);
            return true;
        } catch (error) {
            console.error('Error adding classes:', error);
            return false;
        }
    }

    /**
     * Remove custom CSS class from button
     * @param {string|HTMLElement} buttonOrId - Button element or ID
     * @param {string|Array<string>} classes - CSS class(es) to remove
     * @returns {boolean} Success status
     */
    removeClass(buttonOrId, classes) {
        try {
            const button = typeof buttonOrId === 'string' 
                ? document.getElementById(buttonOrId) 
                : buttonOrId;
            
            if (!button) return false;

            const classArray = Array.isArray(classes) ? classes : [classes];
            button.classList.remove(...classArray);
            return true;
        } catch (error) {
            console.error('Error removing classes:', error);
            return false;
        }
    }

    /**
     * Get stored button state
     * @param {string} buttonId - Button ID
     * @returns {Object|null} Stored state or null if not found
     */
    getButtonState(buttonId) {
        return this.buttonStates.get(buttonId) || null;
    }

    /**
     * Restore button states from storage
     * @param {Object} states - Previously saved states
     */
    restoreStates(states) {
        for (const [buttonId, state] of Object.entries(states)) {
            this.updateButtonState(buttonId, state.enabled, {
                text: state.text,
                title: state.title
            });
        }
    }

    /**
     * Get all button states for persistence
     * @returns {Object} All stored button states
     */
    getAllStates() {
        return Object.fromEntries(this.buttonStates);
    }

    /**
     * Clear all stored states
     */
    clearStates() {
        this.buttonStates.clear();
    }

    /**
     * Set default CSS classes for enabled/disabled states
     * @param {Object} classes - CSS class configuration
     * @param {string} classes.enabled - CSS class for enabled state
     * @param {string} classes.disabled - CSS class for disabled state
     */
    setDefaultClasses(classes) {
        if (classes.enabled) {
            this.defaultClasses.enabled = classes.enabled;
        }
        if (classes.disabled) {
            this.defaultClasses.disabled = classes.disabled;
        }
    }
}

// Create a singleton instance for global use
const buttonStateManager = new ButtonStateManager();

// Make it available globally if needed
if (typeof window !== 'undefined') {
    window.ButtonStateManager = ButtonStateManager;
    window.buttonStateManager = buttonStateManager;
}