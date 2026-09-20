// Interactive Chatbot Demo functionality

class ChatbotDemo {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('chatbotSend');
        this.quickReplies = document.getElementById('quickReplies');
        
        this.responses = {
            'What services do you offer?': 'We offer AI-powered chatbots that can handle customer support, lead generation, appointment booking, and more! Our chatbots work 24/7 to help grow your business.',
            'How much does it cost?': 'Our plans start at just ₹799/month for small businesses. We also offer Pro (₹1999/month) and Enterprise (₹2999/month) plans. All include a free trial!',
            'Can I get a demo?': 'Absolutely! You\'re already experiencing our demo right now! 😊 For a personalized demo of how our chatbot would work for YOUR business, just fill out our contact form below.',
            'How does it work?': 'It\'s simple! 1) Tell us about your business 2) We build a custom AI chatbot 3) You launch and start seeing results. Most clients are up and running within 48 hours!',
            'What industries do you serve?': 'We work with restaurants, fitness centers, retail stores, healthcare practices, real estate agencies, and many more! Our AI adapts to any industry.',
            'Is it easy to setup?': 'Yes! Setup takes just minutes with our plug-and-play integration. No technical skills required - we handle everything for you.',
            'pricing': 'Our pricing is designed to fit businesses of all sizes! Starter (₹799/mo), Pro (₹1999/mo), and Enterprise (₹2999/mo). All plans include 24/7 support and a money-back guarantee.',
            'demo': 'You\'re chatting with our AI right now! Pretty cool, right? 🚀 This is just a taste of what our chatbots can do for your business.',
            'hello': 'Hello there! 👋 Welcome to BotBazzar! I\'m here to show you how our AI chatbots can transform your business. What would you like to know?',
            'hi': 'Hi! Great to meet you! I\'m your AI assistant demo. I can tell you all about our chatbot solutions. What\'s your biggest customer service challenge?',
            'help': 'I\'m here to help! You can ask me about:\n• Our services and features\n• Pricing and plans\n• How our chatbots work\n• Getting a personalized demo\n\nWhat interests you most?',
            'support': 'Our AI chatbots provide 24/7 customer support, answering FAQs, booking appointments, and more. They\'re like having a full support team without the overhead!',
            'contact':' You can reach our human team anytime by clicking the "Get Free Demo" button above or the "Get Started" button. We\'d love to chat about how we can help your business!',
        };
        
        this.fallbackResponses = [
            'That\'s a great question! Our AI chatbots can definitely help with that. Would you like to schedule a personalized demo to discuss your specific needs?',
            'I\'d love to tell you more about that! Our team specializes in creating custom solutions. Click "Get Free Demo" above to speak with a human expert!',
            'Interesting! Our AI learns from conversations like this to better serve your customers. Want to see how this could work for your business?',
            'Great point! That\'s exactly the kind of thing our chatbots excel at. Ready to see how we can help your specific business? Let\'s chat!'
        ];

        this.quickReplySuggestions = {
            'default': ['Tell me about Pricing', 'Book a Demo', 'What services do you offer?'],
            'services': ['Tell me about Pricing', 'Book a Demo', 'How does it work?'],
            'pricing': ['Book a Demo', 'What industries do you serve?', 'Is it easy to setup?'],
            'demo': ['Tell me about Pricing', 'How does it work?', 'What services do you offer?'],
            'work': ['Is it easy to setup?', 'Book a Demo', 'Tell me about Pricing'],
            'industries': ['What services do you offer?', 'Tell me about Pricing', 'Book a Demo'],
            'setup': ['Book a Demo', 'Tell me about Pricing', 'What services do you offer?'],
            'support': ['What services do you offer?', 'Tell me about Pricing', 'Book a Demo']
        };
        // ---- Issue #8: intent matching data --------------------------------
        // Words ignored when scoring (they carry no intent on their own).
        this.stopWords = new Set([
            'is', 'the', 'a', 'an', 'are', 'am', 'i', 'you', 'your', 'we', 'our',
            'do', 'does', 'did', 'what', 'how', 'can', 'could', 'would', 'will',
            'to', 'of', 'for', 'in', 'on', 'and', 'or', 'it', 'this', 'that',
            'my', 'me', 'about', 'tell', 'please', 'get', 'have', 'has', 'there',
            'with', 'be', 'at', 'so', 'if', 'us', 'want', 'need', 'like'
        ]);

