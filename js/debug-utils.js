/**
 * Utilidades de depuración para el Book Editor
 */

function debugBookState() {
    console.group('Estado del Book Editor - Debug');

    console.log('URL:', window.location.href);
    console.log('Parámetros URL:', new URLSearchParams(window.location.search).toString());

    console.group('LocalStorage');
    try {
        const wizardData = localStorage.getItem('newBookWizardData');
        if (wizardData) {
            const parsed = JSON.parse(wizardData);
            console.log('newBookWizardData:', parsed);
            console.log('Páginas en wizardData:', parsed.pages ? parsed.pages.length : 0);
            if (parsed.pages) {
                console.table(parsed.pages.map((p, i) => ({
                    index: i,
                    name: p.name || `Página ${i}`,
                    type: i === 0 ? 'Portada' : (i === parsed.pages.length - 1 ? 'Contraportada' : 'Interior')
                })));
            }
        } else {
            console.log('newBookWizardData: No encontrado');
        }

        const settings = localStorage.getItem('undermaxBookSettings');
        if (settings) {
            console.log('undermaxBookSettings:', JSON.parse(settings));
        } else {
            console.log('undermaxBookSettings: No encontrado');
        }
    } catch (e) {
        console.error('Error al analizar datos de localStorage:', e);
    }
    console.groupEnd();

    console.group('Estado actual');
    if (typeof pages !== 'undefined') {
        console.log('Páginas actuales:', pages.length);
        console.table(pages.map((p, i) => ({
            index: i,
            name: p.name || `Página ${i}`,
            backgroundColor: p.backgroundColor,
            hasContent: !!p.contentHtml,
            tipo: i === 0 ? 'Portada' : (i === pages.length - 1 ? 'Contraportada' : 'Interior')
        })));
    } else {
        console.log('Variable pages no disponible');
    }

    if (typeof bookData !== 'undefined') {
        console.log('Datos del libro:', { ...bookData });
    } else {
        console.log('Variable bookData no disponible');
    }
    console.groupEnd();

    console.groupEnd();
}

window.debugBookState = debugBookState;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(debugBookState, 500);

    const debugBtn = document.createElement('button');
    debugBtn.innerText = 'Debug';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '9999';
    debugBtn.style.opacity = '0.7';
    debugBtn.style.background = '#333';
    debugBtn.style.color = 'white';
    debugBtn.style.border = 'none';
    debugBtn.style.borderRadius = '4px';
    debugBtn.style.padding = '5px 10px';
    debugBtn.style.fontSize = '12px';
    
    debugBtn.style.display = (window.bookData && window.bookData.debug) ? 'block' : 'none';

    debugBtn.addEventListener('click', () => {
        debugBookState();
    });

    document.body.appendChild(debugBtn);
});

window.isDebugEnabled = function() {
    return window.bookData && window.bookData.debug === true;
};
