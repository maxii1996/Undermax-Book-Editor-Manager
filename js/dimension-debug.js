/**
 * Utilidades para depurar problemas de dimensiones
 */

function debugDimensions() {
    if (!window.isDebugEnabled || !window.isDebugEnabled()) {
        console.log("Debug mode is disabled. Enable with Ctrl+Shift+D.");
        return;
    }
    
    console.group("Book Dimensions Debug");
    console.log("Current dimensions in bookData:", {
        width: bookData.bookWidth,
        height: bookData.bookHeight
    });

    const editorContainer = document.getElementById("editor-container");
    if (editorContainer) {
        console.log("Editor container dimensions:", {
            width: editorContainer.style.width,
            height: editorContainer.style.height,
            computedWidth: window.getComputedStyle(editorContainer).width,
            computedHeight: window.getComputedStyle(editorContainer).height
        });
    }

    console.log("Pages dimensions:", pages.map(page => ({
        index: pages.indexOf(page),
        width: page.width,
        height: page.height
    })));

    console.groupEnd();
}

document.addEventListener('DOMContentLoaded', () => {
    const existingDebugBtn = document.querySelector('button[innerText="Debug"]');
    if (existingDebugBtn) {
        const originalClick = existingDebugBtn.onclick;
        existingDebugBtn.onclick = function () {
            if (originalClick) originalClick.call(this);
            debugDimensions();
        };
    }
});

window.forceUpdateDimensions = function () {
    if (!window.isDebugEnabled || !window.isDebugEnabled()) {
        console.log("Debug mode is disabled. Enable with Ctrl+Shift+D.");
        return;
    }
    
    updateAllPageDimensions();
    updateEditorSize();
    console.log("✅ Dimensiones actualizadas forzosamente");
}
