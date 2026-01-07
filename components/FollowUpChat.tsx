
import React, { useState, useRef, useEffect } from 'react';
import { ComparisonData } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface FollowUpChatProps {
    comparisonData: ComparisonData;
}

const FollowUpChat: React.FC<FollowUpChatProps> = ({ comparisonData }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Reset chat when comparison data changes
    useEffect(() => {
        setMessages([
            {
                role: 'model',
                text: `I've analyzed **${comparisonData.productOneName}** and **${comparisonData.productTwoName}**. \n\nAsk me anything specific about the specs, differences, or who wins in specific scenarios!`
            }
        ]);
    }, [comparisonData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // We pass the conversation history (excluding the very first welcome message which is local only)
            // and the context to the API
            const apiHistory = messages.slice(1); 
            
            const responseText = await sendChatMessage(userMessage, apiHistory, comparisonData);
            
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Try again!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[600px] animate-fade-in mt-12">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Follow-up Q&A</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ask specific questions about this comparison</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`
                                max-w-[90%] md:max-w-[80%] rounded-2xl px-5 py-3.5 text-sm md:text-base shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-sky-600 text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-600'}
                            `}
                        >
                            <MarkdownRenderer content={msg.text} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., Which one has better value for money?"
                        className="w-full pl-5 pr-14 py-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-transparent focus:bg-white dark:focus:bg-black focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all dark:text-white"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-sky-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409 5 5 0 119.45 0 1 1 0 001.169-1.409l-7-14z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FollowUpChat;
