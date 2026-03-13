// src/components/workspace/WorkspaceTabs.tsx
'use client';
import React from 'react';
import { GitBranch, Code2, Bot, MessageSquare, Video, MoreHorizontal } from 'lucide-react';

interface Tab {
    id: string;
    type: 'workflow' | 'code' | 'personal_agent' | 'chat' | 'preview' | 'factory' | 'editor' | 'dashboard';
    label: string;
    icon: React.ReactNode;
    tooltip: string;
}

const TABS: Tab[] = [
    { id: 'workflow', type: 'workflow', label: 'İş Akışı', icon: <GitBranch size={13} />, tooltip: 'Görsel iş akışı tasarımcısı' },
    { id: 'code', type: 'code', label: 'Kod', icon: <Code2 size={13} />, tooltip: 'Kod editörü' },
    { id: 'agent', type: 'personal_agent', label: 'Ajan', icon: <Bot size={13} />, tooltip: 'Kişisel ajan kontrol paneli' },
    { id: 'prompt', type: 'chat', label: 'Sohbet', icon: <MessageSquare size={13} />, tooltip: 'AI ile sohbet' },
    { id: 'video', type: 'preview', label: 'Önizleme', icon: <Video size={13} />, tooltip: 'Canlı önizleme' },
];

interface WorkspaceTabsProps {
    activeTab: string;
    onTabChange: (id: string, type: any) => void;
}

export const WorkspaceTabs = ({ activeTab, onTabChange }: WorkspaceTabsProps) => (
    <div className="flex items-center h-9 flex-shrink-0 overflow-x-auto"
        style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-subtle)', width: '100%' }}>
        <div className="flex items-center px-2 h-full gap-0.5 flex-1 overflow-x-auto">
            {TABS.map(tab => {
                const isActive = activeTab === tab.id || activeTab === tab.type;
                return (
                    <button key={tab.id}
                        className="wf-tab"
                        title={tab.tooltip}
                        style={{
                            borderBottom: isActive ? '2px solid var(--accent-green)' : '2px solid transparent',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                            height: 36, fontSize: 12, fontWeight: isActive ? 600 : 400,
                            gap: 5, padding: '0 14px', borderRadius: 0, flexShrink: 0,
                        }}
                        onClick={() => onTabChange(tab.id, tab.type)}
                    >
                        <span style={{ opacity: isActive ? 1 : 0.7 }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                );
            })}
        </div>
        <div className="flex items-center gap-1 px-2 flex-shrink-0">
            <button className="icon-btn" style={{ width: 24, height: 24 }} title="Daha fazla sekme">
                <MoreHorizontal size={13} />
            </button>
        </div>
    </div>
);
