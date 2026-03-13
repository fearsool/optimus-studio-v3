// src/components/workflow/WorkflowDesigner.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowCanvas } from './canvas/WorkflowCanvas';
import { WorkflowConsole } from './engine/WorkflowConsole';
import { WorkflowNode, WorkflowConnection } from './types';
import { AutomationTemplate } from '../templates/TemplateStore';
import {
    Package, ChevronDown, ChevronRight, Zap, Brain,
    GitBranch, BarChart2, Mail, Webhook, Play,
    Database, Filter, Globe, MessageSquare, FileText
} from 'lucide-react';

// ─── Node Palette sidebar ────────────────────────────────────────
const PALETTE_CATEGORIES = [
    {
        label: '⚡ Tetikleyiciler',
        items: [
            { type: 'trigger', label: 'Webhook', icon: <Webhook size={12} /> },
            { type: 'trigger', label: 'Zamanlayıcı', icon: <Play size={12} /> },
            { type: 'trigger', label: 'E-posta Tetik', icon: <Mail size={12} /> },
        ]
    },
    {
        label: '🤖 Yapay Zeka',
        items: [
            { type: 'ai', label: 'LLM Sohbet', icon: <MessageSquare size={12} /> },
            { type: 'ai', label: 'Metin Üretici', icon: <FileText size={12} /> },
            { type: 'ai', label: 'Trend Analizi', icon: <BarChart2 size={12} /> },
        ]
    },
    {
        label: '⚙️ İşlemler',
        items: [
            { type: 'process', label: 'HTTP İstek', icon: <Globe size={12} /> },
            { type: 'process', label: 'Veri Filtrele', icon: <Filter size={12} /> },
            { type: 'process', label: 'Veritabanı', icon: <Database size={12} /> },
        ]
    },
    {
        label: '📤 Çıktılar',
        items: [
            { type: 'output', label: 'E-posta Gönder', icon: <Mail size={12} /> },
            { type: 'output', label: 'CRM Kaydet', icon: <GitBranch size={12} /> },
        ]
    },
    {
        label: '🏭 Fabrika Şablonları',
        items: [
            { type: 'factory', label: '🗺️ Google Maps Lead', icon: <Zap size={12} /> },
            { type: 'factory', label: '🧠 Mind Trap (Viral)', icon: <Brain size={12} /> },
            { type: 'factory', label: '📈 Trend İçerik', icon: <BarChart2 size={12} /> },
            { type: 'factory', label: '📧 E-posta Dizisi', icon: <Mail size={12} /> },
            { type: 'factory', label: '💼 Sessiz Güç (İş)', icon: <Package size={12} /> },
        ]
    },
];

