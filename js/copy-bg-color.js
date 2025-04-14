/**
 * Copy Background Color Feature
 * Allows users to copy background colors from one page to multiple target pages
 */

class BackgroundColorCopier {
    constructor() {
        this.dialog = document.getElementById('copy-bg-color-dialog');
        this.sourcePageSelect = document.getElementById('source-page-select');
        this.sourceColorPreview = document.getElementById('source-color-preview');
        this.sourceColorHex = document.getElementById('source-color-hex');
        this.sourcePageNum = document.getElementById('source-page-num');
        this.pagesSelectionContainer = document.getElementById('pages-selection-container');
        
        this.closeBtnElement = document.getElementById('close-copy-bg-dialog-btn');
        this.cancelBtnElement = document.getElementById('cancel-copy-bg-btn');
        this.nextBtnElement = document.getElementById('next-copy-bg-btn');
        this.backBtnElement = document.getElementById('back-copy-bg-btn');
        this.applyBtnElement = document.getElementById('apply-copy-bg-btn');
        
        this.step1Element = document.querySelector('.copy-bg-step-1');
        this.step2Element = document.querySelector('.copy-bg-step-2');
        
        this.selectAllExceptCoversBtn = document.getElementById('select-all-except-covers');
        this.selectAllWithCoversBtn = document.getElementById('select-all-with-covers');
        this.selectNoneBtn = document.getElementById('select-none');
        this.selectCustomBtn = document.getElementById('select-custom');
        
        this.selectedSourcePageIndex = -1;
        this.selectedTargetPages = [];
        this.currentStep = 1;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('copy-bg-color-btn').addEventListener('click', () => this.showDialog());
        
        this.closeBtnElement.addEventListener('click', () => this.hideDialog());
        this.cancelBtnElement.addEventListener('click', () => this.hideDialog());
        this.nextBtnElement.addEventListener('click', () => this.goToNextStep());
        this.backBtnElement.addEventListener('click', () => this.goToPreviousStep());
        this.applyBtnElement.addEventListener('click', () => this.applyColorToSelectedPages());
        
        this.sourcePageSelect.addEventListener('change', () => this.handleSourcePageChange());
        
        this.selectAllExceptCoversBtn.addEventListener('click', () => this.selectAllExceptCovers());
        this.selectAllWithCoversBtn.addEventListener('click', () => this.selectAllWithCovers());
        this.selectNoneBtn.addEventListener('click', () => this.selectNone());
        this.selectCustomBtn.addEventListener('click', () => this.toggleCustomSelection());
    }

    showDialog() {
        this.currentStep = 1;
        this.selectedSourcePageIndex = -1;
        this.selectedTargetPages = [];
        
        this.step1Element.style.display = 'block';
        this.step2Element.style.display = 'none';
        
        this.nextBtnElement.style.display = 'block';
        this.backBtnElement.style.display = 'none';
        this.applyBtnElement.style.display = 'none';
        
        this.ensureAccessToPages();
        
        this.populateSourcePageOptions();
        
        this.dialog.style.display = 'flex';
        setTimeout(() => {
            this.dialog.classList.add('show');
        }, 10);
    }

    hideDialog() {
        this.dialog.classList.remove('show');
        setTimeout(() => {
            this.dialog.style.display = 'none';
        }, 300);
    }

    ensureAccessToPages() {
        if (!window.pages || !Array.isArray(window.pages) || window.pages.length === 0) {
            console.log("Pages not directly accessible, trying to acquire from the current editor context");
            
            if (typeof pages !== 'undefined' && Array.isArray(pages) && pages.length > 0) {
                window.pages = pages;
                console.log("Successfully acquired pages from global scope:", window.pages.length);
            } else {
                console.error("Failed to access pages array");
            }
        } else {
            console.log("Pages array already accessible:", window.pages.length);
        }
    }

    populateSourcePageOptions() {
        this.sourcePageSelect.innerHTML = '';
        
        if (!window.pages || !Array.isArray(window.pages) || window.pages.length === 0) {
            const option = document.createElement('option');
            option.value = -1;
            option.textContent = 'No pages available';
            this.sourcePageSelect.appendChild(option);
            return;
        }
        
        const placeholderOption = document.createElement('option');
        placeholderOption.value = -1;
        placeholderOption.textContent = 'Select a page...';
        placeholderOption.selected = true;
        placeholderOption.disabled = true;
        this.sourcePageSelect.appendChild(placeholderOption);
        
        window.pages.forEach((page, index) => {
            const option = document.createElement('option');
            option.value = index;
            
            if (index === 0) {
                option.textContent = 'Front Cover';
            } else if (index === window.pages.length - 1) {
                option.textContent = 'Back Cover';
            } else {
                option.textContent = `Page ${index}`;
            }
            
            this.sourcePageSelect.appendChild(option);
        });
        
        this.sourceColorPreview.style.backgroundColor = 'transparent';
        this.sourceColorHex.textContent = '';
    }

