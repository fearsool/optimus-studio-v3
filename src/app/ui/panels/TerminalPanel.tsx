/**
 * 🖥️ TERMINAL PANEL - Terminal interface (Phase 4)
 */

'use client';

export function TerminalPanel() {
    return (
        <div className="terminal-panel">
            <div className="terminal-header">
                <span>🖥️ Terminal</span>
                <div className="actions">
                    <button title="Clear">🗑️</button>
                    <button title="New Terminal">➕</button>
                </div>
            </div>

            <div className="terminal-content">
                <div className="term-line">
                    <span className="prompt">$</span> optimus --version
                </div>
                <div className="term-line output">
                    Optimus Studio v1.0.0
                </div>
                <div className="term-line">
                    <span className="prompt">$</span> optimus status
                </div>
                <div className="term-line output success">
                    ✓ Agent: Running
                </div>
                <div className="term-line output success">
                    ✓ LLM: Connected (localhost:1234)
                </div>
                <div className="term-line output">
                    ✓ Tools: 3 registered
                </div>
                <div className="term-line">
                    <span className="prompt">$</span> <span className="cursor">_</span>
                </div>
            </div>

            <div className="terminal-note">
                💡 xterm.js Phase 4'te entegre edilecek
            </div>

            <style jsx>{`
        .terminal-panel { 
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0a0a0a; 
          font-family: 'SF Mono', 'Fira Code', monospace;
        }
        
        .terminal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: #111;
          border-bottom: 1px solid #1f1f1f;
          font-size: 12px;
          color: #888;
        }
        .actions {
          display: flex;
          gap: 4px;
        }
        .actions button {
          background: transparent;
          border: none;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 12px;
          opacity: 0.6;
        }
        .actions button:hover {
          opacity: 1;
        }
        
        .terminal-content { 
          flex: 1;
          padding: 16px; 
          overflow-y: auto;
        }
        
        .term-line { 
          margin-bottom: 4px;
          font-size: 13px;
        }
        .prompt { 
          color: #6366f1; 
          margin-right: 8px; 
        }
        .output { 
          color: #888; 
          padding-left: 20px; 
        }
        .output.success { 
          color: #4ade80; 
        }
        .output.error { 
          color: #f87171; 
        }
        
        .cursor { 
          animation: blink 1s infinite; 
        }
        @keyframes blink { 
          0%, 50% { opacity: 1; } 
          51%, 100% { opacity: 0; } 
        }
        
        .terminal-note {
          padding: 8px 16px;
          background: #151515;
          border-top: 1px solid #1f1f1f;
          font-size: 11px;
          color: #555;
        }
      `}</style>
        </div>
    );
}
