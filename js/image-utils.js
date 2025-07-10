/**
 * Image Utility Functions
 * Handles image compression and conversion for storage
 */

class ImageUtils {
    /**
     * Compress and convert image to base64
     * @param {File} file - Image file to compress
     * @param {Object} options - Compression options
     * @returns {Promise<Object>} - Object with base64 data and metadata
     */
    static async compressImage(file, options = {}) {
        const {
            maxWidth = 800,
            maxHeight = 800,
            quality = 0.8,
            outputFormat = 'image/jpeg'
        } = options;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    
                    // Create canvas and resize
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64
                    const base64 = canvas.toDataURL(outputFormat, quality);
                    
                    // Calculate size
                    const sizeInBytes = Math.round(base64.length * 0.75); // Approximate size
                    
                    resolve({
                        base64: base64,
                        width: width,
                        height: height,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        size: sizeInBytes,
                        format: outputFormat,
                        name: file.name
                    });
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Compress image specifically for thumbnail
     */
    static async createThumbnail(file) {
        return this.compressImage(file, {
            maxWidth: 400,
            maxHeight: 500,
            quality: 0.9
        });
    }

    /**
     * Compress image for portfolio display
     */
    static async createPortfolioImage(file) {
        return this.compressImage(file, {
            maxWidth: 600,
            maxHeight: 800,
            quality: 0.85
        });
    }

    /**
     * Check if file is a valid image
     */
    static isValidImage(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        return validTypes.includes(file.type);
    }

    /**
     * Get file size in human readable format
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Convert base64 to blob for download
     */
    static base64ToBlob(base64) {
        const parts = base64.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }

    /**
     * Check storage availability
     */
    static checkStorageSpace() {
        try {
            // Estimate available storage
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                return navigator.storage.estimate();
            }
            
            // Fallback: check localStorage size
            const used = new Blob(Object.values(localStorage)).size;
            const estimatedMax = 10 * 1024 * 1024; // 10MB estimate
            
            return Promise.resolve({
                usage: used,
                quota: estimatedMax
            });
        } catch (error) {
            console.error('Error checking storage:', error);
            return Promise.resolve({ usage: 0, quota: 0 });
        }
    }
}

// Make available globally
window.ImageUtils = ImageUtils;