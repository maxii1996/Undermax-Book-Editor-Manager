document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.clear();

    const newBookBtn = document.getElementById('new-book-btn');
    const loadBookBtn = document.getElementById('load-book-btn');
    const welcomeFileInput = document.getElementById('welcome-file-input');
    const welcomeContainer = document.querySelector('.welcome-container');
    const wizardContainer = document.querySelector('.wizard-container');
    const closeWizardBtn = document.getElementById('close-wizard-btn');

    const prevStepBtn = document.getElementById('prev-step-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const createBookBtn = document.getElementById('create-book-btn');

    const bookData = {
        name: '',
        width: 350,
        height: 400,
        coverType: 'color',
        coverColor: '#DC143C',
        coverImage: '',
        coverImageEnabled: false,
        backCoverType: 'color',
        backCoverColor: '#DC143C',
        backCoverImage: '',
        backCoverImageEnabled: false,
        pageCount: 2
    };

    const MAX_IMAGE_SIZE_KB = 500;
    let frontCoverImageValid = true;
    let backCoverImageValid = true;

    let currentStep = 1;

    newBookBtn.addEventListener('click', showWizard);
    loadBookBtn.addEventListener('click', function () {
        welcomeFileInput.click();
    });

    welcomeFileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            loadBookFile(file);
        }
    });

    closeWizardBtn.addEventListener('click', hideWizard);

    prevStepBtn.addEventListener('click', goToPrevStep);
    nextStepBtn.addEventListener('click', goToNextStep);
    createBookBtn.addEventListener('click', createBook);

    const bookNameInput = document.getElementById('wizard-book-name');
    bookNameInput.addEventListener('input', function () {
        bookData.name = this.value.trim();
        updateNextButtonState();
    });

    const bookWidthInput = document.getElementById('wizard-book-width');
    const bookHeightInput = document.getElementById('wizard-book-height');
    const dimensionPreview = document.getElementById('dimension-preview');

    bookWidthInput.addEventListener('input', updateDimensions);
    bookHeightInput.addEventListener('input', updateDimensions);

    function updateDimensions() {
        bookData.width = parseInt(bookWidthInput.value) || 350;
        bookData.height = parseInt(bookHeightInput.value) || 400;

        dimensionPreview.style.width = (bookData.width / 2) + 'px';
        dimensionPreview.style.height = (bookData.height / 2) + 'px';
    }

    const coverColorInput = document.getElementById('wizard-cover-color');
    const coverColorPreview = document.getElementById('cover-color-preview');
    const coverImageBtn = document.getElementById('cover-image-btn');
    let coverImageInput = document.getElementById('cover-image-input');
    const coverImageName = document.getElementById('cover-image-name');
    const coverImageRemoveBtn = document.getElementById('cover-image-remove-btn');

    document.getElementById('cover-color').addEventListener('change', function () {
        bookData.coverType = 'color';
        document.querySelectorAll('[name="cover-type"]').forEach(radio => {
            radio.closest('.cover-option').classList.remove('selected');
        });
        this.closest('.cover-option').classList.add('selected');
        updateCoverPreview();
        updatePageIcons(bookData.pageCount);
        updateCoverRemoveButtonVisibility();
        updateNextButtonState();
    });

    document.getElementById('cover-image').addEventListener('change', function () {
        bookData.coverImageEnabled = this.checked;
        updateCoverPreview();
        updateCoverRemoveButtonVisibility();
        updateNextButtonState();
    });

    coverColorInput.addEventListener('input', function () {
        bookData.coverColor = this.value;
        if (coverColorPreview) {
            coverColorPreview.style.backgroundColor = this.value;
        }
        updateCoverPreview();
        updatePageIcons(bookData.pageCount);
    });

    coverColorInput.addEventListener('mousemove', function () {
        bookData.coverColor = this.value;
        if (coverColorPreview) {
            coverColorPreview.style.backgroundColor = this.value;
        }
        updateCoverPreview();
    });

    function updateCoverPreview() {
        const frontCovers = document.querySelectorAll('.front-preview .book-cover');
        frontCovers.forEach(cover => {
            if (cover) {
                cover.style.backgroundColor = bookData.coverColor || '#DC143C';
                if (bookData.coverImageEnabled && bookData.coverImage) {
                    cover.style.backgroundImage = `url(${bookData.coverImage})`;
                } else {
                    cover.style.backgroundImage = '';
                }
            }
        });

        const frontFace = document.querySelector('.book-preview-3d .front');
        if (frontFace) {
            frontFace.style.backgroundColor = bookData.coverColor || '#DC143C';
            if (bookData.coverImageEnabled && bookData.coverImage) {
                frontFace.style.backgroundImage = `url(${bookData.coverImage})`;
            } else {
                frontFace.style.backgroundImage = '';
            }
        }

        const coverPage = document.querySelector('.pages-visual .cover');
        if (coverPage) {
            coverPage.style.backgroundColor = bookData.coverColor || '#DC143C';
            if (bookData.coverImageEnabled && bookData.coverImage) {
                coverPage.style.backgroundImage = `url(${bookData.coverImage})`;
            } else {
                coverPage.style.backgroundImage = '';
            }
        }
    }

    coverImageBtn.addEventListener('click', function () {
        coverImageInput.click();
    });

    coverImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            let sizeIndicator = document.querySelector('.front-cover-size-indicator');
            if (sizeIndicator) {
                sizeIndicator.textContent = '';
                sizeIndicator.className = 'image-size-indicator front-cover-size-indicator';
            }

            if (window.BookImageUtils && typeof window.BookImageUtils.isFileTooLarge === 'function') {
                if (BookImageUtils.isFileTooLarge(file, MAX_IMAGE_SIZE_KB)) {
                    this.value = '';

                    let sizeStr = '';
                    try {
                        sizeStr = BookImageUtils.formatFileSize(file.size);
                    } catch (e) {
                        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                        sizeStr = sizeMB + 'MB';
                    }

                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                    } else {
                        alert(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                    }

                    if (!sizeIndicator) {
                        sizeIndicator = document.createElement('div');
                        sizeIndicator.className = 'image-size-indicator front-cover-size-indicator error';
                        this.parentElement.appendChild(sizeIndicator);
                    }

                    sizeIndicator.textContent = `File too large: ${sizeStr}. Maximum allowed: 500KB`;

                    frontCoverImageValid = false;
                    updateNextButtonState();
                    return;
                }
            } else {
              //  console.warn("BookImageUtils not available, skipping size check");
                if (file.size > (MAX_IMAGE_SIZE_KB * 1024)) {
                    this.value = '';
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeMB}MB). Please use an image smaller than 500KB.`);
                    } else {
                        alert(`Image too large (${sizeMB}MB). Please use an image smaller than 500KB.`);
                    }

                    frontCoverImageValid = false;
                    updateNextButtonState();
                    return;
                }
            }

            frontCoverImageValid = true;

            if (!sizeIndicator) {
                sizeIndicator = document.createElement('div');
                sizeIndicator.className = 'image-size-indicator front-cover-size-indicator';
                this.parentElement.appendChild(sizeIndicator);
            }

            let sizeStr = '';
            try {
                sizeStr = window.BookImageUtils ? BookImageUtils.formatFileSize(file.size) : (file.size / 1024).toFixed(0) + 'KB';
            } catch (e) {
                sizeStr = (file.size / 1024).toFixed(0) + 'KB';
            }

            sizeIndicator.textContent = `File size: ${sizeStr} (OK)`;
            sizeIndicator.className = 'image-size-indicator front-cover-size-indicator success';

            coverImageName.textContent = file.name;
            document.getElementById('cover-image').checked = true;
            bookData.coverImageEnabled = true;

            const reader = new FileReader();
            reader.onload = function (e) {
                bookData.coverImage = e.target.result;
                updateCoverPreview();
                updatePageIcons(bookData.pageCount);
                updateCoverRemoveButtonVisibility();

                const radioEvent = new Event('change');
                document.getElementById('cover-image').dispatchEvent(radioEvent);
            };
            reader.readAsDataURL(file);
        }
    });

    coverImageRemoveBtn.addEventListener('click', function () {
        bookData.coverImage = '';
        coverImageName.textContent = 'No image selected';
        document.getElementById('cover-color').checked = true;
        bookData.coverImageEnabled = false;

        const radioEvent = new Event('change');
        document.getElementById('cover-color').dispatchEvent(radioEvent);

        let sizeIndicator = document.querySelector('.front-cover-size-indicator');
        if (sizeIndicator) {
            sizeIndicator.textContent = '';
            sizeIndicator.className = 'image-size-indicator front-cover-size-indicator';
        }

        frontCoverImageValid = false;

        updateCoverPreview();
        updatePageIcons(bookData.pageCount);
        updateCoverRemoveButtonVisibility();
        updateNextButtonState();
    });

    function updateCoverRemoveButtonVisibility() {
        if (bookData.coverImageEnabled && bookData.coverImage) {
            coverImageRemoveBtn.style.display = 'inline-flex';
        } else {
            coverImageRemoveBtn.style.display = 'none';
        }
    }

    const backCoverColorInput = document.getElementById('wizard-back-cover-color');
    const backCoverColorPreview = document.getElementById('back-cover-color-preview');
    const backCoverImageBtn = document.getElementById('back-cover-image-btn');
    let backCoverImageInput = document.getElementById('back-cover-image-input');
    const backCoverImageName = document.getElementById('back-cover-image-name');
    const backCoverImageRemoveBtn = document.getElementById('back-cover-image-remove-btn');

    document.getElementById('back-cover-color').addEventListener('change', function () {
        bookData.backCoverType = 'color';
        document.querySelectorAll('[name="back-cover-type"]').forEach(radio => {
            radio.closest('.cover-option').classList.remove('selected');
        });
        this.closest('.cover-option').classList.add('selected');
        updateBackCoverPreview();
        updatePageIcons(bookData.pageCount);
        updateBackCoverRemoveButtonVisibility();
        updateNextButtonState();
    });

    document.getElementById('back-cover-image').addEventListener('change', function () {
        bookData.backCoverImageEnabled = this.checked;
        updateBackCoverPreview();
        updateBackCoverRemoveButtonVisibility();
        updateNextButtonState();
    });

    backCoverColorInput.addEventListener('input', function () {
        bookData.backCoverColor = this.value;
        if (backCoverColorPreview) {
            backCoverColorPreview.style.backgroundColor = this.value;
        }
        updateBackCoverPreview();
        updatePageIcons(bookData.pageCount);
    });

    backCoverColorInput.addEventListener('mousemove', function () {
        bookData.backCoverColor = this.value;
        if (backCoverColorPreview) {
            backCoverColorPreview.style.backgroundColor = this.value;
        }
        updateBackCoverPreview();
    });

    function updateBackCoverPreview() {
        const backCovers = document.querySelectorAll('.back-preview .book-cover');
        backCovers.forEach(cover => {
            if (cover) {
                cover.style.backgroundColor = bookData.backCoverColor || '#DC143C';
                if (bookData.backCoverImageEnabled && bookData.backCoverImage) {
                    cover.style.backgroundImage = `url(${bookData.backCoverImage})`;
                } else {
                    cover.style.backgroundImage = '';
                }
            }
        });

        const backFace = document.querySelector('.book-preview-3d .back');
        if (backFace) {
            backFace.style.backgroundColor = bookData.backCoverColor || '#DC143C';
            if (bookData.backCoverImageEnabled && bookData.backCoverImage) {
                backFace.style.backgroundImage = `url(${bookData.backCoverImage})`;
            } else {
                backFace.style.backgroundImage = '';
            }
        }

        const backPage = document.querySelector('.pages-visual .back');
        if (backPage) {
            backPage.style.backgroundColor = bookData.backCoverColor || '#DC143C';
            if (bookData.backCoverImageEnabled && bookData.backCoverImage) {
                backPage.style.backgroundImage = `url(${bookData.backCoverImage})`;
            } else {
                backPage.style.backgroundImage = '';
            }
        }
    }

    backCoverImageBtn.addEventListener('click', function () {
        backCoverImageInput.click();
    });

    backCoverImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            let sizeIndicator = document.querySelector('.back-cover-size-indicator');
            if (sizeIndicator) {
                sizeIndicator.textContent = '';
                sizeIndicator.className = 'image-size-indicator back-cover-size-indicator';
            }

            if (window.BookImageUtils && typeof window.BookImageUtils.isFileTooLarge === 'function') {
                if (BookImageUtils.isFileTooLarge(file, MAX_IMAGE_SIZE_KB)) {
                    this.value = '';

                    let sizeStr = '';
                    try {
                        sizeStr = BookImageUtils.formatFileSize(file.size);
                    } catch (e) {
                        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                        sizeStr = sizeMB + 'MB';
                    }

                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                    } else {
                        alert(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                    }

                    if (!sizeIndicator) {
                        sizeIndicator = document.createElement('div');
                        sizeIndicator.className = 'image-size-indicator back-cover-size-indicator error';
                        this.parentElement.appendChild(sizeIndicator);
                    }

                    sizeIndicator.textContent = `File too large: ${sizeStr}. Maximum allowed: 500KB`;

                    backCoverImageValid = false;
                    updateNextButtonState();
                    return;
                }
            } else {
              //  console.warn("BookImageUtils not available, skipping size check");
                if (file.size > (MAX_IMAGE_SIZE_KB * 1024)) {
                    this.value = '';
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeMB}MB). Please use an image smaller than 500KB.`);
                    } else {
                        alert(`Image too large (${sizeMB}MB). Please use an image smaller than 500KB.`);
                    }

                    backCoverImageValid = false;
                    updateNextButtonState();
                    return;
                }
            }

            backCoverImageValid = true;

            if (!sizeIndicator) {
                sizeIndicator = document.createElement('div');
                sizeIndicator.className = 'image-size-indicator back-cover-size-indicator';
                this.parentElement.appendChild(sizeIndicator);
            }

            let sizeStr = '';
            try {
                sizeStr = window.BookImageUtils ? BookImageUtils.formatFileSize(file.size) : (file.size / 1024).toFixed(0) + 'KB';
            } catch (e) {
                sizeStr = (file.size / 1024).toFixed(0) + 'KB';
            }

            sizeIndicator.textContent = `File size: ${sizeStr} (OK)`;
            sizeIndicator.className = 'image-size-indicator back-cover-size-indicator success';

            backCoverImageName.textContent = file.name;
            document.getElementById('back-cover-image').checked = true;
            bookData.backCoverImageEnabled = true;

            const reader = new FileReader();
            reader.onload = function (e) {
                bookData.backCoverImage = e.target.result;
                updateBackCoverPreview();
                updatePageIcons(bookData.pageCount);
                updateBackCoverRemoveButtonVisibility();

                const radioEvent = new Event('change');
                document.getElementById('back-cover-image').dispatchEvent(radioEvent);
            };
            reader.readAsDataURL(file);
        }
    });

    backCoverImageRemoveBtn.addEventListener('click', function () {
        bookData.backCoverImage = '';
        backCoverImageName.textContent = 'No image selected';
        document.getElementById('back-cover-color').checked = true;
        bookData.backCoverImageEnabled = false;

        const radioEvent = new Event('change');
        document.getElementById('back-cover-color').dispatchEvent(radioEvent);

        let sizeIndicator = document.querySelector('.back-cover-size-indicator');
        if (sizeIndicator) {
            sizeIndicator.textContent = '';
            sizeIndicator.className = 'image-size-indicator back-cover-size-indicator';
        }

        backCoverImageValid = false;

        updateBackCoverPreview();
        updatePageIcons(bookData.pageCount);
        updateBackCoverRemoveButtonVisibility();
        updateNextButtonState();
    });

    function updateBackCoverRemoveButtonVisibility() {
        if (bookData.backCoverImageEnabled && bookData.backCoverImage) {
            backCoverImageRemoveBtn.style.display = 'inline-flex';
        } else {
            backCoverImageRemoveBtn.style.display = 'none';
        }
    }

    const pageCountInput = document.getElementById('wizard-page-count');
    const pageIconsContainer = document.getElementById('pages-visual-container');

    pageCountInput.addEventListener('input', function () {
        const count = parseInt(this.value) || 0;
        bookData.pageCount = count;
        updatePageIcons(count);
        
        if (currentStep === 6) {
            updateSummary();
        }
    });

    function updatePageIcons(count) {
        const container = document.getElementById('pages-visual-container');
        if (!container) return;

        container.innerHTML = '';

        const coverIcon = document.createElement('div');
        coverIcon.className = 'page-item cover';
        coverIcon.textContent = 'FRONT';
        
        if (bookData.coverImageEnabled && bookData.coverImage) {
            coverIcon.style.backgroundImage = `url(${bookData.coverImage})`;
            coverIcon.style.backgroundColor = 'transparent';
            coverIcon.style.transform = 'none';
        } else {
            coverIcon.style.backgroundColor = bookData.coverColor || '#DC143C';
            coverIcon.style.backgroundImage = '';
        }
        container.appendChild(coverIcon);

        if (count <= 5) {
            for (let i = 1; i <= count; i++) {
                const pageItem = document.createElement('div');
                pageItem.className = 'page-item';
                pageItem.textContent = i;
                container.appendChild(pageItem);
            }
        } else {
            for (let i = 1; i <= 2; i++) {
                const pageItem = document.createElement('div');
                pageItem.className = 'page-item';
                pageItem.textContent = i;
                container.appendChild(pageItem);
            }
            
            const ellipsis = document.createElement('div');
            ellipsis.className = 'page-item ellipsis';
            ellipsis.innerHTML = '&hellip;';
            container.appendChild(ellipsis);
            
            for (let i = count - 1; i <= count; i++) {
                const pageItem = document.createElement('div');
                pageItem.className = 'page-item';
                pageItem.textContent = i;
                container.appendChild(pageItem);
            }
        }

        const backIcon = document.createElement('div');
        backIcon.className = 'page-item back';
        backIcon.textContent = 'BACK';
        
        if (bookData.backCoverImageEnabled && bookData.backCoverImage) {
            backIcon.style.backgroundImage = `url(${bookData.backCoverImage})`;
            backIcon.style.backgroundColor = 'transparent';
            backIcon.style.transform = 'none';
        } else {
            backIcon.style.backgroundColor = bookData.backCoverColor || '#DC143C';
            backIcon.style.backgroundImage = '';
        }
        container.appendChild(backIcon);
    }

    function showWizard() {
        welcomeContainer.style.opacity = '0';
        setTimeout(() => {
            welcomeContainer.style.display = 'none';
            wizardContainer.style.display = 'flex';
            setTimeout(() => {
                bookNameInput.focus();
            }, 100);
        }, 300);
    }

    function hideWizard() {
        wizardContainer.style.opacity = '0';
        setTimeout(() => {
            wizardContainer.style.display = 'none';
            wizardContainer.style.opacity = '1';
            welcomeContainer.style.display = 'flex';
            setTimeout(() => {
                welcomeContainer.style.opacity = '1';
            }, 100);
        }, 300);
    }

    function goToPrevStep() {
        if (currentStep > 1) {
            document.querySelector(`.wizard-step[data-step="${currentStep}"]`).style.display = 'none';
            currentStep--;
            document.querySelector(`.wizard-step[data-step="${currentStep}"]`).style.display = 'block';
            updateStepIndicators();
            updateNavButtons();
            
            if (currentStep === 4) {
                if (typeof updatePagesVisual === 'function') {
                    updatePagesVisual();
                }
            }
        }
    }

    function goToNextStep() {
        if (currentStep < 6) {
            document.querySelector(`.wizard-step[data-step="${currentStep}"]`).style.display = 'none';
            currentStep++;
            document.querySelector(`.wizard-step[data-step="${currentStep}"]`).style.display = 'block';
            updateStepIndicators();
            updateNavButtons();
            
            if (currentStep === 4) {
                if (typeof updatePagesVisual === 'function') {
                    updatePagesVisual();
                }
            }
            
            if (currentStep === 6) {
                const pageCountInput = document.getElementById('wizard-page-count');
                if (pageCountInput && bookData) {
                    bookData.pageCount = parseInt(pageCountInput.value) || 1;
                }
                updateSummary();
            }
        }
    }

    function updateStepIndicators() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        document.querySelector(`.dot[data-step="${currentStep}"]`).classList.add('active');
    }

    function updateNavButtons() {
        prevStepBtn.disabled = currentStep === 1;

        if (currentStep === 6) {
            nextStepBtn.style.display = 'none';
        } else {
            nextStepBtn.style.display = 'flex';
        }

        updateNextButtonState();
    }

    function updateNextButtonState() {
        const nextButton = document.getElementById('next-step-btn');
        if (!nextButton) return;
        
        const wizardSteps = document.querySelectorAll('.wizard-step');
        let currentStep = 1;

        for (const step of wizardSteps) {
            if (window.getComputedStyle(step).display !== 'none') {
                currentStep = parseInt(step.getAttribute('data-step') || '1');
                break;
            }
        }
        
        if (currentStep === 3) {
            const frontCoverType = document.querySelector('input[name="cover-type"]:checked')?.value;
            const isFrontCoverImage = bookData.coverImageEnabled;
            
            if (isFrontCoverImage) {
                nextButton.disabled = !frontCoverImageValid || !bookData.coverImage;
            } else {
                nextButton.disabled = false;
            }
        } else if (currentStep === 4) {
            const backCoverType = document.querySelector('input[name="back-cover-type"]:checked')?.value;
            const isBackCoverImage = bookData.backCoverImageEnabled;
            
            if (isBackCoverImage) {
                nextButton.disabled = !backCoverImageValid || !bookData.backCoverImage;
            } else {
                nextButton.disabled = false;
            }
        } else if (currentStep === 1) {
            const bookName = document.getElementById('wizard-book-name')?.value.trim() || '';
            nextButton.disabled = bookName.length === 0;
        } else {
            nextButton.disabled = false;
        }
    }

    document.querySelectorAll('input[name="cover-type"], input[name="back-cover-type"]').forEach(radio => {
        radio.addEventListener('change', updateNextButtonState);
    });

    function updateSummary() {
        const pageCount = parseInt(bookData.pageCount) || 0;
        const totalPages = pageCount + 2;
        
        document.getElementById('summary-name').textContent = bookData.name;
        document.getElementById('summary-dimensions').textContent = `${bookData.width} × ${bookData.height} pixels`;
        document.getElementById('summary-pages').textContent = 
            `${totalPages} (Front Cover + ${pageCount} inner pages + Back Cover)`;
    }

    function createBook() {
        const pages = [];

        pages.push({
            name: "Front Cover",
            width: bookData.width,
            height: bookData.height,
            backgroundColor: bookData.coverColor,
            backgroundImage: bookData.coverImageEnabled ? bookData.coverImage : '',
            alignment: "",
            contentHtml: "<p>Your Book Title</p>"
        });

        const pageCount = parseInt(bookData.pageCount) || 0;
        for (let i = 0; i < pageCount; i++) {
            pages.push({
                name: `Page ${i + 1}`,
                width: bookData.width,
                height: bookData.height,
                backgroundColor: "#FFFFFF",
                backgroundImage: "",
                alignment: "left",
                contentHtml: ""
            });
        }

        pages.push({
            name: "Back Cover",
            width: bookData.width,
            height: bookData.height,
            backgroundColor: bookData.backCoverColor,
            backgroundImage: bookData.backCoverImageEnabled ? bookData.backCoverImage : '',
            alignment: "",
            contentHtml: "<p>The End</p>"
        });

        localStorage.setItem('newBookWizardData', JSON.stringify({
            bookName: bookData.name,
            bookWidth: bookData.width,
            bookHeight: bookData.height,
            coverColor: bookData.coverColor,
            coverImageEnabled: bookData.coverImageEnabled,
            coverImage: bookData.coverImage,
            backCoverColor: bookData.backCoverColor,
            backCoverImageEnabled: bookData.backCoverImageEnabled,
            backCoverImage: bookData.backCoverImage,
            pages: pages
        }));

        console.log("Datos del libro guardados, redirigiendo al editor...");
        
        setTimeout(() => {
            window.location.href = 'index.html?newBook=true';
        }, 100);
    }

    function loadBookFile(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.pages || !Array.isArray(data.pages) || data.pages.length < 2) {
                    notifications.error("Invalid book file format. The book must have at least 2 pages.");
                    return;
                }
                
                const processedData = {
                    ...data,
                    bookName: data.bookName || "Untitled Book",
                    bookWidth: data.bookWidth || data.width || 350,
                    bookHeight: data.bookHeight || data.height || 400,
                    coverColor: data.coverColor || "#DC143C",
                    backCoverColor: data.backCoverColor || "#DC143C",
                    editorColor: data.editorColor || "#FFFFFF"
                };

                sessionStorage.setItem('loadedBookData', JSON.stringify(processedData));
                sessionStorage.setItem('isLoadingBook', 'true');
                
                notifications.success('Book loaded successfully!');

                setTimeout(() => {
                    window.location.href = 'index.html?loadBook=true';
                }, 1000);

            } catch (error) {
                console.error("Error parsing JSON file:", error);
                notifications.error("Error loading book: " + error.message);
            }
        };

        reader.onerror = function() {
            notifications.error("Error reading file. Please try again.");
        };

        reader.readAsText(file);
    }

    function init() {
        updateDimensions();

        const coverColorPreview = document.getElementById('cover-color-preview');
        const backColorPreview = document.getElementById('back-cover-color-preview');

        if (coverColorPreview) {
            coverColorPreview.style.backgroundColor = bookData.coverColor;
        }

        if (backColorPreview) {
            backColorPreview.style.backgroundColor = bookData.backCoverColor;
        }

        updatePageIcons(bookData.pageCount);
        updateNavButtons();
        setupDualPreview();
        addCoverFloatingEffect();
        setupModernRadioButtons();
        updateCoverRemoveButtonVisibility();
        updateBackCoverRemoveButtonVisibility();
    }


    function setupDualPreview() {
        const previewBtns = document.querySelectorAll('.preview-toggle-btn');
        const dualPreviewContainers = document.querySelectorAll('.dual-preview-container');

        if (!previewBtns.length || !dualPreviewContainers.length) return;

        previewBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const parentControls = this.closest('.preview-controls');
                const groupBtns = parentControls.querySelectorAll('.preview-toggle-btn');

                groupBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const container = this.closest('.wizard-step-preview').querySelector('.dual-preview-container');
                container.className = 'dual-preview-container';

                const view = this.getAttribute('data-view');
                if (view === 'front') {
                    container.classList.add('front-only');
                } else if (view === 'back') {
                    container.classList.add('back-only');
                }
            });
        });

        document.querySelectorAll('[data-step="3"] .preview-toggle-btn, [data-step="4"] .preview-toggle-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const view = this.getAttribute('data-view');
                const otherStep = this.closest('[data-step="3"]') ?
                    document.querySelector('[data-step="4"]') :
                    document.querySelector('[data-step="3"]');

                if (otherStep) {
                    const matchingBtn = otherStep.querySelector(`.preview-toggle-btn[data-view="${view}"]`);
                    if (matchingBtn && !matchingBtn.classList.contains('active')) {
                        matchingBtn.click();
                    }
                }
            });
        });
    }

    function addCoverFloatingEffect() {
        const covers = document.querySelectorAll('.book-cover');

        covers.forEach(cover => {
            cover.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const rotateY = ((x / rect.width) - 0.5) * 20;
                const rotateX = ((y / rect.height) - 0.5) * -20;

                this.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            cover.addEventListener('mouseleave', function () {
                this.style.transform = '';
            });
        });
    }

    init();


    setupDualPreview();

    function setupModernRadioButtons() {
        document.querySelectorAll('.cover-option').forEach(option => {
            option.addEventListener('click', function (e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
                    return;
                }

                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    const event = new Event('change');
                    radio.dispatchEvent(event);
                }
            });
        });

        document.getElementById('cover-color').addEventListener('change', function () {
            if (this.checked) {
                bookData.coverType = 'color';
                document.querySelectorAll('[name="cover-type"]').forEach(radio => {
                    const coverOption = radio.closest('.cover-option');
                    if (coverOption) {
                        coverOption.classList.remove('selected');
                    }
                });
                const coverOption = this.closest('.cover-option');
                if (coverOption) {
                    coverOption.classList.add('selected');
                }

                updateCoverPreview();
                updateCoverRemoveButtonVisibility();
                updateNextButtonState();
            }
        });

        document.getElementById('cover-image').addEventListener('change', function () {
            document.querySelectorAll('[name="cover-type"]').forEach(radio => {
                const coverOption = radio.closest('.cover-option');
                if (coverOption) {
                    coverOption.classList.remove('selected');
                }
            });
            const coverOption = this.closest('.cover-option');
            if (coverOption) {
                coverOption.classList.add('selected');
            }
            bookData.coverImageEnabled = this.checked;
            updateCoverRemoveButtonVisibility();
            updateNextButtonState();
        });

        document.getElementById('back-cover-color').addEventListener('change', function () {
            document.querySelectorAll('[name="back-cover-type"]').forEach(radio => {
                const coverOption = radio.closest('.cover-option');
                if (coverOption) {
                    coverOption.classList.remove('selected');
                }
            });
            const coverOption = this.closest('.cover-option');
            if (coverOption) {
                coverOption.classList.add('selected');
            }
            bookData.backCoverType = 'color';
            updateBackCoverRemoveButtonVisibility();
            updateNextButtonState();
        });

        document.getElementById('back-cover-image').addEventListener('change', function () {
            document.querySelectorAll('[name="back-cover-type"]').forEach(radio => {
                const coverOption = radio.closest('.cover-option');
                if (coverOption) {
                    coverOption.classList.remove('selected');
                }
            });
            const coverOption = this.closest('.cover-option');
            if (coverOption) {
                coverOption.classList.add('selected');
            }
            bookData.backCoverImageEnabled = this.checked;
            updateBackCoverRemoveButtonVisibility();
            updateNextButtonState();
        });

        if (document.getElementById('cover-color').checked) {
            document.getElementById('cover-color').closest('.cover-option').classList.add('selected');
        }

        if (document.getElementById('back-cover-color').checked) {
            document.getElementById('back-cover-color').closest('.cover-option').classList.add('selected');
        }
    }

    window.bookData = bookData;

    coverColorInput.addEventListener('input', function () {
        bookData.coverColor = this.value;
        if (coverColorPreview) {
            coverColorPreview.style.backgroundColor = this.value;
        }
        updateCoverPreview();
    });

    document.getElementById('cover-color').addEventListener('change', function () {
        if (this.checked) {
            bookData.coverType = 'color';
            document.querySelectorAll('[name="cover-type"]').forEach(radio => {
                const coverOption = radio.closest('.cover-option');
                if (coverOption) {
                    coverOption.classList.remove('selected');
                }
            });
            const coverOption = this.closest('.cover-option');
            if (coverOption) {
                coverOption.classList.add('selected');
            }

            updateCoverPreview();
            updateCoverRemoveButtonVisibility();
            updateNextButtonState();
        }
    });

    backCoverColorInput.addEventListener('input', function () {
        bookData.backCoverColor = this.value;
        if (backCoverColorPreview) {
            backCoverColorPreview.style.backgroundColor = this.value;
        }
        updateBackCoverPreview();
    });

    document.getElementById('back-cover-color').addEventListener('change', function () {
        if (this.checked) {
            bookData.backCoverType = 'color';
            document.querySelectorAll('[name="back-cover-type"]').forEach(radio => {
                const coverOption = radio.closest('.cover-option');
                if (coverOption) {
                    coverOption.classList.remove('selected');
                }
            });
            const coverOption = this.closest('.cover-option');
            if (coverOption) {
                coverOption.classList.add('selected');
            }

            updateBackCoverPreview();
            updateBackCoverRemoveButtonVisibility();
            updateNextButtonState();
        }
    });
});