        // Each intent has weighted keywords ([word, weight 0-1], typo-tolerant) and
        // weighted phrases (whole-word match on the full sentence). `response` is a
        // key of this.responses and `topic` a key of this.quickReplySuggestions.
        // Plain data on purpose, so it can move to data/faq.json later (Issue #11).
        this.intents = {
            bookDemo: {
                response: 'Can I get a demo?', topic: 'demo',
                keywords: [],
                phrases: [['book a demo', 1], ['get a demo', 1], ['schedule a demo', 1],
                          ['request a demo', 1], ['free demo', 1]]
            },
            demo: {
                response: 'demo', topic: 'demo',
                keywords: [['demo', 1], ['trial', 0.8], ['try', 0.6], ['test', 0.5]],
                phrases: [['show me', 0.6]]
            },
            pricing: {
                response: 'pricing', topic: 'pricing',
                keywords: [['price', 1], ['pricing', 1], ['cost', 1], ['costs', 1],
                           ['expensive', 0.8], ['cheap', 0.8], ['affordable', 0.8],
                           ['fee', 0.7], ['fees', 0.7], ['subscription', 0.7],
                           ['plan', 0.6], ['plans', 0.6], ['package', 0.6],
                           ['payment', 0.5], ['money', 0.5]],
                phrases: [['how much', 1]]
            },
            services: {
                response: 'What services do you offer?', topic: 'services',
                keywords: [['services', 1], ['service', 1], ['features', 1], ['feature', 1],
                           ['offer', 0.8], ['capabilities', 0.8], ['provide', 0.5]],
                phrases: [['what can you do', 0.9]]
            },
            work: {
                response: 'How does it work?', topic: 'work',
                keywords: [['work', 0.9], ['works', 0.9], ['working', 0.8],
                           ['process', 0.6], ['explain', 0.5]],
                phrases: [['how does it work', 1], ['how it works', 1]]
            },
            industries: {
                response: 'What industries do you serve?', topic: 'industries',
                keywords: [['industry', 1], ['industries', 1], ['sector', 0.8],
                           ['restaurant', 0.5], ['fitness', 0.5], ['gym', 0.5],
                           ['retail', 0.5], ['healthcare', 0.5], ['clinic', 0.5],
                           ['salon', 0.5], ['hotel', 0.5], ['business', 0.3]],
                phrases: [['real estate', 0.5]]
            },
            setup: {
                response: 'Is it easy to setup?', topic: 'setup',
                keywords: [['setup', 1], ['install', 1], ['installation', 1],
                           ['integration', 0.7], ['integrate', 0.7], ['easy', 0.4],
                           ['technical', 0.4]],
                phrases: [['set up', 1]]
            },
            support: {
                response: 'support', topic: 'support',
                keywords: [['support', 0.9], ['assistance', 0.6], ['human', 0.6], ['agent', 0.5]],
                phrases: []
            },
            help: {
                response: 'help', topic: 'support',
                keywords: [['help', 0.8]],
                phrases: []
            },
            contact: {
                response: 'contact', topic: 'support',
                keywords: [['contact', 0.9], ['email', 0.5], ['phone', 0.5], ['call', 0.5], ['reach', 0.5]],
                phrases: []
            },
            greeting: {
                response: 'hello', topic: 'default',
                keywords: [['hello', 1], ['hey', 1], ['greetings', 0.8]],
                phrases: [['good morning', 1], ['good afternoon', 1], ['good evening', 1]]
            },
            hi: {
                response: 'hi', topic: 'default',
                keywords: [['hi', 1]],
                phrases: []
            }
        };

