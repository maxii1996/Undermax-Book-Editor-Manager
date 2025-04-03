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
    if (!window.notifications || !window.BookEditorNotifications) {
        console.error("Notification system not loaded. Please check that all required scripts are loaded.");
        setTimeout(init, 100);
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const newBook = urlParams.get('newBook');
    const loadBook = urlParams.get('loadBook');
    
    if (newBook === 'true') {
        const newBookData = sessionStorage.getItem('newBookWizardData');
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
                
                sessionStorage.removeItem('newBookWizardData');
                
                initQuill();
                setupEditor();
                renderPageList();
                loadPageIntoEditor(0);
                updateFlipBook();
                
                BookEditorNotifications.bookLoaded(bookData.bookName || "Untitled Book");
            } catch (error) {
                console.error("Error loading new book data:", error);
                initQuill();
                setupEditor();
                ensureBasicPages();
                renderPageList();
                loadPageIntoEditor(0);
                setTimeout(() => {
                    window.location.href = 'welcome.html';
                }, 500);
            }
        } else {
            initQuill();
            setupEditor();
            ensureBasicPages();
            renderPageList();
            loadPageIntoEditor(0);
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
                
                initQuill();
                setupEditor();
                renderPageList();
                loadPageIntoEditor(0);
                updateFlipBook();
                
                BookEditorNotifications.bookLoaded(bookData.bookName || "Untitled Book");
            } catch (error) {
                console.error("Error loading book:", error);
                initQuill();
                setupEditor();
                ensureBasicPages();
                renderPageList();
                loadPageIntoEditor(0);
                setTimeout(() => {
                    window.location.href = 'welcome.html';
                }, 500);
            }
        } else {
            window.location.href = 'welcome.html';
            return;
        }
    } else {
        window.location.href = 'welcome.html';
        return;
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

}

function attachEventListeners() {
    document.getElementById("add-page-btn").addEventListener("click", addMiddlePage);
    document.getElementById("load-book-btn").addEventListener("click", loadBookFile);
    document.getElementById("file-input").addEventListener("change", handleFileLoad);
    document.getElementById("bg-image-input").addEventListener("change", handleImageUpload);
    document.getElementById("browse-image-btn").addEventListener("click", () => {
        document.getElementById("bg-image-input").click();
    });
    
    document.getElementById("remove-image-btn").addEventListener("click", () => {
        removeBackgroundImage();
        updateRemoveImageButtonState();
    });

    document.getElementById("applyDimensions").addEventListener("click", () => {
        updateAllPageDimensions();
    });

    document.getElementById("coverColorInput").addEventListener("input", () => {
        saveEditorChanges();
        updateFlipBook();
    });

    document.getElementById("backCoverColorInput").addEventListener("input", () => {
        saveEditorChanges();
        updateFlipBook();
    });

    document.getElementById("pageBgColor").addEventListener("input", () => {
        saveEditorChanges();
        loadPageIntoEditor(currentPageIndex);
        updateFlipBook();
    });

    document.getElementById("prev-btn").addEventListener("click", goPrev);
    document.getElementById("next-btn").addEventListener("click", goNext);
    document.getElementById("download-btn").addEventListener("click", downloadJSON);

    document.getElementById("resetDimensions").addEventListener("click", resetDimensionsToDefault);

    document.getElementById("editorColorInput").addEventListener("input", () => {
        bookData.editorColor = document.getElementById("editorColorInput").value;
        updateEditorColor();
        saveSettings();
    });

    document.getElementById("bookName").addEventListener("input", () => {
        bookData.bookName = document.getElementById("bookName").value || "undermaxbook";
        saveSettings();
        updateSaveButtonState();
    });

    const oldLoadBtn = document.getElementById("left-panel").querySelector("#load-book-btn");
    if (oldLoadBtn) {
        oldLoadBtn.remove();
    }
    
    
    const homeBtn = document.getElementById("home-btn");
    const homeDialog = document.getElementById("home-confirmation-dialog");
    const closeDialogBtn = document.getElementById("close-dialog-btn");
    const cancelHomeBtn = document.getElementById("cancel-home-btn");
    const confirmHomeBtn = document.getElementById("confirm-home-btn");
    
    homeBtn.addEventListener("click", function() {
        homeDialog.style.display = "flex";
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                homeDialog.classList.add("show");
            });
        });
    });
    
    function closeHomeDialog() {
        homeDialog.classList.remove("show");
        setTimeout(() => {
            homeDialog.style.display = "none";
        }, 500);
    }
    
    closeDialogBtn.addEventListener("click", closeHomeDialog);
    cancelHomeBtn.addEventListener("click", closeHomeDialog);
    
    confirmHomeBtn.addEventListener("click", function() {
        window.location.href = 'welcome.html';
    });
}

