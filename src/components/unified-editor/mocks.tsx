
// components/unified-editor/mocks.tsx
import React from 'react';
import { FileText, Box, Video, Layout, Settings, Terminal, Play, GitBranch, Activity, Eye } from 'lucide-react';

export const FileExplorer = () => <div className="p-2 border-b border-gray-800 h-1/3">File Explorer</div>;
export const AIAssistantPanel = () => <div className="p-2 border-b border-gray-800 h-1/3">AI Assistant</div>;
export const PluginManager = () => <div className="p-2 h-1/3">Plugin Manager</div>;

export const UnifiedToolbar = ({ onViewChange, onWorkspaceChange }: any) => (
    <div className="h-12 bg-[#161b22] border-b border-gray-800 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
            <button onClick={() => onViewChange('split')} className="p-2 hover:bg-gray-700 rounded text-gray-400" title="Split View"><Layout size={18} /></button>
            <button onClick={() => onViewChange('code')} className="p-2 hover:bg-gray-700 rounded text-blue-400" title="Code View"><FileText size={18} /></button>
            <button onClick={() => onViewChange('3d')} className="p-2 hover:bg-gray-700 rounded text-green-400" title="3D View"><Box size={18} /></button>
            <button onClick={() => onViewChange('video')} className="p-2 hover:bg-gray-700 rounded text-purple-400" title="Video View"><Video size={18} /></button>
        </div>
        <div className="flex items-center gap-2">
            <select onChange={(e) => onWorkspaceChange(e.target.value)} className="bg-gray-800 text-xs rounded p-1">
                <option value="web">Web Workspace</option>
                <option value="mobile">Mobile Workspace</option>
                <option value="3d">3D Workspace</option>
                <option value="ai">AI Workspace</option>
            </select>
            <button className="text-green-500"><Play size={18} /></button>
        </div>
    </div>
);

export const MonacoEditor = ({ language, theme, aiCompletions, live3dPreview, fullScreen }: any) => (
    <div className={`bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm ${fullScreen ? 'h-full' : 'h-full border-r border-gray-800'}`}>
    // Monaco Editor ({language})
        <br />
        {aiCompletions && <span className="text-xs text-blue-400">AI Completions Active</span>}
    </div>
);

export const ThreeDEditor = ({ scene, onUpdate }: any) => (
    <div className="bg-black text-green-500 p-4 h-full flex items-center justify-center border border-gray-800">
        3D Editor / Anigravity Engine
    </div>
);

export const VideoTimelineEditor = () => (
    <div className="bg-[#1a1a1a] text-purple-400 p-4 h-full">
        Video Timeline Editor
    </div>
);

export const RealTimePreview = ({ type, code, scene }: any) => (
    <div className="h-48 border-t border-gray-800 bg-white/5 p-2">
        <div className="text-xs font-bold mb-2">REAL-TIME PREVIEW ({type})</div>
        <div className="bg-white/10 h-32 rounded"></div>
    </div>
);

export const PropertyPanel = () => <div className="p-2 border-b border-gray-800 h-1/3">Properties</div>;
export const IntegratedTerminal = () => <div className="p-2 border-b border-gray-800 h-1/3 font-mono text-xs">Terminal {'>'}_</div>;
export const PerformanceMonitor = () => <div className="p-2 h-1/3">Performance: Good</div>;
