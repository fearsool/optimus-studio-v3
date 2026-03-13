
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';


// --- Message Types Components ---

const MessageContent: React.FC<{ content: string }> = ({ content }) => {
    // Basic markdown support + formatting
    return (
        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <div className="relative rounded-md overflow-hidden my-2 bg-[#161b22] border border-gray-700">
                                <div className="flex items-center justify-between px-3 py-1 bg-[#1f2428] border-b border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
                                    <span className="text-xs text-gray-500">Copy</span>
                                </div>
                                <code className={className} {...props} style={{ display: 'block', padding: '12px', overflowX: 'auto' }}>
                                    {children}
                                </code>
                            </div>
                        ) : (
                            <code className={`bg-[#2d333b] px-1 py-0.5 rounded text-blue-200 ${className}`} {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

const ReasoningFooter: React.FC<{ message: Message }> = ({ message }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Only show for assistant messages that likely had tool usage or planning
    if (message.role !== 'assistant') return null;

    // Simulate "Why" content if not present in message object (Phase 2 adds real metadata)
    const whyContent = "I analyzed your request using the Planner and decided to use the 'Scout' tool because you mentioned 'trends'. Confidence is high (92%).";

    return (
        <div className="mt-2 text-xs border-t border-gray-700/50 pt-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 transition-colors"
            >
                <span className="text-[10px]">Interesting?</span>
                <span className="font-semibold">{isOpen ? 'Hide Reasoning' : 'Why did I do this?'}</span>
                <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="mt-2 pl-2 border-l-2 border-blue-500/30 text-gray-400 space-y-1 animate-in slide-in-from-top-2">
                    <p>{whyContent}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded border border-green-800/50 font-mono text-[10px]">Confidence: 92%</span>
                        <span className="px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded border border-purple-800/50 font-mono text-[10px]">Model: qwen2.5-coder:7b</span>
                    </div>
                </div>
            )}
        </div>
    );
}

interface MessageListProps {
    messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
            <div className="flex flex-col max-w-full mx-auto w-full space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar (Left for Assistant) */}
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white mr-3 shrink-0 shadow-lg shadow-blue-900/20">
                                OP
                            </div>
                        )}

                        <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm transition-all ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-blue-900/10'
                            : 'bg-[#1e1e1e] border border-gray-800/80 text-gray-300 rounded-tl-sm shadow-xl'
                            }`}>

                            {/* Header (Assistant) */}
                            {msg.role === 'assistant' && (
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Optimus</span>
                                    <span className="text-[10px] text-gray-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )}

                            {/* Content */}
                            <MessageContent content={msg.content} />

                            {/* Reasoning Footer (Assistant only) */}
                            <ReasoningFooter message={msg} />

                            {/* Footer Timestamp (User only) */}
                            {msg.role === 'user' && (
                                <div className="text-[10px] opacity-40 mt-1 text-right">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};
