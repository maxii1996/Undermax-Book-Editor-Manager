function saveSettings() {
}

function loadSettings() {
    const bookNameEl = document.getElementById("bookName");
    const bookWidthEl = document.getElementById("bookWidth");  
    const bookHeightEl = document.getElementById("bookHeight");
    const coverColorInputEl = document.getElementById("coverColorInput");
    const backCoverColorInputEl = document.getElementById("backCoverColorInput");
    const editorColorInputEl = document.getElementById("editorColorInput");
    
    if (bookNameEl) bookNameEl.value = bookData.bookName;
    if (bookWidthEl) bookWidthEl.value = bookData.bookWidth;
    if (bookHeightEl) bookHeightEl.value = bookData.bookHeight;
    if (coverColorInputEl) coverColorInputEl.value = bookData.coverColor;
    if (backCoverColorInputEl) backCoverColorInputEl.value = bookData.backCoverColor;
    if (editorColorInputEl) editorColorInputEl.value = bookData.editorColor;

    updateEditorColor();
}

function ensureBasicPages() {
    if (pages.length < 2) {
        pages = [];
        pages.push({
            name: "Cover",
            width: bookData.bookWidth,
            height: bookData.bookHeight,
            backgroundColor: bookData.coverColor,
            backgroundImage: "",
            alignment: "",
            contentHtml: "<p>Your Awesome Title Goes Here</p>"
        });
        pages.push({
            name: "Back Cover",
            width: bookData.bookWidth,
            height: bookData.bookHeight,
            backgroundColor: bookData.backCoverColor,
            backgroundImage: "",
            alignment: "",
            contentHtml: "<p>The End of Your Book Appears Here</p>"
        });
    }
}

function addMiddlePage() {
    saveEditorChanges();
    const bw = parseInt(document.getElementById("bookWidth").value, 10) || 300;
    const bh = parseInt(document.getElementById("bookHeight").value, 10) || 400;
    pages.splice(pages.length - 1, 0, {
        name: "Page " + (pages.length - 1),
        width: bw,
        height: bh,
        backgroundColor: "#FFFFFF",
        backgroundImage: "",
        alignment: "left",
        contentHtml: ""
    });
    currentPageIndex = pages.length - 2;
    renderPageList();
    loadPageIntoEditor(currentPageIndex);
    updateFlipBook();
}

function renderPageList() {
    const list = document.getElementById("page-list");
    list.innerHTML = "";

    for (let i = 0; i < pages.length; i++) {
        const div = document.createElement("div");
        div.className = "page-item";
        const isFirstPage = i === 0;
        const isLastPage = i === pages.length - 1;
        const isMiddlePage = !isFirstPage && !isLastPage;

        const pageName = document.createElement("span");
        pageName.className = "page-name";

        if (isFirstPage) pageName.textContent = "Cover";
        else if (isLastPage) pageName.textContent = "Back Cover";
        else pageName.textContent = "Page " + i;

        div.appendChild(pageName);

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "page-actions";

        const moveUpBtn = document.createElement("button");
        moveUpBtn.className = `page-btn move-up ${isFirstPage || isLastPage ? 'disabled' : ''}`;
        moveUpBtn.innerHTML = '<i class="ri-arrow-up-s-line"></i>';
        moveUpBtn.title = "Move page up";

        if (isMiddlePage && i > 1) {
            moveUpBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                movePageUp(i);
            });
        } else {
            moveUpBtn.disabled = true;
        }

        const moveDownBtn = document.createElement("button");
        moveDownBtn.className = `page-btn move-down ${isFirstPage || isLastPage ? 'disabled' : ''}`;
        moveDownBtn.innerHTML = '<i class="ri-arrow-down-s-line"></i>';
        moveDownBtn.title = "Move page down";

        if (isMiddlePage && i < pages.length - 2) {
            moveDownBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                movePageDown(i);
            });
        } else {
            moveDownBtn.disabled = true;
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.className = `page-btn delete ${isFirstPage || isLastPage ? 'disabled' : ''}`;
        deleteBtn.innerHTML = '<i class="ri-delete-bin-6-line"></i>';
        deleteBtn.title = "Delete page";

        if (isMiddlePage) {
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                showDeleteConfirmation(i);
            });
        } else {
            deleteBtn.disabled = true;
        }

        actionsDiv.appendChild(moveUpBtn);
        actionsDiv.appendChild(moveDownBtn);
        actionsDiv.appendChild(deleteBtn);

        div.appendChild(actionsDiv);

        if (i === currentPageIndex) div.classList.add("selected");

        div.addEventListener("click", () => {
            saveEditorChanges();
            loadPageIntoEditor(i);
            renderPageList();
            updateFlipBook();
        });

        list.appendChild(div);
    }
}

function movePageUp(index) {
    if (index <= 1 || index >= pages.length - 1) return;

    saveEditorChanges();

    const temp = pages[index];
    pages[index] = pages[index - 1];
    pages[index - 1] = temp;

    updatePageNames();

    if (currentPageIndex === index) {
        currentPageIndex--;
    } else if (currentPageIndex === index - 1) {
        currentPageIndex++;
    }

    renderPageList();
    loadPageIntoEditor(currentPageIndex);
    updateFlipBook();
    notifications.success("Page moved up");
}

