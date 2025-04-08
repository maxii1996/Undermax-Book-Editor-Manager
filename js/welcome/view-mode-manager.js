/**
 * View Mode Manager
 * Handles the view mode selection for front and back cover previews
 */
document.addEventListener('DOMContentLoaded', function() {
    const wizardSteps = document.querySelectorAll('.wizard-step');
    
    if (!wizardSteps.length) return;
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' &&
                mutation.target.classList.contains('wizard-step')) {
                
                const step = mutation.target.getAttribute('data-step');
                const isVisible = mutation.target.style.display === 'block';
                
                if (isVisible && (step === '3' || step === '4')) {
                    const currentViewBtn = mutation.target.querySelector('.view-mode-btn[data-view-mode="current"]');
                    if (currentViewBtn && !currentViewBtn.classList.contains('active')) {
                        currentViewBtn.click();
                    }
                }
            }
        });
    });
    
    wizardSteps.forEach(function(step) {
        observer.observe(step, { attributes: true });
    });
    
    const coverTypeRadios = document.querySelectorAll('input[name="cover-type"], input[name="back-cover-type"]');
    coverTypeRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            const step = this.closest('.wizard-step');
            if (!step) return;
            
            const currentViewBtn = step.querySelector('.view-mode-btn[data-view-mode="current"]');
            if (currentViewBtn) {
                currentViewBtn.click();
            }
        });
    });
});
