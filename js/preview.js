let currentZoom = 100;
const minZoom = 10;
const maxZoom = 200;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;
let lastTranslateX = 0, lastTranslateY = 0;

/**
 * Actualiza la visualización del libro en tiempo real
 */
function updateFlipBook() {
    const fb = document.getElementById("flip-book");
    if (!fb) return;
    
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    const fragment = document.createDocumentFragment();
    if (pages.length === 0) {
        fb.innerHTML = "";
        return;
    }

    if (fb.style.width !== `${bookData.bookWidth}px` || fb.style.height !== `${bookData.bookHeight}px`) {
        fb.style.width = bookData.bookWidth + "px";
        fb.style.height = bookData.bookHeight + "px";
    }
    
    const needsRebuild = fb.children.length !== pages.length;
    
    if (needsRebuild) {
        fb.innerHTML = "";
        
        for (let i = 0; i < pages.length; i++) {
            const pageDiv = createPageElement(i);
            fragment.appendChild(pageDiv);
        }
        
        fb.appendChild(fragment);
        const pageElements = fb.querySelectorAll('.page');
        positionPages(pageElements);
    } else {
        for (let i = 0; i < pages.length; i++) {
            updatePageElement(fb.children[i], i);
        }
    }
    
    updatePageNumbers();
    
    window.scrollTo(0, scrollTop);
}

function createPageElement(index) {
    const page = pages[index];
    const pageDiv = document.createElement("div");
    pageDiv.className = "page";
    pageDiv.setAttribute("data-page-index", index);
    pageDiv.style.width = bookData.bookWidth + "px";
    pageDiv.style.height = bookData.bookHeight + "px";

    let bgColor;
    if (index === 0) {
        bgColor = page.backgroundColor || bookData.coverColor || BOOK_CONSTANTS.DEFAULT_COVER_COLOR;
    } else if (index === pages.length - 1) {
        bgColor = page.backgroundColor || bookData.backCoverColor || BOOK_CONSTANTS.DEFAULT_BACK_COVER_COLOR;
    } else {
        bgColor = page.backgroundColor || BOOK_CONSTANTS.DEFAULT_EDITOR_COLOR;
    }
    
    pageDiv.style.backgroundColor = bgColor;

    const contentDiv = document.createElement("div");
    contentDiv.className = "page-content";
    
    if (page.backgroundImage) {
        pageDiv.setAttribute('data-bg-image', page.backgroundImage);
        pageDiv.classList.add('has-bg-image');
    }
    
    if (page.contentHtml) {
        contentDiv.innerHTML = page.contentHtml;
    }
    
    pageDiv.appendChild(contentDiv);
    return pageDiv;
}

function updatePageElement(pageDiv, index) {
    const page = pages[index];
    
    if (pageDiv.style.width !== `${bookData.bookWidth}px`) {
        pageDiv.style.width = bookData.bookWidth + "px";
    }
    
    if (pageDiv.style.height !== `${bookData.bookHeight}px`) {
        pageDiv.style.height = bookData.bookHeight + "px";
    }

    let bgColor;
    if (index === 0) {
        bgColor = page.backgroundColor || bookData.coverColor || BOOK_CONSTANTS.DEFAULT_COVER_COLOR;
    } else if (index === pages.length - 1) {
        bgColor = page.backgroundColor || bookData.backCoverColor || BOOK_CONSTANTS.DEFAULT_BACK_COVER_COLOR;
    } else {
        bgColor = page.backgroundColor || BOOK_CONSTANTS.DEFAULT_EDITOR_COLOR;
    }
    
    if (pageDiv.style.backgroundColor !== bgColor) {
        pageDiv.style.backgroundColor = bgColor;
    }

    const contentDiv = pageDiv.querySelector('.page-content');
    if (contentDiv && page.contentHtml !== contentDiv.innerHTML) {
        contentDiv.innerHTML = page.contentHtml || '';
    }
    
    const currentBgImage = pageDiv.getAttribute('data-bg-image') || '';
    if (page.backgroundImage && currentBgImage !== page.backgroundImage) {
        pageDiv.setAttribute('data-bg-image', page.backgroundImage);
        pageDiv.classList.add('has-bg-image');
        pageDiv.style.backgroundImage = `url(${page.backgroundImage})`;
    } else if (!page.backgroundImage && currentBgImage) {
        pageDiv.removeAttribute('data-bg-image');
        pageDiv.classList.remove('has-bg-image');
        pageDiv.style.backgroundImage = '';
        
        if (page.backgroundColor) {
            pageDiv.style.backgroundColor = page.backgroundColor;
        } else {
            pageDiv.style.backgroundColor = '#FFFFFF';
        }
    }
}

