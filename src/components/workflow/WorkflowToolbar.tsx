// src/components/workflow/WorkflowToolbar.tsx
'use client';
import React, { useState } from 'react';
import {
    Play, Save, ZoomIn, ZoomOut, Maximize2,
    RotateCcw, Redo2, Grid3x3, Package, Square,
    Loader2
} from 'lucide-react';

export interface WorkflowToolbarProps {
    onRun: () => void;
    onSave: () => void;
    nodes?: any[];
    connections?: any[];
    workflowName?: string;
    isRunning?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}

const Tip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div className="relative group inline-flex">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs pointer-events-none whitespace-nowrap z-50
            opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-normal)', color: 'var(--text-primary)' }}>
            {text}
        </div>
    </div>
);

export const WorkflowToolbar = ({
    onRun, onSave, nodes = [], connections = [],
    workflowName = 'İş Akışı', isRunning = false,
    onUndo, onRedo
}: WorkflowToolbarProps) => {
    const [zoom, setZoom] = useState(100);
    const [showGrid, setShowGrid] = useState(true);

    const handleExportZip = async () => {
        const manifest = {
            name: workflowName, version: '1.0.0',
            description: `Optimus Studio Otomasyonu: ${workflowName}`,
            author: 'Optimus Studio', created: new Date().toISOString(),
            nodes: nodes.length, connections: connections.length,
        };
        const workflowJson = { manifest, workflow: { nodes, connections } };
        const readme = `# ${workflowName}\n\nOptimus Studio otomasyon paketi.\n\n## Kurulum\n1. Optimus Studio'yu açın\n2. Otomasyon → İş Akışları bölümüne gidin\n3. JSON İçe Aktar'a tıklayın\n4. workflow.json dosyasını seçin\n\n## Node'lar\n${nodes.map((n: any, i: number) => `${i + 1}. ${n.label}`).join('\n')}`;

        try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const folder = zip.folder(workflowName.replace(/\s+/g, '-').toLowerCase())!;
            folder.file('workflow.json', JSON.stringify(workflowJson, null, 2));
            folder.file('README.md', readme);
            folder.file('manifest.json', JSON.stringify(manifest, null, 2));
            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}-otomasyonu.zip`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            const blob = new Blob([JSON.stringify(workflowJson, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="flex items-center justify-between flex-shrink-0 px-3"
            style={{ height: 40, background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-subtle)' }}>

            {/* Sol: Çalıştır + Geri Al/İleri Al */}
            <div className="flex items-center gap-1">
                <Tip text={isRunning ? 'Çalışıyor...' : 'İş Akışını Çalıştır (F5)'}>
                    <button
                        className="btn-run"
                        style={{ padding: '4px 10px', fontSize: 12, opacity: isRunning ? 0.7 : 1 }}
                        onClick={onRun}
                        disabled={isRunning}
                    >
                        {isRunning
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Play size={12} fill="white" />
                        }
                        {isRunning ? 'Çalışıyor...' : 'Çalıştır'}
                    </button>
                </Tip>

                <div className="w-px h-4 mx-1" style={{ background: 'var(--border-subtle)' }} />

                <Tip text="Geri Al (Ctrl+Z)">
                    <button className="icon-btn" onClick={onUndo}><RotateCcw size={13} /></button>
                </Tip>
                <Tip text="Yinele (Ctrl+Y)">
                    <button className="icon-btn" onClick={onRedo}><Redo2 size={13} /></button>
                </Tip>

                <div className="w-px h-4 mx-1" style={{ background: 'var(--border-subtle)' }} />

                <Tip text={showGrid ? 'Izgarayı Gizle' : 'Izgarayı Göster'}>
                    <button
                        className="icon-btn"
                        onClick={() => setShowGrid(p => !p)}
                        style={{ color: showGrid ? 'var(--accent-green)' : 'var(--text-muted)' }}
                    >
                        <Grid3x3 size={13} />
                    </button>
                </Tip>
            </div>

            {/* Orta: Zoom */}
            <div className="flex items-center gap-1">
                <Tip text="Uzaklaştır">
                    <button className="icon-btn" onClick={() => setZoom(z => Math.max(25, z - 25))}>
                        <ZoomOut size={13} />
                    </button>
                </Tip>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36, textAlign: 'center' }}>{zoom}%</span>
                <Tip text="Yakınlaştır">
                    <button className="icon-btn" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                        <ZoomIn size={13} />
                    </button>
                </Tip>
                <Tip text="Tümünü Sığdır">
                    <button className="icon-btn" onClick={() => setZoom(100)}><Maximize2 size={13} /></button>
                </Tip>
            </div>

            {/* Sağ: Kaydet + ZIP Export */}
            <div className="flex items-center gap-1">
                <Tip text="İş Akışını Kaydet (Ctrl+S)">
                    <button className="icon-btn" onClick={onSave} style={{ gap: 4, paddingInline: 8, width: 'auto' }}>
                        <Save size={13} />
                        <span style={{ fontSize: 11 }}>Kaydet</span>
                    </button>
                </Tip>

                <Tip text="Satışa Hazır ZIP Paketi Olarak Dışa Aktar">
                    <button
                        onClick={handleExportZip}
                        className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium"
                        style={{
                            background: 'rgba(139,92,246,0.15)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            color: '#a78bfa', fontSize: 11, cursor: 'pointer', height: 26,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.25)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.15)')}
                    >
                        <Package size={12} />
                        ZIP Dışa Aktar
                    </button>
                </Tip>
            </div>
        </div>
    );
};
