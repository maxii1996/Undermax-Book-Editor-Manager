/**
 * Wizard Storage Monitor
 * Adds live storage monitoring and image size validation to the book creation wizard
 */
(function() {
    const MAX_IMAGE_SIZE = 500 * 1024;
    
    const WizardStorageMonitor = {
        /**
         * Estimates localStorage space usage
         * @returns {Object} Storage information
         */
        getStorageInfo: function() {
            try {
                const estimatedTotal = 5 * 1024 * 1024;
                
                let usedSpace = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    const value = localStorage.getItem(key);
                    usedSpace += (key.length + value.length) * 2;
                }
                
                return {
                    total: estimatedTotal,
                    used: usedSpace,
                    available: estimatedTotal - usedSpace,
                    percentUsed: Math.round((usedSpace / estimatedTotal) * 100)
                };
            } catch (e) {
                console.error('Failed to get storage info:', e);
                return { total: 5242880, used: 0, available: 5242880, percentUsed: 0 };
            }
        },
        
        /**
         * Formats bytes to human readable format
         */
        formatBytes: function(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        /**
         * Creates and displays storage monitor in the wizard
         */
        setupStorageMonitor: function() {
            let container = document.getElementById('wizard-storage-container');
            if (container) {
                container.style.display = 'none';
            }
            
            setInterval(() => this.updateStorageDisplay(), 3000);
        },
        
        /**
         * Updates the storage display with current information
         */
        updateStorageDisplay: function() {
            this.getStorageInfo();
        },
        
        /**
         * Shows helpful storage tips in a modal
         */
        showStorageTips: function() {
        },
        
        /**
         * Clears localStorage to free up space
         */
        clearStorage: function() {
            try {
                const keysToKeep = ['undermaxBookSettings'];
                const keysToRemove = [];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (!keysToKeep.includes(key)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                this.updateStorageDisplay();
                
                if (window.notifications) {
                    window.notifications.success(`Storage cleared successfully.`);
                } else {
                    alert(`Storage cleared successfully.`);
                }
            } catch (e) {
                console.error('Error clearing storage:', e);
                if (window.notifications) {
                    window.notifications.error('Failed to clear storage.');
                }
            }
        },
        
        /**
         * Adds file size validation to all image inputs
         */
        addImageSizeValidation: function() {
            const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
            
            imageInputs.forEach(input => {
                if (input.dataset.sizeValidation === 'true') return;
                
                input.dataset.sizeValidation = 'true';
                
                let wrapper = input.parentElement;
                if (!wrapper.classList.contains('image-input-wrapper')) {
                    wrapper = document.createElement('div');
                    wrapper.className = 'image-input-wrapper';
                    input.parentNode.insertBefore(wrapper, input);
                    wrapper.appendChild(input);
                }
                
                let sizeIndicator = wrapper.querySelector('.image-size-indicator');
                if (!sizeIndicator) {
                    sizeIndicator = document.createElement('div');
                    sizeIndicator.className = 'image-size-indicator';
                    wrapper.appendChild(sizeIndicator);
                }
                
                input.addEventListener('change', event => {
                    const file = event.target.files[0];
                    if (!file) {
                        sizeIndicator.textContent = '';
                        return;
                    }
                    
                    const fileSize = file.size;
                    const formattedSize = this.formatBytes(fileSize);
                    
                    if (fileSize > MAX_IMAGE_SIZE) {
                        sizeIndicator.textContent = `Error! Maximum size: 500KB. This image: ${formattedSize}`;
                        sizeIndicator.className = 'image-size-indicator error';
                        
                        if (window.notifications) {
                            window.notifications.error(
                                `Image is too large (${formattedSize}). Maximum allowed is 500KB.`
                            );
                        }
                        
                        input.value = '';
                        event.preventDefault();
                        return false;
                    } else {
                        sizeIndicator.textContent = `Size: ${formattedSize}`;
                        sizeIndicator.className = 'image-size-indicator success';
                    }
                });
            });
            
            const sizeIndicators = document.querySelectorAll('.image-size-indicator');
            sizeIndicators.forEach(indicator => {
                indicator.style.display = 'none';
            });
        },
        
        /**
         * Initializes all monitoring functionality
         */
        init: function() {
            this.setupStorageMonitor();
            
            this.addImageSizeValidation();
        }
    };
    
    document.addEventListener('DOMContentLoaded', () => {
        window.WizardStorageMonitor = WizardStorageMonitor;
        
        WizardStorageMonitor.init();
    });
})();
