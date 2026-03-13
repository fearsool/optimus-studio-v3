
'use client';

import { useState, useEffect } from 'react';

interface CodeEditorProps {
    code: string;
    language?: string;
    onChange?: (code: string) => void;
}

export const CodeEditor = ({ code, language = 'typescript', onChange }: CodeEditorProps) => {
    const [value, setValue] = useState(code);

    useEffect(() => {
        setValue(code);
    }, [code]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const getLanguageClass = () => {
        switch (language) {
            case 'typescript': return 'language-typescript';
            case 'python': return 'language-python';
            case 'javascript': return 'language-javascript';
            case 'json': return 'language-json';
            default: return 'language-javascript';
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
            {/* Editor Header */}
            <div className="h-8 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-4 text-xs text-gray-400">
                <span className="capitalize">{language}</span>
                <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3fb950]"></div>
                    <span>LIVE</span>
                </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-hidden">
                <div className={`h-full ${getLanguageClass()}`}>
                    <textarea
                        className="w-full h-full bg-transparent text-[#d4d4d4] font-mono text-sm p-4 resize-none outline-none"
                        value={value}
                        onChange={handleChange}
                        spellCheck={false}
                        style={{
                            lineHeight: '1.5',
                            tabSize: 2,
                        }}
                    />
                </div>
            </div>

            {/* Editor Footer */}
            <div className="h-6 bg-[#007acc] text-white text-xs flex items-center px-4 justify-between">
                <div className="flex items-center gap-4">
                    <span>UTF-8</span>
                    <span>{language.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Ln {value.split('\n').length}, Col {value.length}</span>
                    <span>{value.length} chars</span>
                </div>
            </div>
        </div>
    );
};