    handleSourcePageChange() {
        if (!window.pages || !Array.isArray(window.pages) || window.pages.length === 0) {
            return;
        }
        
        const selectedIndex = parseInt(this.sourcePageSelect.value, 10);
        if (selectedIndex >= 0 && selectedIndex < window.pages.length) {
            this.selectedSourcePageIndex = selectedIndex;
            const page = window.pages[selectedIndex];
            
            let bgColor;
            
            if (selectedIndex === 0) {
                bgColor = page.backgroundColor || 
                          (window.bookData && window.bookData.coverColor) || 
                          '#DC143C';
            } 
            else if (selectedIndex === window.pages.length - 1) {
                bgColor = page.backgroundColor || 
                          (window.bookData && window.bookData.backCoverColor) || 
                          '#DC143C';
            } 
            else {
                bgColor = page.backgroundColor || '#FFFFFF';
            }
            
            this.sourceColorPreview.style.backgroundColor = bgColor;
            this.sourceColorHex.textContent = bgColor.toUpperCase();
        }
    }

    goToNextStep() {
        if (this.selectedSourcePageIndex < 0) return;
        
        if (!window.pages || !Array.isArray(window.pages)) {
            return;
        }
        
        this.currentStep = 2;
        
        this.step1Element.style.display = 'none';
        this.step2Element.style.display = 'block';
        
        this.nextBtnElement.style.display = 'none';
        this.backBtnElement.style.display = 'block';
        this.applyBtnElement.style.display = 'block';
        
        let sourcePageLabel;
        if (this.selectedSourcePageIndex === 0) {
            sourcePageLabel = 'Front Cover';
        } else if (this.selectedSourcePageIndex === window.pages.length - 1) {
            sourcePageLabel = 'Back Cover';
        } else {
            sourcePageLabel = `Page ${this.selectedSourcePageIndex}`;
        }
        this.sourcePageNum.textContent = sourcePageLabel;
        
        this.populatePageCheckboxes();
    }

    goToPreviousStep() {
        this.currentStep = 1;
        
        this.step1Element.style.display = 'block';
        this.step2Element.style.display = 'none';
        
        this.nextBtnElement.style.display = 'block';
        this.backBtnElement.style.display = 'none';
        this.applyBtnElement.style.display = 'none';
    }

    populatePageCheckboxes() {
        this.pagesSelectionContainer.innerHTML = '';
        this.selectedTargetPages = [];
        
        if (!window.pages || !Array.isArray(window.pages) || window.pages.length === 0) {
            const noDataMessage = document.createElement('div');
            noDataMessage.textContent = 'No pages available to select from.';
            noDataMessage.style.padding = '10px';
            noDataMessage.style.color = '#BFBFBF';
            this.pagesSelectionContainer.appendChild(noDataMessage);
            return;
        }
        
        window.pages.forEach((page, index) => {
            
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'page-checkbox-container';
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';
            checkboxContainer.style.marginBottom = '8px';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `page-checkbox-${index}`;
            checkbox.value = index;
            checkbox.style.marginRight = '8px';
            
            const label = document.createElement('label');
            label.htmlFor = `page-checkbox-${index}`;
            
            if (index === 0) {
                label.textContent = 'Front Cover';
            } else if (index === window.pages.length - 1) {
                label.textContent = 'Back Cover';
            } else {
                label.textContent = `Page ${index}`;
            }
            
            if (index === this.selectedSourcePageIndex) {
                label.style.fontWeight = 'bold';
                label.textContent += ' (source)';
                checkbox.disabled = true;
            }
            
            const colorPreview = document.createElement('div');
            colorPreview.style.width = '15px';
            colorPreview.style.height = '15px';
            colorPreview.style.backgroundColor = page.backgroundColor || '#FFFFFF';
            colorPreview.style.border = '1px solid #3E3E42';
            colorPreview.style.borderRadius = '3px';
            colorPreview.style.display = 'inline-block';
            colorPreview.style.marginLeft = '10px';
            colorPreview.style.verticalAlign = 'middle';
            
            const currentColorText = document.createElement('span');
            currentColorText.textContent = page.backgroundColor || '#FFFFFF';
            currentColorText.style.fontSize = '12px';
            currentColorText.style.marginLeft = '5px';
            currentColorText.style.color = '#BFBFBF';
            currentColorText.style.fontFamily = 'monospace';
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            checkboxContainer.appendChild(colorPreview);
            checkboxContainer.appendChild(currentColorText);
            
            this.pagesSelectionContainer.appendChild(checkboxContainer);
            
            checkbox.addEventListener('change', () => this.handleCheckboxChange(index, checkbox.checked));
        });
        
        this.selectAllExceptCovers();
    }

    handleCheckboxChange(pageIndex, isChecked) {
        if (isChecked) {
            if (!this.selectedTargetPages.includes(pageIndex)) {
                this.selectedTargetPages.push(pageIndex);
            }
        } else {
            this.selectedTargetPages = this.selectedTargetPages.filter(index => index !== pageIndex);
        }
    }

