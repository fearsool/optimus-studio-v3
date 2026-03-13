'use client'

import React, { useEffect, useState } from 'react';
import { useStudioStore } from '../state/useStudioStore';

export interface Diagnosis {
    id: string;
    type: 'error' | 'warning' | 'optimization';
    message: string;
    location?: string;
    fix: {
        description: string;
        action: 'auto' | 'manual' | 'ignore';
    };
    source: string;
}

export default function SelfHealer() {
    const diagnostics = useStudioStore(state => state.diagnostics);
    const setDiagnostics = useStudioStore(state => state.setDiagnostics);
    const resolveDiagnosis = useStudioStore(state => state.resolveDiagnosis);

    const [isScanning, setIsScanning] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'diagnostics' | 'history'>('diagnostics');
    const [autoEvolve, setAutoEvolve] = useState(false);

    useEffect(() => {
        // fetchHistory(); // History API not implemented yet
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoEvolve) {
            runScanAndFix();
            interval = setInterval(async () => {
                await runScanAndFix();
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [autoEvolve]);

    const runScanAndFix = async () => {
        if (isScanning) return;
        setIsScanning(true);
        try {
            // 1. Scan via API
            console.log('Starting Diagnosis...');
            const res = await fetch('/api/doctor/diagnose', { method: 'POST' });
            if (!res.ok) throw new Error('Diagnosis failed');

            const data = await res.json();

            // Map API response to Component State expected format
            // API returns { diagnostics: { issues: [] } }
            const issues = data.diagnostics?.issues || [];
            const results: Diagnosis[] = issues.map((issue: any, index: number) => ({
                id: `diag-${index}-${Date.now()}`,
                type: issue.severity === 'HIGH' ? 'error' : 'warning',
                message: issue.description,
                source: issue.type,
                fix: { description: 'Auto-fix available via API', action: 'auto' }
            }));

            setDiagnostics(results);

            // 2. Auto-Fix (if Auto-Evolve is ON)
            if (autoEvolve && results.length > 0) {
                console.log('Auto-Fixing...');
                await fetch('/api/doctor/fix-all', { method: 'POST' });

                // Re-scan to show green
                const res2 = await fetch('/api/doctor/diagnose', { method: 'POST' });
                if (res2.ok) {
                    setDiagnostics([]);
                }
            }
        } catch (err) {
            console.error("Diagnosis/Fix failed:", err);
        } finally {
            setIsScanning(false);
        }
    };

    const handleFix = async (diagnosis: Diagnosis) => {
        setIsScanning(true);
        try {
            const res = await fetch('/api/doctor/fix-all', { method: 'POST' });
            if (res.ok) {
                // Remove the fixed item from list
                // resolveDiagnosis(diagnosis.id); // Or re-scan
                runScanAndFix();
            } else {
                alert('Fix failed');
            }
        } catch (e) {
            alert('Fix failed');
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0d1117] text-gray-300 p-4 font-mono text-xs overflow-hidden rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
                <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <span className="text-xl">🧬</span> SELF-EVOLUTION
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('diagnostics')}
                        className={`px-3 py-1 rounded ${activeTab === 'diagnostics' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}
                    >
                        Diagnoses ({diagnostics.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-3 py-1 rounded ${activeTab === 'history' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4 bg-[#161b22] p-3 rounded border border-gray-800">
                <div className="flex items-center gap-3">
                    <button
                        onClick={runScanAndFix}
                        disabled={isScanning}
                        className={`px-4 py-1.5 rounded text-white font-semibold transition-colors ${isScanning ? 'bg-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                    >
                        {isScanning ? 'SCANNING...' : 'RUN DIAGNOSTICS'}
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer select-none border border-emerald-900/50 px-2 py-1 rounded hover:bg-emerald-900/20">
                        <input
                            type="checkbox"
                            checked={autoEvolve}
                            onChange={(e) => setAutoEvolve(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-emerald-500 rounded bg-gray-800 border-gray-600 focus:ring-offset-gray-900"
                        />
                        <span className={`font-bold ${autoEvolve ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`}>
                            AUTO-EVOLVE MODE {autoEvolve ? '(ACTIVE)' : '(OFF)'}
                        </span>
                    </label>
                </div>
                {diagnostics.length > 0 && (
                    <span className="text-yellow-500 flex items-center gap-1">
                        ⚠️ {diagnostics.length} Issues Found
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto min-h-0">
                {activeTab === 'diagnostics' ? (
                    <div className="space-y-2">
                        {diagnostics.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 opacity-50">
                                <div className="text-4xl mb-2">🛡️</div>
                                <div>System Healthy</div>
                                <div className="text-[10px] mt-1">Immune system active & monitoring</div>
                            </div>
                        ) : (
                            diagnostics.map((diag) => (
                                <div key={diag.id} className="bg-[#161b22] border border-gray-700 p-3 rounded group hover:border-emerald-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${diag.type === 'error' ? 'bg-red-900/30 text-red-400 uppercase' :
                                            diag.type === 'warning' ? 'bg-yellow-900/30 text-yellow-400 uppercase' :
                                                'bg-blue-900/30 text-blue-400 uppercase'
                                            }`}>
                                            {diag.source}
                                        </span>
                                        {diag.fix.action !== 'ignore' && (
                                            <button
                                                onClick={() => handleFix(diag)}
                                                className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-900/50"
                                            >
                                                APPLY FIX
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-gray-300 font-medium mb-1 break-words">{diag.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-600 italic">
                        History logs not connected yet.
                    </div>
                )}
            </div>
        </div>
    );
}
