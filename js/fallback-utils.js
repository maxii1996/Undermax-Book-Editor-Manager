/**
 * Fallback utilities for the Book Editor
 * Ensures critical utilities are always available even if scripts load out of order
 */

(function() {
    if (typeof window.BookImageUtils === 'undefined') {
        window.BookImageUtils = {
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
            
            formatFileSize: function(bytes) {
                if (bytes < 1024) {
                    return bytes + ' B';
                } else if (bytes < 1024 * 1024) {
                    return (bytes / 1024).toFixed(1) + ' KB';
                } else {
                    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
                }
            },
            
            autoOptimizeImage: function(dataUrl, maxSizeKB = 500) {
                return new Promise((resolve) => {
                    const validation = this.validateImageSize(dataUrl, maxSizeKB);
                    resolve({
                        optimized: false,
                        dataUrl: dataUrl,
                        valid: validation.valid,
                        size: validation.size,
                        formatted: validation.formatted
                    });
                });
            },
            
            isFileTooLarge: function(file, maxSizeKB) {
                if (!file) return false;
                return file.size > (maxSizeKB * 1024);
            },
            
            compressImage: function(dataUrl, quality = 0.7) {
                return new Promise((resolve) => {
                    resolve(dataUrl);
                });
            }
        };
        
       // console.warn("BookImageUtils not found, using fallback implementation");
    }
})();
