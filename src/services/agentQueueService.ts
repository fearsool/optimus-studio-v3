/**
 * Agent Queue Service - Dispatcher & Worker Pool
 * ==============================================
 * 
 * Rol:
 * 1. ExecutionCore'dan {executionId, stepId} alır.
 * 2. NodeExecutor'a işi yaptırır.
 * 3. Sonucu ExecutionCore'a (veya DB'ye) bildirir.
 */

import { nodeExecutors, NodeExecutionResult } from './nodeExecutors';

export interface QueueTask {
  id: string; // Unique task ID
  executionId: string;
  stepId: string;
  type: string;
  config: any;
  context: any;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'queued' | 'running' | 'completed' | 'failed';
  retries: number;
  createdAt: number;
}

export type AgentTask = QueueTask;

// Konfigürasyon
const CONCURRENCY = 5; // Netlify environment limitation
const MAX_RETRIES = 3;

class AgentQueueManager {
  private queue: QueueTask[] = [];
  private activeWorkers = 0;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      // Browser env - belki polling yapar
    }
  }

  /**
   * Kuyruğa iş ekle (Core tarafından çağrılır)
   */
  addTask(task: Omit<QueueTask, 'id' | 'status' | 'retries' | 'createdAt'>): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newTask: QueueTask = {
      ...task,
      id,
      status: 'queued',
      retries: 0,
      createdAt: Date.now()
    };

    this.queue.push(newTask);
    this.emit('task-added', newTask);

    // Hemen işlemeye çalış
    this.processQueue();

    return id;
  }

  /**
   * Kuyruğu işle
   */
  private async processQueue() {
    if (this.activeWorkers >= CONCURRENCY || this.queue.length === 0) return;

    // Get highest priority task
    const taskIndex = this.queue.findIndex(t => t.status === 'queued');
    if (taskIndex === -1) return;

    const task = this.queue[taskIndex];
    this.queue.splice(taskIndex, 1); // Remove from queue (moved to active)

    this.activeWorkers++;
    task.status = 'running';
    this.emit('task-start', task);

    try {
      await this.executeTask(task);
    } catch (error) {
      console.error('Task execution critical failure:', error);
      this.emit('task-failed', { task, error });
    } finally {
      this.activeWorkers--;
      // Recursively process next
      this.processQueue();
    }
  }

  /**
   * Worker Logic
   */
  private async executeTask(task: QueueTask) {
    const executor = nodeExecutors[task.type] || nodeExecutors['default'];

    // API Keys (Environment + Context Override)
    // Context'ten gelen anahtarlar önceliklidir (Kasa'dan gelenler)
    const contextKeys = task.context.$apiKeys || {};

    const apiKeys = {
      ...contextKeys,
      GROQ_API_KEY: process.env.GROQ_API_KEY || (import.meta as any).env?.VITE_GROQ_API_KEY,
      FAL_API_KEY: process.env.FAL_API_KEY || (import.meta as any).env?.VITE_FAL_API_KEY,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID,
      // User provided keys might overwrite above if they have same name
      ...contextKeys
    };

    try {
      const result: NodeExecutionResult = await executor(task.config, task.context, apiKeys as any);

      if (result.success) {
        task.status = 'completed';
        this.emit('task-complete', { task, result });

        // 1. Persist Result
        const { default: supabase } = await import('./supabaseService');
        await supabase.saveStepSnapshot(task.executionId, task.stepId, 'SUCCESS', result.output);

        // 2. Trigger Next Steps via Engine
        const { default: executionEngine } = await import('./executionCore');
        await executionEngine.processEvent(task.executionId);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      task.retries++;
      const { default: supabase } = await import('./supabaseService');
      const { default: executionEngine } = await import('./executionCore');
      const { ExecutionState } = await import('../types');

      if (task.retries <= MAX_RETRIES) {
        console.log(`Task ${task.id} failed, retrying (${task.retries}/${MAX_RETRIES})...`);
        task.status = 'queued';
        this.queue.push(task); // Re-queue
        this.emit('task-retry', task);

        // Transition to RETRYING state (at execution level)
        await executionEngine.transitionState(task.executionId, ExecutionState.RETRYING, `Step ${task.stepId} retry ${task.retries}/${MAX_RETRIES}`);
      } else {
        task.status = 'failed';
        this.emit('task-failed', { task, error: error.message || String(error) });

        // Save failed step snapshot
        await supabase.saveStepSnapshot(task.executionId, task.stepId, 'FAILED', null, error.message || 'Max retries exceeded');

        // Trigger event loop to check completion status
        await executionEngine.processEvent(task.executionId);
      }
    }
  }

  // Event Emitter Implementation
  on(event: string, fn: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(fn);
  }

  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}

export const agentQueue = new AgentQueueManager();
export default agentQueue;
