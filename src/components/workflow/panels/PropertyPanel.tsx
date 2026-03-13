// src/components/workflow/panels/PropertyPanel.tsx
import React from 'react';
import { X } from 'lucide-react';

interface PropertyPanelProps {
    node?: any;
    onClose: () => void;
    onRun?: () => void;
    onSave?: () => void;
}

export const PropertyPanel = ({ node, onClose, onRun, onSave }: PropertyPanelProps) => {
    // If no node selected, show Workflow Global Properties
    if (!node) {
        return (
            <div className="h-full bg-[#0d1117] border-l border-gray-800 p-4 flex flex-col gap-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h3 className="font-bold text-gray-200 flex items-center gap-2">
                        <span className="text-lg">📋</span> WORKFLOW PROPERTIES
                    </h3>
                </div>

                <div className="space-y-4 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        <div className="font-bold text-blue-400">▸ Basic Info</div>
                        <div className="space-y-1 pl-2">
                            <label className="block text-gray-500">Name</label>
                            <input type="text" className="w-full bg-[#161b22] border border-gray-700 rounded p-1 text-gray-300" defaultValue="Video Production" />
                        </div>
                        <div className="space-y-1 pl-2">
                            <label className="block text-gray-500">Description</label>
                            <textarea className="w-full bg-[#161b22] border border-gray-700 rounded p-1 text-gray-300 h-16" defaultValue="AI video pipeline" />
                        </div>
                        <div className="space-y-1 pl-2">
                            <label className="block text-gray-500">Tags</label>
                            <input type="text" className="w-full bg-[#161b22] border border-gray-700 rounded p-1 text-gray-300" defaultValue="#video #ai #production" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="font-bold text-yellow-500">▸ Trigger</div>
                        <div className="pl-2 space-y-2">
                            <select className="w-full bg-[#161b22] border border-gray-700 rounded p-1 text-gray-300">
                                <option>Manual Trigger</option>
                                <option>Cron Schedule</option>
                                <option>Webhook Receiever</option>
                            </select>
                            <div className="text-gray-500 italic">Next run: Today at 20:00</div>
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-800 flex gap-2">
                    <button
                        onClick={onSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center gap-2"
                    >
                        🔄 Save Workflow
                    </button>
                    <button
                        onClick={onRun}
                        className="flex-1 bg-green-900/40 border border-green-700 text-green-400 p-2 rounded flex items-center justify-center gap-2 hover:bg-green-900/60"
                    >
                        ▶ Run Test
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-[#0d1117] border-l border-gray-800 p-4 flex flex-col gap-4 text-xs font-mono animate-in slide-in-from-right-10 duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="font-bold text-gray-200 flex items-center gap-2">
                    <span className="text-lg">🤖</span> NODE SETTINGS
                </h3>
                <button onClick={onClose} className="hover:bg-gray-800 p-1 rounded">✕</button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1">
                {/* Dynamic Content based on Node Type */}
                <div className="bg-[#161b22] p-2 rounded border border-gray-800">
                    <div className="text-gray-500">ID: <span className="text-gray-300">{node.id}</span></div>
                    <div className="text-gray-500">Type: <span className="text-purple-400 font-bold uppercase">{node.type}</span></div>
                </div>

                <div className="space-y-2">
                    <div className="font-bold text-purple-400">▸ Model Configuration</div>
                    <div className="space-y-2 pl-2">
                        <div className="space-y-1">
                            <label className="text-gray-500">Model</label>
                            <select className="w-full bg-[#0d1117] border border-gray-700 rounded p-1 text-white">
                                <option>gpt-4-turbo (v1106)</option>
                                <option>claude-3-opus</option>
                                <option>mistral-medium</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-gray-500 flex justify-between">
                                <span>Temperature</span> <span>0.7</span>
                            </label>
                            <input type="range" className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-gray-500">System Prompt</label>
                            <textarea className="w-full bg-[#0d1117] border border-gray-700 rounded p-1 text-gray-400 h-12 placeholder-gray-600" placeholder="Optional system instructions..." />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="font-bold text-green-400">▸ Input/Output</div>
                    <div className="space-y-2 pl-2">
                        <div className="flex items-center gap-2">
                            <span className="w-20 text-gray-500">Input Var:</span>
                            <input type="text" className="flex-1 bg-[#0d1117] border border-gray-700 rounded p-1 text-yellow-500" defaultValue={'${input_text}'} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-20 text-gray-500">Output Var:</span>
                            <input type="text" className="flex-1 bg-[#0d1117] border border-gray-700 rounded p-1 text-yellow-500" defaultValue={'${ai_response}'} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="font-bold text-orange-400">▸ Advanced</div>
                    <div className="space-y-1 pl-2">
                        <label className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer"><input type="checkbox" defaultChecked /> Stream Response</label>
                        <label className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer"><input type="checkbox" defaultChecked /> Retry on Fail (3x)</label>
                        <label className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer"><input type="checkbox" /> Save to Database</label>
                    </div>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-800 flex gap-2">
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded">Test Sample</button>
                <button className="flex-1 bg-purple-900/40 border border-purple-700 text-purple-300 hover:bg-purple-900/60 p-2 rounded">Validate</button>
            </div>
        </div>
    );
};
