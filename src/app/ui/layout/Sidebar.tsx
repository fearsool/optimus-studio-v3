/**
 * 📁 SIDEBAR - File explorer with project management
 */

'use client';

import { useState } from 'react';
import { useUIStore, useFileStore, useAgentStore } from '../state';
import type { FileNode } from '../state';

export function Sidebar() {
    const { activeView } = useUIStore();
    const {
        projects,
        activeProjectId,
        files,
        selectedFile,
        setSelectedFile,
        toggleFolder,
        addProject,
        setActiveProject
    } = useFileStore();
    const { addLog } = useAgentStore();

    const [showAddProject, setShowAddProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const handleAddProject = () => {
        if (newProjectName.trim()) {
            addProject(newProjectName.trim(), `/${newProjectName.toLowerCase().replace(/\s+/g, '-')}`);
            addLog('success', `Proje eklendi: ${newProjectName}`);
            setNewProjectName('');
            setShowAddProject(false);
        }
    };

    const renderFileTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map(node => (
            <div key={node.path}>
                <div
                    className={`file-item ${selectedFile === node.path ? 'selected' : ''}`}
                    style={{ paddingLeft: `${12 + depth * 16}px` }}
                    onClick={() => {
                        if (node.type === 'folder') {
                            toggleFolder(node.path);
                        } else {
                            setSelectedFile(node.path);
                            addLog('info', `Dosya: ${node.name}`);
                        }
                    }}
                >
                    <span className="file-icon">
                        {node.type === 'folder' ? (node.isOpen ? '📂' : '📁') : '📄'}
                    </span>
                    <span className="file-name">{node.name}</span>
                </div>
                {node.type === 'folder' && node.isOpen && node.children && (
                    renderFileTree(node.children, depth + 1)
                )}
            </div>
        ));
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <span className="sidebar-title">
                    {activeView === 'explorer' && 'EXPLORER'}
                    {activeView === 'search' && 'SEARCH'}
                    {activeView === 'agent' && 'AGENT'}
                    {activeView === 'extensions' && 'EXTENSIONS'}
                    {activeView === 'settings' && 'SETTINGS'}
                </span>
            </div>
            <div className="sidebar-content">
                {activeView === 'explorer' && (
                    <>
                        {/* Project Selector */}
                        <div className="project-section">
                            <div className="section-header">
                                <span>PROJELER</span>
                                <button
                                    className="add-btn"
                                    onClick={() => setShowAddProject(!showAddProject)}
                                    title="Proje Ekle"
                                >
                                    ➕
                                </button>
                            </div>

                            {/* Add Project Form */}
                            {showAddProject && (
                                <div className="add-project-form">
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
                                        placeholder="Proje adı..."
                                        autoFocus
                                    />
                                    <div className="form-actions">
                                        <button onClick={handleAddProject}>✓</button>
                                        <button onClick={() => setShowAddProject(false)}>✕</button>
                                    </div>
                                </div>
                            )}

                            {/* Project List */}
                            <div className="project-list">
                                {projects.map(project => (
                                    <div
                                        key={project.id}
                                        className={`project-item ${project.id === activeProjectId ? 'active' : ''}`}
                                        onClick={() => setActiveProject(project.id)}
                                    >
                                        <span className="project-icon">📦</span>
                                        <span className="project-name">{project.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* File Tree */}
                        <div className="file-section">
                            <div className="section-header">
                                <span>DOSYALAR</span>
                            </div>
                            <div className="file-tree">
                                {renderFileTree(files)}
                            </div>
                        </div>
                    </>
                )}

                {activeView === 'search' && (
                    <div className="search-panel">
                        <input type="text" placeholder="Ara..." className="search-input" />
                        <p className="empty-text">Aramak için yazın...</p>
                    </div>
                )}

                {activeView === 'agent' && (
                    <div className="agent-panel">
                        <div className="agent-info">
                            <div className="avatar">🧠</div>
                            <div className="details">
                                <strong>Optimus Agent</strong>
                                <span>v1.0.0</span>
                            </div>
                        </div>
                        <div className="agent-tools">
                            <div className="tool-item">🔧 file_tool</div>
                            <div className="tool-item">🖥️ terminal_tool</div>
                            <div className="tool-item">🏭 factory_tool</div>
                        </div>
                    </div>
                )}

                {activeView === 'extensions' && (
                    <div className="extensions-panel">
                        <div className="ext-item installed">🧩 example-skill</div>
                        <div className="ext-item">➕ Extension ekle...</div>
                    </div>
                )}

                {activeView === 'settings' && (
                    <div className="settings-panel">
                        <div className="setting-item">
                            <label>LLM Endpoint</label>
                            <input type="text" defaultValue="http://localhost:1234" />
                        </div>
                        <div className="setting-item">
                            <label>Model</label>
                            <select defaultValue="local">
                                <option value="local">Local LLM</option>
                                <option value="ollama">Ollama</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .sidebar {
          width: 260px;
          background: #111;
          border-right: 1px solid #1f1f1f;
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          padding: 12px 16px;
          border-bottom: 1px solid #1f1f1f;
        }
        .sidebar-title { 
          font-size: 11px; 
          color: #666; 
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .sidebar-content { 
          flex: 1; 
          overflow-y: auto; 
        }

        /* Project Section */
        .project-section, .file-section {
          border-bottom: 1px solid #1f1f1f;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          font-size: 10px;
          color: #555;
          letter-spacing: 0.5px;
        }
        .add-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          opacity: 0.6;
          padding: 2px 6px;
        }
        .add-btn:hover { opacity: 1; }

        /* Add Project Form */
        .add-project-form {
          padding: 8px 12px;
          background: #0d0d0d;
        }
        .add-project-form input {
          width: 100%;
          padding: 8px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .add-project-form input:focus {
          outline: none;
          border-color: #6366f1;
        }
        .form-actions {
          display: flex;
          gap: 8px;
        }
        .form-actions button {
          flex: 1;
          padding: 6px;
          background: #222;
          border: 1px solid #333;
          border-radius: 4px;
          color: #fff;
          cursor: pointer;
        }
        .form-actions button:first-child { background: #22c55e; border-color: #22c55e; }
        .form-actions button:last-child { background: #ef4444; border-color: #ef4444; }

        /* Project List */
        .project-list {
          padding: 4px 0;
        }
        .project-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.1s;
        }
        .project-item:hover { background: #1a1a1a; }
        .project-item.active { 
          background: #1e1e3f; 
          color: #a5b4fc;
          border-left: 2px solid #6366f1;
        }
        .project-icon { font-size: 14px; }

        /* File Tree */
        .file-tree { padding: 4px 0; }
        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          cursor: pointer;
          transition: background 0.1s;
          font-size: 13px;
        }
        .file-item:hover { background: #1a1a1a; }
        .file-item.selected { background: #1e1e3f; color: #a5b4fc; }
        .file-icon { font-size: 14px; }
        .file-name { font-size: 12px; }

        /* Search Panel */
        .search-input {
          width: calc(100% - 24px);
          margin: 8px 12px;
          padding: 8px 12px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
        }
        .search-input:focus { outline: none; border-color: #6366f1; }
        .empty-text { padding: 12px; color: #555; font-size: 12px; }

        /* Agent Panel */
        .agent-info { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 16px; 
          border-bottom: 1px solid #1f1f1f; 
        }
        .avatar { font-size: 32px; }
        .details { display: flex; flex-direction: column; }
        .details strong { color: #fff; font-size: 14px; }
        .details span { font-size: 11px; color: #666; }
        .agent-tools { padding: 12px; }
        .tool-item { 
          padding: 8px 12px; 
          margin: 4px 0; 
          background: #1a1a1a; 
          border-radius: 4px; 
          font-size: 12px; 
        }

        /* Extensions */
        .ext-item { padding: 10px 16px; cursor: pointer; font-size: 13px; }
        .ext-item:hover { background: #1a1a1a; }
        .ext-item.installed { color: #4ade80; }

        /* Settings */
        .setting-item { padding: 12px 16px; }
        .setting-item label { 
          display: block; 
          font-size: 11px; 
          color: #666; 
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .setting-item input, .setting-item select {
          width: 100%;
          padding: 8px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
        }
      `}</style>
        </div>
    );
}
