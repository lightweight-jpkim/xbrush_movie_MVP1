/**
 * Input Validation Module
 * Provides comprehensive validation for all user inputs
 */

class ValidationService {
    constructor() {
        this.rules = {
            required: (value) => !!value && value.toString().trim().length > 0,
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
            url: (value) => {
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            minLength: (min) => (value) => value && value.length >= min,
            maxLength: (max) => (value) => !value || value.length <= max,
            pattern: (pattern) => (value) => new RegExp(pattern).test(value),
            numeric: (value) => /^\d+$/.test(value),
            alphanumeric: (value) => /^[a-zA-Z0-9]+$/.test(value),
            noSpecialChars: (value) => /^[a-zA-Z0-9\s가-힣]+$/.test(value),
            price: (value) => /^\d+(\.\d{1,2})?$/.test(value) && parseFloat(value) > 0,
            imageFile: (file) => {
                if (!file) return true;
                const validTypes = window.AppConfig?.app.supportedImageTypes || ['image/jpeg', 'image/png', 'image/webp'];
                const maxSize = window.AppConfig?.app.maxImageSize || 5 * 1024 * 1024;
                return validTypes.includes(file.type) && file.size <= maxSize;
            }
        };
        
        this.messages = {
            required: '이 필드는 필수입니다.',
            email: '올바른 이메일 주소를 입력해주세요.',
            phone: '올바른 전화번호를 입력해주세요.',
            url: '올바른 URL을 입력해주세요.',
            minLength: (min) => `최소 ${min}자 이상 입력해주세요.`,
            maxLength: (max) => `최대 ${max}자까지 입력 가능합니다.`,
            pattern: '올바른 형식으로 입력해주세요.',
            numeric: '숫자만 입력 가능합니다.',
            alphanumeric: '영문자와 숫자만 입력 가능합니다.',
            noSpecialChars: '특수문자는 사용할 수 없습니다.',
            price: '올바른 가격을 입력해주세요.',
            imageFile: '지원되는 이미지 파일만 업로드 가능합니다. (JPG, PNG, WebP / 최대 5MB)'
        };
    }
    
    /**
     * Validate model registration form
     */
    validateModelRegistration(formData) {
        const errors = {};
        
        // Personal Information
        if (!this.rules.required(formData.name)) {
            errors.name = this.messages.required;
        } else if (!this.rules.minLength(2)(formData.name)) {
            errors.name = this.messages.minLength(2);
        } else if (!this.rules.maxLength(50)(formData.name)) {
            errors.name = this.messages.maxLength(50);
        }
        
        if (!this.rules.required(formData.email)) {
            errors.email = this.messages.required;
        } else if (!this.rules.email(formData.email)) {
            errors.email = this.messages.email;
        }
        
        if (!this.rules.required(formData.phone)) {
            errors.phone = this.messages.required;
        } else if (!this.rules.phone(formData.phone)) {
            errors.phone = this.messages.phone;
        }
        
        // Profile Information
        if (!this.rules.required(formData.intro)) {
            errors.intro = this.messages.required;
        } else if (!this.rules.minLength(10)(formData.intro)) {
            errors.intro = this.messages.minLength(10);
        } else if (!this.rules.maxLength(200)(formData.intro)) {
            errors.intro = this.messages.maxLength(200);
        }
        
        // Categories
        if (!formData.categories || formData.categories.length === 0) {
            errors.categories = '최소 1개 이상의 카테고리를 선택해주세요.';
        } else if (formData.categories.length > 5) {
            errors.categories = '최대 5개까지 선택 가능합니다.';
        }
        
        // Thumbnail
        if (!formData.thumbnail) {
            errors.thumbnail = '프로필 사진은 필수입니다.';
        } else if (formData.thumbnail instanceof File && !this.rules.imageFile(formData.thumbnail)) {
            errors.thumbnail = this.messages.imageFile;
        }
        
        // Portfolio Images
        if (formData.portfolioImages) {
            const invalidImages = formData.portfolioImages.filter(img => !this.rules.imageFile(img));
            if (invalidImages.length > 0) {
                errors.portfolioImages = `${invalidImages.length}개의 이미지가 형식에 맞지 않습니다.`;
            }
        }
        
        // Contract Information
        if (formData.basePrice && !this.rules.price(formData.basePrice)) {
            errors.basePrice = this.messages.price;
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
    
    /**
     * Validate video creation form inputs
     */
    validateVideoCreation(data) {
        const errors = {};
        
        if (!this.rules.required(data.productName)) {
            errors.productName = this.messages.required;
        } else if (!this.rules.minLength(2)(data.productName)) {
            errors.productName = this.messages.minLength(2);
        }
        
        if (!this.rules.required(data.targetAudience)) {
            errors.targetAudience = this.messages.required;
        }
        
        if (!this.rules.required(data.coreMessage)) {
            errors.coreMessage = this.messages.required;
        } else if (!this.rules.maxLength(100)(data.coreMessage)) {
            errors.coreMessage = this.messages.maxLength(100);
        }
        
        if (!this.rules.required(data.tone)) {
            errors.tone = this.messages.required;
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
    
    /**
     * Sanitize input to prevent XSS
     */
    sanitizeInput(input) {
        if (!input) return '';
        
        // Convert to string and trim
        let sanitized = input.toString().trim();
        
        // Remove script tags and event handlers
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        
        // Escape HTML entities
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        
        return sanitized.replace(/[&<>"'\/]/g, (match) => escapeMap[match]);
    }
    
    /**
     * Validate file upload
     */
    validateFileUpload(file, options = {}) {
        const {
            maxSize = 5 * 1024 * 1024,
            allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
            required = false
        } = options;
        
        if (!file && required) {
            return { isValid: false, error: '파일을 선택해주세요.' };
        }
        
        if (!file) {
            return { isValid: true };
        }
        
        if (!allowedTypes.includes(file.type)) {
            return { 
                isValid: false, 
                error: `지원되는 파일 형식: ${allowedTypes.join(', ')}`
            };
        }
        
        if (file.size > maxSize) {
            const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            return { 
                isValid: false, 
                error: `파일 크기는 ${sizeMB}MB를 초과할 수 없습니다.`
            };
        }
        
        return { isValid: true };
    }
    
    /**
     * Show validation errors on form
     */
    showFormErrors(formElement, errors) {
        // Clear previous errors
        formElement.querySelectorAll('.error-message').forEach(el => el.remove());
        formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Show new errors
        Object.entries(errors).forEach(([field, message]) => {
            const input = formElement.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                
                // Insert error message after the input or its container
                const container = input.closest('.form-group') || input.parentElement;
                container.appendChild(errorDiv);
            }
        });
    }
    
    /**
     * Real-time validation setup
     */
    setupRealtimeValidation(formElement, validationRules) {
        formElement.addEventListener('input', (e) => {
            const field = e.target;
            const fieldName = field.name;
            
            if (!fieldName || !validationRules[fieldName]) return;
            
            // Clear previous error
            field.classList.remove('error');
            const existingError = field.parentElement.querySelector('.error-message');
            if (existingError) existingError.remove();
            
            // Validate field
            const rules = validationRules[fieldName];
            const value = field.type === 'file' ? field.files[0] : field.value;
            
            for (const rule of rules) {
                if (!rule.validator(value)) {
                    field.classList.add('error');
                    
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = rule.message;
                    
                    field.parentElement.appendChild(errorDiv);
                    break;
                }
            }
        });
    }
}

// Create global instance
window.validationService = new ValidationService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationService;
}