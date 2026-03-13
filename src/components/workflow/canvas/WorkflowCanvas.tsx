// src/components/workflow/canvas/WorkflowCanvas.tsx — v3.1.1
'use client';
import React, { useRef, useState } from 'react';
import { WorkflowNode, WorkflowConnection } from '../types';
import { CheckCircle2, Play, Mail, Database, MessageSquare, Webhook, MoreHorizontal, Trash2, BarChart2 } from 'lucide-react';

export interface WorkflowCanvasProps {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    onNodeMove: (id: string, x: number, y: number) => void;
    onSelectionChange: (id: string | null) => void;
    selectedNodeId: string | null;
    onDeleteNode?: (id: string) => void;
}

/* ─── Node style map ───────────────────────────────────────── */
const getStyle = (type: string, label: string) => {
    const lbl = label.toLowerCase();
    if (lbl.includes('start') || lbl.includes('başlat') || lbl.includes('zamanlayıcı') || lbl.includes('tetik'))
        return { bg: 'linear-gradient(135deg,#162a28,#0f2825)', border: 'rgba(43,202,141,0.4)', accent: '#2bca8d', icon: <Play size={13} fill="#2bca8d" color="#2bca8d" /> };
    if (lbl.includes('webhook'))
        return { bg: 'linear-gradient(135deg,#162a28,#0f2825)', border: 'rgba(43,202,141,0.4)', accent: '#2bca8d', icon: <CheckCircle2 size={13} color="#2bca8d" /> };
    if (lbl.includes('llm') || lbl.includes('sohbet') || lbl.includes('metin') || lbl.includes('içerik') || lbl.includes('senaryo') || lbl.includes('hook') || lbl.includes('motivasyon') || type === 'ai')
        return { bg: 'linear-gradient(135deg,#161d27,#111520)', border: 'rgba(43,202,141,0.3)', accent: '#2bca8d', icon: <CheckCircle2 size={13} color="#2bca8d" /> };
    if (lbl.includes('trend') || lbl.includes('analiz'))
        return { bg: 'linear-gradient(135deg,#1a1720,#150e1e)', border: 'rgba(168,85,247,0.35)', accent: '#a855f7', icon: <BarChart2 size={13} color="#a855f7" /> };
    if (lbl.includes('veri') || lbl.includes('data') || lbl.includes('filtrele') || lbl.includes('http') || lbl.includes('enrich') || lbl.includes('görsel') || type === 'process')
        return { bg: 'linear-gradient(135deg,#161d30,#111827)', border: 'rgba(99,120,230,0.35)', accent: '#6378e6', icon: <Database size={13} color="#6378e6" /> };
    if (lbl.includes('e-posta') || lbl.includes('email') || lbl.includes('gönder') || lbl.includes('yükle') || lbl.includes('yayınla') || lbl.includes('render') || lbl.includes('send') || type === 'output')
        return { bg: 'linear-gradient(135deg,#1a1628,#130f20)', border: 'rgba(168,85,247,0.35)', accent: '#a855f7', icon: <Mail size={13} color="#a855f7" /> };
    return { bg: 'linear-gradient(135deg,#161d27,#111520)', border: 'rgba(43,202,141,0.3)', accent: '#2bca8d', icon: <MessageSquare size={13} color="#2bca8d" /> };
};