function movePageDown(index) {
    if (index <= 0 || index >= pages.length - 2) return;

    saveEditorChanges();

    const temp = pages[index];
    pages[index] = pages[index + 1];
    pages[index + 1] = temp;

    updatePageNames();

    if (currentPageIndex === index) {
        currentPageIndex++;
    } else if (currentPageIndex === index + 1) {
        currentPageIndex--;
    }

    renderPageList();
    loadPageIntoEditor(currentPageIndex);
    updateFlipBook();
    notifications.success("Page moved down");
}

function deletePage(index) {
    if (index <= 0 || index >= pages.length - 1) return;

    pages.splice(index, 1);

    updatePageNames();

    if (currentPageIndex >= index) {
        currentPageIndex = Math.max(currentPageIndex - 1, 0);
    }

    renderPageList();
    loadPageIntoEditor(currentPageIndex);
    updateFlipBook();
    notifications.success("Page deleted");
}

function updatePageNames() {
    for (let i = 0; i < pages.length; i++) {
        if (i === 0) {
            pages[i].name = "Cover";
        } else if (i === pages.length - 1) {
            pages[i].name = "Back Cover";
        } else {
            pages[i].name = "Page " + i;
        }
    }
}

function showDeleteConfirmation(index) {
    const dialog = document.getElementById('delete-page-dialog');
    const message = document.getElementById('delete-page-message');

    message.textContent = `This will permanently delete Page ${index}. This action cannot be undone.`;

    dialog.style.display = 'flex';
    setTimeout(() => {
        dialog.classList.add('show');
    }, 10);

    document.getElementById('confirm-delete-btn').setAttribute('data-page-index', index);
}

window.showDeleteConfirmation = showDeleteConfirmation;

document.addEventListener('DOMContentLoaded', function () {
    const closeDeleteDialogBtn = document.getElementById('close-delete-dialog-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    function hideDeleteDialog() {
        const dialog = document.getElementById('delete-page-dialog');
        dialog.classList.remove('show');
        setTimeout(() => {
            dialog.style.display = 'none';
        }, 300);
    }

    if (closeDeleteDialogBtn) {
        closeDeleteDialogBtn.addEventListener('click', hideDeleteDialog);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteDialog);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            const pageIndex = parseInt(this.getAttribute('data-page-index'), 10);
            deletePage(pageIndex);
            hideDeleteDialog();
        });
    }
});

function saveEditorChanges() {
    if (pages.length === 0) return;

    const minWidth = BOOK_CONSTANTS.MIN_WIDTH;
    const minHeight = BOOK_CONSTANTS.MIN_HEIGHT;
    const maxWidth = BOOK_CONSTANTS.MAX_WIDTH;
    const maxHeight = BOOK_CONSTANTS.MAX_HEIGHT;

    const bookNameEl = document.getElementById("bookName");
    const bookWidthEl = document.getElementById("bookWidth");
    const bookHeightEl = document.getElementById("bookHeight");
    const pageBgColorEl = document.getElementById("pageBgColor");
    const pageBgImageEl = document.getElementById("pageBgImage");
    const editorColorInputEl = document.getElementById("editorColorInput");

    if (bookNameEl) bookData.bookName = bookNameEl.value || "";

    let width = bookWidthEl ? parseInt(bookWidthEl.value, 10) : 300;
    let height = bookHeightEl ? parseInt(bookHeightEl.value, 10) : 400;

    width = Math.max(minWidth, Math.min(width, maxWidth));
    height = Math.max(minHeight, Math.min(height, maxHeight));

    bookData.bookWidth = width;
    bookData.bookHeight = height;
    bookData.editorColor = editorColorInputEl ? editorColorInputEl.value : '#FFFFFF';

    const p = pages[currentPageIndex];
    p.width = bookData.bookWidth;
    p.height = bookData.bookHeight;

    if (pageBgColorEl) {
        p.backgroundColor = pageBgColorEl.value;
        
        if (currentPageIndex === 0) {
            bookData.coverColor = pageBgColorEl.value;
        } else if (currentPageIndex === pages.length - 1) {
            bookData.backCoverColor = pageBgColorEl.value;
        }
    }

    p.backgroundImage = document.getElementById("pageBgImage").textContent !== "No image selected" ?
        p.backgroundImage : "";

    if (editor) {
        p.contentHtml = editor.innerHTML;

        const paragraphs = editor.querySelectorAll('p');
        if (paragraphs.length > 0) {
            const textAlign = window.getComputedStyle(paragraphs[0]).textAlign;
            if (textAlign && textAlign !== 'start') {
                p.alignment = textAlign;
            } else {
                p.alignment = '';
            }
        }
    }
}

