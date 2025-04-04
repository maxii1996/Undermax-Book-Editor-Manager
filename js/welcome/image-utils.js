/**
 * Image utilities for book editor
 * Handles image compression and storage optimization
 */

const MAX_IMAGE_DIMENSION = 1200;
const IMAGE_QUALITY = 0.7;

/**
 * Compresses an image to reduce storage size
 * @param {string} dataUrl - The original image data URL
 * @param {number} quality - Compression quality (0-1)
 * @param {number} maxDimension - Maximum width/height
 * @returns {Promise<string>} - Compressed image data URL
 */
function compressImage(dataUrl, quality = IMAGE_QUALITY, maxDimension = MAX_IMAGE_DIMENSION) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round(height * (maxDimension / width));
                        width = maxDimension;
                    } else {
                        width = Math.round(width * (maxDimension / height));
                        height = maxDimension;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                if (compressedDataUrl.length < dataUrl.length) {
                    resolve(compressedDataUrl);
                } else {
                    resolve(dataUrl);
                }
            };
            
            img.onerror = function() {
                reject(new Error('Image loading failed'));
            };
            
            img.src = dataUrl;
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Safely stores data in localStorage with quota handling
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @param {Function} onError - Error handler callback
 * @returns {boolean} - Success status
 */
function safelyStoreData(key, data, onError) {
    try {
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        
        localStorage.setItem(key, dataString);
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            if (typeof onError === 'function') {
                onError(error);
            }
        }
        
        return false;
    }
}

/**
 * Estimates the size of a string in bytes
 * @param {string} str - String to measure
 * @returns {number} - Approximate size in bytes
 */
function getStringSizeInBytes(str) {
    return new Blob([str]).size;
}

window.BookImageUtils = {
    compressImage,
    safelyStoreData,
    getStringSizeInBytes,
    MAX_IMAGE_DIMENSION,
    IMAGE_QUALITY
};
