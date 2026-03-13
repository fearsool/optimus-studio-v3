
'use client';

import { useEffect, useRef } from 'react';

interface ChatPanelProps {
  messages: any[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  startListening: () => void;
  isLoading: boolean;
}

export const ChatPanel = ({
  messages,
  input,
  setInput,
  sendMessage,
  startListening,
  isLoading
}: ChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : msg.role === 'assistant'
                  ? 'bg-[#21262d] text-gray-200 border border-[#30363d]'
                  : 'bg-[#161b22] text-gray-400 border border-[#30363d]'
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'assistant' && (
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                )}
                <span className="text-xs font-medium capitalize">
                  {msg.role}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#21262d] rounded-lg p-3 border border-[#30363d]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#30363d] p-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm resize-none outline-none focus:border-blue-500"
              rows={3}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-500">
              {input.length}/2000
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => document.getElementById('chat-file-upload')?.click()}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1"
                title="Upload File"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </button>
              <input
                type="file"
                id="chat-file-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setInput(prev => prev + `\n[FILE: ${e.target.files![0].name}]`);
                  }
                }}
              />
              <button
                onClick={startListening}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1"
                title="Voice Input"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          <kbd className="px-2 py-1 bg-[#21262d] rounded border border-[#30363d]">Enter</kbd> to send •{' '}
          <kbd className="px-2 py-1 bg-[#21262d] rounded border border-[#30363d]">Shift</kbd> +{' '}
          <kbd className="px-2 py-1 bg-[#21262d] rounded border border-[#30363d]">Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};