function updateAllPageDimensions() {
    let newWidth = parseInt(document.getElementById("bookWidth").value);
    let newHeight = parseInt(document.getElementById("bookHeight").value);

    newWidth = Math.max(BOOK_CONSTANTS.MIN_WIDTH, Math.min(BOOK_CONSTANTS.MAX_WIDTH, newWidth || BOOK_CONSTANTS.DEFAULT_WIDTH));
    newHeight = Math.max(BOOK_CONSTANTS.MIN_HEIGHT, Math.min(BOOK_CONSTANTS.MAX_HEIGHT, newHeight || BOOK_CONSTANTS.DEFAULT_HEIGHT));

    document.getElementById("bookWidth").value = newWidth;
    document.getElementById("bookHeight").value = newHeight;

    bookData.bookWidth = newWidth;
    bookData.bookHeight = newHeight;

    saveEditorChanges();

    showDimensionUpdateProgress();

    setTimeout(() => {
        pages.forEach((page, index) => {
            page.width = newWidth;
            page.height = newHeight;
            updateProgressDialog(index + 1, pages.length);
        });

        updateEditorSize(newWidth, newHeight);

        updateFlipBook();

        saveSettings();

        setTimeout(() => {
            hideDimensionUpdateProgress();

            if (event && event.type === 'click') {
                notifications.success("Dimensions applied to all pages successfully");
            }
        }, 500);
    }, 100);
}

document.addEventListener('DOMContentLoaded', function () {
    const applyButton = document.getElementById("applyDimensions");
    if (applyButton) {
        const newApplyButton = applyButton.cloneNode(true);
        applyButton.parentNode.replaceChild(newApplyButton, applyButton);

        newApplyButton.addEventListener("click", function (event) {
            updateAllPageDimensions();
            loadPageIntoEditor(currentPageIndex);
        });
    }
});

