document.addEventListener('DOMContentLoaded', function() {
    const newBookBtn = document.getElementById('new-book-btn');
    const loadBookBtn = document.getElementById('load-book-btn');
    const welcomeFileInput = document.getElementById('welcome-file-input');
    const wizardContainer = document.querySelector('.wizard-container');
    const welcomeContainer = document.querySelector('.welcome-container');
    
    if (newBookBtn) {
        newBookBtn.addEventListener('click', function() {
            if (wizardContainer) {
                welcomeContainer.style.display = 'none';
                wizardContainer.style.display = 'block';
                
                // Set focus to the book name input
                setTimeout(() => {
                    const bookNameInput = document.getElementById('wizard-book-name');
                    if (bookNameInput) bookNameInput.focus();
                }, 100);
            }
        });
    }
    
    if (loadBookBtn) {
        loadBookBtn.addEventListener('click', function() {
            if (welcomeFileInput) {
                welcomeFileInput.accept = ".json,.ebk"; // Accept both JSON and encrypted book files
                welcomeFileInput.click();
            }
        });
    }
    
    if (welcomeFileInput) {
        welcomeFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const fileContent = e.target.result;
                    let bookData;
                    
                    // Determine if the file is encrypted
                    const isEncrypted = file.name.toLowerCase().endsWith('.ebk') || 
                                      (window.EncryptionUtils && EncryptionUtils.isEncryptedFormat(fileContent));
                    
                    if (isEncrypted && window.EncryptionUtils) {
                        try {
                            // Decrypt the content
                            bookData = EncryptionUtils.decryptData(fileContent);
                            console.log("Loaded encrypted book file");
                        } catch (decryptError) {
                            throw new Error("Failed to decrypt book file: " + decryptError.message);
                        }
                    } else {
                        // Standard JSON format
                        bookData = JSON.parse(fileContent);
                    }
                    
                    if (!bookData.bookName || !bookData.pages || !Array.isArray(bookData.pages)) {
                        throw new Error("Invalid book file format");
                    }
                    
                    if (bookData.pages.length < 2) {
                        throw new Error("Book must have at least 2 pages (cover and back cover)");
                    }
                    
                    localStorage.setItem('loadedBookData', JSON.stringify(bookData));
                    window.location.href = `index.html?loadBook=true`;
                } catch (error) {
                    if (window.notifications) {
                        window.notifications.error("Error loading book: " + error.message);
                    } else {
                        alert("Error loading book: " + error.message);
                    }
                    console.error("Error loading book:", error);
                }
            };
            
            reader.readAsText(file);
            
            // Reset the input value so the same file can be loaded again
            welcomeFileInput.value = '';
        });
    }
});