/**
 * Este archivo garantiza la sincronización entre el número de páginas seleccionado
 * y su representación visual en el asistente de creación de libros.
 */

document.addEventListener('DOMContentLoaded', function() {
    const wizardContainer = document.querySelector('.wizard-container');
    if (!wizardContainer) return;
    
    setTimeout(forceUpdatePagesVisual, 200);
    
    function forceUpdatePagesVisual() {
        if (typeof updatePagesVisual === 'function') {
            updatePagesVisual();
        } else if (typeof window.updatePagesVisual === 'function') {
            window.updatePagesVisual();
        } else {
            console.warn('La función updatePagesVisual no está disponible');
            
            if (typeof updatePageIcons === 'function') {
                const pageCount = parseInt(document.getElementById('wizard-page-count').value) || 1;
                updatePageIcons(pageCount);
            } else if (window.bookData && typeof window.bookData.pageCount !== 'undefined') {
                const pageCountElement = document.getElementById('wizard-page-count');
                if (pageCountElement) {
                    const pageCount = parseInt(pageCountElement.value) || window.bookData.pageCount || 1;
                    if (typeof window.updatePageIcons === 'function') {
                        window.updatePageIcons(pageCount);
                    }
                }
            }
        }
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' &&
                mutation.target.classList.contains('wizard-step')) {
                
                if (mutation.target.getAttribute('data-step') === '4' && 
                    mutation.target.style.display === 'block') {
                    
                    setTimeout(forceUpdatePagesVisual, 50);
                }
            }
        });
    });
    
    const wizardSteps = document.querySelectorAll('.wizard-step');
    wizardSteps.forEach(function(step) {
        observer.observe(step, { attributes: true });
    });
    
    const pageCountInput = document.getElementById('wizard-page-count');
    if (pageCountInput) {
        pageCountInput.addEventListener('change', forceUpdatePagesVisual);
        pageCountInput.addEventListener('input', forceUpdatePagesVisual);
    }
    
    const step4 = document.querySelector('.wizard-step[data-step="4"]');
    if (step4 && step4.style.display === 'block') {
        setTimeout(forceUpdatePagesVisual, 100);
    }
});
