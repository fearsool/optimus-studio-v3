export type NodeType = 'ai' | 'process' | 'api' | 'control' | 'output' | 'trigger' | 'webhook' | 'llm';

export interface WorkflowNode {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: any;
    label: string;
}

export interface WorkflowConnection {
    id: string;
    source: string;
    target: string;
}
