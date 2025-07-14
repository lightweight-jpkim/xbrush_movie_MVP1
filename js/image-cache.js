/**
 * Image Cache Manager
 * Handles caching of model images for faster loading
 */

class ImageCache {
    constructor() {
        this.cacheName = 'xbrush-image-cache-v1';
        this.memoryCache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.preloadQueue = [];
        this.isPreloading = false;
        
        // Initialize cache
        this.init();
    }
    
    async init() {
        // Check if Cache API is supported
        this.cacheSupported = 'caches' in window;
        
        // Clean up old caches
        if (this.cacheSupported) {
            await this.cleanOldCaches();
        }
        
        // Set up periodic cleanup
        setInterval(() => this.cleanExpiredImages(), 60 * 60 * 1000); // Every hour
    }
    
    /**
     * Get image from cache or fetch and cache it
     */
    async getImage(url) {
        if (!url || url === 'undefined' || url === 'null') {
            return null;
        }
        
        // Check memory cache first
        if (this.memoryCache.has(url)) {
            return this.memoryCache.get(url);
        }
        
        // Check browser cache
        if (this.cacheSupported) {
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(url);
            
            if (response) {
                // Check if cache is still valid
                const cacheTime = response.headers.get('sw-cache-time');
                if (cacheTime && Date.now() - parseInt(cacheTime) < this.cacheExpiry) {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    this.memoryCache.set(url, objectUrl);
                    return objectUrl;
                }
            }
        }
        
        // If base64, convert and cache
        if (url.startsWith('data:image')) {
            return this.cacheBase64Image(url);
        }
        
        // Fetch and cache
        return this.fetchAndCacheImage(url);
    }
    
    /**
     * Cache base64 image
     */
    async cacheBase64Image(base64Url) {
        try {
            // Convert base64 to blob
            const response = await fetch(base64Url);
            const blob = await response.blob();
            
            // Create object URL
            const objectUrl = URL.createObjectURL(blob);
            
            // Store in memory cache
            this.memoryCache.set(base64Url, objectUrl);
            
            // Store in browser cache if supported
            if (this.cacheSupported) {
                const cache = await caches.open(this.cacheName);
                const headers = new Headers({
                    'Content-Type': blob.type,
                    'sw-cache-time': Date.now().toString()
                });
                const cacheResponse = new Response(blob, { headers });
                await cache.put(base64Url.substring(0, 100), cacheResponse); // Use truncated key
            }
            
            return objectUrl;
        } catch (error) {
            console.error('Error caching base64 image:', error);
            return base64Url; // Return original if caching fails
        }
    }
    
    /**
     * Fetch and cache external image
     */
    async fetchAndCacheImage(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            // Store in memory cache
            this.memoryCache.set(url, objectUrl);
            
            // Store in browser cache
            if (this.cacheSupported) {
                const cache = await caches.open(this.cacheName);
                const headers = new Headers({
                    'Content-Type': blob.type,
                    'sw-cache-time': Date.now().toString()
                });
                const cacheResponse = new Response(blob, { headers });
                await cache.put(url, cacheResponse);
            }
            
            return objectUrl;
        } catch (error) {
            console.error('Error fetching and caching image:', error);
            return url; // Return original URL if caching fails
        }
    }
    
    /**
     * Preload multiple images
     */
    async preloadImages(urls) {
        const validUrls = urls.filter(url => url && url !== 'undefined' && url !== 'null');
        
        // Add to queue
        this.preloadQueue.push(...validUrls);
        
        // Start preloading if not already running
        if (!this.isPreloading) {
            this.processPreloadQueue();
        }
    }
    
    /**
     * Process preload queue
     */
    async processPreloadQueue() {
        this.isPreloading = true;
        
        while (this.preloadQueue.length > 0) {
            const batch = this.preloadQueue.splice(0, 3); // Process 3 at a time
            
            await Promise.all(
                batch.map(url => this.getImage(url).catch(err => {
                    console.error('Error preloading image:', url, err);
                }))
            );
        }
        
        this.isPreloading = false;
    }
    
    /**
     * Clean up old caches
     */
    async cleanOldCaches() {
        if (!this.cacheSupported) return;
        
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
            name.startsWith('xbrush-image-cache') && name !== this.cacheName
        );
        
        await Promise.all(oldCaches.map(name => caches.delete(name)));
    }
    
    /**
     * Clean expired images from cache
     */
    async cleanExpiredImages() {
        if (!this.cacheSupported) return;
        
        try {
            const cache = await caches.open(this.cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                const cacheTime = response.headers.get('sw-cache-time');
                
                if (cacheTime && Date.now() - parseInt(cacheTime) > this.cacheExpiry) {
                    await cache.delete(request);
                }
            }
        } catch (error) {
            console.error('Error cleaning expired images:', error);
        }
    }
    
    /**
     * Clear all caches
     */
    async clearAll() {
        // Clear memory cache
        this.memoryCache.forEach(url => URL.revokeObjectURL(url));
        this.memoryCache.clear();
        
        // Clear browser cache
        if (this.cacheSupported) {
            await caches.delete(this.cacheName);
        }
    }
    
    /**
     * Get cache size
     */
    async getCacheSize() {
        if (!this.cacheSupported || !navigator.storage?.estimate) {
            return { usage: 0, quota: 0 };
        }
        
        return await navigator.storage.estimate();
    }
}

// Create global instance
window.imageCache = new ImageCache();