function showDimensionUpdateProgress() {
    let progressDialog = document.getElementById('dimension-update-progress');

    if (!progressDialog) {
        progressDialog = document.createElement('div');
        progressDialog.id = 'dimension-update-progress';
        progressDialog.className = 'custom-dialog';
        progressDialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>Applying Changes</h3>
                </div>
                <div class="dialog-body">
                    <p id="progress-message">Applying changes to pages: 0/${pages.length}</p>
                    <div class="progress-bar-container">
                        <div id="dimension-progress-bar" class="progress-bar"></div>
                    </div>
                    <p class="progress-note">Please wait...</p>
                </div>
            </div>
        `;
        document.body.appendChild(progressDialog);
    }

    progressDialog.style.display = 'flex';
    setTimeout(() => {
        progressDialog.classList.add('show');
    }, 10);
}

function updateProgressDialog(current, total) {
    const progressMessage = document.getElementById('progress-message');
    const progressBar = document.getElementById('dimension-progress-bar');

    if (progressMessage && progressBar) {
        progressMessage.textContent = `Applying changes to pages: ${current}/${total}`;
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

function hideDimensionUpdateProgress() {
    const progressDialog = document.getElementById('dimension-update-progress');

    if (progressDialog) {
        progressDialog.classList.remove('show');
        setTimeout(() => {
            progressDialog.style.display = 'none';
        }, 300);
    }
}

function resetDimensionsToDefault() {
    const defaultWidth = BOOK_CONSTANTS.DEFAULT_WIDTH;
    const defaultHeight = BOOK_CONSTANTS.DEFAULT_HEIGHT;
    const minWidth = BOOK_CONSTANTS.MIN_WIDTH;
    const minHeight = BOOK_CONSTANTS.MIN_HEIGHT;
    const maxWidth = BOOK_CONSTANTS.MAX_WIDTH;
    const maxHeight = BOOK_CONSTANTS.MAX_HEIGHT;

    let width = defaultWidth;
    let height = defaultHeight;

    width = Math.max(minWidth, Math.min(width, maxWidth));
    height = Math.max(minHeight, Math.min(height, maxHeight));

    document.getElementById("bookWidth").value = width;
    document.getElementById("bookHeight").value = height;

    bookData.bookWidth = width;
    bookData.bookHeight = height;

    updateAllPageDimensions();
}

function setupDimensionsListeners() {
    const bookWidthInput = document.getElementById("bookWidth");
    const bookHeightInput = document.getElementById("bookHeight");

    if (bookWidthInput) {
        bookWidthInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        bookWidthInput.addEventListener('blur', function () {
            let value = parseInt(this.value) || BOOK_CONSTANTS.DEFAULT_WIDTH;
            value = Math.max(BOOK_CONSTANTS.MIN_WIDTH, Math.min(BOOK_CONSTANTS.MAX_WIDTH, value));
            this.value = value;
        });
    }

    if (bookHeightInput) {
        bookHeightInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        bookHeightInput.addEventListener('blur', function () {
            let value = parseInt(this.value) || BOOK_CONSTANTS.DEFAULT_HEIGHT;
            value = Math.max(BOOK_CONSTANTS.MIN_HEIGHT, Math.min(BOOK_CONSTANTS.MAX_HEIGHT, value));
            this.value = value;
        });
    }

    document.getElementById("applyDimensions").addEventListener("click", function () {
        updateAllPageDimensions();
    });

    document.getElementById("resetDimensions").addEventListener("click", function () {
        resetDimensionsToDefault();
    });
    
    setupDimensionPresets();
}

function setupDimensionPresets() {
    const presetButtons = document.querySelectorAll('.dimension-presets.editor-presets .preset-btn');
    const bookWidthInput = document.getElementById("bookWidth");
    const bookHeightInput = document.getElementById("bookHeight");
    
    if (!presetButtons.length || !bookWidthInput || !bookHeightInput) return;
    
    function updateActivePreset() {
        const currentWidth = parseInt(bookWidthInput.value) || 0;
        const currentHeight = parseInt(bookHeightInput.value) || 0;
        
        presetButtons.forEach(btn => {
            const presetWidth = parseInt(btn.getAttribute('data-width')) || 0;
            const presetHeight = parseInt(btn.getAttribute('data-height')) || 0;
            
            if (currentWidth === presetWidth && currentHeight === presetHeight) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    updateActivePreset();
    
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const width = this.getAttribute('data-width');
            const height = this.getAttribute('data-height');
            
            if (bookWidthInput && bookHeightInput && width && height) {
                bookWidthInput.value = width;
                bookHeightInput.value = height;
                
                presetButtons.forEach(b => b.classList.remove('active'));
                
                this.classList.add('active');
                
                if (typeof updateAllPageDimensions === 'function') {
                    updateAllPageDimensions();
                }
            }
        });
    });
    
    if (bookWidthInput) {
        bookWidthInput.addEventListener('change', updateActivePreset);
    }
    
    if (bookHeightInput) {
        bookHeightInput.addEventListener('change', updateActivePreset);
    }
}

document.addEventListener('DOMContentLoaded', setupDimensionsListeners);

document.getElementById("applyDimensions").addEventListener("click", function (event) {
    updateAllPageDimensions();
    loadPageIntoEditor(currentPageIndex);
});

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (BookImageUtils.isFileTooLarge(file, 500)) {
        event.target.value = '';
        
        const sizeStr = BookImageUtils.formatFileSize(file.size);
        if (window.notifications) {
            window.notifications.error(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
        } else {
            alert(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
        }
        
        const imagePreview = document.getElementById("image-preview");
        if (imagePreview) {
            imagePreview.innerHTML = `<div class="image-error">File too large: ${sizeStr}.<br>Maximum allowed: 500KB</div>`;
            imagePreview.style.display = "flex";
            
            setTimeout(() => {
                imagePreview.style.display = "none";
                imagePreview.innerHTML = '';
            }, 5000);
        }
        
        return;
    }

    const imagePreview = document.getElementById("image-preview");
    if (imagePreview) {
        imagePreview.innerHTML = '<div class="image-loading">Processing image...</div>';
        imagePreview.style.display = "flex";
    }

    setTimeout(() => {
        const reader = new FileReader();
        reader.onload = function (e) {
            optimizeImage(e.target.result, (optimizedImage) => {
                document.getElementById("pageBgImage").textContent = file.name;
                pages[currentPageIndex].backgroundImage = optimizedImage;

                const imagePreview = document.getElementById("image-preview");
                if (imagePreview) {
                    imagePreview.innerHTML = '';
                    imagePreview.style.backgroundImage = `url(${optimizedImage})`;
                    imagePreview.style.display = "block";
                }

                requestAnimationFrame(() => {
                    updateRemoveImageButtonState();
                    updateFlipBook();
                });
            });
        };

        reader.readAsDataURL(file);
    }, 0);
    
    event.target.value = '';
}

function optimizeImage(dataUrl, callback) {
    const img = new Image();
    img.onload = function() {
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
    img.src = dataUrl;
}

function removeBackgroundImage() {
    if (pages.length === 0) return;

    pages[currentPageIndex].backgroundImage = '';

    requestAnimationFrame(() => {
        document.getElementById("pageBgImage").textContent = "No image selected";
        
        const imagePreview = document.getElementById("image-preview");
        if (imagePreview) {
            imagePreview.innerHTML = '';
            imagePreview.style.backgroundImage = '';
            imagePreview.style.display = "none";
        }

        applyBackgroundColor();
        
        saveEditorChanges();
        updateRemoveImageButtonState();
        updateFlipBook();
        notifications.info("Background image removed");
    });
}

function applyBackgroundColor() {
    if (pages.length === 0) return;
    
    const currentPage = pages[currentPageIndex];
    const backgroundColor = currentPage.backgroundColor || "#FFFFFF";
    
    const pageElements = document.querySelectorAll('.page');
    if (pageElements && pageElements.length > 0) {
        pageElements.forEach(page => {
            if (parseInt(page.getAttribute('data-index')) === currentPageIndex) {
                page.style.backgroundColor = backgroundColor;
            }
        });
    }
    
    const colorInput = document.getElementById('pageBgColor');
    if (colorInput) {
        colorInput.value = backgroundColor;
        const colorPreview = colorInput.parentElement.querySelector('.color-preview');
        if (colorPreview) {
            colorPreview.style.backgroundColor = backgroundColor;
        }
    }
}

function updateRemoveImageButtonState() {
    const removeImageBtn = document.getElementById("remove-image-btn");
    if (!removeImageBtn) return;

    if (pages[currentPageIndex] && pages[currentPageIndex].backgroundImage) {
        removeImageBtn.disabled = false;
        removeImageBtn.classList.remove('visually-disabled');
    } else {
        removeImageBtn.disabled = true;
        removeImageBtn.classList.add('visually-disabled');
    }
}

function setupPreviewToggleButtons() {
    const showColorBtn = document.getElementById('show-color-preview');
    const showImageBtn = document.getElementById('show-image-preview');
    
    if (!showColorBtn || !showImageBtn) return;
    
    showColorBtn.addEventListener('click', function() {
        showColorBtn.classList.add('active');
        showImageBtn.classList.remove('active');
        
        const pageElements = document.querySelectorAll('.page');
        pageElements.forEach(page => {
            const index = parseInt(page.getAttribute('data-page-index') || page.getAttribute('data-index'));
            if (index === currentPageIndex) {
                page.style.backgroundImage = '';
                
                const currentPage = pages[currentPageIndex];
                if (currentPage) {
                    page.style.backgroundColor = currentPage.backgroundColor || '#FFFFFF';
                }
            }
        });
    });
    
    showImageBtn.addEventListener('click', function() {
        showColorBtn.classList.remove('active');
        showImageBtn.classList.add('active');
        
        const pageElements = document.querySelectorAll('.page');
        pageElements.forEach(page => {
            const index = parseInt(page.getAttribute('data-page-index') || page.getAttribute('data-index'));
            if (index === currentPageIndex) {
                const currentPage = pages[currentPageIndex];
                if (currentPage && currentPage.backgroundImage) {
                    page.style.backgroundImage = `url(${currentPage.backgroundImage})`;
                }
            }
        });
    });
}

function loadPageIntoEditor(index) {
    currentPageIndex = index;

    const bookWidthEl = document.getElementById("bookWidth");
    const bookHeightEl = document.getElementById("bookHeight");
    const pageBgColorEl = document.getElementById("pageBgColor");
    const pageBgImageEl = document.getElementById("pageBgImage");
    const bookSettingsGroup = document.getElementById("book-settings-group");
    const pageBgTitle = document.getElementById("page-bg-title");

    if (bookWidthEl) bookWidthEl.value = bookData.bookWidth;
    if (bookHeightEl) bookHeightEl.value = bookData.bookHeight;

    const p = pages[index];
    
    if (!p) {
        console.error("Failed to load page at index:", index);
        notifications.error("Failed to load page. The page may be corrupted.");
        return;
    }

    if (pageBgTitle) {
        if (index === 0) {
            pageBgTitle.textContent = "Front Cover Background Color";
        } else if (index === pages.length - 1) {
            pageBgTitle.textContent = "Back Cover Background Color";
        } else {
            pageBgTitle.textContent = "Page Background Color";
        }
    }

    if (pageBgColorEl) {
        if (index === 0) {
            p.backgroundColor = p.backgroundColor || bookData.coverColor || BOOK_CONSTANTS.DEFAULT_COVER_COLOR;
            pageBgColorEl.value = p.backgroundColor;
            bookData.coverColor = p.backgroundColor;
        } else if (index === pages.length - 1) {
            p.backgroundColor = p.backgroundColor || bookData.backCoverColor || BOOK_CONSTANTS.DEFAULT_BACK_COVER_COLOR;
            pageBgColorEl.value = p.backgroundColor;
            bookData.backCoverColor = p.backgroundColor;
        } else {
            p.backgroundColor = p.backgroundColor || BOOK_CONSTANTS.DEFAULT_EDITOR_COLOR;
            pageBgColorEl.value = p.backgroundColor;
        }
        
        const colorPreview = pageBgColorEl.nextElementSibling;
        if (colorPreview && colorPreview.classList.contains('color-preview')) {
            colorPreview.style.backgroundColor = pageBgColorEl.value;
        }
    }

    if (typeof p.backgroundImage === 'string' && p.backgroundImage.trim() !== '') {
        try {
            if (pageBgImageEl) {
                if (p.backgroundImage.includes('data:')) {
                    pageBgImageEl.textContent = "Embedded image";
                } else {
                    pageBgImageEl.textContent = p.backgroundImage.split('/').pop();
                }
            }
            
            const imagePreview = document.getElementById("image-preview");
            if (imagePreview) {
                imagePreview.style.backgroundImage = `url(${p.backgroundImage})`;
                imagePreview.style.display = "block";
                imagePreview.innerHTML = '';
            }
            
            updateRemoveImageButtonState();
        } catch (e) {
            console.error("Error loading background image:", e);
            if (pageBgImageEl) pageBgImageEl.textContent = "Error loading image";
            
            p.backgroundImage = '';
            
            const imagePreview = document.getElementById("image-preview");
            if (imagePreview) {
                imagePreview.style.backgroundImage = '';
                imagePreview.style.display = "none";
            }
        }
    } else {
        if (pageBgImageEl) pageBgImageEl.textContent = "No image selected";
        
        const imagePreview = document.getElementById("image-preview");
        if (imagePreview) {
            imagePreview.style.backgroundImage = '';
            imagePreview.style.display = "none";
        }
    }

    if (bookSettingsGroup) bookSettingsGroup.style.display = "block";

    if (editor) {
        editor.innerHTML = p.contentHtml || "";
        updateEditorColor();
    }

    updateInfoBar();
    updateRemoveImageButtonState();
    updateFlipBook();

    setupPreviewToggleButtons();

    const showColorBtn = document.getElementById('show-color-preview');
    const showImageBtn = document.getElementById('show-image-preview');
    
    if (showColorBtn && showImageBtn) {
        if (p.backgroundImage) {
            const pageElements = document.querySelectorAll('.page');
            let hasVisibleImage = false;
            
            pageElements.forEach(page => {
                const pageIndex = parseInt(page.getAttribute('data-page-index') || page.getAttribute('data-index'));
                if (pageIndex === currentPageIndex && page.style.backgroundImage && page.style.backgroundImage !== 'none') {
                    hasVisibleImage = true;
                }
            });
            
            if (hasVisibleImage) {
                showColorBtn.classList.remove('active');
                showImageBtn.classList.add('active');
            } else {
                showColorBtn.classList.add('active');
                showImageBtn.classList.remove('active');
            }
        } else {
            showColorBtn.classList.add('active');
            showImageBtn.classList.remove('active');
        }
    }
}

function goPrev() {
    if (currentPageIndex > 0) {
        saveEditorChanges();
        loadPageIntoEditor(currentPageIndex - 1);
        renderPageList();
        updateFlipBook();
        
        if (typeof updateNavigationButtonsState === 'function') {
            updateNavigationButtonsState();
        }
    }
}

function goNext() {
    if (currentPageIndex < pages.length - 1) {
        saveEditorChanges();
        loadPageIntoEditor(currentPageIndex + 1);
        renderPageList();
        updateFlipBook();
        
        if (typeof updateNavigationButtonsState === 'function') {
            updateNavigationButtonsState();
        }
    }
}

function canSaveBook() {
    if (!pages || pages.length === 0) return false;

    const bookNameInput = document.getElementById("bookName");
    if (!bookNameInput || !bookNameInput.value.trim()) return false;

    const contentWarning = document.getElementById('content-warning');
    const globalContentWarning = document.getElementById('global-content-warning');

    return !(contentWarning && contentWarning.style.display === 'block') &&
        !(globalContentWarning && globalContentWarning.style.display === 'block');
}

function validateAllPages() {
    return new Promise((resolve, reject) => {
        const issues = [];

        saveEditorChanges();

        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.zIndex = '-1000';
        document.body.appendChild(tempContainer);

        let processed = 0;

        showValidationProgress();

        pages.forEach((page, index) => {
            setTimeout(() => {
                updateValidationProgress(processed + 1, pages.length);

                const pageIssues = validateSinglePage(page, index, tempContainer);
                if (pageIssues.length > 0) {
                    issues.push(...pageIssues);
                }

                processed++;

                if (processed === pages.length) {
                    document.body.removeChild(tempContainer);

                    if (issues.length > 0) {
                        hideValidationProgress();
                        reject(issues);
                    } else {
                        setTimeout(() => {
                            hideValidationProgress();
                            resolve();
                        }, 300);
                    }
                }
            }, index * 50);
        });
    });
}

function validateSinglePage(page, index, container) {
    const issues = [];
    const pageType = index === 0 ? "Front Cover" : (index === pages.length - 1 ? "Back Cover" : `Page ${index}`);

    container.innerHTML = '';
    container.style.width = page.width + 'px';
    container.style.height = page.height + 'px';
    container.style.overflow = 'hidden';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ql-editor';
    contentDiv.style.height = '100%';
    contentDiv.style.overflow = 'hidden';
    contentDiv.innerHTML = page.contentHtml;

    container.appendChild(contentDiv);

    if (contentDiv.scrollHeight > contentDiv.clientHeight) {
        issues.push({
            page: index,
            pageType: pageType,
            issue: 'Content exceeds page limits'
        });
    }

    return issues;
}

function showValidationProgress() {
    let progressDialog = document.getElementById('validation-progress');

    if (!progressDialog) {
        progressDialog = document.createElement('div');
        progressDialog.id = 'validation-progress';
        progressDialog.className = 'custom-dialog';
        progressDialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>Preparing Book for Download</h3>
                </div>
                <div class="dialog-body">
                    <p id="validation-message">Checking pages: 0/${pages.length}</p>
                    <div class="progress-bar-container">
                        <div id="validation-progress-bar" class="progress-bar"></div>
                    </div>
                    <p class="progress-note">Please wait while we verify your book...</p>
                </div>
            </div>
        `;
        document.body.appendChild(progressDialog);
    }

    progressDialog.style.display = 'flex';
    setTimeout(() => {
        progressDialog.classList.add('show');
    }, 10);
}

