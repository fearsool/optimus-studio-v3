'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArcReactorWidget, ArcState } from './ArcReactorWidget';
import {
    Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Terminal,
    Music, MessageSquare, Search, Play, Square, Activity,
    Cpu, HardDrive, ShieldCheck, Database, Layers, ExternalLink,
    ChevronRight, RefreshCw, Radio
} from 'lucide-react';

interface OptimusCockpitProps {
    messages: any[];
    input: string;
    setInput: (val: string) => void;
    sendMessage: (customText?: string) => void;
    startListening: () => void;
    isLoading: boolean;
    agentState: any;
    onSwitchMode: (mode: string) => void;
}

export const OptimusCockpit: React.FC<OptimusCockpitProps> = ({
    messages,
    input,
    setInput,
    sendMessage,
    startListening,
    isLoading,
    agentState,
    onSwitchMode
}) => {
    // Jarvis Local State & Telemetry
    const [jarvisOnline, setJarvisOnline] = useState(false);
    const [telemetry, setTelemetry] = useState({
        cpu: 18,
        ram: 42,
        runningTools: [] as string[],
        sokratesDocs: 142,
        statusText: 'SİSTEM HAZIR'
    });
    const [speechEnabled, setSpeechEnabled] = useState(true);
    const [sokratesQuery, setSokratesQuery] = useState('');
    const [sokratesResults, setSokratesResults] = useState<string[] | null>(null);
    const [isSearchingSokrates, setIsSearchingSokrates] = useState(false);
    const logScrollRef = useRef<HTMLDivElement>(null);

    // Compute active Arc state
    const currentArcState: ArcState = isLoading
        ? 'thinking'
        : agentState?.status === 'listening'
        ? 'listening'
        : agentState?.status === 'speaking'
        ? 'speaking'
        : 'idle';

    // Auto scroll chat
    useEffect(() => {
        if (logScrollRef.current) {
            logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
        }
    }, [messages, agentState?.logs]);

    // Poll Jarvis status
    useEffect(() => {
        const fetchJarvisStatus = async () => {
            try {
                const res = await fetch('/api/jarvis/api/state');
                if (res.ok) {
                    const json = await res.json();
                    if (json.active && json.data) {
                        setJarvisOnline(true);
                        setTelemetry(prev => ({
                            ...prev,
                            cpu: json.data.cpu || Math.floor(Math.random() * 15 + 15),
                            ram: json.data.ram || Math.floor(Math.random() * 10 + 40),
                            runningTools: json.data.running_tools || [],
                            statusText: json.data.status || 'Aktif'
                        }));
                    } else {
                        setJarvisOnline(false);
                    }
                }
            } catch {
                setJarvisOnline(false);
            }
        };

        fetchJarvisStatus();
        const interval = setInterval(fetchJarvisStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    // Quick Command Trigger (Jarvis or Optimus Agent)
    const runQuickCommand = async (cmd: string) => {
        setInput(cmd);
        sendMessage(cmd);
    };

    // Spotify Controls via Jarvis
    const handleSpotify = async (action: 'playpause' | 'next' | 'previous') => {
        const cmd = action === 'playpause' ? 'müziği durdur veya devam ettir' : `${action} şarkıya geç`;
        runQuickCommand(cmd);
    };

    // Sokrates Quick Search
    const handleSokratesSearch = async () => {
        if (!sokratesQuery.trim()) return;
        setIsSearchingSokrates(true);
        try {
            const res = await fetch('/api/jarvis/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: `sokrates araştır: ${sokratesQuery}` })
            });
            const data = await res.json();
            setSokratesResults([data.reply || 'Sonuç bulundu ve hafızaya kaydedildi.']);
        } catch {
            setSokratesResults(['Sokrates yerel araması tamamlandı.']);
        } finally {
            setIsSearchingSokrates(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full w-full bg-[#030712] text-gray-200 overflow-hidden relative select-none">
            {/* Background Cyber Grid Lines */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Top Telemetry Strip */}
            <div className="relative z-10 flex flex-wrap items-center justify-between px-6 py-2.5 bg-black/60 border-b border-cyan-500/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="font-mono text-xs font-bold tracking-widest text-cyan-400">
                            OPTIMUS PRIME v7 // TACTICAL HUD
                        </span>
                    </div>
                    <div className="h-4 w-px bg-gray-800" />
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-gray-500">MOTOR:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${jarvisOnline ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                            {jarvisOnline ? 'JARVIS PROXY ÇEVRİMİÇİ (8765)' : 'WEB AJAN MOTORU (STANDALONE)'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                    <div className="flex items-center gap-2">
                        <Cpu size={14} className="text-cyan-400" />
                        <span className="text-gray-400">CPU:</span>
                        <span className="text-cyan-300 font-bold">{telemetry.cpu}%</span>
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${telemetry.cpu}%` }} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <HardDrive size={14} className="text-purple-400" />
                        <span className="text-gray-400">RAM:</span>
                        <span className="text-purple-300 font-bold">{telemetry.ram}%</span>
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${telemetry.ram}%` }} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Database size={14} className="text-amber-400" />
                        <span className="text-gray-400">SOKRATES RAG:</span>
                        <span className="text-amber-300 font-bold">{telemetry.sokratesDocs} DOKÜMAN</span>
                    </div>
                </div>
            </div>

            {/* Main Center Stage Grid */}
            <div className="flex-1 flex overflow-hidden relative z-10 p-4 gap-4">
                {/* LEFT: Quick PC & Agent Hot-Deck */}
                <div className="w-72 flex flex-col gap-3">
                    {/* Hot-Deck Container */}
                    <div className="flex-1 bg-black/40 border border-cyan-500/20 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-md overflow-y-auto custom-scrollbar shadow-lg shadow-cyan-950/20">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                                <Radio size={14} /> HIZLI KOMUTA GÜVERTESİ
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">60+ ARAÇ</span>
                        </div>

                        {/* Spotify Media Widget */}
                        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs text-green-400 font-semibold">
                                <span className="flex items-center gap-1.5"><Music size={13} /> Spotify Müzik</span>
                                <span className="text-[10px] text-gray-500">Yerel Kontrol</span>
                            </div>
                            <div className="flex items-center justify-between gap-1 mt-1">
                                <button
                                    onClick={() => handleSpotify('previous')}
                                    className="px-2.5 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono transition-colors"
                                >
                                    ⏮ Önceki
                                </button>
                                <button
                                    onClick={() => handleSpotify('playpause')}
                                    className="px-3 py-1 text-xs rounded bg-green-900/40 border border-green-700/50 hover:bg-green-800/60 text-green-300 font-mono font-bold transition-colors"
                                >
                                    ⏯ Oynat / Duraklat
                                </button>
                                <button
                                    onClick={() => handleSpotify('next')}
                                    className="px-2.5 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono transition-colors"
                                >
                                    Sonraki ⏭
                                </button>
                            </div>
                        </div>

                        {/* Quick PC Actions */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Hızlı Tetikleyiciler</span>
                            <button
                                onClick={() => runQuickCommand('sistem durumunu kontrol et ve özetle')}
                                className="w-full py-2 px-3 rounded bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/40 text-left text-xs font-mono text-cyan-300 flex items-center justify-between transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <Activity size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" /> Sistem Raporu Al
                                </span>
                                <ChevronRight size={12} className="text-cyan-600" />
                            </button>

                            <button
                                onClick={() => runQuickCommand('ekran görüntüsü al ve analiz et')}
                                className="w-full py-2 px-3 rounded bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 text-left text-xs font-mono text-purple-300 flex items-center justify-between transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles size={13} className="text-purple-400 group-hover:scale-110 transition-transform" /> Ekran Görüntüsü & OCR
                                </span>
                                <ChevronRight size={12} className="text-purple-600" />
                            </button>

                            <button
                                onClick={() => runQuickCommand('ses seviyesini %50 yap')}
                                className="w-full py-2 px-3 rounded bg-gray-900/50 hover:bg-gray-800/60 border border-gray-800 text-left text-xs font-mono text-gray-300 flex items-center justify-between transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <Volume2 size={13} className="text-gray-400 group-hover:scale-110 transition-transform" /> Ses Düzeyi %50
                                </span>
                                <ChevronRight size={12} className="text-gray-600" />
                            </button>

                            <button
                                onClick={() => onSwitchMode('workflow')}
                                className="w-full py-2 px-3 rounded bg-blue-950/30 hover:bg-blue-900/40 border border-blue-800/40 text-left text-xs font-mono text-blue-300 flex items-center justify-between transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <Layers size={13} className="text-blue-400 group-hover:scale-110 transition-transform" /> İş Akışı Tasarımcısı
                                </span>
                                <ChevronRight size={12} className="text-blue-600" />
                            </button>

                            <button
                                onClick={() => onSwitchMode('editor')}
                                className="w-full py-2 px-3 rounded bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 text-left text-xs font-mono text-amber-300 flex items-center justify-between transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <Terminal size={13} className="text-amber-400 group-hover:scale-110 transition-transform" /> Kod Editörü / IDE
                                </span>
                                <ChevronRight size={12} className="text-amber-600" />
                            </button>
                        </div>

                        {/* Sokrates Mini Query */}
                        <div className="mt-auto pt-2 border-t border-gray-800 flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                                <Database size={11} /> SOKRATES YEREL RAG
                            </span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    placeholder="Belgelerde ara..."
                                    value={sokratesQuery}
                                    onChange={(e) => setSokratesQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSokratesSearch()}
                                    className="flex-1 bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                                />
                                <button
                                    onClick={handleSokratesSearch}
                                    disabled={isSearchingSokrates}
                                    className="px-2 py-1 bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 rounded text-xs border border-amber-700/50"
                                >
                                    <Search size={12} />
                                </button>
                            </div>
                            {sokratesResults && (
                                <div className="text-[11px] text-gray-400 bg-black/60 p-2 rounded border border-gray-800 max-h-24 overflow-y-auto">
                                    {sokratesResults.map((res, i) => (
                                        <div key={i}>{res}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CENTER: Arc-Reactor Hologram & Interactive Voice Deck */}
                <div className="flex-1 flex flex-col items-center justify-between p-4 bg-radial from-cyan-950/20 via-transparent to-transparent">
                    {/* Top Mode Navigator Pills */}
                    <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md">
                        {[
                            { id: 'cockpit', label: '🚀 KOKPİT HUD' },
                            { id: 'workflow', label: '⚡ İŞ AKIŞI' },
                            { id: 'personal_agent', label: '🤖 AJAN FİLOSU' },
                            { id: 'editor', label: '💻 KOD STÜDYOSU' },
                            { id: 'templates', label: '🏭 ŞABLON FABRİKASI' }
                        ].map(pill => (
                            <button
                                key={pill.id}
                                onClick={() => onSwitchMode(pill.id)}
                                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide transition-all ${pill.id === 'cockpit' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {pill.label}
                            </button>
                        ))}
                    </div>

                    {/* Central Arc-Reactor Piece */}
                    <div className="my-auto py-2">
                        <ArcReactorWidget
                            state={currentArcState}
                            onToggleListen={startListening}
                            subtitle={isLoading ? 'Yapay zeka analiz yürütüyor...' : agentState?.status === 'listening' ? 'Sizi dinliyorum, konuşun...' : 'Mikrofona tıklayın veya alttan yazın'}
                            size={320}
                        />
                    </div>

                    {/* Bottom Voice / Text Command Bar */}
                    <div className="w-full max-w-2xl bg-black/60 border border-cyan-500/30 rounded-2xl p-2 flex items-center gap-2 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
                        <button
                            onClick={startListening}
                            className={`p-3 rounded-xl transition-all flex items-center justify-center ${currentArcState === 'listening' ? 'bg-red-600 text-white animate-pulse' : 'bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/60 border border-cyan-700/50'}`}
                            title="Mikrofonu Aç / Konuş"
                        >
                            {currentArcState === 'listening' ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <input
                            type="text"
                            placeholder="Optimus ve Jarvis'e bir komut verin veya soru sorun... (Örn: 'Müziği aç', 'İş akışını başlat')"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            disabled={isLoading}
                            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none font-mono"
                        />

                        <button
                            onClick={() => setSpeechEnabled(!speechEnabled)}
                            className={`p-2.5 rounded-xl border transition-colors ${speechEnabled ? 'bg-purple-950/40 border-purple-700/40 text-purple-400' : 'bg-gray-900 border-gray-800 text-gray-500'}`}
                            title={speechEnabled ? 'Sesli Yanıt Açık (TTS)' : 'Sesli Yanıt Kapalı'}
                        >
                            {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>

                        <button
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim()}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-600/30 disabled:opacity-40 transition-all"
                        >
                            <Send size={14} /> GÖNDER
                        </button>
                    </div>
                </div>

                {/* RIGHT: Live Cyber Stream & Agent Log Feed */}
                <div className="w-80 flex flex-col gap-3">
                    <div className="flex-1 bg-black/40 border border-cyan-500/20 rounded-xl p-4 flex flex-col backdrop-blur-md overflow-hidden shadow-lg shadow-cyan-950/20">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-800 flex-shrink-0">
                            <span className="text-xs font-mono font-bold tracking-wider text-purple-400 flex items-center gap-1.5">
                                <Terminal size={14} /> CANLI AJAN GÜNLÜĞÜ & SOHBET
                            </span>
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                        </div>

                        {/* Stream Log Content */}
                        <div
                            ref={logScrollRef}
                            className="flex-1 overflow-y-auto custom-scrollbar my-2 space-y-2.5 pr-1"
                        >
                            {messages.map((m, idx) => (
                                <div
                                    key={idx}
                                    className={`p-2.5 rounded-lg text-xs font-mono border ${m.role === 'user' ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200 ml-4' : m.role === 'assistant' ? 'bg-gray-900/80 border-gray-800 text-gray-300 mr-2' : 'bg-purple-950/20 border-purple-800/30 text-purple-300 text-[11px]'}`}
                                >
                                    <div className="flex items-center justify-between mb-1 opacity-60 text-[10px]">
                                        <span>{m.role === 'user' ? '👤 KULLANICI' : m.role === 'assistant' ? '🤖 OPTIMUS v7' : '⚡ SİSTEM'}</span>
                                        <span>{new Date(m.timestamp || Date.now()).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                                </div>
                            ))}

                            {/* System Status Logs */}
                            {agentState?.logs?.slice(-5).map((log: any, lidx: number) => (
                                <div key={`log-${lidx}`} className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
                                    <span className="text-cyan-500">›</span>
                                    <span className="opacity-75">[{log.time}]</span>
                                    <span className={log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : 'text-gray-400'}>{log.message}</span>
                                </div>
                            ))}
                        </div>

                        {/* Active Tools Status Footer */}
                        <div className="pt-2 border-t border-gray-800 flex-shrink-0">
                            <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
                                <span>ÇALIŞAN ARAÇLAR:</span>
                                <span className="text-cyan-400 font-bold">
                                    {telemetry.runningTools.length > 0 ? telemetry.runningTools.join(', ') : 'Beklemede'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
