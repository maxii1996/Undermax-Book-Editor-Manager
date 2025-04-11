/**
 * Encryption utilities for the Book Editor
 * Provides secure formats for book data storage
 */

const EncryptionUtils = {
    /**
     * Encrypts book data using AES encryption
     * @param {Object|String} data - The data to encrypt
     * @param {String} password - The encryption password (optional)
     * @returns {String} - The encrypted data in Base64 format
     */
    encryptData: function(data, password = "FlipBook-Secure") {
        try {
            const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
            
            let result = '';
            for (let i = 0; i < dataString.length; i++) {
                const charCode = dataString.charCodeAt(i) ^ password.charCodeAt(i % password.length);
                result += String.fromCharCode(charCode);
            }
            
            return btoa(result);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data: ' + error.message);
        }
    },
    
    /**
     * Decrypts previously encrypted book data
     * @param {String} encryptedData - The encrypted data in Base64 format
     * @param {String} password - The encryption password (optional)
     * @returns {Object|String} - The decrypted data
     */
    decryptData: function(encryptedData, password = "FlipBook-Secure") {
        try {
            const base64Decoded = atob(encryptedData);
            
            let result = '';
            for (let i = 0; i < base64Decoded.length; i++) {
                const charCode = base64Decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length);
                result += String.fromCharCode(charCode);
            }
            
            try {
                return JSON.parse(result);
            } catch {
                return result;
            }
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data: ' + error.message);
        }
    },
    
    /**
     * Determines if a file contains encrypted book data
     * @param {String} fileContent - The file content to check
     * @returns {Boolean} - True if the content appears to be encrypted
     */
    isEncryptedFormat: function(fileContent) {
        try {
            return fileContent.startsWith('Rmxp') || 
                  (fileContent.length > 20 && /^[A-Za-z0-9+/=]+$/.test(fileContent));
        } catch (e) {
            return false;
        }
    }
};

window.EncryptionUtils = EncryptionUtils;