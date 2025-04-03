/**
 * Sistema de notificaciones unificado
 * Combina CustomNotifications, CustomDialogs, TranslationHelper y BookEditorNotifications
 */

class CustomNotification {
    constructor() {
        this.container = null;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'custom-notifications-container';
        document.body.appendChild(this.container);

        const style = document.createElement('style');
        style.textContent = `
            .custom-notifications-container {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 300px;
                z-index: 9999;
            }
            .custom-notification {
                background-color: #303030;
                color: #e0e0e0;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-bottom: 10px;
                padding: 16px;
                transition: opacity 0.3s ease, transform 0.3s ease;
                opacity: 0;
                transform: translateY(-20px);
            }
            .custom-notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            .custom-notification-title {
                font-weight: bold;
                margin-bottom: 8px;
                color: #f0f0f0;
            }
            .custom-notification-message {
                color: #d0d0d0;
            }
            .custom-notification-success {
                border-left: 4px solid #4CAF50;
            }
            .custom-notification-error {
                border-left: 4px solid #F44336;
            }
            .custom-notification-info {
                border-left: 4px solid #2196F3;
            }
            .custom-notification-warning {
                border-left: 4px solid #FF9800;
            }
            .custom-notification-tooltip {
                max-width: 300px;
                position: fixed;
                z-index: 9999;
                transform: translateY(-20px);
                background-color: #303030;
            }
            .custom-notification-arrow {
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-top: 10px solid #303030;
                position: absolute;
                bottom: -10px;
                left: calc(50% - 10px);
            }
            .custom-notification-tooltip.custom-notification-warning .custom-notification-arrow {
                border-top-color: #FF9800;
            }
            .custom-notification-tooltip.custom-notification-error .custom-notification-arrow {
                border-top-color: #F44336;
            }
            .custom-notification-tooltip.custom-notification-info .custom-notification-arrow {
                border-top-color: #2196F3;
            }
            .custom-notification-tooltip.custom-notification-success .custom-notification-arrow {
                border-top-color: #4CAF50;
            }
            .tooltip-bottom .custom-notification-arrow {
                display: none;
            }
            .tooltip-bottom .tooltip-arrow-top {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 10px solid #303030;
            }
            .custom-notification-tooltip.custom-notification-warning .tooltip-arrow-top {
                border-bottom-color: #FF9800;
            }
            .custom-notification-tooltip.custom-notification-error .tooltip-arrow-top {
                border-bottom-color: #F44336;
            }
            .custom-notification-tooltip.custom-notification-info .tooltip-arrow-top {
                border-bottom-color: #2196F3;
            }
            .custom-notification-tooltip.custom-notification-success .tooltip-arrow-top {
                border-bottom-color: #4CAF50;
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', duration = 3000) {
        message = translateToEnglish(message);

        const notification = document.createElement('div');
        notification.className = `custom-notification custom-notification-${type}`;

        notification.innerHTML = `
            <div class="custom-notification-title">${this.getTitle(type)}</div>
            <div class="custom-notification-message">${message}</div>
        `;

        this.container.appendChild(notification);

        void notification.offsetHeight;
        notification.classList.add('show');

        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, duration);
        }

        return {
            element: notification,
            remove: () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        };
    }

    getTitle(type) {
        switch (type) {
            case 'success': return 'Success';
            case 'error': return 'Error';
            case 'warning': return 'Warning';
            case 'info': default: return 'Information';
        }
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    tooltip(message, targetElement, type = 'warning', duration = 3000) {
        message = translateToEnglish(message);

        const rect = targetElement.getBoundingClientRect();

        const notification = document.createElement('div');
        notification.className = `custom-notification custom-notification-tooltip custom-notification-${type} tooltip-bottom`;

        notification.innerHTML = `
            <div class="custom-notification-arrow tooltip-arrow-top"></div>
            <div class="custom-notification-title">${this.getTitle(type)}</div>
            <div class="custom-notification-message">${message}</div>
        `;

        notification.style.position = 'fixed';
        notification.style.left = `${rect.left + rect.width / 2 - 150}px`;
        notification.style.top = `${rect.bottom + 15}px`;

        document.body.appendChild(notification);

        void notification.offsetHeight;
        notification.classList.add('show');

        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, duration);
        }

        return {
            element: notification,
            remove: () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        };
    }
}

(function () {
    const style = document.createElement('style');
    style.textContent = `
        .custom-dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(0px);
            transition: backdrop-filter 0.3s ease;
        }
        .custom-dialog {
            background-color: #252526;
            color: #e0e0e0;
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        }
        .custom-dialog-message {
            margin-bottom: 20px;
            color: #e0e0e0;
            font-size: 16px;
        }
        .custom-dialog-input {
            width: 100%;
            padding: 8px;
            margin-bottom: 20px;
            border: 1px solid #444;
            background-color: #333;
            color: #e0e0e0;
            border-radius: 4px;
            font-size: 14px;
        }
        .custom-dialog-buttons {
            display: flex;
            justify-content: flex-end;
        }
        .custom-dialog-button {
            padding: 8px 16px;
            margin-left: 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background-color: #3c3c3c;
            color: #e0e0e0;
            transition: background-color 0.2s ease;
        }
        .custom-dialog-button-primary {
            background-color: #0078D7;
            color: white;
        }
        .custom-dialog-button:hover {
            background-color: #4c4c4c;
        }
        .custom-dialog-button-primary:hover {
            background-color: #0086F0;
        }
    `;
    document.head.appendChild(style);

    const originalConfirm = window.confirm;
    window.confirm = function (message) {
        message = translateToEnglish(message);

        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';
            
            setTimeout(() => {
                overlay.style.backdropFilter = 'blur(5px)';
            }, 10);

            const dialog = document.createElement('div');
            dialog.className = 'custom-dialog';

            const messageEl = document.createElement('div');
            messageEl.className = 'custom-dialog-message';
            messageEl.textContent = message;

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'custom-dialog-buttons';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'custom-dialog-button';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.setAttribute('data-action', 'cancel');

            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'custom-dialog-button custom-dialog-button-primary';

            if (message.includes("return to the main page")) {
                confirmBtn.textContent = 'Return to Main Page';
            } else {
                confirmBtn.textContent = 'Confirm';
            }
            confirmBtn.setAttribute('data-action', 'confirm');

            buttonsDiv.appendChild(cancelBtn);
            buttonsDiv.appendChild(confirmBtn);

            dialog.appendChild(messageEl);
            dialog.appendChild(buttonsDiv);

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            [cancelBtn, confirmBtn].forEach(btn => {
                btn.addEventListener('click', function () {
                    overlay.style.backdropFilter = 'blur(0px)';
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.3s ease, backdrop-filter 0.3s ease';
                    
                    setTimeout(() => {
                        if (overlay.parentNode) {
                            overlay.remove();
                        }
                        const action = this.getAttribute('data-action');
                        resolve(action === 'confirm');
                    }, 300);
                });
            });
        });
    };

    const originalPrompt = window.prompt;
    window.prompt = function (message, defaultValue = '') {
        message = translateToEnglish(message);

        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';
            
            setTimeout(() => {
                overlay.style.backdropFilter = 'blur(5px)';
            }, 10);

            const dialog = document.createElement('div');
            dialog.className = 'custom-dialog';
            
            const messageEl = document.createElement('div');
            messageEl.className = 'custom-dialog-message';
            messageEl.textContent = message;
            
            const input = document.createElement('input');
            input.className = 'custom-dialog-input';
            input.type = 'text';
            input.value = defaultValue;
            
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'custom-dialog-buttons';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'custom-dialog-button';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.setAttribute('data-action', 'cancel');
            
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'custom-dialog-button custom-dialog-button-primary';
            confirmBtn.textContent = 'OK';
            confirmBtn.setAttribute('data-action', 'confirm');
            
            buttonsDiv.appendChild(cancelBtn);
            buttonsDiv.appendChild(confirmBtn);
            
            dialog.appendChild(messageEl);
            dialog.appendChild(input);
            dialog.appendChild(buttonsDiv);
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            setTimeout(() => input.focus(), 100);
            
            function handleClose(value) {
                overlay.style.backdropFilter = 'blur(0px)';
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.3s ease, backdrop-filter 0.3s ease';
                
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.remove();
                    }
                    resolve(value);
                }, 300);
            }

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    handleClose(input.value);
                }
            });

            overlay.querySelectorAll('.custom-dialog-button').forEach(button => {
                button.addEventListener('click', function () {
                    const action = this.getAttribute('data-action');
                    handleClose(action === 'confirm' ? input.value : null);
                });
            });
        });
    };
})();

const translations = {
    "Operación completada con éxito": "Operation completed successfully",
    "Se ha producido un error": "An error has occurred",
    "¿Está seguro de que desea continuar?": "Are you sure you want to continue?",
    "Cambios guardados": "Changes saved",
    "Los cambios no guardados se perderán": "Unsaved changes will be lost",
    "Por favor espere": "Please wait",
    "Cargando": "Loading",
    "Procesando": "Processing",

    "Libro guardado correctamente": "Book saved successfully",
    "Error al guardar el libro": "Error saving the book",
    "Página añadida": "Page added",
    "Página eliminada": "Page deleted",
    "¿Desea eliminar esta página?": "Do you want to delete this page?",
    "No se pudo cargar el libro": "Could not load the book",
    "Formato de archivo no válido": "Invalid file format",
    "El título es obligatorio": "Title is required",
    "Por favor, introduzca un título válido": "Please enter a valid title",
};

function translateToEnglish(message) {
    return translations[message] || message;
}

window.translateToEnglish = translateToEnglish;

const notifications = new CustomNotification();
window.notifications = notifications;

window.alert = function (message) {
    notifications.info(message);
};

window.BookEditorNotifications = {
    bookSaved: function () {
        notifications.success('Book saved successfully');
    },

    bookSaveError: function (error) {
        notifications.error(`Error saving book: ${error || 'Unknown error'}`);
    },

    bookLoaded: function (title) {
        notifications.info(`Book "${title}" loaded successfully`);
    },

    bookLoadError: function (error) {
        notifications.error(`Error loading book: ${error || 'Unknown error'}`);
    },

    pageAdded: function (pageNumber) {
        notifications.success(`Page ${pageNumber} added successfully`);
    },

    pageRemoved: function (pageNumber) {
        notifications.info(`Page ${pageNumber} removed`);
    },

    contentSaved: function () {
        notifications.success('Content saved successfully');
    },

    contentError: function (error) {
        notifications.error(`Content operation failed: ${error || 'Unknown error'}`);
    },

    validationError: function (field, message) {
        notifications.warning(`${field}: ${message}`);
    },

    async performOperation(operationName, callback) {
        const loadingNotification = notifications.info(`${operationName} in progress...`, 0);

        try {
            await callback();
            loadingNotification.remove();
            notifications.success(`${operationName} completed successfully`);
            return true;
        } catch (error) {
            loadingNotification.remove();
            notifications.error(`${operationName} failed: ${error.message || 'Unknown error'}`);
            return false;
        }
    }
};