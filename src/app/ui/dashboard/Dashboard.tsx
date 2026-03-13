
'use client';

import { useState, useEffect } from 'react';

export const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        videosProduced: 0,
        automationsCreated: 0,
        revenue: 0,
        systemHealth: 100
    });

    useEffect(() => {
        // Simulate live updates
        const interval = setInterval(() => {
            setMetrics(prev => ({
                videosProduced: prev.videosProduced + Math.floor(Math.random() * 3),
                automationsCreated: prev.automationsCreated + Math.floor(Math.random() * 2),
                revenue: prev.revenue + Math.floor(Math.random() * 50),
                systemHealth: Math.min(100, Math.max(0, prev.systemHealth + (Math.random() > 0.5 ? 1 : -1)))
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const systems = [
        { name: 'Video Factory', status: 'running', color: 'green' },
        { name: 'Automation Scout', status: 'running', color: 'green' },
        { name: 'AI Models', status: 'running', color: 'green' },
        { name: 'Distribution Network', status: 'idle', color: 'yellow' },
        { name: 'Self-Healing', status: 'running', color: 'green' },
    ];

    return (
        <div className="h-full w-full overflow-auto p-6 bg-[#0d1117]">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Factory Dashboard</h1>
                    <p className="text-gray-400">Real-time monitoring of all systems</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                        <div className="text-gray-400 text-sm mb-2">Videos Produced</div>
                        <div className="text-3xl font-bold text-white">{metrics.videosProduced}</div>
                        <div className="text-green-400 text-sm mt-2">+12 today</div>
                    </div>

                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                        <div className="text-gray-400 text-sm mb-2">Automations Created</div>
                        <div className="text-3xl font-bold text-white">{metrics.automationsCreated}</div>
                        <div className="text-blue-400 text-sm mt-2">+5 today</div>
                    </div>

                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                        <div className="text-gray-400 text-sm mb-2">Estimated Revenue</div>
                        <div className="text-3xl font-bold text-white">${metrics.revenue}</div>
                        <div className="text-green-400 text-sm mt-2">+$156 today</div>
                    </div>

                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                        <div className="text-gray-400 text-sm mb-2">System Health</div>
                        <div className="text-3xl font-bold text-white">{metrics.systemHealth}%</div>
                        <div className="text-green-400 text-sm mt-2">Optimal</div>
                    </div>
                </div>

                {/* Systems Status */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
                    <div className="space-y-3">
                        {systems.map((system, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${system.color === 'green' ? 'bg-green-500' :
                                            system.color === 'yellow' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                        }`}></div>
                                    <span className="text-white">{system.name}</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${system.status === 'running' ? 'bg-green-900/30 text-green-400' :
                                        system.status === 'idle' ? 'bg-yellow-900/30 text-yellow-400' :
                                            'bg-red-900/30 text-red-400'
                                    }`}>
                                    {system.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors">
                        Start Video Production
                    </button>
                    <button className="p-4 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-colors">
                        Scout Automations
                    </button>
                    <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors">
                        Run Diagnostics
                    </button>
                </div>
            </div>
        </div>
    );
};