function updateInfoBar() {
    const infoBar = document.getElementById("info-bar");
    if (currentPageIndex === 0) {
        infoBar.textContent = "Editing: Cover (page 1 of " + pages.length + ")";
    } else if (currentPageIndex === pages.length - 1) {
        infoBar.textContent = "Editing: Back Cover (page " + pages.length + " of " + pages.length + ")";
    } else {
        infoBar.textContent = "Editing: Page " + (currentPageIndex + 1) + " of " + pages.length;
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
    updateEditorColor();
    
    const editorContainer = document.getElementById("editor-container");
    if (editorContainer) {
        editorContainer.style.width = bookData.bookWidth + "px";
        editorContainer.style.height = bookData.bookHeight + "px";
    }
    
    updateSaveButtonState();
}

window.addEventListener("load", init);

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const skipWelcome = (urlParams.has('newBook') && urlParams.get('newBook') === 'true') || 
                        (urlParams.has('loadBook') && urlParams.get('loadBook') === 'true');
                        
    if (!skipWelcome) {
        window.location.href = 'welcome.html';
        return;
    }
    
    if (urlParams.get('newBook') === 'true') {
        const wizardData = localStorage.getItem('newBookWizardData');
        if (wizardData) {
            try {
                const parsedData = JSON.parse(wizardData);
                
                if (Array.isArray(parsedData.pages)) {
                    console.log(`Cargando libro con ${parsedData.pages.length} páginas desde el asistente`);
                    pages = parsedData.pages;
                    
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
                    
                    localStorage.removeItem('newBookWizardData');
                    
                    setupEditor();
                    renderPageList();
                    loadPageIntoEditor(0);
                    updateFlipBook();
                    notifications.success('New book loaded successfully!');
                } else {
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
            ensureBasicPages();
            setupEditor();
            renderPageList();
            loadPageIntoEditor(0);
            updateFlipBook();
        }
    } else if (urlParams.get('loadBook') === 'true') {
        const loadedBookData = localStorage.getItem('loadedBookData');
        if (loadedBookData) {
        } else {
            loadSettings();
            initQuill();
            setupEditor();
            ensureBasicPages();
            renderPageList();
            loadPageIntoEditor(0);
        }
    } else {
        loadSettings();
        initQuill();
        setupEditor();
        ensureBasicPages();
        renderPageList();
        loadPageIntoEditor(0);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('newBook') && !urlParams.has('loadBook')) {
        window.location.href = 'welcome.html';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.href.includes('welcome.html') && window.location.pathname.includes('Book Editor')) {
        window.location.href = 'welcome.html';
    }
});

window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (!urlParams.has('newBook') && !urlParams.has('loadBook')) {
        window.location.href = 'welcome.html';
        return;
    }
});

window.addEventListener('beforeunload', function(event) {
    sessionStorage.removeItem('newBookWizardData');
    
    sessionStorage.setItem('isReloading', 'true');
});

document.addEventListener('DOMContentLoaded', function() {
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

window.addEventListener('beforeunload', function() {
    sessionStorage.clear();
    localStorage.removeItem('newBookWizardData');
    localStorage.removeItem('loadedBookData');
});

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (!urlParams.has('newBook') && !urlParams.has('loadBook')) {
        window.location.href = 'welcome.html';
    }
});