/**
 * Funciones compartidas entre diferentes componentes del asistente
 * para asegurar consistencia y evitar duplicación
 */

function updatePagesVisual() {
    const pagesCount = parseInt(document.getElementById('wizard-page-count')?.value) || 1;
    const pagesContainer = document.getElementById('pages-visual-container');
    if (!pagesContainer) return;
    
    pagesContainer.innerHTML = '';
    
    const totalPages = pagesCount + 2;
    
    const coverIcon = document.createElement('div');
    coverIcon.className = 'page-item cover';
    coverIcon.textContent = 'FRONT';
    
    if (window.bookData && window.bookData.coverImageEnabled && window.bookData.coverImage) {
        coverIcon.style.backgroundImage = `url(${window.bookData.coverImage})`;
        coverIcon.style.backgroundColor = 'transparent';
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
    
    const backIcon = document.createElement('div');
    backIcon.className = 'page-item back';
    backIcon.textContent = 'BACK';
    
    if (window.bookData && window.bookData.backCoverImageEnabled && window.bookData.backCoverImage) {
        backIcon.style.backgroundImage = `url(${window.bookData.backCoverImage})`;
        backIcon.style.backgroundColor = 'transparent';
        backIcon.style.transform = 'none';
    } else if (window.bookData) {
        backIcon.style.backgroundColor = window.bookData.backCoverColor || '#DC143C';
        backIcon.style.backgroundImage = '';
    }
    
    pagesContainer.appendChild(backIcon);
    
    const summaryPages = document.getElementById('summary-pages');
    if (summaryPages) {
        summaryPages.textContent = `${totalPages} (${pagesCount} inner pages + front and back cover)`;
        
        if (window.bookData) {
            window.bookData.pageCount = pagesCount;
        }
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
        const pageCount = parseInt(pageInput.value) || 1;
        window.bookData.pageCount = pageCount;
        pageInput.value = pageCount;
        
        if (isNaN(window.bookData.pageCount) || window.bookData.pageCount < 1) {
            window.bookData.pageCount = 1;
            pageInput.value = 1;
        }
        
        const currentStep = document.querySelector('.wizard-step:not([style="display: none;"])');
        if (currentStep && currentStep.getAttribute('data-step') === '4') {
            updatePagesVisual();
        }
    }
    
    try {
        const safeJsonString = JSON.stringify(window.bookData, (key, value) => {
            if (typeof value === 'string') {
                return value;
            }
            return value;
        });
        
        localStorage.setItem('newBookWizardData', safeJsonString);
        console.log('Datos del asistente guardados en localStorage, pageCount:', window.bookData.pageCount);
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        try {
            const dataWithoutImages = {...window.bookData};
            if (dataWithoutImages.coverImage) dataWithoutImages.coverImage = '';
            if (dataWithoutImages.backCoverImage) dataWithoutImages.backCoverImage = '';
            
            localStorage.setItem('newBookWizardData', JSON.stringify(dataWithoutImages));
            console.log('Datos guardados sin imágenes debido a limitaciones de almacenamiento');
        } catch (fallbackError) {
            console.error('Error al intentar guardar versión reducida:', fallbackError);
        }
    }
}

window.saveBookDataToLocalStorage = saveBookDataToLocalStorage;
