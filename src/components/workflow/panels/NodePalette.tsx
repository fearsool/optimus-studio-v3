// src/components/workflow/panels/NodePalette.tsx
import React from 'react';
import { Bot, Zap, Database, Globe, Play, FileJson, HardDrive, Layers, Box } from 'lucide-react';

export const NodePalette = () => {
    // Draggable items logic would go here
    const categories = [
        {
            name: 'Factory Templates',
            icon: <FileJson size={14} className="text-red-500" />,
            items: ['Mind Trap (Viral)', 'Sessiz Güç (Biz)', 'Tuhaf Gerçekler', 'Girişimci Kafası', 'Tarih Odası']
        },
        {
            name: 'AI & ML',
            icon: <Bot size={14} className="text-purple-400" />,
            items: ['LLM Chat', 'Image Gen', 'Audio Proc', 'Video Analysis', 'Data Classify']
        },
        {
            name: 'Data Processing',
            icon: <Database size={14} className="text-blue-400" />,
            items: ['Transform', 'Filter & Sort', 'Merge', 'Enrich', 'Validate']
        },
        {
            name: 'API & Integrations',
            icon: <Globe size={14} className="text-green-400" />,
            items: ['HTTP Request', 'WebSocket', 'DB Query', 'File Upload', 'Webhook']
        },
        {
            name: 'Control Flow',
            icon: <Zap size={14} className="text-orange-400" />,
            items: ['Condition', 'Loop', 'Switch', 'Wait', 'Error Handler']
        },
        {
            name: 'Output & Storage',
            icon: <HardDrive size={14} className="text-yellow-400" />,
            items: ['Save File', 'DB Write', 'Send Email', 'Webhook Call', 'API Response']
        }
    ];

    return (
        <div className="bg-[#161b22] border border-gray-700 rounded-lg overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-2 bg-gray-800 font-bold text-xs border-b border-gray-700">NODE PALETTE</div>
            <div className="overflow-auto p-2 custom-scrollbar space-y-4">
                {categories.map((cat, i) => (
                    <div key={i}>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-1 uppercase">
                            {cat.icon} {cat.name}
                        </div>
                        <div className="space-y-1">
                            {cat.items.map(item => (
                                <div
                                    key={item}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('application/reactflow', item);
                                        e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    className="bg-[#0d1117] p-1.5 rounded border border-gray-800 text-xs hover:border-blue-500 cursor-grab active:cursor-grabbing flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
