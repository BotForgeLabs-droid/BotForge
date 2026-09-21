// Contact Form Validation and Handler functionality

/**
 * Sanitizes input text against Cross-Site Scripting (XSS) attacks by converting special characters to HTML entities.
 * Neutralizes <script>, <iframe>, javascript: protocols, and HTML entity vectors.
 * @param {string} str - Raw input string
 * @returns {string} Sanitized string safe for DOM rendering
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

const securityTestVectors = [
    { payload: '<script>alert("XSS")</script>', description: 'Script tag injection' },
    { payload: '<iframe src="javascript:alert(1)"></iframe>', description: 'Iframe javascript URI' },
    { payload: '<img src=x onerror=alert(1)>', description: 'Image onerror handler' },
    { payload: 'javascript:alert(document.cookie)', description: 'Javascript URI scheme' },
    { payload: '<body onload=alert(1)>', description: 'Body onload trigger' },
    { payload: '"/><script>alert(1)</script>', description: 'Attribute breakout XSS' }
];

if (typeof globalThis !== 'undefined') {
    globalThis.escapeHTML = escapeHTML;
    globalThis.securityTestVectors = securityTestVectors;
}

// Form validation helpers
const ValidationHelpers = {
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    isValidName: (name) => {
        return name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
    },
    
    isValidPhone: (phone) => {
        const re = /^\+?[\d\s\-\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },
    
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, '');
    }
};

class ContactForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.fields = {
            name: {
                element: document.getElementById('name'),
                errorElement: document.getElementById('nameError'),
                value: '',
                isValid: false
            },
            email: {
                element: document.getElementById('email'),
                errorElement: document.getElementById('emailError'),
                value: '',
                isValid: false
            },
            business: {
                element: document.getElementById('business'),
                errorElement: document.getElementById('businessError'),
                value: '',
                isValid: false
            },
            message: {
                element: document.getElementById('message'),
                errorElement: document.getElementById('messageError'),
                value: '',
                isValid: false
            }
        };
        
        this.isSubmitting = false;
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field.element) {
                field.element.addEventListener('blur', () => this.validateField(fieldName));
                field.element.addEventListener('input', () => {
                    if (field.errorElement && field.errorElement.textContent) {
                        this.clearFieldError(fieldName);
                    }
                });
            }
        });
    }
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        if (!field.element) return false;
        
        const rawValue = field.element.value;
        const value = ValidationHelpers.sanitizeInput(rawValue);
        field.value = value;
        
        let isValid = false;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'name':
                isValid = ValidationHelpers.isValidName(value);
                errorMessage = isValid ? '' : 'Please enter a valid name (at least 2 letters)';
                break;
                
            case 'email':
                isValid = ValidationHelpers.isValidEmail(value);
                errorMessage = isValid ? '' : 'Please enter a valid email address';
                break;
                
            case 'business':
                isValid = value !== '';
                errorMessage = isValid ? '' : 'Please select your business type';
                break;
                
            case 'message':
                isValid = value.length >= 10;
                errorMessage = isValid ? '' : 'Please provide more details (minimum 10 characters)';
                break;
        }
        
        field.isValid = isValid;
        this.updateFieldUI(fieldName, isValid, errorMessage);
        
        return isValid;
    }
    
    updateFieldUI(fieldName, isValid, errorMessage) {
        const field = this.fields[fieldName];
        const formGroup = field.element ? field.element.parentElement : null;
        if (!formGroup) return;
        
        formGroup.classList.remove('error', 'success');
        
        if (field.value) {
            formGroup.classList.add(isValid ? 'success' : 'error');
            
            if (field.errorElement) {
                field.errorElement.textContent = '';
                if (!isValid) {
                    field.errorElement.appendChild(document.createTextNode(errorMessage));
                }
            }
        }
    }
    
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        const formGroup = field.element ? field.element.parentElement : null;
        
        if (formGroup && formGroup.classList.contains('error')) {
            formGroup.classList.remove('error');
            if (field.errorElement) {
                field.errorElement.textContent = '';
            }
        }
    }
    
    validateForm() {
        let isFormValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        if (!this.validateForm()) {
            this.showFormError('Please correct the errors above');
            this.shakeForm();
            return;
        }
        
        this.isSubmitting = true;
        this.showLoadingState();

        try {
            if (typeof emailjs !== 'undefined') {
                // Send Welcome Email to Customer
                await emailjs.send("service_xjvwrpe", "template_smrpqqs", {
                    name: this.fields.name.value,
                    email: this.fields.email.value,
                    business: this.fields.business.value,
                    message: this.fields.message.value
                });

                // Send Notification Email to Admin
                await emailjs.send("service_xjvwrpe", "template_iljigj5", {
                    name: this.fields.name.value,
                    email: this.fields.email.value,
                    business: this.fields.business.value,
                    message: this.fields.message.value
                });
            }

            this.showToast("Message sent successfully!", "success");
            this.showSuccess();

        } catch (error) {
            console.error("EmailJS Error:", error.text || error.message || error);
            this.showFormError("Something went wrong. Please try again.");
        } finally {
            this.isSubmitting = false;
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
    }
    
    hideLoadingState() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
    
    showFormError(message) {
        console.error('Form Error:', message);
        this.showToast(message, 'error');
    }
    
    showSuccess() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('show');
            
            const closeBtn = document.getElementById('modalClose');
            const handleClose = () => {
                modal.classList.remove('show');
                this.resetForm();
                if (closeBtn) closeBtn.removeEventListener('click', handleClose);
                modal.removeEventListener('click', handleModalClick);
            };
            
            const handleModalClick = (e) => {
                if (e.target === modal) {
                    handleClose();
                }
            };
            
            if (closeBtn) closeBtn.addEventListener('click', handleClose);
            modal.addEventListener('click', handleModalClick);
        }
    }
    
    resetForm() {
        if (this.form) this.form.reset();
        
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field.element && field.element.parentElement) {
                field.element.parentElement.classList.remove('error', 'success');
            }
            if (field.errorElement) {
                field.errorElement.textContent = '';
            }
            field.value = '';
            field.isValid = false;
        });
    }
    
    shakeForm() {
        if (this.form) {
            this.form.classList.add('animate-shake');
            setTimeout(() => {
                this.form.classList.remove('animate-shake');
            }, 600);
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.appendChild(document.createTextNode(message));
        
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: type === 'error' ? '#EF4444' : '#10B981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ContactForm('contactForm');
});

// Export for modular usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContactForm, ValidationHelpers };
}
