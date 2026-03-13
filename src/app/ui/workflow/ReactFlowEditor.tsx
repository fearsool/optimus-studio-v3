'use client';

/**
 * ⚡ REACTFLOW WORKFLOW EDITOR - Visual Automation
 * ================================================
 * Node-based workflow editor for visual automation design.
 */

import React, { useCallback, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    MiniMap,
    addEdge,
    Connection,
    useNodesState,
    useEdgesState,
    NodeTypes,
    Handle,
    Position,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

// =============== CUSTOM NODE TYPES ===============

interface CustomNodeData {
    label: string;
    icon?: string;
    type: 'trigger' | 'action' | 'condition' | 'output';
    config?: Record<string, any>;
}

const TriggerNode: React.FC<{ data: CustomNodeData }> = ({ data }) => (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white border-2 border-green-400 shadow-lg">
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-400" />
        <div className="flex items-center gap-2">
            <span className="text-lg">{data.icon || '⚡'}</span>
            <span className="font-medium">{data.label}</span>
        </div>
    </div>
);

const ActionNode: React.FC<{ data: CustomNodeData }> = ({ data }) => (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400 shadow-lg">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-400" />
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-400" />
        <div className="flex items-center gap-2">
            <span className="text-lg">{data.icon || '⚙️'}</span>
            <span className="font-medium">{data.label}</span>
        </div>
    </div>
);

const ConditionNode: React.FC<{ data: CustomNodeData }> = ({ data }) => (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-2 border-yellow-400 shadow-lg transform rotate-0">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-yellow-400" />
        <Handle type="source" position={Position.Right} id="yes" className="w-3 h-3 bg-green-400" style={{ top: '30%' }} />
        <Handle type="source" position={Position.Right} id="no" className="w-3 h-3 bg-red-400" style={{ top: '70%' }} />
        <div className="flex items-center gap-2">
            <span className="text-lg">{data.icon || '❓'}</span>
            <span className="font-medium">{data.label}</span>
        </div>
    </div>
);

const OutputNode: React.FC<{ data: CustomNodeData }> = ({ data }) => (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white border-2 border-purple-400 shadow-lg">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-400" />
        <div className="flex items-center gap-2">
            <span className="text-lg">{data.icon || '📤'}</span>
            <span className="font-medium">{data.label}</span>
        </div>
    </div>
);

// NOTE: nodeTypes defined outside component to prevent re-creation
// This is the recommended pattern from ReactFlow docs
const nodeTypes: NodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode,
    output: OutputNode,
};

// =============== INITIAL DATA ===============
const initialNodes: Node<CustomNodeData>[] = [
    {
        id: '1',
        type: 'trigger',
        position: { x: 50, y: 100 },
        data: { label: 'Yeni İstek', icon: '📥', type: 'trigger' },
    },
    {
        id: '2',
        type: 'action',
        position: { x: 250, y: 50 },
        data: { label: 'Plan Oluştur', icon: '📋', type: 'action' },
    },
    {
        id: '3',
        type: 'condition',
        position: { x: 450, y: 100 },
        data: { label: 'Onay Gerekli?', icon: '❓', type: 'condition' },
    },
    {
        id: '4',
        type: 'action',
        position: { x: 650, y: 50 },
        data: { label: 'Çalıştır', icon: '▶️', type: 'action' },
    },
    {
        id: '5',
        type: 'output',
        position: { x: 850, y: 100 },
        data: { label: 'Sonuç', icon: '✅', type: 'output' },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22c55e' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e3-4', source: '3', sourceHandle: 'yes', target: '4', animated: true, style: { stroke: '#22c55e' } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#a855f7' } },
];

// =============== NODE PALETTE ===============
const NODE_PALETTE = [
    { type: 'trigger', label: 'Tetikleyici', icon: '⚡', color: 'green' },
    { type: 'action', label: 'Aksiyon', icon: '⚙️', color: 'blue' },
    { type: 'condition', label: 'Koşul', icon: '❓', color: 'yellow' },
    { type: 'output', label: 'Çıktı', icon: '📤', color: 'purple' },
];

// =============== MAIN COMPONENT ===============
interface ReactFlowEditorProps {
    onWorkflowChange?: (nodes: Node[], edges: Edge[]) => void;
    onNodeSelect?: (node: Node | null) => void;
}

export const ReactFlowEditor: React.FC<ReactFlowEditorProps> = ({
    onWorkflowChange,
    onNodeSelect
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1' } }, eds));
        },
        [setEdges]
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        onNodeSelect?.(node);
    }, [onNodeSelect]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        onNodeSelect?.(null);
    }, [onNodeSelect]);

    const addNode = useCallback((type: string, label: string, icon: string) => {
        const newNode: Node<CustomNodeData> = {
            id: `node-${Date.now()}`,
            type,
            position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 },
            data: { label, icon, type: type as CustomNodeData['type'] },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [setNodes]);

    const deleteSelected = useCallback(() => {
        if (selectedNode) {
            setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
            setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
            setSelectedNode(null);
        }
    }, [selectedNode, setNodes, setEdges]);

    return (
        <div className="w-full h-full flex">
            {/* Node Palette */}
            <div className="w-48 bg-[#0c0c0c] border-r border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">📦 Bileşenler</h3>
                <div className="space-y-2">
                    {NODE_PALETTE.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => addNode(item.type, item.label, item.icon)}
                            className={`w-full px-3 py-2 rounded-lg bg-${item.color}-600/20 border border-${item.color}-500/50 text-${item.color}-400 hover:bg-${item.color}-600/30 transition-colors flex items-center gap-2`}
                        >
                            <span>{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>

                {selectedNode && (
                    <div className="mt-6 pt-4 border-t border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Seçili: {selectedNode.data.label}</h3>
                        <button
                            onClick={deleteSelected}
                            className="w-full px-3 py-2 rounded-lg bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 transition-colors text-sm"
                        >
                            🗑️ Sil
                        </button>
                    </div>
                )}
            </div>

            {/* Flow Canvas */}
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-[#0a0a0a]"
                >
                    <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#222" />
                    <Controls className="bg-[#1a1a1a] border border-gray-700 rounded-lg" />
                    <MiniMap
                        nodeColor={(node) => {
                            switch (node.type) {
                                case 'trigger': return '#22c55e';
                                case 'action': return '#3b82f6';
                                case 'condition': return '#eab308';
                                case 'output': return '#a855f7';
                                default: return '#6b7280';
                            }
                        }}
                        className="bg-[#1a1a1a] border border-gray-700 rounded-lg"
                    />
                </ReactFlow>
            </div>
        </div>
    );
};

export default ReactFlowEditor;
