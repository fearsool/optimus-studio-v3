/**
 * 📁 FILE STORE - File tree & project management
 */

import { create } from 'zustand';

export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    isOpen?: boolean;
}

export interface Project {
    id: string;
    name: string;
    path: string;
    isActive: boolean;
}

interface FileStore {
    // Projects
    projects: Project[];
    activeProjectId: string | null;
    addProject: (name: string, path: string) => void;
    removeProject: (id: string) => void;
    setActiveProject: (id: string) => void;

    // Files
    files: FileNode[];
    selectedFile: string | null;
    setFiles: (files: FileNode[]) => void;
    setSelectedFile: (path: string | null) => void;
    toggleFolder: (path: string) => void;
    addFile: (parentPath: string, name: string, type: 'file' | 'folder') => void;
}

const defaultFiles: FileNode[] = [
    {
        name: 'core', path: '/core', type: 'folder', isOpen: true, children: [
            { name: 'hayal_y1_main.ts', path: '/core/hayal_y1_main.ts', type: 'file' },
            { name: 'ovi4_engine.ts', path: '/core/ovi4_engine.ts', type: 'file' },
            {
                name: 'workers', path: '/core/workers', type: 'folder', children: [
                    { name: 'multiframe_generator.py', path: '/core/workers/multiframe_generator.py', type: 'file' }
                ]
            }
        ]
    },
    {
        name: 'automations', path: '/automations', type: 'folder', children: [
            { name: 'Hayal Y1', path: '/automations/hayal-y1', type: 'file' },
            { name: 'SEO Engine', path: '/automations/seo-engine', type: 'file' }
        ]
    },
    {
        name: 'extensions', path: '/extensions', type: 'folder', children: [
            { name: 'example-skill', path: '/extensions/example-skill', type: 'file' }
        ]
    }
];

export const useFileStore = create<FileStore>((set, get) => ({
    // Projects
    projects: [
        { id: 'default', name: 'omniflow-factory', path: '/omniflow', isActive: true }
    ],
    activeProjectId: 'default',

    addProject: (name, path) => {
        const id = `proj-${Date.now()}`;
        set(state => ({
            projects: [...state.projects, { id, name, path, isActive: false }]
        }));
    },

    removeProject: (id) => {
        set(state => ({
            projects: state.projects.filter(p => p.id !== id)
        }));
    },

    setActiveProject: (id) => {
        set(state => ({
            projects: state.projects.map(p => ({ ...p, isActive: p.id === id })),
            activeProjectId: id
        }));
    },

    // Files
    files: defaultFiles,
    selectedFile: null,

    setFiles: (files) => set({ files }),

    setSelectedFile: (path) => set({ selectedFile: path }),

    toggleFolder: (path) => {
        const toggleNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === path && node.type === 'folder') {
                    return { ...node, isOpen: !node.isOpen };
                }
                if (node.children) {
                    return { ...node, children: toggleNode(node.children) };
                }
                return node;
            });
        };
        set(state => ({ files: toggleNode(state.files) }));
    },

    addFile: (parentPath, name, type) => {
        const addToNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === parentPath && node.type === 'folder') {
                    const newPath = `${parentPath}/${name}`;
                    const newNode: FileNode = { name, path: newPath, type };
                    if (type === 'folder') newNode.children = [];
                    return {
                        ...node,
                        isOpen: true,
                        children: [...(node.children || []), newNode]
                    };
                }
                if (node.children) {
                    return { ...node, children: addToNode(node.children) };
                }
                return node;
            });
        };
        set(state => ({ files: addToNode(state.files) }));
    }
}));
