/**
 * Este archivo garantiza la sincronización entre el número de páginas seleccionado
 * y su representación visual en el asistente de creación de libros.
 */

document.addEventListener('DOMContentLoaded', function() {
    const wizardContainer = document.querySelector('.wizard-container');
    if (!wizardContainer) return;
    
    setTimeout(forceUpdatePagesVisual, 200);
    
    function forceUpdatePagesVisual() {
        const pagesContainer = document.getElementById('pages-visual-container');
        if (!pagesContainer) return;

        // Create a script to update the page icons
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                if (typeof window.updatePagesVisual === 'function') {
                    try {
                        // Get the current page count
                        const pageCountElement = document.getElementById('wizard-page-count');
                        if (pageCountElement) {
                            const pageCount = parseInt(pageCountElement.value) || 1;
                            
                            // Update window.bookData with the latest page count
                            if (!window.bookData) window.bookData = {};
                            window.bookData.pageCount = pageCount;
                            
                            // Ensure cover image settings are preserved
                            if (window.bookData.coverImage && !window.bookData.hasOwnProperty('coverImageEnabled')) {
                                window.bookData.coverImageEnabled = true;
                            }
                            
                            // Ensure back cover image settings are preserved
                            if (window.bookData.backCoverImage && !window.bookData.hasOwnProperty('backCoverImageEnabled')) {
                                window.bookData.backCoverImageEnabled = true;
                            }
                            
                            // Update the page icons
                            window.updatePagesVisual();
                            
                            // Update summary if it exists
                            const summaryPages = document.getElementById('summary-pages');
                            if (summaryPages) {
                                summaryPages.textContent = \`\${pageCount + 2} (\${pageCount} inner pages + front and back cover)\`;
                            }
                        }
                    } catch (e) {
                        console.error("Error in forceUpdatePagesVisual:", e);
                    }
                }
            })();
        `;
        document.body.appendChild(script);
        setTimeout(() => {
            document.body.removeChild(script);
        }, 100);
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