function createBookFromWizard() {
    const coverImageData = window.bookData && window.bookData.coverImage ? window.bookData.coverImage : '';
    const backCoverImageData = window.bookData && window.bookData.backCoverImage ? window.bookData.backCoverImage : '';

    const bookName = document.getElementById('wizard-book-name').value || 'UndermaxBook';
    const bookWidth = parseInt(document.getElementById('wizard-book-width').value) || 350;
    const bookHeight = parseInt(document.getElementById('wizard-book-height').value) || 400;
    const pagesCount = Math.max(1, parseInt(document.getElementById('wizard-page-count').value) || 1);
    
    console.log(`Creating book with ${pagesCount} internal pages (+ front and back cover)`);
    
    const coverImageEnabled = bookData.coverImageEnabled || false;
    const coverColor = document.getElementById('wizard-cover-color').value || '#DC143C';
    const coverImage = coverImageData || '';
    
    const backCoverImageEnabled = bookData.backCoverImageEnabled || false;
    const backCoverColor = document.getElementById('wizard-back-cover-color').value || '#DC143C';
    const backCoverImage = backCoverImageData || '';

    const pages = [];
    
    pages.push({
        name: "Cover",
        width: bookWidth,
        height: bookHeight,
        backgroundColor: coverColor,
        backgroundImage: coverImageEnabled ? coverImage : '',
        alignment: "center",
        contentHtml: "<p>Your Book Title</p>"
    });
    
    for (let i = 0; i < pagesCount; i++) {
        pages.push({
            name: `Page ${i + 1}`,
            width: bookWidth,
            height: bookHeight,
            backgroundColor: "#FFFFFF",
            backgroundImage: "",
            alignment: "left",
            contentHtml: ""
        });
    }
    
    pages.push({
        name: "Back Cover",
        width: bookWidth,
        height: bookHeight,
        backgroundColor: backCoverColor,
        backgroundImage: backCoverImageEnabled ? backCoverImage : '',
        alignment: "center",
        contentHtml: ""
    });
    
    console.log("Creating book with:", {
        pageCount: pagesCount,
        totalPages: pages.length,
        hasImages: {
            cover: Boolean(coverImage),
            backCover: Boolean(backCoverImage)
        }
    });
    
    if (pages.length < 2) {
        console.error("Failed to create sufficient pages");
        notifications.error("Error creating book: Invalid page count");
        return;
    }
    
    const bookData = {
        bookName: bookName,
        bookWidth: bookWidth,
        bookHeight: bookHeight,
        coverColor: coverColor,
        backCoverColor: backCoverColor,
        coverImageEnabled: coverImageEnabled,
        coverImage: coverImage,
        backCoverImageEnabled: backCoverImageEnabled,
        backCoverImage: backCoverImage,
        pageCount: pagesCount,
        pages: pages
    };
    
   // console.log("Saving book data with pages:", bookData.pages.length);
    
    let storageSuccess = false;
    if (window.BookImageUtils) {
        const bookDataJson = JSON.stringify(bookData);
        storageSuccess = BookImageUtils.safelyStoreData('newBookWizardData', bookDataJson, handleCreateBookError);
    } else {
        try {
            localStorage.setItem('newBookWizardData', JSON.stringify(bookData));
            storageSuccess = true;
        } catch (error) {
            handleCreateBookError(error);
        }
    }
    
    if (storageSuccess) {
        console.log(`Successfully saved ${pages.length} pages to localStorage`);
        console.log('Book data saved:', bookData);
        
        sessionStorage.setItem('fromWelcome', 'true');
        
        setTimeout(() => {
            window.location.href = 'index.html?newBook=true';
        }, 100);
    }
}

