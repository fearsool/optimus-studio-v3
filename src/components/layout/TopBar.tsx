// src/components/layout/TopBar.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
    Play, ChevronDown, ChevronRight, Copy, Download, Upload,
    Bug, Search, Settings, Bell, MoreHorizontal, Zap,
    PanelLeft, PanelRight, PanelBottom, RefreshCw, FileJson,
    HelpCircle, BookOpen
} from 'lucide-react';

interface TopBarProps {
    activeMode: string;
    onModeChange: (mode: string) => void;
    projectName?: string;
    showLeft?: boolean;
    showRight?: boolean;
    showBottom?: boolean;
    toggleLeft?: () => void;
    toggleRight?: () => void;
    toggleBottom?: () => void;
    onShowGuide?: () => void;
}

const Tip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div className="relative group inline-flex">
        {children}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs pointer-events-none whitespace-nowrap z-50
            opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-normal)', color: 'var(--text-primary)' }}>
            {text}
        </div>
    </div>
);

export const TopBar = ({
    activeMode, onModeChange,
    projectName = 'Lead Generation Automation',
    showLeft = true, showRight = true, showBottom = true,
    toggleLeft, toggleRight, toggleBottom, onShowGuide
}: TopBarProps) => {
    const [actionsOpen, setActionsOpen] = useState(false);
    const [projectDropOpen, setProjectDropOpen] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);
    const projectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false);
            if (projectRef.current && !projectRef.current.contains(e.target as Node)) setProjectDropOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const actionItems = [
        { icon: <Copy size={13} />, label: 'Kopyala', action: () => alert('İş akışı kopyalandı!') },
        { icon: <Download size={13} />, label: 'JSON Dışa Aktar', action: handleExportJSON },
        { icon: <Upload size={13} />, label: 'JSON İçe Aktar', action: handleImportJSON },
        { divider: true },
        { icon: <Bug size={13} />, label: 'Hata Ayıklama Modu', action: () => onModeChange('editor') },
        { icon: <FileJson size={13} />, label: 'Eylemler...', action: () => alert('Gelişmiş eylemler yakında!') },
    ];

    const modeItems = [
        { id: 'cockpit', label: '🚀 Kokpit HUD (v7)' },
        { id: 'workflow', label: '⚡ İş Akışı Editörü' },
        { id: 'editor', label: '💻 Kod Stüdyosu' },
        { id: 'personal_agent', label: '🤖 Kişisel Ajan Filosu' },
        { id: 'templates', label: '🏭 Fabrika & Şablonlar' },
        { id: 'dashboard', label: '📊 Kontrol Paneli' },
    ];

    return (
        <div className="h-11 flex items-center justify-between px-3 select-none flex-shrink-0"
            style={{ background: '#070d18', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>

            {/* ── SOL: Logo + toggle ───────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onModeChange('cockpit')}>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/20"
                        style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}>
                        <Zap size={14} className="text-white animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xs tracking-widest text-cyan-400 font-mono" style={{ letterSpacing: '0.14em' }}>
                            OPTIMUS <span className="text-white text-[10px] px-1 py-0.2 bg-cyan-900/60 rounded border border-cyan-500/40">v7</span>
                        </span>
                    </div>
                </div>

                <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.1)' }} />

                <div className="flex items-center gap-0.5">
                    <Tip text="Sol Paneli Aç/Kapat">
                        <button className="icon-btn" onClick={toggleLeft}>
                            <PanelLeft size={14} style={{ opacity: showLeft ? 1 : 0.4 }} />
                        </button>
                    </Tip>
                    <Tip text="Alt Paneli Aç/Kapat">
                        <button className="icon-btn" onClick={toggleBottom}>
                            <PanelBottom size={14} style={{ opacity: showBottom ? 1 : 0.4 }} />
                        </button>
                    </Tip>
                    <Tip text="Sağ Paneli Aç/Kapat">
                        <button className="icon-btn" onClick={toggleRight}>
                            <PanelRight size={14} style={{ opacity: showRight ? 1 : 0.4 }} />
                        </button>
                    </Tip>
                </div>
            </div>

            {/* ── ORTA: Hızlı Mod Geçiş Butonları ──────────── */}
            <div className="flex items-center gap-1">
                {[
                    { id: 'cockpit', label: '🚀 Kokpit' },
                    { id: 'workflow', label: '⚡ İş Akışı' },
                    { id: 'personal_agent', label: '🤖 Ajanlar' },
                    { id: 'editor', label: '💻 Kod' },
                    { id: 'templates', label: '🏭 Şablonlar' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onModeChange(item.id)}
                        className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                            activeMode === item.id
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-xs'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* ── SAĞ: Çalıştır + Eylemler + İkonlar ──────── */}
            <div className="flex items-center gap-2">
                <Tip text="İş Akışını Çalıştır">
                    <button className="btn-run" onClick={() => onModeChange('workflow')}>
                        <Play size={13} fill="white" /> Çalıştır
                    </button>
                </Tip>

                {/* Eylemler dropdown */}
                <div className="relative" ref={actionsRef}>
                    <Tip text="İş akışı eylemleri">
                        <button className="btn-actions" onClick={() => setActionsOpen(p => !p)}>
                            <RefreshCw size={12} /> Eylemler <ChevronDown size={12} />
                        </button>
                    </Tip>
                    {actionsOpen && (
                        <div className="absolute right-0 top-full mt-1 w-44 z-50 rounded-lg overflow-hidden shadow-2xl py-1"
                            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-normal)' }}>
                            {actionItems.map((item, idx) =>
                                item.divider
                                    ? <div key={idx} className="my-1 mx-3" style={{ height: 1, background: 'var(--border-subtle)' }} />
                                    : (
                                        <div key={idx}
                                            className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer"
                                            style={{ color: 'var(--text-secondary)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                            onClick={() => { item.action?.(); setActionsOpen(false); }}
                                        >
                                            {item.icon}{item.label}
                                        </div>
                                    )
                            )}
                        </div>
                    )}
                </div>

                <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

                <Tip text="Ara"><button className="icon-btn" onClick={() => { const q = prompt('Arama:'); if (q) alert(`Aranan: ${q}`); }}><Search size={14} /></button></Tip>
                <Tip text="Ayarlar"><button className="icon-btn" onClick={() => alert('Ayarlar yakında!')}><Settings size={14} /></button></Tip>
                <Tip text="Bildirimler"><button className="icon-btn"><Bell size={14} /></button></Tip>
                <Tip text="Kullanım Kılavuzu">
                    <button className="icon-btn" onClick={onShowGuide} style={{ color: 'var(--accent-green)' }}>
                        <BookOpen size={14} />
                    </button>
                </Tip>
                <Tip text="Daha Fazla"><button className="icon-btn"><MoreHorizontal size={14} /></button></Tip>

                <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

                <Tip text="Profil">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white' }}>
                        OP
                    </div>
                </Tip>
            </div>
        </div>
    );
};

function handleExportJSON() {
    const data = { versiyon: '1.0', proje: 'Optimus Studio', aktarımZamanı: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'optimus-workflow.json'; a.click();
    URL.revokeObjectURL(url);
}

function handleImportJSON() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                alert(`✅ İçe aktarıldı: ${file.name}\nNode sayısı: ${data?.workflow?.nodes?.length ?? '?'}`);
            } catch { alert('Geçersiz JSON dosyası!'); }
        };
        reader.readAsText(file);
    };
    input.click();
}
