import React from 'react';

interface ContextItem {
    id: string;
    type: 'file' | 'image' | 'workflow' | 'tool';
    name: string;
    path?: string;
}

interface ActiveContextBarProps {
    items?: ContextItem[];
}

export const ActiveContextBar: React.FC<ActiveContextBarProps> = ({ items = [] }) => {
    // Mock data if no items provided (for dev preview)
    const activeItems: ContextItem[] = items.length > 0 ? items : [
        { id: '1', type: 'file', name: 'Dashboard.tsx' },
        { id: '2', type: 'workflow', name: 'Viral Video Flow' },
        { id: '3', type: 'tool', name: 'OVI-4 Engine' }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'file': return '📄';
            case 'image': return '🖼️';
            case 'workflow': return '⚡';
            case 'tool': return '🔧';
            default: return '📎';
        }
    };

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0d1117]/80 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-10 w-full overflow-x-auto scrollbar-hide">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mr-1 shrink-0">
                CONTEXT
            </span>

            {activeItems.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1f2428] border border-gray-700/50 text-[11px] text-gray-300 hover:bg-[#2d333b] hover:border-gray-600 transition-colors cursor-pointer shrink-0"
                >
                    <span className="opacity-70">{getIcon(item.type)}</span>
                    <span className="truncate max-w-[120px]">{item.name}</span>
                    <button className="ml-1 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400">
                        ×
                    </button>
                </div>
            ))}

            <button className="ml-auto text-gray-500 hover:text-blue-400 text-xs transition-colors p-1" title="Add items to context">
                +
            </button>
        </div>
    );
};
