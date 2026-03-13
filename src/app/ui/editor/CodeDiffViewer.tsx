
import React, { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface CodeDiffViewerProps {
    original: string;
    modified: string;
    language?: string;
    theme?: string;
}

export function CodeDiffViewer({
    original,
    modified,
    language = 'typescript',
    theme = 'vs-dark'
}: CodeDiffViewerProps) {
    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-[#333]">
            <DiffEditor
                height="100%"
                width="100%"
                language={language}
                original={original}
                modified={modified}
                theme={theme}
                options={{
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    readOnly: true,
                    originalEditable: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                }}
            />
        </div>
    );
}
