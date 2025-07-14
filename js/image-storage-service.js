/**
 * Image Storage Service
 * Handles all image uploads to Firebase Storage instead of base64
 */

class ImageStorageService {
    constructor() {
        this.storage = null;
        this.storageRef = null;
        this.initialized = false;
        this.init();
    }
    
    async init() {
        // Wait for Firebase Storage to be available
        while (!window.firebaseStorage) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.storage = window.firebaseStorage;
        this.storageRef = this.storage.ref();
        this.initialized = true;
        console.log('ImageStorageService initialized');
    }
    
    async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
    }
    
    /**
     * Upload an image file to Firebase Storage
     * @param {File|Blob|string} imageData - Image file, blob, or base64 string
     * @param {string} path - Storage path (e.g., 'models/thumbnails/model123.jpg')
     * @param {Object} metadata - Optional metadata
     * @returns {Promise<Object>} Upload result with URL and metadata
     */
    async uploadImage(imageData, path, metadata = {}) {
        try {
            await this.ensureInitialized();
            
            // Convert base64 to blob if necessary
            let uploadData = imageData;
            if (typeof imageData === 'string' && imageData.startsWith('data:')) {
                uploadData = await this.base64ToBlob(imageData);
            }
            
            // Create reference
            const imageRef = this.storageRef.child(path);
            
            // Set metadata
            const uploadMetadata = {
                contentType: metadata.contentType || 'image/jpeg',
                customMetadata: {
                    uploadedAt: new Date().toISOString(),
                    ...metadata.customMetadata
                }
            };
            
            // Upload file
            console.log(`Uploading image to: ${path}`);
            const uploadTask = imageRef.put(uploadData, uploadMetadata);
            
            // Monitor upload progress
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Upload progress: ${progress.toFixed(2)}%`);
                        
                        // Emit progress event
                        this.emitProgress(path, progress);
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        reject(error);
                    },
                    async () => {
                        // Upload completed successfully
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        const metadata = await uploadTask.snapshot.ref.getMetadata();
                        
                        console.log(`Upload complete: ${downloadURL}`);
                        
                        resolve({
                            url: downloadURL,
                            path: path,
                            size: metadata.size,
                            contentType: metadata.contentType,
                            timeCreated: metadata.timeCreated,
                            metadata: metadata.customMetadata
                        });
                    }
                );
            });
            
        } catch (error) {
            console.error('Error uploading image:', error);
            
            // Fallback to base64 if storage fails
            if (error.code === 'storage/unauthorized' || error.code === 'storage/cors') {
                console.warn('Firebase Storage upload failed, falling back to base64');
                return {
                    url: imageData,
                    path: path,
                    isBase64: true,
                    error: error.message
                };
            }
            
            throw error;
        }
    }
    
    /**
     * Upload model thumbnail with automatic optimization
     * @param {File} file - Image file
     * @param {string} modelId - Model ID
     * @returns {Promise<string>} Download URL
     */
    async uploadModelThumbnail(file, modelId) {
        try {
            // Compress image first
            const compressed = await this.compressImage(file, {
                maxWidth: window.AppConfig.performance.thumbnailMaxWidth,
                maxHeight: window.AppConfig.performance.thumbnailMaxHeight,
                quality: window.AppConfig.performance.imageCompressionQuality
            });
            
            // Generate path
            const timestamp = Date.now();
            const path = `${window.AppConfig.storage.modelImagesPath}thumbnails/${modelId}_${timestamp}.jpg`;
            
            // Upload
            const result = await this.uploadImage(compressed.blob, path, {
                contentType: 'image/jpeg',
                customMetadata: {
                    modelId: modelId,
                    type: 'thumbnail',
                    originalName: file.name,
                    width: compressed.width.toString(),
                    height: compressed.height.toString()
                }
            });
            
            return result.url;
            
        } catch (error) {
            console.error('Error uploading model thumbnail:', error);
            // Fallback to base64
            const base64 = await this.fileToBase64(file);
            return base64;
        }
    }
    
    /**
     * Upload multiple portfolio images
     * @param {File[]} files - Array of image files
     * @param {string} modelId - Model ID
     * @returns {Promise<Object[]>} Array of upload results
     */
    async uploadPortfolioImages(files, modelId) {
        const uploads = files.map(async (file, index) => {
            try {
                // Compress image
                const compressed = await this.compressImage(file, {
                    maxWidth: 1200,
                    maxHeight: 1200,
                    quality: 0.9
                });
                
                // Generate path
                const timestamp = Date.now();
                const path = `${window.AppConfig.storage.portfolioPath}${modelId}/${timestamp}_${index}.jpg`;
                
                // Upload
                const result = await this.uploadImage(compressed.blob, path, {
                    contentType: 'image/jpeg',
                    customMetadata: {
                        modelId: modelId,
                        type: 'portfolio',
                        index: index.toString(),
                        originalName: file.name
                    }
                });
                
                return {
                    url: result.url,
                    thumbnailUrl: result.url, // In production, generate actual thumbnail
                    caption: '',
                    order: index
                };
                
            } catch (error) {
                console.error(`Error uploading portfolio image ${index}:`, error);
                // Fallback to base64
                const base64 = await this.fileToBase64(file);
                return {
                    url: base64,
                    thumbnailUrl: base64,
                    caption: '',
                    order: index,
                    isBase64: true
                };
            }
        });
        
        return Promise.all(uploads);
    }
    
    /**
     * Delete an image from Firebase Storage
     * @param {string} path - Storage path
     * @returns {Promise<boolean>} Success status
     */
    async deleteImage(path) {
        try {
            await this.ensureInitialized();
            
            const imageRef = this.storageRef.child(path);
            await imageRef.delete();
            
            console.log(`Deleted image: ${path}`);
            return true;
            
        } catch (error) {
            if (error.code === 'storage/object-not-found') {
                console.warn(`Image not found: ${path}`);
                return true; // Consider it deleted
            }
            
            console.error('Error deleting image:', error);
            return false;
        }
    }
    
    /**
     * Compress an image file
     * @param {File} file - Image file
     * @param {Object} options - Compression options
     * @returns {Promise<Object>} Compressed image data
     */
    async compressImage(file, options = {}) {
        const {
            maxWidth = 1200,
            maxHeight = 1200,
            quality = 0.85,
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
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }
                    
                    // Create canvas and draw resized image
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // Apply smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob
                    canvas.toBlob((blob) => {
                        resolve({
                            blob: blob,
                            width: width,
                            height: height,
                            size: blob.size,
                            type: outputFormat
                        });
                    }, outputFormat, quality);
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Convert base64 string to blob
     * @param {string} base64 - Base64 string
     * @returns {Promise<Blob>} Blob object
     */
    async base64ToBlob(base64) {
        const response = await fetch(base64);
        return response.blob();
    }
    
    /**
     * Convert file to base64 string
     * @param {File} file - File object
     * @returns {Promise<string>} Base64 string
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Emit upload progress event
     * @param {string} path - File path
     * @param {number} progress - Progress percentage
     */
    emitProgress(path, progress) {
        window.dispatchEvent(new CustomEvent('imageUploadProgress', {
            detail: { path, progress }
        }));
    }
    
    /**
     * Get optimized image URL with resize parameters
     * @param {string} url - Original image URL
     * @param {number} width - Desired width
     * @param {number} height - Desired height
     * @returns {string} Optimized URL
     */
    getOptimizedUrl(url, width, height) {
        // If it's a Firebase Storage URL, add transformation parameters
        if (url && url.includes('firebasestorage.googleapis.com')) {
            // Firebase doesn't support on-the-fly transformations
            // This is a placeholder for future CDN integration
            return url;
        }
        
        return url;
    }
}

// Create singleton instance
const imageStorageService = new ImageStorageService();

// Export for use in other modules
window.imageStorageService = imageStorageService;