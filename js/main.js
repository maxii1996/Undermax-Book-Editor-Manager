let pages = [];
let currentPageIndex = 0;
let quill;
let bookData = {
    bookName: "",
    bookWidth: 300,
    bookHeight: 400,
    coverColor: "#DC143C",
    backCoverColor: "#DC143C",
    editorColor: "#FFFFFF",
    debug: false
};

function init() {
    try {
        if (!window.notifications || !window.BookEditorNotifications) {
            console.error("Notification system not loaded. Please check that all required scripts are loaded.");
            setTimeout(init, 100);
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const newBook = urlParams.get('newBook');
        const loadBook = urlParams.get('loadBook');

        initEditor();

        if (newBook === 'true') {
            if (!loadWizardData()) {
                setupEditor();
                ensureBasicPages();
                renderPageList();

                try {
                    loadPageIntoEditor(0);
                } catch (error) {
                    console.error("Error loading page into editor:", error);
                    notifications.error("Error initializing the editor. Please refresh the page.");
                }
            }
        } else if (loadBook === 'true') {
            const loadedBookData = sessionStorage.getItem('loadedBookData');
            if (loadedBookData) {
                try {
                    const data = JSON.parse(loadedBookData);
                    
                    bookData.bookName = data.bookName || "Untitled Book";
                    bookData.bookWidth = data.bookWidth || 350;
                    bookData.bookHeight = data.bookHeight || 400;
                    bookData.coverColor = data.coverColor || "#DC143C";
                    bookData.backCoverColor = data.backCoverColor || "#DC143C";
                    bookData.editorColor = data.editorColor || "#FFFFFF";
                    
                    const nameInput = document.getElementById("bookName");
                    const widthInput = document.getElementById("bookWidth");
                    const heightInput = document.getElementById("bookHeight");
                    const coverColorInput = document.getElementById("coverColorInput");
                    const backCoverColorInput = document.getElementById("backCoverColorInput");
                    
                    if (nameInput) nameInput.value = bookData.bookName;
                    if (widthInput) widthInput.value = bookData.bookWidth;
                    if (heightInput) heightInput.value = bookData.bookHeight;
                    if (coverColorInput) coverColorInput.value = bookData.coverColor;
                    if (backCoverColorInput) backCoverColorInput.value = bookData.backCoverColor;
                    
                    pages = data.pages || [];
                    
                    setupEditor();
                    renderPageList();
                    loadPageIntoEditor(0);
                    updateFlipBook();
                    
                    sessionStorage.removeItem('loadedBookData');
                    
                    if (typeof BookEditorNotifications !== 'undefined') {
                        BookEditorNotifications.bookLoaded(bookData.bookName);
                    } else {
                        notifications.success("Book loaded successfully!");
                    }
                } catch (error) {
                    console.error("Error loading book:", error);
                    notifications.error("Error loading book: " + error.message);
                    
                    loadSettings();
                    initEditor();
                    setupEditor();
                    ensureBasicPages();
                    renderPageList();
                    loadPageIntoEditor(0);
                    updateFlipBook();
                }
            } else {
                loadSettings();
                initEditor();
                setupEditor();
                ensureBasicPages();
                renderPageList();
                loadPageIntoEditor(0);
                updateFlipBook();
            }
        } else {
            setupEditor();
            ensureBasicPages();
            renderPageList();

            try {
                loadPageIntoEditor(0);
            } catch (error) {
                console.error("Error loading page into editor:", error);
                notifications.error("Error initializing the editor. Please refresh the page.");
            }

            updateFlipBook();
        }

        updateFlipBook();
        updateSaveButtonState();
        attachEventListeners();
        initZoomControls();

        const buttonBar = document.getElementById("button-bar");
        const downloadGroup = document.querySelector(".download-group");
        if (downloadGroup) {
            const globalWarning = downloadGroup.querySelector("#global-content-warning");
            if (globalWarning) {
                buttonBar.appendChild(globalWarning);
            }
            downloadGroup.remove();
        }

        if (typeof initEditor === 'function') {
            window.setTimeout(function() {
                initEditor();
                
                const editor = document.getElementById('editor-inner');
                if (editor) {
                    editor.addEventListener('blur', function() {
                        if (typeof updateToolbarState === 'function') {
                            updateToolbarState();
                        }
                    });
                    
                    editor.addEventListener('click', function(e) {
                        if (e.target.tagName === 'IMG') {
                            const range = document.createRange();
                            range.selectNode(e.target);
                            
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            if (typeof updateToolbarState === 'function') {
                                updateToolbarState();
                            }
                        }
                    });
                    
                    editor.addEventListener('dblclick', function(e) {
                        if (e.target.tagName === 'IMG') {
                            const img = e.target;
                            img.classList.toggle('resizable');
                            
                            e.preventDefault();
                        }
                    });
                }
            }, 100);
        }
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

function loadWizardData() {
    try {
        const wizardDataJson = localStorage.getItem('newBookWizardData');
        
        if (!wizardDataJson) {
            console.log("No wizard data found");
            return false;
        }
        
        let parsedData;
        try {
            parsedData = JSON.parse(wizardDataJson);
        } catch (error) {
            console.error("Failed to parse wizard data:", error);
            notifications.error("Failed to load book data. Please try again.");
            return false;
        }
        
        console.log("Wizard data loaded:", parsedData);
        console.log("Pages count in wizard data:", parsedData.pages ? parsedData.pages.length : 0);
        
        if (!parsedData.pages || !Array.isArray(parsedData.pages) || parsedData.pages.length === 0) {
            console.warn("No pages found in wizard data, initializing default pages");
            
            const width = parsedData.width || 350;
            const height = parsedData.height || 400;
            const pagesCount = parsedData.pageCount || 1;
            
            parsedData.pages = [];
            
            parsedData.pages.push({
                name: "Cover",
                width: width,
                height: height,
                backgroundColor: parsedData.coverType === 'image' ? 'transparent' : (parsedData.coverColor || "#DC143C"),
                backgroundImage: parsedData.coverType === 'image' ? parsedData.coverImage || "" : "",
                alignment: "center",
                contentHtml: "<p>Your Book Title</p>"
            });
            
            for (let i = 0; i < pagesCount; i++) {
                parsedData.pages.push({
                    name: `Page ${i + 1}`,
                    width: width,
                    height: height,
                    backgroundColor: "#FFFFFF",
                    backgroundImage: "",
                    alignment: "left",
                    contentHtml: ""
                });
            }
            
            parsedData.pages.push({
                name: "Back Cover",
                width: width,
                height: height,
                backgroundColor: parsedData.backCoverType === 'image' ? 'transparent' : (parsedData.backCoverColor || "#DC143C"),
                backgroundImage: parsedData.backCoverType === 'image' ? parsedData.backCoverImage || "" : "",
                alignment: "center",
                contentHtml: ""
            });
            
            console.log(`Created default pages array with ${parsedData.pages.length} pages`);
        }
        
        if (!parsedData.pages || !Array.isArray(parsedData.pages) || parsedData.pages.length === 0) {
            console.error("Failed to initialize pages array");
            notifications.error("Could not create book pages. Please try again.");
            return false;
        }
        
        try {
            bookData.bookName = parsedData.bookName || "My Book";
            bookData.bookWidth = parsedData.width || 300;
            bookData.bookHeight = parsedData.height || 400;
            bookData.coverColor = parsedData.coverColor || "#DC143C";
            bookData.backCoverColor = parsedData.backCoverColor || "#DC143C";
            bookData.editorColor = parsedData.editorColor || "#FFFFFF";
            
            const nameInput = document.getElementById("bookName");
            const widthInput = document.getElementById("bookWidth");
            const heightInput = document.getElementById("bookHeight");
            const coverColorInput = document.getElementById("coverColorInput");
            const backCoverColorInput = document.getElementById("backCoverColorInput");
            
            if (nameInput) nameInput.value = bookData.bookName;
            if (widthInput) widthInput.value = bookData.bookWidth;
            if (heightInput) heightInput.value = bookData.bookHeight;
            if (coverColorInput) coverColorInput.value = bookData.coverColor;
            if (backCoverColorInput) backCoverColorInput.value = bookData.backCoverColor;

            pages = parsedData.pages.map(page => {
                if (page.backgroundImage && typeof page.backgroundImage !== 'string') {
                    console.warn("Invalid background image format detected, resetting");
                    page.backgroundImage = "";
                }
                return page;
            });
            
            if (pages.length === 0) {
                throw new Error("No valid pages found after processing");
            }
            
            console.log(`Successfully processed ${pages.length} pages`);
            
            setupEditor();
            renderPageList();
            
            try {
                loadPageIntoEditor(0);
            } catch (error) {
                console.error("Error loading page into editor:", error);
                notifications.error("Error initializing the editor. Please refresh the page.");
                return false;
            }

            updateFlipBook();
            localStorage.removeItem('newBookWizardData');
            
            notifications.success("Book created successfully!");
            return true;
        } catch (error) {
            console.error("Error processing wizard data:", error);
            notifications.error("Failed to create book. Please try again.");
            return false;
        }
    } catch (error) {
        console.error("Unexpected error loading wizard data:", error);
        notifications.error("An unexpected error occurred. Please try again.");
        return false;
    }
}

function loadBookFromStorage() {
    try {
        const storedData = localStorage.getItem('newBookWizardData');
        if (!storedData) return false;
        
        const parsedData = JSON.parse(storedData);
        if (!parsedData) return false;
        
        console.log("Loading book data from storage:", {
            name: parsedData.bookName,
            dimensions: `${parsedData.bookWidth}x${parsedData.bookHeight}`,
            pageCount: parsedData.pageCount,
            hasPages: Boolean(parsedData.pages && parsedData.pages.length),
            pageLength: parsedData.pages ? parsedData.pages.length : 0,
            coverType: parsedData.coverType,
            backCoverType: parsedData.backCoverType,
            hasImages: {
                cover: Boolean(parsedData.coverImage),
                backCover: Boolean(parsedData.backCoverImage)
            }
        });
        
        if (parsedData.pages && Array.isArray(parsedData.pages)) {
            const expectedLength = parsedData.pageCount + 2;
            
            if (parsedData.pages.length !== expectedLength) {
                console.warn(`Page count mismatch: expected ${expectedLength}, got ${parsedData.pages.length}. Fixing...`);
                
                const frontCover = parsedData.pages[0] || {
                    name: "Cover",
                    width: parsedData.bookWidth,
                    height: parsedData.bookHeight,
                    backgroundColor: parsedData.coverType === 'color' ? parsedData.coverColor : 'transparent',
                    backgroundImage: parsedData.coverType === 'image' ? parsedData.coverImage : '',
                    alignment: "center",
                    contentHtml: "<p>Your Book Title</p>"
                };
                
                const backCover = parsedData.pages[parsedData.pages.length - 1] || {
                    name: "Back Cover",
                    width: parsedData.bookWidth,
                    height: parsedData.bookHeight,
                    backgroundColor: parsedData.backCoverType === 'color' ? parsedData.backCoverColor : 'transparent',
                    backgroundImage: parsedData.backCoverType === 'image' ? parsedData.backCoverImage : '',
                    alignment: "center",
                    contentHtml: ""
                };
                
                parsedData.pages = [frontCover];
                
                for (let i = 0; i < parsedData.pageCount; i++) {
                    parsedData.pages.push({
                        name: `Page ${i + 1}`,
                        width: parsedData.bookWidth,
                        height: parsedData.bookHeight,
                        backgroundColor: "#FFFFFF",
                        backgroundImage: "",
                        alignment: "left",
                        contentHtml: ""
                    });
                }
                
                parsedData.pages.push(backCover);
            }
        }
        
        bookData = parsedData;
        pages = parsedData.pages || [];
        
        return true;
    } catch (error) {
        console.error("Error loading book from storage:", error);
        return false;
    }
}

function attachEventListeners() {
    try {
        const addPageBtn = document.getElementById("add-page-btn");
        const loadBookBtn = document.getElementById("load-book-btn");
        const fileInput = document.getElementById("file-input");
        const bgImageInput = document.getElementById("bg-image-input");
        const browseImageBtn = document.getElementById("browse-image-btn");
        const removeImageBtn = document.getElementById("remove-image-btn");
        const applyDimensions = document.getElementById("applyDimensions");
        const coverColorInput = document.getElementById("coverColorInput");
        const backCoverColorInput = document.getElementById("backCoverColorInput");
        const pageBgColor = document.getElementById("pageBgColor");
        const prevBtn = document.getElementById("prev-btn");
        const nextBtn = document.getElementById("next-btn");
        const downloadBtn = document.getElementById("download-btn");
        const resetDimensions = document.getElementById("resetDimensions");
        const editorColorInput = document.getElementById("editorColorInput");
        const bookName = document.getElementById("bookName");

        if (addPageBtn) {
            addPageBtn.addEventListener("click", addMiddlePage);
        }
        
        if (loadBookBtn) {
            loadBookBtn.addEventListener("click", loadBookFile);
        }
        
        if (fileInput) {
            fileInput.addEventListener("change", handleFileLoad);
        }
        
        if (bgImageInput) {
            bgImageInput.addEventListener("change", handleImageUpload);
        }
        
        if (browseImageBtn) {
            browseImageBtn.replaceWith(browseImageBtn.cloneNode(true));
            const newBrowseImageBtn = document.getElementById("browse-image-btn");
            
            newBrowseImageBtn.addEventListener("click", () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                
                input.onchange = e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    if (BookImageUtils.isFileTooLarge(file, 500)) {
                        const sizeStr = BookImageUtils.formatFileSize(file.size);
                        notifications.error(`Image too large (${sizeStr}). Please use an image smaller than 500KB.`);
                        
                        const imagePreview = document.getElementById("image-preview");
                        if (imagePreview) {
                            imagePreview.innerHTML = `<div class="image-error">File too large: ${sizeStr}.<br>Maximum allowed: 500KB</div>`;
                            imagePreview.style.display = "flex";
                            
                            setTimeout(() => {
                                imagePreview.style.display = "none";
                            }, 5000);
                        }
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const imageDataUrl = event.target.result;
                        
                        BookImageUtils.autoOptimizeImage(imageDataUrl, 500).then(result => {
                            if (result.optimized) {
                                notifications.info(`Image optimized: ${result.original.formatted} → ${result.formatted}`);
                            }
                            
                            if (currentPageIndex >= 0 && currentPageIndex < pages.length) {
                                pages[currentPageIndex].backgroundImage = result.dataUrl;
                                
                                const imagePreview = document.getElementById('image-preview');
                                if (imagePreview) {
                                    imagePreview.innerHTML = '';
                                    imagePreview.style.backgroundImage = `url(${result.dataUrl})`;
                                    imagePreview.style.display = 'block';
                                }
                                
                                const pageBgImage = document.getElementById('pageBgImage');
                                if (pageBgImage) {
                                    pageBgImage.textContent = file.name;
                                }
                                
                                const backgroundColorGroup = document.querySelector('.settings-group:has(#pageBgColor)');
                                if (backgroundColorGroup) {
                                    backgroundColorGroup.style.display = "none";
                                }
                                
                                updateFlipBook();
                                updateRemoveImageButtonState();
                                updateSaveButtonState();
                                saveEditorChanges();
                            }
                        });
                    };
                    reader.readAsDataURL(file);
                };
                
                input.click();
            });
        }
        
        if (removeImageBtn) {
            removeImageBtn.replaceWith(removeImageBtn.cloneNode(true));
            const newRemoveImageBtn = document.getElementById("remove-image-btn");
            
            newRemoveImageBtn.addEventListener("click", () => {
                removeBackgroundImage();
                updateRemoveImageButtonState();
            });
        }
        
        if (applyDimensions) {
            applyDimensions.addEventListener("click", () => {
                updateAllPageDimensions();
            });
        }
        
        if (coverColorInput) {
            let colorTimeout;
            coverColorInput.addEventListener("input", () => {
                if (colorTimeout) clearTimeout(colorTimeout);
                
                const colorPreview = coverColorInput.nextElementSibling;
                if (colorPreview && colorPreview.classList.contains('color-preview')) {
                    colorPreview.style.backgroundColor = coverColorInput.value;
                }
                
                colorTimeout = setTimeout(() => {
                    bookData.coverColor = coverColorInput.value;
                    saveEditorChanges();
                    if (currentPageIndex === 0) {
                        pages[0].backgroundColor = coverColorInput.value;
                        updatePageBackgroundColor(pages[0]);
                    }
                    updateFlipBook();
                }, 100);
            });
        }
        
        if (backCoverColorInput) {
            let colorTimeout;
            backCoverColorInput.addEventListener("input", () => {
                if (colorTimeout) clearTimeout(colorTimeout);
                
                const colorPreview = backCoverColorInput.nextElementSibling;
                if (colorPreview && colorPreview.classList.contains('color-preview')) {
                    colorPreview.style.backgroundColor = backCoverColorInput.value;
                }
                
                colorTimeout = setTimeout(() => {
                    bookData.backCoverColor = backCoverColorInput.value;
                    saveEditorChanges();
                    if (currentPageIndex === pages.length - 1) {
                        pages[pages.length - 1].backgroundColor = backCoverColorInput.value;
                        updatePageBackgroundColor(pages[pages.length - 1]);
                    }
                    updateFlipBook();
                }, 100);
            });
        }
        
        if (pageBgColor) {
            let colorTimeout;
            pageBgColor.addEventListener("input", () => {
                if (colorTimeout) clearTimeout(colorTimeout);
                
                const colorPreview = pageBgColor.nextElementSibling;
                if (colorPreview && colorPreview.classList.contains('color-preview')) {
                    colorPreview.style.backgroundColor = pageBgColor.value;
                }
                
                colorTimeout = setTimeout(() => {
                    if (currentPageIndex >= 0 && currentPageIndex < pages.length) {
                        pages[currentPageIndex].backgroundColor = pageBgColor.value;
                        updatePageBackgroundColor(pages[currentPageIndex]);
                    }
                    saveEditorChanges();
                    updateFlipBook();
                }, 100);
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener("click", goPrev);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener("click", goNext);
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener("click", downloadJSON);
        }
        
        if (resetDimensions) {
            resetDimensions.addEventListener("click", resetDimensionsToDefault);
        }
        
        if (editorColorInput) {
            editorColorInput.addEventListener("input", function () {
                bookData.editorColor = this.value;
                
                const colorPreview = this.nextElementSibling;
                if (colorPreview && colorPreview.classList.contains('color-preview')) {
                    colorPreview.style.backgroundColor = this.value;
                }
                
                updateEditorColor();
            });
        }
        
        if (bookName) {
            bookName.addEventListener("input", () => {
                bookData.bookName = bookName.value;
                saveEditorChanges();
            });
        }
        
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
        
    } catch (error) {
        console.error("Error in attachEventListeners:", error);
        if (window.notifications && typeof window.notifications.error === 'function') {
            window.notifications.error("Error setting up UI: " + error.message);
        }
    }
}

function validateAllBookImages() {
    const issues = [];
    const MAX_SIZE_KB = 500;
    
    pages.forEach((page, index) => {
        if (!page.backgroundImage) return;
        
        const validation = BookImageUtils.validateImageSize(page.backgroundImage, MAX_SIZE_KB);
        if (!validation.valid) {
            const pageType = index === 0 ? "Front Cover" : 
                            (index === pages.length - 1 ? "Back Cover" : `Page ${index}`);
            
            issues.push({
                page: index,
                pageType: pageType,
                size: validation.formatted,
                maxSize: `${MAX_SIZE_KB}KB`
            });
        }
    });
    
    return issues;
}

function canSaveBook() {
    if (pages.length < 2) {
        return false;
    }
    
    if (!bookData.bookName || bookData.bookName.trim() === "") {
        return false;
    }
    
    const imageIssues = validateAllBookImages();
    if (imageIssues.length > 0) {
        return false;
    }
    
    return true;
}

function getSaveErrorMessage() {
    if (pages.length < 2) {
        return "A book must have at least 2 pages (Cover and Back Cover)";
    }
    
    if (!bookData.bookName || bookData.bookName.trim() === "") {
        return "Please enter a book name";
    }
    
    const imageIssues = validateAllBookImages();
    if (imageIssues.length > 0) {
        const issue = imageIssues[0];
        if (imageIssues.length === 1) {
            return `Image too large in ${issue.pageType}: ${issue.size}. Maximum allowed: ${issue.maxSize}`;
        } else {
            return `${imageIssues.length} images exceed the maximum size of ${issue.maxSize}`;
        }
    }
    
    return null;
}

function initUI() {
    try {
        attachEventListeners();
        setupDimensionInputs();
        
        const colorInputs = document.querySelectorAll('input[type="color"]');
        colorInputs.forEach(input => {
            const nextElement = input.nextElementSibling;
            if (nextElement && nextElement.classList.contains('color-preview')) {
                nextElement.style.backgroundColor = input.value;
            }
        });
    } catch (error) {
        console.error("Error initializing UI:", error);
    }
}

function updateInfoBar() {
    const infoBarText = document.getElementById("info-bar-text") || document.getElementById("info-bar");
    if (currentPageIndex === 0) {
        infoBarText.textContent = "Editing: Cover (page 1 of " + pages.length + ")";
    } else if (currentPageIndex === pages.length - 1) {
        infoBarText.textContent = "Editing: Back Cover (page " + pages.length + " of " + pages.length + ")";
    } else {
        infoBarText.textContent = "Editing: Page " + (currentPageIndex + 1) + " of " + pages.length;
    }
}

function updateSaveButtonState() {
    const downloadBtn = document.getElementById("download-btn");
    if (!downloadBtn) return;

    if (canSaveBook()) {
        downloadBtn.disabled = false;
        downloadBtn.title = "Save your book as a JSON file";
    } else {
        downloadBtn.disabled = true;
        downloadBtn.title = getSaveErrorMessage();
    }
}

function setupEditor() {
    const minWidth = BOOK_CONSTANTS.MIN_WIDTH;
    const minHeight = BOOK_CONSTANTS.MIN_HEIGHT;
    const maxWidth = BOOK_CONSTANTS.MAX_WIDTH;
    const maxHeight = BOOK_CONSTANTS.MAX_HEIGHT;

    if (!bookData.bookWidth || isNaN(bookData.bookWidth)) {
        bookData.bookWidth = BOOK_CONSTANTS.DEFAULT_WIDTH;
    } else {
        bookData.bookWidth = Math.max(minWidth, Math.min(maxWidth, bookData.bookWidth));
    }

    if (!bookData.bookHeight || isNaN(bookData.bookHeight)) {
        bookData.bookHeight = BOOK_CONSTANTS.DEFAULT_HEIGHT;
    } else {
        bookData.bookHeight = Math.max(minHeight, Math.min(maxHeight, bookData.bookHeight));
    }

    document.getElementById("bookWidth").value = bookData.bookWidth;
    document.getElementById("bookHeight").value = bookData.bookHeight;

    updateEditorColor();
    updateEditorSize();

    updateSaveButtonState();

    setupDimensionsListeners();
}

function renderPageList() {
    const pageList = document.getElementById("page-list");
    if (!pageList) return;

    pageList.innerHTML = "";

    pages.forEach((page, index) => {
        const pageItem = document.createElement("div");
        pageItem.className = "page-item" + (index === currentPageIndex ? " active" : "");

        const pageNumber = document.createElement("div");
        pageNumber.className = "page-item-number";
        pageNumber.textContent = index + 1;

        const pageTitle = document.createElement("div");
        pageTitle.className = "page-item-title";

        if (index === 0) {
            pageTitle.textContent = "Front Cover";
        } else if (index === pages.length - 1) {
            pageTitle.textContent = "Back Cover";
        } else {
            pageTitle.textContent = `Page ${index + 1}`;
        }

        const pageActions = document.createElement("div");
        pageActions.className = "page-item-actions";

        if (index > 0 && index < pages.length - 1) {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "page-action-btn delete";
            deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
            deleteBtn.title = "Delete page";
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                showDeletePageDialog(index);
            });
            pageActions.appendChild(deleteBtn);
        }

        pageItem.appendChild(pageNumber);
        pageItem.appendChild(pageTitle);
        pageItem.appendChild(pageActions);

        pageItem.addEventListener("click", () => {
            loadPageIntoEditor(index);
        });

        pageList.appendChild(pageItem);
    });

    if (typeof window.setupPageListInteractions === 'function') {
        window.setupPageListInteractions();
    }
}

function updateBackgroundImagePreview() {
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    
    const imagePreview = document.getElementById("image-preview");
    const backgroundColorGroup = document.querySelector('.settings-group:has(#pageBgColor)');
    const pageBgImage = document.getElementById('pageBgImage');
    
    if (!imagePreview) return;
    
    if (currentPage.backgroundImage) {
        imagePreview.style.backgroundImage = `url(${currentPage.backgroundImage})`;
        imagePreview.style.display = "block";
        
        if (pageBgImage) {
            const filename = currentPage.backgroundImage.includes('/') 
                ? currentPage.backgroundImage.split('/').pop() 
                : 'Image';
            pageBgImage.textContent = filename;
        }
        
        if (backgroundColorGroup) {
            backgroundColorGroup.style.display = "none";
        }
    } else {
        imagePreview.style.backgroundImage = '';
        imagePreview.style.display = "none";
        
        if (pageBgImage) {
            pageBgImage.textContent = "No image selected";
        }
        
        if (backgroundColorGroup) {
            backgroundColorGroup.style.display = "block";
        }
    }
    
    updateRemoveImageButtonState();
}

function updatePageBackgroundColor(page) {
    if (!page) return;
    
    requestAnimationFrame(() => {
        const pageBgColor = document.getElementById("pageBgColor");
        if (pageBgColor) {
            pageBgColor.value = page.backgroundColor;
            
            const colorPreview = pageBgColor.nextElementSibling;
            if (colorPreview && colorPreview.classList.contains('color-preview')) {
                colorPreview.style.backgroundColor = page.backgroundColor;
            }
        }
        
        if (currentPageIndex === 0) {
            const coverColorInput = document.getElementById("coverColorInput");
            if (coverColorInput) {
                coverColorInput.value = page.backgroundColor;
                
                const colorPreview = coverColorInput.nextElementSibling;
                if (colorPreview && colorPreview.classList.contains('color-preview')) {
                    colorPreview.style.backgroundColor = page.backgroundColor;
                }
            }
            bookData.coverColor = page.backgroundColor;
        } else if (currentPageIndex === pages.length - 1) {
            const backCoverColorInput = document.getElementById("backCoverColorInput");
            if (backCoverColorInput) {
                backCoverColorInput.value = page.backgroundColor;
                
                const colorPreview = backCoverColorInput.nextElementSibling;
                if (colorPreview && colorPreview.classList.contains('color-preview')) {
                    colorPreview.style.backgroundColor = page.backgroundColor;
                }
            }
            bookData.backCoverColor = page.backgroundColor;
        }
    });
    
    updateFlipBook();
}

function updateUIAfterPageLoad() {
    try {
        updateInfoBar();
        
        const currentPage = pages[currentPageIndex];
        if (currentPage) {
            updateBackgroundImagePreview();
            
            updateRemoveImageButtonState();
            
            const pageBgColor = document.getElementById("pageBgColor");
            if (pageBgColor) {
                pageBgColor.value = currentPage.backgroundColor;
                const colorPreview = pageBgColor.nextElementSibling;
                if (colorPreview && colorPreview.classList.contains('color-preview')) {
                    colorPreview.style.backgroundColor = currentPage.backgroundColor;
                }
            }
        }
        
        const pageItems = document.querySelectorAll('.page-item');
        pageItems.forEach((item, index) => {
            if (index === currentPageIndex) {
                item.classList.add("selected", "active");
            } else {
                item.classList.remove("selected", "active");
            }
        });
        
        updateNavigationButtonsState();
        
        if (pages.length > 0) {
            sessionStorage.setItem('hasBookLoaded', 'true');
        }
        
    } catch (error) {
        console.error("Error updating UI after page load:", error);
    }
}

function updateNavigationButtonsState() {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    
    if (prevBtn) {
        if (currentPageIndex <= 0) {
            prevBtn.style.display = "none";
        } else {
            prevBtn.style.display = "flex";
        }
    }
    
    if (nextBtn) {
        if (currentPageIndex >= pages.length - 1) {
            nextBtn.style.display = "none";
        } else {
            nextBtn.style.display = "flex";
        }
    }
}

const originalLoadPageIntoEditor = window.loadPageIntoEditor || loadPageIntoEditor;
window.loadPageIntoEditor = function (index) {
    try {
        originalLoadPageIntoEditor(index);
        updateUIAfterPageLoad();
    } catch (error) {
        console.error("Error in loadPageIntoEditor:", error);
    }
};

function setupDimensionInputs() {
    const bookWidthInput = document.getElementById("bookWidth");
    const bookHeightInput = document.getElementById("bookHeight");

    if (bookWidthInput) {
        bookWidthInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        bookWidthInput.addEventListener('change', function () {
            let value = parseInt(this.value) || BOOK_CONSTANTS.DEFAULT_WIDTH;
            value = Math.max(BOOK_CONSTANTS.MIN_WIDTH, Math.min(BOOK_CONSTANTS.MAX_WIDTH, value));
            this.value = value;
        });
    }

    if (bookHeightInput) {
        bookHeightInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        bookHeightInput.addEventListener('change', function () {
            let value = parseInt(this.value) || BOOK_CONSTANTS.DEFAULT_HEIGHT;
            value = Math.max(BOOK_CONSTANTS.MIN_HEIGHT, Math.min(BOOK_CONSTANTS.MAX_HEIGHT, value));
            this.value = value;
        });
    }
}

function showDeletePageDialog(index) {
    if (typeof window.showDeleteConfirmation === 'function') {
        window.showDeleteConfirmation(index);
    } else {
        console.error('showDeleteConfirmation function not found');
    }
}

function toggleDebugMode() {
    bookData.debug = !bookData.debug;
    const debugBtn = document.querySelector('button[innerText="Debug"]');
    
    if (debugBtn) {
        if (bookData.debug) {
            debugBtn.style.display = 'block';
            notifications.info("Debug mode enabled");
        } else {
            debugBtn.style.display = 'none';
            notifications.info("Debug mode disabled");
        }
    }
    
    saveEditorChanges();
}

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDebugMode();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    setupDimensionInputs();
});

document.addEventListener('DOMContentLoaded', function () {
    initUI();
});

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);

    const skipWelcome = (urlParams.has('newBook') && urlParams.get('newBook') === 'true') ||
        (urlParams.has('loadBook') && urlParams.get('loadBook') === 'true');

    if (!skipWelcome) {
        window.location.href = 'welcome.html';
        return;
    }

    if (urlParams.get('newBook') === 'true') {
        const wizardData = localStorage.getItem('newBookWizardData');
        console.log("Cargando datos del asistente:", wizardData ? "Datos encontrados" : "No hay datos");
        
        if (wizardData) {
            try {
                const parsedData = JSON.parse(wizardData);
                console.log(`Procesando libro con ${parsedData.pages ? parsedData.pages.length : 0} páginas`);

                if (Array.isArray(parsedData.pages) && parsedData.pages.length > 0) {
                    bookData.bookName = parsedData.bookName || "";
                    bookData.bookWidth = parsedData.bookWidth || 300;
                    bookData.bookHeight = parsedData.bookHeight || 400;
                    bookData.coverColor = parsedData.coverColor || "#DC143C";
                    bookData.backCoverColor = parsedData.backCoverColor || "#DC143C";
                    
                    const nameInput = document.getElementById("bookName");
                    const widthInput = document.getElementById("bookWidth");
                    const heightInput = document.getElementById("bookHeight");
                    const coverColorInput = document.getElementById("coverColorInput");
                    const backCoverColorInput = document.getElementById("backCoverColorInput");
                    
                    if (nameInput) nameInput.value = bookData.bookName;
                    if (widthInput) widthInput.value = bookData.bookWidth;
                    if (heightInput) heightInput.value = bookData.bookHeight;
                    if (coverColorInput) coverColorInput.value = bookData.coverColor;
                    if (backCoverColorInput) backCoverColorInput.value = bookData.backCoverColor;

                    pages = parsedData.pages;
                    
                    setupEditor();
                    renderPageList();
                    
                    try {
                        loadPageIntoEditor(0);
                    } catch (error) {
                        console.error("Error loading page into editor:", error);
                        notifications.error("Error initializing the editor. Please refresh the page.");
                    }

                    updateFlipBook();
                    
                    localStorage.removeItem('newBookWizardData');
                    
                    notifications.success("Book created successfully!");
                } else {
                    console.error("No valid pages found in wizard data");
                    ensureBasicPages();
                    setupEditor();
                    renderPageList();
                    loadPageIntoEditor(0);
                    updateFlipBook();
                }
            } catch (error) {
                console.error("Error loading new book data:", error);
                ensureBasicPages();
                setupEditor();
                renderPageList();
                loadPageIntoEditor(0);
                updateFlipBook();
            }
        } else {
            console.warn("No wizard data found in localStorage");
            ensureBasicPages();
            setupEditor();
            renderPageList();
            loadPageIntoEditor(0);
            updateFlipBook();
        }
    } else if (urlParams.get('loadBook') === 'true') {
        const loadedBookData = localStorage.getItem('loadedBookData');
        if (loadedBookData) {
            try {
                const data = JSON.parse(loadedBookData);
            } catch (error) {
                console.error("Error loading book:", error);
            }
        } else {
            loadSettings();
            initEditor();
            setupEditor();
            ensureBasicPages();
            renderPageList();
            loadPageIntoEditor(0);
            updateFlipBook();
        }
    } else {
        loadSettings();
        initEditor();
        setupEditor();
        ensureBasicPages();
        renderPageList();
        loadPageIntoEditor(0);
        updateFlipBook();
    }
});

