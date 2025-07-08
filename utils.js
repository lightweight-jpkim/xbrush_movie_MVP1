// ========================================
// Utility Functions
// ========================================

/**
 * Safely escapes HTML to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitizes user input
 * @param {string} input - The input to sanitize
 * @returns {string} - The sanitized input
 */
function sanitizeInput(input) {
    if (!input) return '';
    return input.toString().trim().replace(/[<>]/g, '');
}

/**
 * Validates URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (info, success, error, warning)
 */
function showToast(message, type = 'info') {
    try {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#e53e3e' : 
                       type === 'success' ? '#38a169' : 
                       type === 'warning' ? '#ed8936' : '#3182ce',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            maxWidth: '300px',
            animation: 'slideInRight 0.3s ease-out'
        });
        
        document.body.appendChild(toast);
        
        // Auto-remove after delay
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, TOAST_CONFIG.DURATION);
    } catch (error) {
        console.error('Toast notification error:', error);
    }
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Safely gets an element by ID with error handling
 * @param {string} id - The element ID
 * @returns {HTMLElement|null} - The element or null if not found
 */
function safeGetElement(id) {
    try {
        return document.getElementById(id);
    } catch (error) {
        console.error(`Error getting element with ID ${id}:`, error);
        return null;
    }
}

/**
 * Safely gets elements by class name with error handling
 * @param {string} className - The class name
 * @returns {NodeList} - The elements or empty NodeList
 */
function safeGetElements(className) {
    try {
        return document.querySelectorAll(className);
    } catch (error) {
        console.error(`Error getting elements with class ${className}:`, error);
        return [];
    }
}

/**
 * Safely adds event listener with error handling
 * @param {HTMLElement} element - The element to add listener to
 * @param {string} event - The event type
 * @param {Function} handler - The event handler
 */
function safeAddEventListener(element, event, handler) {
    try {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler);
        }
    } catch (error) {
        console.error(`Error adding event listener:`, error);
    }
}

/**
 * Safely removes event listener with error handling
 * @param {HTMLElement} element - The element to remove listener from
 * @param {string} event - The event type
 * @param {Function} handler - The event handler
 */
function safeRemoveEventListener(element, event, handler) {
    try {
        if (element && typeof handler === 'function') {
            element.removeEventListener(event, handler);
        }
    } catch (error) {
        console.error(`Error removing event listener:`, error);
    }
}

/**
 * Safely updates element content with error handling
 * @param {HTMLElement} element - The element to update
 * @param {string} content - The content to set
 * @param {boolean} isHTML - Whether content is HTML (default: false for text)
 */
function safeUpdateElement(element, content, isHTML = false) {
    try {
        if (element) {
            if (isHTML) {
                element.innerHTML = escapeHtml(content);
            } else {
                element.textContent = content;
            }
        }
    } catch (error) {
        console.error(`Error updating element:`, error);
    }
}

/**
 * Validates form input
 * @param {string} value - The value to validate
 * @param {string} type - The type of validation (required, email, etc.)
 * @returns {boolean} - Whether the input is valid
 */
function validateInput(value, type) {
    try {
        if (!value) return type !== 'required';
        
        switch (type) {
            case 'required':
                return value.trim().length > 0;
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'minLength':
                return value.length >= 2;
            default:
                return true;
        }
    } catch (error) {
        console.error(`Input validation error:`, error);
        return false;
    }
}

/**
 * Formats text for display
 * @param {string} text - The text to format
 * @param {number} maxLength - Maximum length (optional)
 * @returns {string} - The formatted text
 */
function formatText(text, maxLength = null) {
    try {
        if (!text) return '';
        
        let formatted = text.toString().trim();
        
        if (maxLength && formatted.length > maxLength) {
            formatted = formatted.substring(0, maxLength) + '...';
        }
        
        return formatted;
    } catch (error) {
        console.error(`Text formatting error:`, error);
        return text || '';
    }
}

/**
 * Generates a random ID
 * @returns {string} - A random ID
 */
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Loads an image with error handling
 * @param {string} src - The image source
 * @returns {Promise<HTMLImageElement>} - Promise that resolves to the loaded image
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Throttles a function call
 * @param {Function} func - The function to throttle
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The throttled function
 */
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function (...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

/**
 * Handles errors gracefully
 * @param {Error} error - The error to handle
 * @param {string} context - The context where the error occurred
 * @param {boolean} showToast - Whether to show a toast notification
 */
function handleError(error, context = 'Application', showToast = true) {
    console.error(`${context} Error:`, error);
    
    if (showToast) {
        showToast(`오류가 발생했습니다. 다시 시도해주세요.`, 'error');
    }
}

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        sanitizeInput,
        isValidUrl,
        showToast,
        debounce,
        safeGetElement,
        safeGetElements,
        safeAddEventListener,
        safeRemoveEventListener,
        safeUpdateElement,
        validateInput,
        formatText,
        generateId,
        loadImage,
        throttle,
        handleError
    };
}