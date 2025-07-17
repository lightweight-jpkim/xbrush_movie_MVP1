/**
 * ModalManager - Centralized modal management
 * Handles all modal dialogs across the application
 */
(function() {
    'use strict';

    /**
     * ModalManager class for handling all modals
     * @class
     */
    function ModalManager() {
        this.activeModals = [];
        this.modalStack = [];
        this.init();
    }

    /**
     * Initialize modal system
     */
    ModalManager.prototype.init = function() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('modal-container')) {
            var container = document.createElement('div');
            container.id = 'modal-container';
            document.body.appendChild(container);
        }

        // Handle ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                var topModal = this.modalStack[this.modalStack.length - 1];
                if (topModal && topModal.options.closeOnEsc !== false) {
                    this.close(topModal.id);
                }
            }
        }.bind(this));
    };

    /**
     * Show a modal
     * @param {string|HTMLElement} content - Modal content (HTML string or element)
     * @param {Object} options - Modal options
     * @returns {Object} Modal instance
     */
    ModalManager.prototype.show = function(content, options) {
        options = Object.assign({
            title: '',
            closeButton: true,
            closeOnOverlay: true,
            closeOnEsc: true,
            width: 'auto',
            maxWidth: '600px',
            className: '',
            onOpen: null,
            onClose: null,
            buttons: []
        }, options);

        var modalId = 'modal-' + Date.now();
        var modal = this.createModal(modalId, content, options);
        
        document.getElementById('modal-container').appendChild(modal.element);
        this.modalStack.push(modal);

        // Trigger animation
        requestAnimationFrame(function() {
            modal.element.classList.add('modal-open');
            if (options.onOpen) options.onOpen(modal);
        });

        return modal;
    };

    /**
     * Create modal element
     * @private
     */
    ModalManager.prototype.createModal = function(id, content, options) {
        var modalWrapper = document.createElement('div');
        modalWrapper.id = id;
        modalWrapper.className = 'modal-wrapper ' + options.className;
        modalWrapper.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        var modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            width: ${options.width};
            max-width: ${options.maxWidth};
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        // Header
        if (options.title || options.closeButton) {
            var header = document.createElement('div');
            header.className = 'modal-header';
            header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            `;

            if (options.title) {
                var title = document.createElement('h3');
                title.textContent = options.title;
                title.style.margin = '0';
                header.appendChild(title);
            }

            if (options.closeButton) {
                var closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.style.cssText = `
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                `;
                closeBtn.onmouseover = function() { this.style.background = '#f5f5f5'; };
                closeBtn.onmouseout = function() { this.style.background = 'none'; };
                closeBtn.onclick = function() { this.close(id); }.bind(this);
                header.appendChild(closeBtn);
            }

            modalContent.appendChild(header);
        }

        // Body
        var body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = `
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        `;

        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }

        modalContent.appendChild(body);

        // Footer with buttons
        if (options.buttons && options.buttons.length > 0) {
            var footer = document.createElement('div');
            footer.className = 'modal-footer';
            footer.style.cssText = `
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 20px;
                border-top: 1px solid #eee;
            `;

            options.buttons.forEach(function(btn) {
                var button = document.createElement('button');
                button.textContent = btn.text;
                button.className = btn.className || 'modal-button';
                button.style.cssText = btn.style || `
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: opacity 0.2s;
                `;
                
                if (btn.primary) {
                    button.style.background = '#007bff';
                    button.style.color = 'white';
                } else {
                    button.style.background = '#e9ecef';
                    button.style.color = '#333';
                }

                button.onclick = function() {
                    if (btn.onclick) {
                        btn.onclick(this.getModalInstance(id));
                    }
                }.bind(this);

                footer.appendChild(button);
            }.bind(this));

            modalContent.appendChild(footer);
        }

        modalWrapper.appendChild(modalContent);

        // Close on overlay click
        if (options.closeOnOverlay) {
            modalWrapper.addEventListener('click', function(e) {
                if (e.target === modalWrapper) {
                    this.close(id);
                }
            }.bind(this));
        }

        // Add open class for animation
        modalWrapper.classList.add('modal-closed');
        setTimeout(function() {
            modalWrapper.classList.remove('modal-closed');
            modalWrapper.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);

        return {
            id: id,
            element: modalWrapper,
            options: options,
            body: body,
            close: function() { this.close(id); }.bind(this)
        };
    };

    /**
     * Close a modal
     * @param {string} modalId - Modal ID to close
     */
    ModalManager.prototype.close = function(modalId) {
        var modalIndex = this.modalStack.findIndex(function(m) { return m.id === modalId; });
        if (modalIndex === -1) return;

        var modal = this.modalStack[modalIndex];
        var element = modal.element;

        // Trigger close animation
        element.style.opacity = '0';
        element.querySelector('.modal-content').style.transform = 'scale(0.9)';

        setTimeout(function() {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.modalStack.splice(modalIndex, 1);
            
            if (modal.options.onClose) {
                modal.options.onClose(modal);
            }
        }.bind(this), 300);
    };

    /**
     * Close all modals
     */
    ModalManager.prototype.closeAll = function() {
        var modalsToClose = this.modalStack.slice();
        modalsToClose.forEach(function(modal) {
            this.close(modal.id);
        }.bind(this));
    };

    /**
     * Get modal instance by ID
     */
    ModalManager.prototype.getModalInstance = function(modalId) {
        return this.modalStack.find(function(m) { return m.id === modalId; });
    };

    /**
     * Confirm dialog
     * @param {string} message - Confirmation message
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>}
     */
    ModalManager.prototype.confirm = function(message, options) {
        options = Object.assign({
            title: '확인',
            confirmText: '확인',
            cancelText: '취소'
        }, options);

        return new Promise(function(resolve) {
            this.show('<p>' + message + '</p>', {
                title: options.title,
                closeOnOverlay: false,
                closeOnEsc: false,
                buttons: [
                    {
                        text: options.cancelText,
                        onclick: function(modal) {
                            modal.close();
                            resolve(false);
                        }
                    },
                    {
                        text: options.confirmText,
                        primary: true,
                        onclick: function(modal) {
                            modal.close();
                            resolve(true);
                        }
                    }
                ]
            });
        }.bind(this));
    };

    /**
     * Alert dialog
     * @param {string} message - Alert message
     * @param {Object} options - Additional options
     * @returns {Promise<void>}
     */
    ModalManager.prototype.alert = function(message, options) {
        options = Object.assign({
            title: '알림',
            confirmText: '확인'
        }, options);

        return new Promise(function(resolve) {
            this.show('<p>' + message + '</p>', {
                title: options.title,
                buttons: [
                    {
                        text: options.confirmText,
                        primary: true,
                        onclick: function(modal) {
                            modal.close();
                            resolve();
                        }
                    }
                ]
            });
        }.bind(this));
    };

    /**
     * Loading modal
     * @param {string} message - Loading message
     * @returns {Object} Modal instance with update method
     */
    ModalManager.prototype.loading = function(message) {
        var content = `
            <div style="text-align: center; padding: 20px;">
                <div class="spinner" style="
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p>${message || '처리 중...'}</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        var modal = this.show(content, {
            closeButton: false,
            closeOnOverlay: false,
            closeOnEsc: false,
            width: '300px'
        });

        // Add update method
        modal.update = function(newMessage) {
            var p = modal.body.querySelector('p');
            if (p) p.textContent = newMessage;
        };

        return modal;
    };

    // Create global instance
    window.modalManager = new ModalManager();

    // Export for potential module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ModalManager;
    }
})();