/**
 * Utility functions for the Book Editor
 */

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
                        
                        let width = img.width;
                        let height = img.height;
                        
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
                        
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        
                        resolve(compressedDataUrl);
                    } catch (err) {
                        console.error('Error during image compression:', err);
                        resolve(imageDataUrl);
                    }
                };
                
                img.onerror = function() {
                    console.warn('Failed to load image for compression');
                    resolve(imageDataUrl);
                };
                
                img.src = imageDataUrl;
            } catch (err) {
                console.error('Compression setup error:', err);
                resolve(imageDataUrl);
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
            
            try {
                const data = JSON.parse(jsonData);
                
                if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.warn('Storage limit reached, trying to reduce image sizes');
                    
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
        
        if (imageUrl.trim() === '') return false;
        
        if (imageUrl.startsWith('data:image/')) return true;
        
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        const hasValidExtension = imageExtensions.some(ext => 
            imageUrl.toLowerCase().endsWith(ext)
        );
        
        return hasValidExtension;
    },
    
    /**
     * Checks if a file exceeds the maximum allowed size
     * @param {File} file - The file to check
     * @param {number} maxSizeKB - Maximum size in KB (default: 500KB)
     * @returns {boolean} - True if file is too large
     */
    isFileTooLarge: function(file, maxSizeKB = 500) {
        if (!file) return false;
        return file.size > (maxSizeKB * 1024);
    },
    
    /**
     * Formats file size into human-readable format
     * @param {number} bytes - Size in bytes
     * @param {number} decimals - Decimal places
     * @returns {string} - Formatted size string
     */
    formatFileSize: function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    /**
     * Validates if a data URL is within acceptable size limits
     * @param {string} dataUrl - The data URL to check
     * @param {number} maxSizeKB - Maximum size in KB
     * @returns {object} - Result with status and details
     */
    validateImageSize: function(dataUrl, maxSizeKB = 500) {
        if (!dataUrl || typeof dataUrl !== 'string') {
            return { valid: true, size: 0, formatted: '0 KB' };
        }
        
        const sizeInBytes = Math.ceil(dataUrl.length * 0.75);
        const sizeInKB = sizeInBytes / 1024;
        
        return {
            valid: sizeInKB <= maxSizeKB,
            size: sizeInBytes,
            sizeKB: sizeInKB,
            formatted: this.formatFileSize(sizeInBytes),
            maxSize: maxSizeKB
        };
    },
    
    /**
     * Auto-optimizes an image to ensure it's within size limits
     * @param {string} dataUrl - The image data URL
     * @param {number} maxSizeKB - Maximum size in KB
     * @returns {Promise<object>} - Optimized image result
     */
    autoOptimizeImage: function(dataUrl, maxSizeKB = 500) {
        return new Promise(async (resolve) => {
            const initialCheck = this.validateImageSize(dataUrl, maxSizeKB);
            
            if (initialCheck.valid) {
                resolve({
                    optimized: false,
                    dataUrl: dataUrl,
                    ...initialCheck
                });
                return;
            }
            
            try {
                const qualityLevels = [0.7, 0.5, 0.3, 0.2];
                let optimizedUrl = dataUrl;
                let finalCheck = initialCheck;
                
                for (const quality of qualityLevels) {
                    optimizedUrl = await this.compressImage(dataUrl, quality);
                    finalCheck = this.validateImageSize(optimizedUrl, maxSizeKB);
                    
                    if (finalCheck.valid) break;
                }
                
                resolve({
                    optimized: true,
                    original: {
                        size: initialCheck.size,
                        formatted: initialCheck.formatted
                    },
                    dataUrl: optimizedUrl,
                    ...finalCheck
                });
            } catch (error) {
                console.error('Image optimization failed:', error);
                resolve({
                    optimized: false,
                    error: true,
                    dataUrl: dataUrl,
                    ...initialCheck
                });
            }
        });
    }
};
