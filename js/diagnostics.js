/**
 * Book Editor Diagnostics
 * Utility functions to diagnose and fix common issues with book data
 */

const BookDiagnostics = {
    /**
     * Validates the book data structure
     * @param {Object} data - The book data to validate
     * @returns {Object} - Validation results with issues array
     */
    validateBookData: function(data) {
        const issues = [];
        
        if (!data) {
            issues.push("Book data is undefined or null");
            return { valid: false, issues, data: null };
        }
        
        if (!data.bookName) issues.push("Missing book name");
        if (!data.bookWidth) issues.push("Missing book width");
        if (!data.bookHeight) issues.push("Missing book height");
        
        if (!data.pages || !Array.isArray(data.pages)) {
            issues.push("Pages array is missing or not an array");
            
            try {
                const fixedData = {...data};
                const width = fixedData.bookWidth || fixedData.width || 350;
                const height = fixedData.bookHeight || fixedData.height || 400;
                const pagesCount = fixedData.pageCount || 1;
                
                fixedData.pages = [];
                
                fixedData.pages.push({
                    name: "Cover",
                    width: width,
                    height: height,
                    backgroundColor: fixedData.coverType === 'image' ? 'transparent' : (fixedData.coverColor || "#DC143C"),
                    backgroundImage: fixedData.coverType === 'image' ? fixedData.coverImage || "" : "",
                    alignment: "center",
                    contentHtml: "<p>Your Book Title</p>"
                });
                
                for (let i = 0; i < pagesCount; i++) {
                    fixedData.pages.push({
                        name: `Page ${i + 1}`,
                        width: width,
                        height: height,
                        backgroundColor: "#FFFFFF",
                        backgroundImage: "",
                        alignment: "left",
                        contentHtml: ""
                    });
                }
                
                fixedData.pages.push({
                    name: "Back Cover",
                    width: width,
                    height: height,
                    backgroundColor: fixedData.backCoverType === 'image' ? 'transparent' : (fixedData.backCoverColor || "#DC143C"),
                    backgroundImage: fixedData.backCoverType === 'image' ? fixedData.backCoverImage || "" : "",
                    alignment: "center",
                    contentHtml: ""
                });
                
                console.log(`Automatically fixed book data: Created ${fixedData.pages.length} pages`);
                return { valid: false, fixed: true, issues, data: fixedData };
            } catch (error) {
                console.error("Failed to fix book data:", error);
                return { valid: false, fixed: false, issues, data: null };
            }
        }
        
        if (data.pages.length < 2) {
            issues.push("Book must have at least 2 pages (cover and back cover)");
        }
        
        data.pages.forEach((page, index) => {
            if (!page.width || !page.height) {
                issues.push(`Page ${index}: Missing dimensions`);
            }
            
            if (page.backgroundImage && typeof page.backgroundImage !== 'string') {
                issues.push(`Page ${index}: Invalid background image format`);
            }
        });
        
        return { 
            valid: issues.length === 0, 
            issues,
            data: data
        };
    },
    
    /**
     * Attempts to repair the book data localStorage
     * @returns {boolean} - True if successfully repaired
     */
    repairBookData: function() {
        try {
            const wizardDataJson = localStorage.getItem('newBookWizardData');
            if (!wizardDataJson) return false;
            
            let parsedData;
            try {
                parsedData = JSON.parse(wizardDataJson);
            } catch (error) {
                console.error("Failed to parse wizard data:", error);
                localStorage.removeItem('newBookWizardData');
                return false;
            }
            
            const validation = this.validateBookData(parsedData);
            
            if (!validation.valid) {
                if (validation.fixed && validation.data) {
                    localStorage.setItem('newBookWizardData', JSON.stringify(validation.data));
                    console.log("Book data repaired and saved");
                    return true;
                } else {
                    console.error("Could not repair book data:", validation.issues);
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error("Error repairing book data:", error);
            return false;
        }
    },
    
    /**
     * Logs the current state of book data for debugging
     */
    debugBookData: function() {
        console.group('Book Data Diagnostics');
        
        try {
            const wizardDataJson = localStorage.getItem('newBookWizardData');
            if (wizardDataJson) {
                try {
                    const data = JSON.parse(wizardDataJson);
                    console.log('Book Name:', data.bookName);
                    console.log('Dimensions:', `${data.bookWidth || data.width}x${data.bookHeight || data.height}`);
                    console.log('Cover Type:', data.coverType);
                    console.log('Back Cover Type:', data.backCoverType);
                    console.log('Page Count:', data.pageCount);
                    console.log('Pages Array Length:', data.pages ? data.pages.length : 0);
                    
                    if (data.pages && data.pages.length > 0) {
                        console.table(data.pages.map((p, i) => ({
                            index: i,
                            name: p.name,
                            hasBackgroundImage: p.backgroundImage ? 'Yes' : 'No',
                            backgroundColor: p.backgroundColor
                        })));
                    }
                    
                    const validation = this.validateBookData(data);
                    console.log('Validation Result:', validation.valid ? 'Valid' : 'Invalid');
                    
                    if (validation.issues.length > 0) {
                        console.warn('Issues:', validation.issues);
                    }
                } catch (error) {
                    console.error('Error parsing book data:', error);
                }
            } else {
                console.log('No book data found in localStorage');
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
        }
        
        console.groupEnd();
    }
};

window.BookDiagnostics = BookDiagnostics;

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.includes('welcome.html')) {
        BookDiagnostics.repairBookData();
    }
});
