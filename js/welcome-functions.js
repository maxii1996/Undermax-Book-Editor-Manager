/**
 * Funciones compartidas entre diferentes componentes del asistente
 * para asegurar consistencia y evitar duplicación
 */

function updatePagesVisual() {
    if (typeof window.updatePagesVisual === 'function' && window.updatePagesVisual !== updatePagesVisual) {
        return window.updatePagesVisual();
    }
    
    const pagesCount = parseInt(document.getElementById('wizard-page-count')?.value) || 1;
    const pagesContainer = document.getElementById('pages-visual-container');
    if (!pagesContainer) return;
    
    pagesContainer.innerHTML = '';
    
    const totalPages = pagesCount + 2;
    
    // Create front cover with proper style
    const coverIcon = document.createElement('div');
    coverIcon.className = 'page-item cover';
    coverIcon.textContent = 'FRONT';
    
    if (window.bookData && window.bookData.coverType === 'image' && window.bookData.coverImage) {
        coverIcon.style.backgroundImage = `url(${window.bookData.coverImage})`;
        coverIcon.style.backgroundColor = 'transparent';
        // Ensure no transform is initially applied
        coverIcon.style.transform = 'none';
    } else if (window.bookData) {
        coverIcon.style.backgroundColor = window.bookData.coverColor || '#DC143C';
        coverIcon.style.backgroundImage = '';
    }
    
    pagesContainer.appendChild(coverIcon);
    
    if (pagesCount <= 5) {
        for (let i = 1; i <= pagesCount; i++) {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.textContent = i;
            pagesContainer.appendChild(pageItem);
        }
    } else {
        for (let i = 1; i <= 2; i++) {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.textContent = i;
            pagesContainer.appendChild(pageItem);
        }
        
        const ellipsis = document.createElement('div');
        ellipsis.className = 'page-item ellipsis';
        ellipsis.innerHTML = '&hellip;';
        pagesContainer.appendChild(ellipsis);
        
        for (let i = pagesCount - 1; i <= pagesCount; i++) {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.textContent = i;
            pagesContainer.appendChild(pageItem);
        }
    }
    
    // Create back cover with proper style
    const backIcon = document.createElement('div');
    backIcon.className = 'page-item back';
    backIcon.textContent = 'BACK';
    
    if (window.bookData && window.bookData.backCoverType === 'image' && window.bookData.backCoverImage) {
        backIcon.style.backgroundImage = `url(${window.bookData.backCoverImage})`;
        backIcon.style.backgroundColor = 'transparent';
        // Ensure no transform is initially applied
        backIcon.style.transform = 'none';
    } else if (window.bookData) {
        backIcon.style.backgroundColor = window.bookData.backCoverColor || '#DC143C';
        backIcon.style.backgroundImage = '';
    }
    
    pagesContainer.appendChild(backIcon);
    
    const summaryPages = document.getElementById('summary-pages');
    if (summaryPages) {
        summaryPages.textContent = `${totalPages} (${pagesCount} inner pages + front and back cover)`;
    }
}

window.updatePagesVisual = updatePagesVisual;

function saveBookDataToLocalStorage() {
    if (!window.bookData) return;
    
    const bookNameInput = document.getElementById('wizard-book-name');
    const widthInput = document.getElementById('wizard-width');
    const heightInput = document.getElementById('wizard-height');
    const pageInput = document.getElementById('wizard-page-count');
    
    if (bookNameInput) {
        window.bookData.bookName = bookNameInput.value.trim();
    }
    
    if (widthInput && heightInput) {
        const width = parseInt(widthInput.value) || 350;
        const height = parseInt(heightInput.value) || 400;
        
        window.bookData.width = width;
        window.bookData.height = height;
        widthInput.value = width;
        heightInput.value = height;
    }
    
    if (pageInput) {
        window.bookData.pageCount = parseInt(pageInput.value) || 1;
        if (isNaN(window.bookData.pageCount) || window.bookData.pageCount < 1) {
            window.bookData.pageCount = 1;
            pageInput.value = 1;
        }
        
        const currentStep = document.querySelector('.wizard-step:not([style="display: none;"])');
        if (currentStep && currentStep.getAttribute('data-step') === '4') {
            updatePagesVisual();
        }
    }
    
    localStorage.setItem('newBookWizardData', JSON.stringify(window.bookData));
    console.log('Datos del asistente guardados en localStorage, pageCount:', window.bookData.pageCount);
}

window.saveBookDataToLocalStorage = saveBookDataToLocalStorage;
