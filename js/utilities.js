/**
 * Utility functions for the Book Editor
 */

// Global utilities for image handling
window.BookImageUtils = {
    /**
     * Compresses an image to reduce file size
     * @param {string} imageDataUrl - The data URL of the image
     * @param {number} quality - Compression quality (0-1)
     * @returns {Promise<string>} - Compressed image data URL
     */
    compressImage: function(imageDataUrl, quality = 0.7) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.onload = function() {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Calculate dimensions while maintaining aspect ratio
                        let width = img.width;
                        let height = img.height;
                        
                        // Limit maximum dimensions to prevent memory issues
                        const MAX_DIMENSION = 1500;
                        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                            if (width > height) {
                                height = (height / width) * MAX_DIMENSION;
                                width = MAX_DIMENSION;
                            } else {
                                width = (width / height) * MAX_DIMENSION;
                                height = MAX_DIMENSION;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Draw and compress
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        
                        resolve(compressedDataUrl);
                    } catch (err) {
                        console.error('Error during image compression:', err);
                        resolve(imageDataUrl); // Return original on error
                    }
                };
                
                img.onerror = function() {
                    console.warn('Failed to load image for compression');
                    resolve(imageDataUrl); // Return original on error
                };
                
                img.src = imageDataUrl;
            } catch (err) {
                console.error('Compression setup error:', err);
                resolve(imageDataUrl); // Return original on error
            }
        });
    },
    
    /**
     * Safely stores data in localStorage with fallback mechanisms
     * @param {string} key - localStorage key
     * @param {string} jsonData - JSON string to store
     * @param {Function} errorCallback - Function to call on error
     * @returns {boolean} - Success status
     */
    safelyStoreData: function(key, jsonData, errorCallback) {
        try {
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            if (errorCallback) errorCallback(error);
            
            // Try to store with reduced data if storage limit exceeded
            try {
                const data = JSON.parse(jsonData);
                
                // Check if error is likely due to storage limit
                if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.warn('Storage limit reached, trying to reduce image sizes');
                    
                    // Remove large images as a fallback
                    if (data.coverImage) data.coverImage = '';
                    if (data.backCoverImage) data.backCoverImage = '';
                    
                    if (data.pages) {
                        data.pages = data.pages.map(page => {
                            const newPage = {...page};
                            if (newPage.backgroundImage) newPage.backgroundImage = '';
                            return newPage;
                        });
                    }
                    
                    localStorage.setItem(key, JSON.stringify(data));
                    return true;
                }
            } catch (fallbackError) {
                console.error('Failed to apply storage fallback:', fallbackError);
            }
            
            return false;
        }
    },
    
    /**
     * Validates if an image URL or data URL is valid
     * @param {string} imageUrl - URL or data URL to validate
     * @returns {boolean} - Whether the image URL is valid
     */
    isValidImageUrl: function(imageUrl) {
        if (!imageUrl || typeof imageUrl !== 'string') return false;
        
        // Basic validation
        if (imageUrl.trim() === '') return false;
        
        // Valid if it's a data URL for an image
        if (imageUrl.startsWith('data:image/')) return true;
        
        // Valid if it's a URL to an image file
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        const hasValidExtension = imageExtensions.some(ext => 
            imageUrl.toLowerCase().endsWith(ext)
        );
        
        return hasValidExtension;
    }
};
