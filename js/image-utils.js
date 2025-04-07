/**
 * Book Image Utilities
 * Handles image compression and storage optimization
 */
const BookImageUtils = {
    /**
     * Compresses an image to reduce its size
     * @param {string} dataUrl - The image data URL to compress
     * @param {number} quality - The quality level (0.1 to 1.0)
     * @returns {Promise<string>} - A promise that resolves to the compressed image data URL
     */
    compressImage: function(dataUrl, quality = 0.7) {
        return new Promise((resolve, reject) => {
            if (!dataUrl) {
                reject(new Error('No image data provided'));
                return;
            }
            
            const img = new Image();
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let width = img.width;
                    let height = img.height;
                    const maxDimension = 1024;
                    
                    if (width > height && width > maxDimension) {
                        height = Math.round(height * (maxDimension / width));
                        width = maxDimension;
                    } else if (height > maxDimension) {
                        width = Math.round(width * (maxDimension / height));
                        height = maxDimension;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    
                    if (compressedDataUrl.length < dataUrl.length) {
                        resolve(compressedDataUrl);
                    } else {
                        const pngDataUrl = canvas.toDataURL('image/png');
                        if (pngDataUrl.length < dataUrl.length) {
                            resolve(pngDataUrl);
                        } else {
                            resolve(dataUrl);
                        }
                    }
                } catch (error) {
                    console.error('Image compression error:', error);
                    reject(error);
                }
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load image for compression'));
            };
            
            img.src = dataUrl;
        });
    },
    
    /**
     * Safely stores data with proper error handling
     * @param {string} key - The key to store the data under
     * @param {string} data - The data to store
     * @param {Function} errorCallback - Function to call on error
     * @returns {boolean} - Whether the operation was successful
     */
    safelyStoreData: function(key, data, errorCallback) {
        try {
            if (window.BookManager && typeof window.BookManager.storeData === 'function') {
                return window.BookManager.storeData(key, data, errorCallback);
            }
            
            localStorage.setItem(key, data);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            
            try {
                sessionStorage.setItem(key, data);
                sessionStorage.setItem('useSessionStorage', 'true');
                if (window.notifications) {
                    window.notifications.warning(
                        "Using temporary storage due to browser limitations. Your book will be available for this session only."
                    );
                }
                return true;
            } catch (sessionError) {
                if (errorCallback && typeof errorCallback === 'function') {
                    errorCallback(error);
                }
                return false;
            }
        }
    },
    
    /**
     * Checks if the storage is likely to exceed the quota
     * @param {string} data - The data to check
     * @returns {boolean} - Whether the storage might exceed quota
     */
    willExceedQuota: function(data) {
        const estimatedAvailable = 5 * 1024 * 1024;
        
        const dataSize = new Blob([data]).size;
        
        return dataSize > (estimatedAvailable * 0.8);
    }
};

window.BookImageUtils = BookImageUtils;
