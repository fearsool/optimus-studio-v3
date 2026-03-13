// src/components/layout/LeftPanel.tsx
'use client';
import React, { useState } from 'react';
import {
    ChevronDown, ChevronRight,
    FolderOpen, Brain, Zap, GitBranch, FileText,
    Package, Cpu, BarChart2, Plug, Boxes, Layers,
    Bot, Database, FolderKanban, FilePlus, Activity,
    MessageSquare, Mic
} from 'lucide-react';

interface LeftPanelProps {
    fileExplorerContent: React.ReactNode;
    aiToolsContent: React.ReactNode;
    nodesContent: React.ReactNode;
    projectContent?: React.ReactNode;
    onNavigate?: (mode: string) => void;
}

type SectionKey = string;

const Tip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div className="relative group inline-flex w-full">
        {children}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs pointer-events-none whitespace-nowrap z-50
            opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-normal)', color: 'var(--text-primary)' }}>
            {text}
        </div>
    </div>
);

export const LeftPanel = ({ fileExplorerContent, aiToolsContent, nodesContent, onNavigate }: LeftPanelProps) => {
    const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({ otomasyon: true, ai: true, bilesenler: false });
    const [activeItem, setActiveItem] = useState('is-akislari');
    const [showExplorer, setShowExplorer] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showNodes, setShowNodes] = useState(false);

    const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    const Item = ({ id, icon, label, child, onClick, tip }: {
        id: string; icon: React.ReactNode; label: string;
        child?: boolean; onClick?: () => void; tip?: string;
    }) => {
        const el = (
            <button
                className={`sidebar-item ${child ? 'sidebar-child' : ''} ${activeItem === id ? 'active' : ''} w-full text-left`}
                onClick={() => { setActiveItem(id); onClick?.(); }}
            >
                {icon}
                <span style={{ fontSize: 12 }}>{label}</span>
            </button>
        );
        return tip ? <Tip text={tip}>{el}</Tip> : el;
    };

    const SectionHeader = ({ id, icon, label, tip }: { id: string; icon: React.ReactNode; label: string; tip: string }) => (
        <Tip text={tip}>
            <button className="sidebar-item w-full" onClick={() => toggle(id)}
                style={{ justifyContent: 'space-between', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-2">{icon} {label}</span>
                {expanded[id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
        </Tip>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
            {/* Durum satırı */}
            <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)', minHeight: 36 }}>
                <Activity size={12} style={{ color: 'var(--accent-green)' }} className="pulse-dot" />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ssaia Hazır</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                {/* Global Çekmece */}
                <div className="sidebar-item" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-secondary)', cursor: 'default' }}>
                    <Layers size={14} /> Global Çekmece
                </div>

                {/* Projeler */}
                <Item id="projeler" icon={<FolderKanban size={14} />} label="Projeler" tip="Proje listesini görüntüle" />

                {/* Dosya Gezgini */}
                <Item id="dosya-gezgini" icon={<FolderOpen size={14} />} label="Dosya Gezgini"
                    tip="Proje dosyalarını görüntüle"
                    onClick={() => setShowExplorer(p => !p)} />
                {showExplorer && (
                    <div className="mx-2 my-1 rounded overflow-hidden"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', maxHeight: 220, overflowY: 'auto' }}>
                        {fileExplorerContent}
                    </div>
                )}

                {/* Otomasyon */}
                <SectionHeader id="otomasyon" icon={<Zap size={14} />} label="Otomasyon" tip="Otomasyon araçları" />
                {expanded.otomasyon && (
                    <>
                        <Item id="is-akislari" icon={<GitBranch size={13} />} label="İş Akışları" child tip="Kayıtlı iş akışlarını yönet" onClick={() => onNavigate?.('workflow')} />
                        <Item id="sablonlar" icon={<FileText size={13} />} label="Şablonlar" child tip="Satışa hazır otomasyon şablonları" onClick={() => onNavigate?.('templates')} />
                    </>
                )}

                {/* Yapay Zeka */}
                <SectionHeader id="ai" icon={<Brain size={14} />} label="Yapay Zeka" tip="AI araçları ve modeller" />
                {expanded.ai && (
                    <>
                        <Item id="sohbet" icon={<MessageSquare size={13} />} label="Sohbet" child tip="AI ile sohbet başlat"
                            onClick={() => setShowChat(p => !p)} />
                        {showChat && (
                            <div className="mx-2 my-1 rounded overflow-hidden"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', maxHeight: 260, overflowY: 'auto' }}>
                                {aiToolsContent}
                            </div>
                        )}
                        <Item id="ses-komutlari" icon={<Mic size={13} />} label="Ses Komutları" child tip="Sesli komutla kontrol et" />
                        <Item id="modeller" icon={<Cpu size={13} />} label="Modeller" child tip="AI model yönetimi" />
                    </>
                )}

                {/* Bileşenler */}
                <SectionHeader id="bilesenler" icon={<Boxes size={14} />} label="Bileşenler" tip="Node ve bileşen kütüphanesi" />
                {expanded.bilesenler && (
                    <>
                        <Item id="node-kutuphanesi" icon={<Package size={13} />} label="Node Kütüphanesi" child tip="Tüm node'ları görüntüle"
                            onClick={() => setShowNodes(p => !p)} />
                        {showNodes && (
                            <div className="mx-2 my-1 rounded overflow-hidden"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', maxHeight: 200, overflowY: 'auto' }}>
                                {nodesContent}
                            </div>
                        )}
                        <Item id="ai-ml" icon={<Brain size={13} />} label="Yapay Zeka & ML" child tip="AI ve makine öğrenimi bileşenleri" />
                        <Item id="veri-isleme" icon={<BarChart2 size={13} />} label="Veri İşleme" child tip="Veri dönüştürme node'ları" />
                        <Item id="api" icon={<Plug size={13} />} label="API" child tip="HTTP/REST API bağlantıları" />
                        <Item id="kontrol-akisi" icon={<GitBranch size={13} />} label="Kontrol Akışı" child tip="Koşul ve döngü node'ları" />
                    </>
                )}

                {/* Ajanlar */}
                <Item id="ajanlar" icon={<Bot size={14} />} label="Ajanlar" tip="Kişisel ajan yönetimi" />
                {/* Bellek */}
                <Item id="bellek" icon={<Database size={14} />} label="Bellek" tip="Ajan bellek ve veri deposu" />
            </div>

            {/* Alt eylem */}
            <div className="flex-shrink-0 p-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <Tip text="Yeni otomasyon projesi oluştur">
                    <button className="w-full flex items-center gap-2 py-1.5 px-3 rounded text-xs font-medium transition-colors"
                        style={{
                            background: 'rgba(43,202,141,0.1)', color: 'var(--accent-green)',
                            border: '1px solid rgba(43,202,141,0.2)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(43,202,141,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(43,202,141,0.1)')}
                        onClick={() => {
                            const name = prompt('Yeni Otomasyon Proje Adı:');
                            if (name) alert(`✅ "${name}" projesi oluşturuldu!`);
                        }}
                    >
                        <FilePlus size={13} /> Yeni Otomasyon
                    </button>
                </Tip>
            </div>
        </div>
    );
};
