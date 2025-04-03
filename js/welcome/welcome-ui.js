/**
 * Welcome UI Functionality
 * Handles UI interactions on the welcome screen
 */
document.addEventListener('DOMContentLoaded', function () {
    const widthInput = document.getElementById('wizard-book-width');
    const heightInput = document.getElementById('wizard-book-height');
    const presetBtns = document.querySelectorAll('.preset-btn');

    function validateNumberInput(input) {
        input.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');

            const value = parseInt(this.value) || 0;

            if (this.id === 'wizard-book-width') {
                if (value > 800) {
                    this.value = '800';
                } else if (value < 200) {
                    if (this.value.length >= 3) {
                        this.value = '200';
                    }
                }
            } else if (this.id === 'wizard-book-height') {
                if (value > 700) {
                    this.value = '700';
                } else if (value < 200) {
                    if (this.value.length >= 3) {
                        this.value = '200';
                    }
                }
            }

            updatePreview();
        });

        input.addEventListener('blur', function () {
            if (this.value === '' || parseInt(this.value) < 200) {
                this.value = '200';
            } else if (this.id === 'wizard-book-height' && parseInt(this.value) > 700) {
                this.value = '700';
            } else if (this.id === 'wizard-book-width' && parseInt(this.value) > 800) {
                this.value = '800';
            }
            updatePreview();
        });
    }

    validateNumberInput(widthInput);
    validateNumberInput(heightInput);

    presetBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            presetBtns.forEach(b => b.classList.remove('active'));

            this.classList.add('active');

            widthInput.value = this.dataset.width;
            heightInput.value = this.dataset.height;

            updatePreview();
        });
    });

    function updatePreview() {
        const previewEl = document.getElementById('dimension-preview');
        const width = parseInt(widthInput.value) || 350;
        const height = parseInt(heightInput.value) || 400;

        previewEl.style.width = (width / 2) + 'px';
        previewEl.style.height = (height / 2) + 'px';

        presetBtns.forEach(btn => {
            if (parseInt(btn.dataset.width) === width &&
                parseInt(btn.dataset.height) === height) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    const newBookBtn = document.getElementById('new-book-btn');
    const welcomeContainer = document.querySelector('.welcome-container');
    const wizardContainer = document.querySelector('.wizard-container');
    const closeWizardBtn = document.getElementById('close-wizard-btn');

    newBookBtn.addEventListener('click', function () {
        welcomeContainer.classList.add('fade-out');

        setTimeout(() => {
            welcomeContainer.style.display = 'none';
            wizardContainer.style.display = 'flex';

            void wizardContainer.offsetWidth;

            wizardContainer.classList.add('fade-in');
            setTimeout(() => {
                document.getElementById('wizard-book-name').focus();
            }, 300);
        }, 500);
    });

    closeWizardBtn.addEventListener('click', function () {
        wizardContainer.classList.remove('fade-in');

        setTimeout(() => {
            wizardContainer.style.display = 'none';
            welcomeContainer.style.display = 'flex';

            void welcomeContainer.offsetWidth;

            welcomeContainer.classList.remove('fade-out');
        }, 300);
    });

    updatePreview();

    const radioInputs = document.querySelectorAll('.cover-option input[type="radio"]');

    radioInputs.forEach(input => {
        input.addEventListener('change', function () {
            document.querySelectorAll('.cover-option').forEach(option => {
                option.classList.remove('selected');
            });

            this.closest('.cover-option').classList.add('selected');
        });

        if (input.checked) {
            input.closest('.cover-option').classList.add('selected');
        }
    });

    function enhanceStepTransition() {
        const steps = document.querySelectorAll('.wizard-step');

        steps.forEach(step => {
            step.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            step.style.transformOrigin = 'center center';
        });
    }

    enhanceStepTransition();

    const book3D = document.querySelector('.book-preview-3d .book');
    if (book3D) {
        book3D.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.5)';
        book3D.style.willChange = 'transform';
    }

    function setupColorObservers() {
        const frontColorPicker = document.getElementById('wizard-cover-color');
        if (frontColorPicker) {
            ['input', 'change'].forEach(evt => {
                frontColorPicker.addEventListener(evt, function () {
                    updateAllFrontCoverElements(this.value);
                    if (typeof updatePagesVisual === 'function') {
                        updatePagesVisual();
                    }
                });
            });

            function updateAllFrontCoverElements(color) {
                const display = document.querySelector('.color-picker-display');
                if (display) display.style.backgroundColor = color;

                const preview = document.querySelector('.color-preview');
                if (preview) {
                    preview.style.setProperty('--preview-color', color);
                    preview.style.backgroundColor = color;
                }

                const frontPreview = document.querySelector('.book-preview-3d .front');
                if (frontPreview) {
                    frontPreview.style.backgroundColor = color;
                    frontPreview.style.backgroundImage = '';
                }

                const book3d = document.querySelector('.book-preview-3d');
                if (book3d) book3d.style.setProperty('--front-color', color);

                document.querySelectorAll('.front-preview .book-cover').forEach(cover => {
                    cover.style.backgroundColor = color;
                    cover.style.backgroundImage = '';
                });

                const coverPage = document.querySelector('.pages-visual .cover');
                if (coverPage) {
                    coverPage.style.backgroundColor = color;
                    coverPage.style.backgroundImage = '';
                }

                if (window.bookData) window.bookData.coverColor = color;
            }
        }

    }

    setupColorObservers();
});