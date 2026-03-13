import React, { useRef, useEffect } from 'react';

interface InputCapsuleProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onUpload?: () => void;
    onVoice?: () => void;
    onAction?: (action: string) => void;
    isLoading?: boolean;
    isVoiceActive?: boolean;
}

export const InputCapsule: React.FC<InputCapsuleProps> = ({
    value,
    onChange,
    onSend,
    onUpload,
    onVoice,
    onAction,
    isLoading,
    isVoiceActive
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4 bg-gradient-to-t from-[#0d1117] via-[#0d1117] to-transparent">
            <div className="relative group bg-[#161b22] border border-gray-700 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 rounded-2xl shadow-lg transition-all duration-200">

                {/* Text Input Area */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Optimus'a yaz veya komut ver..."
                    className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 min-h-[50px] max-h-[120px] resize-none focus:outline-none text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-700 rounded-2xl"
                    rows={1}
                />

                {/* Toolbar (Bottom) */}
                <div className="flex items-center justify-between px-2 pb-2 pl-3">

                    {/* Multimodal Inputs */}
                    <div className="flex items-center gap-1.5">
                        {/* File Upload */}
                        <input
                            type="file"
                            id="global-file-upload"
                            className="hidden"
                            onChange={(e) => {
                                alert(`File Selected: ${e.target.files?.[0]?.name}`);
                                if (onUpload) onUpload();
                            }}
                        />
                        <button
                            onClick={() => document.getElementById('global-file-upload')?.click()}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors group/btn relative"
                            title="Dosya Ekle (PDF, Image, Code)"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                            <span className="hidden group-hover/btn:block absolute bottom-full left-0 bg-gray-900 border border-gray-800 text-xs px-2 py-1 rounded mb-2 whitespace-nowrap">Dosya Ekle</span>
                        </button>

                        {/* Quick Actions */}
                        <div className="relative group/actions p-2 -m-2"> {/* Added padding/margin to increase hit area */}
                            <button
                                className="p-2 text-yellow-500/80 hover:text-yellow-400 hover:bg-yellow-900/20 rounded-lg transition-colors"
                                title="Hızlı Aksiyonlar"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            </button>

                            {/* Invisible bridge to prevent menu closing */}
                            <div className="absolute left-0 bottom-full w-full h-2 bg-transparent" />

                            {/* Dropdown Menu */}
                            <div className="absolute bottom-[calc(100%+8px)] left-0 w-56 bg-[#1f2428] border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden hidden group-hover/actions:block animate-in fade-in slide-in-from-bottom-2 z-50">
                                <div className="p-1.5 space-y-0.5">
                                    <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Otomasyon</div>
                                    <button onClick={() => onAction && onAction('create_workflow')} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-blue-600/20 hover:text-blue-200 rounded-lg flex items-center gap-2 transition-colors">
                                        <span className="text-blue-400">⚡</span> Yeni Workflow Başlat
                                    </button>
                                    <button onClick={() => onAction && onAction('load_template')} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-blue-600/20 hover:text-blue-200 rounded-lg flex items-center gap-2 transition-colors">
                                        <span className="text-yellow-400">📂</span> Fabrika Şablonu Yükle
                                    </button>

                                    <div className="my-1 border-t border-gray-700/50" />

                                    <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Analiz</div>
                                    <button onClick={() => onAction && onAction('analyze_context')} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-purple-600/20 hover:text-purple-200 rounded-lg flex items-center gap-2 transition-colors">
                                        <span className="text-purple-400">🔍</span> Dosyayı/Resmi İncele
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Voice & Send */}
                    <div className="flex items-center gap-2">
                        {/* Voice Input */}
                        <button
                            onClick={onVoice}
                            className={`p-2 rounded-full transition-all ${isVoiceActive ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            title="Konuş (Multimodal)"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>

                        {/* Send Button */}
                        <button
                            onClick={onSend}
                            disabled={isLoading || !value.trim()}
                            className={`p-2 rounded-xl transition-all ${isLoading ? 'bg-gray-700 cursor-not-allowed' :
                                value.trim() ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800 text-gray-500'
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Disclaimer / Model Info */}
            <div className="flex justify-center mt-2 gap-4 text-[10px] text-gray-600 font-medium">
                <span className="flex items-center gap-1">🧠 Optimus Prime (7B)</span>
                <span className="flex items-center gap-1">🔒 Local</span>
            </div>
        </div>
    );
};
