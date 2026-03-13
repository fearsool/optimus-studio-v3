
'use client';

export const WorkflowEditor = () => {
    return (
        <div className="h-full w-full overflow-auto bg-[#0d1117] p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Workflow Editor</h1>
                    <p className="text-gray-400">Design and automate your workflows visually</p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {/* Left Panel - Nodes */}
                    <div className="col-span-1 space-y-4">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                            <h3 className="text-white font-medium mb-3">Nodes</h3>
                            <div className="space-y-2">
                                {['AI Task', 'Data Processing', 'API Call', 'Condition', 'Loop', 'File Operation'].map((node, i) => (
                                    <div
                                        key={i}
                                        className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white cursor-move hover:border-blue-500"
                                        draggable
                                    >
                                        {node}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center Panel - Canvas */}
                    <div className="col-span-2">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 h-[600px] relative">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 bg-[size:20px_20px] bg-[linear-gradient(to_right,#1c1c1c_1px,transparent_1px),linear-gradient(to_bottom,#1c1c1c_1px,transparent_1px)]"></div>

                            {/* Sample Workflow */}
                            <div className="relative z-10">
                                <div className="absolute top-10 left-10 p-4 bg-blue-900/30 border border-blue-500 rounded-xl w-48">
                                    <div className="text-blue-400 font-medium">Start</div>
                                    <div className="text-sm text-gray-400 mt-1">Begin workflow</div>
                                </div>

                                <div className="absolute top-10 left-72 p-4 bg-green-900/30 border border-green-500 rounded-xl w-48">
                                    <div className="text-green-400 font-medium">AI Processing</div>
                                    <div className="text-sm text-gray-400 mt-1">Process with AI</div>
                                </div>

                                <div className="absolute top-40 left-72 p-4 bg-purple-900/30 border border-purple-500 rounded-xl w-48">
                                    <div className="text-purple-400 font-medium">Save Result</div>
                                    <div className="text-sm text-gray-400 mt-1">Store output</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Properties */}
                    <div className="col-span-1">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                            <h3 className="text-white font-medium mb-3">Properties</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Workflow Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm"
                                        defaultValue="Video Production"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Trigger</label>
                                    <select className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm">
                                        <option>Manual</option>
                                        <option>Schedule</option>
                                        <option>Webhook</option>
                                    </select>
                                </div>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                                    Save Workflow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
