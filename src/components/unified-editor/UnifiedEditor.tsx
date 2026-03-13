
// components/unified-editor/UnifiedEditor.tsx
'use client';

import React, { useState, useCallback } from 'react';
// Layout Components
import { OptimusLayout } from '../layout/OptimusLayout';
import { LeftPanel } from '../layout/LeftPanel';
import { RightPanel } from '../layout/RightPanel';
import { BottomPanel } from '../layout/BottomPanel';
import { WorkspaceTabs } from '../workspace/WorkspaceTabs';

// Feature Components
import { CodeEditor } from '../../app/ui/editor/CodeEditor';
import { FileExplorer } from '../../app/ui/explorer/FileExplorer';
import { ChatPanel } from '../../app/ui/panels/ChatPanel';
import { WorkflowDesigner } from '../workflow/WorkflowDesigner';
import PersonalAgentDashboard from '../../app/ui/panels/PersonalAgentDashboard';
import { TemplateStore, AutomationTemplate } from '../templates/TemplateStore';
import { Upload, Bot } from 'lucide-react';

interface UnifiedEditorProps {
    fileContent: string;
    setFileContent: (content: string) => void;
    currentFilePath: string | null;
    setCurrentFilePath: (path: string | null) => void;
    messages: any[];
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
    startListening: () => void;
    isLoading: boolean;
    agentState: any;
    onFixProblem?: (problem: any) => void;
}