/**
 * Positions all pages in the book with proper z-index and visibility
 * @param {NodeList} pageElements - The DOM elements representing pages
 */
function positionPages(pageElements) {
    if (!pageElements || !pageElements.length) return;
    
    pageElements.forEach((page, i) => {
        page.style.transition = '';
        
        if (i === currentPageIndex) {
            page.style.opacity = '1';
            page.style.transform = 'translateY(0)';
            page.style.zIndex = '10';
        } else {
            page.style.opacity = '0';
            page.style.transform = i < currentPageIndex ? 'translateY(-30px)' : 'translateY(30px)';
            page.style.zIndex = i < currentPageIndex ? '5' : '1';
        }
    });
}

/**
 * Updates page numbers in the preview
 */
function updatePageNumbers() {
}

/**
 * Animates the page transition with a smooth slide effect
 * @param {number} fromIndex - Index of the source page
 * @param {number} toIndex - Index of the destination page
 */
function animatePageTurn(fromIndex, toIndex) {
    const flipBook = document.getElementById('flip-book');
    if (!flipBook) return;
    
    const pages = flipBook.querySelectorAll('.page');
    if (pages.length === 0) return;
    
    const isForward = toIndex > fromIndex;
    
    pages.forEach((page, idx) => {
        if (idx !== fromIndex && idx !== toIndex) {
            page.style.opacity = '0';
            page.style.zIndex = '1';
        }
    });
    
    const leavingPage = pages[fromIndex];
    leavingPage.style.zIndex = '10';
    leavingPage.style.opacity = '1';
    
    const enteringPage = pages[toIndex];
    enteringPage.style.zIndex = '5';
    enteringPage.style.opacity = '0';
    enteringPage.style.transform = isForward ? 'translateY(30px)' : 'translateY(-30px)';
    
    setTimeout(() => {
        leavingPage.classList.add('transitioning');
        leavingPage.style.opacity = '0';
        leavingPage.style.transform = isForward ? 'translateY(-30px)' : 'translateY(30px)';
        
        setTimeout(() => {
            enteringPage.classList.add('transitioning');
            enteringPage.style.opacity = '1';
            enteringPage.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                pages.forEach(page => {
                    page.classList.remove('transitioning');
                });
                positionPages(pages);
                
                const event = new CustomEvent('pagetransitioned', { 
                    detail: { from: fromIndex, to: toIndex } 
                });
                document.dispatchEvent(event);
            }, 300);
        }, 150);
    }, 50);
}

function setupPageIndexObserver() {
    const originalLoadPageIntoEditor = window.loadPageIntoEditor || function(){};
    
    window.loadPageIntoEditor = function(index) {
        const oldIndex = currentPageIndex;
        
        originalLoadPageIntoEditor(index);
        
        if (oldIndex !== index) {
            animatePageTurn(oldIndex, index);
        }
    };
}