        // Add ?debug to the page URL to log matched intents in the console.
        this.debug = /[?&]debug\b/.test(window.location.search);
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.bindEvents();
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage('bot', 'Hello! I\'m your AI assistant. How can I help you today?');
            this.renderQuickReplies(this.quickReplySuggestions['default']);
        }, 1500);
    }
    
    bindEvents() {
        // Send button click
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.handleSendMessage());
        }
        
        // Enter key press
        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendMessage();
                }
            });
            
            // Auto-resize input
            this.input.addEventListener('input', () => {
                this.input.style.height = 'auto';
                this.input.style.height = this.input.scrollHeight + 'px';
            });
        }
        
        // Quick reply buttons
        if (this.quickReplies) {
            this.quickReplies.addEventListener('click', (e) => {
                const button = e.target.closest('.quick-reply');
                if (button && !button.disabled) {
                    const message = button.getAttribute('data-message') || button.textContent;
                    this.input.value = message;
                    this.handleSendMessage();
                }
            });
        }
    }
    
    handleSendMessage() {
        const message = this.input.value.trim();
        if (message) {
            this.sendMessage(message);
            this.input.value = '';
            this.input.style.height = 'auto';
        }
    }
    
    sendMessage(message) {
        // Add user message
        this.addMessage('user', message);
        
        // Disable quick replies while processing
        this.disableQuickReplies();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate typing delay
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateResponse(message);
        }, 1000 + Math.random() * 1000);
    }

        // ---- Issue #8: token-weighted intent matching -------------------------

    // lowercase, strip punctuation (keeps letters/digits of any language), collapse spaces
    normalize(text) {
        return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    }

    // normalized words with stop words and 1-letter tokens removed
    tokenize(text) {
        return this.normalize(text)
            .split(' ')
            .filter(word => word.length > 1 && !this.stopWords.has(word));
    }

    // Damerau-Levenshtein (edit distance where swapping 2 letters counts as 1 edit)
    editDistance(a, b) {
        const d = [];
        for (let i = 0; i <= a.length; i++) d[i] = [i];
        for (let j = 1; j <= b.length; j++) d[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
                }
            }
        }
        return d[a.length][b.length];
    }

    // 1 = same word, 0.85 = probable typo, 0 = different.
    // Short keywords (< 5 letters) must match exactly to avoid false hits ("test" vs "text").
    tokenSimilarity(token, keyword) {
        if (token === keyword) return 1;
        if (keyword.length < 5 || token[0] !== keyword[0]) return 0;
        const maxEdits = keyword.length >= 8 ? 2 : 1;
        return this.editDistance(token, keyword) <= maxEdits ? 0.85 : 0;
    }

    // Score every intent 0..1, best first. Each matched word/phrase contributes its
    // weight; hits combine as 1 - (1-w1)(1-w2)... so several weak hits add up but
    // the score never exceeds 1.
    scoreIntents(message) {
        const sentence = ` ${this.normalize(message)} `;
        const tokens = this.tokenize(message);

        return Object.entries(this.intents).map(([name, intent]) => {
            const hits = [];

            for (const [phrase, weight] of intent.phrases) {
                if (sentence.includes(` ${phrase} `)) hits.push(weight);
            }
            // each word the user typed counts once, using its best-matching keyword
            for (const token of new Set(tokens)) {
                const best = Math.max(0, ...intent.keywords.map(([kw, weight]) => weight * this.tokenSimilarity(token, kw)));
                if (best > 0) hits.push(best);
            }

            const score = 1 - hits.reduce((miss, w) => miss * (1 - w), 1);
            return { name, score, response: intent.response, topic: intent.topic };
        }).sort((a, b) => b.score - a.score);
    }

    generateResponse(userMessage) {
        const CONFIDENCE_THRESHOLD = 0.4;
        const [best] = this.scoreIntents(userMessage);

        let response;
        let topic;

        if (best.score >= CONFIDENCE_THRESHOLD) {
            response = this.responses[best.response];
            topic = best.topic;
        } else {
            response = this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
            // smart suggestions: if something matched weakly, offer that topic's chips
            topic = best.score > 0 ? best.topic : 'default';
        }

        if (this.debug) {
            console.log(`[intent] "${userMessage}" -> ${best.name} (confidence ${best.score.toFixed(2)})`,
                best.score >= CONFIDENCE_THRESHOLD ? '' : '-> below 0.4, using fallback');
        }

        this.addMessage('bot', response);
        this.renderQuickReplies(this.quickReplySuggestions[topic] || this.quickReplySuggestions['default']);
    }
    
    
    renderQuickReplies(chips) {
        if (!this.quickReplies) return;
        this.quickReplies.innerHTML = '';
        this.quickReplies.style.display = 'flex';
        
        chips.forEach(chipText => {
            const button = document.createElement('button');
            button.className = 'quick-reply';
            button.setAttribute('data-message', chipText);
            button.textContent = chipText;
            this.quickReplies.appendChild(button);
        });
    }

    disableQuickReplies() {
        if (!this.quickReplies) return;
        const buttons = this.quickReplies.querySelectorAll('.quick-reply');
        buttons.forEach(btn => {
            btn.disabled = true;
        });
    }
    
    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i data-lucide="bot"></i>' : '<i data-lucide="user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = text;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'message-time';
        timestamp.textContent = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        content.appendChild(messageParagraph);
        content.appendChild(timestamp);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        // Add animation class
        messageDiv.classList.add('message-enter');
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(messageDiv);
            
            // Scroll to bottom
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            
            // Re-initialize Lucide icons for new message
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Remove animation class after animation completes
            setTimeout(() => {
                messageDiv.classList.remove('message-enter');
            }, 300);
        }
    }
    
    showTypingIndicator() {
        this.disableQuickReplies();
        
        const existingIndicator = document.querySelector('.typing-message');
        if (existingIndicator) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i data-lucide="bot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        
        content.appendChild(typingIndicator);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(typingDiv);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            
            // Initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-message');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ChatbotDemo('chatbotWindow');
});

// Add CSS for message animations and disabled quick reply states
const style = document.createElement('style');
style.textContent = `
.message-enter {
    opacity: 0;
    transform: translateY(20px);
    animation: messageEnter 0.3s ease-out forwards;
}

@keyframes messageEnter {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.quick-reply:disabled,
.quick-reply[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: var(--light-gray);
    border-radius: var(--border-radius-lg);
    width: fit-content;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--medium-gray);
    animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}
`;
document.head.appendChild(style);
