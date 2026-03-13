'use client';

/**
 * 💻 MONACO CODE EDITOR - VS Code Experience
 * ==========================================
 * Full IDE experience with syntax highlighting, intellisense, and themes.
 */

import React, { useRef, useEffect } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    theme?: 'vs-dark' | 'light' | 'optimus-dark';
    readOnly?: boolean;
    path?: string;
    height?: string;
    onSave?: (value: string) => void;
}

// Optimus Dark Theme
const OPTIMUS_DARK_THEME: monaco.editor.IStandaloneThemeData = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
    ],
    colors: {
        'editor.background': '#0c0c0c',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#404040',
        'editorLineNumber.activeForeground': '#808080',
        'editor.selectionBackground': '#264F78',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#3B3B3B',
    }
};

export const MonacoCodeEditor: React.FC<MonacoEditorProps> = ({
    value,
    onChange,
    language = 'typescript',
    theme = 'optimus-dark',
    readOnly = false,
    path,
    height = '100%',
    onSave
}) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
        editorRef.current = editor;

        // Register Optimus Dark theme
        monacoInstance.editor.defineTheme('optimus-dark', OPTIMUS_DARK_THEME);
        monacoInstance.editor.setTheme('optimus-dark');

        // Add keyboard shortcuts
        editor.addCommand(
            monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
            () => {
                if (onSave) {
                    onSave(editor.getValue());
                }
            }
        );

        // Focus editor
        editor.focus();
    };

    const handleEditorChange = (value: string | undefined) => {
        onChange(value);
    };

    // Detect language from file extension
    const detectLanguage = (filePath?: string): string => {
        if (!filePath) return language;

        const ext = filePath.split('.').pop()?.toLowerCase();
        const languageMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'typescriptreact',
            'js': 'javascript',
            'jsx': 'javascriptreact',
            'py': 'python',
            'json': 'json',
            'md': 'markdown',
            'css': 'css',
            'scss': 'scss',
            'html': 'html',
            'sql': 'sql',
            'yaml': 'yaml',
            'yml': 'yaml',
            'sh': 'shell',
            'bash': 'shell',
        };

        return languageMap[ext || ''] || language;
    };

    return (
        <div className="w-full h-full rounded-lg overflow-hidden border border-gray-800">
            <Editor
                height={height}
                language={detectLanguage(path)}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={theme === 'optimus-dark' ? 'vs-dark' : theme}
                options={{
                    minimap: { enabled: true, scale: 0.8 },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                    fontLigatures: true,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'mouseover',
                    bracketPairColorization: { enabled: true },
                    guides: {
                        bracketPairs: true,
                        indentation: true,
                    },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    padding: { top: 16, bottom: 16 },
                }}
            />
        </div>
    );
};

export default MonacoCodeEditor;
