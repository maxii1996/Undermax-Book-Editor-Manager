let currentZoom = 100;
const minZoom = 10;
const maxZoom = 200;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;
let lastTranslateX = 0, lastTranslateY = 0;

function updateFlipBook() {
    const fb = document.getElementById("flip-book");
    fb.innerHTML = "";
    if (pages.length === 0) return;

    fb.style.width = bookData.bookWidth + "px";
    fb.style.height = bookData.bookHeight + "px";

    for (let i = 0; i < pages.length; i++) {
        const pageDiv = document.createElement("div");
        pageDiv.className = "page";
        pageDiv.style.width = bookData.bookWidth + "px";
        pageDiv.style.height = bookData.bookHeight + "px";

        let bgColor = pages[i].backgroundColor;
        if (i === 0) {
            bgColor = bookData.coverColor;
        } else if (i === pages.length - 1) {
            bgColor = bookData.backCoverColor;
        }

        const contentDiv = document.createElement("div");
        contentDiv.className = "page-content ql-editor";
        contentDiv.innerHTML = pages[i].contentHtml;
        contentDiv.style.backgroundColor = bgColor;

        if (pages[i].backgroundImage) {
            contentDiv.style.backgroundImage = "url('" + pages[i].backgroundImage + "')";
            contentDiv.style.backgroundSize = "cover";
            contentDiv.style.backgroundPosition = "center";
        }

        pageDiv.appendChild(contentDiv);

        if (i < currentPageIndex) {
            pageDiv.style.transform = "rotateY(-180deg)";
        } else {
            pageDiv.style.transform = "rotateY(0deg)";
        }

        pageDiv.style.zIndex = pages.length - i;
        fb.appendChild(pageDiv);
    }

    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');

    if (prevPageBtn && nextPageBtn) {
        prevPageBtn.disabled = currentPageIndex === 0;
        nextPageBtn.disabled = currentPageIndex === pages.length - 1;
    }

    updateInfoBar();
    updateRemoveImageButtonState();
    
    // Reset zoom and position when dimensions change
    calculateAutoZoom();
}

function initZoomControls() {
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomOut = document.getElementById('zoom-out');
    const zoomIn = document.getElementById('zoom-in');
    const zoomInput = document.getElementById('zoom-input');
    const resetZoom = document.getElementById('reset-zoom');
    const centerBook = document.getElementById('center-book');
    const flipBookContainer = document.getElementById('flip-book-container');
    const flipBook = document.getElementById('flip-book');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');

    calculateAutoZoom();

    zoomSlider.addEventListener('input', function () {
        currentZoom = parseInt(this.value);
        zoomInput.value = currentZoom;
        updateZoom();
    });

    zoomInput.addEventListener('input', function () {
        let value = this.value.replace(/[^\d]/g, '');
        if (value === '') value = '100';
        this.value = value;
    });

    zoomInput.addEventListener('change', function () {
        let value = parseInt(this.value);
        if (isNaN(value) || value < minZoom) value = minZoom;
        if (value > maxZoom) value = maxZoom;
        currentZoom = value;
        this.value = value;
        zoomSlider.value = value;
        updateZoom();
    });

    zoomOut.addEventListener('click', function () {
        if (currentZoom > minZoom) {
            currentZoom = Math.max(minZoom, currentZoom - 10);
            zoomSlider.value = currentZoom;
            zoomInput.value = currentZoom;
            updateZoom();
        }
    });

    zoomIn.addEventListener('click', function () {
        if (currentZoom < maxZoom) {
            currentZoom = Math.min(maxZoom, currentZoom + 10);
            zoomSlider.value = currentZoom;
            zoomInput.value = currentZoom;
            updateZoom();
        }
    });

    resetZoom.addEventListener('click', function () {
        calculateAutoZoom();
        zoomSlider.value = currentZoom;
        zoomInput.value = currentZoom;
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
        zoomInput.value = currentZoom;

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

    prevPageBtn.addEventListener('click', function () {
        if (currentPageIndex > 0) {
            goPrev();
        }
    });

    nextPageBtn.addEventListener('click', function () {
        if (currentPageIndex < pages.length - 1) {
            goNext();
        }
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
        document.getElementById('zoom-slider').value = currentZoom;
        document.getElementById('zoom-input').value = currentZoom;

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
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    const value = parseInt(slider.value);
    const progress = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--progress', `${progress}%`);
}

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('zoom-slider');
    if (slider) {
        slider.addEventListener('input', updateSliderProgress);
        updateSliderProgress();
    }
});

function enhanceZoomControls() {
    const zoomControls = document.querySelector('.advanced-zoom-controls');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomInput = document.getElementById('zoom-input');
    
    if (zoomControls && zoomSlider && zoomInput) {
        zoomSlider.addEventListener('mouseenter', () => {
            zoomControls.style.boxShadow = '0 5px 15px rgba(0, 120, 215, 0.2)';
        });
        
        zoomSlider.addEventListener('mouseleave', () => {
            if (document.activeElement !== zoomInput) {
                zoomControls.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
            }
        });
        
        zoomInput.addEventListener('focus', () => {
            zoomControls.style.boxShadow = '0 5px 15px rgba(0, 120, 215, 0.2)';
        });
        
        zoomInput.addEventListener('blur', () => {
            zoomControls.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
        });
    }
}

document.addEventListener('DOMContentLoaded', enhanceZoomControls);

document.addEventListener('DOMContentLoaded', function() {
    updateSliderProgress();
    
    const slider = document.getElementById('zoom-slider');
    if (slider) {
        slider.addEventListener('input', updateSliderProgress);
    }
    
    const zoomInput = document.getElementById('zoom-input');
    if (zoomInput) {
        zoomInput.addEventListener('change', updateSliderProgress);
    }
});

function addButtonFeedback() {
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const resetZoom = document.getElementById('reset-zoom');
    const centerBook = document.getElementById('center-book');
    
    if (zoomIn && zoomOut && resetZoom && centerBook) {
        [zoomIn, zoomOut, resetZoom, centerBook].forEach(button => {
            button.addEventListener('mousedown', function() {
                this.style.transform = 'scale(0.95)';
                this.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
            });
            
            button.addEventListener('mouseup', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
            
            button.addEventListener('mouseleave', function() {
                if (this.style.transform === 'scale(0.95)') {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', addButtonFeedback);