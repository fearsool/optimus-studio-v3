
'use client';

import { useState, useEffect } from 'react';

interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'directory';
    path: string;
    children?: FileNode[];
}

interface FileExplorerProps {
    onFileOpen: (path: string, content: string) => void;
}

export const FileExplorer = ({ onFileOpen }: FileExplorerProps) => {
    const [files, setFiles] = useState<FileNode[]>([
        {
            id: '1',
            name: 'apps',
            type: 'directory',
            path: '/apps',
            children: [
                {
                    id: '2',
                    name: 'optimus-studio',
                    type: 'directory',
                    path: '/apps/optimus-studio',
                    children: [
                        { id: '3', name: 'page.tsx', type: 'file', path: '/apps/optimus-studio/page.tsx' },
                        { id: '4', name: 'layout.tsx', type: 'file', path: '/apps/optimus-studio/layout.tsx' },
                    ]
                }
            ]
        },
        {
            id: '5',
            name: 'components',
            type: 'directory',
            path: '/components',
            children: [
                { id: '6', name: 'ui', type: 'directory', path: '/components/ui' },
            ]
        },
        { id: '7', name: 'package.json', type: 'file', path: '/package.json' },
        { id: '8', name: 'tsconfig.json', type: 'file', path: '/tsconfig.json' },
    ]);

    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2', '5']));
    const [selected, setSelected] = useState<string>('3');

    const toggleExpand = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleFileClick = async (file: FileNode) => {
        if (file.type === 'directory') {
            toggleExpand(file.id);
            return;
        }

        setSelected(file.id);
        try {
            const response = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'read', filePath: file.path })
            });

            const data = await response.json();
            if (data.success) {
                onFileOpen(file.path, data.content);
            }
        } catch (error) {
            console.error('Failed to read file:', error);
            // Fallback content
            onFileOpen(file.path, `// Content of ${file.name}\n// File path: ${file.path}\n\n// This is a sample file content.`);
        }
    };

    const renderTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map(node => (
            <div key={node.id}>
                <div
                    className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer ${selected === node.id ? 'bg-[#094771]' : ''}`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => handleFileClick(node)}
                >
                    {node.type === 'directory' ? (
                        <button
                            className="w-4 h-4 mr-1 flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node.id);
                            }}
                        >
                            {expanded.has(node.id) ? '▼' : '▶'}
                        </button>
                    ) : (
                        <div className="w-5 h-4 mr-1"></div>
                    )}

                    <span className="text-sm">
                        {node.type === 'directory' ? '📁' :
                            node.name.endsWith('.tsx') || node.name.endsWith('.ts') ? '📄' :
                                node.name.endsWith('.json') ? '📋' :
                                    '📄'} {node.name}
                    </span>
                </div>

                {node.type === 'directory' && expanded.has(node.id) && node.children && (
                    <div>
                        {renderTree(node.children, depth + 1)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b border-[#3c3c3c]">
                <div className="text-xs text-gray-400">WORKSPACE</div>
            </div>
            <div className="flex-1 overflow-auto py-2">
                {renderTree(files)}
            </div>
            <div className="p-2 border-t border-[#3c3c3c] text-xs text-gray-500">
                {files.filter(f => f.type === 'file').length} files
            </div>
        </div>
    );
};
