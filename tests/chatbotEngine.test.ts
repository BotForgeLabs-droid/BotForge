// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load scripts/chatbot.js into the environment
const chatbotScriptPath = path.resolve(__dirname, '../scripts/chatbot.js');
const chatbotScriptCode = fs.readFileSync(chatbotScriptPath, 'utf-8');

describe('Chatbot Engine & Keyword Matching Suite', () => {
    let bot: any;
    let messagesContainer: HTMLElement;
    let quickRepliesContainer: HTMLElement;

    beforeEach(() => {
        // Setup DOM environment for chatbot.js
        document.body.innerHTML = `
            <div id="chatbotWindow">
                <div id="chatbotMessages"></div>
                <div id="quickReplies"></div>
                <input type="text" id="chatbotInput" />
                <button id="chatbotSend">Send</button>
            </div>
        `;

        messagesContainer = document.getElementById('chatbotMessages')!;
        quickRepliesContainer = document.getElementById('quickReplies')!;

        // Instantiate ChatbotDemo in isolated sandbox
        const scriptFn = new Function('window', 'document', `${chatbotScriptCode}; return ChatbotDemo;`);
        const ChatbotDemo = scriptFn(window, document);
        bot = new ChatbotDemo('chatbotWindow');
    });

    describe('Response Dictionary & Exact Intent Lookups', () => {
        it('should have standard responses defined for primary customer intents', () => {
            expect(bot.responses['What services do you offer?']).toContain('AI-powered chatbots');
            expect(bot.responses['pricing']).toContain('₹799/mo');
            expect(bot.responses['demo']).toContain('You\'re chatting with our AI right now');
            expect(bot.responses['hello']).toContain('AI chatbots can transform your business');
            expect(bot.responses['How does it work?']).toContain('It\'s simple');
            expect(bot.responses['Is it easy to setup?']).toContain('Setup takes just minutes');
        });
    });

    describe('Keyword Matching Accuracy', () => {
        it('should route pricing-related keywords accurately to pricing response', () => {
            const pricingKeywords = ['price', 'cost', 'expensive', 'money', 'plan'];
            pricingKeywords.forEach(keyword => {
                bot.generateResponse(`Tell me about your ${keyword}`);
                const lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
                expect(lastMsg).toBe(bot.responses['pricing']);
            });
        });

        it('should route demo-related keywords accurately to demo response', () => {
            const demoKeywords = ['demo', 'try', 'test'];
            demoKeywords.forEach(keyword => {
                bot.generateResponse(`I want to ${keyword} the product`);
                const lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
                expect(lastMsg).toBe(bot.responses['demo']);
            });
        });

        it('should route services keywords to services response', () => {
            bot.generateResponse('Tell me about the service and feature');
            const lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(lastMsg).toBe(bot.responses['What services do you offer?']);
        });

        it('should route setup and install queries to setup response', () => {
            bot.generateResponse('How do I install the chatbot on my site?');
            const lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(lastMsg).toBe(bot.responses['Is it easy to setup?']);
        });

        it('should route industry and business queries to industry response', () => {
            bot.generateResponse('Tell me about business solutions');
            const lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(lastMsg).toBe(bot.responses['What industries do you serve?']);

            bot.generateResponse('What industries do you serve?');
            const exactMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(exactMsg).toBe(bot.responses['What industries do you serve?']);
        });

        it('should route support and help queries to appropriate responses', () => {
            bot.generateResponse('I need support with my account');
            let lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(lastMsg).toBe(bot.responses['support']);

            bot.generateResponse('Can you please help me?');
            lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(lastMsg).toBe(bot.responses['help']);
        });
    });

    describe('Case Insensitivity & Partial String Matching', () => {
        it('should handle uppercase and mixed case queries seamlessly', () => {
            bot.generateResponse('WHAT IS THE PRICING?');
            let lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(lastMsg).toBe(bot.responses['pricing']);

            bot.generateResponse('HELLO');
            lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(lastMsg).toBe(bot.responses['hello']);

            bot.generateResponse('HOW MUCH DOES IT COST?');
            lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(lastMsg).toBe(bot.responses['How much does it cost?']);
        });
    });

    describe('Context Topic Resolution & Suggestion Chips', () => {
        it('should render correct suggestion chips for pricing topic', () => {
            bot.generateResponse('Show me pricing plans');
            const chips = Array.from(quickRepliesContainer.querySelectorAll('.quick-reply')).map(el => el.textContent);
            expect(chips).toEqual(bot.quickReplySuggestions['pricing']);
        });

        it('should render correct suggestion chips for demo topic', () => {
            bot.generateResponse('Can I see a demo?');
            const chips = Array.from(quickRepliesContainer.querySelectorAll('.quick-reply')).map(el => el.textContent);
            expect(chips).toEqual(bot.quickReplySuggestions['demo']);
        });

        it('should render default suggestion chips for unknown topic with fallback', () => {
            bot.generateResponse('Tell me about quantum computing');
            const chips = Array.from(quickRepliesContainer.querySelectorAll('.quick-reply')).map(el => el.textContent);
            expect(chips).toEqual(bot.quickReplySuggestions['default']);
        });
    });

    describe('Fallback Responses', () => {
        it('should provide a graceful fallback response when no keyword matches', () => {
            bot.generateResponse('random question xyz unknown');
            const lastMsg = messagesContainer.lastElementChild?.querySelector('p')?.textContent;
            expect(bot.fallbackResponses).toContain(lastMsg);
        });
    });
});
