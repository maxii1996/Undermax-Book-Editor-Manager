/**
 * Panel Toggle System
 * Provides functionality to collapse/expand the side panels
 */

(function() {
    let leftPanelState = 'expanded';
    let rightPanelState = 'expanded';
    let savedLeftPanelWidth = null;
    let savedRightPanelWidth = null;
    
    function initPanelToggles() {
        const leftPanel = document.getElementById('left-panel');
        const rightPanel = document.getElementById('right-panel');
        const toggleLeftBtn = document.getElementById('toggle-left-panel');
        const toggleRightBtn = document.getElementById('toggle-right-panel');
        
        if (toggleLeftBtn) {
            toggleLeftBtn.addEventListener('click', function() {
                toggleLeftPanel();
            });
        }
        
        if (toggleRightBtn) {
            toggleRightBtn.addEventListener('click', function() {
                toggleRightPanel();
            });
        }
        
        window.addEventListener('resize', function() {
            adjustLayout();
        });
    }
    
    function toggleLeftPanel() {
        const leftPanel = document.getElementById('left-panel');
        const toggleBtn = document.getElementById('toggle-left-panel');
        
        if (leftPanelState === 'expanded') {
            savedLeftPanelWidth = leftPanel.style.width;
            leftPanel.classList.add('collapsed');
            document.body.classList.add('left-panel-collapsed');
            toggleBtn.innerHTML = '<i class="ri-arrow-right-s-line"></i>';
            toggleBtn.setAttribute('title', 'Show Left Panel');
            leftPanelState = 'collapsed';
        } else {
            leftPanel.classList.remove('collapsed');
            document.body.classList.remove('left-panel-collapsed');
            if (savedLeftPanelWidth) {
                leftPanel.style.width = savedLeftPanelWidth;
            }
            toggleBtn.innerHTML = '<i class="ri-arrow-left-s-line"></i>';
            toggleBtn.setAttribute('title', 'Hide Left Panel');
            leftPanelState = 'expanded';
        }
        
        adjustLayout();
        
        if (typeof calculateAutoZoom === 'function') {
            setTimeout(calculateAutoZoom, 300);
        }
    }
    
    function toggleRightPanel() {
        const rightPanel = document.getElementById('right-panel');
        const toggleBtn = document.getElementById('toggle-right-panel');
        
        if (rightPanelState === 'expanded') {
            savedRightPanelWidth = rightPanel.style.width;
            rightPanel.classList.add('collapsed');
            document.body.classList.add('right-panel-collapsed');
            toggleBtn.innerHTML = '<i class="ri-arrow-left-s-line"></i>';
            toggleBtn.setAttribute('title', 'Show Right Panel');
            rightPanelState = 'collapsed';
        } else {
            rightPanel.classList.remove('collapsed');
            document.body.classList.remove('right-panel-collapsed');
            if (savedRightPanelWidth) {
                rightPanel.style.width = savedRightPanelWidth;
            }
            toggleBtn.innerHTML = '<i class="ri-arrow-right-s-line"></i>';
            toggleBtn.setAttribute('title', 'Hide Right Panel');
            rightPanelState = 'expanded';
        }
        
        adjustLayout();
        
        if (typeof calculateAutoZoom === 'function') {
            setTimeout(calculateAutoZoom, 300);
        }
    }
    
    function adjustLayout() {
        if (typeof updateEditorSize === 'function') {
            updateEditorSize();
        }
        
        if (typeof updateFlipBook === 'function') {
            updateFlipBook();
        }
        
        const middlePanel = document.getElementById('middle-panel');
        if (middlePanel) {
            middlePanel.style.flex = '1';
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        initPanelToggles();
    });
    
    window.toggleLeftPanel = toggleLeftPanel;
    window.toggleRightPanel = toggleRightPanel;
})();
