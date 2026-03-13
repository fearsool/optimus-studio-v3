
'use client';

import { useState, useEffect } from 'react';

interface BottomPanelProps {
    onFixProblem?: (problem: any) => void;
}

export const BottomPanel = ({ onFixProblem }: BottomPanelProps) => {
    const [logs, setLogs] = useState([
        { time: '10:00', type: 'info', message: 'System initialized' },
        { time: '10:01', type: 'info', message: 'Terminal ready' },
    ]);

    const [command, setCommand] = useState('');
    const [output, setOutput] = useState('');

    const handleCommandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        const newLog = {
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            type: 'command',
            message: `$ ${command}`
        };

        setLogs(prev => [...prev, newLog]);

        try {
            const response = await fetch('/api/terminal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: command.trim() })
            });

            const data = await response.json();
            setOutput(data.output || 'Command executed');

            if (data.problem && onFixProblem) {
                onFixProblem(data.problem);
            }
        } catch (error) {
            setOutput('Error executing command');
        }

        setCommand('');
    };

    const simulateErrors = () => {
        const errors = [
            { file: 'app/page.tsx', line: 45, message: 'TypeError: Cannot read property', code: 'const data = null.data' },
            { file: 'components/editor.tsx', line: 12, message: 'SyntaxError: Unexpected token', code: 'function test() {' },
            { file: 'api/agent.ts', line: 33, message: 'ReferenceError: undefined variable', code: 'console.log(undefinedVar)' }
        ];

        const error = errors[Math.floor(Math.random() * errors.length)];
        const newLog = {
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            type: 'error',
            message: `Error in ${error.file}:${error.line} - ${error.message}`
        };

        setLogs(prev => [...prev, newLog]);

        if (onFixProblem) {
            onFixProblem(error);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-gray-300">
            {/* Terminal Tabs */}
            <div className="h-8 bg-[#2d2d30] border-b border-[#3c3c3c] flex">
                <button className="h-full px-4 bg-[#1e1e1e] text-white text-xs font-medium border-r border-[#3c3c3c]">
                    TERMINAL
                </button>
                <button className="h-full px-4 text-xs text-gray-400 hover:text-white">
                    PROBLEMS
                </button>
                <button className="h-full px-4 text-xs text-gray-400 hover:text-white">
                    OUTPUT
                </button>
                <button className="h-full px-4 text-xs text-gray-400 hover:text-white">
                    DEBUG CONSOLE
                </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-auto p-2 font-mono text-sm">
                <div className="space-y-1">
                    {logs.map((log, index) => (
                        <div key={index} className={`flex items-start gap-2 ${log.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                            <span className="text-gray-500 text-xs w-10">{log.time}</span>
                            {log.type === 'error' && (
                                <span className="text-red-400">✗</span>
                            )}
                            {log.type === 'command' && (
                                <span className="text-green-400">$</span>
                            )}
                            <span className="flex-1">{log.message}</span>
                        </div>
                    ))}
                </div>

                {output && (
                    <div className="mt-4 p-2 bg-[#252526] rounded border border-[#3c3c3c]">
                        <div className="text-green-400 mb-1">Output:</div>
                        <div className="text-gray-300">{output}</div>
                    </div>
                )}

                {/* Command Input */}
                <form onSubmit={handleCommandSubmit} className="mt-4 flex items-center">
                    <span className="text-green-400 mr-2">$</span>
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white"
                        placeholder="Type a command..."
                        autoComplete="off"
                        spellCheck={false}
                    />
                </form>
            </div>

            {/* Terminal Footer */}
            <div className="h-6 bg-[#007acc] text-white text-xs flex items-center px-4 justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={simulateErrors}
                        className="hover:bg-white/10 px-2 py-1 rounded"
                    >
                        Simulate Error
                    </button>
                    <button
                        onClick={() => setLogs([])}
                        className="hover:bg-white/10 px-2 py-1 rounded"
                    >
                        Clear Terminal
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <span>UTF-8</span>
                    <span>bash</span>
                </div>
            </div>
        </div>
    );
};
