// Contact Form functionality with validation and submission

class ContactForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.fields = {};
        this.isSubmitting = false;
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.bindFields();
        this.bindEvents();
    }
    
    bindFields() {
        const fieldSelectors = ['name', 'email', 'business', 'message'];
        
        fieldSelectors.forEach(field => {
            const element = document.getElementById(field);
            const errorElement = document.getElementById(`${field}Error`);
            
            if (element) {
                this.fields[field] = {
                    element,
                    errorElement,
                    value: '',
                    isValid: false
                };
            }
        });
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            
            // Input/change events
            field.element.addEventListener('input', () => this.validateField(fieldName));
            field.element.addEventListener('blur', () => this.validateField(fieldName));
            
            // Focus events for better UX
            field.element.addEventListener('focus', () => this.clearFieldError(fieldName));
        });
    }
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return false;
        
        const value = field.element.value.trim();
        field.value = value;
        
        let isValid = false;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'name':
                isValid = value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
                errorMessage = isValid ? '' : 'Please enter a valid name (letters only, min 2 characters)';
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
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
        const formGroup = field.element.parentElement;
        
        // Remove existing classes
        formGroup.classList.remove('error', 'success');
        
        if (field.value) {
            // Add appropriate class
            formGroup.classList.add(isValid ? 'success' : 'error');
            
            // Show/hide error message
            if (field.errorElement) {
                field.errorElement.textContent = errorMessage;
            }
        }
    }
    
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        const formGroup = field.element.parentElement;
        
        if (formGroup.classList.contains('error')) {
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
        // ✅ 1. Send Welcome Email to Customer (includes demo link)
        await emailjs.send("service_xjvwrpe", "template_smrpqqs", {
            name: this.fields.name.value,
            email: this.fields.email.value,
            business: this.fields.business.value,
            message: this.fields.message.value,
            
        });

        // ✅ 2. Send Notification Email to You (Admin)
        await emailjs.send("service_xjvwrpe", "template_iljigj5", {
            name: this.fields.name.value,
            email: this.fields.email.value,
            business: this.fields.business.value,
            message: this.fields.message.value
        });

        this.showToast("Message sent successfully!", "success");
        this.showSuccess();

    } catch (error) {
           console.error("EmailJS Error:", error.text || error.message || error);
    alert(`EmailJS Error: ${error.text || error.message || "Unknown error"}`);
    this.showFormError("Something went wrong. Please try again.");
    } finally {
        this.isSubmitting = false;
        this.hideLoadingState();
    }
}


    async simulateFormSubmission() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random success/failure (90% success rate)
        if (Math.random() < 0.9) {
            return { success: true };
        } else {
            throw new Error('Simulated network error');
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
        // You can customize this to show error messages
        console.error('Form Error:', message);
        
        // Optional: Add a toast notification or alert
        this.showToast(message, 'error');
    }
    
    showSuccess() {
        // Show success modal
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('show');
            
            // Bind close event
            const closeBtn = document.getElementById('modalClose');
            const handleClose = () => {
                modal.classList.remove('show');
                this.resetForm();
                closeBtn.removeEventListener('click', handleClose);
                modal.removeEventListener('click', handleModalClick);
            };
            
            const handleModalClick = (e) => {
                if (e.target === modal) {
                    handleClose();
                }
            };
            
            closeBtn.addEventListener('click', handleClose);
            modal.addEventListener('click', handleModalClick);
        }
    }
    
    resetForm() {
        this.form.reset();
        
        // Clear validation states
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            const formGroup = field.element.parentElement;
            
            formGroup.classList.remove('error', 'success');
            if (field.errorElement) {
                field.errorElement.textContent = '';
            }
            
            field.value = '';
            field.isValid = false;
        });
    }
    
    shakeForm() {
        this.form.classList.add('animate-shake');
        setTimeout(() => {
            this.form.classList.remove('animate-shake');
        }, 600);
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
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
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
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
        return input.trim().replace(/[<>]/g, '');
    }
};

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ContactForm('contactForm');
});

// Export for modular usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContactForm, ValidationHelpers };
}