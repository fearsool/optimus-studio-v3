/**
 * 📋 TABS BAR - Tab navigation for main content
 */

'use client';

import { useUIStore } from '../state';
import type { TabType } from '../state';

const TABS: { id: TabType; icon: string; label: string }[] = [
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'plan', icon: '📋', label: 'Plan' },
  { id: 'code', icon: '🧑‍💻', label: 'Code' },
  { id: 'terminal', icon: '🖥️', label: 'Terminal' }
];

export function TabsBar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="tabs-bar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}

      <style jsx>{`
        .tabs-bar {
          display: flex;
          background: #0d0d0d;
          border-bottom: 1px solid #1f1f1f;
        }
        .tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: #666;
          font-size: 12px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          font-family: inherit;
        }
        .tab:hover { 
          color: #aaa; 
          background: #151515; 
        }
        .tab.active { 
          color: #fff; 
          border-bottom-color: #6366f1; 
        }
      `}</style>
    </div>
  );
}
