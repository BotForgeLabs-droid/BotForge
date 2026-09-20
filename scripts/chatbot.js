constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.messagesContainer = document.getElementById('chatbotMessages');
    this.input = document.getElementById('chatbotInput');
    this.sendButton = document.getElementById('chatbotSend');
    this.quickReplies = document.getElementById('quickReplies');

    this.responses = {};
    this.fallbackResponses = [];

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

    this.init();
}

async loadFAQData() {
    try {
        const response = await fetch('./data/faq.json');

        if (!response.ok) {
            throw new Error('Failed to load FAQ file');
        }

        const data = await response.json();

        this.validateFAQSchema(data);

        this.responses = data.responses;
        this.fallbackResponses = data.fallbackResponses;

        console.log('FAQ loaded successfully');
    } catch (error) {
        console.error('FAQ loading failed:', error);

        this.responses = {
            hello: 'Hello! How can I help you today?'
        };

        this.fallbackResponses = [
            'Sorry, chatbot knowledge base is currently unavailable.'
        ];
    }
}

validateFAQSchema(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid FAQ data');
    }

    if (!data.responses || typeof data.responses !== 'object') {
        throw new Error('Missing responses');
    }

    if (!Array.isArray(data.fallbackResponses)) {
        throw new Error('Missing fallbackResponses');
    }

    return true;
}

async init() {
    if (!this.container) return;

    await this.loadFAQData();

    this.bindEvents();
    this.showTypingIndicator();

    setTimeout(() => {
        this.hideTypingIndicator();
        this.addMessage(
            'bot',
            'Hello! I\'m your AI assistant. How can I help you today?'
        );
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
    
    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let response = null;
        let topic = 'default';
        
        // Check for exact matches first
        for (const [key, value] of Object.entries(this.responses)) {
            if (lowerMessage.includes(key.toLowerCase())) {
                response = value;
                break;
            }
        }
        
        // Check for partial matches
        if (!response) {
            const keywords = {
                'price': this.responses['pricing'],
                'cost': this.responses['pricing'],
                'expensive': this.responses['pricing'],
                'money': this.responses['pricing'],
                'plan': this.responses['pricing'],
                'demo': this.responses['demo'],
                'try': this.responses['demo'],
                'test': this.responses['demo'],
                'service': this.responses['What services do you offer?'],
                'feature': this.responses['What services do you offer?'],
                'work': this.responses['How does it work?'],
                'setup': this.responses['Is it easy to setup?'],
                'install': this.responses['Is it easy to setup?'],
                'industry': this.responses['What industries do you serve?'],
                'business': this.responses['What industries do you serve?'],
                'contact': this.responses['contact'],
                'support': this.responses['support'],
                'help': this.responses['help']
            };
            
            for (const [keyword, responseText] of Object.entries(keywords)) {
                if (lowerMessage.includes(keyword)) {
                    response = responseText;
                    break;
                }
            }
        }
        
        // Determine context topic for dynamic suggestion chips
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing') || lowerMessage.includes('plan')) {
            topic = 'pricing';
        } else if (lowerMessage.includes('demo')) {
            topic = 'demo';
        } else if (lowerMessage.includes('service') || lowerMessage.includes('feature')) {
            topic = 'services';
        } else if (lowerMessage.includes('work')) {
            topic = 'work';
        } else if (lowerMessage.includes('setup') || lowerMessage.includes('install')) {
            topic = 'setup';
        } else if (lowerMessage.includes('industry') || lowerMessage.includes('business')) {
            topic = 'industries';
        } else if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
            topic = 'support';
        }
        
        // Use fallback response if no match found
        if (!response) {
            response = this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
        }
        
        this.addMessage('bot', response);
        const suggestions = this.quickReplySuggestions[topic] || this.quickReplySuggestions['default'];
        this.renderQuickReplies(suggestions);
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