window.addEventListener('beforeunload', function (event) {
    sessionStorage.setItem('directPageReload', 'true');
    
    if (pages && pages.length > 0) {
        const confirmationMessage = 'Warning: All unsaved changes will be lost if you reload the page.';
        event.returnValue = confirmationMessage;
        return confirmationMessage;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded, checking navigation state");
    
    const isDirectReload = sessionStorage.getItem('directPageReload') === 'true';
    
    sessionStorage.removeItem('directPageReload');
    
    const inEditor = window.location.pathname.includes('index.html') || 
                    window.location.pathname.endsWith('/Book Editor/') ||
                    window.location.pathname.endsWith('/Book Editor');
    
    console.log("Navigation state:", {
        isDirectReload,
        inEditor,
        path: window.location.pathname
    });
    
    if (inEditor && isDirectReload) {
        console.log("F5 refresh detected, redirecting to welcome page");
        window.location.replace('welcome.html');
        return;
    }
    
    if (inEditor) {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('newBook') && !urlParams.has('loadBook')) {
            console.log("No proper URL parameters, redirecting to welcome page");
            window.location.replace('welcome.html');
            return;
        }
    }
    
    initUI();
});

/**
 * Removes background image from the current page
 * Updates the UI to reflect the change
 */
function removeBackgroundImage() {
    if (currentPageIndex < 0 || currentPageIndex >= pages.length) return;
    
    pages[currentPageIndex].backgroundImage = '';
    
    const imagePreview = document.getElementById("image-preview");
    if (imagePreview) {
        imagePreview.innerHTML = '';
        imagePreview.style.backgroundImage = '';
        imagePreview.style.display = "none";
    }
    
    const pageBgImage = document.getElementById('pageBgImage');
    if (pageBgImage) {
        pageBgImage.textContent = "No image selected";
    }
    
    const backgroundColorGroup = document.querySelector('.settings-group:has(#pageBgColor)');
    if (backgroundColorGroup) {
        backgroundColorGroup.style.display = "block";
    }
    
    updateFlipBook();
    
    saveEditorChanges();
}

