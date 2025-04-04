let pages = [];
let currentPageIndex = 0;
let quill;
let bookData = {
    bookName: "",
    bookWidth: 300,
    bookHeight: 400,
    coverColor: "#DC143C",
    backCoverColor: "#DC143C",
    editorColor: "#FFFFFF"
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
            let newBookData;
            const useSessionStorage = urlParams.get('useSessionStorage') === 'true' || 
                                    sessionStorage.getItem('useSessionStorageForBook') === 'true';
            
            if (useSessionStorage) {
                newBookData = sessionStorage.getItem('newBookWizardData');
                console.log("Loading book data from sessionStorage due to size constraints");
            } else {
                newBookData = localStorage.getItem('newBookWizardData');
            }
            
            if (newBookData) {
                try {
                    const parsedData = JSON.parse(newBookData);

                    bookData.bookName = parsedData.bookName || "";
                    bookData.bookWidth = parsedData.bookWidth || 300;
                    bookData.bookHeight = parsedData.bookHeight || 400;
                    bookData.coverColor = parsedData.coverColor || "#DC143C";
                    bookData.backCoverColor = parsedData.backCoverColor || "#DC143C";

                    document.getElementById("bookName").value = bookData.bookName;
                    document.getElementById("bookWidth").value = bookData.bookWidth;
                    document.getElementById("bookHeight").value = bookData.bookHeight;
                    document.getElementById("coverColorInput").value = bookData.coverColor;
                    document.getElementById("backCoverColorInput").value = bookData.backCoverColor;

                    if (Array.isArray(parsedData.pages)) {
                        pages = parsedData.pages;
                    } else {
                        ensureBasicPages();
                    }

                    if (useSessionStorage) {
                        sessionStorage.removeItem('newBookWizardData');
                        sessionStorage.removeItem('useSessionStorageForBook');
                    } else {
                        localStorage.removeItem('newBookWizardData');
                    }

                    setupEditor();
                    renderPageList();

                    try {
                        loadPageIntoEditor(0);
                    } catch (error) {
                        console.error("Error loading page into editor:", error);
                        notifications.error("Error initializing the editor. Please refresh the page.");
                    }

                    updateFlipBook();

                    BookEditorNotifications.bookLoaded(bookData.bookName || "Untitled Book");
                } catch (error) {
                    console.error("Error loading new book data:", error);
                    setupEditor();
                    ensureBasicPages();
                    renderPageList();

                    try {
                        loadPageIntoEditor(0);
                    } catch (error) {
                        console.error("Error loading page into editor:", error);
                        notifications.error("Error initializing the editor. Please refresh the page.");
                    }

                    setTimeout(() => {
                        window.location.href = 'welcome.html';
                    }, 500);
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
            }
        } else if (loadBook === 'true') {
            const loadedBookData = sessionStorage.getItem('loadedBookData');
            if (loadedBookData) {
                try {
                    const data = JSON.parse(loadedBookData);

                    bookData.bookName = data.bookName || "";
                    bookData.bookWidth = data.bookWidth || 300;
                    bookData.bookHeight = data.bookHeight || 400;
                    bookData.coverColor = data.coverColor || "#DC143C";
                    bookData.backCoverColor = data.backCoverColor || "#DC143C";

                    document.getElementById("bookName").value = bookData.bookName;
                    document.getElementById("bookWidth").value = bookData.bookWidth;
                    document.getElementById("bookHeight").value = bookData.bookHeight;
                    document.getElementById("coverColorInput").value = bookData.coverColor;
                    document.getElementById("backCoverColorInput").value = bookData.backCoverColor;

                    pages = data.pages || [];

                    sessionStorage.removeItem('loadedBookData');

                    setupEditor();
                    renderPageList();

                    try {
                        loadPageIntoEditor(0);
                    } catch (error) {
                        console.error("Error loading page into editor:", error);
                        notifications.error("Error initializing the editor. Please refresh the page.");
                    }

                    updateFlipBook();

                    BookEditorNotifications.bookLoaded(bookData.bookName || "Untitled Book");
                } catch (error) {
                    console.error("Error loading book:", error);
                    setupEditor();
                    ensureBasicPages();
                    renderPageList();

                    try {
                        loadPageIntoEditor(0);
                    } catch (error) {
                        console.error("Error loading page into editor:", error);
                        notifications.error("Error initializing the editor. Please refresh the page.");
                    }

                    setTimeout(() => {
                        window.location.href = 'welcome.html';
                    }, 500);
                }
            } else {
                window.location.href = 'welcome.html';
                return;
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
                }
            }, 100);
        }
    } catch (error) {
        console.error("Initialization error:", error);
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
                    
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (currentPageIndex >= 0 && currentPageIndex < pages.length) {
                            pages[currentPageIndex].backgroundImage = event.target.result;
                            
                            const imagePreview = document.getElementById('image-preview');
                            if (imagePreview) {
                                imagePreview.style.backgroundImage = `url(${event.target.result})`;
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
                item.classList.add("selected");
            } else {
                item.classList.remove("selected");
            }
        });
        
    } catch (error) {
        console.error("Error updating UI after page load:", error);
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

window.addEventListener('beforeunload', function () {
});

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('newBook') && !urlParams.has('loadBook')) {
        window.location.href = 'welcome.html';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (!window.location.href.includes('welcome.html') && window.location.pathname.includes('Book Editor')) {
        window.location.href = 'welcome.html';
    }
});

window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);

    if (!urlParams.has('newBook') && !urlParams.has('loadBook')) {
        window.location.href = 'welcome.html';
        return;
    }
});

window.addEventListener('beforeunload', function (event) {
    sessionStorage.removeItem('newBookWizardData');

    sessionStorage.setItem('isReloading', 'true');
});

document.addEventListener('DOMContentLoaded', function () {
    const isReloading = sessionStorage.getItem('isReloading');
    const urlParams = new URLSearchParams(window.location.search);

    sessionStorage.removeItem('isReloading');

    if (isReloading === 'true' && (!urlParams.has('newBook') || !urlParams.has('loadBook'))) {
        window.location.href = 'welcome.html';
        return;
    }

    if (window.location.pathname.endsWith('index.html') &&
        !urlParams.has('newBook') &&
        !urlParams.has('loadBook')) {
        window.location.href = 'welcome.html';
        return;
    }
});

window.addEventListener('beforeunload', function () {
    sessionStorage.clear();
    localStorage.removeItem('newBookWizardData');
    localStorage.removeItem('loadedBookData');
});

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);

    if (!urlParams.has('newBook') && !urlParams.has('loadBook')) {
        window.location.href = 'welcome.html';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    initUI();
});

window.addEventListener("load", init);