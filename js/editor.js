let editor = null;


function initEditor() {
    editor = document.getElementById("editor-inner");
    if (!editor) return;
    
    editor.contentEditable = "true";
    editor.designMode = "on";

    try {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch(e) {
        console.warn('Error inicializando comandos del editor:', e);
    }
    
    editor.addEventListener('paste', function(e) {
        e.preventDefault();
        
        let text;
        if (e.clipboardData || e.originalEvent.clipboardData) {
            text = (e.clipboardData || e.originalEvent.clipboardData).getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        
        const selection = window.getSelection();
        if (selection.rangeCount && text) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
    
    editor.addEventListener('input', function() {
        if (pages.length > 0) {
            const contentWarning = document.getElementById('content-warning');
            const globalContentWarning = document.getElementById('global-content-warning');
            
            if (editor.scrollHeight > editor.clientHeight) {
                if (contentWarning) contentWarning.style.display = 'block';
                if (globalContentWarning) globalContentWarning.style.display = 'block';
            } else {
                if (contentWarning) contentWarning.style.display = 'none';
                if (globalContentWarning) contentWarning.style.display = 'none';
            }

            if (currentPageIndex >= 0 && currentPageIndex < pages.length) {
                pages[currentPageIndex].contentHtml = editor.innerHTML;
                updateFlipBook();
                updateSaveButtonState();
            }

            if (bookData && bookData.saved === true) {
                bookData.saved = false;
                updateSaveButtonState();
            }
            
            saveEditorChanges();
        }
    });
    
    updateEditorSize();
    initToolbar();
    setupEditor();
}

function updateEditorSize(forcedWidth, forcedHeight) {
    const container = document.getElementById("editor-container");
    if (!container) return;

    const MIN_WIDTH = 200;
    const MAX_WIDTH = 800;
    const MIN_HEIGHT = 250;
    const MAX_HEIGHT = 1000;
    
    let width = forcedWidth || bookData.bookWidth || 300;
    let height = forcedHeight || bookData.bookHeight || 400;
    
    width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
    height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, height));
    
    container.style.width = width + "px";
    container.style.height = height + "px";
    
    updateEditorColor();
}

function updateEditorColor() {
    const color = bookData.editorColor;
    const editorInner = document.getElementById("editor-inner");
    
    if (editorInner) {
        editorInner.style.backgroundColor = color;
        
        if (!editorInner.hasChildNodes() || editorInner.innerHTML.trim() === '') {
            const brightness = getBrightness(color);
            const textColor = brightness > 128 ? "#000000" : "#FFFFFF";
            editorInner.style.color = textColor;
        }
    }
}

function updateEditorContentBackground() {
}

function getBrightness(hexColor) {
    const rgb = hexToRgb(hexColor);
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function execCommand(command, value = null) {
    try {
        document.execCommand(command, false, value);
    } catch (e) {
        console.warn(`Error ejecutando comando ${command}:`, e);
        applyFormattingAlternative(command, value);
    }
    
    editor.focus();
    updateToolbarState();
    editor.dispatchEvent(new Event('input'));
}

/**
 * Implementa alternativas para los comandos execCommand más comunes
 * utilizando técnicas modernas cuando sea posible
 */
function applyFormattingAlternative(command, value) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    
    const elementMap = {
        'bold': 'strong',
        'italic': 'em',
        'underline': 'u',
        'strikeThrough': 's'
    };
    
    if (elementMap[command]) {
        const element = document.createElement(elementMap[command]);
        const content = range.extractContents();
        element.appendChild(content);
        range.insertNode(element);
        
        range.setStartAfter(element);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
    }
    
    if (command.startsWith('justify')) {
        const alignment = command.replace('justify', '').toLowerCase();
        const paragraph = getNearestBlock(range.commonAncestorContainer);
        
        if (paragraph) {
            paragraph.style.textAlign = alignment;
        } else {
            const div = document.createElement('div');
            div.style.textAlign = alignment;
            const content = range.extractContents();
            div.appendChild(content);
            range.insertNode(div);
        }
        return;
    }
    
    if (command === 'foreColor') {
        const span = document.createElement('span');
        span.style.color = value;
        const content = range.extractContents();
        span.appendChild(content);
        range.insertNode(span);
        return;
    }
    
    if (command === 'hiliteColor') {
        const span = document.createElement('span');
        span.style.backgroundColor = value;
        const content = range.extractContents();
        span.appendChild(content);
        range.insertNode(span);
        return;
    }
    
    console.warn(`No hay implementación alternativa para el comando: ${command}`);
}

/**
 * Obtiene el bloque de texto más cercano (p, div, etc.)
 */
function getNearestBlock(node) {
    const blockElements = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'];
    
    if (node.nodeType === 3) {
        node = node.parentNode;
    }
    
    while (node && node !== editor) {
        if (blockElements.includes(node.tagName)) {
            return node;
        }
        node = node.parentNode;
    }
    
    return null;
}

function toggleBold() {
    execCommand('bold');
}

function toggleItalic() {
    execCommand('italic');
}

function toggleUnderline() {
    execCommand('underline');
}

function toggleStrikethrough() {
    execCommand('strikeThrough');
}

function setFontSize(size) {
    execCommand('fontSize', size);
}

function setFontFamily(family) {
    execCommand('fontName', family);
}

function setTextColor(color) {
    if (!editor) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    
    if (range.collapsed && (editor.innerHTML === '' || range.toString() === '')) {
        const span = document.createElement('span');
        span.style.color = color;
        span.innerHTML = '&nbsp;';
        
        if (editor.innerHTML === '') {
            editor.appendChild(span);
        } else {
            range.insertNode(span);
        }
        
        range.selectNodeContents(span);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        try {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('foreColor', false, color);
        } catch(e) {
            console.log("Usando implementación alternativa para color de texto:", e);
            
            const span = document.createElement('span');
            span.style.color = color;
            
            const content = range.extractContents();
            span.appendChild(content);
            range.insertNode(span);
            
            range.setStartAfter(span);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    editor.focus();
    updateToolbarState();
    editor.dispatchEvent(new Event('input'));
}

function setBackgroundColor(color) {
    if (!editor) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    
    if (range.collapsed && (editor.innerHTML === '' || range.toString() === '')) {
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        span.innerHTML = '&nbsp;';
        
        if (editor.innerHTML === '') {
            editor.appendChild(span);
        } else {
            range.insertNode(span);
        }
        
        range.selectNodeContents(span);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        try {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('hiliteColor', false, color);
        } catch(e) {
            console.log("Usando implementación alternativa para color de fondo:", e);
            
            const span = document.createElement('span');
            span.style.backgroundColor = color;
            
            const content = range.extractContents();
            span.appendChild(content);
            range.insertNode(span);
            
            range.setStartAfter(span);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    editor.focus();
    updateToolbarState();
    editor.dispatchEvent(new Event('input'));
}

function clearBackgroundColor() {
    if (!editor) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    
    if (range.collapsed && !hasBackgroundColorAtCursor()) {
        return;
    }
    
    try {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('hiliteColor', false, 'transparent');
    } catch (e) {
        console.log("Usando implementación alternativa para limpiar color de fondo:", e);
        
        try {
            const clonedRange = range.cloneRange();
            const fragment = clonedRange.extractContents();
            
            const cleanBackgroundStyles = (node) => {
                if (node.nodeType === 1) { 
                    if (node.style && node.style.backgroundColor) {
                        node.style.backgroundColor = '';
                    }
                    
                    if (node.tagName.toLowerCase() === 'span' && 
                        node.attributes.length === 0 && 
                        node.childNodes.length > 0) { 
                        const parent = node.parentNode;
                        
                        while (node.firstChild) {
                            parent.insertBefore(node.firstChild, node);
                        }
                        parent.removeChild(node);
                    } else {
                        Array.from(node.childNodes).forEach(cleanBackgroundStyles);
                    }
                }
            };
            
            cleanBackgroundStyles(fragment);
            
            range.insertNode(fragment);
            
            if (fragment.lastChild) {
                range.setStartAfter(fragment.lastChild);
                range.setEndAfter(fragment.lastChild);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            console.error("Error en la limpieza de estilos de fondo:", e);
        }
    }
    
    editor.focus();
    updateToolbarState();
    editor.dispatchEvent(new Event('input'));
}

function hasBackgroundColorAtCursor() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    
    const range = selection.getRangeAt(0);
    const parentElement = range.startContainer.parentNode;
    
    if (parentElement && parentElement.style && parentElement.style.backgroundColor) {
        return true;
    }
    
    if (parentElement && parentElement.parentNode) {
        const closestWithBgColor = findClosestElementWithBackgroundColor(parentElement);
        return !!closestWithBgColor;
    }
    
    return false;
}

function findClosestElementWithBackgroundColor(element) {
    if (!element || element === editor) return null;
    
    if (element.style && element.style.backgroundColor && element.style.backgroundColor !== 'transparent') {
        return element;
    }
    
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.backgroundColor && 
        computedStyle.backgroundColor !== 'transparent' && 
        computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        return element;
    }
    
    return findClosestElementWithBackgroundColor(element.parentNode);
}

function alignText(alignment) {
    execCommand('justify' + alignment);
}

function insertImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const MAX_IMAGE_SIZE_KB = 500;
            
            if (window.BookImageUtils && typeof window.BookImageUtils.isFileTooLarge === 'function') {
                if (BookImageUtils.isFileTooLarge(file, MAX_IMAGE_SIZE_KB)) {
                    input.value = '';
                    
                    let sizeStr = '';
                    try {
                        sizeStr = BookImageUtils.formatFileSize(file.size);
                    } catch (e) {
                        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                        sizeStr = sizeMB + 'MB';
                    }
                    
                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeStr}). Please use an image smaller than ${MAX_IMAGE_SIZE_KB}KB.`);
                    } else {
                        alert(`Image too large (${sizeStr}). Please use an image smaller than ${MAX_IMAGE_SIZE_KB}KB.`);
                    }
                    
                    return;
                }
            } else {
                if (file.size > (MAX_IMAGE_SIZE_KB * 1024)) {
                    input.value = '';
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    
                    if (window.notifications) {
                        window.notifications.error(`Image too large (${sizeMB}MB). Please use an image smaller than ${MAX_IMAGE_SIZE_KB}KB.`);
                    } else {
                        alert(`Image too large (${sizeMB}MB). Please use an image smaller than ${MAX_IMAGE_SIZE_KB}KB.`);
                    }
                    
                    return;
                }
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                img.style.resize = 'both';
                img.style.overflow = 'hidden';
                
                editor.focus();
                
                const selection = window.getSelection();
                let range;
                
                range = document.createRange();
                
                if (editor.childNodes.length === 0) {
                    editor.appendChild(document.createTextNode(''));
                    range.setStart(editor.firstChild, 0);
                    range.setEnd(editor.firstChild, 0);
                } else {
                    if (selection.rangeCount > 0) {
                        const currentRange = selection.getRangeAt(0);
                        let isInsideEditor = false;
                        
                        let node = currentRange.commonAncestorContainer;
                        while (node != null) {
                            if (node === editor) {
                                isInsideEditor = true;
                                break;
                            }
                            node = node.parentNode;
                        }
                        
                        if (isInsideEditor) {
                            range = currentRange;
                        } else {
                            range.selectNodeContents(editor);
                            range.collapse(false);
                        }
                    } else {
                        range.selectNodeContents(editor);
                        range.collapse(false);
                    }
                }
                
                selection.removeAllRanges();
                selection.addRange(range);
                
                range.deleteContents();
                range.insertNode(img);
                
                range.setStartAfter(img);
                range.setEndAfter(img);
                selection.removeAllRanges();
                selection.addRange(range);
                
                editor.dispatchEvent(new Event('input'));
            };
            reader.readAsDataURL(file);
        }
    };
}

function initToolbar() {
    let toolbar = document.getElementById('custom-editor-toolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'custom-editor-toolbar';
        toolbar.className = 'editor-toolbar';
        
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer && editorContainer.parentNode) {
            editorContainer.parentNode.insertBefore(toolbar, editorContainer);
        }
    }
    
    toolbar.innerHTML = `
        <div class="toolbar-wrapper">
            <div class="toolbar-group text-format">
                <button title="Bold" onclick="toggleBold()" class="toolbar-btn" data-tooltip="Bold"><i class="ri-bold"></i></button>
                <button title="Italic" onclick="toggleItalic()" class="toolbar-btn" data-tooltip="Italic"><i class="ri-italic"></i></button>
                <button title="Underline" onclick="toggleUnderline()" class="toolbar-btn" data-tooltip="Underline"><i class="ri-underline"></i></button>
                <button title="Strikethrough" onclick="toggleStrikethrough()" class="toolbar-btn" data-tooltip="Strikethrough"><i class="ri-strikethrough"></i></button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group font-controls">
                <div class="select-container font-family-select">
                    <select onchange="setFontFamily(this.value)" class="toolbar-select" aria-label="Font Family">
                        <option value="">Font</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Segoe UI">Segoe UI</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                    </select>
                    <i class="ri-arrow-down-s-line select-arrow"></i>
                </div>
                
                <div class="select-container font-size-select">
                    <select onchange="setFontSizePx(this.value)" class="toolbar-select" aria-label="Font Size">
                        <option value="">Size</option>
                        <option value="8px">8px</option>
                        <option value="10px">10px</option>
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                        <option value="28px">28px</option>
                        <option value="32px">32px</option>
                        <option value="48px">48px</option>
                        <option value="64px">64px</option>
                    </select>
                    <i class="ri-arrow-down-s-line select-arrow"></i>
                </div>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group color-controls">
                <div class="color-picker-wrapper" data-tooltip="Text Color">
                    <input type="color" onchange="setTextColor(this.value)" class="toolbar-color">
                    <div class="color-indicator"><i class="ri-font-color"></i></div>
                </div>
                <div class="color-picker-wrapper" data-tooltip="Background Color">
                    <input type="color" onchange="setBackgroundColor(this.value)" class="toolbar-color">
                    <div class="color-indicator bg-color"><i class="ri-paint-fill"></i></div>
                </div>
                <button title="Clear Background" onclick="clearBackgroundColor()" class="toolbar-btn" data-tooltip="Clear Background"><i class="ri-eraser-line"></i></button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group align-controls">
                <button title="Align Left" onclick="alignText('Left')" class="toolbar-btn" data-tooltip="Align Left"><i class="ri-align-left"></i></button>
                <button title="Align Center" onclick="alignText('Center')" class="toolbar-btn" data-tooltip="Align Center"><i class="ri-align-center"></i></button>
                <button title="Align Right" onclick="alignText('Right')" class="toolbar-btn" data-tooltip="Align Right"><i class="ri-align-right"></i></button>
                <button title="Justify" onclick="alignText('Full')" class="toolbar-btn" data-tooltip="Justify"><i class="ri-align-justify"></i></button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group media-controls">
                <button title="Insert Image" onclick="insertImage()" class="toolbar-btn" data-tooltip="Insert Image"><i class="ri-image-add-line"></i></button>
                <button title="Align Image Left" onclick="alignImage('left')" class="toolbar-btn" data-tooltip="Align Image Left"><i class="ri-align-left"></i></button>
                <button title="Align Image Center" onclick="alignImage('center')" class="toolbar-btn" data-tooltip="Align Image Center"><i class="ri-align-center"></i></button>
                <button title="Align Image Right" onclick="alignImage('right')" class="toolbar-btn" data-tooltip="Align Image Right"><i class="ri-align-right"></i></button>
                <button title="Increase Image Size" onclick="resizeImage(1.1)" class="toolbar-btn" data-tooltip="Increase Image Size"><i class="ri-zoom-in-line"></i></button>
                <button title="Decrease Image Size" onclick="resizeImage(0.9)" class="toolbar-btn" data-tooltip="Decrease Image Size"><i class="ri-zoom-out-line"></i></button>
                <button title="Reset Image Size" onclick="resetImageSize()" class="toolbar-btn" data-tooltip="Reset Image Size"><i class="ri-restart-line"></i></button>
            </div>
        </div>
    `;

    updateToolbarState();
    setupFormatPersistence();
}

function setupFormatPersistence() {
    return;
}

function updateToolbarState() {
    if (!editor) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const parentElement = selection.getRangeAt(0).commonAncestorContainer.parentElement || editor;
    
    const boldBtn = document.querySelector('[title="Bold"]');
    const italicBtn = document.querySelector('[title="Italic"]');
    const underlineBtn = document.querySelector('[title="Underline"]');
    const strikethroughBtn = document.querySelector('[title="Strikethrough"]');
    
    if (boldBtn) boldBtn.classList.toggle('active', document.queryCommandState('bold'));
    if (italicBtn) italicBtn.classList.toggle('active', document.queryCommandState('italic'));
    if (underlineBtn) underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    if (strikethroughBtn) strikethroughBtn.classList.toggle('active', document.queryCommandState('strikeThrough'));
    
    const alignLeftBtn = document.querySelector('[title="Align Left"]');
    const alignCenterBtn = document.querySelector('[title="Align Center"]');
    const alignRightBtn = document.querySelector('[title="Align Right"]');
    const alignJustifyBtn = document.querySelector('[title="Justify"]');
    
    const computedStyle = window.getComputedStyle(parentElement);
    const textAlign = computedStyle.textAlign;
    
    if (alignLeftBtn) alignLeftBtn.classList.toggle('active', textAlign === 'left' || textAlign === 'start');
    if (alignCenterBtn) alignCenterBtn.classList.toggle('active', textAlign === 'center');
    if (alignRightBtn) alignRightBtn.classList.toggle('active', textAlign === 'right');
    if (alignJustifyBtn) alignJustifyBtn.classList.toggle('active', textAlign === 'justify');
    
    const selectedImage = getSelectedImage();
    
    const imgAlignLeftBtn = document.querySelector('[title="Align Image Left"]');
    const imgAlignCenterBtn = document.querySelector('[title="Align Image Center"]');
    const imgAlignRightBtn = document.querySelector('[title="Align Image Right"]');
    
    if (imgAlignLeftBtn) imgAlignLeftBtn.classList.toggle('active', selectedImage && selectedImage.classList.contains('img-left'));
    if (imgAlignCenterBtn) imgAlignCenterBtn.classList.toggle('active', selectedImage && selectedImage.classList.contains('img-center'));
    if (imgAlignRightBtn) imgAlignRightBtn.classList.toggle('active', selectedImage && selectedImage.classList.contains('img-right'));
}

function setupEditor() {
    if (!editor) return;
    
    document.addEventListener('selectionchange', updateToolbarState);
    
    editor.addEventListener('click', updateToolbarState);
    
    updateToolbarState();
}

function alignImage(alignment) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    let selectedImage = getSelectedImage();
    
    if (!selectedImage) {
        const parentNode = range.commonAncestorContainer;
        if (parentNode.nodeType === 3) {
            selectedImage = findClosestImage(parentNode.parentNode);
        } else {
            selectedImage = findClosestImage(parentNode);
        }
        
        if (!selectedImage) {
            if (window.notifications) {
                notifications.info("Please select an image first.");
            } else {
                alert("Please select an image first.");
            }
            return;
        }
    }
    
    selectedImage.classList.remove('img-left', 'img-center', 'img-right');
    
    selectedImage.style.float = '';
    selectedImage.style.display = '';
    selectedImage.style.marginLeft = '';
    selectedImage.style.marginRight = '';
    
    switch(alignment) {
        case 'left':
            selectedImage.classList.add('img-left');
            selectedImage.style.float = 'left';
            selectedImage.style.marginRight = '1em';
            selectedImage.style.marginLeft = '0';
            break;
        case 'center':
            selectedImage.classList.add('img-center');
            selectedImage.style.display = 'block';
            selectedImage.style.marginLeft = 'auto';
            selectedImage.style.marginRight = 'auto';
            selectedImage.style.float = 'none';
            break;
        case 'right':
            selectedImage.classList.add('img-right');
            selectedImage.style.float = 'right';
            selectedImage.style.marginLeft = '1em';
            selectedImage.style.marginRight = '0';
            break;
    }
    
    selectedImage.style.outline = '2px solid #0078D7';
    setTimeout(() => {
        selectedImage.style.outline = '';
    }, 500);
    
    console.log(`Image alignment applied: ${alignment}`);
    
    if (typeof updateSaveButtonState === 'function') {
        updateSaveButtonState();
    }
    
    saveEditorChanges();
    updateFlipBook();
}

function getSelectedImage() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    
    const range = selection.getRangeAt(0);
    
    if (range.startContainer.nodeType === 1) {
        if (range.startContainer.tagName === 'IMG') {
            return range.startContainer;
        } 
        
        if (range.startOffset < range.startContainer.childNodes.length) {
            const node = range.startContainer.childNodes[range.startOffset];
            if (node && node.tagName === 'IMG') {
                return node;
            }
        }
    }
    
    let current = range.commonAncestorContainer;
    
    if (current.nodeType === 3 && current.parentNode) {
        const prevSibling = current.previousSibling;
        const nextSibling = current.nextSibling;
        
        if (prevSibling && prevSibling.tagName === 'IMG') {
            return prevSibling;
        }
        
        if (nextSibling && nextSibling.tagName === 'IMG') {
            return nextSibling;
        }
    }
    
    while (current && current !== editor) {
        if (current.tagName === 'IMG') {
            return current;
        }
        current = current.parentNode;
    }
    
    const editorImages = editor.querySelectorAll('img');
    if (editorImages.length === 1) {
        return editorImages[0];
    }
    
    return null;
}

function resizeImage(factor) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    let selectedImage = getSelectedImage();
    
    if (!selectedImage) {
        const parentNode = range.commonAncestorContainer;
        if (parentNode.nodeType === 3) {
            selectedImage = findClosestImage(parentNode.parentNode);
        } else {
            selectedImage = findClosestImage(parentNode);
        }
        
        if (!selectedImage) {
            notifications.info("Please select an image first.");
            return;
        }
    }
    
    let currentWidth = selectedImage.style.width ? 
        parseInt(selectedImage.style.width) : 
        selectedImage.naturalWidth;
    
    if (selectedImage.style.width && selectedImage.style.width.includes('%')) {
        currentWidth = (parseInt(selectedImage.style.width) / 100) * selectedImage.parentElement.offsetWidth;
    }
    
    const newWidth = Math.max(50, Math.min(currentWidth * factor, editor.offsetWidth * 0.95));
    selectedImage.style.width = `${Math.round(newWidth)}px`;
    selectedImage.style.height = 'auto';
    
    selectedImage.classList.add('resizable');
    
    if (typeof updateSaveButtonState === 'function') {
        updateSaveButtonState();
    }
    
    saveEditorChanges();
    updateFlipBook();
}

function resetImageSize() {
    const selectedImage = getSelectedImage();
    if (!selectedImage) {
        notifications.info("Please select an image first.");
        return;
    }
    
    selectedImage.style.width = '';
    selectedImage.style.height = '';
    selectedImage.classList.remove('resizable');
    
    if (typeof updateSaveButtonState === 'function') {
        updateSaveButtonState();
    }
    
    saveEditorChanges();
    updateFlipBook();
}

function findClosestImage(element) {
    if (element.tagName === 'IMG') {
        return element;
    }
    
    const directImg = element.querySelector('img');
    if (directImg) {
        return directImg;
    }
    
    let current = element;
    while (current && current !== editor) {
        const img = current.querySelector('img');
        if (img) {
            return img;
        }
        current = current.parentNode;
    }
    
    return null;
}

window.alignImage = alignImage;
window.resizeImage = resizeImage;
window.resetImageSize = resetImageSize;

const style = document.createElement('style');
style.textContent = `
    /* Removing old styles as they will be in the external CSS file */
`;
document.head.appendChild(style);

function setFontSizePx(size) {
    if (!size || size === '') return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    
    if (range.collapsed && editor.innerHTML === '') {
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.innerHTML = '&nbsp;';
        
        editor.appendChild(span);
        
        const newRange = document.createRange();
        newRange.setStart(span.firstChild, 1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    } else if (range.collapsed) {
        try {
            document.execCommand('styleWithCSS', false, true);
            
            const span = document.createElement('span');
            span.style.fontSize = size;
            span.innerHTML = '&#65279;';
            
            range.insertNode(span);
            
            range.setStart(span.firstChild, 1);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            console.warn('Error aplicando tamaño de fuente en cursor:', e);
        }
    } else {
        try {
            const span = document.createElement('span');
            span.style.fontSize = size;
            
            const content = range.extractContents();
            span.appendChild(content);
            range.insertNode(span);
            
            range.setStartAfter(span);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            console.warn('Error aplicando tamaño de fuente a selección:', e);
            try {
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('fontSize', false, size);
            } catch (e2) {
                console.error('No se pudo aplicar el tamaño de fuente:', e2);
            }
        }
    }
    
    editor.focus();
    updateToolbarState();
    editor.dispatchEvent(new Event('input'));
}

function setFontSize(size) {
    execCommand('fontSize', size);
}