/**
 * Form Validation Module
 * Handles all form validation and input sanitization
 */

(function(window) {
    'use strict';

    const FormValidationModule = {
        /**
         * Validation rules for different input types
         */
        rules: {
            productName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[가-힣a-zA-Z0-9\s]+$/,
                message: '제품명은 2-50자의 한글, 영문, 숫자만 입력 가능합니다.'
            },
            targetAudience: {
                required: true,
                minLength: 2,
                maxLength: 100,
                message: '타겟 고객을 2-100자로 입력해주세요.'
            },
            coreMessage: {
                required: true,
                minLength: 10,
                maxLength: 200,
                message: '핵심 메시지를 10-200자로 입력해주세요.'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '올바른 이메일 형식을 입력해주세요.'
            },
            phone: {
                required: true,
                pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
                message: '올바른 휴대폰 번호를 입력해주세요.'
            }
        },

        /**
         * Initialize form validation
         */
        initialize: function() {
            // Add validation to all forms
            const forms = document.querySelectorAll('form[data-validate="true"]');
            forms.forEach(form => {
                this.attachValidation(form);
            });

            // Add real-time validation to inputs
            const inputs = document.querySelectorAll('input[data-validate], textarea[data-validate]');
            inputs.forEach(input => {
                this.attachInputValidation(input);
            });
        },

        /**
         * Attach validation to form
         */
        attachValidation: function(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (this.validateForm(form)) {
                    // Form is valid, proceed with submission
                    if (form.dataset.submitHandler) {
                        window[form.dataset.submitHandler](form);
                    }
                } else {
                    window.showToast('입력 내용을 확인해주세요.', 'error');
                }
            });
        },

        /**
         * Attach real-time validation to input
         */
        attachInputValidation: function(input) {
            // Debounce validation
            let timeout;
            
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.validateInput(input);
                }, 300);
            });

            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        },

        /**
         * Validate entire form
         */
        validateForm: function(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[data-validate], textarea[data-validate]');
            
            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });

            return isValid;
        },

        /**
         * Validate single input
         */
        validateInput: function(input) {
            const ruleName = input.dataset.validate;
            const rule = this.rules[ruleName];
            
            if (!rule) return true;

            const value = input.value.trim();
            const errorElement = this.getErrorElement(input);

            // Clear previous error
            this.clearError(input, errorElement);

            // Check required
            if (rule.required && !value) {
                this.showError(input, errorElement, '필수 입력 항목입니다.');
                return false;
            }

            // Check min length
            if (rule.minLength && value.length < rule.minLength) {
                this.showError(input, errorElement, `최소 ${rule.minLength}자 이상 입력해주세요.`);
                return false;
            }

            // Check max length
            if (rule.maxLength && value.length > rule.maxLength) {
                this.showError(input, errorElement, `최대 ${rule.maxLength}자까지 입력 가능합니다.`);
                return false;
            }

            // Check pattern
            if (rule.pattern && value && !rule.pattern.test(value)) {
                this.showError(input, errorElement, rule.message);
                return false;
            }

            // Valid
            this.showSuccess(input);
            return true;
        },

        /**
         * Get or create error element
         */
        getErrorElement: function(input) {
            let errorElement = input.parentElement.querySelector('.error-message');
            
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                input.parentElement.appendChild(errorElement);
            }

            return errorElement;
        },

        /**
         * Show error state
         */
        showError: function(input, errorElement, message) {
            input.classList.add('error');
            input.classList.remove('success');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        },

        /**
         * Show success state
         */
        showSuccess: function(input) {
            input.classList.remove('error');
            input.classList.add('success');
        },

        /**
         * Clear error state
         */
        clearError: function(input, errorElement) {
            input.classList.remove('error');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        },

        /**
         * Sanitize input value
         */
        sanitize: function(value, type = 'text') {
            // Basic sanitization - remove script tags and dangerous characters
            value = value.replace(/<script[^>]*>.*?<\/script>/gi, '');
            value = value.replace(/[<>]/g, '');
            
            switch(type) {
                case 'number':
                    return value.replace(/[^0-9]/g, '');
                case 'phone':
                    return value.replace(/[^0-9-]/g, '');
                case 'email':
                    return value.toLowerCase().trim();
                default:
                    return value.trim();
            }
        }
    };

    // Export to global scope
    window.FormValidationModule = FormValidationModule;

})(window);