function initZoomControls() {
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomOut = document.getElementById('zoom-out');
    const zoomIn = document.getElementById('zoom-in');
    const zoomValue = document.getElementById('zoom-value');
    const resetZoom = document.getElementById('reset-zoom');
    const centerBook = document.getElementById('center-book');
    const flipBookContainer = document.getElementById('flip-book-container');
    const flipBook = document.getElementById('flip-book');
    
    calculateAutoZoom();

    zoomSlider.addEventListener('input', function () {
        currentZoom = parseInt(this.value);
        if (zoomValue) zoomValue.textContent = currentZoom;
        updateZoom();
    });

    zoomOut.addEventListener('click', function () {
        if (currentZoom > minZoom) {
            currentZoom = Math.max(minZoom, currentZoom - 10);
            zoomSlider.value = currentZoom;
            if (zoomValue) zoomValue.textContent = currentZoom;
            updateZoom();
        }
    });

    zoomIn.addEventListener('click', function () {
        if (currentZoom < maxZoom) {
            currentZoom = Math.min(maxZoom, currentZoom + 10);
            zoomSlider.value = currentZoom;
            if (zoomValue) zoomValue.textContent = currentZoom;
            updateZoom();
        }
    });

    resetZoom.addEventListener('click', function () {
        calculateAutoZoom();
        zoomSlider.value = currentZoom;
        if (zoomValue) zoomValue.textContent = currentZoom;
        updateZoom();
    });

    centerBook.addEventListener('click', function () {
        translateX = 0;
        translateY = 0;
        lastTranslateX = 0;
        lastTranslateY = 0;
        updatePosition();
    });

    flipBookContainer.addEventListener('wheel', function (e) {
        e.preventDefault();

        const rect = flipBook.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const mouseXRatio = mouseX / rect.width;
        const mouseYRatio = mouseY / rect.height;

        const oldZoom = currentZoom;
        if (e.deltaY < 0) {
            currentZoom = Math.min(maxZoom, currentZoom + 5);
        } else {
            currentZoom = Math.max(minZoom, currentZoom - 5);
        }

        zoomSlider.value = currentZoom;
        if (zoomValue) zoomValue.textContent = currentZoom;

        const zoomRatio = currentZoom / oldZoom;
        const containerRect = flipBookContainer.getBoundingClientRect();

        const newWidth = rect.width * zoomRatio;
        const newHeight = rect.height * zoomRatio;

        const newMouseX = mouseXRatio * newWidth;
        const newMouseY = mouseYRatio * newHeight;

        translateX = lastTranslateX - (newMouseX - mouseX);
        translateY = lastTranslateY - (newMouseY - mouseY);

        const maxTranslateX = (newWidth - containerRect.width) / 2 + 50;
        const maxTranslateY = (newHeight - containerRect.height) / 2 + 50;

        translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
        translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));

        lastTranslateX = translateX;
        lastTranslateY = translateY;

        updateZoom();
    });

    flipBookContainer.addEventListener('mousedown', function (e) {
        e.preventDefault();

        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        flipBookContainer.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        e.preventDefault();

        translateX = e.clientX - startX;
        translateY = e.clientY - startY;

        const containerRect = flipBookContainer.getBoundingClientRect();
        const bookRect = flipBook.getBoundingClientRect();

        const maxTranslateX = (bookRect.width - containerRect.width) / 2 + 50;
        const maxTranslateY = (bookRect.height - containerRect.height) / 2 + 50;

        if (maxTranslateX > 0) {
            translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
        } else {
            translateX = Math.max(-50, Math.min(50, translateX));
        }

        if (maxTranslateY > 0) {
            translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
        } else {
            translateY = Math.max(-50, Math.min(50, translateY));
        }

        updatePosition();
    });

    window.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            lastTranslateX = translateX;
            lastTranslateY = translateY;
            flipBookContainer.style.cursor = 'grab';
        }
    });

    flipBookContainer.addEventListener('dblclick', function (e) {
        e.preventDefault();
        return false;
    });

    window.addEventListener('resize', calculateAutoZoom);
}

