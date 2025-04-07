/**
 * Storage monitor for the book editor
 * Keeps track of storage usage but doesn't display UI elements
 */
(function() {
    const StorageMonitor = {
        /**
         * Estimates the available localStorage space in bytes
         * @returns {Object} Object containing total, used and available space in bytes
         */
        getStorageInfo: function() {
            try {
                const testKey = '_storage_test_';
                const oneKB = 1024;
                const estimatedTotal = 5 * 1024 * 1024;
                
                let usedSpace = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    const value = localStorage.getItem(key);
                    usedSpace += (key.length + value.length) * 2;
                }
                
                let testString = '';
                let maxSize = 0;
                
                try {
                    localStorage.removeItem(testKey);
                    
                    testString = new Array(oneKB + 1).join('a');
                    
                    let iterations = 0;
                    const maxIterations = 10;
                    
                    while (iterations < maxIterations) {
                        try {
                            localStorage.setItem(testKey, testString);
                            maxSize = testString.length * 2;
                            testString += testString;
                            iterations++;
                        } catch (e) {
                            break;
                        }
                    }
                    
                    localStorage.removeItem(testKey);
                } catch (e) {
                    console.warn('Error estimating storage size:', e);
                    maxSize = estimatedTotal;
                }
                
                const totalSpace = Math.max(maxSize + usedSpace, estimatedTotal);
                const availableSpace = totalSpace - usedSpace;
                
                return {
                    total: totalSpace,
                    used: usedSpace,
                    available: availableSpace
                };
            } catch (e) {
                console.error('Failed to estimate storage space:', e);
                return {
                    total: 5 * 1024 * 1024,
                    used: 0,
                    available: 5 * 1024 * 1024
                };
            }
        },
        
        /**
         * Formats bytes into a human-readable string
         * @param {number} bytes - Number of bytes
         * @returns {string} Formatted string (e.g., "4.2 MB")
         */
        formatBytes: function(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        /**
         * Checks if an image is likely to exceed available storage space
         * @param {string} imageDataUrl - The image data URL to check
         * @returns {Object} Result with status and message
         */
        checkImageSize: function(imageDataUrl) {
            if (!imageDataUrl) return { safe: true };
            
            const storageInfo = this.getStorageInfo();
            const imageSize = imageDataUrl.length * 2;
            const percentOfAvailable = (imageSize / storageInfo.available) * 100;
            
            let result = { 
                size: imageSize,
                sizeFormatted: this.formatBytes(imageSize),
                percentOfAvailable: percentOfAvailable,
                safe: true
            };
            
            if (percentOfAvailable > 80) {
                result.safe = false;
                result.critical = true;
                result.message = `Image is too large (${this.formatBytes(imageSize)}) and exceeds 80% of available storage.`;
            } else if (percentOfAvailable > 50) {
                result.safe = false;
                result.warning = true;
                result.message = `Image is large (${this.formatBytes(imageSize)}) and uses ${Math.round(percentOfAvailable)}% of available storage.`;
            }
            
            return result;
        },
        
        /**
         * Displays storage information (now hidden)
         * @param {string} containerId - ID of the container to display info in
         */
        displayStorageInfo: function(containerId) {
            let container = document.getElementById(containerId);
            if (container) {
                container.style.display = 'none';
            }
            
            this.getStorageInfo();
        },
        
        /**
         * Clears unnecessary storage items to free up space
         */
        clearUnnecessaryStorage: function() {
            try {
                const keysToKeep = ['undermaxBookSettings'];
                const keysToRemove = [];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (!keysToKeep.includes(key)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                this.displayStorageInfo('storage-info-container');
                
                if (window.notifications) {
                    window.notifications.success(`Cleared ${keysToRemove.length} items from storage.`);
                } else {
                    alert(`Cleared ${keysToRemove.length} items from storage.`);
                }
            } catch (e) {
                console.error('Error clearing storage:', e);
                if (window.notifications) {
                    window.notifications.error('Failed to clear storage.');
                }
            }
        },
        
        /**
         * Initializes the storage monitor
         */
        init: function() {
            setInterval(() => {
                this.getStorageInfo();
            }, 5000);
        }
    };
    
    document.addEventListener('DOMContentLoaded', function() {
        window.StorageMonitor = StorageMonitor;
        
        StorageMonitor.init();
        
        const addImageSizeCheck = () => {
            const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
            imageInputs.forEach(input => {
                if (!input.dataset.monitorAttached) {
                    input.dataset.monitorAttached = "true";
                    input.addEventListener('change', function(event) {
                        const file = event.target.files[0];
                        if (!file) return;
                        
                        if (file.size > 2 * 1024 * 1024) {
                            console.warn(`Large image detected (${(file.size/1024/1024).toFixed(1)}MB). This may exceed storage limits.`);
                        }
                    });
                }
            });
        };
        
        addImageSizeCheck();
        
        const observer = new MutationObserver(function(mutations) {
            addImageSizeCheck();
        });
        
        observer.observe(document.body, { 
            childList: true,
            subtree: true
        });
    });
})();
