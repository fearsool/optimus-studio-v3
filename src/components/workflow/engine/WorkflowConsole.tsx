
// src/components/workflow/engine/WorkflowConsole.tsx
import React, { useState } from 'react';

export interface LogEntry {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface WorkflowConsoleProps {
    logs?: LogEntry[];
}

export const WorkflowConsole = ({ logs = [] }: WorkflowConsoleProps) => {
    const [activeTab, setActiveTab] = useState('LOGS');

    return (
        <div className="flex flex-col h-full bg-[#161b22] text-xs font-mono">
            <div className="flex items-center h-8 bg-[#0d1117] border-b border-gray-800 px-2">
                {['LOGS', 'OUTPUT', 'ERRORS', 'PERFORMANCE'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={` px-3 h-full border-b-2 transition-colors ${activeTab === tab ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto p-2 space-y-1 font-mono">
                {activeTab === 'LOGS' && (
                    <>
                        {logs.length === 0 && <div className="text-gray-600 italic">Ready to run...</div>}
                        {logs.map((log, i) => (
                            <div key={i} className={`${log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                            'text-blue-300'
                                }`}>
                                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                            </div>
                        ))}
                    </>
                )}
                {activeTab === 'PERFORMANCE' && (
                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                        <div className="bg-gray-800 p-2 rounded">
                            <div className="text-gray-500 text-[10px] uppercase">Execution Time</div>
                            <div className="text-lg font-bold text-white">3.2s</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded">
                            <div className="text-gray-500 text-[10px] uppercase">Token Cost</div>
                            <div className="text-lg font-bold text-white">$0.024</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
