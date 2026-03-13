// src/components/layout/OptimusLayout.tsx
'use client';

import React, { ReactNode, useState } from 'react';
import { TopBar } from './TopBar';
import { X, BookOpen, ChevronRight } from 'lucide-react';

const GUIDE_SECTIONS = [
    {
        icon: '🚀', title: 'Hızlı Başlangıç',
        items: [
            'Sol menüden "Otomasyon → İş Akışları" seçin',
            'Node Kütüphanesi\'nden node\'ları canvas\'a sürükleyin',
            'Node\'ları bağlamak için çıkış portuna tıklayıp sürükleyin',
            '"Çalıştır" butonuyla iş akışını başlatın',
        ]
    },
    {
        icon: '⚡', title: 'Tetikleyiciler',
        items: [
            'Webhook: Dış sistemlerden HTTP isteği alır',
            'Zamanlayıcı: Belirli saatlerde otomatik çalışır',
            'E-posta Tetik: Gelen e-postaya göre tetiklenir',
        ]
    },
    {
        icon: '🤖', title: 'Yapay Zeka Node\'ları',
        items: [
            'LLM Sohbet: GPT-4, Claude, Mixtral ile metin üretir',
            'Metin Üretici: Makale, sosyal medya içeriği yazar',
            'Trend Analizi: Güncel trendleri analiz eder',
        ]
    },
    {
        icon: '🏭', title: 'Fabrika Şablonları',
        items: [
            'Mind Trap (Viral): Viral sosyal medya içeriği üretir',
            'Sessiz Güç (İş): Motivasyon & finans içeriği',
            'Trend İçerik Üretici: Trend konularda otomatik içerik',
            'Otomatik E-posta: Newsletter otomasyonu',
        ]
    },
    {
        icon: '📦', title: 'ZIP Dışa Aktarma (Satış)',
        items: [
            'Workflow Toolbar\'da "ZIP Dışa Aktar" butonuna tıklayın',
            'İndirilen .zip içinde: workflow.json + README.md + manifest.json',
            'Müşterilerinize bu paketi doğrudan satabilirsiniz',
            'Müşteri Optimus Studio\'da JSON İçe Aktar ile yükler',
        ]
    },
    {
        icon: '⌨️', title: 'Klavye Kısayolları',
        items: [
            'Ctrl+S — İş akışını kaydet',
            'F5 — İş akışını çalıştır',
            'Ctrl+Z — Geri al',
            'Delete — Seçili node\'u sil',
        ]
    },
];

interface OptimusLayoutProps {
    children: ReactNode;
    leftPanelContent: ReactNode;
    rightPanelContent: ReactNode;
    bottomPanelContent: ReactNode;
    activeMode: string;
    onModeChange: (mode: string) => void;
    showLeft: boolean;
    showRight: boolean;
    showBottom: boolean;
    toggleLeft: () => void;
    toggleRight: () => void;
    toggleBottom: () => void;
}

export const OptimusLayout = ({
    children, leftPanelContent, rightPanelContent, bottomPanelContent,
    activeMode, onModeChange, showLeft, showRight, showBottom,
    toggleLeft, toggleRight, toggleBottom
}: OptimusLayoutProps) => {
    const [showGuide, setShowGuide] = useState(false);
    const [openSection, setOpenSection] = useState<number | null>(0);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* TOP BAR */}
            <TopBar
                activeMode={activeMode}
                onModeChange={onModeChange}
                showLeft={showLeft}
                showRight={showRight}
                showBottom={showBottom}
                toggleLeft={toggleLeft}
                toggleRight={toggleRight}
                toggleBottom={toggleBottom}
                onShowGuide={() => setShowGuide(true)}
            />

            {/* MAIN BODY */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR */}
                <aside className="flex-shrink-0 overflow-hidden transition-all duration-200"
                    style={{ width: showLeft ? '220px' : '0px', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-deep)' }}>
                    <div style={{ width: 220, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {leftPanelContent}
                    </div>
                </aside>

                {/* CENTER + BOTTOM */}
                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                        {children}
                    </main>
                    {showBottom && (
                        <div className="flex-shrink-0 overflow-hidden transition-all duration-200"
                            style={{ height: '200px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-deep)' }}>
                            {bottomPanelContent}
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL */}
                <aside className="flex-shrink-0 overflow-hidden transition-all duration-200"
                    style={{ width: showRight ? '260px' : '0px', borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-deep)' }}>
                    <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {rightPanelContent}
                    </div>
                </aside>
            </div>

            {/* ── KULLANIM KILAVUZU MODAL ──────────────────── */}
            {showGuide && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setShowGuide(false)}>
                    <div className="relative rounded-xl shadow-2xl overflow-hidden"
                        style={{ width: 640, maxHeight: '80vh', background: 'var(--bg-raised)', border: '1px solid var(--border-normal)' }}
                        onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                                    <BookOpen size={16} className="text-white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Kullanım Kılavuzu</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ali Erden v3.1</div>
                                </div>
                            </div>
                            <button className="icon-btn" onClick={() => setShowGuide(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(80vh - 80px)' }}>
                            {GUIDE_SECTIONS.map((section, si) => (
                                <div key={si} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <button
                                        className="w-full flex items-center gap-3 px-6 py-3 text-left"
                                        style={{ background: 'transparent' }}
                                        onClick={() => setOpenSection(openSection === si ? null : si)}
                                    >
                                        <span style={{ fontSize: 18 }}>{section.icon}</span>
                                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {section.title}
                                        </span>
                                        <ChevronRight size={14} style={{
                                            color: 'var(--text-muted)',
                                            transform: openSection === si ? 'rotate(90deg)' : 'none',
                                            transition: 'transform 0.2s',
                                        }} />
                                    </button>
                                    {openSection === si && (
                                        <ul className="pb-3 px-6" style={{ listStyle: 'none', margin: 0, padding: '0 24px 12px 56px' }}>
                                            {section.items.map((item, ii) => (
                                                <li key={ii} className="flex items-start gap-2 py-1"
                                                    style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                                    <span style={{ color: 'var(--accent-green)', marginTop: 2 }}>›</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}

                            {/* Footer */}
                            <div className="px-6 py-4" style={{ background: 'var(--bg-elevated)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                                📧 Destek: ali@erdem.asistan &nbsp;|&nbsp; 🌐 v3.1.0 &nbsp;|&nbsp; Tüm özellikler Türkçe desteklidir
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
