/**
 * Image Loader Utility
 * Handles optimized image loading with lazy loading and error handling
 */

class ImageLoader {
    constructor() {
        this.loadedImages = new Set();
        this.imageObserver = null;
        this.init();
    }
    
    init() {
        // Set up Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: '50px 0px', // Start loading 50px before visible
                    threshold: 0.01
                }
            );
        }
        
        // Process existing images
        this.processImages();
        
        // Listen for dynamic content
        this.observeMutations();
    }
    
    /**
     * Process all images on the page
     */
    processImages() {
        // Featured model images
        document.querySelectorAll('.featured-model-image').forEach(img => {
            this.optimizeImage(img);
        });
        
        // Model card thumbnails
        document.querySelectorAll('.model-thumbnail').forEach(img => {
            this.optimizeImage(img);
        });
        
        // Model showcase images
        document.querySelectorAll('.model-card-image img').forEach(img => {
            this.optimizeImage(img);
        });
    }
    
    /**
     * Optimize individual image
     */
    optimizeImage(img) {
        // Skip if already processed
        if (this.loadedImages.has(img.src)) {
            img.classList.add('loaded');
            return;
        }
        
        // Add loading state
        const container = img.closest('.featured-model-image-container, .model-card-image, .model-image');
        if (container && !container.querySelector('.image-skeleton')) {
            this.addSkeleton(container);
        }
        
        // Set up lazy loading
        if (this.imageObserver && img.dataset.src) {
            this.imageObserver.observe(img);
        } else {
            // Load immediately if no lazy loading
            this.loadImage(img);
        }
    }
    
    /**
     * Handle intersection observer callback
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.imageObserver.unobserve(img);
            }
        });
    }
    
    /**
     * Load image with error handling
     */
    loadImage(img) {
        const src = img.dataset.src || img.src;
        
        // Skip if no source
        if (!src || src === 'undefined' || src === 'null') {
            this.handleImageError(img);
            return;
        }
        
        // Create a new image to preload
        const tempImg = new Image();
        
        tempImg.onload = () => {
            // Set the source
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
            
            // Mark as loaded
            img.classList.add('loaded');
            this.loadedImages.add(src);
            
            // Remove skeleton
            const container = img.closest('.featured-model-image-container, .model-card-image, .model-image');
            if (container) {
                const skeleton = container.querySelector('.image-skeleton');
                if (skeleton) {
                    skeleton.remove();
                }
            }
            
            // Trigger loaded event
            img.dispatchEvent(new Event('imageloaded'));
        };
        
        tempImg.onerror = () => {
            this.handleImageError(img);
        };
        
        // Start loading
        tempImg.src = src;
    }
    
    /**
     * Add skeleton loader
     */
    addSkeleton(container) {
        const skeleton = document.createElement('div');
        skeleton.className = 'image-skeleton';
        container.appendChild(skeleton);
    }
    
    /**
     * Handle image load errors
     */
    handleImageError(img) {
        const container = img.closest('.featured-model-image-container, .model-card-image, .model-image');
        
        if (container) {
            // Remove skeleton
            const skeleton = container.querySelector('.image-skeleton');
            if (skeleton) {
                skeleton.remove();
            }
            
            // Add error state
            const errorDiv = document.createElement('div');
            errorDiv.className = 'image-error';
            errorDiv.innerHTML = `
                <div class="image-error-icon">🖼️</div>
                <div>이미지 로드 실패</div>
            `;
            container.appendChild(errorDiv);
        }
        
        // Hide the broken image
        img.style.display = 'none';
    }
    
    /**
     * Observe DOM mutations for new images
     */
    observeMutations() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's an image
                        if (node.tagName === 'IMG') {
                            this.optimizeImage(node);
                        }
                        
                        // Check for images within the added node
                        const images = node.querySelectorAll('img');
                        images.forEach(img => this.optimizeImage(img));
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Preload critical images
     */
    preloadCriticalImages() {
        // Preload first 4 model images
        const criticalImages = document.querySelectorAll(
            '.featured-model-image:nth-child(-n+4), .model-card-image:nth-child(-n+4) img'
        );
        
        criticalImages.forEach(img => {
            img.loading = 'eager';
            this.loadImage(img);
        });
    }
    
    /**
     * Get optimized image URL with size parameters
     */
    getOptimizedUrl(originalUrl, width, height) {
        // If it's a placeholder URL, return as is
        if (!originalUrl || originalUrl.includes('placeholder')) {
            return originalUrl;
        }
        
        // For Firebase Storage URLs, add size parameters
        if (originalUrl.includes('firebasestorage.googleapis.com')) {
            const separator = originalUrl.includes('?') ? '&' : '?';
            return `${originalUrl}${separator}w=${width}&h=${height}`;
        }
        
        return originalUrl;
    }
}

// Initialize image loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageLoader = new ImageLoader();
    });
} else {
    window.imageLoader = new ImageLoader();
}

// Export for use in other modules
window.ImageLoader = ImageLoader;