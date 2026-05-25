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
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.bindEvents();
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage('bot', 'Hello! I\'m your AI assistant. How can I help you today?');
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
                if (e.target.classList.contains('quick-reply')) {
                    const message = e.target.getAttribute('data-message');
                    this.sendMessage(message);
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
        
        // Hide quick replies after first message
        if (this.quickReplies) {
            this.quickReplies.style.display = 'none';
        }
        
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
        
        // Use fallback response if no match found
        if (!response) {
            response = this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
        }
        
        this.addMessage('bot', response);
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

// Add CSS for message animations
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