/* ─── Canvas ───────────────────────────────────────────────── */
export const WorkflowCanvas = ({
    nodes, connections, onNodeMove, onSelectionChange, selectedNodeId, onDeleteNode
}: WorkflowCanvasProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [menuNodeId, setMenuNodeId] = useState<string | null>(null);

    const handleMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
        e.stopPropagation();
        setDraggingId(id);
        setDragOffset({ x: e.clientX - x, y: e.clientY - y });
        onSelectionChange(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingId) return;
        const newX = Math.round((e.clientX - dragOffset.x) / 25) * 25;
        const newY = Math.round((e.clientY - dragOffset.y) / 25) * 25;
        onNodeMove(draggingId, newX, newY);
    };

    const handleMouseUp = () => setDraggingId(null);

    /* Bezier path between nodes */
    const getPath = (conn: WorkflowConnection) => {
        const src = nodes.find(n => n.id === conn.source);
        const tgt = nodes.find(n => n.id === conn.target);
        if (!src || !tgt) return '';
        const sw = src.label.includes('START') || src.label.includes('Başlat') ? 110 : 160;
        const sx = src.position.x + sw + 5;
        const sy = src.position.y + 20;
        const tx = tgt.position.x - 4;
        const ty = tgt.position.y + 20;
        const mx = (sx + tx) / 2;
        return `M ${sx} ${sy} C ${mx} ${sy} ${mx} ${ty} ${tx} ${ty}`;
    };

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden select-none"
            style={{ cursor: draggingId ? 'grabbing' : 'default' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={() => { onSelectionChange(null); setMenuNodeId(null); }}
        >
            {/* SVG: connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                    <marker id="arrow-wf" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0,8 3,0 6" fill="rgba(43,202,141,0.6)" />
                    </marker>
                </defs>
                {connections.map(conn => (
                    <path key={conn.id} d={getPath(conn)}
                        stroke="rgba(43,202,141,0.45)" strokeWidth="1.5" fill="none"
                        strokeDasharray="5 4"
                        style={{ animation: 'dashMove 1.2s linear infinite' }}
                        markerEnd="url(#arrow-wf)"
                    />
                ))}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
                const style = getStyle(node.type, node.label);
                const isStart = node.label.toLowerCase().includes('start');
                const isSelected = selectedNodeId === node.id;
                const width = isStart ? 110 : 160;

                return (
                    <div
                        key={node.id}
                        className="wf-node absolute"
                        style={{
                            left: node.position.x, top: node.position.y, width,
                            background: style.bg,
                            borderColor: isSelected ? style.accent : style.border,
                            boxShadow: isSelected
                                ? `0 0 0 1.5px ${style.accent}, 0 4px 20px rgba(0,0,0,0.5)`
                                : '0 3px 12px rgba(0,0,0,0.4)',
                            zIndex: isSelected ? 20 : 10,
                            cursor: draggingId === node.id ? 'grabbing' : 'grab',
                        }}
                        onMouseDown={e => handleMouseDown(e, node.id, node.position.x, node.position.y)}
                        title={`${node.label} (${node.type}) — Sürükle: taşı, Tıkla: seç`}
                    >
                        {/* Left accent bar */}
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: style.accent, borderRadius: '8px 0 0 8px', opacity: 0.8 }} />

                        {/* Content */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px 8px 13px' }}>
                            <span style={{ flexShrink: 0 }}>{style.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {node.label}
                            </span>
                            {!isStart && (
                                <button
                                    style={{ background: 'transparent', border: 'none', padding: 2, cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}
                                    title="Seçenekler"
                                    onClick={e => { e.stopPropagation(); setMenuNodeId(menuNodeId === node.id ? null : node.id); }}
                                >
                                    <MoreHorizontal size={11} />
                                </button>
                            )}
                        </div>

                        {/* Context menu */}
                        {menuNodeId === node.id && (
                            <div
                                className="absolute right-0 top-full mt-1 z-50 rounded shadow-xl py-1"
                                style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-normal)', width: 130, zIndex: 50 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="px-3 py-1.5 text-xs cursor-pointer flex items-center gap-2"
                                    style={{ color: '#f87171' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    onClick={() => { onDeleteNode?.(node.id); setMenuNodeId(null); }}
                                >
                                    <Trash2 size={11} /> Sil
                                </div>
                            </div>
                        )}

                        {/* Input port (not for start) */}
                        {!isStart && (
                            <div title="Giriş portu" style={{ position: 'absolute', left: -5, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: 'var(--bg-overlay)', border: `1.5px solid ${style.accent}`, zIndex: 30 }} />
                        )}
                        {/* Output port */}
                        <div title="Çıkış portu" style={{ position: 'absolute', right: -5, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: 'var(--bg-overlay)', border: `1.5px solid ${style.accent}`, zIndex: 30 }} />
                    </div>
                );
            })}
        </div>
    );
};
