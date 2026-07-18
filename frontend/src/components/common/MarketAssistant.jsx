import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import axios from 'axios';

const MarketAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi there! I am your AI Market Assistant. How can I help you with your investments today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiKey = import.meta.env.VITE_COHERE_API_KEY;
            
            if (!apiKey) {
                throw new Error("Cohere API key not found in environment variables.");
            }

            const response = await axios.post(
                'https://api.cohere.ai/v1/chat',
                {
                    message: userMessage.content,
                    preamble: "You are an expert AI Market Assistant named Angel. You help users understand the stock market, analyze trends, and provide financial education. Be concise, professional, and helpful.",
                    chat_history: messages.slice(1).map(m => ({
                        role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
                        message: m.content
                    }))
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    }
                }
            );

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.text }]);
        } catch (error) {
            console.error('Chat API Error:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm sorry, I'm having trouble connecting to the market servers right now. Please check the API key configuration." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center
                    ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-primary-600 hover:bg-primary-700 text-white hover:scale-110'}
                `}
            >
                <MessageCircle className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col z-50 transition-all duration-500 origin-bottom-right
                ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-3xl text-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm">Market Assistant</h3>
                            <p className="text-[10px] text-white/70 font-bold tracking-widest uppercase">Powered by AI</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50 dark:bg-slate-900/50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-primary-600 text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-bl-sm'}
                            `}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm p-3 shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about markets..."
                            disabled={isLoading}
                            className="w-full bg-slate-50 dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700 rounded-full pl-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-50"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-primary-600"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default MarketAssistant;
