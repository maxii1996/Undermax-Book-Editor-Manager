/**
 * Welcome Wizard Functionality
 * Handles wizard steps interaction and book preview
 */
document.addEventListener('DOMContentLoaded', function () {
    const frontColorPicker = document.getElementById('wizard-cover-color');

    if (frontColorPicker) {
        // Force color mode during color picking
        frontColorPicker.addEventListener('input', function() {
            const viewModeButtons = document.querySelectorAll('[data-step="3"] .view-mode-btn');
            const colorModeBtn = Array.from(viewModeButtons).find(btn => btn.dataset.viewMode === 'color');
            if (colorModeBtn && !colorModeBtn.classList.contains('active')) {
                viewModeButtons.forEach(btn => btn.classList.remove('active'));
                colorModeBtn.classList.add('active');
            }
            updateFrontCoverColor.call(this);
        });
        
        frontColorPicker.addEventListener('change', updateFrontCoverColor);
        
        frontColorPicker.addEventListener('click', function() {
            // When color picker is opened, force color view mode
            const viewModeButtons = document.querySelectorAll('[data-step="3"] .view-mode-btn');
            const colorModeBtn = Array.from(viewModeButtons).find(btn => btn.dataset.viewMode === 'color');
            if (colorModeBtn) {
                viewModeButtons.forEach(btn => btn.classList.remove('active'));
                colorModeBtn.classList.add('active');
            }
            
            if (!window.bookData) window.bookData = {};
            if (!window.originalStates) window.originalStates = {};
            
            const frontElement = document.querySelector('.book-preview-3d .front');
            const frontPreviewCovers = document.querySelectorAll('.front-preview .book-cover');
            
            if (!window.originalStates.frontCoverBg && frontElement) {
                window.originalStates.frontCoverBg = {
                    backgroundColor: frontElement.style.backgroundColor,
                    backgroundImage: frontElement.style.backgroundImage
                };
            }
            
            frontPreviewCovers.forEach(cover => {
                if (!window.originalStates.frontCovers) window.originalStates.frontCovers = [];
                window.originalStates.frontCovers.push({
                    backgroundColor: cover.style.backgroundColor,
                    backgroundImage: cover.style.backgroundImage
                });
            });
            
            updateFrontCoverColor.call(this);
        });

        updateFrontCoverColor.call(frontColorPicker);
    }

    function updateFrontCoverColor() {
        const color = this.value;

        const colorDisplay = document.querySelector('.color-picker-display');
        if (colorDisplay) {
            colorDisplay.style.backgroundColor = color;
        }

        const colorPreview = document.querySelector('.color-preview');
        if (colorPreview) {
            colorPreview.style.setProperty('--preview-color', color);
            colorPreview.style.backgroundColor = color;
        }

        const frontPreview = document.querySelector('.book-preview-3d .front');
        if (frontPreview) {
            frontPreview.style.backgroundColor = color;
            frontPreview.style.backgroundImage = '';
            const book3d = document.querySelector('.book-preview-3d');
            if (book3d) {
                book3d.style.setProperty('--front-color', color);
            }
        }

        document.querySelectorAll('.front-preview .book-cover').forEach(cover => {
            cover.style.backgroundColor = color;
            cover.style.backgroundImage = '';
        });

        const coverPage = document.querySelector('.pages-visual .cover');
        if (coverPage) {
            coverPage.style.backgroundColor = color;
            coverPage.style.backgroundImage = '';
        }

        if (window.bookData) {
            window.bookData.coverColor = color;
        }
    }

    const backColorPicker = document.getElementById('wizard-back-cover-color');

    if (backColorPicker) {
        // Force color mode during color picking
        backColorPicker.addEventListener('input', function() {
            const viewModeButtons = document.querySelectorAll('[data-step="4"] .view-mode-btn');
            const colorModeBtn = Array.from(viewModeButtons).find(btn => btn.dataset.viewMode === 'color');
            if (colorModeBtn && !colorModeBtn.classList.contains('active')) {
                viewModeButtons.forEach(btn => btn.classList.remove('active'));
                colorModeBtn.classList.add('active');
            }
            updateBackCoverColor.call(this);
        });
        
        backColorPicker.addEventListener('change', updateBackCoverColor);
        
        backColorPicker.addEventListener('click', function() {
            // When color picker is opened, force color view mode
            const viewModeButtons = document.querySelectorAll('[data-step="4"] .view-mode-btn');
            const colorModeBtn = Array.from(viewModeButtons).find(btn => btn.dataset.viewMode === 'color');
            if (colorModeBtn) {
                viewModeButtons.forEach(btn => btn.classList.remove('active'));
                colorModeBtn.classList.add('active');
            }
            
            if (!window.bookData) window.bookData = {};
            if (!window.originalStates) window.originalStates = {};
            
            const backElement = document.querySelector('.book-preview-3d .back');
            const backPreviewCovers = document.querySelectorAll('.back-preview .book-cover');
            
            if (!window.originalStates.backCoverBg && backElement) {
                window.originalStates.backCoverBg = {
                    backgroundColor: backElement.style.backgroundColor,
                    backgroundImage: backElement.style.backgroundImage
                };
            }
            
            backPreviewCovers.forEach(cover => {
                if (!window.originalStates.backCovers) window.originalStates.backCovers = [];
                window.originalStates.backCovers.push({
                    backgroundColor: cover.style.backgroundColor,
                    backgroundImage: cover.style.backgroundImage
                });
            });
            
            updateBackCoverColor.call(this);
        });

        updateBackCoverColor.call(backColorPicker);
    }

    function updateBackCoverColor() {
        const color = this.value;

        const backColorPickerDisplay = document.getElementById('back-color-picker-display');
        if (backColorPickerDisplay) {
            backColorPickerDisplay.style.backgroundColor = color;
        }

        const backCoverColorPreview = document.getElementById('back-cover-color-preview');
        if (backCoverColorPreview) {
            backCoverColorPreview.style.setProperty('--preview-color', color);
            backCoverColorPreview.style.backgroundColor = color;
        }

        const backPreview = document.querySelector('.book-preview-3d .back');
        if (backPreview) {
            backPreview.style.backgroundColor = color;
            backPreview.style.backgroundImage = '';
            const book3d = document.querySelector('.book-preview-3d');
            if (book3d) {
                book3d.style.setProperty('--back-color', color);
            }
        }

        document.querySelectorAll('.back-preview .book-cover').forEach(cover => {
            cover.style.backgroundColor = color;
            cover.style.backgroundImage = '';
        });

        const backPage = document.querySelector('.pages-visual .back');
        if (backPage) {
            backPage.style.backgroundColor = color;
            backPage.style.backgroundImage = '';
        }

        if (window.bookData) {
            window.bookData.backCoverColor = color;
        }
    }

    document.getElementById('cover-image-input').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            if (window.BookImageUtils && typeof window.BookImageUtils.isFileTooLarge === 'function') {
                if (BookImageUtils.isFileTooLarge(file, 500)) {
                    this.value = '';
                    
                    let sizeStr = '';
                    try {
                        sizeStr = BookImageUtils.formatFileSize ? BookImageUtils.formatFileSize(file.size) : (file.size / (1024 * 1024)).toFixed(2) + 'MB';
                    } catch (e) {
                        sizeStr = (file.size / (1024 * 1024)).toFixed(2) + 'MB';
                    }
                    
                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                    } else {
                        alert(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                    }
                    
                    if (window.updateNextButtonState) {
                        window.updateNextButtonState();
                    }
                    
                    return;
                }
            } else {
                if (file.size > (500 * 1024)) {
                    this.value = '';
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    
                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeMB}MB). Please use an image smaller than 500KB.`);
                    } else {
                        alert(`Image too large (${sizeMB}MB). Please use an image smaller than 500KB.`);
                    }
                    
                    if (window.updateNextButtonState) {
                        window.updateNextButtonState();
                    }
                    
                    return;
                }
            }
            
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;

                const frontElement = document.querySelector('.book-preview-3d .front');
                if (frontElement) {
                    frontElement.style.backgroundImage = `url(${imageUrl})`;
                    frontElement.style.backgroundColor = 'transparent';
                }

                const coverNameElement = document.getElementById('cover-image-name');
                if (coverNameElement) {
                    coverNameElement.textContent = file.name;
                }

                const removeBtn = document.getElementById('cover-image-remove-btn');
                if (removeBtn) {
                    removeBtn.style.display = 'block';
                }

                const coverPage = document.querySelector('.pages-visual .cover');
                if (coverPage) {
                    coverPage.style.backgroundImage = `url(${imageUrl})`;
                    coverPage.style.backgroundColor = 'transparent';
                }

                const frontPreviewCovers = document.querySelectorAll('.front-preview .book-cover');
                frontPreviewCovers.forEach(cover => {
                    if (cover) {
                        cover.style.backgroundImage = `url(${imageUrl})`;
                        cover.style.backgroundColor = 'transparent';
                    }
                });

                if (!window.bookData) {
                    window.bookData = {};
                }
                window.bookData.coverType = 'image';
                window.bookData.coverImage = imageUrl;

                if (typeof saveBookDataToLocalStorage === 'function') {
                    saveBookDataToLocalStorage();
                }
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('back-cover-image-input').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            if (window.BookImageUtils && typeof window.BookImageUtils.isFileTooLarge === 'function') {
                if (BookImageUtils.isFileTooLarge(file, 500)) {
                    this.value = '';
                    
                    let sizeStr = '';
                    try {
                        sizeStr = BookImageUtils.formatFileSize ? BookImageUtils.formatFileSize(file.size) : (file.size / (1024 * 1024)).toFixed(2) + 'MB';
                    } catch (e) {
                        sizeStr = (file.size / (1024 * 1024)).toFixed(2) + 'MB';
                    }
                    
                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                    } else {
                        alert(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                    }
                    
                    if (window.updateNextButtonState) {
                        window.updateNextButtonState();
                    }
                    
                    return;
                }
            } else {
                if (file.size > (500 * 1024)) {
                    this.value = '';
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    
                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeMB}MB). Please use an image smaller than 500KB.`);
                    } else {
                        alert(`Image too large (${sizeMB}MB). Please use an image smaller than 500KB.`);
                    }
                    
                    if (window.updateNextButtonState) {
                        window.updateNextButtonState();
                    }
                    
                    return;
                }
            }
            
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;

                const backElement = document.querySelector('.book-preview-3d .back');
                if (backElement) {
                    backElement.style.backgroundImage = `url(${imageUrl})`;
                    backElement.style.backgroundColor = 'transparent';
                }

                const imageNameElement = document.getElementById('back-cover-image-name');
                if (imageNameElement) {
                    imageNameElement.textContent = file.name;
                }

                const removeBtn = document.getElementById('back-cover-image-remove-btn');
                if (removeBtn) {
                    removeBtn.style.display = 'block';
                }

                const backPage = document.querySelector('.pages-visual .back');
                if (backPage) {
                    backPage.style.backgroundImage = `url(${imageUrl})`;
                    backPage.style.backgroundColor = 'transparent';
                }

                const backPreviewCovers = document.querySelectorAll('.back-preview .book-cover');
                backPreviewCovers.forEach(cover => {
                    if (cover) {
                        cover.style.backgroundImage = `url(${imageUrl})`;
                        cover.style.backgroundColor = 'transparent';
                    }
                });

                if (!window.bookData) {
                    window.bookData = {};
                }
                window.bookData.backCoverType = 'image';
                window.bookData.backCoverImage = imageUrl;

                if (typeof saveBookDataToLocalStorage === 'function') {
                    saveBookDataToLocalStorage();
                }
            };
            reader.readAsDataURL(file);
        }
    });

    const coverImageRemoveBtn = document.getElementById('cover-image-remove-btn');
    if (coverImageRemoveBtn) {
        coverImageRemoveBtn.addEventListener('click', function () {
            const frontElement = document.querySelector('.book-preview-3d .front');
            if (frontElement) {
                frontElement.style.backgroundImage = '';
                frontElement.style.backgroundColor = window.bookData?.coverColor || '#DC143C';
            }

            document.querySelectorAll('.front-preview .book-cover').forEach(cover => {
                if (cover) {
                    cover.style.backgroundImage = '';
                    cover.style.backgroundColor = window.bookData?.coverColor || '#DC143C';
                }
            });

            const coverPage = document.querySelector('.pages-visual .cover');
            if (coverPage) {
                coverPage.style.backgroundImage = '';
                coverPage.style.backgroundColor = window.bookData?.coverColor || '#DC143C';
            }

            if (window.bookData) {
                window.bookData.coverImage = '';
                window.bookData.coverType = 'color';
            }

            const sizeIndicator = document.querySelector('.image-size-indicator');
            if (sizeIndicator) {
                sizeIndicator.textContent = '';
            }

            const coverColorRadio = document.getElementById('cover-color');
            if (coverColorRadio) {
                coverColorRadio.checked = true;
                const radioEvent = new Event('change');
                coverColorRadio.dispatchEvent(radioEvent);
            }

            const coverImageName = document.getElementById('cover-image-name');
            if (coverImageName) {
                coverImageName.textContent = 'No image selected';
            }

            this.style.display = 'none';

            if (typeof window.updateNextButtonState === 'function') {
                window.updateNextButtonState();
            }
        });
    }

    const backCoverImageRemoveBtn = document.getElementById('back-cover-image-remove-btn');
    if (backCoverImageRemoveBtn) {
        backCoverImageRemoveBtn.addEventListener('click', function () {
            const backElement = document.querySelector('.book-preview-3d .back');
            if (backElement) {
                backElement.style.backgroundImage = '';
                backElement.style.backgroundColor = window.bookData?.backCoverColor || '#DC143C';
            }

            document.querySelectorAll('.back-preview .book-cover').forEach(cover => {
                if (cover) {
                    cover.style.backgroundImage = '';
                    cover.style.backgroundColor = window.bookData?.backCoverColor || '#DC143C';
                }
            });

            const backPage = document.querySelector('.pages-visual .back');
            if (backPage) {
                backPage.style.backgroundImage = '';
                backPage.style.backgroundColor = window.bookData?.backCoverColor || '#DC143C';
            }

            if (window.bookData) {
                window.bookData.backCoverImage = '';
                window.bookData.backCoverType = 'color';
            }

            const sizeIndicator = document.querySelector('.back-cover-size-indicator');
            if (sizeIndicator) {
                sizeIndicator.textContent = '';
            }

            const backCoverColorRadio = document.getElementById('back-cover-color');
            if (backCoverColorRadio) {
                backCoverColorRadio.checked = true;
                const radioEvent = new Event('change');
                backCoverColorRadio.dispatchEvent(radioEvent);
            }

            const backCoverImageName = document.getElementById('back-cover-image-name');
            if (backCoverImageName) {
                backCoverImageName.textContent = 'No image selected';
            }

            this.style.display = 'none';

            if (typeof window.updateNextButtonState === 'function') {
                window.updateNextButtonState();
            }
        });
    }

    document.getElementById('cover-color')?.addEventListener('change', function () {
        if (coverImageRemoveBtn) coverImageRemoveBtn.style.display = 'none';
        if (typeof window.updateNextButtonState === 'function') {
            window.updateNextButtonState();
        }
    });

    document.getElementById('back-cover-color')?.addEventListener('change', function () {
        if (backCoverImageRemoveBtn) backCoverImageRemoveBtn.style.display = 'none';
        if (typeof window.updateNextButtonState === 'function') {
            window.updateNextButtonState();
        }
    });

    const frontCoverRadio = document.getElementById('cover-color');
    const backCoverRadio = document.getElementById('back-cover-color');

    if (frontCoverRadio) {
        frontCoverRadio.addEventListener('change', function () {
            if (this.checked) {
                const book3d = document.querySelector('.book-preview-3d');
                if (book3d) {
                    book3d.classList.remove('back-view');
                    book3d.classList.add('front-view');
                }
                document.querySelectorAll('.preview-dot').forEach((dot, index) => {
                    if (index === 0) dot.classList.add('active');
                    else dot.classList.remove('active');
                });
                
                const previewTitle = document.querySelector('.preview-title');
                if (previewTitle) {
                    previewTitle.innerHTML = '<i class="ri-eye-line"></i> Front Cover Preview';
                }
            }
        });
    }

    if (backCoverRadio) {
        backCoverRadio.addEventListener('change', function () {
            if (this.checked) {
                const book3d = document.querySelector('.book-preview-3d');
                if (book3d) {
                    book3d.classList.remove('front-view');
                    book3d.classList.add('back-view');
                }
                document.querySelectorAll('.preview-dot').forEach((dot, index) => {
                    if (index === 0) dot.classList.remove('active');
                    else if (index === 1) dot.classList.add('active');
                });
                
                const previewTitle = document.querySelector('.preview-title');
                if (previewTitle) {
                    previewTitle.innerHTML = '<i class="ri-eye-line"></i> Back Cover Preview';
                }
            }
        });
    }

    const pageInput = document.getElementById('wizard-page-count');
    const increaseBtn = document.getElementById('increase-pages');
    const decreaseBtn = document.getElementById('decrease-pages');

    function updatePagesVisual() {
        const pagesCount = parseInt(document.getElementById('wizard-page-count')?.value) || 1;
        const pagesContainer = document.getElementById('pages-visual-container');
        if (!pagesContainer) return;

        pagesContainer.innerHTML = '';

        const totalPages = pagesCount + 2;

        const coverIcon = document.createElement('div');
        coverIcon.className = 'page-item cover';
        coverIcon.textContent = 'FRONT';

        if (window.bookData && window.bookData.coverImageEnabled && window.bookData.coverImage) {
            coverIcon.style.backgroundImage = `url(${window.bookData.coverImage})`;
            coverIcon.style.backgroundColor = 'transparent';
            coverIcon.style.transform = 'none';
        } else if (window.bookData) {
            coverIcon.style.backgroundColor = window.bookData.coverColor || '#DC143C';
            coverIcon.style.backgroundImage = '';
        }

        pagesContainer.appendChild(coverIcon);

        if (pagesCount <= 5) {
            for (let i = 1; i <= pagesCount; i++) {
                const pageItem = document.createElement('div');
                pageItem.className = 'page-item';
                pageItem.textContent = i;
                pagesContainer.appendChild(pageItem);
            }
        } else {
            for (let i = 1; i <= 2; i++) {
                const pageItem = document.createElement('div');
                pageItem.className = 'page-item';
                pageItem.textContent = i;
                pagesContainer.appendChild(pageItem);
            }

            const ellipsis = document.createElement('div');
            ellipsis.className = 'page-item ellipsis';
            ellipsis.innerHTML = '&hellip;';
            pagesContainer.appendChild(ellipsis);

            for (let i = pagesCount - 1; i <= pagesCount; i++) {
                const pageItem = document.createElement('div');
                pageItem.className = 'page-item';
                pageItem.textContent = i;
                pagesContainer.appendChild(pageItem);
            }
        }

        const backIcon = document.createElement('div');
        backIcon.className = 'page-item back';
        backIcon.textContent = 'BACK';
        
        if (window.bookData && window.bookData.backCoverImageEnabled && window.bookData.backCoverImage) {
            backIcon.style.backgroundImage = `url(${window.bookData.backCoverImage})`;
            backIcon.style.backgroundColor = 'transparent';
            backIcon.style.transform = 'none';
        } else if (window.bookData) {
            backIcon.style.backgroundColor = window.bookData.backCoverColor || '#DC143C';
            backIcon.style.backgroundImage = '';
        }

        pagesContainer.appendChild(backIcon);

        const summaryPages = document.getElementById('summary-pages');
        if (summaryPages) {
            summaryPages.textContent = `${totalPages} (${pagesCount} inner pages + front and back cover)`;
        }

        updateSummary();
    }

    window.updatePagesVisual = updatePagesVisual;

    increaseBtn.addEventListener('click', function () {
        let value = parseInt(pageInput.value) || 0;
        if (value < 50) {
            pageInput.value = value + 1;
            updatePagesVisual();
        }
    });

    decreaseBtn.addEventListener('click', function () {
        let value = parseInt(pageInput.value) || 0;
        if (value > 1) {
            pageInput.value = value - 1;
            updatePagesVisual();
        }
    });

    pageInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');

        let value = parseInt(this.value) || 0;
        if (value > 50) {
            this.value = 50;
        } else if (value < 1 && this.value !== '') {
            this.value = 1;
        }

        updatePagesVisual();
    });

    pageInput.addEventListener('blur', function () {
        if (this.value === '' || parseInt(this.value) < 1) {
            this.value = 1;
            updatePagesVisual();
        }
    });

    pageInput.addEventListener('change', function () {
        if (this.value === '' || parseInt(this.value) < 1) {
            this.value = 1;
        } else if (parseInt(this.value) > 50) {
            this.value = 50;
        }

        updatePagesVisual();
        saveBookDataToLocalStorage();
    });

    const nextBtn = document.getElementById('next-step-btn');
    const prevBtn = document.getElementById('prev-step-btn');

    nextBtn.addEventListener('click', function () {
        const wizardSteps = document.querySelectorAll('.wizard-step');
        let currentStep = 1;

        for (const step of wizardSteps) {
            if (window.getComputedStyle(step).display !== 'none') {
                const stepAttr = step.getAttribute('data-step');
                currentStep = stepAttr ? parseInt(stepAttr) : 1;
                break;
            }
        }

        if (currentStep === 3) {
            const bookPreview3D = document.querySelector('.book-preview-3d');
            const previewDots = document.querySelectorAll('.preview-dot');
            const previewTitle = document.querySelector('.preview-title');

            if (bookPreview3D) {
                bookPreview3D.classList.add('back-view');
                bookPreview3D.classList.remove('front-view');
            }

            if (previewDots && previewDots.length >= 2) {
                previewDots[0].classList.remove('active');
                previewDots[1].classList.add('active');
            }

            if (previewTitle) {
                previewTitle.innerHTML = '<i class="ri-eye-line"></i> Back Cover Preview';
            }
        }

        if (currentStep === 5) {
            setTimeout(function () {
                updateSummary();
            }, 50);
        }

        document.querySelectorAll('.view-mode-btn[data-view-mode="current"]').forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.click();
            }
        });
    });

    prevBtn.addEventListener('click', function () {
        const currentStep = parseInt(document.querySelector('.wizard-step[style="display: block;"]').getAttribute('data-step'));

        if (currentStep === 4) {
            const book3d = document.querySelector('.book-preview-3d');
            if (book3d) {
                book3d.classList.remove('back-view');
                book3d.classList.add('front-view');
            }
            document.querySelectorAll('.preview-dot')[0].classList.add('active');
            document.querySelectorAll('.preview-dot')[1].classList.remove('active');
            document.querySelector('.preview-title').innerHTML = '<i class="ri-eye-line"></i> Front Cover Preview';
        }

        if (currentStep === 5) {
            setTimeout(function () {
                updateSummary();
            }, 50);
        }

        document.querySelectorAll('.view-mode-btn[data-view-mode="current"]').forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.click();
            }
        });
    });

    document.addEventListener('DOMContentLoaded', updatePagesVisual);

    document.addEventListener('DOMContentLoaded', function () {
        updatePagesVisual();
    });

    window.addEventListener('load', function () {
        setTimeout(updatePagesVisual, 100);
    });

    function saveBookDataToLocalStorage() {
        return new Promise(async (resolve) => {
            try {
                if (!window.bookData) {
                    window.bookData = {};
                }
                
                const pageCountInput = document.getElementById('wizard-page-count');
                if (pageCountInput) {
                    window.bookData.pageCount = parseInt(pageCountInput.value) || 1;
                }
                
                if (document.getElementById('cover-color').checked) {
                    window.bookData.coverType = 'color';
                } else if (document.getElementById('cover-image').checked) {
                    window.bookData.coverType = 'image';
                }
                
                if (document.getElementById('back-cover-color').checked) {
                    window.bookData.backCoverType = 'color';
                } else if (document.getElementById('back-cover-image').checked) {
                    window.bookData.backCoverType = 'image';
                }
                
                if (!window.bookData.pages || !Array.isArray(window.bookData.pages)) {
                    const pagesCount = window.bookData.pageCount || parseInt(document.getElementById('wizard-page-count')?.value) || 1;
                    window.bookData.pages = [];
                    
                    window.bookData.pages.push({
                        name: "Cover",
                        width: window.bookData.width || parseInt(document.getElementById('wizard-book-width')?.value) || 350,
                        height: window.bookData.height || parseInt(document.getElementById('wizard-book-height')?.value) || 400,
                        backgroundColor: window.bookData.coverType === 'image' ? 'transparent' : (window.bookData.coverColor || "#DC143C"),
                        backgroundImage: window.bookData.coverType === 'image' ? window.bookData.coverImage || "" : "",
                        alignment: "center",
                        contentHtml: "<p>Your Book Title</p>"
                    });
                    
                    for (let i = 0; i < pagesCount; i++) {
                        window.bookData.pages.push({
                            name: `Page ${i + 1}`,
                            width: window.bookData.width || parseInt(document.getElementById('wizard-book-width')?.value) || 350,
                            height: window.bookData.height || parseInt(document.getElementById('wizard-book-height')?.value) || 400,
                            backgroundColor: "#FFFFFF",
                            backgroundImage: "",
                            alignment: "left",
                            contentHtml: ""
                        });
                    }
                    
                    window.bookData.pages.push({
                        name: "Back Cover",
                        width: window.bookData.width || parseInt(document.getElementById('wizard-book-width')?.value) || 350,
                        height: window.bookData.height || parseInt(document.getElementById('wizard-book-height')?.value) || 400,
                        backgroundColor: window.bookData.backCoverType === 'image' ? 'transparent' : (window.bookData.backCoverColor || "#DC143C"),
                        backgroundImage: window.bookData.backCoverType === 'image' ? window.bookData.backCoverImage || "" : "",
                        alignment: "center",
                        contentHtml: ""
                    });
                    
                    console.log(`Pages array initialized with ${window.bookData.pages.length} pages`);
                }

                const dataWithoutImages = {...window.bookData};
                

                localStorage.setItem('newBookWizardData', JSON.stringify(dataWithoutImages));
                resolve(true);
            } catch (error) {
                console.error("Error saving book data:", error);
                resolve(false);
            }
        });
    }

    const pageCountInput = document.getElementById('wizard-page-count');
    if (pageCountInput) {
        pageCountInput.addEventListener('input', function () {
            saveBookDataToLocalStorage();
            updatePagesVisual();
        });

        pageCountInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                updatePagesVisual();
                saveBookDataToLocalStorage();
            }
        });
    }
    const bookNameInput = document.getElementById('wizard-book-name');
    if (bookNameInput) {
        bookNameInput.addEventListener('input', function () {
            saveBookDataToLocalStorage();
        });
    }
    const widthInput = document.getElementById('wizard-book-width');
    const heightInput = document.getElementById('wizard-book-height');
    if (widthInput) {
        widthInput.addEventListener('input', function () {
            saveBookDataToLocalStorage();
        });
    }
    if (heightInput) {
        heightInput.addEventListener('input', function () {
            saveBookDataToLocalStorage();
        });
    }

    if (widthInput) {
        widthInput.addEventListener('change', function () {
            const minWidth = 200;
            const maxWidth = 500;
            let value = parseInt(this.value) || 350;
            value = Math.max(minWidth, Math.min(value, maxWidth));
            this.value = value;
            saveBookDataToLocalStorage();
        });
    }

    if (heightInput) {
        heightInput.addEventListener('change', function () {
            const minHeight = 250;
            const maxHeight = 700;
            let value = parseInt(this.value) || 400;
            value = Math.max(minHeight, Math.min(value, maxHeight));
            this.value = value;
            saveBookDataToLocalStorage();
        });
    }

    const createBookBtn = document.getElementById('create-book-btn');
    if (createBookBtn) {
        createBookBtn.addEventListener('click', function () {
            saveBookDataToLocalStorage();
        });
    }

    document.getElementById('create-book-btn').addEventListener('click', function () {
        if (typeof createBookFromWizard === 'function') {
            createBookFromWizard();
        } else {
            console.error('La función createBookFromWizard no está definida');
        }
    });

    const prevButtons = document.querySelectorAll('.prev-step');
    const nextButtons = document.querySelectorAll('.next-step');

    prevButtons.forEach(button => {
        button.addEventListener('click', function () {
            const currentStep = parseInt(this.getAttribute('data-goto')) || 1;
            if (currentStep === 4) {
                setTimeout(updatePagesVisual, 100);
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', function () {
            const currentStep = parseInt(this.getAttribute('data-goto')) || 1;
            if (currentStep === 4) {
                setTimeout(updatePagesVisual, 100);
            }

            if (currentStep === 6) {
                updateSummary();
            }
        });
    });

    function updateSummary() {
        if (!window.bookData) return;

        const pageCountInput = document.getElementById('wizard-page-count');
        const innerPages = pageCountInput ? parseInt(pageCountInput.value) || 0 : (window.bookData.pageCount || 0);
        
        window.bookData.pageCount = innerPages;
        
        const totalPages = innerPages + 2;

        const bookNameInput = document.getElementById('wizard-book-name');
        const bookName = bookNameInput ? bookNameInput.value.trim() : (window.bookData.name || window.bookData.bookName || 'Untitled Book');
        document.getElementById('summary-name').textContent = bookName;
        
        const widthInput = document.getElementById('wizard-book-width');
        const heightInput = document.getElementById('wizard-book-height');
        
        const width = widthInput ? parseInt(widthInput.value) || 350 : (window.bookData.width || window.bookData.bookWidth || 350);
        const height = heightInput ? parseInt(heightInput.value) || 400 : (window.bookData.height || window.bookData.bookHeight || 400);
        
        document.getElementById('summary-dimensions').textContent = `${width}px × ${height}px`;

        document.getElementById('summary-pages').textContent = 
            `${totalPages} (Front Cover + ${innerPages} inner pages + Back Cover)`;
    }

    document.addEventListener('DOMContentLoaded', function() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style' &&
                    mutation.target.classList.contains('wizard-step')) {
                    
                    if (mutation.target.getAttribute('data-step') === '6' && 
                        mutation.target.style.display === 'block') {
                        updateSummary();
                    }
                }
            });
        });
        
        const wizardSteps = document.querySelectorAll('.wizard-step');
        wizardSteps.forEach(function(step) {
            observer.observe(step, { attributes: true });
        });
    });

    document.getElementById('cover-image').addEventListener('change', function() {
        if (!window.bookData) {
            window.bookData = {};
        }
        window.bookData.coverImageEnabled = this.checked;
        
        const coverImageRemoveBtn = document.getElementById('cover-image-remove-btn');
        if (coverImageRemoveBtn) {
            coverImageRemoveBtn.style.display = this.checked && window.bookData.coverImage ? 'block' : 'none';
        }
        
        const frontElement = document.querySelector('.book-preview-3d .front');
        if (frontElement) {
            frontElement.style.backgroundColor = window.bookData.coverColor || '#DC143C';
            if (this.checked && window.bookData.coverImage) {
                frontElement.style.backgroundImage = `url(${window.bookData.coverImage})`;
            } else {
                frontElement.style.backgroundImage = '';
            }
        }
        
        document.querySelectorAll('.front-preview .book-cover').forEach(cover => {
            cover.style.backgroundColor = window.bookData.coverColor || '#DC143C';
            if (this.checked && window.bookData.coverImage) {
                cover.style.backgroundImage = `url(${window.bookData.coverImage})`;
            } else {
                cover.style.backgroundImage = '';
            }
        });
        
        const coverPage = document.querySelector('.pages-visual .cover');
        if (coverPage) {
            coverPage.style.backgroundColor = window.bookData.coverColor || '#DC143C';
            if (this.checked && window.bookData.coverImage) {
                coverPage.style.backgroundImage = `url(${window.bookData.coverImage})`;
            } else {
                coverPage.style.backgroundImage = '';
            }
        }
        
        if (typeof saveBookDataToLocalStorage === 'function') {
            saveBookDataToLocalStorage();
        }

        updateViewModeSelectors();
    });

    document.getElementById('back-cover-image')?.addEventListener('change', function() {
        if (!window.bookData) {
            window.bookData = {};
        }
        window.bookData.backCoverImageEnabled = this.checked;
        
        const backCoverImageRemoveBtn = document.getElementById('back-cover-image-remove-btn');
        if (backCoverImageRemoveBtn) {
            backCoverImageRemoveBtn.style.display = this.checked && window.bookData.backCoverImage ? 'block' : 'none';
        }
        
        const backElement = document.querySelector('.book-preview-3d .back');
        if (backElement) {
            backElement.style.backgroundColor = window.bookData.backCoverColor || '#DC143C';
            if (this.checked && window.bookData.backCoverImage) {
                backElement.style.backgroundImage = `url(${window.bookData.backCoverImage})`;
            } else {
                backElement.style.backgroundImage = '';
            }
        }
        
        document.querySelectorAll('.back-preview .book-cover').forEach(cover => {
            cover.style.backgroundColor = window.bookData.backCoverColor || '#DC143C';
            if (this.checked && window.bookData.backCoverImage) {
                cover.style.backgroundImage = `url(${window.bookData.backCoverImage})`;
            } else {
                cover.style.backgroundImage = '';
            }
        });
        
        const backPage = document.querySelector('.pages-visual .back');
        if (backPage) {
            backPage.style.backgroundColor = window.bookData.backCoverColor || '#DC143C';
            if (this.checked && window.bookData.backCoverImage) {
                backPage.style.backgroundImage = `url(${window.bookData.backCoverImage})`;
            } else {
                backPage.style.backgroundImage = '';
            }
        }
        
        if (typeof saveBookDataToLocalStorage === 'function') {
            saveBookDataToLocalStorage();
        }

        updateViewModeSelectors();
    });

    function setupViewModeSelector(step, coverType) {
        const viewModeButtons = document.querySelectorAll(`[data-step="${step}"] .view-mode-btn`);
        const imageBtn = Array.from(viewModeButtons).find(btn => btn.dataset.viewMode === 'image');
        
        const hasImage = coverType === 'front' 
            ? window.bookData?.coverImage && window.bookData.coverImageEnabled
            : window.bookData?.backCoverImage && window.bookData.backCoverImageEnabled;
            
        if (imageBtn) {
            if (!hasImage) {
                imageBtn.classList.add('disabled');
                imageBtn.setAttribute('disabled', 'disabled');
                if (imageBtn.classList.contains('active')) {
                    imageBtn.classList.remove('active');
                    const colorBtn = Array.from(viewModeButtons).find(btn => btn.dataset.viewMode === 'color');
                    if (colorBtn) colorBtn.classList.add('active');
                }
            } else {
                imageBtn.classList.remove('disabled');
                imageBtn.removeAttribute('disabled');
            }
        }
    }

    function updateViewModeSelectors() {
        setupViewModeSelector(3, 'front');
        setupViewModeSelector(4, 'back');
    }

    const setupViewModeSelectors = function() {
        updateViewModeSelectors();
        
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('disabled')) return;
                
                const parent = this.closest('[data-step]');
                if (!parent) return;
                
                const viewModeButtons = parent.querySelectorAll('.view-mode-btn');
                viewModeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const step = parent.getAttribute('data-step');
                const coverType = step === '3' ? 'front' : 'back';
                const viewMode = this.getAttribute('data-view-mode');
                
                updateCoverPreviewByViewMode(coverType, viewMode);
            });
        });
    };

    function updateCoverPreviewByViewMode(coverType, viewMode) {
        const isImageEnabled = coverType === 'front' 
            ? window.bookData?.coverImageEnabled 
            : window.bookData?.backCoverImageEnabled;
            
        const imageUrl = coverType === 'front' 
            ? window.bookData?.coverImage 
            : window.bookData?.backCoverImage;
            
        const color = coverType === 'front' 
            ? window.bookData?.coverColor || '#DC143C' 
            : window.bookData?.backCoverColor || '#DC143C';
            
        const previewElement = document.querySelector(`.book-preview-3d .${coverType}`);
        const previewCovers = document.querySelectorAll(`.${coverType}-preview .book-cover`);
        const pageVisualItem = document.querySelector(`.pages-visual .${coverType === 'front' ? 'cover' : 'back'}`);
        
        if (viewMode === 'color' || viewMode === 'current' && !isImageEnabled) {
            if (previewElement) {
                previewElement.style.backgroundImage = '';
                previewElement.style.backgroundColor = color;
            }
            
            previewCovers.forEach(cover => {
                cover.style.backgroundImage = '';
                cover.style.backgroundColor = color;
            });
            
            if (pageVisualItem) {
                pageVisualItem.style.backgroundImage = '';
                pageVisualItem.style.backgroundColor = color;
            }
        } 
        else if (viewMode === 'image' || viewMode === 'current' && isImageEnabled) {
            if (imageUrl) {
                if (previewElement) {
                    previewElement.style.backgroundImage = `url(${imageUrl})`;
                    previewElement.style.backgroundColor = 'transparent';
                }
                
                previewCovers.forEach(cover => {
                    cover.style.backgroundImage = `url(${imageUrl})`;
                    cover.style.backgroundColor = 'transparent';
                });
                
                if (pageVisualItem) {
                    pageVisualItem.style.backgroundImage = `url(${imageUrl})`;
                    pageVisualItem.style.backgroundColor = 'transparent';
                }
            }
        }
    }

    setupViewModeSelectors();
});