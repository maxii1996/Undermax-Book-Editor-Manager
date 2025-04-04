/**
 * Panel Resize System
 * Provides functionality to resize the side panels
 */

(function() {
    let isResizing = false;
    let currentPanel = null;
    let startX = 0;
    let startWidth = 0;
    let windowWidth = 0;
    
    const MIN_PERCENTAGE = 10;
    const MAX_PERCENTAGE = 25;
    
    function initPanelResize() {
        const leftResizer = document.getElementById('left-panel-resizer');
        const rightResizer = document.getElementById('right-panel-resizer');
        
        if (leftResizer) {
            leftResizer.addEventListener('mousedown', function(e) {
                startResize(e, 'left-panel');
            });
        }
        
        if (rightResizer) {
            rightResizer.addEventListener('mousedown', function(e) {
                startResize(e, 'right-panel');
            });
        }
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        window.addEventListener('resize', updateConstraints);
    }
    
    function startResize(e, panelId) {
        e.preventDefault();
        isResizing = true;
        currentPanel = document.getElementById(panelId);
        startX = e.clientX;
        startWidth = currentPanel.offsetWidth;
        windowWidth = window.innerWidth;
        
        e.target.classList.add('active');
        document.body.classList.add('resizing');
    }
    
    function resize(e) {
        if (!isResizing) return;
        
        const minWidth = windowWidth * (MIN_PERCENTAGE / 100);
        const maxWidth = windowWidth * (MAX_PERCENTAGE / 100);
        
        if (currentPanel.id === 'left-panel') {
            let newWidth = startWidth + (e.clientX - startX);
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            currentPanel.style.width = newWidth + 'px';
        } else if (currentPanel.id === 'right-panel') {
            let newWidth = startWidth - (e.clientX - startX);
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            currentPanel.style.width = newWidth + 'px';
        }
        
        updateLayout();
    }
    
    function stopResize() {
        if (!isResizing) return;
        
        isResizing = false;
        document.body.classList.remove('resizing');
        
        if (currentPanel) {
            const widthPercentage = (currentPanel.offsetWidth / windowWidth) * 100;
            currentPanel.style.width = widthPercentage + '%';
            
            document.querySelectorAll('.panel-resize-handle').forEach(handle => {
                handle.classList.remove('active');
            });
            
            currentPanel = null;
        }
        
        updateLayout();
        saveLayoutPreferences();
    }
    
    function updateLayout() {
        if (typeof updateEditorSize === 'function') {
            updateEditorSize();
        }
        
        if (typeof calculateAutoZoom === 'function') {
            calculateAutoZoom();
        }
        
        if (typeof updateZoom === 'function') {
            updateZoom();
        }
        
        if (typeof updateFlipBook === 'function') {
            updateFlipBook();
        }
        
        if (typeof updateSliderProgress === 'function') {
            updateSliderProgress();
        }
        
        const leftPanel = document.getElementById('left-panel');
        const rightPanel = document.getElementById('right-panel');
        
        if (leftPanel && leftPanel.classList.contains('collapsed')) {
            leftPanel.style.width = '0';
        }
        
        if (rightPanel && rightPanel.classList.contains('collapsed')) {
            rightPanel.style.width = '0';
        }
    }
    
    function updateConstraints() {
        windowWidth = window.innerWidth;
        
        const leftPanel = document.getElementById('left-panel');
        const rightPanel = document.getElementById('right-panel');
        
        if (leftPanel && !isResizing) {
            const leftWidth = parseFloat(window.getComputedStyle(leftPanel).width);
            const leftPercentage = (leftWidth / windowWidth) * 100;
            
            if (leftPercentage < MIN_PERCENTAGE) {
                leftPanel.style.width = MIN_PERCENTAGE + '%';
            } else if (leftPercentage > MAX_PERCENTAGE) {
                leftPanel.style.width = MAX_PERCENTAGE + '%';
            }
        }
        
        if (rightPanel && !isResizing) {
            const rightWidth = parseFloat(window.getComputedStyle(rightPanel).width);
            const rightPercentage = (rightWidth / windowWidth) * 100;
            
            if (rightPercentage < MIN_PERCENTAGE) {
                rightPanel.style.width = MIN_PERCENTAGE + '%';
            } else if (rightPercentage > MAX_PERCENTAGE) {
                rightPanel.style.width = MAX_PERCENTAGE + '%';
            }
        }
        
        updateLayout();
    }
    
    function loadLayoutPreferences() {
        try {
            const savedLayout = localStorage.getItem('bookEditorLayout');
            if (savedLayout) {
                const layout = JSON.parse(savedLayout);
                
                const leftPanel = document.getElementById('left-panel');
                const rightPanel = document.getElementById('right-panel');
                
                if (leftPanel && layout.leftPanelWidth && !leftPanel.classList.contains('collapsed')) {
                    leftPanel.style.width = Math.max(MIN_PERCENTAGE, Math.min(MAX_PERCENTAGE, layout.leftPanelWidth)) + '%';
                }
                
                if (rightPanel && layout.rightPanelWidth && !rightPanel.classList.contains('collapsed')) {
                    rightPanel.style.width = Math.max(MIN_PERCENTAGE, Math.min(MAX_PERCENTAGE, layout.rightPanelWidth)) + '%';
                }
                
                updateLayout();
            }
        } catch (error) {
            console.error('Error loading layout preferences:', error);
        }
    }
    
    function saveLayoutPreferences() {
        try {
            const leftPanel = document.getElementById('left-panel');
            const rightPanel = document.getElementById('right-panel');
            
            const layout = {
                leftPanelWidth: leftPanel ? parseFloat((leftPanel.offsetWidth / windowWidth) * 100) : null,
                rightPanelWidth: rightPanel ? parseFloat((rightPanel.offsetWidth / windowWidth) * 100) : null
            };
            
            localStorage.setItem('bookEditorLayout', JSON.stringify(layout));
        } catch (error) {
            console.error('Error saving layout preferences:', error);
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        initPanelResize();
        
        setTimeout(loadLayoutPreferences, 100);
    });
})();
