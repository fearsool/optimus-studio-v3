/**
 * 🧑‍💻 CODE PANEL - Monaco Editor placeholder (Phase 3)
 */

'use client';

import { useFileStore } from '../state';

export function CodePanel() {
  const { selectedFile } = useFileStore();

  return (
    <div className="code-panel">
      <div className="code-header">
        <span className="file-path">{selectedFile || 'Dosya seçilmedi'}</span>
        {selectedFile && (
          <div className="actions">
            <button title="Save">💾</button>
            <button title="Format">✨</button>
            <button title="Diff">📊</button>
          </div>
        )}
      </div>

      <div className="code-content">
        {selectedFile ? (
          <pre className="code-preview">{`// Monaco Editor Phase 3'te entegre edilecek
// Şimdilik placeholder

// Seçili dosya: ${selectedFile}

export async function main() {
    const agent = new OptimusAgent();
    await agent.initialize();
    
    // Agent ready
    console.log("🧠 Optimus hazır!");
    
    // Process request
    const result = await agent.processRequest(
        "Video oluştur"
    );
    
    return result;
}

// TODO: Monaco Editor
// - Syntax highlighting
// - Code completion  
// - Diff view
// - Real file content`}</pre>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🧑‍💻</div>
            <p>Dosya seçilmedi</p>
            <p className="hint">Explorer'dan bir dosya seçin</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .code-panel { 
          display: flex; 
          flex-direction: column; 
          height: 100%;
          background: #0a0a0a;
        }
        
        .code-header { 
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px; 
          background: #151515; 
          border-bottom: 1px solid #1f1f1f; 
        }
        .file-path {
          font-size: 12px; 
          color: #888;
          font-family: 'SF Mono', monospace;
        }
        .actions {
          display: flex;
          gap: 4px;
        }
        .actions button {
          background: transparent;
          border: 1px solid #333;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .actions button:hover {
          background: #222;
          border-color: #444;
        }
        
        .code-content { 
          flex: 1; 
          overflow: auto;
          padding: 0;
        }
        
        .code-preview { 
          margin: 0;
          padding: 20px; 
          background: #0a0a0a; 
          color: #8b949e; 
          line-height: 1.6;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 13px;
          height: 100%;
        }
        
        .empty-state { 
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center; 
          padding: 60px 40px;
          color: #555;
        }
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .empty-state p {
          margin: 8px 0;
        }
        .hint { 
          font-size: 12px;
          color: #444;
        }
      `}</style>
    </div>
  );
}
