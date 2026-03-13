'use client';

import React, { useState } from 'react';
import MonacoEditor from '../editor/MonacoEditor';
import XtermTerminal from '../terminal/XtermTerminal';
import { Dashboard } from '../dashboard/Dashboard';
import { FactoryControlCenter } from '../dashboard/FactoryControlCenter';

export default function IdeLayout() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showTerminal, setShowTerminal] = useState(true);

    return (
        <div className="flex flex-col h-screen bg-[#1e1e1e] text-white">
            {/* Top Bar */}
            <div className="h-12 border-b border-[#333] flex items-center px-4 justify-between bg-[#252526]">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-blue-400">Optimus Studio IDE</span>
                    <div className="flex gap-1 bg-[#1e1e1e] rounded p-1">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-3 py-1 text-xs rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('factory')}
                            className={`px-3 py-1 text-xs rounded ${activeTab === 'factory' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Factory Floor
                        </button>
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`px-3 py-1 text-xs rounded ${activeTab === 'editor' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Code Editor
                        </button>
                    </div>
                </div>
                <div>
                    <button
                        onClick={() => setShowTerminal(!showTerminal)}
                        className={`px-3 py-1 text-xs border border-[#444] rounded hover:bg-[#333] ${showTerminal ? 'bg-[#333]' : ''}`}
                    >
                        Terminal_
                    </button>
                </div>
            </div>

            {/* Main Content Area (Split View) */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left/Center Panel (Dashboard or Editor) */}
                <div className={`flex-1 transition-all duration-300 relative ${activeTab === 'editor' ? 'w-2/3' : 'w-full'}`}>
                    {activeTab === 'dashboard' && <div className="h-full overflow-y-auto"><Dashboard /></div>}
                    {activeTab === 'factory' && <div className="h-full overflow-y-auto"><FactoryControlCenter /></div>}
                    {activeTab === 'editor' && (
                        <div className="h-full border-r border-[#333]">
                            <MonacoEditor
                                language="typescript"
                                value="// Optimus Studio Autonomous Code\n// Write your automation logic here..."
                                theme="vs-dark"
                                onChange={(val) => console.log('Code changed:', val)}
                            />
                        </div>
                    )}
                </div>

                {/* Right Panel (Agent/Tools) - Placeholder for Phase 9 3-column */}
                {/* <div className="w-64 border-l border-[#333] bg-[#252526]">
                    Agent Panel
                </div> */}
            </div>

            {/* Bottom Panel (Terminal) */}
            {showTerminal && (
                <div className="h-64 border-t border-[#333] bg-black">
                    <XtermTerminal />
                </div>
            )}
        </div>
    );
}
