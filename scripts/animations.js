// Advanced animations and micro-interactions

class AnimationController {
    constructor() {
        this.init();
    }
    
    init() {
        this.initScrollAnimations();
        this.initMicroInteractions();
        this.initParallaxEffects();
        this.initCountUpAnimations();
        this.initTypewriterEffect();
        this.initMorphingShapes();
    }
    
    // Advanced scroll-triggered animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        // Create multiple observers for different animation types
        const fadeInObserver = new IntersectionObserver(this.handleFadeIn.bind(this), observerOptions);
        const slideInObserver = new IntersectionObserver(this.handleSlideIn.bind(this), observerOptions);
        const scaleInObserver = new IntersectionObserver(this.handleScaleIn.bind(this), observerOptions);
        
        // Observe elements with different animation types
        document.querySelectorAll('[data-animate="fade"]').forEach(el => fadeInObserver.observe(el));
        document.querySelectorAll('[data-animate="slide"]').forEach(el => slideInObserver.observe(el));
        document.querySelectorAll('[data-animate="scale"]').forEach(el => scaleInObserver.observe(el));
        
        // Staggered animations for groups
        this.initStaggeredAnimations();
    }
    
    handleFadeIn(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
            }
        });
    }
    
    handleSlideIn(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const direction = entry.target.dataset.direction || 'left';
                let transform = 'translateX(-50px)';
                
                if (direction === 'right') transform = 'translateX(50px)';
                if (direction === 'up') transform = 'translateY(50px)';
                if (direction === 'down') transform = 'translateY(-50px)';
                
                entry.target.style.opacity = '0';
                entry.target.style.transform = transform;
                entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translate(0)';
                }, 150);
            }
        });
    }
    
    handleScaleIn(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'scale(0.8)';
                entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }
    
    // Staggered animations for groups of elements
    initStaggeredAnimations() {
        const staggerGroups = document.querySelectorAll('[data-stagger]');
        
        staggerGroups.forEach(group => {
            const children = group.children;
            const delay = parseInt(group.dataset.stagger) || 100;
            
            Array.from(children).forEach((child, index) => {
                child.style.animationDelay = `${index * delay}ms`;
                child.style.opacity = '0';
                child.style.transform = 'translateY(20px)';
            });
            
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Array.from(entry.target.children).forEach((child, index) => {
                            setTimeout(() => {
                                child.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                                child.style.opacity = '1';
                                child.style.transform = 'translateY(0)';
                            }, index * delay);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(group);
        });
    }
    
    // Micro-interactions for buttons and interactive elements
    initMicroInteractions() {
        // Button hover effects
        this.initButtonEffects();
        
        // Card hover animations
        this.initCardAnimations();
        
        // Icon animations
        this.initIconAnimations();
        
        // Form field interactions
        this.initFormInteractions();
    }
    
    initButtonEffects() {
        const buttons = document.querySelectorAll('.btn, button');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.transition = 'transform 0.2s ease';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
            
            button.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(0) scale(0.98)';
            });
            
            button.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px) scale(1)';
            });
        });
    }
    
    initCardAnimations() {
        const cards = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });
    }
    
    initIconAnimations() {
        const icons = document.querySelectorAll('.feature-icon, .step-icon, .info-icon');
        
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                const iconElement = this.querySelector('i');
                if (iconElement) {
                    iconElement.style.transform = 'rotate(360deg) scale(1.1)';
                    iconElement.style.transition = 'transform 0.5s ease';
                }
            });
            
            icon.addEventListener('mouseleave', function() {
                const iconElement = this.querySelector('i');
                if (iconElement) {
                    iconElement.style.transform = 'rotate(0deg) scale(1)';
                }
            });
        });
    }
    
    initFormInteractions() {
        const formInputs = document.querySelectorAll('input, textarea, select');
        
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'translateY(-2px)';
                this.parentElement.style.transition = 'transform 0.2s ease';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Parallax effects for hero section
    initParallaxEffects() {
        const heroElements = document.querySelectorAll('.gradient-orb');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            heroElements.forEach((element, index) => {
                const speed = (index + 1) * 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    // Count-up animations for statistics
    initCountUpAnimations() {
        const counters = document.querySelectorAll('[data-count]');
        
        const animateCounter = (counter, target, duration = 2000) => {
            let start = 0;
            const increment = target / (duration / 16);
            
            const updateCounter = () => {
                start += increment;
                if (start < target) {
                    counter.textContent = Math.floor(start).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            
            updateCounter();
        };
        
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.count);
                    animateCounter(entry.target, target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => counterObserver.observe(counter));
    }
    
    // Typewriter effect for hero text
    initTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            const speed = parseInt(element.dataset.speed) || 100;
            
            element.textContent = '';
            element.style.borderRight = '2px solid';
            element.style.animation = 'blink 1s infinite';
            
            let index = 0;
            const typeText = () => {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                    setTimeout(typeText, speed);
                } else {
                    // Stop blinking cursor after typing is done
                    element.style.borderRight = 'none';
                    element.style.animation = 'none';
                }
            };
            
            // Start typing when element comes into view
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(typeText, 500);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(element);
        });
    }
    
    // Morphing background shapes
    initMorphingShapes() {
        const shapes = document.querySelectorAll('.gradient-orb');
        
        shapes.forEach((shape, index) => {
            const morphKeyframes = [
                { borderRadius: '50%' },
                { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
                { borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%' },
                { borderRadius: '50%' }
            ];
            
            const morphAnimation = shape.animate(morphKeyframes, {
                duration: 8000 + (index * 2000),
                iterations: Infinity,
                easing: 'ease-in-out'
            });
            
            // Pause animation when not visible
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        morphAnimation.play();
                    } else {
                        morphAnimation.pause();
                    }
                });
            });
            
            observer.observe(shape);
        });
    }
}