const BookManager = {
    removeBackgroundImage: removeBackgroundImage,
    
    getCurrentPage: function() {
        return currentPageIndex >= 0 && currentPageIndex < pages.length ? 
            pages[currentPageIndex] : null;
    },
    
    getAllPages: function() {
        return pages;
    },
    
    getBookData: function() {
        return bookData;
    },
    
    updatePage: function(index, pageData) {
        if (index >= 0 && index < pages.length) {
            pages[index] = {...pages[index], ...pageData};
            updateFlipBook();
            saveEditorChanges();
            return true;
        }
        return false;
    },
    
    storeData: function(key, data, errorCallback) {
        try {
            localStorage.setItem(key, data);
            return true;
        } catch (error) {
            console.warn('localStorage storage failed:', error);
            
            try {
                let parsedData = JSON.parse(data);
                let hasRemovedImages = false;
                
                const minimalData = { ...parsedData };
                
                if (minimalData.coverImage && minimalData.coverImage.length > 10000) {
                    minimalData.coverImageTooLarge = true;
                    minimalData.coverImage = '';
                    hasRemovedImages = true;
                }
                
                if (minimalData.backCoverImage && minimalData.backCoverImage.length > 10000) {
                    minimalData.backCoverImageTooLarge = true;
                    minimalData.backCoverImage = '';
                    hasRemovedImages = true;
                }
                
                if (minimalData.pages && Array.isArray(minimalData.pages)) {
                    minimalData.pages = minimalData.pages.map(page => {
                        const newPage = { ...page };
                        if (newPage.backgroundImage && newPage.backgroundImage.length > 10000) {
                            newPage.backgroundImageTooLarge = true;
                            newPage.backgroundImage = '';
                            hasRemovedImages = true;
                        }
                        return newPage;
                    });
                }
                
                const minimalJson = JSON.stringify(minimalData);
                localStorage.setItem(key, minimalJson);
                
                if (hasRemovedImages && window.notifications) {
                    window.notifications.warning(
                        "Your book was saved without images due to browser storage limitations. " +
                        "The images will need to be added again when you edit the book."
                    );
                }
                return true;
            } catch (fallbackError) {
                console.warn('Minimal data storage failed:', fallbackError);
                
                try {
                    let parsedData = JSON.parse(data);
                    
                    const essentialData = {
                        bookName: parsedData.bookName || "Untitled Book",
                        bookWidth: parsedData.bookWidth || parsedData.width || 350,
                        bookHeight: parsedData.bookHeight || parsedData.height || 400,
                        coverColor: parsedData.coverColor || "#DC143C",
                        backCoverColor: parsedData.backCoverColor || "#DC143C",
                        pageCount: parsedData.pageCount || (parsedData.pages ? parsedData.pages.length - 2 : 1),
                        imagesCleaned: true
                    };
                    
                    essentialData.pages = [];
                    
                    essentialData.pages.push({
                        name: "Cover",
                        width: essentialData.bookWidth,
                        height: essentialData.bookHeight,
                        backgroundColor: essentialData.coverColor,
                        backgroundImage: "",
                        alignment: "center",
                        contentHtml: "<p>Your Book Title</p>"
                    });
                    
                    for (let i = 0; i < essentialData.pageCount; i++) {
                        essentialData.pages.push({
                            name: `Page ${i + 1}`,
                            width: essentialData.bookWidth,
                            height: essentialData.bookHeight,
                            backgroundColor: "#FFFFFF",
                            backgroundImage: "",
                            alignment: "left",
                            contentHtml: ""
                        });
                    }
                    
                    essentialData.pages.push({
                        name: "Back Cover",
                        width: essentialData.bookWidth,
                        height: essentialData.bookHeight,
                        backgroundColor: essentialData.backCoverColor,
                        backgroundImage: "",
                        alignment: "center",
                        contentHtml: ""
                    });
                    
                    sessionStorage.setItem(key, JSON.stringify(essentialData));
                    sessionStorage.setItem('useSessionStorage', 'true');
                    
                    if (window.notifications) {
                        window.notifications.warning(
                            "Your book was saved with limited data due to storage limitations. " +
                            "Images and some content may need to be added again."
                        );
                    }
                    return true;
                } catch (sessionError) {
                    console.error('All storage fallbacks failed:', sessionError);
                    if (errorCallback && typeof errorCallback === 'function') {
                        errorCallback(sessionError);
                    }
                    return false;
                }
            }
        }
    },
    
    /**
     * Estimates the available localStorage space in bytes
     * @returns {Object} Object containing total, used and available space in bytes
     */
    getStorageInfo: function() {
        try {
            const testKey = '_storage_test_';
            const oneKB = 1024;
            const estimatedTotal = 5 * 1024 * 1024;
            
            let usedSpace = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                usedSpace += (key.length + value.length) * 2;
            }
            
            let testString = '';
            let testSize = oneKB;
            let maxSize = 0;
            
            try {
                localStorage.removeItem(testKey);
                
                for (let i = 0; i < 1024; i++) {
                    testString += new Array(1025).join('a');
                }
                
                let iterations = 0;
                const maxIterations = 20;
                
                while (iterations < maxIterations) {
                    try {
                        localStorage.setItem(testKey, testString);
                        maxSize = testString.length * 2;
                        testString += testString;
                        iterations++;
                    } catch (e) {
                        break;
                    }
                }
                
                localStorage.removeItem(testKey);
            } catch (e) {
                console.warn('Error estimating storage size:', e);
                maxSize = estimatedTotal;
            }
            
            const totalSpace = Math.max(maxSize + usedSpace, estimatedTotal);
            const availableSpace = totalSpace - usedSpace;
            
            return {
                total: totalSpace,
                used: usedSpace,
                available: availableSpace
            };
        } catch (e) {
            console.error('Failed to estimate storage space:', e);
            return {
                total: 5 * 1024 * 1024,
                used: 0,
                available: 5 * 1024 * 1024
            };
        }
    },
    
    /**
     * Formats bytes into a human-readable string
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string (e.g., "4.2 MB")
     */
    formatBytes: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Checks if an image is likely to exceed available storage space
     * @param {string} imageDataUrl - The image data URL to check
     * @returns {boolean} True if the image is likely too large
     */
    isImageTooLarge: function(imageDataUrl) {
        if (!imageDataUrl) return false;
        
        const storageInfo = this.getStorageInfo();
        const imageSize = imageDataUrl.length * 2;
        
        return imageSize > (storageInfo.available * 0.8);
    },
    
    /**
     * Displays storage information
     * @param {string} containerId - ID of the container to display info in
     */
    displayStorageInfo: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const storageInfo = this.getStorageInfo();
        
        const usedFormatted = this.formatBytes(storageInfo.used);
        const totalFormatted = this.formatBytes(storageInfo.total);
        const availableFormatted = this.formatBytes(storageInfo.available);
        
        const percentUsed = Math.round((storageInfo.used / storageInfo.total) * 100);
        
        container.innerHTML = `
            <div class="storage-info">
                <div class="storage-meter">
                    <div class="storage-bar" style="width: ${percentUsed}%; 
                         background-color: ${percentUsed > 80 ? '#e53935' : 
                                            (percentUsed > 60 ? '#ffb74d' : '#4caf50')};">
                    </div>
                </div>
                <div class="storage-text">
                    Storage: ${usedFormatted} used of ${totalFormatted} (${availableFormatted} available)
                </div>
            </div>
        `;
    }
};

window.removeBackgroundImage = removeBackgroundImage;
window.BookManager = BookManager;

document.addEventListener('DOMContentLoaded', function() {
    let storageInfoContainer = document.getElementById('storage-info-container');
    if (storageInfoContainer) {
        storageInfoContainer.style.display = 'none';
    } else {
        storageInfoContainer = document.createElement('div');
        storageInfoContainer.id = 'storage-info-container';
        storageInfoContainer.style.display = 'none';
        document.body.appendChild(storageInfoContainer);
    }
    
    if (BookManager && typeof BookManager.displayStorageInfo === 'function') {
        BookManager.displayStorageInfo('storage-info-container');
        
        setInterval(function() {
            BookManager.displayStorageInfo('storage-info-container');
        }, 5000);
    }
});

window.addEventListener("load", init);