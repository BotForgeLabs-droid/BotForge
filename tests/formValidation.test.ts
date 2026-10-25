// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load scripts/form.js into the environment
const formScriptPath = path.resolve(__dirname, '../scripts/form.js');
const formScriptCode = fs.readFileSync(formScriptPath, 'utf-8');

describe('Form Validation & Helper Test Suite', () => {
    let ValidationHelpers: any;

    beforeEach(() => {
        // Setup DOM environment for form.js
        document.body.innerHTML = `
            <form id="contactForm">
                <div class="form-group">
                    <input type="text" id="name" />
                    <span id="nameError"></span>
                </div>
                <div class="form-group">
                    <input type="email" id="email" />
                    <span id="emailError"></span>
                </div>
                <div class="form-group">
                    <select id="business">
                        <option value="">Select</option>
                        <option value="retail">Retail</option>
                    </select>
                    <span id="businessError"></span>
                </div>
                <div class="form-group">
                    <textarea id="message"></textarea>
                    <span id="messageError"></span>
                </div>
                <button type="submit" id="submitBtn">Submit</button>
            </form>
        `;

        // Evaluate script in sandbox
        const scriptFn = new Function('window', 'document', `${formScriptCode}; return { ValidationHelpers, ContactForm };`);
        const exports = scriptFn(window, document);
        ValidationHelpers = exports.ValidationHelpers;
    });

    describe('Email Validation (RFC Regex)', () => {
        it('should accept valid standard email addresses', () => {
            expect(ValidationHelpers.isValidEmail('user@example.com')).toBe(true);
            expect(ValidationHelpers.isValidEmail('john.doe@company.org')).toBe(true);
            expect(ValidationHelpers.isValidEmail('contact_us@botforge.io')).toBe(true);
            expect(ValidationHelpers.isValidEmail('customer.service@sub.domain.com')).toBe(true);
        });

        it('should reject email addresses without @ symbol', () => {
            expect(ValidationHelpers.isValidEmail('plainaddress')).toBe(false);
            expect(ValidationHelpers.isValidEmail('test.example.com')).toBe(false);
        });

        it('should reject email addresses without domain name or TLD', () => {
            expect(ValidationHelpers.isValidEmail('user@')).toBe(false);
            expect(ValidationHelpers.isValidEmail('user@domain')).toBe(false);
            expect(ValidationHelpers.isValidEmail('@domain.com')).toBe(false);
        });

        it('should reject email addresses containing invalid spaces', () => {
            expect(ValidationHelpers.isValidEmail('user @example.com')).toBe(false);
            expect(ValidationHelpers.isValidEmail('user@ example.com')).toBe(false);
            expect(ValidationHelpers.isValidEmail('user@domain .com')).toBe(false);
        });

        it('should reject empty strings', () => {
            expect(ValidationHelpers.isValidEmail('')).toBe(false);
        });
    });

    describe('Name Validation', () => {
        it('should accept valid alphabetic names with minimum 2 characters', () => {
            expect(ValidationHelpers.isValidName('Dhruvi')).toBe(true);
            expect(ValidationHelpers.isValidName('Alice Smith')).toBe(true);
            expect(ValidationHelpers.isValidName('Mary Jane Watson')).toBe(true);
        });

        it('should reject single-character names', () => {
            expect(ValidationHelpers.isValidName('A')).toBe(false);
            expect(ValidationHelpers.isValidName('J')).toBe(false);
        });

        it('should reject names containing numbers or special characters', () => {
            expect(ValidationHelpers.isValidName('John123')).toBe(false);
            expect(ValidationHelpers.isValidName('User@Name')).toBe(false);
            expect(ValidationHelpers.isValidName('<script>')).toBe(false);
        });

        it('should reject empty strings and trimmed whitespace names', () => {
            expect(ValidationHelpers.isValidName('')).toBe(false);
            expect(ValidationHelpers.isValidName('   '.trim())).toBe(false);
        });
    });

    describe('Phone Validation', () => {
        it('should accept valid 10-digit phone numbers and formatted numbers', () => {
            expect(ValidationHelpers.isValidPhone('9856398563')).toBe(true);
            expect(ValidationHelpers.isValidPhone('+91 9856398563')).toBe(true);
            expect(ValidationHelpers.isValidPhone('(123) 456-7890')).toBe(true);
            expect(ValidationHelpers.isValidPhone('+1-800-555-0199')).toBe(true);
        });

        it('should reject numbers with fewer than 10 digits', () => {
            expect(ValidationHelpers.isValidPhone('12345')).toBe(false);
            expect(ValidationHelpers.isValidPhone('987654321')).toBe(false);
            expect(ValidationHelpers.isValidPhone('')).toBe(false);
        });

        it('should reject alphabetic or invalid characters', () => {
            expect(ValidationHelpers.isValidPhone('abcdefghij')).toBe(false);
            expect(ValidationHelpers.isValidPhone('phone-number')).toBe(false);
        });
    });

    describe('Input Sanitization Helper', () => {
        it('should strip angle brackets to prevent basic HTML injection', () => {
            expect(ValidationHelpers.sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
            expect(ValidationHelpers.sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
        });

        it('should trim surrounding whitespace', () => {
            expect(ValidationHelpers.sanitizeInput('  clean text  ')).toBe('clean text');
        });
    });

    describe('ContactForm Component Validation Logic', () => {
        it('should correctly validate all form fields through ContactForm', () => {
            const scriptFn = new Function('window', 'document', `${formScriptCode}; return ContactForm;`);
            const ContactForm = scriptFn(window, document);
            const formInstance = new ContactForm('contactForm');

            const nameInput = document.getElementById('name') as HTMLInputElement;
            const emailInput = document.getElementById('email') as HTMLInputElement;
            const businessInput = document.getElementById('business') as HTMLSelectElement;
            const messageInput = document.getElementById('message') as HTMLTextAreaElement;

            // Test empty field validation
            nameInput.value = '';
            emailInput.value = '';
            businessInput.value = '';
            messageInput.value = '';

            expect(formInstance.validateField('name')).toBe(false);
            expect(formInstance.validateField('email')).toBe(false);
            expect(formInstance.validateField('business')).toBe(false);
            expect(formInstance.validateField('message')).toBe(false);
            expect(formInstance.validateForm()).toBe(false);

            // Test whitespace-only name
            nameInput.value = '    ';
            expect(formInstance.validateField('name')).toBe(false);

            // Test valid inputs
            nameInput.value = 'Dhruvi Patel';
            emailInput.value = 'dhruvi@botforge.com';
            businessInput.value = 'retail';
            messageInput.value = 'We would love to integrate BotForge chatbots on our store.';

            expect(formInstance.validateField('name')).toBe(true);
            expect(formInstance.validateField('email')).toBe(true);
            expect(formInstance.validateField('business')).toBe(true);
            expect(formInstance.validateField('message')).toBe(true);
            expect(formInstance.validateForm()).toBe(true);
        });

        it('should reject messages with less than 10 characters', () => {
            const scriptFn = new Function('window', 'document', `${formScriptCode}; return ContactForm;`);
            const ContactForm = scriptFn(window, document);
            const formInstance = new ContactForm('contactForm');

            const messageInput = document.getElementById('message') as HTMLTextAreaElement;
            messageInput.value = 'Too short';
            expect(formInstance.validateField('message')).toBe(false);

            messageInput.value = 'This message is over ten characters long.';
            expect(formInstance.validateField('message')).toBe(true);
        });
    });
});
