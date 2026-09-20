// Contact Form functionality with validation, submission,
// Lead Management Data Store and CSV Exporter

// ============================================================
// LEAD MANAGER
// ============================================================

class LeadManager {
    constructor() {
        this.storageKey = 'botforge_leads';
        this.leads = this.loadLeads();
    }

    // Load previously stored leads
    loadLeads() {
        try {
            const storedLeads = localStorage.getItem(this.storageKey);

            if (!storedLeads) {
                return [];
            }

            const parsedLeads = JSON.parse(storedLeads);

            return Array.isArray(parsedLeads) ? parsedLeads : [];
        } catch (error) {
            console.error('Could not load leads:', error);
            return [];
        }
    }

    // Save leads to localStorage
    saveLeads() {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.leads)
            );
        } catch (error) {
            console.error('Could not save leads:', error);
        }
    }

    // Add a new lead
    addLead(leadData) {
        const lead = {
            id: Date.now(),
            name: leadData.name,
            email: leadData.email,
            business: leadData.business,
            message: leadData.message,
            submittedAt: new Date().toISOString()
        };

        this.leads.push(lead);
        this.saveLeads();

        return lead;
    }

    // Get all leads
    getLeads() {
        return [...this.leads];
    }

    // Convert a value into safe CSV format
    escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }

        const stringValue = String(value);

        // Escape quotes by doubling them
        const escapedValue = stringValue.replace(/"/g, '""');

        // Wrap every value in quotes
        return `"${escapedValue}"`;
    }

    // Convert all leads into CSV
    generateCSV() {
        const headers = [
            'ID',
            'Name',
            'Email',
            'Business Type',
            'Message',
            'Submitted At'
        ];

        const rows = this.leads.map(lead => {
            return [
                this.escapeCSV(lead.id),
                this.escapeCSV(lead.name),
                this.escapeCSV(lead.email),
                this.escapeCSV(lead.business),
                this.escapeCSV(lead.message),
                this.escapeCSV(lead.submittedAt)
            ].join(',');
        });

        return [
            headers.join(','),
            ...rows
        ].join('\n');
    }

    // Download leads as leads.csv
    downloadCSV() {
        if (this.leads.length === 0) {
            alert('No leads available to export.');
            return;
        }

        const csvContent = this.generateCSV();

        const blob = new Blob(
            [csvContent],
            {
                type: 'text/csv;charset=utf-8;'
            }
        );

        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');

        downloadLink.href = url;
        downloadLink.download = 'leads.csv';

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);
    }

    // Remove all stored leads
    clearLeads() {
        this.leads = [];
        this.saveLeads();
    }
}


// ============================================================
// CONTACT FORM
// ============================================================

class ContactForm {

    constructor(formId) {

        this.form = document.getElementById(formId);

        this.fields = {};

        this.isSubmitting = false;

        // Create Lead Manager
        this.leadManager = new LeadManager();

        if (this.form) {
            this.init();
        }
    }


    // ========================================================
    // INITIALIZATION
    // ========================================================

    init() {

        this.bindFields();

        this.bindEvents();

        this.createExportButton();
    }


    // ========================================================
    // FORM FIELDS
    // ========================================================

    bindFields() {

        const fieldSelectors = [
            'name',
            'email',
            'business',
            'message'
        ];

        fieldSelectors.forEach(field => {

            const element = document.getElementById(field);

            const errorElement =
                document.getElementById(`${field}Error`);

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


    // ========================================================
    // EVENTS
    // ========================================================

    bindEvents() {

        // Form submission
        this.form.addEventListener(
            'submit',
            (e) => this.handleSubmit(e)
        );


        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {

            const field = this.fields[fieldName];


            // Input event
            field.element.addEventListener(
                'input',
                () => this.validateField(fieldName)
            );


            // Blur event
            field.element.addEventListener(
                'blur',
                () => this.validateField(fieldName)
            );


            // Focus event
            field.element.addEventListener(
                'focus',
                () => this.clearFieldError(fieldName)
            );
        });
    }


    // ========================================================
    // VALIDATE SINGLE FIELD
    // ========================================================

    validateField(fieldName) {

        const field = this.fields[fieldName];

        if (!field) {
            return false;
        }


        const value = field.element.value.trim();

        field.value = value;


        let isValid = false;

        let errorMessage = '';


        switch (fieldName) {

            case 'name':

                isValid =
                    value.length >= 2 &&
                    /^[a-zA-Z\s]+$/.test(value);

                errorMessage =
                    isValid
                        ? ''
                        : 'Please enter a valid name (letters only, min 2 characters)';

                break;


            case 'email':

                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                isValid =
                    emailRegex.test(value);

                errorMessage =
                    isValid
                        ? ''
                        : 'Please enter a valid email address';

                break;


            case 'business':

                isValid =
                    value !== '';

                errorMessage =
                    isValid
                        ? ''
                        : 'Please select your business type';

                break;


            case 'message':

                isValid =
                    value.length >= 10;

                errorMessage =
                    isValid
                        ? ''
                        : 'Please provide more details (minimum 10 characters)';

                break;
        }


        field.isValid = isValid;

        this.updateFieldUI(
            fieldName,
            isValid,
            errorMessage
        );


        return isValid;
    }


    // ========================================================
    // UPDATE FIELD UI
    // ========================================================

    updateFieldUI(
        fieldName,
        isValid,
        errorMessage
    ) {

        const field = this.fields[fieldName];

        const formGroup =
            field.element.parentElement;


        // Remove existing classes
        formGroup.classList.remove(
            'error',
            'success'
        );


        if (field.value) {

            // Add appropriate class
            formGroup.classList.add(
                isValid
                    ? 'success'
                    : 'error'
            );


            // Show / hide error message
            if (field.errorElement) {

                field.errorElement.textContent =
                    errorMessage;
            }
        }
    }


    // ========================================================
    // CLEAR FIELD ERROR
    // ========================================================

    clearFieldError(fieldName) {

        const field = this.fields[fieldName];

        const formGroup =
            field.element.parentElement;


        if (formGroup.classList.contains('error')) {

            formGroup.classList.remove('error');


            if (field.errorElement) {

                field.errorElement.textContent = '';
            }
        }
    }


    // ========================================================
    // VALIDATE COMPLETE FORM
    // ========================================================

    validateForm() {

        let isFormValid = true;


        Object.keys(this.fields).forEach(
            fieldName => {

                if (!this.validateField(fieldName)) {

                    isFormValid = false;
                }
            }
        );


        return isFormValid;
    }


    // ========================================================
    // HANDLE FORM SUBMISSION
    // ========================================================

    async handleSubmit(e) {

        e.preventDefault();


        if (this.isSubmitting) {
            return;
        }


        // Validate form
        if (!this.validateForm()) {

            this.showFormError(
                'Please correct the errors above'
            );

            this.shakeForm();

            return;
        }


        this.isSubmitting = true;

        this.showLoadingState();


        // Prepare lead data
        const leadData = {

            name: this.fields.name.value,

            email: this.fields.email.value,

            business: this.fields.business.value,

            message: this.fields.message.value
        };


        try {

            // =================================================
            // 1. STORE LEAD
            // =================================================

            this.leadManager.addLead(leadData);


            // =================================================
            // 2. SEND WELCOME EMAIL TO CUSTOMER
            // =================================================

            await emailjs.send(
                "service_xjvwrpe",
                "template_smrpqqs",
                {
                    name: this.fields.name.value,

                    email: this.fields.email.value,

                    business: this.fields.business.value,

                    message: this.fields.message.value
                }
            );


            // =================================================
            // 3. SEND NOTIFICATION EMAIL TO ADMIN
            // =================================================

            await emailjs.send(
                "service_xjvwrpe",
                "template_iljigj5",
                {
                    name: this.fields.name.value,

                    email: this.fields.email.value,

                    business: this.fields.business.value,

                    message: this.fields.message.value
                }
            );


            // =================================================
            // 4. SUCCESS
            // =================================================

            this.showToast(
                "Message sent successfully!",
                "success"
            );


            this.showSuccess();


            // Make sure export button is visible
            this.updateExportButton();


        } catch (error) {

            console.error(
                "EmailJS Error:",
                error.text ||
                error.message ||
                error
            );


            alert(
                `EmailJS Error: ${
                    error.text ||
                    error.message ||
                    "Unknown error"
                }`
            );


            this.showFormError(
                "Something went wrong. Please try again."
            );


        } finally {

            this.isSubmitting = false;

            this.hideLoadingState();
        }
    }


    // ========================================================
    // CREATE EXPORT BUTTON
    // ========================================================

    createExportButton() {

        // Don't create duplicate button
        if (
            document.getElementById(
                'exportLeadsBtn'
            )
        ) {
            return;
        }


        const submitBtn =
            document.getElementById('submitBtn');


        if (!submitBtn) {
            return;
        }


        const exportBtn =
            document.createElement('button');


        exportBtn.id =
            'exportLeadsBtn';


        exportBtn.type =
            'button';


        exportBtn.textContent =
            'Download Leads CSV';


        // Basic styling
        Object.assign(
            exportBtn.style,
            {
                display: 'none',

                width: '100%',

                marginTop: '12px',

                padding: '14px 20px',

                border: 'none',

                borderRadius: '8px',

                background:
                    'linear-gradient(135deg, #3B82F6, #8B5CF6)',

                color: '#ffffff',

                fontSize: '16px',

                fontWeight: '600',

                cursor: 'pointer'
            }
        );


        // Download CSV when clicked
        exportBtn.addEventListener(
            'click',
            () => {

                this.leadManager.downloadCSV();
            }
        );


        // Add button after submit button
        submitBtn.parentNode.insertBefore(
            exportBtn,
            submitBtn.nextSibling
        );


        this.updateExportButton();
    }


    // ========================================================
    // UPDATE EXPORT BUTTON
    // ========================================================

    updateExportButton() {

        const exportBtn =
            document.getElementById(
                'exportLeadsBtn'
            );


        if (!exportBtn) {
            return;
        }


        const hasLeads =
            this.leadManager.getLeads().length > 0;


        exportBtn.style.display =
            hasLeads
                ? 'block'
                : 'none';
    }


    // ========================================================
    // SIMULATE FORM SUBMISSION
    // ========================================================

    async simulateFormSubmission() {

        // Simulate network delay
        await new Promise(
            resolve =>
                setTimeout(resolve, 2000)
        );


        // Simulate random success/failure
        if (Math.random() < 0.9) {

            return {
                success: true
            };

        } else {

            throw new Error(
                'Simulated network error'
            );
        }
    }


    // ========================================================
    // LOADING STATE
    // ========================================================

    showLoadingState() {

        const submitBtn =
            document.getElementById(
                'submitBtn'
            );


        if (submitBtn) {

            submitBtn.classList.add(
                'loading'
            );

            submitBtn.disabled = true;
        }
    }


    hideLoadingState() {

        const submitBtn =
            document.getElementById(
                'submitBtn'
            );


        if (submitBtn) {

            submitBtn.classList.remove(
                'loading'
            );

            submitBtn.disabled = false;
        }
    }


    // ========================================================
    // FORM ERROR
    // ========================================================

    showFormError(message) {

        console.error(
            'Form Error:',
            message
        );


        this.showToast(
            message,
            'error'
        );
    }


    // ========================================================
    // SUCCESS MODAL
    // ========================================================

    showSuccess() {

        const modal =
            document.getElementById(
                'successModal'
            );


        if (!modal) {
            return;
        }


        modal.classList.add('show');


        const closeBtn =
            document.getElementById(
                'modalClose'
            );


        const handleClose = () => {

            modal.classList.remove(
                'show'
            );


            this.resetForm();


            if (closeBtn) {

                closeBtn.removeEventListener(
                    'click',
                    handleClose
                );
            }


            modal.removeEventListener(
                'click',
                handleModalClick
            );
        };


        const handleModalClick = (e) => {

            if (e.target === modal) {

                handleClose();
            }
        };


        if (closeBtn) {

            closeBtn.addEventListener(
                'click',
                handleClose
            );
        }


        modal.addEventListener(
            'click',
            handleModalClick
        );
    }


    // ========================================================
    // RESET FORM
    // ========================================================

    resetForm() {

        this.form.reset();


        // Clear validation states
        Object.keys(this.fields).forEach(
            fieldName => {

                const field =
                    this.fields[fieldName];


                const formGroup =
                    field.element.parentElement;


                formGroup.classList.remove(
                    'error',
                    'success'
                );


                if (field.errorElement) {

                    field.errorElement.textContent =
                        '';
                }


                field.value = '';

                field.isValid = false;
            }
        );


        // Keep export button visible if leads exist
        this.updateExportButton();
    }


    // ========================================================
    // SHAKE FORM
    // ========================================================

    shakeForm() {

        this.form.classList.add(
            'animate-shake'
        );


        setTimeout(() => {

            this.form.classList.remove(
                'animate-shake'
            );

        }, 600);
    }


    // ========================================================
    // TOAST
    // ========================================================

    showToast(
        message,
        type = 'info'
    ) {

        // Create toast
        const toast =
            document.createElement('div');


        toast.className =
            `toast toast-${type}`;


        toast.textContent =
            message;


        // Style toast
        Object.assign(
            toast.style,
            {
                position: 'fixed',

                top: '20px',

                right: '20px',

                backgroundColor:
                    type === 'error'
                        ? '#EF4444'
                        : '#10B981',

                color: 'white',

                padding: '12px 24px',

                borderRadius: '8px',

                boxShadow:
                    '0 4px 12px rgba(0, 0, 0, 0.15)',

                zIndex: '10000',

                transform:
                    'translateX(100%)',

                transition:
                    'transform 0.3s ease'
            }
        );


        document.body.appendChild(
            toast
        );


        // Animate in
        setTimeout(() => {

            toast.style.transform =
                'translateX(0)';

        }, 100);


        // Auto remove after 5 seconds
        setTimeout(() => {

            toast.style.transform =
                'translateX(100%)';


            setTimeout(() => {

                if (toast.parentNode) {

                    toast.parentNode.removeChild(
                        toast
                    );
                }

            }, 300);

        }, 5000);
    }
}


// ============================================================
// FORM VALIDATION HELPERS
// ============================================================

const ValidationHelpers = {

    isValidEmail: (email) => {

        const re =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return re.test(email);
    },


    isValidName: (name) => {

        return (
            name.length >= 2 &&
            /^[a-zA-Z\s]+$/.test(name)
        );
    },


    isValidPhone: (phone) => {

        const re =
            /^\+?[\d\s\-\(\)]+$/;

        return (
            re.test(phone) &&
            phone.replace(/\D/g, '').length >= 10
        );
    },


    sanitizeInput: (input) => {

        return input
            .trim()
            .replace(/[<>]/g, '');
    }
};


// ============================================================
// INITIALIZE FORM
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        new ContactForm('contactForm');
    }
);


// ============================================================
// EXPORT FOR MODULAR USAGE
// ============================================================

if (
    typeof module !== 'undefined' &&
    module.exports
) {

    module.exports = {
        ContactForm,
        ValidationHelpers,
        LeadManager
    };
}
