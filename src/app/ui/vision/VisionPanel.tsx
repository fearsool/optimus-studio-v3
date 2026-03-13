
'use client';

import { useEffect, useState } from 'react';

export const VisionPanel = () => {
    const [activations, setActivations] = useState<number[]>([0.3, 0.7, 0.5, 0.9, 0.2]);
    const [layers, setLayers] = useState([
        { name: 'Input', neurons: 5 },
        { name: 'Hidden 1', neurons: 8 },
        { name: 'Hidden 2', neurons: 6 },
        { name: 'Output', neurons: 3 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setActivations(prev =>
                prev.map(val => Math.max(0, Math.min(1, val + (Math.random() - 0.5) * 0.3)))
            );
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
                        <h2 className="text-xl font-bold text-white">Neural Vision</h2>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-auto">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left: Neural Network Visualization */}
                        <div className="space-y-6">
                            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                                <h3 className="text-white font-medium mb-4">Neural Activations</h3>
                                <div className="space-y-3">
                                    {layers.map((layer, layerIndex) => (
                                        <div key={layerIndex} className="space-y-2">
                                            <div className="text-sm text-gray-400">{layer.name}</div>
                                            <div className="flex gap-1">
                                                {Array.from({ length: layer.neurons }).map((_, neuronIndex) => {
                                                    const activation = activations[(layerIndex + neuronIndex) % activations.length];
                                                    return (
                                                        <div
                                                            key={neuronIndex}
                                                            className="flex-1 h-8 rounded bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 overflow-hidden"
                                                        >
                                                            <div
                                                                className="h-full bg-gradient-to-b from-cyan-500 to-cyan-400 transition-all duration-300"
                                                                style={{ width: `${activation * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                                <h3 className="text-white font-medium mb-4">Vision Controls</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Attention Focus</label>
                                        <input type="range" min="0" max="100" className="w-full" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm">
                                            Analyze
                                        </button>
                                        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">
                                            Generate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Visualization Output */}
                        <div className="space-y-6">
                            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                                <h3 className="text-white font-medium mb-4">Pattern Recognition</h3>
                                <div className="aspect-square bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-[#30363d] flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-6xl mb-2">🧠</div>
                                        <div className="text-gray-400 text-sm">Visualizing patterns...</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                                <h3 className="text-white font-medium mb-4">Insights</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-gray-300">High confidence in code patterns</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                        <span className="text-gray-300">Potential optimization detected</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-gray-300">Learning from 156 samples</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
