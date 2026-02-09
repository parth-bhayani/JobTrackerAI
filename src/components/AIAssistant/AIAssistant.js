import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiZap, FiFilter } from 'react-icons/fi';
import { useFilters } from '../../context/FilterContext';
import { assistantAPI } from '../../services/api';
import './AIAssistant.css';

function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content: "👋 Hi! I'm your AI job search assistant. I can help you:\n\n• **Search jobs**: \"Find React developer roles\"\n• **Apply filters**: \"Show only remote jobs\"\n• **Answer questions**: \"How do I track applications?\"\n\nWhat would you like to do?",
            actions: []
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { applyActions } = useFilters();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();

        if (!inputValue.trim() || loading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        try {
            const response = await assistantAPI.chat(userMessage.content, messages);

            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                actions: response.actions || []
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Apply filter actions from AI
            if (response.actions && response.actions.length > 0) {
                applyActions(response.actions);
            }
        } catch (err) {
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again.",
                actions: []
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setLoading(false);
    };

    const handleQuickAction = (action) => {
        setInputValue(action);
        inputRef.current?.focus();
    };

    const quickActions = [
        { icon: '🔍', text: 'Remote React jobs' },
        { icon: '⚡', text: 'High match scores only' },
        { icon: '📅', text: 'Posted this week' },
        { icon: '🔄', text: 'Clear all filters' }
    ];

    return (
        <>
            {/* Chat Bubble */}
            <button
                className={`chat-bubble ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat' : 'Open AI assistant'}
            >
                {isOpen ? <FiX /> : <FiMessageCircle />}
                {!isOpen && <span className="bubble-badge">AI</span>}
            </button>

            {/* Chat Panel */}
            <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <div className="chat-header-info">
                        <div className="chat-avatar">
                            <FiZap />
                        </div>
                        <div>
                            <h3>AI Assistant</h3>
                            <span className="chat-status">
                                <span className="status-dot"></span>
                                Online
                            </span>
                        </div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>
                        <FiX />
                    </button>
                </div>

                <div className="chat-messages">
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.role}`}>
                            {message.role === 'assistant' && (
                                <div className="message-avatar">
                                    <FiZap />
                                </div>
                            )}
                            <div className="message-content">
                                <div
                                    className="message-text"
                                    dangerouslySetInnerHTML={{
                                        __html: message.content
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\n/g, '<br/>')
                                    }}
                                />
                                {message.actions && message.actions.length > 0 && (
                                    <div className="message-actions">
                                        <FiFilter />
                                        <span>Filters updated</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="message assistant">
                            <div className="message-avatar">
                                <FiZap />
                            </div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            className="quick-action-btn"
                            onClick={() => handleQuickAction(action.text)}
                        >
                            <span>{action.icon}</span>
                            {action.text}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="chat-input"
                        placeholder="Ask me anything..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={!inputValue.trim() || loading}
                    >
                        <FiSend />
                    </button>
                </form>
            </div>
        </>
    );
}

export default AIAssistant;
