import React, { useState, useEffect, useRef } from 'react';
import { getRulesFromChat } from '../services/geminiService';
import Spinner from './Spinner';
import { ChatIcon, CancelIcon } from './icons';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface RulesChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: string) => void;
  initialRules: string;
}

const RulesChatModal: React.FC<RulesChatModalProps> = ({ isOpen, onClose, onSave, initialRules }) => {
    const initialMessage: ChatMessage = {
        role: 'model',
        text: "Hello! I'm here to help you set up the evaluation rules. Please tell me how you'd like me to grade the answer sheet. For example, you can specify marks for each question, keywords to look for, or negative marking policies."
    };

    const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) return null;

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: inputValue };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            const history = newMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            const aiResponseText = await getRulesFromChat(history);
            const aiMessage: ChatMessage = { role: 'model', text: aiResponseText };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to get response from AI:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        const lastAiMessage = messages.filter(m => m.role === 'model').pop();
        onSave(lastAiMessage?.text || initialRules);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-brand-surface border border-brand-outline rounded-xl shadow-2xl shadow-brand-primary/10 w-full max-w-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-outline flex-shrink-0">
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2" id="modal-title">
                        <ChatIcon className="text-brand-primary"/>
                        Set Custom Evaluation Rules
                    </h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <CancelIcon className="w-5 h-5" />
                    </button>
                </div>

                <div ref={chatBodyRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                            {message.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0"><ChatIcon className="w-5 h-5 text-brand-primary"/></div>}
                            <div className={`max-w-md p-3 rounded-lg text-sm whitespace-pre-wrap ${message.role === 'user' ? 'bg-brand-primary text-white' : 'bg-brand-bg-light text-text-secondary'}`}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0"><ChatIcon className="w-5 h-5 text-brand-primary"/></div>
                            <div className="max-w-md p-3 rounded-lg bg-brand-bg-light text-text-secondary">
                                <Spinner className="animate-spin h-5 w-5 text-brand-primary" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-brand-outline flex-shrink-0">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your rules here..."
                            className="flex-grow px-4 py-2 bg-brand-surface border border-brand-outline rounded-md shadow-sm placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-secondary text-text-primary"
                            disabled={isLoading}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className="px-5 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors disabled:opacity-50">
                            Send
                        </button>
                    </div>
                     <div className="mt-4 flex justify-end">
                        <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-500 transition-colors">
                            Save Rules & Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesChatModal;