/**
 * 🎯 TOPBAR - Header with branding and status
 */

'use client';

import { useAgentStore, getStatusConfig } from '../state';

export function Topbar() {
  const { status } = useAgentStore();
  const statusConfig = getStatusConfig(status);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="brand">🧠 Optimus Studio</span>
        <span className="separator">|</span>
        <span className="workspace">omniflow-factory</span>
      </div>
      <div className="topbar-center">
        <div
          className="status-badge"
          style={{ color: statusConfig.color, background: statusConfig.bg }}
        >
          <span className="status-dot" style={{ background: statusConfig.color }}></span>
          {statusConfig.label}
        </div>
      </div>
      <div className="topbar-right">
        <button className="mode-btn active">Agent</button>
        <button className="mode-btn">Code</button>
      </div>

      <style jsx>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          padding: 0 16px;
          background: #111;
          border-bottom: 1px solid #1f1f1f;
        }
        .topbar-left { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
        }
        .brand { 
          font-weight: 600; 
          color: #fff; 
          font-size: 14px;
        }
        .separator { color: #333; }
        .workspace { 
          color: #666; 
          font-size: 12px; 
        }
        .topbar-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-dot { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
        }
        .topbar-right {
          display: flex;
          gap: 4px;
        }
        .mode-btn {
          padding: 4px 12px;
          background: transparent;
          border: 1px solid #333;
          border-radius: 4px;
          color: #888;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mode-btn:hover { 
          border-color: #555; 
          color: #aaa; 
        }
        .mode-btn.active { 
          background: #6366f1; 
          border-color: #6366f1; 
          color: #fff; 
        }
      `}</style>
    </div>
  );
}