export default function UnifiedEditor({
    fileContent,
    setFileContent,
    currentFilePath,
    setCurrentFilePath,
    messages,
    input,
    setInput,
    sendMessage,
    startListening,
    isLoading,
    agentState
}: UnifiedEditorProps) {
    // Layout State
    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);
    const [showBottom, setShowBottom] = useState(true);

    // Workspace State
    const [activeTabId, setActiveTabId] = useState('page.tsx');
    const [activeMode, setActiveMode] = useState<'code' | 'workflow' | 'preview' | 'personal_agent' | 'dashboard' | 'factory' | 'editor' | 'templates' | 'chat'>('workflow');
    const [dragActive, setDragActive] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState<AutomationTemplate | null>(null);

    // Helpers
    const handleTabChange = (id: string, type: any) => {
        setActiveTabId(id);
        setActiveMode(type);
    };

    // Load template onto workflow canvas
    const handleLoadTemplate = (template: AutomationTemplate) => {
        setPendingTemplate(template);
        setActiveMode('workflow');
        setActiveTabId('workflow');
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            // Check if we really left the window
            if (e.clientX === 0 && e.clientY === 0) {
                setDragActive(false);
            }
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Handle file upload here
            console.log("File dropped:", e.dataTransfer.files[0]);
            // alert(`File uploaded: ${e.dataTransfer.files[0].name}`);
        }
    }, []);

    const getLanguage = () => {
        if (!currentFilePath) return 'javascript';
        if (currentFilePath.endsWith('.tsx') || activeTabId.endsWith('.tsx')) return 'typescript';
        if (currentFilePath.endsWith('.ts')) return 'typescript';
        return 'javascript';
    };

    return (
        <OptimusLayout
            activeMode={activeMode}
            onModeChange={(mode: any) => setActiveMode(mode)}
            showLeft={showLeft}
            showRight={showRight}
            showBottom={showBottom}
            toggleLeft={() => setShowLeft(!showLeft)}
            toggleRight={() => setShowRight(!showRight)}
            toggleBottom={() => setShowBottom(!showBottom)}

            // 1. LEFT PANEL CONTENT
            leftPanelContent={
                <LeftPanel
                    onNavigate={(mode) => setActiveMode(mode as any)}
                    fileExplorerContent={
                        <FileExplorer
                            onFileOpen={(path: string, content: string) => {
                                setCurrentFilePath(path);
                                setFileContent(content);
                                setActiveMode('code');
                            }}
                        />
                    }
                    aiToolsContent={
                        <div className="h-full flex flex-col">
                            <ChatPanel
                                messages={messages}
                                input={input}
                                setInput={setInput}
                                sendMessage={sendMessage}
                                startListening={startListening}
                                isLoading={isLoading}
                            />
                        </div>
                    }
                    nodesContent={
                        <div className="p-4 bg-[#0d1117] h-full text-xs text-gray-400 italic">
                            Use the internal palette inside the Workflow Designer.
                        </div>
                    }
                    projectContent={
                        <div className="flex flex-col gap-2">
                            <button className="p-2 bg-green-900/30 text-green-400 border border-green-900 rounded text-left text-xs hover:bg-green-900/50 transition-all flex items-center gap-2">
                                <span className="font-bold">+</span> New Automation Project
                            </button>
                            <button className="p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded text-left text-xs hover:bg-gray-700">
                                📂 Open Project from Users/PC
                            </button>
                            <div className="mt-4 pt-2 border-t border-gray-800">
                                <div className="text-[10px] text-gray-500 mb-2 font-bold uppercase">FACTORY TEMPLATES</div>
                                <div className="space-y-1">
                                    <div className="p-2 bg-gray-800/50 rounded border border-gray-700/50 text-xs hover:border-blue-500 cursor-pointer group">
                                        <div className="text-white group-hover:text-blue-400 font-medium">🚀 Mind Trap (Viral)</div>
                                        <div className="text-[10px] text-gray-500">Psychology/Dark patterns video gen</div>
                                    </div>
                                    <div className="p-2 bg-gray-800/50 rounded border border-gray-700/50 text-xs hover:border-blue-500 cursor-pointer group">
                                        <div className="text-white group-hover:text-blue-400 font-medium">💼 Sessiz Güç (Business)</div>
                                        <div className="text-[10px] text-gray-500">Motivation & Finance niche</div>
                                    </div>
                                    <div className="p-2 bg-gray-800/50 rounded border border-gray-700/50 text-xs hover:border-blue-500 cursor-pointer group">
                                        <div className="text-white group-hover:text-blue-400 font-medium">📧 Auto-Emailer</div>
                                        <div className="text-[10px] text-gray-500">Newsletter automation</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                />
            }

            // 2. RIGHT PANEL CONTENT
            rightPanelContent={
                <RightPanel
                    mode={activeMode === 'preview' ? 'code' : activeMode as any}
                />
            }

            // 3. BOTTOM PANEL CONTENT
            bottomPanelContent={
                <BottomPanel />
            }
        >
            {/* CENTER WORKSPACE */}
            <div
                className="flex flex-col h-full relative"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <WorkspaceTabs activeTab={activeTabId} onTabChange={handleTabChange} />

                <div className="flex-1 overflow-hidden bg-[#1e1e1e] relative">
                    {/* Drag Overlay */}
                    {dragActive && (
                        <div className="absolute inset-0 z-50 bg-blue-500/20 border-2 border-dashed border-blue-500 flex items-center justify-center pointer-events-none">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                                <Upload size={20} />
                                <span className="font-bold">Drop files to upload</span>
                            </div>
                        </div>
                    )}

                    {(activeMode === 'code' || activeMode === 'editor') && (
                        <CodeEditor
                            code={fileContent}
                            language={getLanguage()}
                            onChange={setFileContent}
                        />
                    )}
                    {(activeMode === 'workflow') && (
                        <div className="h-full w-full">
                            <WorkflowDesigner initialTemplate={pendingTemplate} onTemplateLoaded={() => setPendingTemplate(null)} />
                        </div>
                    )}
                    {(activeMode === 'personal_agent') && (
                        <div className="h-full w-full">
                            <PersonalAgentDashboard />
                        </div>
                    )}
                    {(activeMode === 'preview') && (
                        <div className="h-full w-full bg-black flex items-center justify-center">
                            <iframe
                                src="http://localhost:3002" // Previewing existing port
                                className="w-full h-full border-none"
                                title="Live Preview"
                            />
                        </div>
                    )}
                    {(activeMode === 'dashboard') && (
                        <div className="h-full w-full p-8 bg-[#0d1117] overflow-auto">
                            <h2 className="text-2xl font-bold text-white mb-6">Proje Özeti</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl hover:border-blue-500 transition-colors">
                                    <h3 className="text-blue-400 font-bold mb-2">Aktif Dosya</h3>
                                    <p className="text-2xl text-white">{activeTabId}</p>
                                </div>
                                <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl hover:border-blue-500 transition-colors">
                                    <h3 className="text-green-400 font-bold mb-2">Sistem Durumu</h3>
                                    <p className="text-2xl text-white">Çalışıyor</p>
                                </div>
                                <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl hover:border-blue-500 transition-colors">
                                    <h3 className="text-purple-400 font-bold mb-2">AI Gücü</h3>
                                    <p className="text-2xl text-white">LM Studio Etkin</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {(activeMode === 'factory') && (
                        <div className="h-full w-full p-8 bg-[#0d1117] overflow-auto flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <Bot size={32} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Otomasyon Fabrikası</h2>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    Bu bölüm üzerinden otonom içerik üreticileri ve pazarlama botları oluşturabilirsiniz. Çok yakında...
                                </p>
                            </div>
                        </div>
                    )}
                    {(activeMode === 'templates') && (
                        <div className="h-full w-full">
                            <TemplateStore onLoadTemplate={handleLoadTemplate} />
                        </div>
                    )}
                </div>
            </div>
        </OptimusLayout>
    );
}
