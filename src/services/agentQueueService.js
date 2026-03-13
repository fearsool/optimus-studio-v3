"use strict";
/**
 * Agent Queue Service - Dispatcher & Worker Pool
 * ==============================================
 *
 * Rol:
 * 1. ExecutionCore'dan {executionId, stepId} alır.
 * 2. NodeExecutor'a işi yaptırır.
 * 3. Sonucu ExecutionCore'a (veya DB'ye) bildirir.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentQueue = void 0;
const nodeExecutors_1 = require("./nodeExecutors");
// Konfigürasyon
const CONCURRENCY = 5; // Netlify environment limitation
const MAX_RETRIES = 3;
class AgentQueueManager {
    constructor() {
        this.queue = [];
        this.activeWorkers = 0;
        this.listeners = new Map();
        if (typeof window !== 'undefined') {
            // Browser env - belki polling yapar
        }
    }
    /**
     * Kuyruğa iş ekle (Core tarafından çağrılır)
     */
    addTask(task) {
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newTask = {
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
    async processQueue() {
        if (this.activeWorkers >= CONCURRENCY || this.queue.length === 0)
            return;
        // Get highest priority task
        const taskIndex = this.queue.findIndex(t => t.status === 'queued');
        if (taskIndex === -1)
            return;
        const task = this.queue[taskIndex];
        this.queue.splice(taskIndex, 1); // Remove from queue (moved to active)
        this.activeWorkers++;
        task.status = 'running';
        this.emit('task-start', task);
        try {
            await this.executeTask(task);
        }
        catch (error) {
            console.error('Task execution critical failure:', error);
            this.emit('task-failed', { task, error });
        }
        finally {
            this.activeWorkers--;
            // Recursively process next
            this.processQueue();
        }
    }
    /**
     * Worker Logic
     */
    async executeTask(task) {
        var _a, _b, _c, _d;
        const executor = nodeExecutors_1.nodeExecutors[task.type] || nodeExecutors_1.nodeExecutors['default'];
        // API Keys (Environment + Context Override)
        // Context'ten gelen anahtarlar önceliklidir (Kasa'dan gelenler)
        const contextKeys = task.context.$apiKeys || {};
        const apiKeys = {
            ...contextKeys,
            GROQ_API_KEY: process.env.GROQ_API_KEY || ((_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_GROQ_API_KEY),
            FAL_API_KEY: process.env.FAL_API_KEY || ((_b = import.meta.env) === null || _b === void 0 ? void 0 : _b.VITE_FAL_API_KEY),
            TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || ((_c = import.meta.env) === null || _c === void 0 ? void 0 : _c.VITE_TELEGRAM_BOT_TOKEN),
            TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || ((_d = import.meta.env) === null || _d === void 0 ? void 0 : _d.VITE_TELEGRAM_CHAT_ID),
            // User provided keys might overwrite above if they have same name
            ...contextKeys
        };
        try {
            const result = await executor(task.config, task.context, apiKeys);
            if (result.success) {
                task.status = 'completed';
                this.emit('task-complete', { task, result });
                // 1. Persist Result
                const { default: supabase } = await Promise.resolve().then(() => __importStar(require('./supabaseService')));
                await supabase.saveStepSnapshot(task.executionId, task.stepId, 'SUCCESS', result.output);
                // 2. Trigger Next Steps via Engine
                const { default: executionEngine } = await Promise.resolve().then(() => __importStar(require('./executionCore')));
                await executionEngine.processEvent(task.executionId);
            }
            else {
                throw new Error(result.error);
            }
        }
        catch (error) {
            task.retries++;
            const { default: supabase } = await Promise.resolve().then(() => __importStar(require('./supabaseService')));
            const { default: executionEngine } = await Promise.resolve().then(() => __importStar(require('./executionCore')));
            const { ExecutionState } = await Promise.resolve().then(() => __importStar(require('../types')));
            if (task.retries <= MAX_RETRIES) {
                console.log(`Task ${task.id} failed, retrying (${task.retries}/${MAX_RETRIES})...`);
                task.status = 'queued';
                this.queue.push(task); // Re-queue
                this.emit('task-retry', task);
                // Transition to RETRYING state (at execution level)
                await executionEngine.transitionState(task.executionId, ExecutionState.RETRYING, `Step ${task.stepId} retry ${task.retries}/${MAX_RETRIES}`);
            }
            else {
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
    on(event, fn) {
        var _a;
        if (!this.listeners.has(event))
            this.listeners.set(event, new Set());
        (_a = this.listeners.get(event)) === null || _a === void 0 ? void 0 : _a.add(fn);
    }
    emit(event, data) {
        var _a;
        (_a = this.listeners.get(event)) === null || _a === void 0 ? void 0 : _a.forEach(fn => fn(data));
    }
}
exports.agentQueue = new AgentQueueManager();
exports.default = exports.agentQueue;
