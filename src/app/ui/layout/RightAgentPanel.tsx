/**
 * 📊 RIGHT AGENT PANEL - Status, progress, logs
 */

'use client';

import { useAgentStore, useUIStore, getStatusConfig } from '../state';

export function RightAgentPanel() {
  const { status, currentPlan, currentStep, activeTool, logs } = useAgentStore();
  const { showRightPanel, toggleRightPanel } = useUIStore();
  const statusConfig = getStatusConfig(status);

  if (!showRightPanel) return null;

  return (
    <div className="right-panel">
      <div className="panel-header">
        <span>🤖 AGENT STATE</span>
        <button onClick={toggleRightPanel}>✕</button>
      </div>

      <div className="state-section">
        <label>Status</label>
        <div className="state-value" style={{ color: statusConfig.color }}>
          ● {statusConfig.label}
        </div>
      </div>

      <div className="state-section">
        <label>Active Tool</label>
        <div className="state-value tool">
          {activeTool || '—'}
        </div>
      </div>

      <div className="state-section">
        <label>Progress</label>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: currentPlan
                ? `${(currentStep / currentPlan.steps.length) * 100}%`
                : '0%'
            }}
          ></div>
        </div>
        <div className="progress-text">
          {currentStep} / {currentPlan?.steps.length || 0} steps
        </div>
      </div>

      <div className="state-section logs">
        <label>Activity Log</label>
        <div className="log-container">
          {logs.map((log, i) => (
            <div key={i} className={`log-entry ${log.type}`}>
              <span className="log-time">{log.time}</span>
              <span className="log-msg">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .right-panel {
          width: 320px;
          background: #0d0d0d;
          border-left: 1px solid #1f1f1f;
          display: flex;
          flex-direction: column;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #1f1f1f;
          font-size: 11px;
          color: #888;
          font-weight: 600;
        }
        .panel-header button { 
          background: none; 
          border: none; 
          color: #555; 
          cursor: pointer;
          font-size: 14px;
        }
        .panel-header button:hover { color: #fff; }

        .state-section { 
          padding: 16px; 
          border-bottom: 1px solid #1f1f1f; 
        }
        .state-section label { 
          display: block; 
          font-size: 10px; 
          color: #555; 
          text-transform: uppercase; 
          margin-bottom: 8px; 
          letter-spacing: 0.5px; 
        }
        .state-value { 
          font-size: 14px; 
          font-weight: 500; 
        }
        .state-value.tool { 
          font-family: 'SF Mono', monospace; 
          color: #a78bfa; 
        }

        .progress-bar { 
          height: 6px; 
          background: #1f1f1f; 
          border-radius: 3px; 
          overflow: hidden; 
          margin-bottom: 8px; 
        }
        .progress-fill { 
          height: 100%; 
          background: linear-gradient(90deg, #6366f1, #8b5cf6); 
          transition: width 0.3s; 
        }
        .progress-text { 
          font-size: 11px; 
          color: #666; 
        }

        .logs { 
          flex: 1; 
          overflow: hidden; 
          display: flex; 
          flex-direction: column; 
        }
        .log-container { 
          flex: 1; 
          overflow-y: auto; 
          background: #0a0a0a; 
          border-radius: 6px; 
          padding: 8px; 
        }
        .log-entry { 
          display: flex; 
          gap: 8px; 
          padding: 4px 8px; 
          font-size: 11px; 
          border-bottom: 1px solid #151515; 
        }
        .log-time { 
          color: #555; 
          flex-shrink: 0; 
        }
        .log-msg { color: #888; }
        .log-entry.success .log-msg { color: #4ade80; }
        .log-entry.error .log-msg { color: #f87171; }
        .log-entry.warning .log-msg { color: #fbbf24; }
        .log-entry.tool .log-msg { color: #a78bfa; }
      `}</style>
    </div>
  );
}
