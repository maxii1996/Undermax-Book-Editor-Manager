/**
 * Welcome Wizard Functionality
 * Handles wizard steps interaction and book preview
 */
document.addEventListener('DOMContentLoaded', function () {
    const frontColorPicker = document.getElementById('wizard-cover-color');

    if (frontColorPicker) {
        ['input', 'change'].forEach(evt => {
            frontColorPicker.addEventListener(evt, updateFrontCoverColor);
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
        ['input', 'change'].forEach(evt => {
            backColorPicker.addEventListener(evt, updateBackCoverColor);
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
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;

                document.querySelector('.book-preview-3d .front').style.backgroundImage = `url(${imageUrl})`;
                document.querySelector('.book-preview-3d .front').style.backgroundColor = 'transparent';

                document.querySelectorAll('.front-preview .book-cover').forEach(cover => {
                    cover.style.backgroundImage = `url(${imageUrl})`;
                    cover.style.backgroundColor = 'transparent';
                });

                const coverPage = document.querySelector('.pages-visual .cover');
                coverPage.style.backgroundImage = `url(${imageUrl})`;
                coverPage.style.backgroundSize = 'cover';
                coverPage.style.backgroundColor = 'transparent';

                const removeBtn = document.getElementById('cover-image-remove-btn');
                if (removeBtn) removeBtn.style.display = 'inline-flex';
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('back-cover-image-input').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;

                if (window.BookImageUtils) {
                    BookImageUtils.compressImage(imageUrl)
                        .then(compressedImageUrl => {
                            updateBackCoverWithImage(compressedImageUrl);
                        })
                        .catch(err => {
                            console.error("Image compression failed:", err);
                            updateBackCoverWithImage(imageUrl);
                        });
                } else {
                    updateBackCoverWithImage(imageUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    function updateBackCoverWithImage(imageUrl) {
        if (window.bookData) {
            window.bookData.backCoverImage = imageUrl;
            window.bookData.backCoverType = 'image';
        }

        const backCoverElement = document.querySelector('.book-preview-3d .back');
        if (backCoverElement) {
            backCoverElement.style.backgroundImage = `url(${imageUrl})`;
            backCoverElement.style.backgroundColor = 'transparent';
        }

        const backCovers = document.querySelectorAll('.back-preview .book-cover');
        if (backCovers.length > 0) {
            backCovers.forEach(cover => {
                cover.style.backgroundImage = `url(${imageUrl})`;
                cover.style.backgroundColor = 'transparent';
            });
        }

        const backPage = document.querySelector('.pages-visual .back');
        if (backPage) {
            backPage.style.backgroundImage = `url(${imageUrl})`;
            backPage.style.backgroundSize = 'cover';
            backPage.style.backgroundColor = 'transparent';
        }

        const removeBtn = document.getElementById('back-cover-image-remove-btn');
        if (removeBtn) {
            removeBtn.style.display = 'inline-flex';
        }

        const backCoverRadio = document.getElementById('back-cover-image');
        if (backCoverRadio) {
            backCoverRadio.checked = true;

            const radioEvent = new Event('change');
            backCoverRadio.dispatchEvent(radioEvent);
        }
    }

    const coverImageRemoveBtn = document.getElementById('cover-image-remove-btn');
    if (coverImageRemoveBtn) {
        coverImageRemoveBtn.addEventListener('click', function () {
            document.querySelector('.book-preview-3d .front').style.backgroundImage = '';
            document.querySelector('.book-preview-3d .front').style.backgroundColor = window.bookData?.coverColor || '#DC143C';

            document.querySelectorAll('.front-preview .book-cover').forEach(cover => {
                cover.style.backgroundImage = '';
                cover.style.backgroundColor = window.bookData?.coverColor || '#DC143C';
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

            document.getElementById('cover-color').checked = true;
            const radioEvent = new Event('change');
            document.getElementById('cover-color').dispatchEvent(radioEvent);

            this.style.display = 'none';

            document.getElementById('cover-image-name').textContent = 'No image selected';
        });
    }

    const backCoverImageRemoveBtn = document.getElementById('back-cover-image-remove-btn');
    if (backCoverImageRemoveBtn) {
        backCoverImageRemoveBtn.addEventListener('click', function () {
            document.querySelector('.book-preview-3d .back').style.backgroundImage = '';
            document.querySelector('.book-preview-3d .back').style.backgroundColor = window.bookData?.backCoverColor || '#DC143C';

            document.querySelectorAll('.back-preview .book-cover').forEach(cover => {
                cover.style.backgroundImage = '';
                cover.style.backgroundColor = window.bookData?.backCoverColor || '#DC143C';
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

            document.getElementById('back-cover-color').checked = true;
            const radioEvent = new Event('change');
            document.getElementById('back-cover-color').dispatchEvent(radioEvent);

            this.style.display = 'none';

            document.getElementById('back-cover-image-name').textContent = 'No image selected';
        });
    }

    document.getElementById('cover-color').addEventListener('change', function () {
        if (coverImageRemoveBtn) coverImageRemoveBtn.style.display = 'none';
    });

    document.getElementById('back-cover-color').addEventListener('change', function () {
        if (backCoverImageRemoveBtn) backCoverImageRemoveBtn.style.display = 'none';
    });

    const frontCoverRadio = document.getElementById('cover-color');
    const backCoverRadio = document.getElementById('back-cover-color');

    frontCoverRadio.addEventListener('change', function () {
        if (this.checked) {
            const book3d = document.querySelector('.book-preview-3d');
            if (book3d) {
                book3d.classList.remove('back-view');
                book3d.classList.add('front-view');
            }
            document.querySelectorAll('.preview-dot')[0].classList.add('active');
            document.querySelectorAll('.preview-dot')[1].classList.remove('active');
            document.querySelector('.preview-title').innerHTML = '<i class="ri-eye-line"></i> Front Cover Preview';
        }
    });

    backCoverRadio.addEventListener('change', function () {
        if (this.checked) {
            const book3d = document.querySelector('.book-preview-3d');
            if (book3d) {
                book3d.classList.remove('front-view');
                book3d.classList.add('back-view');
            }
            document.querySelectorAll('.preview-dot')[0].classList.remove('active');
            document.querySelectorAll('.preview-dot')[1].classList.add('active');
            document.querySelector('.preview-title').innerHTML = '<i class="ri-eye-line"></i> Back Cover Preview';
        }
    });

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

        if (window.bookData && window.bookData.coverType === 'image' && window.bookData.coverImage) {
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

        if (window.bookData && window.bookData.backCoverType === 'image' && window.bookData.backCoverImage) {
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
                currentStep = parseInt(step.getAttribute('data-step') || '1');
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
    });

    document.addEventListener('DOMContentLoaded', updatePagesVisual);

    document.addEventListener('DOMContentLoaded', function () {
        updatePagesVisual();
    });

    window.addEventListener('load', function () {
        setTimeout(updatePagesVisual, 100);
    });

    function saveBookDataToLocalStorage() {
        try {
            if (!window.bookData) {
                console.error('No book data to save');
                return false;
            }

            const dataWithoutImages = {...window.bookData};
            
            if (window.BookImageUtils) {
                return new Promise(async (resolve) => {
                    try {
                        if (dataWithoutImages.coverImage && dataWithoutImages.coverImage.length > 50000) {
                            try {
                                const compressedImage = await BookImageUtils.compressImage(dataWithoutImages.coverImage);
                                window.bookData.coverImage = compressedImage;
                                dataWithoutImages.coverImage = compressedImage;
                            } catch (err) {
                                console.warn('Cover image compression failed:', err);
                            }
                        }

                        if (dataWithoutImages.backCoverImage && dataWithoutImages.backCoverImage.length > 50000) {
                            try {
                                const compressedBackImage = await BookImageUtils.compressImage(dataWithoutImages.backCoverImage);
                                window.bookData.backCoverImage = compressedBackImage;
                                dataWithoutImages.backCoverImage = compressedBackImage;
                            } catch (err) {
                                console.warn('Back cover image compression failed:', err);
                            }
                        }

                        if (window.bookData && window.bookData.pages) {
                            window.bookData.pages = window.bookData.pages.map(page => {
                                if (!page.backgroundImage || typeof page.backgroundImage !== 'string') {
                                    page.backgroundImage = '';
                                }
                                return page;
                            });
                        }

                        const jsonData = JSON.stringify(window.bookData);
                        const success = BookImageUtils ?
                            BookImageUtils.safelyStoreData('newBookWizardData', jsonData, handleStorageError) :
                            safeStoreWithFallback(jsonData);

                        if (success) {
                            console.log('Book wizard data saved successfully, pageCount:', window.bookData.pageCount);
                            resolve(true);
                        } else {
                            console.error('Failed to save book data');
                            resolve(false);
                        }
                    } catch (error) {
                        console.error('Error saving book data:', error);
                        handleStorageError(error);
                        resolve(false);
                    }
                });
            } else {
                const jsonData = JSON.stringify(window.bookData);
                return safeStoreWithFallback(jsonData);
            }
        } catch (error) {
            console.error('Error preparing book data for storage:', error);
            handleStorageError(error);
            return false;
        }
    }

    function safeStoreWithFallback(jsonData) {
        try {
            localStorage.setItem('newBookWizardData', jsonData);
            return true;
        } catch (error) {
            console.error('Failed to store book data:', error);
            handleStorageError(error);
            
            try {
                const parsedData = JSON.parse(jsonData);
                if (parsedData.coverImage) parsedData.coverImage = '';
                if (parsedData.backCoverImage) parsedData.backCoverImage = '';
                
                if (parsedData.pages) {
                    parsedData.pages = parsedData.pages.map(page => {
                        if (page.backgroundImage) page.backgroundImage = '';
                        return page;
                    });
                }
                
                const trimmedData = JSON.stringify(parsedData);
                localStorage.setItem('newBookWizardData', trimmedData);
                
                notifications.warning("Your book was created, but images were removed due to size limitations.");
                return true;
            } catch (fallbackError) {
                console.error('Even fallback storage failed:', fallbackError);
                return false;
            }
        }
    }

    function handleStorageError(error) {
        console.error('Storage error:', error);
        notifications.error('Unable to save book data. Your browser storage may be full.');
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

        document.getElementById('summary-name').textContent = window.bookData.bookName || 'Untitled Book';
        document.getElementById('summary-dimensions').textContent =
            `${window.bookData.width || 350}px × ${window.bookData.height || 400}px`;

        const pageCount = parseInt(window.bookData.pageCount) || 0;
        document.getElementById('summary-pages').textContent = pageCount;
    }
});