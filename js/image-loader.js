/**
 * Image Loader and Optimizer
 * Manages efficient loading and processing of images
 */

const ImageLoader = {
    imageCache: new Map(),
    
    lazyLoadImages: function() {
        document.querySelectorAll('.page.has-bg-image').forEach(page => {
            const imageSrc = page.getAttribute('data-bg-image');
            if (!imageSrc) return;
            
            if (page.style.backgroundImage && page.style.backgroundImage !== 'none') return;
            
            if (this.isNearViewport(page, 1000)) {
                if (this.imageCache.has(imageSrc)) {
                    page.style.backgroundImage = `url(${this.imageCache.get(imageSrc)})`;
                } else {
                    this.loadAndOptimize(imageSrc, optimizedSrc => {
                        page.style.backgroundImage = `url(${optimizedSrc})`;
                        this.imageCache.set(imageSrc, optimizedSrc);
                    });
                }
            }
        });
    },
    
    isNearViewport: function(element, buffer = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.bottom >= -buffer &&
            rect.right >= -buffer &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) + buffer &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) + buffer
        );
    },
    
    loadAndOptimize: function(src, callback) {
        if (src.startsWith('data:')) {
            this.optimizeImage(src, callback);
        } else {
            callback(src);
        }
    },
    
    optimizeImage: function(dataUrl, callback) {
        const img = new Image();
        img.onload = function() {
            if (img.width < 1200 && img.height < 1600) {
                callback(dataUrl);
                return;
            }
            
            const canvas = document.createElement('canvas');
            
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1600;
            
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const optimizedImage = canvas.toDataURL('image/jpeg', 0.85);
            callback(optimizedImage);
        };
        
        img.onerror = function() {
            console.warn('Failed to load image for optimization');
            callback(dataUrl);
        };
        
        img.src = dataUrl;
    },
    
    init: function() {
        this.lazyLoadImages();
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(() => {
                this.lazyLoadImages();
                scrollTimeout = null;
            }, 200);
        }, { passive: true });
        
        document.addEventListener('pageturned', () => this.lazyLoadImages());
        
        const originalUpdateFlipBook = window.updateFlipBook;
        window.updateFlipBook = function() {
            originalUpdateFlipBook.apply(this, arguments);
            setTimeout(() => ImageLoader.lazyLoadImages(), 10);
        };
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ImageLoader.init();
});