function updateValidationProgress(current, total) {
    const progressMessage = document.getElementById('validation-message');
    const progressBar = document.getElementById('validation-progress-bar');

    if (progressMessage && progressBar) {
        progressMessage.textContent = `Checking pages: ${current}/${total}`;
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

function hideValidationProgress() {
    const progressDialog = document.getElementById('validation-progress');

    if (progressDialog) {
        progressDialog.classList.remove('show');
        setTimeout(() => {
            progressDialog.style.display = 'none';
        }, 300);
    }
}

function validateBookImages() {
    return new Promise(async (resolve, reject) => {
        const imageIssues = [];
        let isProcessing = false;
        let processedCount = 0;
        
        showValidationProgress();
        updateValidationProgress(0, pages.length);
        
        if (typeof BookImageUtils === 'undefined') {
            window.BookImageUtils = {
                validateImageSize: function(dataUrl, maxSizeKB) {
                    if (!dataUrl || typeof dataUrl !== 'string') {
                        return { valid: true, size: 0, formatted: '0 KB' };
                    }
                    
                    const sizeInBytes = Math.ceil(dataUrl.length * 0.75);
                    const sizeInKB = sizeInBytes / 1024;
                    
                    return {
                        valid: sizeInKB <= maxSizeKB,
                        size: sizeInBytes,
                        sizeKB: sizeInKB,
                        formatted: this.formatFileSize(sizeInBytes),
                        maxSize: maxSizeKB
                    };
                },
                formatFileSize: function(bytes) {
                    if (bytes < 1024) {
                        return bytes + ' B';
                    } else if (bytes < 1024 * 1024) {
                        return (bytes / 1024).toFixed(1) + ' KB';
                    } else {
                        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
                    }
                },
                autoOptimizeImage: function(dataUrl, maxSizeKB) {
                    const validation = this.validateImageSize(dataUrl, maxSizeKB);
                    return Promise.resolve({
                        optimized: false,
                        dataUrl: dataUrl,
                        valid: validation.valid,
                        size: validation.size,
                        formatted: validation.formatted
                    });
                }
            };
        }
        
        async function processPage(index) {
            if (isProcessing) return;
            isProcessing = true;
            
            const page = pages[index];
            const pageType = index === 0 ? "Front Cover" : (index === pages.length - 1 ? "Back Cover" : `Page ${index}`);
            
            if (page.backgroundImage && typeof page.backgroundImage === 'string' && page.backgroundImage.trim() !== '') {
                const validation = BookImageUtils.validateImageSize(page.backgroundImage, 500);
                
                if (!validation.valid) {
                    const optimizationResult = await BookImageUtils.autoOptimizeImage(page.backgroundImage, 500);
                    
                    if (optimizationResult.valid) {
                        pages[index].backgroundImage = optimizationResult.dataUrl;
                        imageIssues.push({
                            page: index,
                            pageType: pageType,
                            issue: `Image optimized from ${optimizationResult.original.formatted} to ${optimizationResult.formatted}`,
                            type: 'optimized',
                            fixed: true
                        });
                    } else {
                        imageIssues.push({
                            page: index,
                            pageType: pageType,
                            issue: `Background image too large (${validation.formatted}). Maximum allowed: 500KB`,
                            type: 'oversized',
                            fixed: false
                        });
                    }
                }
            }
            
            processedCount++;
            updateValidationProgress(processedCount, pages.length);
            isProcessing = false;
            
            if (processedCount === pages.length) {
                hideValidationProgress();
                
                const unfixedIssues = imageIssues.filter(issue => !issue.fixed);
                if (unfixedIssues.length > 0) {
                    reject(unfixedIssues);
                } else if (imageIssues.length > 0) {
                    const message = `${imageIssues.length} large image${imageIssues.length > 1 ? 's were' : ' was'} automatically optimized`;
                    notifications.success(message);
                    resolve();
                } else {
                    resolve();
                }
            }
        }
        
        for (let i = 0; i < pages.length; i++) {
            await processPage(i);
        }
    });
}

function showValidationErrors(issues) {
    let errorDialog = document.getElementById('validation-errors');

    if (errorDialog) {
        document.body.removeChild(errorDialog);
    }

    errorDialog = document.createElement('div');
    errorDialog.id = 'validation-errors';
    errorDialog.className = 'custom-dialog';

    let errorListHTML = '';
    issues.forEach(issue => {
        const issueClass = issue.type === 'oversized' ? 'error-item' : '';
        errorListHTML += `<li class="${issueClass}"><strong>${issue.pageType}</strong>: ${issue.issue}</li>`;
    });

    const hasImageIssues = issues.some(issue => issue.type === 'oversized');
    const helpText = hasImageIssues ? 
        '<p class="help-text">Large images may cause storage issues or slow performance. Please optimize your images before uploading.</p>' : '';

    errorDialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>Cannot Download Book</h3>
                <button class="close-dialog-btn" id="close-validation-errors">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="dialog-body">
                <p>Please fix the following issues before downloading:</p>
                <ul class="error-list">
                    ${errorListHTML}
                </ul>
                ${helpText}
                <div class="dialog-actions">
                    <button id="validation-ok-btn" class="modern-button">OK</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(errorDialog);

    setTimeout(() => {
        errorDialog.classList.add('show');
    }, 10);

    document.getElementById('close-validation-errors').addEventListener('click', hideValidationErrors);
    document.getElementById('validation-ok-btn').addEventListener('click', hideValidationErrors);
}

function hideValidationErrors() {
    const errorDialog = document.getElementById('validation-errors');

    if (errorDialog) {
        errorDialog.classList.remove('show');
        setTimeout(() => {
            errorDialog.style.display = 'none';
        }, 300);
    }
}

function downloadJSON() {
    saveEditorChanges();

    if (!canSaveBook()) {
        const downloadBtn = document.getElementById("download-btn");
        const message = getSaveErrorMessage();
        notifications.tooltip(message, downloadBtn, 'error', 3000);
        return;
    }

    validateAllPages()
        .then(() => {
            return validateBookImages();
        })
        .then(() => {
            const data = {
                bookName: bookData.bookName,
                bookWidth: bookData.bookWidth,
                bookHeight: bookData.bookHeight,
                coverColor: bookData.coverColor,
                backCoverColor: bookData.backCoverColor,
                pages: pages
            };
            
            const formatSelector = document.getElementById("book-format-selector");
            const selectedFormat = formatSelector ? formatSelector.value : "json";
            
            let contentType, fileExtension, content;
            
            if (selectedFormat === "encrypted") {
                if (window.EncryptionUtils) {
                    content = EncryptionUtils.encryptData(data);
                    contentType = "application/octet-stream";
                    fileExtension = ".ebk";
                } else {
                    content = JSON.stringify(data, null, 2);
                    contentType = "application/json";
                    fileExtension = ".json";
                    notifications.warning("Encryption module not available, saving as JSON instead.");
                }
            } else {
                content = JSON.stringify(data, null, 2);
                contentType = "application/json";
                fileExtension = ".json";
            }
            
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = bookData.bookName + fileExtension;
            a.click();
            URL.revokeObjectURL(url);

            notifications.success("Book saved successfully!");
        })
        .catch((issues) => {
            showValidationErrors(issues);
        });
}

function getSaveErrorMessage() {
    if (!pages || pages.length === 0) return "Add pages to your book first";

    const bookNameInput = document.getElementById("bookName");
    if (!bookNameInput || !bookNameInput.value.trim()) return "Enter a book name first";

    const contentWarning = document.getElementById('content-warning');
    const globalContentWarning = document.getElementById('global-content-warning');

    if ((contentWarning && contentWarning.style.display === 'block') ||
        (globalContentWarning && globalContentWarning.style.display === 'block')) {
        return "Some content exceeds page limits";
    }

    return "Unknown error";
}

function loadBookFile() {
    document.getElementById("file-input").click();
}

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (pages.length > 0) {
        const confirmMessage = "Loading a new book will replace your current work. Continue?";
        if (window.confirm(confirmMessage)) {
            processBookFile(file);
        }
    } else {
        processBookFile(file);
    }

    event.target.value = '';
}

function processBookFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const fileContent = e.target.result;
            let newData;
            
            const isEncrypted = file.name.toLowerCase().endsWith('.ebk') || 
                               (window.EncryptionUtils && EncryptionUtils.isEncryptedFormat(fileContent));
            
            if (isEncrypted && window.EncryptionUtils) {
                try {
                    newData = EncryptionUtils.decryptData(fileContent);
                    notifications.info("Loaded encrypted book file");
                } catch (decryptError) {
                    throw new Error("Failed to decrypt book file: " + decryptError.message);
                }
            } else {
                newData = JSON.parse(fileContent);
            }

            if (newData.bookName === undefined || newData.pages === undefined) {
                throw new Error("Invalid book file format.");
            }

            bookData.bookName = newData.bookName || "My Book";
            bookData.bookWidth = newData.bookWidth || 350;
            bookData.bookHeight = newData.bookHeight || 400;
            bookData.coverColor = newData.coverColor || "#DC143C";
            bookData.backCoverColor = newData.backCoverColor || "#DC143C";
            bookData.editorColor = newData.editorColor || "#FFFFFF";

            pages = newData.pages;

            if (pages.length < 2) {
                notifications.error("The book file must contain at least 2 pages (Cover and Back Cover).");
                return;
            }

            document.getElementById("bookName").value = bookData.bookName;
            document.getElementById("bookWidth").value = bookData.bookWidth;
            document.getElementById("bookHeight").value = bookData.bookHeight;
            document.getElementById("coverColorInput").value = bookData.coverColor;
            document.getElementById("backCoverColorInput").value = bookData.backCoverColor;

            currentPageIndex = 0;
            renderPageList();
            loadPageIntoEditor(0);
            updateFlipBook();
            saveSettings();

            if (typeof BookEditorNotifications !== 'undefined') {
                BookEditorNotifications.bookLoaded(bookData.bookName || "Untitled Book");
            } else {
                notifications.success("Book loaded successfully!");
            }
        } catch (error) {
            console.error("Error parsing book file:", error);
            if (typeof BookEditorNotifications !== 'undefined') {
                BookEditorNotifications.bookLoadError(error.message);
            } else {
                notifications.error("Error loading book: " + error.message);
            }
        }
    };

    reader.readAsText(file);
}

