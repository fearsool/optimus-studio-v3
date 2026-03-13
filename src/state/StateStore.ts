/**
 * 🗄️ STATE STORE - SQLite-based Single Source of Truth
 * ====================================================
 * All agent state lives here. UI subscribes, Agent writes.
 */

// import Database from 'better-sqlite3'; // Moved to dynamic
import { EventEmitter } from 'events';
import path from 'path';

// =============== TYPES ===============
export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system' | 'thought';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PlanStep {
  id: number;
  action: string;
  tool: string;
  args?: Record<string, unknown>;
  status: 'pending' | 'running' | 'done' | 'failed';
  result?: string;
  error?: string;
}

export interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentState {
  status: 'idle' | 'thinking' | 'planning' | 'executing' | 'verifying' | 'error';
  currentPlanId: string | null;
  currentStep: number;
  activeTool: string | null;
  lastError: string | null;
}

export type StateEvent =
  | { type: 'agent_state_changed'; state: AgentState }
  | { type: 'message_added'; message: Message }
  | { type: 'plan_updated'; plan: Plan }
  | { type: 'memory_updated'; key: string; value: any };

// =============== STATE STORE CLASS ===============
export class StateStore extends EventEmitter {
  private static instance: StateStore;
  private db: any; // Dynamic type
  private agentState: AgentState;
  private isClient: boolean;

  public static getInstance(dbPath: string = './optimus_state.db'): StateStore {
    if (!StateStore.instance) {
      StateStore.instance = new StateStore(dbPath);
    }
    return StateStore.instance;
  }

  constructor(dbPath: string = './optimus_state.db') {
    super();
    if (StateStore.instance) {
      return StateStore.instance;
    }
    StateStore.instance = this;

    this.isClient = typeof window !== 'undefined';

    if (!this.isClient) {
      // Server-side initialization
      try {
        const Database = require('better-sqlite3');
        const fullPath = path.resolve(dbPath);
        this.db = new Database(fullPath);
        this.db.pragma('journal_mode = WAL');
        this.initSchema();
        console.log(`[StateStore] Initialized at ${fullPath}`);
      } catch (e) {
        console.error('[StateStore] Failed to load better-sqlite3, falling back to in-memory mock', e);
        this.initMockDB();
      }
    } else {
      // Client-side initialization (Mock/In-Memory)
      console.warn('[StateStore] Running in Client Mode - Using In-Memory Mock DB (State will be lost on refresh)');
      this.initMockDB();
    }

    // Load initial state
    this.agentState = this.loadAgentState();
  }

  private initMockDB() {
    // Simple in-memory storage for client-side demo
    this.db = {
      data: {
        agent_state: {},
        messages: [],
        plans: {},
        memory: {},
        logs: [],
        checkpoints: []
      },
      exec: () => { },
      pragma: () => { },
      prepare: (sql: string) => {
        // Very basic mock handler
        return {
          run: (...args: any[]) => { return { lastInsertRowid: Date.now() }; },
          get: (...args: any[]) => { return null; },
          all: (...args: any[]) => { return []; }
        };
      }
    };
  }

  private initSchema(): void {
    this.db.exec(`
      -- Agent State Table
      CREATE TABLE IF NOT EXISTS agent_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- Messages Table
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        metadata TEXT
      );

      -- Plans Table
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        goal TEXT NOT NULL,
        steps TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        completed_at INTEGER
      );

      -- Memory Table (Key-Value Store)
      CREATE TABLE IF NOT EXISTS memory (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT DEFAULT 'string',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- Logs Table
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        context TEXT,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- Checkpoints Table (Versioning)
      CREATE TABLE IF NOT EXISTS checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        state_json TEXT NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_checkpoints_timestamp ON checkpoints(timestamp);
    `);
  }

  private loadAgentState(): AgentState {
    const stmt = this.db.prepare('SELECT value FROM agent_state WHERE key = ?');
    const row = stmt.get('current_state') as { value: string } | undefined;

    if (row) {
      return JSON.parse(row.value);
    }

    // Default state
    return {
      status: 'idle',
      currentPlanId: null,
      currentStep: 0,
      activeTool: null,
      lastError: null
    };
  }



  // =============== AGENT STATE ===============

  getAgentState(): AgentState {
    return { ...this.agentState };
  }

  updateAgentState(patch: Partial<AgentState>): void {
    this.agentState = { ...this.agentState, ...patch };

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agent_state (key, value, updated_at) 
      VALUES (?, ?, strftime('%s', 'now'))
    `);
    stmt.run('current_state', JSON.stringify(this.agentState));

    this.emit('state_changed', { type: 'agent_state_changed', state: this.agentState });
  }

  // =============== CHECKPOINTS (VERSIONING) ===============

  async saveCheckpoint(state: AgentState, name: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO checkpoints (name, state_json, timestamp)
      VALUES (?, ?, strftime('%s', 'now'))
    `);

