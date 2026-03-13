// State exports - modular stores
export { useAgentStore, getStatusConfig } from './useAgentStore';
export type { AgentStatus, Plan, PlanStep, LogEntry } from './useAgentStore';

export { useMessageStore } from './useMessageStore';
export type { Message } from './useMessageStore';

export { useUIStore } from './useUIStore';
export type { ViewType, TabType } from './useUIStore';

export { useFileStore } from './useFileStore';
export type { FileNode, Project } from './useFileStore';

// Legacy compatibility - deprecated, use individual stores
export { useStudioStore } from './useStudioStore';
