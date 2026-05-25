// Main JavaScript functionality for AI Chatbot Website

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initCounters();
    initTestimonialSlider();
    initPricingToggle();
    initMobileMenu();
    initScrollAnimations();
    initFooterModals();
    initPricingButtons();
    preventDefaultHashLinks();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link, .btn-nav');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Scroll-triggered effects
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Animated counters
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Testimonial slider
function initTestimonialSlider() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.nav-dot');
    let currentSlide = 0;
    let slideInterval;
    
    const showSlide = (index) => {
        cards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (cards[index] && dots[index]) {
            cards[index].classList.add('active');
            dots[index].classList.add('active');
        }
        currentSlide = index;
    };
    
    const nextSlide = () => {
        const next = (currentSlide + 1) % cards.length;
        showSlide(next);
    };
    
    const startAutoSlide = () => {
        slideInterval = setInterval(nextSlide, 5000);
    };
    
    const stopAutoSlide = () => {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    };
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    const slider = document.querySelector('.testimonials-slider');
    
    if (slider) {
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            stopAutoSlide();
        });
        
        slider.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    const prev = currentSlide === 0 ? cards.length - 1 : currentSlide - 1;
                    showSlide(prev);
                }
            }
            
            startAutoSlide();
        });
    }
    
    // Start auto-slide
    if (cards.length > 1) {
        startAutoSlide();
    }
}

// Pricing toggle
function initPricingToggle() {
    const toggle = document.getElementById('pricingToggle');
    const priceAmounts = document.querySelectorAll('.price-amount');
    
    if (toggle) {
        toggle.addEventListener('change', function() {
            const isYearly = this.checked;
            
            priceAmounts.forEach(amount => {
                const monthly = parseInt(amount.getAttribute('data-monthly'));
                const yearly = parseInt(amount.getAttribute('data-yearly'));
                
                if (isYearly) {
                    animatePrice(amount, monthly, yearly);
                } else {
                    animatePrice(amount, yearly, monthly);
                }
            });
        });
    }
}

function animatePrice(element, from, to) {
    const duration = 500;
    const start = Date.now();
    
    const animate = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const current = Math.round(from + (to - from) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

// Mobile menu
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (toggle && navLinks) {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('mobile-active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                navLinks.classList.remove('mobile-active');
            });
        });
    }
}

// Initialize scroll animations
function initScrollAnimations() {
    // Add staggered animations to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        const heroBackground = document.querySelector('.hero-background');
        
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Pricing buttons functionality
function initPricingButtons() {
    const pricingButtons = document.querySelectorAll('.pricing-cta');

    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const offsetTop = contactSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Prevent default on hash-only links
function preventDefaultHashLinks() {
    // Find all links that have href="#" and no data-modal attribute
    const hashLinks = document.querySelectorAll('a[href="#"]:not([data-modal])');

    hashLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Optionally scroll to top or do nothing
            return false;
        });
    });
}

