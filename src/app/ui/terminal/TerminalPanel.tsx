'use client';

import React, { useState, useEffect } from 'react';
import { TerminalInstance } from './TerminalInstance';
import { Terminal as XTerm } from 'xterm';

// Icons (Simple SVGs for now)
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" /></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /></svg>;
const SplitIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-11zM2.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-11z" /><path d="M8 2v12H7V2h1z" /></svg>;

interface TerminalTab {
    id: string;
    title: string;
    term?: XTerm;
}

export function TerminalPanel() {
    const [tabs, setTabs] = useState<TerminalTab[]>([
        { id: '1', title: 'Start' }
    ]);
    const [activeTabId, setActiveTabId] = useState('1');

    const addTab = () => {
        const newId = (tabs.length + 1).toString();
        setTabs([...tabs, { id: newId, title: 'Bash' }]);
        setActiveTabId(newId);
    };

    const removeTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (tabs.length <= 1) return; // Don't remove last tab

        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);

        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    const clearTerminal = () => {
        const activeTab = tabs.find(t => t.id === activeTabId);
        activeTab?.term?.clear();
        activeTab?.term?.write('\r\n$ ');
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#0d1117] text-[#c9d1d9] font-mono text-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-2 h-9 border-b border-[#30363d] bg-[#010409]">
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`
                                flex items-center px-3 py-1 cursor-pointer select-none rounded-t-sm border-t-2 transition-colors
                                ${activeTabId === tab.id
                                    ? 'bg-[#0d1117] border-[#f78166] text-white'
                                    : 'bg-transparent border-transparent hover:bg-[#161b22] text-[#8b949e]'}
                            `}
                        >
                            <span className="mr-2">{tab.title}</span>
                            {tabs.length > 1 && (
                                <div
                                    onClick={(e) => removeTab(tab.id, e)}
                                    className="opacity-0 group-hover:opacity-100 hover:text-white p-0.5 rounded hover:bg-[#30363d]"
                                >
                                    <span className="text-xs">&times;</span>
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addTab}
                        className="p-1 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-white"
                        title="New Terminal"
                    >
                        <PlusIcon />
                    </button>
                </div>

                <div className="flex items-center space-x-2 pr-2">
                    <button onClick={clearTerminal} className="p-1 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-white" title="Clear">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" /><line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" /></svg>
                    </button>
                    <button className="p-1 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-white" title="Split Terminal">
                        <SplitIcon />
                    </button>
                    <button className="p-1 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-white" title="Kill Terminal">
                        <TrashIcon />
                    </button>
                </div>
            </div>

            {/* Terminal Content Area */}
            <div className="flex-1 relative overflow-hidden p-1">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className="absolute inset-0"
                        style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
                    >
                        <TerminalInstance
                            id={tab.id}
                            isActive={activeTabId === tab.id}
                            onReady={(term) => { tab.term = term; }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