// Utility functions for animations
const AnimationUtils = {
    // Easing functions
    easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t) => t * (2 - t),
    easeIn: (t) => t * t,
    
    // Animation with custom easing
    animate: (element, properties, duration = 300, easing = 'easeOut') => {
        const startTime = Date.now();
        const startValues = {};
        
        // Store initial values
        Object.keys(properties).forEach(prop => {
            startValues[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
        });
        
        const animateStep = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = AnimationUtils[easing](progress);
            
            Object.keys(properties).forEach(prop => {
                const startValue = startValues[prop];
                const endValue = properties[prop];
                const currentValue = startValue + (endValue - startValue) * easedProgress;
                
                element.style[prop] = currentValue + (prop.includes('opacity') ? '' : 'px');
            });
            
            if (progress < 1) {
                requestAnimationFrame(animateStep);
            }
        };
        
        requestAnimationFrame(animateStep);
    },
    
    // Shake animation
    shake: (element, intensity = 5, duration = 500) => {
        const keyframes = [
            { transform: 'translateX(0)' },
            { transform: `translateX(-${intensity}px)` },
            { transform: `translateX(${intensity}px)` },
            { transform: `translateX(-${intensity}px)` },
            { transform: `translateX(${intensity}px)` },
            { transform: 'translateX(0)' }
        ];
        
        element.animate(keyframes, {
            duration: duration,
            easing: 'ease-in-out'
        });
    },
    
    // Pulse animation
    pulse: (element, scale = 1.1, duration = 300) => {
        const keyframes = [
            { transform: 'scale(1)' },
            { transform: `scale(${scale})` },
            { transform: 'scale(1)' }
        ];
        
        element.animate(keyframes, {
            duration: duration,
            easing: 'ease-in-out'
        });
    }
};

// Add CSS for animations
const animationCSS = `
@keyframes blink {
    0%, 50% { border-color: transparent; }
    51%, 100% { border-color: currentColor; }
}

.morphing-shape {
    animation: morph 8s ease-in-out infinite;
}

@keyframes morph {
    0%, 100% { border-radius: 50%; }
    25% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
    50% { border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; }
    75% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
}

.glowing-border {
    position: relative;
    overflow: hidden;
}

.glowing-border::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #3F8EFC, #8E44AD, #00FFB3);
    border-radius: inherit;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.glowing-border:hover::before {
    opacity: 1;
}
`;

// Inject animation CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = animationCSS;
document.head.appendChild(styleSheet);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimationController();
});

// Export for modular usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationController, AnimationUtils };
}