function handleCreateBookError(error) {
    const isQuotaError = error.name === 'QuotaExceededError' || 
                         error.name === 'NS_ERROR_DOM_QUOTA_REACHED';
    
    if (isQuotaError) {
        try {
            sessionStorage.setItem('newBookWizardData', JSON.stringify(window.bookData));
            sessionStorage.setItem('useSessionStorage', 'true');
            
            if (window.notifications) {
                window.notifications.warning(
                    "Your book is too large for persistent storage. " +
                    "It will be available for this session only. " +
                    "Consider using smaller images in the future."
                );
            } else {
                alert("Storage limit exceeded. Using temporary storage instead. Your book will be available for this session only.");
            }
            
            setTimeout(() => {
                window.location.href = 'index.html?newBook=true&useSessionStorage=true';
            }, 1500);
            
        } catch (sessionError) {
            console.error('SessionStorage fallback failed:', sessionError);
            
            if (window.notifications) {
                window.notifications.error(
                    "Unable to create book due to image size limitations. " +
                    "Please use smaller images or fewer pages."
                );
            } else {
                alert("Unable to create book due to storage limitations. Please use smaller images or fewer pages.");
            }
        }
    } else {
        console.error('Error creating book:', error);
        if (window.notifications) {
            window.notifications.error("Failed to create book: " + error.message);
        } else {
            alert("Failed to create book: " + error.message);
        }
    }
}