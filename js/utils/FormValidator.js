/**
 * FormValidator - Centralized form validation utility
 * Handles all form validation logic across the application
 */
(function() {
    'use strict';

    /**
     * FormValidator class for handling form validations
     * @class
     */
    function FormValidator() {
        this.validators = {
            required: this.validateRequired,
            email: this.validateEmail,
            phone: this.validatePhone,
            minLength: this.validateMinLength,
            maxLength: this.validateMaxLength,
            pattern: this.validatePattern,
            fileType: this.validateFileType,
            fileSize: this.validateFileSize,
            image: this.validateImage,
            video: this.validateVideo
        };
    }

    /**
     * Validate a single field
     * @param {HTMLElement} field - Field to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result {valid: boolean, message: string}
     */
    FormValidator.prototype.validateField = function(field, rules) {
        var value = field.value || field.files || '';
        var result = { valid: true, message: '' };

        for (var rule in rules) {
            if (rules.hasOwnProperty(rule) && this.validators[rule]) {
                var ruleResult = this.validators[rule](value, rules[rule], field);
                if (!ruleResult.valid) {
                    return ruleResult;
                }
            }
        }

        return result;
    };

    /**
     * Validate entire form
     * @param {HTMLFormElement} form - Form element
     * @param {Object} validationRules - Rules for each field
     * @returns {Object} Validation result {valid: boolean, errors: Object}
     */
    FormValidator.prototype.validateForm = function(form, validationRules) {
        var errors = {};
        var isValid = true;

        for (var fieldName in validationRules) {
            if (validationRules.hasOwnProperty(fieldName)) {
                var field = form.elements[fieldName];
                if (!field) continue;

                var result = this.validateField(field, validationRules[fieldName]);
                if (!result.valid) {
                    errors[fieldName] = result.message;
                    isValid = false;
                    this.showFieldError(field, result.message);
                } else {
                    this.clearFieldError(field);
                }
            }
        }

        return { valid: isValid, errors: errors };
    };

    /**
     * Required field validation
     */
    FormValidator.prototype.validateRequired = function(value, ruleValue) {
        var isEmpty = !value || (typeof value === 'string' && value.trim() === '') ||
                      (value instanceof FileList && value.length === 0);
        
        return {
            valid: !isEmpty,
            message: ruleValue === true ? '이 필드는 필수입니다.' : ruleValue
        };
    };

    /**
     * Email validation
     */
    FormValidator.prototype.validateEmail = function(value, ruleValue) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            valid: emailRegex.test(value),
            message: ruleValue === true ? '올바른 이메일 주소를 입력해주세요.' : ruleValue
        };
    };

    /**
     * Phone number validation (Korean format)
     */
    FormValidator.prototype.validatePhone = function(value, ruleValue) {
        var phoneRegex = /^(01[0-9]|02|0[3-9][0-9]?)-?[0-9]{3,4}-?[0-9]{4}$/;
        return {
            valid: phoneRegex.test(value.replace(/\s/g, '')),
            message: ruleValue === true ? '올바른 전화번호를 입력해주세요.' : ruleValue
        };
    };

    /**
     * Minimum length validation
     */
    FormValidator.prototype.validateMinLength = function(value, ruleValue) {
        var length = typeof value === 'string' ? value.length : 0;
        return {
            valid: length >= ruleValue,
            message: '최소 ' + ruleValue + '자 이상 입력해주세요.'
        };
    };

    /**
     * Maximum length validation
     */
    FormValidator.prototype.validateMaxLength = function(value, ruleValue) {
        var length = typeof value === 'string' ? value.length : 0;
        return {
            valid: length <= ruleValue,
            message: '최대 ' + ruleValue + '자까지 입력 가능합니다.'
        };
    };

    /**
     * Pattern validation
     */
    FormValidator.prototype.validatePattern = function(value, ruleValue) {
        var pattern = ruleValue.pattern || ruleValue;
        var message = ruleValue.message || '올바른 형식으로 입력해주세요.';
        
        return {
            valid: new RegExp(pattern).test(value),
            message: message
        };
    };

    /**
     * File type validation
     */
    FormValidator.prototype.validateFileType = function(files, ruleValue) {
        if (!files || files.length === 0) return { valid: true };
        
        var allowedTypes = Array.isArray(ruleValue) ? ruleValue : [ruleValue];
        var file = files[0];
        
        var isValid = allowedTypes.some(function(type) {
            if (type.includes('*')) {
                return file.type.startsWith(type.replace('*', ''));
            }
            return file.type === type;
        });

        return {
            valid: isValid,
            message: '허용된 파일 형식: ' + allowedTypes.join(', ')
        };
    };

    /**
     * File size validation
     */
    FormValidator.prototype.validateFileSize = function(files, ruleValue) {
        if (!files || files.length === 0) return { valid: true };
        
        var maxSize = typeof ruleValue === 'number' ? ruleValue : 5 * 1024 * 1024; // 5MB default
        var file = files[0];
        
        return {
            valid: file.size <= maxSize,
            message: '파일 크기는 ' + this.formatFileSize(maxSize) + ' 이하여야 합니다.'
        };
    };

    /**
     * Image validation (combines type and size)
     */
    FormValidator.prototype.validateImage = function(files, ruleValue) {
        if (!files || files.length === 0) return { valid: true };
        
        var options = Object.assign({
            types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
            maxSize: 5 * 1024 * 1024
        }, ruleValue);

        var typeResult = this.validateFileType(files, options.types);
        if (!typeResult.valid) return typeResult;

        return this.validateFileSize(files, options.maxSize);
    };

    /**
     * Video validation
     */
    FormValidator.prototype.validateVideo = function(files, ruleValue) {
        if (!files || files.length === 0) return { valid: true };
        
        var options = Object.assign({
            types: ['video/mp4', 'video/webm', 'video/ogg'],
            maxSize: 100 * 1024 * 1024 // 100MB
        }, ruleValue);

        var typeResult = this.validateFileType(files, options.types);
        if (!typeResult.valid) return typeResult;

        return this.validateFileSize(files, options.maxSize);
    };

    /**
     * Show field error
     */
    FormValidator.prototype.showFieldError = function(field, message) {
        // Remove existing error
        this.clearFieldError(field);

        // Add error class
        field.classList.add('error');

        // Create error message element
        var errorElement = document.createElement('div');
        errorElement.className = 'field-error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = 'color: #f44336; font-size: 12px; margin-top: 4px;';

        // Insert after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    };

    /**
     * Clear field error
     */
    FormValidator.prototype.clearFieldError = function(field) {
        field.classList.remove('error');
        
        var errorElement = field.parentNode.querySelector('.field-error-message');
        if (errorElement) {
            errorElement.remove();
        }
    };

    /**
     * Format file size for display
     */
    FormValidator.prototype.formatFileSize = function(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    /**
     * Common validation rules for the application
     */
    FormValidator.prototype.commonRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50
        },
        email: {
            required: true,
            email: true
        },
        phone: {
            required: true,
            phone: true
        },
        idCard: {
            required: true,
            image: {
                types: ['image/jpeg', 'image/jpg', 'image/png'],
                maxSize: 10 * 1024 * 1024
            }
        },
        portfolio: {
            required: true,
            image: {
                types: ['image/jpeg', 'image/jpg', 'image/png'],
                maxSize: 5 * 1024 * 1024
            }
        }
    };

    /**
     * Validate form data for model registration
     */
    FormValidator.prototype.validateModelRegistration = function(formData) {
        var errors = {};
        
        // Step 2: KYC validation
        if (formData.step === 2) {
            if (!formData.name || formData.name.length < 2) {
                errors.name = '이름을 올바르게 입력해주세요.';
            }
            if (!formData.birthdate) {
                errors.birthdate = '생년월일을 입력해주세요.';
            }
            if (!formData.phone || !this.validatePhone(formData.phone, true).valid) {
                errors.phone = '올바른 전화번호를 입력해주세요.';
            }
            if (!formData.idCardImage) {
                errors.idCard = '신분증 사진을 업로드해주세요.';
            }
        }

        // Step 3: Portfolio validation
        if (formData.step === 3) {
            if (!formData.portfolioImages || formData.portfolioImages.length < 3) {
                errors.portfolio = '최소 3장의 포트폴리오 이미지를 업로드해주세요.';
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors: errors
        };
    };

    // Create global instance
    window.formValidator = new FormValidator();

    // Export for potential module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FormValidator;
    }
})();