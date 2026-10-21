// Standalone Website Feedback and Rating functionality for BotForge

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

/**
 * Storage manager for website feedback using localStorage.
 * Handles storage, validation, schema verification, and corrupted data recovery.
 */
class FeedbackStorage {
    static STORAGE_KEY = 'botforge_feedback';

    /**
     * Saves feedback to localStorage.
     * @param {Object} feedback
     * @param {number} feedback.rating - Star rating (1 to 5)
     * @param {string} [feedback.comment] - Optional user comments
     * @param {string|number} [feedback.timestamp] - Submission timestamp
     * @returns {{ success: boolean, data?: Object, error?: string }}
     */
    static saveFeedback(feedback) {
        if (!feedback || typeof feedback !== 'object') {
            return { success: false, error: 'Feedback data must be an object' };
        }

        const rating = Number(feedback.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return { success: false, error: 'Rating must be an integer between 1 and 5' };
        }

        const rawComment = typeof feedback.comment === 'string' ? feedback.comment.trim() : '';
        const sanitizedComment = escapeHTML(rawComment);

        let timestamp;
        if (feedback.timestamp) {
            const parsedTime = new Date(feedback.timestamp);
            timestamp = isNaN(parsedTime.getTime()) ? new Date().toISOString() : parsedTime.toISOString();
        } else {
            timestamp = new Date().toISOString();
        }

        const data = {
            rating,
            comment: sanitizedComment,
            timestamp
        };

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return { success: true, data };
        } catch (error) {
            console.warn('FeedbackStorage: Failed to save feedback to localStorage.', error);
            return { success: false, error: 'Could not access localStorage (quota or permissions error)' };
        }
    }

    /**
     * Loads and validates stored feedback from localStorage.
     * Gracefully handles missing items, unparseable JSON, or schema corruption.
     * @returns {Object|null} Validated feedback object or null
     */
    static loadFeedback() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return null;

            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch (jsonErr) {
                console.warn('FeedbackStorage: Corrupted JSON detected in localStorage. Resetting.', jsonErr);
                this.clearFeedback();
                return null;
            }

            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                console.warn('FeedbackStorage: Stored feedback is not a valid object. Resetting.');
                this.clearFeedback();
                return null;
            }

            const rating = Number(parsed.rating);
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                console.warn('FeedbackStorage: Corrupted or missing rating in stored feedback. Resetting.');
                this.clearFeedback();
                return null;
            }

            if (!parsed.timestamp || isNaN(new Date(parsed.timestamp).getTime())) {
                console.warn('FeedbackStorage: Corrupted timestamp in stored feedback. Resetting.');
                this.clearFeedback();
                return null;
            }

            return {
                rating,
                comment: typeof parsed.comment === 'string' ? parsed.comment : '',
                timestamp: parsed.timestamp
            };
        } catch (error) {
            console.warn('FeedbackStorage: Error accessing localStorage.', error);
            this.clearFeedback();
            return null;
        }
    }

    /**
     * Clears stored feedback from localStorage.
     */
    static clearFeedback() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.warn('FeedbackStorage: Unable to clear localStorage item.', error);
        }
    }
}

/**
 * Controller for the Standalone Website Feedback Section.
 */
class FeedbackManager {
    static RATING_LABELS = {
        1: '1 Star - Poor',
        2: '2 Stars - Fair',
        3: '3 Stars - Good',
        4: '4 Stars - Very Good',
        5: '5 Stars - Excellent'
    };

    constructor(formId = 'feedbackForm') {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.card = document.getElementById('feedbackCard');
        this.ratingGroup = this.form.querySelector('.feedback-rating-group');
        this.starButtons = Array.from(this.form.querySelectorAll('.rating-star-btn'));
        this.ratingText = document.getElementById('ratingTextFeedback');
        this.ratingError = document.getElementById('ratingError');
        this.commentInput = document.getElementById('feedbackComment');
        this.submitBtn = document.getElementById('feedbackSubmitBtn');

        this.successState = document.getElementById('feedbackSuccessState');
        this.successMessage = document.getElementById('feedbackSuccessMessage');
        this.summaryContainer = document.getElementById('feedbackSummary');
        this.editBtn = document.getElementById('feedbackEditBtn');

        this.selectedRating = null;
        this.hoveredRating = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingFeedback();
    }

    bindEvents() {
        // Star button interactions
        this.starButtons.forEach((btn) => {
            const rating = parseInt(btn.getAttribute('data-rating') || '0', 10);

            btn.addEventListener('click', () => {
                this.setRating(rating);
            });

            btn.addEventListener('mouseenter', () => {
                this.previewRating(rating);
            });

            btn.addEventListener('focus', () => {
                this.previewRating(rating);
            });

            btn.addEventListener('blur', () => {
                this.resetPreview();
            });

            btn.addEventListener('keydown', (e) => {
                this.handleStarKeyDown(e, rating);
            });
        });

        const starsWrapper = document.getElementById('ratingStars');
        if (starsWrapper) {
            starsWrapper.addEventListener('mouseleave', () => {
                this.resetPreview();
            });
        }

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Re-submit / edit button
        if (this.editBtn) {
            this.editBtn.addEventListener('click', () => {
                this.showFormView();
            });
        }
    }

