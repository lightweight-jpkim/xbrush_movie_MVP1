/**
 * ProgressManager - Manages progress updates and animations across the application
 * Handles progress intervals, status updates, and cleanup
 * @class
 */
class ProgressManager {
    /**
     * Create a ProgressManager instance
     * @constructor
     * @param {Object} config - Configuration options
     * @param {number} config.minStep - Minimum progress step (default: 1)
     * @param {number} config.maxStep - Maximum progress step (default: 3)
     * @param {number} config.interval - Update interval in ms (default: 1000)
     * @param {number} config.completionDelay - Delay after completion in ms (default: 500)
     */
    constructor(config = {}) {
        this.config = {
            minStep: config.minStep || 1,
            maxStep: config.maxStep || 3,
            interval: config.interval || 1000,
            completionDelay: config.completionDelay || 500
        };
        
        this.activeIntervals = new Map();
        this.progressStates = new Map();
    }

    /**
     * Start a progress animation
     * @param {string} progressId - Unique identifier for this progress
     * @param {Object} options - Progress options
     * @param {Array<string>} options.statusMessages - Array of status messages to cycle through
     * @param {Function} options.onComplete - Callback when progress reaches 100%
     * @param {Function} options.onUpdate - Callback for each update (receives progress and status)
     * @param {number} options.startProgress - Starting progress value (default: 0)
     * @param {string} options.progressBarId - DOM element ID for progress bar
     * @param {string} options.percentageId - DOM element ID for percentage display
     * @param {string} options.statusId - DOM element ID for status display
     * @returns {string} Progress ID for reference
     */
    startProgress(progressId, options = {}) {
        // Clean up any existing progress with same ID
        this.stopProgress(progressId);

        const state = {
            progress: options.startProgress || 0,
            statusIndex: 0,
            statusMessages: options.statusMessages || ['Processing...'],
            onComplete: options.onComplete,
            onUpdate: options.onUpdate,
            progressBarId: options.progressBarId || 'progressBar',
            percentageId: options.percentageId || 'progressPercentage',
            statusId: options.statusId || 'progressStatus'
        };

        this.progressStates.set(progressId, state);

        // Create the interval
        const intervalId = setInterval(() => {
            this.updateProgress(progressId);
        }, this.config.interval);

        this.activeIntervals.set(progressId, intervalId);

        // Initial update
        this.renderProgress(progressId);

        return progressId;
    }

    /**
     * Update progress for a specific progress animation
     * @private
     * @param {string} progressId - Progress identifier
     */
    updateProgress(progressId) {
        const state = this.progressStates.get(progressId);
        if (!state) return;

        // Calculate random progress increment
        const increment = Math.random() * (this.config.maxStep - this.config.minStep) + this.config.minStep;
        state.progress = Math.min(state.progress + increment, 100);

        // Update status message index
        if (state.statusIndex < state.statusMessages.length - 1) {
            const progressPerMessage = 100 / state.statusMessages.length;
            const targetIndex = Math.floor(state.progress / progressPerMessage);
            if (targetIndex > state.statusIndex) {
                state.statusIndex = Math.min(targetIndex, state.statusMessages.length - 1);
            }
        }

        // Render the update
        this.renderProgress(progressId);

        // Handle completion
        if (state.progress >= 100) {
            this.completeProgress(progressId);
        }
    }

    /**
     * Render progress to DOM elements
     * @private
     * @param {string} progressId - Progress identifier
     */
    renderProgress(progressId) {
        const state = this.progressStates.get(progressId);
        if (!state) return;

        const currentStatus = state.statusMessages[state.statusIndex];

        try {
            // Update progress bar
            const progressBar = document.getElementById(state.progressBarId);
            if (progressBar) {
                progressBar.style.width = `${state.progress}%`;
            }

            // Update percentage display
            const percentageElement = document.getElementById(state.percentageId);
            if (percentageElement) {
                percentageElement.textContent = `${Math.round(state.progress)}%`;
            }

            // Update status message
            const statusElement = document.getElementById(state.statusId);
            if (statusElement) {
                statusElement.textContent = currentStatus;
            }

            // Call custom update callback
            if (state.onUpdate) {
                state.onUpdate(state.progress, currentStatus);
            }
        } catch (error) {
            console.error('Error rendering progress:', error);
        }
    }

