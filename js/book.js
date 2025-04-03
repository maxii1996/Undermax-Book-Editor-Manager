function saveSettings() {
}

function loadSettings() {
    document.getElementById("bookName").value = bookData.bookName;
    document.getElementById("bookWidth").value = bookData.bookWidth;
    document.getElementById("bookHeight").value = bookData.bookHeight;
    document.getElementById("coverColorInput").value = bookData.coverColor;
    document.getElementById("backCoverColorInput").value = bookData.backCoverColor;
    document.getElementById("editorColorInput").value = bookData.editorColor;

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
        div.className = "page-item"; // Add this class
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

document.addEventListener('DOMContentLoaded', function() {
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
        confirmDeleteBtn.addEventListener('click', function() {
            const pageIndex = parseInt(this.getAttribute('data-page-index'), 10);
            deletePage(pageIndex);
            hideDeleteDialog();
        });
    }
});

function saveEditorChanges() {
    if (pages.length === 0) return;

    const minWidth = 200;
    const minHeight = 250;
    const maxWidth = 500;
    const maxHeight = 700;

    bookData.bookName = document.getElementById("bookName").value || "";

    let width = parseInt(document.getElementById("bookWidth").value, 10) || 300;
    let height = parseInt(document.getElementById("bookHeight").value, 10) || 400;

    width = Math.max(minWidth, Math.min(width, maxWidth));
    height = Math.max(minHeight, Math.min(height, maxHeight));

    bookData.bookWidth = width;
    bookData.bookHeight = height;

    document.getElementById("bookWidth").value = width;
    document.getElementById("bookHeight").value = height;

    bookData.coverColor = document.getElementById("coverColorInput").value;
    bookData.backCoverColor = document.getElementById("backCoverColorInput").value;
    bookData.editorColor = document.getElementById("editorColorInput").value;

    const p = pages[currentPageIndex];
    p.width = bookData.bookWidth;
    p.height = bookData.bookHeight;
    p.backgroundColor = document.getElementById("pageBgColor").value;
    p.backgroundImage = document.getElementById("pageBgImage").textContent !== "No image selected" ?
        p.backgroundImage : "";
    p.contentHtml = quill.root.innerHTML;

    const format = quill.getFormat();
    p.alignment = format.align || '';

    if (currentPageIndex === 0) {
        p.backgroundColor = bookData.coverColor;
    }
    if (currentPageIndex === pages.length - 1) {
        p.backgroundColor = bookData.backCoverColor;
    }

    if (typeof quill !== 'undefined' && quill) {
        p.contentHtml = quill.root.innerHTML;
        p.alignment = quill.getFormat().align || '';
    }

    if (currentPageIndex !== 0 && currentPageIndex !== pages.length - 1) {
        p.backgroundColor = document.getElementById("pageBgColor").value;
    }

    p.backgroundImage = document.getElementById("pageBgImage").textContent !== "No image selected" ?
        p.backgroundImage : '';
}

