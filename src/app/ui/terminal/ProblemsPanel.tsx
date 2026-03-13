'use client';

import React from 'react';

export interface Problem {
    id: string;
    severity: 'error' | 'warning' | 'info';
    code: string;
    message: string;
    file: string;
    line: number;
    column: number;
}

const MOCK_PROBLEMS: Problem[] = [
    {
        id: '1',
        severity: 'error',
        code: 'TS2304',
        message: "Cannot find name 'currentFilePath'.",
        file: 'src/app/page.tsx',
        line: 145,
        column: 20
    },
    {
        id: '2',
        severity: 'warning',
        code: 'ESLint',
        message: "'useEffect' is defined but never used.",
        file: 'src/components/Button.tsx',
        line: 12,
        column: 5
    },
    {
        id: '3',
        severity: 'info',
        code: 'TODO',
        message: "[TODO] Implement authentication middleware",
        file: 'src/middleware.ts',
        line: 1,
        column: 1
    }
];

interface ProblemsPanelProps {
    onFix: (problem: Problem) => void;
}

export function ProblemsPanel({ onFix }: ProblemsPanelProps) {
    return (
        <div className="w-full h-full bg-[#0d1117] text-[#c9d1d9] font-mono text-sm overflow-auto">
            <div className="flex items-center px-4 py-2 border-b border-[#30363d] bg-[#010409] sticky top-0">
                <span className="font-semibold text-xs uppercase tracking-wider text-[#8b949e]">Problems</span>
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#f78166] text-white text-xs font-bold">{MOCK_PROBLEMS.filter(p => p.severity === 'error').length}</span>
            </div>

            <table className="w-full border-collapse">
                <thead className="bg-[#161b22] text-[#8b949e] text-left text-xs">
                    <tr>
                        <th className="px-4 py-1 font-normal w-16">Code</th>
                        <th className="px-4 py-1 font-normal">Message</th>
                        <th className="px-4 py-1 font-normal w-48">File</th>
                        <th className="px-4 py-1 font-normal w-24">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {MOCK_PROBLEMS.map(problem => (
                        <tr key={problem.id} className="border-b border-[#30363d] hover:bg-[#161b22] group">
                            <td className="px-4 py-2 text-xs text-[#8b949e]">{problem.code}</td>
                            <td className="px-4 py-2">
                                <div className="flex items-center">
                                    {problem.severity === 'error' && <span className="text-[#f78166] mr-2">●</span>}
                                    {problem.severity === 'warning' && <span className="text-[#d29922] mr-2">▲</span>}
                                    {problem.severity === 'info' && <span className="text-[#58a6ff] mr-2">ℹ</span>}
                                    {problem.message}
                                </div>
                            </td>
                            <td className="px-4 py-2 text-[#8b949e] opacity-70">
                                {problem.file}:{problem.line}
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => onFix(problem)}
                                    className="opacity-0 group-hover:opacity-100 flex items-center px-2 py-1 bg-[#238636] text-white rounded text-xs hover:bg-[#2ea043] transition-all"
                                >
                                    <span>Fix with Optimus</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