    /**
     * Complete a progress animation
     * @private
     * @param {string} progressId - Progress identifier
     */
    completeProgress(progressId) {
        const state = this.progressStates.get(progressId);
        if (!state) return;

        // Ensure we show the final status message
        state.statusIndex = state.statusMessages.length - 1;
        state.progress = 100;
        this.renderProgress(progressId);

        // Stop the interval
        this.stopProgress(progressId);

        // Call completion callback after delay
        if (state.onComplete) {
            setTimeout(() => {
                state.onComplete();
            }, this.config.completionDelay);
        }
    }

    /**
     * Stop a progress animation
     * @param {string} progressId - Progress identifier
     */
    stopProgress(progressId) {
        const intervalId = this.activeIntervals.get(progressId);
        if (intervalId) {
            clearInterval(intervalId);
            this.activeIntervals.delete(progressId);
        }
    }

    /**
     * Set progress to a specific value
     * @param {string} progressId - Progress identifier
     * @param {number} progress - Progress value (0-100)
     * @param {string} status - Optional status message
     */
    setProgress(progressId, progress, status = null) {
        const state = this.progressStates.get(progressId);
        if (!state) return;

        state.progress = Math.max(0, Math.min(100, progress));
        
        if (status) {
            // Find or add the status message
            const statusIndex = state.statusMessages.indexOf(status);
            if (statusIndex >= 0) {
                state.statusIndex = statusIndex;
            } else {
                state.statusMessages.push(status);
                state.statusIndex = state.statusMessages.length - 1;
            }
        }

        this.renderProgress(progressId);

        if (state.progress >= 100) {
            this.completeProgress(progressId);
        }
    }

    /**
     * Get current progress state
     * @param {string} progressId - Progress identifier
     * @returns {Object|null} Current progress state or null
     */
    getProgress(progressId) {
        const state = this.progressStates.get(progressId);
        return state ? {
            progress: state.progress,
            status: state.statusMessages[state.statusIndex],
            isActive: this.activeIntervals.has(progressId)
        } : null;
    }

    /**
     * Stop all active progress animations
     */
    stopAll() {
        for (const progressId of this.activeIntervals.keys()) {
            this.stopProgress(progressId);
        }
    }

    /**
     * Clean up completed progress states
     * @param {string} progressId - Progress identifier (optional, cleans all if not provided)
     */
    cleanup(progressId = null) {
        if (progressId) {
            this.stopProgress(progressId);
            this.progressStates.delete(progressId);
        } else {
            // Clean up all completed progress states
            for (const [id, state] of this.progressStates.entries()) {
                if (state.progress >= 100 && !this.activeIntervals.has(id)) {
                    this.progressStates.delete(id);
                }
            }
        }
    }

    /**
     * Create a simple progress animation with default DOM elements
     * @param {Array<string>} statusMessages - Status messages to display
     * @param {Function} onComplete - Completion callback
     * @returns {string} Progress ID
     */
    createSimpleProgress(statusMessages, onComplete) {
        const progressId = `progress_${Date.now()}`;
        return this.startProgress(progressId, {
            statusMessages,
            onComplete
        });
    }

    /**
     * Update configuration
     * @param {Object} config - New configuration values
     */
    updateConfig(config) {
        Object.assign(this.config, config);
    }
}

// Create a singleton instance for global use
const progressManager = new ProgressManager();

// Make it available globally if needed
if (typeof window !== 'undefined') {
    window.ProgressManager = ProgressManager;
    window.progressManager = progressManager;
}