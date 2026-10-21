// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load scripts/feedback.js into the test environment
const feedbackScriptPath = path.resolve(__dirname, '../scripts/feedback.js');
const feedbackScriptCode = fs.readFileSync(feedbackScriptPath, 'utf-8');

interface StoredFeedback {
    rating: number;
    comment: string;
    timestamp: string;
}

interface SaveResult {
    success: boolean;
    data?: StoredFeedback;
    error?: string;
}

interface IFeedbackStorage {
    STORAGE_KEY: string;
    HISTORY_KEY: string;
    saveFeedback: (data: Partial<StoredFeedback>) => SaveResult;
    loadFeedback: () => StoredFeedback | null;
    loadHistory: () => StoredFeedback[];
    clearFeedback: () => void;
}

interface IFeedbackManager {
    selectedRating: number | null;
    hoveredRating: number | null;
    setRating: (rating: number) => void;
    previewRating: (rating: number) => void;
    resetPreview: () => void;
    validate: () => boolean;
    handleSubmit: (e?: Event) => boolean;
    showFormView: () => void;
    showSuccessView: (feedback: StoredFeedback) => void;
}

describe('Standalone Website Feedback & Rating Suite', () => {
    let FeedbackStorage: IFeedbackStorage;
    let FeedbackManager: new (formId?: string) => IFeedbackManager;
    let escapeHTML: (str: string) => string;

    const setupDOM = () => {
        document.body.innerHTML = `
            <section class="feedback-section" id="feedback">
                <div class="feedback-container">
                    <div class="feedback-card" id="feedbackCard">
                        <form id="feedbackForm" class="feedback-form" novalidate>
                            <div class="feedback-rating-group">
                                <label class="feedback-label" id="ratingLabel">How would you rate your experience?</label>
                                <div class="rating-stars-wrapper" role="radiogroup" aria-labelledby="ratingLabel" id="ratingStars">
                                    <button type="button" class="rating-star-btn" data-rating="1" role="radio" aria-checked="false" aria-label="1 star - Poor">
                                        <svg class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </button>
                                    <button type="button" class="rating-star-btn" data-rating="2" role="radio" aria-checked="false" aria-label="2 stars - Fair">
                                        <svg class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </button>
                                    <button type="button" class="rating-star-btn" data-rating="3" role="radio" aria-checked="false" aria-label="3 stars - Good">
                                        <svg class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </button>
                                    <button type="button" class="rating-star-btn" data-rating="4" role="radio" aria-checked="false" aria-label="4 stars - Very Good">
                                        <svg class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </button>
                                    <button type="button" class="rating-star-btn" data-rating="5" role="radio" aria-checked="false" aria-label="5 stars - Excellent">
                                        <svg class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </button>
                                </div>
                                <div class="rating-text-feedback" id="ratingTextFeedback">Select a rating</div>
                                <span class="error-message feedback-error" id="ratingError" style="display: none;">
                                    Please select a star rating before submitting your feedback.
                                </span>
                            </div>
                            <div class="feedback-comment-group">
                                <label for="feedbackComment" class="feedback-label">Additional comments</label>
                                <textarea id="feedbackComment" class="feedback-textarea"></textarea>
                            </div>
                            <div class="feedback-actions">
                                <button type="submit" id="feedbackSubmitBtn" class="btn btn-primary feedback-submit-btn">
                                    <span class="btn-text">Submit Feedback</span>
                                </button>
                            </div>
                        </form>
                        <div id="feedbackSuccessState" class="feedback-success-state" style="display: none;">
                            <h3 class="feedback-success-title">Thank You for Your Feedback!</h3>
                            <p class="feedback-success-msg" id="feedbackSuccessMessage">Your rating has been recorded.</p>
                            <div class="feedback-summary" id="feedbackSummary"></div>
                            <button type="button" id="feedbackEditBtn" class="btn btn-secondary feedback-edit-btn">
                                Submit Another Response
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    };

    beforeEach(() => {
        localStorage.clear();
        setupDOM();

        // Evaluate feedback script in the test sandbox
        const scriptFn = new Function('window', 'document', `${feedbackScriptCode}; return { FeedbackStorage, FeedbackManager, escapeHTML };`);
        const exportsObj = scriptFn(window, document);
        FeedbackStorage = exportsObj.FeedbackStorage;
        FeedbackManager = exportsObj.FeedbackManager;
        escapeHTML = exportsObj.escapeHTML;
    });

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('FeedbackStorage Unit Tests', () => {
        it('should correctly save and load valid feedback to localStorage', () => {
            const feedbackInput = {
                rating: 5,
                comment: 'BotForge chatbot is incredibly smooth and helpful!',
                timestamp: '2026-10-22T00:00:00.000Z'
            };

            const saveResult = FeedbackStorage.saveFeedback(feedbackInput);
            expect(saveResult.success).toBe(true);
            expect(saveResult.data?.rating).toBe(5);
            expect(saveResult.data?.comment).toBe('BotForge chatbot is incredibly smooth and helpful!');
            expect(saveResult.data?.timestamp).toBe('2026-10-22T00:00:00.000Z');

            const loaded = FeedbackStorage.loadFeedback();
            expect(loaded).not.toBeNull();
            expect(loaded?.rating).toBe(5);
            expect(loaded?.comment).toBe(feedbackInput.comment);
            expect(loaded?.timestamp).toBe('2026-10-22T00:00:00.000Z');
        });

        it('should accept all five rating options (1 through 5)', () => {
            for (let r = 1; r <= 5; r++) {
                const res = FeedbackStorage.saveFeedback({ rating: r });
                expect(res.success).toBe(true);
                expect(res.data?.rating).toBe(r);

                const loaded = FeedbackStorage.loadFeedback();
                expect(loaded?.rating).toBe(r);
            }
        });

        it('should reject invalid or missing ratings', () => {
            // Missing rating
            expect(FeedbackStorage.saveFeedback({} as Partial<StoredFeedback>).success).toBe(false);

            // Null rating
            expect(FeedbackStorage.saveFeedback({ rating: null as unknown as number }).success).toBe(false);

            // Out of bounds ratings
            expect(FeedbackStorage.saveFeedback({ rating: 0 }).success).toBe(false);
            expect(FeedbackStorage.saveFeedback({ rating: 6 }).success).toBe(false);
            expect(FeedbackStorage.saveFeedback({ rating: -1 }).success).toBe(false);
            expect(FeedbackStorage.saveFeedback({ rating: 3.5 }).success).toBe(false);
        });

        it('should handle optional comment correctly when empty or omitted', () => {
            const res = FeedbackStorage.saveFeedback({ rating: 4 });
            expect(res.success).toBe(true);
            expect(res.data?.comment).toBe('');

            const loaded = FeedbackStorage.loadFeedback();
            expect(loaded?.comment).toBe('');
        });

        it('should sanitize comments against XSS injection vectors', () => {
            const maliciousComment = '<script>alert("hack")</script><iframe src="javascript:alert(1)"></iframe>';
            const res = FeedbackStorage.saveFeedback({ rating: 4, comment: maliciousComment });
            expect(res.success).toBe(true);
            expect(res.data?.comment).not.toContain('<script>');
            expect(res.data?.comment).not.toContain('</iframe>');
            expect(res.data?.comment).toContain('&lt;script&gt;');
        });

        it('should properly escape HTML characters using escapeHTML helper', () => {
            expect(escapeHTML('<script>')).toBe('&lt;script&gt;');
            expect(escapeHTML('"hello" & \'world\'/')).toBe('&quot;hello&quot; &amp; &#x27;world&#x27;&#x2F;');
            expect(escapeHTML(123 as unknown as string)).toBe('');
        });

        it('should handle corrupted JSON data in localStorage gracefully', () => {
            localStorage.setItem(FeedbackStorage.STORAGE_KEY, '{ invalid_json ::: corrupt');
            const loaded = FeedbackStorage.loadFeedback();
            expect(loaded).toBeNull();
            // Should also have cleaned up the corrupted entry
            expect(localStorage.getItem(FeedbackStorage.STORAGE_KEY)).toBeNull();
        });

        it('should handle non-object data in localStorage gracefully', () => {
            localStorage.setItem(FeedbackStorage.STORAGE_KEY, JSON.stringify('a string not an object'));
            expect(FeedbackStorage.loadFeedback()).toBeNull();

            localStorage.setItem(FeedbackStorage.STORAGE_KEY, JSON.stringify([1, 2, 3]));
            expect(FeedbackStorage.loadFeedback()).toBeNull();

            localStorage.setItem(FeedbackStorage.STORAGE_KEY, JSON.stringify(42));
            expect(FeedbackStorage.loadFeedback()).toBeNull();
        });

        it('should handle missing or corrupted rating in stored object gracefully', () => {
            localStorage.setItem(FeedbackStorage.STORAGE_KEY, JSON.stringify({ comment: 'hi', timestamp: new Date().toISOString() }));
            expect(FeedbackStorage.loadFeedback()).toBeNull();

            localStorage.setItem(FeedbackStorage.STORAGE_KEY, JSON.stringify({ rating: 'not-a-number', timestamp: new Date().toISOString() }));
            expect(FeedbackStorage.loadFeedback()).toBeNull();

            localStorage.setItem(FeedbackStorage.STORAGE_KEY, JSON.stringify({ rating: 10, timestamp: new Date().toISOString() }));
            expect(FeedbackStorage.loadFeedback()).toBeNull();
        });

        it('should handle corrupted timestamp gracefully', () => {
            localStorage.setItem(FeedbackStorage.STORAGE_KEY, JSON.stringify({ rating: 4, comment: 'test', timestamp: 'not-a-date' }));
            expect(FeedbackStorage.loadFeedback()).toBeNull();
        });

        it('should handle localStorage access errors gracefully without throwing', () => {
            vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            const res = FeedbackStorage.saveFeedback({ rating: 5, comment: 'Great' });
            expect(res.success).toBe(false);
            expect(res.error).toBeDefined();
        });

        it('should clear stored feedback when clearFeedback is called', () => {
            FeedbackStorage.saveFeedback({ rating: 3 });
            expect(FeedbackStorage.loadFeedback()).not.toBeNull();

            FeedbackStorage.clearFeedback();
            expect(FeedbackStorage.loadFeedback()).toBeNull();
        });
    });

    describe('FeedbackManager UI & Component Interaction Suite', () => {
        it('should initialize with default state when no previous feedback exists', () => {
            const manager = new FeedbackManager('feedbackForm');
            expect(manager.selectedRating).toBeNull();

            const form = document.getElementById('feedbackForm') as HTMLFormElement;
            const successState = document.getElementById('feedbackSuccessState') as HTMLElement;
            expect(form.style.display).not.toBe('none');
            expect(successState.style.display).toBe('none');
        });

        it('should allow selecting each of the 5 rating stars via click', () => {
            const manager = new FeedbackManager('feedbackForm');
            const starButtons = document.querySelectorAll('.rating-star-btn');
            expect(starButtons.length).toBe(5);

            for (let i = 0; i < 5; i++) {
                const btn = starButtons[i] as HTMLButtonElement;
                btn.click();
                const expectedRating = i + 1;
                expect(manager.selectedRating).toBe(expectedRating);

                // Verify visual state on all stars
                starButtons.forEach((sBtn, idx) => {
                    if (idx <= i) {
                        expect(sBtn.classList.contains('active')).toBe(true);
                    } else {
                        expect(sBtn.classList.contains('active')).toBe(false);
                    }
                });

                // Verify aria-checked on clicked star
                expect(btn.getAttribute('aria-checked')).toBe('true');
            }
        });

        it('should update feedback text label dynamically upon selecting a rating', () => {
            const manager = new FeedbackManager('feedbackForm');
            const ratingText = document.getElementById('ratingTextFeedback') as HTMLElement;

            manager.setRating(1);
            expect(ratingText.textContent).toContain('1 Star');

            manager.setRating(3);
            expect(ratingText.textContent).toContain('3 Stars');

            manager.setRating(5);
            expect(ratingText.textContent).toContain('5 Stars');
        });

        it('should preview star rating on hover and restore on resetPreview', () => {
            const manager = new FeedbackManager('feedbackForm');
            const starButtons = document.querySelectorAll('.rating-star-btn');

            // Select rating 2 first
            manager.setRating(2);

            // Hover over star 4
            manager.previewRating(4);
            expect(starButtons[0].classList.contains('hovered')).toBe(true);
            expect(starButtons[3].classList.contains('hovered')).toBe(true);
            expect(starButtons[4].classList.contains('hovered')).toBe(false);

            // Reset preview
            manager.resetPreview();
            starButtons.forEach(btn => {
                expect(btn.classList.contains('hovered')).toBe(false);
            });
            // Original selection 2 should still be active
            expect(starButtons[0].classList.contains('active')).toBe(true);
            expect(starButtons[1].classList.contains('active')).toBe(true);
            expect(starButtons[2].classList.contains('active')).toBe(false);
        });

        it('should support keyboard navigation across stars (ArrowRight, ArrowLeft, Home, End)', () => {
            const manager = new FeedbackManager('feedbackForm');
            const starButtons = document.querySelectorAll('.rating-star-btn');

            // Press ArrowRight from star 1
            const star1 = starButtons[0] as HTMLButtonElement;
            star1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            expect(manager.selectedRating).toBe(2);

            // Press ArrowRight from star 2
            const star2 = starButtons[1] as HTMLButtonElement;
            star2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            expect(manager.selectedRating).toBe(3);

            // Press ArrowLeft from star 3
            const star3 = starButtons[2] as HTMLButtonElement;
            star3.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
            expect(manager.selectedRating).toBe(2);

            // Press End key to jump to 5
            star2.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
            expect(manager.selectedRating).toBe(5);

            // Press Home key to jump to 1
            const star5 = starButtons[4] as HTMLButtonElement;
            star5.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
            expect(manager.selectedRating).toBe(1);
        });

        it('should reject submission without selecting a rating and display validation error', () => {
            const manager = new FeedbackManager('feedbackForm');
            const form = document.getElementById('feedbackForm') as HTMLFormElement;
            const errorElement = document.getElementById('ratingError') as HTMLElement;
            const ratingGroup = document.querySelector('.feedback-rating-group') as HTMLElement;

            // Submit form without selecting star
            const submitEvent = new Event('submit', { cancelable: true });
            const result = manager.handleSubmit(submitEvent);

            expect(result).toBe(false);
            expect(form.style.display).not.toBe('none');
            expect(errorElement.style.display).toBe('block');
            expect(errorElement.textContent).toContain('Please select a star rating');
            expect(ratingGroup.classList.contains('has-error')).toBe(true);

            // Storage should remain empty
            expect(FeedbackStorage.loadFeedback()).toBeNull();
        });

        it('should clear validation error once a star rating is selected', () => {
            const manager = new FeedbackManager('feedbackForm');
            const errorElement = document.getElementById('ratingError') as HTMLElement;
            const ratingGroup = document.querySelector('.feedback-rating-group') as HTMLElement;

            // Trigger error
            manager.handleSubmit();
            expect(errorElement.style.display).toBe('block');

            // Select a star
            manager.setRating(4);
            expect(errorElement.style.display).toBe('none');
            expect(ratingGroup.classList.contains('has-error')).toBe(false);
        });

        it('should successfully submit valid feedback, store it, and display success state', () => {
            const manager = new FeedbackManager('feedbackForm');
            const form = document.getElementById('feedbackForm') as HTMLFormElement;
            const successState = document.getElementById('feedbackSuccessState') as HTMLElement;
            const commentInput = document.getElementById('feedbackComment') as HTMLTextAreaElement;
            const summary = document.getElementById('feedbackSummary') as HTMLElement;

            // Fill form
            manager.setRating(5);
            commentInput.value = 'Awesome bot demo! Very impressed with responsiveness.';

            // Submit
            const result = manager.handleSubmit();
            expect(result).toBe(true);

            // Check UI changes
            expect(form.style.display).toBe('none');
            expect(successState.style.display).toBe('block');
            expect(summary.innerHTML).toContain('5 / 5');
            expect(summary.innerHTML).toContain('Awesome bot demo');

            // Verify stored data
            const stored = FeedbackStorage.loadFeedback();
            expect(stored).not.toBeNull();
            expect(stored?.rating).toBe(5);
            expect(stored?.comment).toBe('Awesome bot demo! Very impressed with responsiveness.');
        });

        it('should support submitting feedback with an optional empty comment', () => {
            const manager = new FeedbackManager('feedbackForm');
            const form = document.getElementById('feedbackForm') as HTMLFormElement;
            const successState = document.getElementById('feedbackSuccessState') as HTMLElement;

            manager.setRating(4);

            const result = manager.handleSubmit();
            expect(result).toBe(true);
            expect(form.style.display).toBe('none');
            expect(successState.style.display).toBe('block');

            const stored = FeedbackStorage.loadFeedback();
            expect(stored?.rating).toBe(4);
            expect(stored?.comment).toBe('');
        });

        it('should restore existing stored feedback on page load and display summary', () => {
            FeedbackStorage.saveFeedback({
                rating: 5,
                comment: 'Returning customer feedback',
                timestamp: '2026-10-22T00:00:00.000Z'
            });

            const manager = new FeedbackManager('feedbackForm');
            const form = document.getElementById('feedbackForm') as HTMLFormElement;
            const successState = document.getElementById('feedbackSuccessState') as HTMLElement;
            const summary = document.getElementById('feedbackSummary') as HTMLElement;

            expect(form.style.display).toBe('none');
            expect(successState.style.display).toBe('block');
            expect(summary.textContent).toContain('5 / 5');
            expect(summary.textContent).toContain('Returning customer feedback');
            expect(manager.selectedRating).toBe(5);
        });

        it('should allow user to click "Submit Another Response" and return to form view', () => {
            FeedbackStorage.saveFeedback({ rating: 4, comment: 'First response' });

            new FeedbackManager('feedbackForm');
            const form = document.getElementById('feedbackForm') as HTMLFormElement;
            const successState = document.getElementById('feedbackSuccessState') as HTMLElement;
            const editBtn = document.getElementById('feedbackEditBtn') as HTMLButtonElement;

            expect(form.style.display).toBe('none');
            expect(successState.style.display).toBe('block');

            editBtn.click();

            expect(form.style.display).toBe('block');
            expect(successState.style.display).toBe('none');
        });

        it('should handle corrupted stored feedback gracefully when manager is initialized', () => {
            localStorage.setItem(FeedbackStorage.STORAGE_KEY, '{ invalid_corrupt_data');

            const manager = new FeedbackManager('feedbackForm');
            const form = document.getElementById('feedbackForm') as HTMLFormElement;
            const successState = document.getElementById('feedbackSuccessState') as HTMLElement;

            // Form should stay in clean default state
            expect(form.style.display).not.toBe('none');
            expect(successState.style.display).toBe('none');
            expect(manager.selectedRating).toBeNull();
        });

        it('should display both comments together in the review box when multiple submissions occur', () => {
            const manager = new FeedbackManager('feedbackForm');
            const commentInput = document.getElementById('feedbackComment') as HTMLTextAreaElement;
            const summary = document.getElementById('feedbackSummary') as HTMLElement;
            const editBtn = document.getElementById('feedbackEditBtn') as HTMLButtonElement;

            // First submission
            manager.setRating(4);
            commentInput.value = 'First comment: The chatbot answered my pricing questions quickly.';
            manager.handleSubmit();

            expect(summary.textContent).toContain('First comment');

            // Click submit another
            editBtn.click();
            expect(commentInput.value).toBe('');

            // Second submission
            manager.setRating(5);
            commentInput.value = 'Second comment: Excellent UI design and animations.';
            manager.handleSubmit();

            // Verify BOTH comments are displayed together in the review box
            expect(summary.textContent).toContain('First comment');
            expect(summary.textContent).toContain('Second comment');
            expect(summary.textContent).toContain('Your Submissions (2)');

            // Verify loadHistory contains both entries
            const history = FeedbackStorage.loadHistory();
            expect(history.length).toBe(2);
            expect(history[0].comment).toContain('Second comment');
            expect(history[1].comment).toContain('First comment');
        });
    });
});