    stmt.run(name, JSON.stringify(state));
    this.log('info', `Checkpoint saved: ${name}`);
  }

  getCheckpoints(limit: number = 20): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM checkpoints 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  async restoreCheckpoint(id: number): Promise<boolean> {
    const stmt = this.db.prepare('SELECT state_json FROM checkpoints WHERE id = ?');
    const row = stmt.get(id) as { state_json: string } | undefined;

    if (!row) {
      this.log('error', `Failed to restore checkpoint: ID ${id} not found`);
      return false;
    }

    const restoredState = JSON.parse(row.state_json);
    this.updateAgentState(restoredState);
    this.log('warn', `System rolled back to checkpoint ID ${id}`);
    return true;
  }

  // =============== MESSAGES ===============

  addMessage(msg: Omit<Message, 'id' | 'timestamp'>): Message {
    const stmt = this.db.prepare(`
      INSERT INTO messages (role, content, metadata)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      msg.role,
      msg.content,
      msg.metadata ? JSON.stringify(msg.metadata) : null
    );

    const message: Message = {
      id: result.lastInsertRowid as number,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(),
      metadata: msg.metadata
    };

    this.emit('state_changed', { type: 'message_added', message });
    return message;
  }

  getMessages(limit: number = 100): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];
    return rows.map(row => ({
      id: row.id,
      role: row.role,
      content: row.content,
      timestamp: new Date(row.timestamp * 1000),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    })).reverse();
  }

  clearMessages(): void {
    this.db.prepare('DELETE FROM messages').run();
  }

  // =============== PLANS ===============

  // Requested by User: Plan Tab Accessor
  getActivePlan(): Plan | null {
    if (this.isClient) {
      // Mock data for client
      return null;
    }

    try {
      const stmt = this.db.prepare("SELECT * FROM plans WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
      const row = stmt.get();

      if (!row) return null;

      return {
        id: row.id,
        goal: row.goal,
        steps: JSON.parse(row.steps),
        status: row.status,
        createdAt: new Date(row.created_at * 1000),
        completedAt: row.completed_at ? new Date(row.completed_at * 1000) : undefined
      };
    } catch (e) {
      console.error('Error fetching active plan:', e);
      return null;
    }
  }

  savePlan(plan: Plan): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO plans (id, goal, steps, status, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      plan.id,
      plan.goal,
      JSON.stringify(plan.steps),
      plan.status,
      Math.floor(plan.createdAt.getTime() / 1000),
      plan.completedAt ? Math.floor(plan.completedAt.getTime() / 1000) : null
    );

    this.emit('state_changed', { type: 'plan_updated', plan });
  }

  getPlan(id: string): Plan | null {
    const stmt = this.db.prepare('SELECT * FROM plans WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      goal: row.goal,
      steps: JSON.parse(row.steps),
      status: row.status,
      createdAt: new Date(row.created_at * 1000),
      completedAt: row.completed_at ? new Date(row.completed_at * 1000) : undefined
    };
  }





  updatePlanStep(planId: string, stepIndex: number, update: Partial<PlanStep>): void {
    const plan = this.getPlan(planId);
    if (!plan) return;

    plan.steps[stepIndex] = { ...plan.steps[stepIndex], ...update };
    this.savePlan(plan);
  }

  // =============== MEMORY ===============

  setMemory(key: string, value: any): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memory (key, value, type, updated_at)
      VALUES (?, ?, ?, strftime('%s', 'now'))
    `);

    const type = typeof value;
    const serialized = type === 'object' ? JSON.stringify(value) : String(value);

    stmt.run(key, serialized, type);
    this.emit('state_changed', { type: 'memory_updated', key, value });
  }

  getMemory<T = any>(key: string): T | null {
    const stmt = this.db.prepare('SELECT value, type FROM memory WHERE key = ?');
    const row = stmt.get(key) as { value: string; type: string } | undefined;

    if (!row) return null;

    if (row.type === 'object') {
      return JSON.parse(row.value) as T;
    }

    return row.value as T;
  }

  getAllMemory(): Record<string, any> {
    const stmt = this.db.prepare('SELECT key, value, type FROM memory');
    const rows = stmt.all() as { key: string; value: string; type: string }[];

    const result: Record<string, any> = {};
    for (const row of rows) {
      result[row.key] = row.type === 'object' ? JSON.parse(row.value) : row.value;
    }
    return result;
  }

  deleteMemory(key: string): void {
    this.db.prepare('DELETE FROM memory WHERE key = ?').run(key);
  }

  // =============== LOGS ===============

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO logs (level, message, context)
      VALUES (?, ?, ?)
    `);

    stmt.run(level, message, context ? JSON.stringify(context) : null);
  }

  getLogs(limit: number = 100, level?: string): any[] {
    let sql = 'SELECT * FROM logs';
    const params: any[] = [];

    if (level) {
      sql += ' WHERE level = ?';
      params.push(level);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    return this.db.prepare(sql).all(...params);
  }

  // =============== UTILITIES ===============

  subscribe(callback: (event: StateEvent) => void): () => void {
    this.on('state_changed', callback);
    return () => this.off('state_changed', callback);
  }

  close(): void {
    this.db.close();
  }

  vacuum(): void {
    this.db.exec('VACUUM');
  }

  getStats(): { messages: number; plans: number; memoryKeys: number } {
    return {
      messages: (this.db.prepare('SELECT COUNT(*) as count FROM messages').get() as any).count,
      plans: (this.db.prepare('SELECT COUNT(*) as count FROM plans').get() as any).count,
      memoryKeys: (this.db.prepare('SELECT COUNT(*) as count FROM memory').get() as any).count
    };
  }
  getDatabase(): any {
    return this.db;
  }
}

// =============== EXPORT INSTANCE ===============
export function getStateStore(dbPath?: string): StateStore {
  return StateStore.getInstance(dbPath);
}
