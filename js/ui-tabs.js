/**
 * UI Tabs System
 * Manages tab navigation and panel switching with smooth animations
 */

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            tabPanels.forEach(panel => {
                if (panel.id === tabId) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });
    
    enhanceUIComponents();
});

function enhanceUIComponents() {
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        if (input.id === 'pageBgColor') return;
        
        const previewEl = input.nextElementSibling;
        if (previewEl && previewEl.classList.contains('color-preview')) {
            input.addEventListener('input', function() {
                previewEl.style.backgroundColor = this.value;
                
                if (this.id === 'coverColorInput' && pages.length > 0) {
                    bookData.coverColor = this.value;
                    
                    if (currentPageIndex === 0) {
                        pages[0].backgroundColor = this.value;
                        const pageBgColor = document.getElementById('pageBgColor');
                        if (pageBgColor) {
                            pageBgColor.value = this.value;
                            const bgPreview = pageBgColor.nextElementSibling;
                            if (bgPreview && bgPreview.classList.contains('color-preview')) {
                                bgPreview.style.backgroundColor = this.value;
                            }
                        }
                    }
                    
                    updateFlipBook();
                }
                else if (this.id === 'backCoverColorInput' && pages.length > 0) {
                    bookData.backCoverColor = this.value;
                    
                    if (currentPageIndex === pages.length - 1) {
                        pages[pages.length - 1].backgroundColor = this.value;
                        const pageBgColor = document.getElementById('pageBgColor');
                        if (pageBgColor) {
                            pageBgColor.value = this.value;
                            const bgPreview = pageBgColor.nextElementSibling;
                            if (bgPreview && bgPreview.classList.contains('color-preview')) {
                                bgPreview.style.backgroundColor = this.value;
                            }
                        }
                    }
                    
                    updateFlipBook();
                }
                else if (this.id === 'editorColorInput') {
                    bookData.editorColor = this.value;
                    updateEditorColor();
                }
            });
        }
    });
    
    const bgImageInput = document.getElementById('bg-image-input');
    const imagePreview = document.getElementById('image-preview');
    const noImageMessage = document.getElementById('no-image-message');
    
    if (bgImageInput && imagePreview && noImageMessage) {
        updateImagePreviewVisibility();
        
        bgImageInput.addEventListener('change', function(event) {
            if (event.target.files && event.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.innerHTML = '';
                    imagePreview.style.backgroundImage = `url(${e.target.result})`;
                    updateImagePreviewVisibility();
                    
                    updateRemoveImageButtonState();
                };
                
                reader.readAsDataURL(event.target.files[0]);
            }
        });
    }
    
    function updateImagePreviewVisibility() {
        if (imagePreview.style.backgroundImage && imagePreview.style.backgroundImage !== 'none') {
            noImageMessage.style.display = 'none';
        } else {
            noImageMessage.style.display = 'block';
        }
        
        updateRemoveImageButtonState();
    }
    
    setupPageListInteractions();
}

function setupPageListInteractions() {
    const pageItems = document.querySelectorAll('.page-item');
    
    pageItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            pageItems.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            if (typeof loadPageIntoEditor === 'function') {
                loadPageIntoEditor(index);
            }
        });
    });
}

window.setupPageListInteractions = setupPageListInteractions;
