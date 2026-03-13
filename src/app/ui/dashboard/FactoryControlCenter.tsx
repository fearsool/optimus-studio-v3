'use client';

import React, { useState, useEffect } from 'react';
import {
    Play, Pause, RefreshCw, Upload, Download,
    Settings, AlertCircle, BarChart3, Cpu,
    Video, Package, Globe, Brain, Zap, Activity
} from 'lucide-react';
import { EnvironmentValidator } from '@/components/dashboard/EnvironmentValidator';
import { ActivityFeed } from './ActivityFeed';
import AgentMonitorDashboard from './AgentMonitorDashboard';

// -- UI Components --
const ChannelCard = ({ channel }: { channel: any }) => (
    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between border border-slate-600">
        <div>
            <div className="font-bold text-white mb-1 flex items-center gap-2">
                {channel.status === 'producing' && <Activity className="w-4 h-4 text-green-400 animate-pulse" />}
                {channel.name}
            </div>
            <div className="text-xs text-slate-400">Queue: {channel.queue} • Last: {channel.lastVideo}</div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${channel.status === 'producing' ? 'bg-green-500/20 text-green-400' :
            channel.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'
            }`}>
            {channel.status}
        </div>
    </div>
);

const PlatformStatus = ({ platform, status }: { platform: string, status: string }) => (
    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors">
        <span className="text-sm font-medium text-slate-300">{platform}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/10 text-red-500'
            }`}>
            {status.toUpperCase()}
        </span>
    </div>
);

const ResourceMeter = ({ label, value }: { label: string, value: number }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
        <div className="flex justify-between text-xs mb-2 text-slate-400">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
                className={`h-full transition-all duration-500 ${value > 90 ? 'bg-red-500' : value > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

const QuickAction = ({ icon, label, description }: { icon: any, label: string, description: string }) => (
    <button className="flex flex-col items-center p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group hover:scale-[1.02] active:scale-[0.98]">
        <div className="p-3 bg-slate-900 rounded-full mb-3 text-indigo-400 group-hover:text-indigo-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
            {icon}
        </div>
        <div className="font-bold text-sm text-white mb-1">{label}</div>
        <div className="text-[10px] text-slate-500 text-center">{description}</div>
    </button>
);

export const FactoryControlCenter = () => {
    const [hardware, setHardware] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [connectors, setConnectors] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [factoryStatus, setFactoryStatus] = useState({
        videoProduction: 'active',
        resourceUsage: { cpu: 0, gpu: 0, memory: 0, storage: 0 }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hardwareRes, templatesRes, connectorsRes] = await Promise.all([
                    fetch('/api/system/specs'),
                    fetch('/api/templates/all'),
                    fetch('/api/system/connectors')
                ]);

                const hardwareData = await hardwareRes.json();
                const templatesData = await templatesRes.json();
                const connectorsData = await connectorsRes.json();

                setHardware(hardwareData);
                setTemplates(templatesData.templates || []);
                setConnectors(connectorsData.connectors || {});

                setFactoryStatus(prev => ({
                    ...prev,
                    resourceUsage: {
                        ...prev.resourceUsage,
                        memory: hardwareData ? (100 - (parseFloat(hardwareData.freeRAM_GB) / parseFloat(hardwareData.totalRAM_GB) * 100)) : 0,
                        cpu: hardwareData ? (hardwareData.cpuCores * 8) : 0 // Mocking CPU load
                    }
                }));
            } catch (error) {
                console.error('Data fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const videoChannels = [
        { id: 1, name: 'Space Facts (Tuhaf Gerçekler)', status: 'producing', queue: 3, lastVideo: '2 hours ago' },
        { id: 2, name: 'Motivation Daily', status: 'paused', queue: 0, lastVideo: '1 day ago' },
        { id: 3, name: 'Future Tech', status: 'producing', queue: 5, lastVideo: '1 hour ago' }
    ];

    return (
        <div className="h-full bg-[#0F1117] text-white p-6 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        🏭 OmniFlow Factory OS
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">v1.0 - Optimus Prime Edition | 700+ Templates Ready</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 rounded-lg flex items-center gap-2 transition-all font-medium">
                        <Play size={16} /> Start All
                    </button>
                    <button className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/50 rounded-lg flex items-center gap-2 transition-all font-medium">
                        <Pause size={16} /> Emergency Stop
                    </button>
                </div>
            </div>

            {/* Factory Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Production Line */}
                <div className="bg-[#1a1f2e] p-6 rounded-xl border border-slate-800 shadow-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
                        <Video className="w-5 h-5" /> Video Production Line
                    </h3>
                    <div className="space-y-3">
                        {videoChannels.map(channel => (
                            <ChannelCard key={channel.id} channel={channel} />
                        ))}
                    </div>
                </div>

                {/* Automation Workshop / Templates */}
                <div className="bg-[#1a1f2e] p-6 rounded-xl border border-slate-800 shadow-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
                        <Package className="w-5 h-5" /> Automation Workshop
                    </h3>
                    <div className="flex flex-col items-center justify-center h-32 bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
                        <div className="text-3xl font-bold text-white mb-1">{templates.length}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Active Templates</div>
                    </div>
                    <div className="mt-6 flex gap-2">
                        <button className="flex-1 py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-all text-sm font-medium">
                            Browse All
                        </button>
                        <button className="flex-1 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all text-sm font-medium">
                            Scout New
                        </button>
                    </div>
                </div>

                {/* Connectors Status */}
                <div className="bg-[#1a1f2e] p-6 rounded-xl border border-slate-800 shadow-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400">
                        <Globe className="w-5 h-5" /> Cloud Connectors
                    </h3>
                    <div className="space-y-2 mb-6">
                        {connectors && Object.entries(connectors).map(([key, data]: [string, any]) => (
                            <PlatformStatus key={key} platform={data.name} status={data.status} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                    icon={<Zap />}
                    label="Run Factory"
                    description="Manual production start"
                />
                <QuickAction
                    icon={<RefreshCw />}
                    label="Reload Store"
                    description="Update template list"
                />
                <QuickAction
                    icon={<BarChart3 />}
                    label="Profits"
                    description="View revenue analytics"
                />
                <QuickAction
                    icon={<AlertCircle />}
                    label="Help"
                    description="System documentation"
                />
            </div>
        </div>
    );
};
