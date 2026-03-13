'use client'

import { useState, useEffect } from 'react'

interface AgentStatus {
    status: 'active' | 'inactive' | 'error'
    cpu: number
    memory: number
    tasks: number
    lastActive: string
}

export default function AgentMonitorDashboard() {
    const [status, setStatus] = useState<AgentStatus>({
        status: 'active',
        cpu: 24,
        memory: 65,
        tasks: 12,
        lastActive: new Date().toISOString()
    })

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(prev => ({
                ...prev,
                cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 10)),
                memory: Math.min(100, Math.max(0, prev.memory + (Math.random() - 0.5) * 5)),
                tasks: Math.max(0, prev.tasks + Math.floor(Math.random() * 3 - 1)),
                lastActive: new Date().toISOString()
            }))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.status === 'active' ? 'bg-green-500 animate-pulse' : status.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <h3 className="text-xl font-bold">Optimus Agent v3.0</h3>
                </div>
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                    OTONOM
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">CPU Kullanımı</p>
                    <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span>{status.cpu.toFixed(1)}%</span>
                            <span className="text-gray-500">100%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${status.cpu}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Bellek Kullanımı</p>
                    <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span>{status.memory.toFixed(1)}%</span>
                            <span className="text-gray-500">100%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                                style={{ width: `${status.memory}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Aktif Görevler</p>
                    <p className="text-3xl font-bold mt-2">{status.tasks}</p>
                    <p className="text-xs text-gray-500 mt-1">işlemde</p>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Son Aktivite</p>
                    <p className="text-lg font-semibold mt-2">
                        {new Date(status.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">az önce</p>
                </div>
            </div>

            <div className="bg-gray-900/30 rounded-xl p-4">
                <h4 className="font-medium mb-3">📈 Sistem Aktivitesi</h4>
                <div className="space-y-3">
                    <ActivityItem label="Kod Analizi" status="running" />
                    <ActivityItem label="Güvenlik Taraması" status="completed" />
                    <ActivityItem label="Performans Optimizasyonu" status="pending" />
                    <ActivityItem label="Öğrenme Modülü" status="running" />
                </div>
            </div>
        </div>
    )
}

function ActivityItem({ label, status }: { label: string; status: 'running' | 'completed' | 'pending' }) {
    const statusConfig = {
        running: { color: 'text-blue-400', bg: 'bg-blue-400/20', icon: '↻' },
        completed: { color: 'text-green-400', bg: 'bg-green-400/20', icon: '✓' },
        pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: '⏳' }
    }

    const config = statusConfig[status]

    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50">
            <span className="text-sm">{label}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                {config.icon} {status === 'running' ? 'çalışıyor' : status === 'completed' ? 'tamamlandı' : 'bekliyor'}
            </span>
        </div>
    )
}