const NodePaletteSidebar = ({ onDragStart }: { onDragStart: (label: string, type: string) => void }) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ '⚡ Tetikleyiciler': true, '🤖 Yapay Zeka': true });
    return (
        <div className="flex flex-col overflow-y-auto custom-scrollbar flex-shrink-0"
            style={{ width: 165, background: 'var(--bg-deep)', borderRight: '1px solid var(--border-subtle)' }}>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider flex-shrink-0"
                style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                NODE KÜTÜPHANESİ
            </div>
            {PALETTE_CATEGORIES.map(cat => (
                <div key={cat.label}>
                    <button
                        className="w-full flex items-center justify-between px-3 py-1.5 text-left"
                        style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, background: 'transparent' }}
                        onClick={() => setExpanded(p => ({ ...p, [cat.label]: !p[cat.label] }))}>
                        <span>{cat.label}</span>
                        {expanded[cat.label] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </button>
                    {expanded[cat.label] && cat.items.map(item => (
                        <div key={item.label}
                            draggable
                            onDragStart={() => onDragStart(item.label, item.type)}
                            title={`Canvas'a sürükleyin: ${item.label}`}
                            className="flex items-center gap-2 mx-2 mb-1 px-2 py-1.5 rounded cursor-grab"
                            style={{
                                fontSize: 11, color: 'var(--text-secondary)',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-green)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
                            {item.icon}
                            <span style={{ fontSize: 10 }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

// ─── Props ───────────────────────────────────────────────────────
interface WorkflowDesignerProps {
    initialTemplate?: AutomationTemplate | null;
    onTemplateLoaded?: () => void;
}

// ─── Main Component ──────────────────────────────────────────────
export const WorkflowDesigner = ({ initialTemplate, onTemplateLoaded }: WorkflowDesignerProps = {}): React.ReactElement => {
    const [nodes, setNodes] = useState<WorkflowNode[]>([
        { id: 'start-1', type: 'trigger', position: { x: 60, y: 120 }, data: {}, label: 'START' },
        { id: 'wh-1', type: 'webhook', position: { x: 260, y: 90 }, data: {}, label: 'Webhook' },
        { id: 'llm-1', type: 'ai', position: { x: 480, y: 90 }, data: { model: 'gpt-4-turbo' }, label: 'LLM Sohbet' },
        { id: 'llm-2', type: 'ai', position: { x: 160, y: 250 }, data: { model: 'mixtral' }, label: 'LLM Sohbet' },
        { id: 'enr-1', type: 'process', position: { x: 420, y: 280 }, data: {}, label: 'Veri Zenginleştir' },
        { id: 'out-1', type: 'output', position: { x: 650, y: 280 }, data: {}, label: 'E-posta Gönder' },
    ]);
    const [connections, setConnections] = useState<WorkflowConnection[]>([
        { id: 'c1', source: 'start-1', target: 'wh-1' },
        { id: 'c2', source: 'wh-1', target: 'llm-1' },
        { id: 'c3', source: 'llm-1', target: 'llm-2' },
        { id: 'c4', source: 'llm-2', target: 'enr-1' },
        { id: 'c5', source: 'enr-1', target: 'out-1' },
    ]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [logs, setLogs] = useState<{ timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [workflowName] = useState('Lead Generation Automation');
    const [draggingLabel, setDraggingLabel] = useState<string | null>(null);
    const [draggingType, setDraggingType] = useState<string | null>(null);

    // ─── addLog must be defined BEFORE useEffect that calls it ───
    const addLog = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        const timestamp = new Date().toLocaleTimeString('tr-TR', { hour12: false });
        setLogs(prev => [...prev.slice(-100), { timestamp, message, type }]);
    }, []);

    // Load template when passed from TemplateStore
    useEffect(() => {
        if (initialTemplate) {
            setNodes(initialTemplate.nodes as WorkflowNode[]);
            setConnections(initialTemplate.connections as WorkflowConnection[]);
            setSelectedNodeId(null);
            setLogs([]);
            addLog(`✅ Şablon yüklendi: ${initialTemplate.name}`, 'success');
            onTemplateLoaded?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialTemplate]);

    const onNodeMove = (id: string, x: number, y: number) =>
        setNodes(nds => nds.map(n => n.id === id ? { ...n, position: { x, y } } : n));

    const onSelectionChange = (id: string | null) => setSelectedNodeId(id);

    const handleDeleteNode = (id: string) => {
        setNodes(nds => nds.filter(n => n.id !== id));
        setConnections(cs => cs.filter(c => c.source !== id && c.target !== id));
        setSelectedNodeId(null);
        addLog(`🗑️ Node silindi`, 'info');
    };

    // Factory template node expansion
    const expandFactory = useCallback((label: string, position: { x: number; y: number }) => {
        const now = Date.now();
        const templates: Record<string, () => void> = {
            '🗺️ Google Maps Lead': () => {
                const ns: WorkflowNode[] = [
                    { id: `t${now}-1`, type: 'trigger', position: { x: position.x, y: position.y }, label: 'START', data: {} },
                    { id: `t${now}-2`, type: 'webhook', position: { x: position.x + 200, y: position.y - 30 }, label: 'Kategori Girişi', data: {} },
                    { id: `t${now}-3`, type: 'process', position: { x: position.x + 400, y: position.y - 30 }, label: 'Maps HTTP Tarayıcı', data: {} },
                    { id: `t${now}-4`, type: 'ai', position: { x: position.x + 600, y: position.y - 30 }, label: 'Veri Çıkarıcı (LLM)', data: { model: 'gpt-4' } },
                    { id: `t${now}-5`, type: 'process', position: { x: position.x + 200, y: position.y + 150 }, label: 'Fırsat Puanlayıcı', data: {} },
                    { id: `t${now}-6`, type: 'ai', position: { x: position.x + 400, y: position.y + 150 }, label: 'Teklif Üretici (AI)', data: { model: 'gpt-4-turbo' } },
                    { id: `t${now}-7`, type: 'output', position: { x: position.x + 620, y: position.y + 150 }, label: 'E-posta Gönder', data: {} },
                    { id: `t${now}-8`, type: 'output', position: { x: position.x + 620, y: position.y + 280 }, label: "CRM'e Kaydet", data: {} },
                ];
                const cs: WorkflowConnection[] = [
                    { id: `c${now}-1`, source: `t${now}-1`, target: `t${now}-2` },
                    { id: `c${now}-2`, source: `t${now}-2`, target: `t${now}-3` },
                    { id: `c${now}-3`, source: `t${now}-3`, target: `t${now}-4` },
                    { id: `c${now}-4`, source: `t${now}-4`, target: `t${now}-5` },
                    { id: `c${now}-5`, source: `t${now}-5`, target: `t${now}-6` },
                    { id: `c${now}-6`, source: `t${now}-6`, target: `t${now}-7` },
                    { id: `c${now}-7`, source: `t${now}-6`, target: `t${now}-8` },
                ];
                setNodes(prev => [...prev, ...ns]);
                setConnections(prev => [...prev, ...cs]);
                addLog(`🗺️ Google Maps Lead Engine şablonu eklendi (${ns.length} node)`, 'success');
            },
            '🧠 Mind Trap (Viral)': () => {
                const ns: WorkflowNode[] = [
                    { id: `t${now}-1`, type: 'trigger', position: { x: position.x, y: position.y }, label: 'START: Viral', data: {} },
                    { id: `t${now}-2`, type: 'ai', position: { x: position.x + 200, y: position.y }, label: 'AI Senaryo', data: { model: 'mixtral' } },
                    { id: `t${now}-3`, type: 'ai', position: { x: position.x + 400, y: position.y }, label: 'Hook Üretici', data: { model: 'mistral' } },
                    { id: `t${now}-4`, type: 'process', position: { x: position.x + 600, y: position.y }, label: 'Görsel Üret', data: {} },
                    { id: `t${now}-5`, type: 'output', position: { x: position.x + 800, y: position.y }, label: 'Video Render', data: {} },
                ];
                const cs: WorkflowConnection[] = [
                    { id: `c${now}-1`, source: `t${now}-1`, target: `t${now}-2` },
                    { id: `c${now}-2`, source: `t${now}-2`, target: `t${now}-3` },
                    { id: `c${now}-3`, source: `t${now}-3`, target: `t${now}-4` },
                    { id: `c${now}-4`, source: `t${now}-4`, target: `t${now}-5` },
                ];
                setNodes(prev => [...prev, ...ns]);
                setConnections(prev => [...prev, ...cs]);
                addLog(`🧠 Mind Trap (Viral) şablonu eklendi`, 'success');
            },
            '📈 Trend İçerik': () => {
                const ns: WorkflowNode[] = [
                    { id: `t${now}-1`, type: 'trigger', position: { x: position.x, y: position.y }, label: 'START: Trend', data: {} },
                    { id: `t${now}-2`, type: 'ai', position: { x: position.x + 200, y: position.y }, label: 'Trend Analizi', data: { model: 'gpt-4' } },
                    { id: `t${now}-3`, type: 'ai', position: { x: position.x + 400, y: position.y }, label: 'İçerik Yaz', data: { model: 'mixtral' } },
                    { id: `t${now}-4`, type: 'output', position: { x: position.x + 600, y: position.y }, label: 'Yayınla', data: {} },
                ];
                const cs: WorkflowConnection[] = [
                    { id: `c${now}-1`, source: `t${now}-1`, target: `t${now}-2` },
                    { id: `c${now}-2`, source: `t${now}-2`, target: `t${now}-3` },
                    { id: `c${now}-3`, source: `t${now}-3`, target: `t${now}-4` },
                ];
                setNodes(prev => [...prev, ...ns]);
                setConnections(prev => [...prev, ...cs]);
                addLog(`📈 Trend İçerik şablonu eklendi`, 'success');
            },
            '📧 E-posta Dizisi': () => {
                const ns: WorkflowNode[] = [
                    { id: `t${now}-1`, type: 'trigger', position: { x: position.x, y: position.y }, label: 'START: Liste', data: {} },
                    { id: `t${now}-2`, type: 'ai', position: { x: position.x + 200, y: position.y }, label: 'E-posta Yaz', data: { model: 'gpt-4' } },
                    { id: `t${now}-3`, type: 'output', position: { x: position.x + 400, y: position.y }, label: 'E-posta Gönder', data: {} },
                    { id: `t${now}-4`, type: 'process', position: { x: position.x + 400, y: position.y + 150 }, label: 'Açılma Takibi', data: {} },
                    { id: `t${now}-5`, type: 'output', position: { x: position.x + 600, y: position.y + 150 }, label: 'Follow-up', data: {} },
                ];
                const cs: WorkflowConnection[] = [
                    { id: `c${now}-1`, source: `t${now}-1`, target: `t${now}-2` },
                    { id: `c${now}-2`, source: `t${now}-2`, target: `t${now}-3` },
                    { id: `c${now}-3`, source: `t${now}-3`, target: `t${now}-4` },
                    { id: `c${now}-4`, source: `t${now}-4`, target: `t${now}-5` },
                ];
                setNodes(prev => [...prev, ...ns]);
                setConnections(prev => [...prev, ...cs]);
                addLog(`📧 E-posta Dizisi şablonu eklendi`, 'success');
            },
            '💼 Sessiz Güç (İş)': () => {
                const ns: WorkflowNode[] = [
                    { id: `t${now}-1`, type: 'trigger', position: { x: position.x, y: position.y }, label: 'START: İş', data: {} },
                    { id: `t${now}-2`, type: 'ai', position: { x: position.x + 200, y: position.y }, label: 'Motivasyon Script', data: { model: 'gpt-4' } },
                    { id: `t${now}-3`, type: 'process', position: { x: position.x + 420, y: position.y }, label: 'Görsel Eşle', data: {} },
                    { id: `t${now}-4`, type: 'output', position: { x: position.x + 620, y: position.y }, label: 'LinkedIn Yükle', data: {} },
                ];
                const cs: WorkflowConnection[] = [
                    { id: `c${now}-1`, source: `t${now}-1`, target: `t${now}-2` },
                    { id: `c${now}-2`, source: `t${now}-2`, target: `t${now}-3` },
                    { id: `c${now}-3`, source: `t${now}-3`, target: `t${now}-4` },
                ];
                setNodes(prev => [...prev, ...ns]);
                setConnections(prev => [...prev, ...cs]);
                addLog(`💼 Sessiz Güç (İş) şablonu eklendi`, 'success');
            },
        };
        if (templates[label]) templates[label]();
        else {
            const id = `node-${Date.now()}`;
            setNodes(prev => [...prev, { id, type: 'process' as any, position, label, data: {} }]);
            addLog(`Node eklendi: ${label}`, 'info');
        }
    }, [addLog]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!draggingLabel || !draggingType) return;
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const position = {
            x: Math.round((e.clientX - rect.left - 80) / 25) * 25,
            y: Math.round((e.clientY - rect.top - 20) / 25) * 25,
        };
        if (draggingType === 'factory') {
            expandFactory(draggingLabel, position);
        } else {
            const id = `node-${Date.now()}`;
            setNodes(prev => [...prev, { id, type: draggingType as any, position, label: draggingLabel, data: {} }]);
            addLog(`Node eklendi: ${draggingLabel}`, 'info');
        }
        setDraggingLabel(null);
        setDraggingType(null);
    }, [draggingLabel, draggingType, expandFactory, addLog]);

    const handleSave = () => {
        const data = { nodes, connections, savedAt: new Date().toISOString() };
        localStorage.setItem('optimus-workflow', JSON.stringify(data));
        addLog('💾 İş akışı kaydedildi', 'success');
    };

    const handleRunWorkflow = useCallback(async () => {
        if (isRunning) return;
        setIsRunning(true);
        setLogs([]);
        addLog(`▶ İş akışı başlatıldı: ${workflowName}`, 'info');
        addLog(`📋 ${nodes.length} node çalıştırılıyor...`, 'info');
        for (let i = 0; i < nodes.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            addLog(`  ✓ ${nodes[i].label} tamamlandı`, 'success');
        }
        await new Promise(r => setTimeout(r, 400));
        addLog(`🎉 İş akışı başarıyla tamamlandı!`, 'success');
        setIsRunning(false);
    }, [isRunning, nodes, workflowName, addLog]);

    return (
        <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>
            <WorkflowToolbar
                onRun={handleRunWorkflow}
                onSave={handleSave}
                nodes={nodes}
                connections={connections}
                workflowName={workflowName}
                isRunning={isRunning}
            />

            <div className="flex flex-1 overflow-hidden"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}>
                <NodePaletteSidebar onDragStart={(label, type) => { setDraggingLabel(label); setDraggingType(type); }} />

                <div className="flex-1 relative grid-canvas overflow-hidden">
                    <WorkflowCanvas
                        nodes={nodes}
                        connections={connections}
                        onNodeMove={onNodeMove}
                        onSelectionChange={onSelectionChange}
                        selectedNodeId={selectedNodeId}
                        onDeleteNode={handleDeleteNode}
                    />
                </div>
            </div>

            <div className="flex-shrink-0" style={{ height: 140, borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-deep)' }}>
                <WorkflowConsole logs={logs} />
            </div>
        </div>
    );
};
