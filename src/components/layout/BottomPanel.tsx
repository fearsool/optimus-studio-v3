// src/components/layout/BottomPanel.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
    Terminal, FileText, Workflow, Bot, Video,
    AlignLeft, ChevronDown, Maximize2, Settings,
    ArrowLeft, ArrowRight, X, Plus
} from 'lucide-react';

const TABS = [
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={12} />, tooltip: 'Komut satırı terminali' },
    { id: 'system-logs', label: 'Sistem Günlükleri', icon: <FileText size={12} />, tooltip: 'Sunucu ve sistem logları' },
    { id: 'workflow-console', label: 'İş Akışı Konsolu', icon: <Workflow size={12} />, tooltip: 'Çalışan iş akışının çıktıları' },
    { id: 'agent-tasks', label: 'Ajan Görevleri', icon: <Bot size={12} />, tooltip: 'Aktif ajan görevleri' },
    { id: 'render-queue', label: 'Render Sırası', icon: <Video size={12} />, tooltip: 'Bekleyen render görevleri' },
];

interface LogLine { type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'prompt'; text: string; }
const COLOR: Record<string, string> = {
    info: 'var(--text-secondary)', success: '#10b981',
    warning: '#f59e0b', error: '#f87171',
    system: '#60a5fa', prompt: 'var(--text-muted)',
};

export const BottomPanel = () => {
    const [activeTab, setActiveTab] = useState('terminal');
    const [lines, setLines] = useState<LogLine[]>([
        { type: 'system', text: 'Optimus Studio v3.1 — Hibrit Ajan Terminali' },
        { type: 'success', text: '✓ Geliştirme sunucusu hazır: http://localhost:3025' },
        { type: 'info', text: 'İstemci ve sunucu 1241 ms\'de derlendi (154 modül)' },
        { type: 'prompt', text: '' },
    ]);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const addLine = (line: LogLine) => setLines(prev => [...prev.slice(-200), line]);

    const handleCommand = (cmd: string) => {
        addLine({ type: 'prompt', text: `$ ${cmd}` });
        const lower = cmd.trim().toLowerCase();
        if (lower === 'clear' || lower === 'temizle') {
            setLines([{ type: 'prompt', text: '' }]);
        } else if (lower.startsWith('npm run')) {
            addLine({ type: 'info', text: `> Çalıştırılıyor: ${cmd}...` });
            setTimeout(() => addLine({ type: 'success', text: '✓ Tamamlandı.' }), 600);
        } else if (lower === 'yardım' || lower === 'help') {
            addLine({ type: 'info', text: 'Komutlar: temizle | npm run dev | npm run build | yardım' });
        } else if (lower === 'versiyon' || lower === 'version') {
            addLine({ type: 'success', text: 'Optimus Studio v3.1.0 — Node v18.17.0' });
        } else {
            addLine({ type: 'warning', text: `Komut bulunamadı: ${cmd}. "yardım" yazın.` });
        }
        setInput('');
    };

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

    return (
        <div className="flex flex-col h-full" style={{ background: 'var(--bg-deep)' }}>
            {/* Tab bar */}
            <div className="flex items-center h-8 flex-shrink-0 overflow-x-auto"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <button className="icon-btn flex-shrink-0 ml-1" style={{ width: 24, height: 24 }} title="Menü">
                    <AlignLeft size={12} />
                </button>
                <div className="flex items-center h-full overflow-x-auto" style={{ paddingLeft: 4 }}>
                    {TABS.map(tab => (
                        <button key={tab.id} title={tab.tooltip}
                            className="wf-tab"
                            style={{
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-green)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                                height: 32, padding: '0 12px', fontSize: 11,
                            }}
                            onClick={() => setActiveTab(tab.id)}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-1 px-2 flex-shrink-0">
                    <button className="icon-btn" style={{ width: 22, height: 22 }} title="Önceki"><ArrowLeft size={11} /></button>
                    <button className="icon-btn" style={{ width: 22, height: 22 }} title="Sonraki"><ArrowRight size={11} /></button>
                    <button className="icon-btn" style={{ width: 22, height: 22 }} title="Yeni terminal"><Plus size={11} /></button>
                    <button className="icon-btn" style={{ width: 22, height: 22 }} title="Büyüt"><Maximize2 size={11} /></button>
                    <button className="icon-btn" style={{ width: 22, height: 22 }} title="Terminal ayarları"><Settings size={11} /></button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'terminal' && (
                    <>
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar"
                            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, lineHeight: 1.6 }}>
                            {lines.map((line, i) => (
                                <div key={i} style={{ color: COLOR[line.type] || 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                    {line.text === '' ? (
                                        <span>
                                            <span style={{ color: '#10b981' }}>➜</span>{' '}
                                            <span style={{ color: '#60a5fa' }}>~/optimus-studio</span>{' '}
                                            <span className="blink">█</span>
                                        </span>
                                    ) : line.text}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
                            style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <span style={{ color: '#10b981', fontFamily: 'monospace', fontSize: 11 }}>➜</span>
                            <input
                                className="flex-1 bg-transparent outline-none"
                                style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && input.trim()) handleCommand(input.trim()); }}
                                placeholder='Komut girin... ("yardım" yazın)'
                            />
                        </div>
                    </>
                )}
                {activeTab === 'system-logs' && (
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar"
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, lineHeight: 1.8 }}>
                        {[
                            { c: '#60a5fa', t: 'ModelOrchestrator başlatıldı' },
                            { c: 'var(--text-muted)', t: 'Qwen2.5-Coder yükleniyor...' },
                            { c: '#10b981', t: 'Model yüklendi (VRAM: 4.2GB)' },
                            { c: 'var(--text-muted)', t: 'Webhook dinleyici :4000\'de aktif' },
                            { c: '#f59e0b', t: 'Rate limit eşiği %80\'de' },
                        ].map((l, i) => <div key={i} style={{ color: l.c }}>[{new Date().toLocaleTimeString('tr-TR')}] {l.t}</div>)}
                    </div>
                )}
                {activeTab === 'workflow-console' && (
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar"
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, lineHeight: 1.8 }}>
                        <div style={{ color: 'var(--text-muted)' }}>İş akışı çalıştırılması bekleniyor...</div>
                        <div style={{ color: '#60a5fa' }}>→ Node'ları bağlayın ve ▶ Çalıştır'a basın</div>
                    </div>
                )}
                {activeTab === 'agent-tasks' && (
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                        <div className="text-xs py-2 flex items-center gap-2"
                            style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                            Ajan bekleme modunda — Aktif görev yok
                        </div>
                    </div>
                )}
                {activeTab === 'render-queue' && (
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Render sırası boş. Çıktı dosyası oluşturmak için bir otomasyon çalıştırın.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
