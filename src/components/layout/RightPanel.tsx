// src/components/layout/RightPanel.tsx
'use client';
import React, { useState } from 'react';
import {
    ChevronDown, ChevronRight, CheckCircle2, MoreHorizontal,
    Plus, Link2, List, Settings, Brain, Database, Layers
} from 'lucide-react';

interface RightPanelProps {
    mode: 'code' | 'workflow' | 'ai' | 'personal_agent' | 'dashboard' | 'factory' | 'editor';
    codeOutline?: any;
    nodeProperties?: any;
    aiParams?: any;
}

const AccordionSection = ({
    icon, label, children, defaultOpen = false
}: {
    icon: React.ReactNode, label: string, children?: React.ReactNode, defaultOpen?: boolean
}) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <button className="accordion-header w-full" onClick={() => setOpen(p => !p)}>
                <span style={{ color: 'var(--text-muted)' }}>
                    {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
                {icon}
                <span>{label}</span>
            </button>
            {open && children && (
                <div className="px-4 pb-3 space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
};

const PropField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
        {children}
    </div>
);

export const RightPanel = ({ mode }: RightPanelProps) => {
    const [method, setMethod] = useState('POST');
    const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/••••••••');

    return (
        <div className="flex flex-col h-full" style={{ background: 'var(--bg-deep)' }}>

            {/* ── Header ─────────────────────────────── */}
            <div className="flex items-center justify-between px-4 h-9 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-raised)' }}>
                <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Properties</span>
                    <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
                <button className="icon-btn"><MoreHorizontal size={13} /></button>
            </div>

            {/* ── Scrollable Content ─────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* Workflow mode → Webhook node properties */}
                {(mode === 'workflow' || mode === 'dashboard') && (
                    <>
                        {/* Node badge */}
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md"
                                style={{ background: 'var(--bg-surface)', border: '1px solid rgba(43,202,141,0.25)' }}>
                                <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Webhook</span>
                            </div>
                        </div>

                        {/* Webhook URL */}
                        <div className="px-4 py-3 space-y-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <PropField label="Webhook URL">
                                <div className="flex items-center gap-1">
                                    <input
                                        className="prop-input flex-1"
                                        value={webhookUrl}
                                        onChange={e => setWebhookUrl(e.target.value)}
                                        style={{ fontSize: 11 }}
                                    />
                                    <button className="icon-btn" style={{ width: 24, height: 24 }}><Link2 size={12} /></button>
                                </div>
                            </PropField>

                            <PropField label="Method">
                                <div className="relative">
                                    <select
                                        className="prop-select"
                                        value={method}
                                        onChange={e => setMethod(e.target.value)}
                                        style={{ fontSize: 11 }}
                                    >
                                        {['POST', 'GET', 'PUT', 'PATCH', 'DELETE'].map(m => (
                                            <option key={m}>{m}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: 'var(--text-muted)' }} />
                                </div>
                            </PropField>
                        </div>

                        {/* Parameters */}
                        <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center justify-between px-4 py-2">
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    ° Parameters
                                </span>
                                <div className="flex gap-1">
                                    <button className="icon-btn" style={{ width: 22, height: 22 }}><Plus size={11} /></button>
                                    <button className="icon-btn" style={{ width: 22, height: 22 }}><List size={11} /></button>
                                </div>
                            </div>
                            <div className="px-4 pb-3">
                                <button
                                    className="w-full py-2 rounded text-center transition-colors"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--text-muted)',
                                        border: '1px dashed var(--border-subtle)',
                                        background: 'transparent',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-green)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                                    onClick={() => alert('Parameter eklendi!')}
                                >
                                    Add Parameter
                                </button>
                            </div>
                        </div>

                        {/* Accordion sections */}
                        <AccordionSection icon={<Layers size={12} />} label="Outline" defaultOpen={false}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                <div className="py-1 hover:text-white cursor-pointer" style={{ color: 'var(--text-secondary)' }}>→ START</div>
                                <div className="py-1 hover:text-white cursor-pointer pl-3" style={{ color: 'var(--text-secondary)' }}>→ Webhook</div>
                                <div className="py-1 hover:text-white cursor-pointer pl-3" style={{ color: 'var(--text-secondary)' }}>→ LLM Chat</div>
                            </div>
                        </AccordionSection>
                        <AccordionSection icon={<Settings size={12} />} label="Node Settings" defaultOpen={false}>
                            <PropField label="Retry on Fail">
                                <select className="prop-select" style={{ fontSize: 11 }}>
                                    <option>Disabled</option>
                                    <option>3 times</option>
                                    <option>5 times</option>
                                </select>
                            </PropField>
                            <PropField label="Timeout (ms)">
                                <input className="prop-input" defaultValue="5000" style={{ fontSize: 11 }} />
                            </PropField>
                        </AccordionSection>
                        <AccordionSection icon={<Brain size={12} />} label="Model Settings" defaultOpen={false}>
                            <PropField label="Model">
                                <select className="prop-select" style={{ fontSize: 11 }}>
                                    <option>gpt-4-turbo</option>
                                    <option>claude-3-opus</option>
                                    <option>llama-3-70b</option>
                                    <option>deepseek-r1</option>
                                </select>
                            </PropField>
                            <PropField label="Temperature">
                                <div className="flex items-center gap-2">
                                    <input type="range" min={0} max={2} step={0.1} defaultValue={0.7}
                                        className="flex-1 h-1 rounded-full cursor-pointer"
                                        style={{ accentColor: 'var(--accent-green)' }} />
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 24 }}>0.7</span>
                                </div>
                            </PropField>
                        </AccordionSection>
                        <AccordionSection icon={<Database size={12} />} label="Memory" defaultOpen={false}>
                            <PropField label="Memory Type">
                                <select className="prop-select" style={{ fontSize: 11 }}>
                                    <option>None</option>
                                    <option>Window Buffer</option>
                                    <option>Summary</option>
                                </select>
                            </PropField>
                        </AccordionSection>
                    </>
                )}

                {/* Code/Editor mode → Outline */}
                {(mode === 'code' || mode === 'editor') && (
                    <>
                        <AccordionSection icon={<Layers size={12} />} label="Structure" defaultOpen={true}>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 4, borderLeft: '2px solid var(--border-subtle)' }}>
                                <div className="py-0.5 hover:text-white cursor-pointer">Imports</div>
                                <div className="py-0.5 hover:text-white cursor-pointer">OptimusLayout</div>
                                <div className="py-0.5 hover:text-white cursor-pointer pl-2">TopBar</div>
                                <div className="py-0.5 hover:text-white cursor-pointer pl-2">LeftPanel</div>
                                <div className="py-0.5 hover:text-white cursor-pointer pl-2">RightPanel</div>
                                <div className="py-0.5 hover:text-white cursor-pointer pl-2">BottomPanel</div>
                            </div>
                        </AccordionSection>
                        <AccordionSection icon={<Settings size={12} />} label="Problems" defaultOpen={true}>
                            <div style={{ fontSize: 11, color: '#10b981' }}>✓ No issues detected</div>
                        </AccordionSection>
                    </>
                )}

                {/* AI mode */}
                {mode === 'ai' && (
                    <>
                        <AccordionSection icon={<Brain size={12} />} label="Active Agent" defaultOpen={true}>
                            <div className="flex items-center gap-2 text-xs" style={{ color: '#10b981' }}>
                                <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                                Coding Assistant
                            </div>
                        </AccordionSection>
                        <AccordionSection icon={<Database size={12} />} label="Context Window" defaultOpen={true}>
                            <div className="w-full rounded-full h-1.5" style={{ background: 'var(--bg-overlay)' }}>
                                <div className="h-1.5 rounded-full" style={{ width: '45%', background: 'var(--accent-green)' }} />
                            </div>
                            <div className="flex justify-between mt-1" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                <span>14.2K Tokens</span>
                                <span>32K Max</span>
                            </div>
                        </AccordionSection>
                    </>
                )}

                {/* Personal Agent mode */}
                {mode === 'personal_agent' && (
                    <>
                        <AccordionSection icon={<Brain size={12} />} label="Agent Intelligence" defaultOpen={true}>
                            <PropField label="Capabilities">
                                <div className="space-y-1" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    <div className="flex items-center gap-2"><span style={{ color: '#10b981' }}>✓</span> Code generation</div>
                                    <div className="flex items-center gap-2"><span style={{ color: '#10b981' }}>✓</span> File automation</div>
                                    <div className="flex items-center gap-2"><span style={{ color: '#10b981' }}>✓</span> Workflow creation</div>
                                </div>
                            </PropField>
                        </AccordionSection>
                    </>
                )}

                {/* Factory mode */}
                {mode === 'factory' && (
                    <>
                        <AccordionSection icon={<Settings size={12} />} label="Factory Settings" defaultOpen={true}>
                            <PropField label="Output Format">
                                <select className="prop-select" style={{ fontSize: 11 }}>
                                    <option>ZIP Package</option>
                                    <option>JSON Export</option>
                                    <option>Docker Image</option>
                                </select>
                            </PropField>
                        </AccordionSection>
                    </>
                )}
            </div>
        </div>
    );
};
