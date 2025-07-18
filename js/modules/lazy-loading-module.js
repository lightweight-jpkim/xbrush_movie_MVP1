/**
 * Lazy Loading Module
 * Handles lazy loading of images and videos for better performance
 */

(function(window) {
    'use strict';

    const LazyLoadingModule = {
        /**
         * Configuration
         */
        config: {
            rootMargin: '50px 0px',
            threshold: 0.01,
            loadingClass: 'lazy-loading',
            loadedClass: 'lazy-loaded',
            errorClass: 'lazy-error'
        },

        /**
         * Initialize lazy loading
         */
        initialize: function() {
            // Check if IntersectionObserver is supported
            if (!('IntersectionObserver' in window)) {
                console.warn('IntersectionObserver not supported. Loading all images immediately.');
                this.loadAllImages();
                return;
            }

            // Create observer
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    rootMargin: this.config.rootMargin,
                    threshold: this.config.threshold
                }
            );

            // Start observing
            this.observeElements();

            // Re-observe on dynamic content changes
            this.setupMutationObserver();
        },

        /**
         * Handle intersection changes
         */
        handleIntersection: function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                }
            });
        },

        /**
         * Load element (image or video)
         */
        loadElement: function(element) {
            const src = element.dataset.src;
            const srcset = element.dataset.srcset;

            if (!src && !srcset) return;

            // Add loading class
            element.classList.add(this.config.loadingClass);

            if (element.tagName === 'IMG') {
                this.loadImage(element, src, srcset);
            } else if (element.tagName === 'VIDEO') {
                this.loadVideo(element, src);
            }

            // Stop observing this element
            this.observer.unobserve(element);
        },

        /**
         * Load image
         */
        loadImage: function(img, src, srcset) {
            // Create temporary image to load
            const tempImg = new Image();

            tempImg.onload = () => {
                img.src = src;
                if (srcset) img.srcset = srcset;
                img.classList.remove(this.config.loadingClass);
                img.classList.add(this.config.loadedClass);
                this.triggerAnimation(img);
            };

            tempImg.onerror = () => {
                img.classList.remove(this.config.loadingClass);
                img.classList.add(this.config.errorClass);
                // Set fallback image
                img.src = 'images/placeholder-error.jpg';
            };

            // Start loading
            if (srcset) tempImg.srcset = srcset;
            tempImg.src = src;
        },

        /**
         * Load video
         */
        loadVideo: function(video, src) {
            video.src = src;
            video.load();

            video.onloadeddata = () => {
                video.classList.remove(this.config.loadingClass);
                video.classList.add(this.config.loadedClass);
            };

            video.onerror = () => {
                video.classList.remove(this.config.loadingClass);
                video.classList.add(this.config.errorClass);
            };
        },

        /**
         * Trigger fade-in animation
         */
        triggerAnimation: function(element) {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.3s ease-in-out';
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        },

        /**
         * Observe all lazy elements
         */
        observeElements: function() {
            const lazyElements = document.querySelectorAll('[data-src], [data-srcset]');
            
            lazyElements.forEach(element => {
                // Add placeholder
                if (element.tagName === 'IMG' && !element.src) {
                    element.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                }
                
                this.observer.observe(element);
            });
        },

        /**
         * Setup mutation observer for dynamic content
         */
        setupMutationObserver: function() {
            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if the node itself needs lazy loading
                            if (node.dataset && (node.dataset.src || node.dataset.srcset)) {
                                this.observer.observe(node);
                            }
                            
                            // Check children
                            const lazyChildren = node.querySelectorAll('[data-src], [data-srcset]');
                            lazyChildren.forEach(child => {
                                this.observer.observe(child);
                            });
                        }
                    });
                });
            });

            // Observe the entire document
            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        /**
         * Fallback for browsers without IntersectionObserver
         */
        loadAllImages: function() {
            const lazyElements = document.querySelectorAll('[data-src], [data-srcset]');
            
            lazyElements.forEach(element => {
                const src = element.dataset.src;
                const srcset = element.dataset.srcset;
                
                if (src) element.src = src;
                if (srcset) element.srcset = srcset;
                
                element.classList.add(this.config.loadedClass);
            });
        },

        /**
         * Force load specific elements
         */
        forceLoad: function(selector) {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(element => {
                if (element.dataset.src || element.dataset.srcset) {
                    this.loadElement(element);
                }
            });
        },

        /**
         * Refresh observations (useful after DOM changes)
         */
        refresh: function() {
            this.observeElements();
        }
    };

    // Export to global scope
    window.LazyLoadingModule = LazyLoadingModule;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            LazyLoadingModule.initialize();
        });
    } else {
        LazyLoadingModule.initialize();
    }

})(window);