    selectAllExceptCovers() {
        if (!window.pages || !Array.isArray(window.pages)) {
            return;
        }
        
        const checkboxes = this.pagesSelectionContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const pageIndex = parseInt(checkbox.value, 10);
            const isFirstOrLastPage = (pageIndex === 0 || pageIndex === window.pages.length - 1);
            checkbox.checked = !isFirstOrLastPage;
            this.handleCheckboxChange(pageIndex, checkbox.checked);
        });
    }

    selectAllWithCovers() {
        if (!window.pages || !Array.isArray(window.pages)) {
            return;
        }
        
        const checkboxes = this.pagesSelectionContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            const pageIndex = parseInt(checkbox.value, 10);
            this.handleCheckboxChange(pageIndex, true);
        });
    }

    selectNone() {
        const checkboxes = this.pagesSelectionContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const pageIndex = parseInt(checkbox.value, 10);
            this.handleCheckboxChange(pageIndex, false);
        });
    }

    toggleCustomSelection() {
        this.selectCustomBtn.classList.add('active');
        setTimeout(() => {
            this.selectCustomBtn.classList.remove('active');
        }, 300);
    }

    applyColorToSelectedPages() {
        if (this.selectedSourcePageIndex < 0 || this.selectedTargetPages.length === 0) {
            return;
        }
        
        if (!window.pages || !Array.isArray(window.pages) || window.pages.length === 0) {
            return;
        }
        
        const canSaveChanges = typeof window.saveEditorChanges === 'function';
        const canUpdateFlipBook = typeof window.updateFlipBook === 'function';
        const canShowNotifications = window.notifications && typeof window.notifications.success === 'function';
        const canApplyBgColor = typeof window.applyBackgroundColor === 'function';
        
        const sourcePage = window.pages[this.selectedSourcePageIndex];
        let sourceColor = '#FFFFFF';
        
        if (this.selectedSourcePageIndex === 0) {
            sourceColor = (sourcePage && sourcePage.backgroundColor) || 
                         (window.bookData && window.bookData.coverColor) || 
                         '#DC143C';
        } else if (this.selectedSourcePageIndex === window.pages.length - 1) {
            sourceColor = (sourcePage && sourcePage.backgroundColor) || 
                         (window.bookData && window.bookData.backCoverColor) || 
                         '#DC143C';
        } else {
            sourceColor = (sourcePage && sourcePage.backgroundColor) || '#FFFFFF';
        }
        
        let appliedCount = 0;
        this.selectedTargetPages.forEach(targetIndex => {
            if (targetIndex >= 0 && targetIndex < window.pages.length && targetIndex !== this.selectedSourcePageIndex) {
                window.pages[targetIndex].backgroundColor = sourceColor;
                appliedCount++;
                
                if (targetIndex === 0) {
                    this.updateCoverColor(sourceColor);
                } else if (targetIndex === window.pages.length - 1) {
                    this.updateBackCoverColor(sourceColor);
                }
                
                if (targetIndex === window.currentPageIndex) {
                    this.updateCurrentPageUI(sourceColor);
                }
            }
        });
        
        if (canApplyBgColor) {
            window.applyBackgroundColor();
        }
        
        if (canSaveChanges) {
            window.saveEditorChanges();
        }
        
        if (canUpdateFlipBook) {
            window.updateFlipBook();
        }
        
        this.hideDialog();
        
        if (canShowNotifications) {
            window.notifications.success(`Background color applied to ${appliedCount} page${appliedCount !== 1 ? 's' : ''}`);
        }
    }
    
    updateCurrentPageUI(color) {
        const pageBgColor = document.getElementById('pageBgColor');
        if (pageBgColor) {
            pageBgColor.value = color;
            const colorPreview = pageBgColor.nextElementSibling;
            if (colorPreview && colorPreview.classList.contains('color-preview')) {
                colorPreview.style.backgroundColor = color;
            }
        }
        
        const pageElements = document.querySelectorAll('.page');
        pageElements.forEach(page => {
            const index = parseInt(page.getAttribute('data-page-index') || page.getAttribute('data-index'));
            if (index === window.currentPageIndex) {
                page.style.backgroundColor = color;
            }
        });
        
        if (typeof window.applyBackgroundColor === 'function') {
            window.applyBackgroundColor();
        }
    }
    
    updateCoverColor(color) {
        if (!window.bookData) return;
        
        window.bookData.coverColor = color;
        
        const coverColorInput = document.getElementById('coverColorInput');
        if (coverColorInput) {
            coverColorInput.value = color;
            const colorPreview = coverColorInput.nextElementSibling;
            if (colorPreview && colorPreview.classList.contains('color-preview')) {
                colorPreview.style.backgroundColor = color;
            }
        }
    }
    
    updateBackCoverColor(color) {
        if (!window.bookData) return;
        
        window.bookData.backCoverColor = color;
        
        const backCoverColorInput = document.getElementById('backCoverColorInput');
        if (backCoverColorInput) {
            backCoverColorInput.value = color;
            const colorPreview = backCoverColorInput.nextElementSibling;
            if (colorPreview && colorPreview.classList.contains('color-preview')) {
                colorPreview.style.backgroundColor = color;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.backgroundColorCopier = new BackgroundColorCopier();
});