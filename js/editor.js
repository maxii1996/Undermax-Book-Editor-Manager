function initQuill() {

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike', { 'color': [] }, { 'background': [] }, 'image'],
        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }, { 'align': [] }]
    ];

    document.getElementById('toolbar-container').innerHTML = '';

    quill = new Quill('#editor-inner', {
        modules: {
            toolbar: {
                container: toolbarOptions,
                handlers: {
                    'image': imageHandler,
                    'align': function (value) {
                        console.log("Alineando a:", value);
                        quill.format('align', value);
                    }
                }
            },
            imageResize: {
                modules: ['Resize']
            }
        },
        theme: 'snow',
        placeholder: 'Enter page content...',
        bounds: '#editor-wrapper'
    });

    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('image', imageHandler);

    quill.on('text-change', function () {
        if (pages.length > 0) {
            const contentWarning = document.getElementById('content-warning');
            const globalContentWarning = document.getElementById('global-content-warning');
            const editorRoot = quill.root;

            if (editorRoot.scrollHeight > editorRoot.clientHeight) {
                if (contentWarning) contentWarning.style.display = 'block';
                if (globalContentWarning) globalContentWarning.style.display = 'block';
            } else {
                if (contentWarning) contentWarning.style.display = 'none';
                if (globalContentWarning) contentWarning.style.display = 'none';
            }

            pages[currentPageIndex].contentHtml = quill.root.innerHTML;
            pages[currentPageIndex].alignment = quill.getFormat().align || '';
            updateFlipBook();
            updateSaveButtonState();
        }

        if (bookData && bookData.saved === true) {
            bookData.saved = false;
            updateSaveButtonState();
        }
        
        saveEditorChanges();
    });
    
    updateEditorSize();
}

function updateEditorSize() {
    if (bookData && bookData.bookWidth && bookData.bookHeight) {
        const editorContainer = document.getElementById("editor-container");
        if (editorContainer) {
            editorContainer.style.width = bookData.bookWidth + "px";
            editorContainer.style.height = bookData.bookHeight + "px";
        }
    }
}

function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const range = quill.getSelection(true);

                quill.insertEmbed(range.index, 'image', e.target.result, 'user');
                quill.setSelection(range.index + 1);

                setTimeout(() => {
                    const images = quill.root.querySelectorAll('img');
                    const lastImage = images[images.length - 1];
                    if (lastImage) {
                        lastImage.style.maxWidth = '100%';
                        lastImage.style.height = 'auto';
                    }
                }, 10);
            };
            reader.readAsDataURL(file);
        }
    };
}

function updateEditorColor() {
    const color = bookData.editorColor;
    document.getElementById("editor-inner").style.backgroundColor = color;

    const brightness = getBrightness(color);
    const textColor = brightness > 128 ? "#000000" : "#FFFFFF";
    document.getElementById("editor-inner").style.color = textColor;

    if (quill && quill.root) {
        quill.root.style.backgroundColor = color;
        quill.root.style.color = textColor;
    }
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
    } : { r: 255, g: 255, b: 255 };
}