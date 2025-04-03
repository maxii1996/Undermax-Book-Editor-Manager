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
        backCoverType: 'color',
        backCoverColor: '#DC143C',
        backCoverImage: '',
        pageCount: 2
    };

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
    const coverImageInput = document.getElementById('cover-image-input');
    const coverImageName = document.getElementById('cover-image-name');

    document.getElementById('cover-color').addEventListener('change', function () {
        bookData.coverType = 'color';
        document.querySelectorAll('[name="cover-type"]').forEach(radio => {
            radio.closest('.cover-option').classList.remove('selected');
        });
        this.closest('.cover-option').classList.add('selected');
        updateCoverPreview();
        updatePageIcons(bookData.pageCount);
    });

    document.getElementById('cover-image').addEventListener('change', function () {
        bookData.coverType = 'image';
        updateCoverPreview();
    });

    coverColorInput.addEventListener('input', function () {
        bookData.coverColor = this.value;
        coverColorPreview.style.backgroundColor = this.value;
        updateCoverPreview();
        updatePageIcons(bookData.pageCount);
    });

    coverColorInput.addEventListener('mousemove', function () {
        bookData.coverColor = this.value;
        coverColorPreview.style.backgroundColor = this.value;
        updateCoverPreview();
    });

    function updateCoverPreview() {
        const frontCovers = document.querySelectorAll('.front-preview .book-cover');
        frontCovers.forEach(cover => {
            if (bookData.coverType === 'color') {
                cover.style.backgroundColor = bookData.coverColor;
                cover.style.backgroundImage = '';
            } else if (bookData.coverType === 'image' && bookData.coverImage) {
                cover.style.backgroundImage = `url(${bookData.coverImage})`;
                cover.style.backgroundColor = 'transparent';
            }
        });

        const frontFace = document.querySelector('.book-preview-3d .front');
        if (frontFace) {
            if (bookData.coverType === 'color') {
                frontFace.style.backgroundColor = bookData.coverColor;
                frontFace.style.backgroundImage = '';
            } else if (bookData.coverType === 'image' && bookData.coverImage) {
                frontFace.style.backgroundImage = `url(${bookData.coverImage})`;
                frontFace.style.backgroundColor = 'transparent';
            }
        }

        const coverPage = document.querySelector('.pages-visual .cover');
        if (coverPage) {
            coverPage.style.backgroundColor = bookData.coverType === 'color' ?
                bookData.coverColor : 'transparent';
            coverPage.style.backgroundImage = bookData.coverType === 'image' && bookData.coverImage ?
                `url(${bookData.coverImage})` : '';
        }
    }

    coverImageBtn.addEventListener('click', function () {
        coverImageInput.click();
    });

    coverImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            coverImageName.textContent = file.name;
            document.getElementById('cover-image').checked = true;
            bookData.coverType = 'image';

            const reader = new FileReader();
            reader.onload = function (e) {
                bookData.coverImage = e.target.result;
                updateCoverPreview();
                updatePageIcons(bookData.pageCount);

                const radioEvent = new Event('change');
                document.getElementById('cover-image').dispatchEvent(radioEvent);
            };
            reader.readAsDataURL(file);
        }
    });

    const backCoverColorInput = document.getElementById('wizard-back-cover-color');
    const backCoverColorPreview = document.getElementById('back-cover-color-preview');
    const backCoverImageBtn = document.getElementById('back-cover-image-btn');
    const backCoverImageInput = document.getElementById('back-cover-image-input');
    const backCoverImageName = document.getElementById('back-cover-image-name');

    document.getElementById('back-cover-color').addEventListener('change', function () {
        bookData.backCoverType = 'color';
        document.querySelectorAll('[name="back-cover-type"]').forEach(radio => {
            radio.closest('.cover-option').classList.remove('selected');
        });
        this.closest('.cover-option').classList.add('selected');
        updateBackCoverPreview();
        updatePageIcons(bookData.pageCount);
    });

    document.getElementById('back-cover-image').addEventListener('change', function () {
        bookData.backCoverType = 'image';
        updateBackCoverPreview();
    });

    function updateBackCoverPreview() {
        const backCovers = document.querySelectorAll('.back-preview .book-cover');
        backCovers.forEach(cover => {
            if (bookData.backCoverType === 'color') {
                cover.style.backgroundColor = bookData.backCoverColor;
                cover.style.backgroundImage = '';
            } else if (bookData.backCoverType === 'image' && bookData.backCoverImage) {
                cover.style.backgroundImage = `url(${bookData.backCoverImage})`;
                cover.style.backgroundColor = 'transparent';
            }
        });

        const backFace = document.querySelector('.book-preview-3d .back');
        if (backFace) {
            if (bookData.backCoverType === 'color') {
                backFace.style.backgroundColor = bookData.backCoverColor;
                backFace.style.backgroundImage = '';
            } else if (bookData.backCoverType === 'image' && bookData.backCoverImage) {
                backFace.style.backgroundImage = `url(${bookData.backCoverImage})`;
                backFace.style.backgroundColor = 'transparent';
            }
        }

        const backPage = document.querySelector('.pages-visual .back');
        if (backPage) {
            backPage.style.backgroundColor = bookData.backCoverType === 'color' ?
                bookData.backCoverColor : 'transparent';
            backPage.style.backgroundImage = bookData.backCoverType === 'image' && bookData.backCoverImage ?
                `url(${bookData.backCoverImage})` : '';
        }
    }

    backCoverColorInput.addEventListener('input', function () {
        bookData.backCoverColor = this.value;
        backCoverColorPreview.style.backgroundColor = this.value;
        updateBackCoverPreview();
        updatePageIcons(bookData.pageCount);
    });

    backCoverColorInput.addEventListener('mousemove', function () {
        bookData.backCoverColor = this.value;
        backCoverColorPreview.style.backgroundColor = this.value;
        updateBackCoverPreview();
    });

    backCoverImageBtn.addEventListener('click', function () {
        backCoverImageInput.click();
    });

    backCoverImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            backCoverImageName.textContent = file.name;
            document.getElementById('back-cover-image').checked = true;
            bookData.backCoverType = 'image';

            const reader = new FileReader();
            reader.onload = function (e) {
                bookData.backCoverImage = e.target.result;
                updateBackCoverPreview();
                updatePageIcons(bookData.pageCount);

                const radioEvent = new Event('change');
                document.getElementById('back-cover-image').dispatchEvent(radioEvent);
            };
            reader.readAsDataURL(file);
        }
    });

    const pageCountInput = document.getElementById('wizard-page-count');
    const pageIconsContainer = document.getElementById('pages-visual-container');

    pageCountInput.addEventListener('input', function () {
        const count = parseInt(this.value) || 0;
        bookData.pageCount = count;
        updatePageIcons(count);
    });

    function updatePageIcons(count) {
        const container = document.getElementById('pages-visual-container');
        if (!container) return;

        container.innerHTML = '';

        const coverIcon = document.createElement('div');
        coverIcon.className = 'page-item cover';
        coverIcon.textContent = 'FRONT';
        if (bookData.coverType === 'color') {
            coverIcon.style.backgroundColor = bookData.coverColor;
        } else if (bookData.coverType === 'image' && bookData.coverImage) {
            coverIcon.style.backgroundImage = `url(${bookData.coverImage})`;
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
        }

        const backIcon = document.createElement('div');
        backIcon.className = 'page-item back';
        backIcon.textContent = 'BACK';
        if (bookData.backCoverType === 'color') {
            backIcon.style.backgroundColor = bookData.backCoverColor;
        } else if (bookData.backCoverType === 'image' && bookData.backCoverImage) {
            backIcon.style.backgroundImage = `url(${bookData.backCoverImage})`;
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
        if (currentStep === 1) {
            nextStepBtn.disabled = bookData.name.trim() === '';
        } else {
            nextStepBtn.disabled = false;
        }
    }

    function updateSummary() {
        document.getElementById('summary-name').textContent = bookData.name;
        document.getElementById('summary-dimensions').textContent = `${bookData.width} × ${bookData.height} pixels`;
        document.getElementById('summary-pages').textContent = `${bookData.pageCount + 2} (Front Cover + ${bookData.pageCount} inner pages + Back Cover)`;
    }

    function createBook() {
        const pages = [];

        pages.push({
            name: "Front Cover",
            width: bookData.width,
            height: bookData.height,
            backgroundColor: bookData.coverType === 'color' ? bookData.coverColor : 'transparent',
            backgroundImage: bookData.coverType === 'image' ? bookData.coverImage : '',
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
            backgroundColor: bookData.backCoverType === 'color' ? bookData.backCoverColor : 'transparent',
            backgroundImage: bookData.backCoverType === 'image' ? bookData.backCoverImage : '',
            alignment: "",
            contentHtml: "<p>The End</p>"
        });

        const newBookData = {
            bookName: bookData.name,
            bookWidth: bookData.width,
            bookHeight: bookData.height,
            coverColor: bookData.coverColor,
            backCoverColor: bookData.backCoverColor,
            pages: pages
        };

        sessionStorage.setItem('newBookWizardData', JSON.stringify(newBookData));

        notifications.success('Book created successfully!');

        setTimeout(() => {
            window.location.href = 'index.html?newBook=true';
        }, 1000);
    }

    function loadBookFile(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.pages || !Array.isArray(data.pages)) {
                    notifications.error("Invalid book file format.");
                    return;
                }

                sessionStorage.setItem('loadedBookData', e.target.result);

                notifications.success('Book loaded successfully!');

                setTimeout(() => {
                    window.location.href = 'index.html?loadBook=true';
                }, 1000);

            } catch (error) {
                console.error("Error parsing JSON file:", error);
                notifications.error("Error loading book: " + error.message);
            }
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
            document.querySelectorAll('[name="cover-type"]').forEach(radio => {
                radio.closest('.cover-option').classList.remove('selected');
            });
            this.closest('.cover-option').classList.add('selected');
            bookData.coverType = 'color';
        });

        document.getElementById('cover-image').addEventListener('change', function () {
            document.querySelectorAll('[name="cover-type"]').forEach(radio => {
                radio.closest('.cover-option').classList.remove('selected');
            });
            this.closest('.cover-option').classList.add('selected');
            bookData.coverType = 'image';
        });

        document.getElementById('back-cover-color').addEventListener('change', function () {
            document.querySelectorAll('[name="back-cover-type"]').forEach(radio => {
                radio.closest('.cover-option').classList.remove('selected');
            });
            this.closest('.cover-option').classList.add('selected');
            bookData.backCoverType = 'color';
        });

        document.getElementById('back-cover-image').addEventListener('change', function () {
            document.querySelectorAll('[name="back-cover-type"]').forEach(radio => {
                radio.closest('.cover-option').classList.remove('selected');
            });
            this.closest('.cover-option').classList.add('selected');
            bookData.backCoverType = 'image';
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
        coverColorPreview.style.backgroundColor = this.value;
        updateCoverPreview();
    });

    document.getElementById('cover-color').addEventListener('change', function () {
        if (this.checked) {
            bookData.coverType = 'color';
            document.querySelectorAll('[name="cover-type"]').forEach(radio => {
                radio.closest('.cover-option').classList.remove('selected');
            });
            this.closest('.cover-option').classList.add('selected');

            updateCoverPreview();
        }
    });

    backCoverColorInput.addEventListener('input', function () {
        bookData.backCoverColor = this.value;
        backCoverColorPreview.style.backgroundColor = this.value;
        updateBackCoverPreview();
    });

    document.getElementById('back-cover-color').addEventListener('change', function () {
        if (this.checked) {
            bookData.backCoverType = 'color';
            document.querySelectorAll('[name="back-cover-type"]').forEach(radio => {
                radio.closest('.cover-option').classList.remove('selected');
            });
            this.closest('.cover-option').classList.add('selected');

            updateBackCoverPreview();
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
    
    console.log(`Creando libro con ${pagesCount} páginas internas (+ portada y contraportada)`);
    
    const coverType = document.getElementById('cover-color').checked ? 'color' : 'image';
    const coverColor = document.getElementById('wizard-cover-color').value || '#DC143C';
    const coverImage = coverImageData || '';
    
    const backCoverType = document.getElementById('back-cover-color').checked ? 'color' : 'image';
    const backCoverColor = document.getElementById('wizard-back-cover-color').value || '#DC143C';
    const backCoverImage = backCoverImageData || '';

    const pages = [];
    
    pages.push({
        name: "Cover",
        width: bookWidth,
        height: bookHeight,
        backgroundColor: coverType === 'color' ? coverColor : 'transparent',
        backgroundImage: coverType === 'image' ? coverImage : '',
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
        backgroundColor: backCoverType === 'color' ? backCoverColor : 'transparent',
        backgroundImage: backCoverType === 'image' ? backCoverImage : '',
        alignment: "center",
        contentHtml: ""
    });
    
    const bookData = {
        bookName: bookName,
        bookWidth: bookWidth,
        bookHeight: bookHeight,
        coverColor: coverColor,
        backCoverColor: backCoverColor,
        coverType: coverType,
        coverImage: coverImage,
        backCoverType: backCoverType,
        backCoverImage: backCoverImage,
        pageCount: pagesCount,
        pages: pages
    };
    
    localStorage.setItem('newBookWizardData', JSON.stringify(bookData));
    
    console.log(`Se han guardado en localStorage ${pages.length} páginas`);
    console.log('Datos de libro guardados:', bookData);
    
    sessionStorage.setItem('fromWelcome', 'true');
    
    setTimeout(() => {
        window.location.href = 'index.html?newBook=true';
    }, 100);
}