    handleStarKeyDown(e, currentRating) {
        let targetRating = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            targetRating = Math.min(5, currentRating + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            targetRating = Math.max(1, currentRating - 1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            targetRating = 1;
        } else if (e.key === 'End') {
            e.preventDefault();
            targetRating = 5;
        } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.setRating(currentRating);
            return;
        }

        if (targetRating !== null) {
            const targetBtn = this.starButtons.find(b => parseInt(b.getAttribute('data-rating') || '0', 10) === targetRating);
            if (targetBtn) {
                targetBtn.focus();
                this.setRating(targetRating);
            }
        }
    }

    setRating(rating) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;

        this.selectedRating = rating;
        this.updateStarUI(rating);
        this.clearRatingError();

        if (this.ratingText) {
            this.ratingText.textContent = FeedbackManager.RATING_LABELS[rating] || `${rating} Stars`;
            this.ratingText.classList.add('selected');
        }
    }

    previewRating(rating) {
        this.hoveredRating = rating;
        this.starButtons.forEach(btn => {
            const r = parseInt(btn.getAttribute('data-rating') || '0', 10);
            if (r <= rating) {
                btn.classList.add('hovered');
            } else {
                btn.classList.remove('hovered');
            }
        });

        if (this.ratingText) {
            this.ratingText.textContent = FeedbackManager.RATING_LABELS[rating] || `${rating} Stars`;
        }
    }

    resetPreview() {
        this.hoveredRating = null;
        this.starButtons.forEach(btn => btn.classList.remove('hovered'));

        if (this.ratingText) {
            if (this.selectedRating) {
                this.ratingText.textContent = FeedbackManager.RATING_LABELS[this.selectedRating] || `${this.selectedRating} Stars`;
            } else {
                this.ratingText.textContent = 'Select a rating';
                this.ratingText.classList.remove('selected');
            }
        }
    }

    updateStarUI(activeRating) {
        this.starButtons.forEach(btn => {
            const r = parseInt(btn.getAttribute('data-rating') || '0', 10);
            const isSelected = r <= activeRating;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-checked', r === activeRating ? 'true' : 'false');
        });
    }

    showRatingError(message) {
        if (this.ratingGroup) {
            this.ratingGroup.classList.add('has-error');
        }
        if (this.ratingError) {
            this.ratingError.textContent = message || 'Please select a star rating before submitting your feedback.';
            this.ratingError.style.display = 'block';
        }
        if (this.starButtons[0]) {
            this.starButtons[0].focus();
        }
    }

    clearRatingError() {
        if (this.ratingGroup) {
            this.ratingGroup.classList.remove('has-error');
        }
        if (this.ratingError) {
            this.ratingError.style.display = 'none';
        }
    }

    validate() {
        if (!this.selectedRating || this.selectedRating < 1 || this.selectedRating > 5) {
            this.showRatingError('Please select a star rating before submitting your feedback.');
            return false;
        }
        this.clearRatingError();
        return true;
    }

    handleSubmit(e) {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        if (!this.validate()) {
            return false;
        }

        const comment = this.commentInput ? this.commentInput.value : '';
        const feedbackData = {
            rating: this.selectedRating,
            comment: comment,
            timestamp: new Date().toISOString()
        };

        const result = FeedbackStorage.saveFeedback(feedbackData);
        if (result.success && result.data) {
            this.showSuccessView(result.data);
            return true;
        } else {
            this.showRatingError(result.error || 'Failed to save feedback.');
            return false;
        }
    }

    showSuccessView(feedback) {
        if (this.form) {
            this.form.style.display = 'none';
        }
        if (this.successState) {
            this.successState.style.display = 'block';
            this.renderSummary(feedback);
        }
    }

    showFormView() {
        if (this.successState) {
            this.successState.style.display = 'none';
        }
        if (this.form) {
            this.form.style.display = 'block';
        }
    }

    renderSummary(feedback) {
        if (!this.summaryContainer) return;

        let starsHtml = '<div class="summary-stars" aria-label="' + feedback.rating + ' out of 5 stars">';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= feedback.rating;
            starsHtml += `<span class="summary-star ${filled ? 'filled' : 'empty'}">&#9733;</span>`;
        }
        starsHtml += ` <strong class="summary-score">${feedback.rating} / 5</strong></div>`;

        let commentHtml = '';
        if (feedback.comment && feedback.comment.trim()) {
            commentHtml = `<blockquote class="summary-comment">"${escapeHTML(feedback.comment.trim())}"</blockquote>`;
        }

        const formattedDate = new Date(feedback.timestamp).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        this.summaryContainer.innerHTML = `
            ${starsHtml}
            ${commentHtml}
            <div class="summary-meta">Submitted on ${formattedDate}</div>
        `;
    }

    checkExistingFeedback() {
        const stored = FeedbackStorage.loadFeedback();
        if (stored) {
            this.setRating(stored.rating);
            if (this.commentInput && stored.comment) {
                this.commentInput.value = stored.comment;
            }
            this.showSuccessView(stored);
        } else {
            this.showFormView();
        }
    }
}

// Auto-initialize when DOM is ready in browser
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        const feedbackContainer = document.getElementById('feedbackForm');
        if (feedbackContainer) {
            new FeedbackManager('feedbackForm');
        }
    });
}

// Global scope export for browser and test suites
if (typeof globalThis !== 'undefined') {
    globalThis.escapeHTML = escapeHTML;
    globalThis.FeedbackStorage = FeedbackStorage;
    globalThis.FeedbackManager = FeedbackManager;
}

// Module export for Vitest / Node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHTML,
        FeedbackStorage,
        FeedbackManager
    };
}