function calculateAutoZoom() {
    const container = document.getElementById('flip-book-container');
    const flipBook = document.getElementById('flip-book');

    if (!container || !flipBook || bookData.bookWidth <= 0 || bookData.bookHeight <= 0) {
        return;
    }

    const containerWidth = container.clientWidth - 60;
    const containerHeight = container.clientHeight - 60;

    const widthRatio = containerWidth / bookData.bookWidth;
    const heightRatio = containerHeight / bookData.bookHeight;

    let autoZoom = Math.min(widthRatio, heightRatio) * 100;

    autoZoom = Math.max(minZoom, Math.min(autoZoom, maxZoom));
    autoZoom = Math.floor(autoZoom);

    if (Math.abs(currentZoom - autoZoom) > 2) {
        currentZoom = autoZoom;
        const zoomSlider = document.getElementById('zoom-slider');
        const zoomValue = document.getElementById('zoom-value');
        
        if (zoomSlider) zoomSlider.value = currentZoom;
        if (zoomValue) zoomValue.textContent = currentZoom;

        translateX = 0;
        translateY = 0;
        lastTranslateX = 0;
        lastTranslateY = 0;

        updateZoom();
    }
}

function updateZoom() {
    const flipBook = document.getElementById('flip-book');
    flipBook.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;
    updateSliderProgress();
}

function updatePosition() {
    const flipBook = document.getElementById('flip-book');
    flipBook.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;

    flipBook.style.transition = isDragging ? 'none' : 'transform 0.1s ease';
}

function updateSliderProgress() {
    const slider = document.getElementById('zoom-slider');
    const zoomValue = document.getElementById('zoom-value');
    
    if (!slider) return;
    
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    const value = parseInt(slider.value);
    const progress = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--progress', `${progress}%`);
    
    if (zoomValue && value !== parseInt(zoomValue.textContent)) {
        zoomValue.textContent = value;
    }
    
    const zoomControls = document.querySelector('.advanced-zoom-controls');
    const rightPanel = document.getElementById('right-panel');
    
    if (zoomControls && rightPanel) {
        const panelWidth = rightPanel.offsetWidth;
        
        if (panelWidth < 200) {
            zoomControls.classList.add('compact-layout');
        } else {
            zoomControls.classList.remove('compact-layout');
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const slider = document.getElementById('zoom-slider');
    if (slider) {
        slider.addEventListener('input', updateSliderProgress);
        updateSliderProgress();
    }
});

function enhanceZoomControls() {
    const zoomControls = document.querySelector('.advanced-zoom-controls');
    const zoomSlider = document.getElementById('zoom-slider');

    if (zoomControls && zoomSlider) {
        zoomSlider.addEventListener('mouseenter', () => {
            zoomControls.style.boxShadow = '0 5px 15px rgba(0, 120, 215, 0.2)';
        });

        zoomSlider.addEventListener('mouseleave', () => {
            zoomControls.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
        });
    }
    
    window.addEventListener('resize', updateSliderProgress);
    
    updateSliderProgress();
}

function addButtonFeedback() {
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const resetZoom = document.getElementById('reset-zoom');
    const centerBook = document.getElementById('center-book');

    if (zoomIn && zoomOut && resetZoom && centerBook) {
        [zoomIn, zoomOut, resetZoom, centerBook].forEach(button => {
            button.addEventListener('mousedown', function () {
                this.style.transform = 'scale(0.95)';
                this.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
            });

            button.addEventListener('mouseup', function () {
                this.style.transform = '';
                this.style.boxShadow = '';
            });

            button.addEventListener('mouseleave', function () {
                if (this.style.transform === 'scale(0.95)') {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', addButtonFeedback);

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('page-transition-styles')) {
        const style = document.createElement('style');
        style.id = 'page-transition-styles';
        style.textContent = `
            .page {
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            .page.transitioning {
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupPageIndexObserver();
    
    initZoomControls();
    
    const pageList = document.getElementById('page-list');
    if (pageList) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || 
                    (mutation.type === 'attributes' && mutation.attributeName === 'class')) {
                    const selectedPage = pageList.querySelector('.page-item.selected');
                    if (selectedPage) {
                        updateFlipBook();
                    }
                }
            });
        });
        
        observer.observe(pageList, { 
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }
});