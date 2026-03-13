import React, { useState, useEffect } from 'react';
import { SalesData, ProductionStatus, SecurityReport } from '../../../types';
// import { OmniFlowDigitalFactory } from '../../../factory/OmniFlowDigitalFactory'; // Can't import directly in client component usually, assume API or use client-side logic if applicable

// Stub components for visuals if not available
const Card = ({ children, className }: any) => <div className={`border p-4 rounded ${className}`}>{children}</div>;
const Button = ({ children, onClick, className }: any) => <button onClick={onClick} className={`bg-blue-600 text-white px-4 py-2 rounded ${className}`}>{children}</button>;

export default function FactoryDashboard() {
    const [sales, setSales] = useState<SalesData>({ total: 0, today: 0 });
    const [status, setStatus] = useState<ProductionStatus>('idle');
    const [securityScore, setSecurityScore] = useState<number>(100);
    const [logs, setLogs] = useState<string[]>([]);

    // Real-time updates from Agent API
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/agent/status');
                const data = await res.json();

                if (data.status === 'running') {
                    setStatus('running');
                } else {
                    setStatus('idle');
                }
            } catch (e) {
                setStatus('error' as any);
            }
        };

        const interval = setInterval(() => {
            fetchStatus();
            // Mock sales data continues for demo purposes
            setSales(prev => ({
                total: prev.total + Math.random() * 2,
                today: prev.today + Math.random() * 0.5
            }));
        }, 5000);

        fetchStatus(); // Initial fetch

        return () => clearInterval(interval);
    }, []);

    const startProduction = async () => {
        setStatus('starting');
        setLogs(prev => ['🏭 Üretim başlatılıyor...', ...prev]);

        setTimeout(() => {
            setStatus('running');
            setLogs(prev => ['✅ Fabrika tam kapasite çalışıyor', ...prev]);
        }, 2000);

        // API Call Stub
        // await factory.massProduceAllTemplates();
    };

    return (
        <div className="p-6 bg-slate-900 min-h-screen text-white">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Optimus Digital Factory™
                    </h1>
                    <p className="text-slate-400">Autonomous Business Operations Center</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-slate-800 px-4 py-2 rounded-lg">
                        <span className="text-xs text-slate-500 block">GÜVENLİK SKORU</span>
                        <span className="text-xl font-bold text-green-400">🛡️ {securityScore}/100</span>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg">
                        <span className="text-xs text-slate-500 block">SİSTEM DURUMU</span>
                        <span className={`text-xl font-bold ${status === 'running' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {status === 'running' ? '🟢 AKTİF' : '🟡 BEKLEMEDE'}
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-slate-800 border-slate-700">
                    <h3 className="text-slate-400 mb-2">Toplam Gelir</h3>
                    <div className="text-4xl font-bold text-green-400">
                        ${sales.total.toFixed(2)}
                    </div>
                    <p className="text-green-500 text-sm mt-2">↑ %15 artış (Geçen hafta)</p>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <h3 className="text-slate-400 mb-2">Bugünkü Satış</h3>
                    <div className="text-4xl font-bold text-blue-400">
                        ${sales.today.toFixed(2)}
                    </div>
                    <p className="text-slate-500 text-sm mt-2">Hedef: $500/gün</p>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <h3 className="text-slate-400 mb-2">Aktif Kanallar</h3>
                    <div className="text-4xl font-bold text-purple-400">
                        12
                    </div>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-blue-900/50 rounded text-xs">Stripe</span>
                        <span className="px-2 py-1 bg-yellow-900/50 rounded text-xs">PayPal</span>
                        <span className="px-2 py-1 bg-orange-900/50 rounded text-xs">BTC</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700 h-96">
                    <h3 className="font-bold mb-4 flex justify-between">
                        <span>Canlı Üretim Logları</span>
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded animate-pulse">CANLI</span>
                    </h3>
                    <div className="space-y-2 overflow-y-auto h-80 font-mono text-sm">
                        {logs.map((log, i) => (
                            <div key={i} className="border-b border-slate-700 pb-2 text-slate-300">
                                {log}
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <h3 className="font-bold mb-4">Hızlı Aksiyonlar</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={startProduction} className="w-full py-4 text-lg bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700">
                                🚀 Fabrikayı Başlat
                            </Button>
                            <Button className="w-full py-4 text-lg bg-slate-700 hover:bg-slate-600">
                                ⏸️ Üretimi Durdur
                            </Button>
                            <Button className="w-full bg-slate-700 hover:bg-slate-600">
                                📊 Finansal Rapor
                            </Button>
                            <Button className="w-full bg-slate-700 hover:bg-slate-600">
                                🔍 Güvenlik Taraması
                            </Button>
                        </div>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <h3 className="font-bold mb-4">Yapay Zeka Asistanı</h3>
                        <div className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300">
                            <p>🤖 <strong>Optimus AI:</strong> Şu anda "Instagram Otomasyonu" kategorisindeki ürünler %24 daha fazla ilgi görüyor. Üretim bandını bu kategoriye kaydırmamı ister misiniz?</p>
                            <div className="mt-4 flex gap-2">
                                <button className="px-3 py-1 bg-blue-600 rounded text-xs">Evet, Onayla</button>
                                <button className="px-3 py-1 bg-slate-700 rounded text-xs">Hayır, Devam Et</button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
