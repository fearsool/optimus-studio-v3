
export type AgentState = {
    status: 'idle' | 'thinking' | 'executing' | 'error' | 'listening' | 'speaking';
    currentPlan: Plan | null;
    currentStep: number;
    activeTool: string | null;
    logs: LogEntry[];
};

export type Message = {
    id: number;
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

export type LogEntry = {
    time: string;
    type: 'info' | 'error' | 'warning' | 'success';
    message: string;
};

export type StudioTab = 'code' | 'workflow' | 'dashboard' | 'plan' | '3d' | 'video' | 'split' | 'chat';

export type Plan = {
    id: string;
    title: string;
    goal?: string; // Added for backward compatibility
    steps: PlanStep[];
    status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'done' | 'running';
};

export type PlanStep = {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'done' | 'running';
    estimatedTime?: number;
    action?: string; // Added
    tool?: string; // Added
    args?: any; // Added
};

export type FileNode = {
    id: string;
    name: string;
    type: 'file' | 'directory';
    path: string;
    children?: FileNode[];
};
