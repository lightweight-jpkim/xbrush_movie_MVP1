/**
 * Accessibility Module
 * Handles ARIA labels, keyboard navigation, and focus management
 */

(function(window) {
    'use strict';

    const AccessibilityModule = {
        /**
         * Initialize accessibility features
         */
        initialize: function() {
            this.addAriaLabels();
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
            this.setupSkipLinks();
            this.announcePageChanges();
        },

        /**
         * Add missing ARIA labels to interactive elements
         */
        addAriaLabels: function() {
            // Buttons without aria-label
            document.querySelectorAll('button:not([aria-label])').forEach(button => {
                const text = button.textContent.trim();
                if (text && !button.querySelector('img')) {
                    button.setAttribute('aria-label', text);
                }
            });

            // Links without aria-label
            document.querySelectorAll('a:not([aria-label])').forEach(link => {
                const text = link.textContent.trim();
                if (text && !link.querySelector('img')) {
                    link.setAttribute('aria-label', text);
                }
            });

            // Form inputs
            document.querySelectorAll('input, textarea, select').forEach(input => {
                if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                    const label = document.querySelector(`label[for="${input.id}"]`);
                    if (label) {
                        input.setAttribute('aria-labelledby', label.id || this.generateId(label));
                    } else if (input.placeholder) {
                        input.setAttribute('aria-label', input.placeholder);
                    }
                }
            });

            // Images
            document.querySelectorAll('img:not([alt])').forEach(img => {
                img.setAttribute('alt', '');
            });

            // Progress indicators
            document.querySelectorAll('.progress-bar').forEach(progress => {
                if (!progress.getAttribute('role')) {
                    progress.setAttribute('role', 'progressbar');
                    progress.setAttribute('aria-valuemin', '0');
                    progress.setAttribute('aria-valuemax', '100');
                }
            });

            // Modal dialogs
            document.querySelectorAll('.modal, [role="dialog"]').forEach(modal => {
                if (!modal.getAttribute('role')) {
                    modal.setAttribute('role', 'dialog');
                }
                if (!modal.getAttribute('aria-modal')) {
                    modal.setAttribute('aria-modal', 'true');
                }
            });
        },

        /**
         * Setup keyboard navigation
         */
        setupKeyboardNavigation: function() {
            // Tab navigation for custom components
            document.addEventListener('keydown', (e) => {
                // Escape key to close modals
                if (e.key === 'Escape') {
                    this.closeActiveModal();
                }

                // Arrow key navigation for carousels
                if (e.key.startsWith('Arrow')) {
                    this.handleArrowNavigation(e);
                }

                // Enter key for clickable elements
                if (e.key === 'Enter') {
                    this.handleEnterKey(e);
                }
            });

            // Add keyboard support to clickable divs
            document.querySelectorAll('[onclick]').forEach(element => {
                if (!element.getAttribute('role')) {
                    element.setAttribute('role', 'button');
                }
                if (!element.hasAttribute('tabindex')) {
                    element.setAttribute('tabindex', '0');
                }
            });
        },

        /**
         * Setup focus management for modals
         */
        setupFocusManagement: function() {
            // Track focus when opening modals
            let lastFocusedElement = null;

            // Monitor modal opens
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const element = mutation.target;
                        if (element.classList.contains('modal') || element.getAttribute('role') === 'dialog') {
                            if (element.style.display !== 'none' && element.style.display !== '') {
                                this.trapFocus(element);
                            } else {
                                this.releaseFocus();
                            }
                        }
                    }
                });
            });

            // Observe all modals
            document.querySelectorAll('.modal, [role="dialog"]').forEach(modal => {
                observer.observe(modal, { attributes: true });
            });
        },

        /**
         * Trap focus within element
         */
        trapFocus: function(element) {
            const focusableElements = element.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), ' +
                'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            // Store current focus
            this.lastFocusedElement = document.activeElement;

            // Focus first element
            firstFocusable.focus();

            // Handle tab key
            element.addEventListener('keydown', function trapHandler(e) {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            });

            element.dataset.trapHandler = 'true';
        },

        /**
         * Release focus trap
         */
        releaseFocus: function() {
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
                this.lastFocusedElement = null;
            }
        },

        /**
         * Setup skip links for screen readers
         */
        setupSkipLinks: function() {
            // Create skip link if not exists
            if (!document.querySelector('.skip-link')) {
                const skipLink = document.createElement('a');
                skipLink.href = '#main-content';
                skipLink.className = 'skip-link';
                skipLink.textContent = '본문으로 건너뛰기';
                document.body.insertBefore(skipLink, document.body.firstChild);
            }

            // Ensure main content has id
            const mainContent = document.querySelector('main, .container');
            if (mainContent && !mainContent.id) {
                mainContent.id = 'main-content';
            }
        },

        /**
         * Announce page changes to screen readers
         */
        announcePageChanges: function() {
            // Create announcement region
            if (!document.querySelector('[role="status"]')) {
                const announcer = document.createElement('div');
                announcer.setAttribute('role', 'status');
                announcer.setAttribute('aria-live', 'polite');
                announcer.setAttribute('aria-atomic', 'true');
                announcer.className = 'sr-only';
                announcer.id = 'page-announcer';
                document.body.appendChild(announcer);
            }
        },

        /**
         * Announce message to screen readers
         */
        announce: function(message) {
            const announcer = document.getElementById('page-announcer');
            if (announcer) {
                announcer.textContent = message;
                // Clear after announcement
                setTimeout(() => {
                    announcer.textContent = '';
                }, 1000);
            }
        },

        /**
         * Handle arrow key navigation
         */
        handleArrowNavigation: function(e) {
            const target = e.target;
            
            // Check if target is within a carousel
            const carousel = target.closest('.carousel, .premium-models-carousel');
            if (carousel) {
                e.preventDefault();
                if (e.key === 'ArrowLeft') {
                    this.focusPreviousItem(carousel);
                } else if (e.key === 'ArrowRight') {
                    this.focusNextItem(carousel);
                }
            }
        },

        /**
         * Handle enter key for custom buttons
         */
        handleEnterKey: function(e) {
            const target = e.target;
            if (target.getAttribute('role') === 'button' && target.onclick) {
                e.preventDefault();
                target.click();
            }
        },

        /**
         * Close active modal
         */
        closeActiveModal: function() {
            const activeModal = document.querySelector('.modal[style*="block"], [role="dialog"][style*="block"]');
            if (activeModal) {
                const closeButton = activeModal.querySelector('.close, [aria-label*="닫기"], [aria-label*="Close"]');
                if (closeButton) {
                    closeButton.click();
                }
            }
        },

        /**
         * Generate unique ID
         */
        generateId: function(element) {
            const id = 'aria-' + Math.random().toString(36).substr(2, 9);
            element.id = id;
            return id;
        },

        /**
         * Focus previous item in container
         */
        focusPreviousItem: function(container) {
            const items = container.querySelectorAll('[tabindex="0"], button, a');
            const currentIndex = Array.from(items).indexOf(document.activeElement);
            if (currentIndex > 0) {
                items[currentIndex - 1].focus();
            }
        },

        /**
         * Focus next item in container
         */
        focusNextItem: function(container) {
            const items = container.querySelectorAll('[tabindex="0"], button, a');
            const currentIndex = Array.from(items).indexOf(document.activeElement);
            if (currentIndex < items.length - 1) {
                items[currentIndex + 1].focus();
            }
        }
    };

    // Export to global scope
    window.AccessibilityModule = AccessibilityModule;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AccessibilityModule.initialize();
        });
    } else {
        AccessibilityModule.initialize();
    }

})(window);