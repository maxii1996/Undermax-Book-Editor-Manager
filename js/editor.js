let editor = null;

function initEditor() {
    editor = document.getElementById('editor-inner');
    editor.contentEditable = true;
    editor.className = 'custom-editor';
    
    editor.addEventListener('input', function() {
        if (pages.length > 0) {
            const contentWarning = document.getElementById('content-warning');
            const globalContentWarning = document.getElementById('global-content-warning');
            
            if (editor.scrollHeight > editor.clientHeight) {
                if (contentWarning) contentWarning.style.display = 'block';
                if (globalContentWarning) globalContentWarning.style.display = 'block';
            } else {
                if (contentWarning) contentWarning.style.display = 'none';
                if (globalContentWarning) globalContentWarning.style.display = 'none';
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
        
        const brightness = getBrightness(color);
        const textColor = brightness > 128 ? "#000000" : "#FFFFFF";
        editorInner.style.color = textColor;
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
    document.execCommand(command, false, value);
    editor.focus();
    updateToolbarState();
    editor.dispatchEvent(new Event('input'));
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
    execCommand('foreColor', color);
}

function setBackgroundColor(color) {
    execCommand('hiliteColor', color);
}

function clearBackgroundColor() {
    if (!editor) return;
    
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        try {
            document.execCommand('hiliteColor', false, '');
        } catch (e) {
            console.log("Error usando hiliteColor con cadena vacía:", e);
        }
        
        try {
            document.execCommand('backColor', false, 'transparent');
        } catch (e) {
            console.log("Error usando backColor:", e);
        }
        
        try {
            const clonedRange = range.cloneRange();
            const fragment = clonedRange.extractContents();
            
            const cleanBackgroundStyles = (node) => {
                if (node.nodeType === 1) {
                    if (node.style && node.style.backgroundColor) {
                        node.style.backgroundColor = '';
                    }
                    if (node.style && node.style.background) {
                        node.style.background = '';
                    }
                    
                    if (node.tagName.toLowerCase() === 'span' && 
                        !node.attributes.length && 
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
            
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            console.log("Error en la manipulación DOM:", e);
        }
    }
    
    updateToolbarState();
    editor.dispatchEvent(new Event('input'));
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
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                img.style.resize = 'both';
                img.style.overflow = 'hidden';
                
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(img);
                    
                    range.setStartAfter(img);
                    range.setEndAfter(img);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    editor.appendChild(img);
                }
                
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
                    <select onchange="setFontSize(this.value)" class="toolbar-select" aria-label="Font Size">
                        <option value="">Size</option>
                        <option value="1">Small</option>
                        <option value="3">Normal</option>
                        <option value="5">Large</option>
                        <option value="7">Huge</option>
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
            </div>
        </div>
    `;

    updateToolbarState();
    setupFormatPersistence();
}

function setupFormatPersistence() {
    if (!editor) return;
    
    const formatState = {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false
    };
    
    updateFormatState();
    
    const buttons = {
        bold: document.querySelector('[title="Bold"]'),
        italic: document.querySelector('[title="Italic"]'),
        underline: document.querySelector('[title="Underline"]'),
        strikethrough: document.querySelector('[title="Strikethrough"]')
    };
    
    Object.keys(buttons).forEach(format => {
        if (buttons[format]) {
            buttons[format].addEventListener('click', function() {
                formatState[format] = !formatState[format];
                updateFormatState();
            });
        }
    });
    
    editor.addEventListener('focus', function() {
        applyStoredFormatState();
    });
    
    editor.addEventListener('blur', function() {
        updateFormatState();
    });
    
    function updateFormatState() {
        formatState.bold = document.queryCommandState('bold');
        formatState.italic = document.queryCommandState('italic');
        formatState.underline = document.queryCommandState('underline');
        formatState.strikethrough = document.queryCommandState('strikethrough');
    }
    
    function applyStoredFormatState() {
        if (formatState.bold) execCommand('bold', false, null);
        if (formatState.italic) execCommand('italic', false, null);
        if (formatState.underline) execCommand('underline', false, null);
        if (formatState.strikethrough) execCommand('strikethrough', false, null);
        updateToolbarState();
    }
}

function updateToolbarState() {
    if (!editor) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const parentElement = selection.getRangeAt(0).commonAncestorContainer.parentElement || editor;
    
    const boldBtn = document.querySelector('[title="Bold"]');
    const italicBtn = document.querySelector('[title="Italic"]');
    const underlineBtn = document.querySelector('[title="Underline"]');
    const strikeBtn = document.querySelector('[title="Strikethrough"]');
    
    if (boldBtn) boldBtn.classList.toggle('active', document.queryCommandState('bold'));
    if (italicBtn) italicBtn.classList.toggle('active', document.queryCommandState('italic'));
    if (underlineBtn) underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    if (strikeBtn) strikeBtn.classList.toggle('active', document.queryCommandState('strikethrough'));
    
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
}

function setupEditor() {
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('input', updateToolbarState);
}

const style = document.createElement('style');
style.textContent = `
    /* Removing old styles as they will be in the external CSS file */
`;
document.head.appendChild(style);