// Footer modal functionality
function initFooterModals() {
    const modalContent = {
        integrations: {
            title: 'Integrations',
            icon: 'plug-zap',
            content: `
                <h4>Seamless Integration with Your Favorite Tools</h4>
                <div class="integration-grid">
                    <div class="integration-item">
                        <strong>CRM Systems:</strong> Salesforce, HubSpot, Pipedrive, Zoho CRM
                    </div>
                    <div class="integration-item">
                        <strong>Communication:</strong> Microsoft Teams, Discord, WhatsApp
                    </div>
                    <div class="integration-item">
                        <strong>E-commerce:</strong> Shopify
                    </div>
                    <div class="integration-item">
                        <strong>Analytics:</strong> Google Analytics, Segment
                    </div>
                    <div class="integration-item">
                        <strong>Email Marketing:</strong> Mailchimp, SendGrid, Constant Contact
                    </div>
                    <div class="integration-item">
                        <strong>Payment Processing:</strong> GPay, PayPal, PhonePe
                    </div>
                </div>
                <p class="modal-note">Need a custom integration? Contact our team for enterprise solutions.</p>
            `
        },
        about: {
            title: 'About Us',
            icon: 'users',
            content: `
                <h4>Empowering Businesses with AI</h4>
                <p>BotBazzar was founded in 2020 with a simple mission: make powerful AI technology accessible to businesses of all sizes.</p>
                <p>Our team of AI researchers, developers, and customer success specialists work tirelessly to create chatbot solutions that truly understand your customers and help your business grow.</p>
                <div class="stats-row">
                    <div class="stat-box">
                        <strong>1000+</strong>
                        <span>Active Businesses</span>
                    </div>
                    <div class="stat-box">
                        <strong>5M+</strong>
                        <span>Conversations Handled</span>
                    </div>
                    <div class="stat-box">
                        <strong>98%</strong>
                        <span>Satisfaction Rate</span>
                    </div>
                </div>
                <p>We believe in transparent AI, exceptional customer service, and continuous innovation to help your business succeed in the digital age.</p>
            `
        },
        careers: {
            title: 'Careers',
            icon: 'briefcase',
            content: `
                <h4>Join Our Team</h4>
                <p>We're looking for talented individuals who are passionate about AI, customer service, and making a difference.</p>
                <div class="career-positions">
                    <div class="position">
                        <strong>Senior AI Engineer</strong>
                        <span>Remote / San Francisco</span>
                    </div>
                    <div class="position">
                        <strong>Customer Success Manager</strong>
                        <span>Remote / New York</span>
                    </div>
                    <div class="position">
                        <strong>Product Designer</strong>
                        <span>Remote / Austin</span>
                    </div>
                    <div class="position">
                        <strong>Sales Development Representative</strong>
                        <span>Remote</span>
                    </div>
                </div>
                <h4>Why Work With Us?</h4>
                <ul class="benefits-list">
                    <li>Competitive salary and equity packages</li>
                    <li>Comprehensive health, dental, and vision insurance</li>
                    <li>Unlimited PTO and flexible work schedule</li>
                    <li>Professional development budget</li>
                    <li>Remote-first culture</li>
                </ul>
                <p class="modal-note">Email your resume to careers@botbazzar.com</p>
            `
        },
        blog: {
            title: 'Blog',
            icon: 'newspaper',
            content: `
                <h4>Latest Articles & Insights</h4>
                <div class="blog-posts">
                    <article class="blog-item">
                        <strong>How AI Chatbots Are Transforming Customer Service in 2025</strong>
                        <span>January 15, 2025</span>
                        <p>Discover the latest trends and best practices for implementing AI chatbots in your customer service strategy.</p>
                    </article>
                    <article class="blog-item">
                        <strong>5 Ways to Increase Lead Conversion with Conversational AI</strong>
                        <span>January 8, 2025</span>
                        <p>Learn proven strategies to turn more website visitors into qualified leads using AI-powered conversations.</p>
                    </article>
                    <article class="blog-item">
                        <strong>The ROI of AI Chatbots: Real Numbers from Real Businesses</strong>
                        <span>December 20, 2024</span>
                        <p>Case studies showing the measurable impact of chatbots on customer satisfaction and revenue growth.</p>
                    </article>
                </div>
                <p class="modal-note">Visit our blog for more articles and resources.</p>
            `
        },
        press: {
            title: 'Press',
            icon: 'megaphone',
            content: `
                <h4>Press & Media</h4>
                <p>For press inquiries, interviews, or media requests, please contact our press team:</p>
                <div class="press-contact">
                    <p><strong>Email:</strong> press@Botbazzar.com</p>
                    <p><strong>Phone:</strong> +91 8808812127</p>
                </div>
                <h4>Recent Press Coverage</h4>
                <div class="press-mentions">
                    <div class="press-item">
                        <strong>TechCrunch:</strong> "BotBazzar raises $2M Series B to expand AI capabilities"
                    </div>
                    <div class="press-item">
                        <strong>Forbes:</strong> "Top 50 AI Startups to Watch in 2025"
                    </div>
                    <div class="press-item">
                        <strong>VentureBeat:</strong> "How BotBazzar is democratizing enterprise-level AI"
                    </div>
                </div>
                <h4>Brand Assets</h4>
                <p>Download our logo, brand guidelines, and press kit for media use.</p>
            `
        },
        help: {
            title: 'Help Center',
            icon: 'life-buoy',
            content: `
                <h4>How Can We Help You?</h4>
                <div class="help-topics">
                    <div class="help-topic">
                        <strong>Getting Started</strong>
                        <ul>
                            <li>Creating your account</li>
                            <li>Setting up your first chatbot</li>
                            <li>Integration guides</li>
                        </ul>
                    </div>
                    <div class="help-topic">
                        <strong>Training Your AI</strong>
                        <ul>
                            <li>Best practices for AI training</li>
                            <li>Custom responses and workflows</li>
                            <li>Handling complex queries</li>
                        </ul>
                    </div>
                    <div class="help-topic">
                        <strong>Analytics & Reporting</strong>
                        <ul>
                            <li>Understanding your dashboard</li>
                            <li>Key metrics to track</li>
                            <li>Exporting data</li>
                        </ul>
                    </div>
                    <div class="help-topic">
                        <strong>Billing & Account</strong>
                        <ul>
                            <li>Managing your subscription</li>
                            <li>Upgrading or downgrading</li>
                            <li>Payment methods</li>
                        </ul>
                    </div>
                </div>
                <p class="modal-note">Can't find what you're looking for? <a href="#contact">Contact Support</a></p>
            `
        },
        docs: {
            title: 'Documentation',
            icon: 'book-open',
            content: `
                <h4>Developer Documentation</h4>
                <div class="docs-sections">
                    <div class="doc-section">
                        <strong>API Reference</strong>
                        <p>Complete REST API documentation with examples and authentication guides.</p>
                    </div>
                    <div class="doc-section">
                        <strong>SDK & Libraries</strong>
                        <p>Official SDKs for JavaScript, Python, Ruby, PHP, and more.</p>
                    </div>
                    <div class="doc-section">
                        <strong>Webhooks</strong>
                        <p>Set up real-time notifications for chatbot events and conversations.</p>
                    </div>
                    <div class="doc-section">
                        <strong>Widget Customization</strong>
                        <p>Customize the look and feel of your chatbot widget to match your brand.</p>
                    </div>
                    <div class="doc-section">
                        <strong>Advanced Features</strong>
                        <p>Natural Language Processing, sentiment analysis, and custom integrations.</p>
                    </div>
                </div>
                <p class="modal-note">Full documentation available at docs.BotBazzar.com</p>
            `
        },
        status: {
            title: 'System Status',
            icon: 'activity',
            content: `
                <h4>All Systems Operational</h4>
                <div class="status-grid">
                    <div class="status-item operational">
                        <strong>API Services</strong>
                        <span class="status-badge">Operational</span>
                    </div>
                    <div class="status-item operational">
                        <strong>Chatbot Widgets</strong>
                        <span class="status-badge">Operational</span>
                    </div>
                    <div class="status-item operational">
                        <strong>Dashboard</strong>
                        <span class="status-badge">Operational</span>
                    </div>
                    <div class="status-item operational">
                        <strong>Analytics</strong>
                        <span class="status-badge">Operational</span>
                    </div>
                    <div class="status-item operational">
                        <strong>Webhooks</strong>
                        <span class="status-badge">In Progress</span>
                    </div>
                </div>
                <h4>Recent Updates</h4>
                <div class="status-updates">
                    <div class="update-item">
                        <strong>January 15, 2025</strong> - New AI model deployed with improved accuracy
                    </div>
                    <div class="update-item">
                        <strong>January 10, 2025</strong> - Enhanced dashboard with new analytics features
                    </div>
                    <div class="update-item">
                        <strong>January 5, 2025</strong> - API v2.0 released with improved performance
                    </div>
                </div>
                <p class="modal-note">For status updates hit us a email at status.BotBazzar@gmail.com</p>
            `
        },
        privacy: {
            title: 'Privacy Policy',
            icon: 'shield',
            content: `
                <h4>Privacy Policy</h4>
                <p><strong>Last Updated: January 1, 2025</strong></p>
                <p>At BotBazzar, we take your privacy seriously. This policy outlines how we collect, use, and protect your information.</p>

                <h5>Information We Collect</h5>
                <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact support. This may include your name, email address, business information, and usage data.</p>

                <h5>How We Use Your Information</h5>
                <ul>
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                </ul>

                <h5>Data Security</h5>
                <p>We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.</p>

                <h5>Your Rights</h5>
                <p>You have the right to access, update, or delete your personal information at any time. Contact us at privacyatBotBazzar@gmail.com for data requests.</p>

                <p class="modal-note">To read our full privacy policy hit us a email at privacypolicyatBB@gmail.com</p>
            `
        },
        terms: {
            title: 'Terms of Service',
            icon: 'file-text',
            content: `
                <h4>Terms of Service</h4>
                <p><strong>Last Updated: January 1, 2025</strong></p>
                <p>By accessing or using BotBazzar's services, you agree to be bound by these Terms of Service.</p>

                <h5>Service Usage</h5>
                <p>You may use our services only as permitted by law. You agree not to misuse our services or help anyone else do so.</p>

                <h5>Your Account</h5>
                <p>You are responsible for maintaining the security of your account and for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>

                <h5>Subscription & Billing</h5>
                <ul>
                    <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                    <li>You can cancel your subscription at any time</li>
                    <li>Refunds are provided in accordance with our refund policy</li>
                    <li>Prices may change with 30 days notice</li>
                </ul>

                <h5>Service Availability</h5>
                <p>We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We reserve the right to modify or discontinue services with notice.</p>

                <h5>Limitation of Liability</h5>
                <p>Our liability is limited to the amount you paid us in the 12 months prior to the event giving rise to liability.</p>

                <p class="modal-note">Read our full terms at chatbotai.com/terms</p>
            `
        }
    };

    // Get all modal trigger links
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const infoModal = document.getElementById('infoModal');
    const infoModalBody = document.getElementById('infoModalBody');
    const infoModalClose = document.getElementById('infoModalClose');

    // Check if modal elements exist
    if (!infoModal || !infoModalBody || !infoModalClose) {
        console.error('Modal elements not found');
        return;
    }

    // Add click event to each trigger
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const modalType = this.getAttribute('data-modal');
            const content = modalContent[modalType];

            if (content) {
                infoModalBody.innerHTML = `
                    <div class="modal-icon">
                        <i data-lucide="${content.icon}"></i>
                    </div>
                    <h3>${content.title}</h3>
                    <div class="modal-body-content">
                        ${content.content}
                    </div>
                `;

                infoModal.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Reinitialize icons for the modal content
                setTimeout(() => {
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }, 10);
            }
        });
    });

    // Close modal function
    function closeInfoModal() {
        if (infoModal) {
            infoModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Close modal on X button
    infoModalClose.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeInfoModal();
    });

    // Close on backdrop click
    infoModal.addEventListener('click', function(e) {
        if (e.target === infoModal) {
            closeInfoModal();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && infoModal && infoModal.classList.contains('active')) {
            closeInfoModal();
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for modular usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        initScrollEffects,
        initCounters,
        initTestimonialSlider,
        initPricingToggle,
        initMobileMenu,
        debounce,
        throttle
    };
}