function updateAllPageDimensions() {
    const newWidth = parseInt(document.getElementById("bookWidth").value);
    const newHeight = parseInt(document.getElementById("bookHeight").value);

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
        return;
    }
    
    saveEditorChanges();

    showDimensionUpdateProgress();
    
    setTimeout(() => {
        bookData.bookWidth = newWidth;
        bookData.bookHeight = newHeight;

        pages.forEach((page, index) => {
            page.width = newWidth;
            page.height = newHeight;
            updateProgressDialog(index + 1, pages.length);
        });

        const editorContainer = document.getElementById("editor-container");
        if (editorContainer) {
            editorContainer.style.width = newWidth + "px";
            editorContainer.style.height = newHeight + "px";
        }

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

function setupDimensionsListeners() {
}

document.addEventListener('DOMContentLoaded', setupDimensionsListeners);

document.getElementById("applyDimensions").addEventListener("click", function (event) {
    updateAllPageDimensions();
    loadPageIntoEditor(currentPageIndex);
});

function removeBackgroundImage() {
    if (pages.length === 0) return;

    pages[currentPageIndex].backgroundImage = '';

    document.getElementById("pageBgImage").textContent = "No image selected";

    saveEditorChanges();

    updateRemoveImageButtonState();

    updateFlipBook();

    notifications.info("Background image removed");
}

function updateRemoveImageButtonState() {
    const removeButton = document.getElementById("remove-image-btn");
    const imageStatus = document.getElementById("pageBgImage").textContent;

    if (imageStatus === "No image selected") {
        removeButton.style.display = "none";
    } else {
        removeButton.style.display = "inline-flex";
    }
}

function loadPageIntoEditor(index) {
    currentPageIndex = index;
    document.getElementById("bookWidth").value = bookData.bookWidth;
    document.getElementById("bookHeight").value = bookData.bookHeight;
    document.getElementById("coverColorInput").value = bookData.coverColor;
    document.getElementById("backCoverColorInput").value = bookData.backCoverColor;

    const p = pages[index];
    document.getElementById("pageBgColor").value = p.backgroundColor;

    if (p.backgroundImage) {
        if (p.backgroundImage.includes('data:')) {
            document.getElementById("pageBgImage").textContent = "Embedded image";
        } else {
            document.getElementById("pageBgImage").textContent = p.backgroundImage.split('/').pop();
        }
    } else {
        document.getElementById("pageBgImage").textContent = "No image selected";
    }

    updateRemoveImageButtonState();

    document.getElementById("book-settings-group").style.display = "block";
    document.getElementById("cover-color-group").style.display = (index === 0) ? "block" : "none";
    document.getElementById("back-cover-color-group").style.display = (index === pages.length - 1) ? "block" : "none";
    document.getElementById("page-bg-color-group").style.display = (index !== 0 && index !== pages.length - 1) ? "block" : "none";
    document.getElementById("page-bg-image-group").style.display = "block";

    if (typeof quill !== 'undefined' && quill) {
        quill.root.innerHTML = p.contentHtml || "";

        setTimeout(() => {
            quill.setSelection(0, quill.getLength());

            if (p.alignment) {
                quill.format('align', p.alignment);
            }

            quill.setSelection(null);
        }, 10);

        const editorContainer = document.getElementById("editor-container");
        editorContainer.style.width = p.width + "px";
        editorContainer.style.height = p.height + "px";

        const contentWarning = document.getElementById('content-warning');
        const globalContentWarning = document.getElementById('global-content-warning');

        if (quill.root.scrollHeight > quill.root.clientHeight) {
            if (contentWarning) contentWarning.style.display = 'block';
            if (globalContentWarning) globalContentWarning.style.display = 'block';
        } else {
            if (contentWarning) contentWarning.style.display = 'none';
            if (globalContentWarning) globalContentWarning.style.display = 'none';
        }
    }

    updateInfoBar();
}

function goPrev() {
    if (currentPageIndex > 0) {
        saveEditorChanges();
        loadPageIntoEditor(currentPageIndex - 1);
        renderPageList();
        updateFlipBook();
    }
}

function goNext() {
    if (currentPageIndex < pages.length - 1) {
        saveEditorChanges();
        loadPageIntoEditor(currentPageIndex + 1);
        renderPageList();
        updateFlipBook();
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
        errorListHTML += `<li><strong>${issue.pageType}</strong>: ${issue.issue}</li>`;
    });
    
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
                <div class="dialog-actions">
                    <button id="validation-ok-btn" class="modern-button">OK</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDialog);
    
    errorDialog.style.display = 'flex';
    setTimeout(() => {
        errorDialog.classList.add('show');
    }, 10);
    
    document.getElementById('close-validation-errors').addEventListener('click', () => {
        hideValidationErrors();
    });
    
    document.getElementById('validation-ok-btn').addEventListener('click', () => {
        hideValidationErrors();
        
        if (issues.length > 0) {
            saveEditorChanges();
            loadPageIntoEditor(issues[0].page);
            renderPageList();
            updateFlipBook();
        }
    });
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
            const data = {
                bookName: bookData.bookName,
                bookWidth: bookData.bookWidth,
                bookHeight: bookData.bookHeight,
                coverColor: bookData.coverColor,
                backCoverColor: bookData.backCoverColor,
                pages: pages
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = bookData.bookName + ".json";
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
        window.confirm("Loading a new book will replace your current work. Continue?").then(result => {
            if (result) {
                processBookFile(file);
            } else {
                event.target.value = '';
            }
        });
    } else {
        processBookFile(file);
    }

    event.target.value = '';
}

function processBookFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const newData = JSON.parse(file);

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

            BookEditorNotifications.bookLoaded(bookData.bookName || "Untitled Book");
        } catch (error) {
            console.error("Error parsing JSON file:", error);
            BookEditorNotifications.bookLoadError(error.message);
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

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const imagePath = e.target.result;
        document.getElementById("pageBgImage").textContent = file.name;

        pages[currentPageIndex].backgroundImage = imagePath;

        updateRemoveImageButtonState();

        updateFlipBook();
    };

    reader.readAsDataURL(file);
    event.target.value = '';
}

function resetDimensionsToDefault() {
    const defaultWidth = 300;
    const defaultHeight = 400;
    const minWidth = 200;
    const minHeight = 250;
    const maxWidth = 500;
    const maxHeight = 700;

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