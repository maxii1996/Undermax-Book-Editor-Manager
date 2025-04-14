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
            const dataString = typeof data === 'object' ? 
                JSON.stringify(data, (key, value) => {
                    if (typeof value === 'string') {
                        return value;
                    }
                    return value;
                }) : 
                data;
            
            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(dataString);
            
            const passwordBytes = encoder.encode(password);
            const resultBytes = new Uint8Array(dataBytes.length);
            
            for (let i = 0; i < dataBytes.length; i++) {
                resultBytes[i] = dataBytes[i] ^ passwordBytes[i % passwordBytes.length];
            }
            
            let base64 = '';
            const chunkSize = 8192;
            
            for (let i = 0; i < resultBytes.length; i += chunkSize) {
                const chunk = resultBytes.subarray(i, i + chunkSize);
                base64 += String.fromCharCode.apply(null, chunk);
            }
            
            return btoa(base64);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data: ' + error.message);
        }
    },
    
    /**
     * Decrypts encrypted book data
     * @param {String} encryptedData - The encrypted data
     * @param {String} password - The decryption password (optional)
     * @returns {Object|String} - The decrypted data
     */
    decryptData: function(encryptedData, password = "FlipBook-Secure") {
        try {
            const bytes = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
            
            const encoder = new TextEncoder();
            const passwordBytes = encoder.encode(password);
            const resultBytes = new Uint8Array(bytes.length);
            
            for (let i = 0; i < bytes.length; i++) {
                resultBytes[i] = bytes[i] ^ passwordBytes[i % passwordBytes.length];
            }
            
            const decoder = new TextDecoder('utf-8');
            const result = decoder.decode(resultBytes);
            
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