/**
 * 🎯 ACTIVITY BAR - VS Code style left icon bar
 */

'use client';

import { useUIStore } from '../state';
import type { ViewType } from '../state';

const ICONS: Record<ViewType, { icon: string; label: string }> = {
    explorer: { icon: '📁', label: 'Explorer' },
    search: { icon: '🔍', label: 'Search' },
    agent: { icon: '🤖', label: 'Agent' },
    extensions: { icon: '🧩', label: 'Extensions' },
    settings: { icon: '⚙️', label: 'Settings' }
};

export function ActivityBar() {
    const { activeView, setActiveView, toggleRightPanel, showRightPanel } = useUIStore();

    return (
        <div className="activity-bar">
            <div className="activity-top">
                {(['explorer', 'search', 'agent', 'extensions'] as ViewType[]).map(view => (
                    <button
                        key={view}
                        className={activeView === view ? 'active' : ''}
                        onClick={() => setActiveView(view)}
                        title={ICONS[view].label}
                    >
                        {ICONS[view].icon}
                    </button>
                ))}
            </div>
            <div className="activity-bottom">
                <button
                    onClick={toggleRightPanel}
                    title="Toggle Panel"
                    className={showRightPanel ? 'active' : ''}
                >
                    📊
                </button>
                <button
                    className={activeView === 'settings' ? 'active' : ''}
                    onClick={() => setActiveView('settings')}
                    title="Settings"
                >
                    ⚙️
                </button>
            </div>

            <style jsx>{`
        .activity-bar {
          width: 48px;
          background: #0d0d0d;
          border-right: 1px solid #1f1f1f;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 8px 0;
        }
        .activity-top, .activity-bottom {
          display: flex;
          flex-direction: column;
        }
        button {
          width: 48px;
          height: 48px;
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
          opacity: 0.5;
          transition: all 0.2s;
          border-left: 2px solid transparent;
        }
        button:hover { opacity: 0.8; }
        button.active { 
          opacity: 1; 
          border-left-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }
      `}</style>
        </div>
    );
}