function initializeBookFromWizard() {
    const wizardData = localStorage.getItem('newBookWizardData');

    if (wizardData) {
        try {
            const newData = JSON.parse(wizardData);

            bookData.bookName = newData.bookName || "My Book";
            bookData.bookWidth = newData.bookWidth || 350;
            bookData.bookHeight = newData.bookHeight || 400;
            bookData.coverColor = newData.coverColor || "#DC143C";
            bookData.backCoverColor = newData.backCoverColor || "#DC143C";
            bookData.editorColor = newData.editorColor || "#FFFFFF";

            pages = newData.pages;

            localStorage.removeItem('newBookWizardData');

            return true;
        } catch (e) {
            console.error("Error parsing wizard data:", e);
            return false;
        }
    }

    return false;
}

document.getElementById('home-btn').addEventListener('click', function () {
    const dialog = document.getElementById('home-confirmation-dialog');
    dialog.style.display = 'flex';
    setTimeout(() => {
        dialog.classList.add('show');
    }, 10);
});

document.getElementById('close-dialog-btn').addEventListener('click', function () {
    const dialog = document.getElementById('home-confirmation-dialog');
    dialog.classList.remove('show');
    setTimeout(() => {
        dialog.style.display = 'none';
    }, 500);
});

document.getElementById('cancel-home-btn').addEventListener('click', function () {
    const dialog = document.getElementById('home-confirmation-dialog');
    dialog.classList.remove('show');
    setTimeout(() => {
        dialog.style.display = 'none';
    }, 500);
});

document.getElementById('confirm-home-btn').addEventListener('click', function () {
    window.location.href = 'welcome.html';
});