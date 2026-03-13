"use strict";
/**
 * 🗄️ STATE STORE - SQLite-based Single Source of Truth
 * ====================================================
 * All agent state lives here. UI subscribes, Agent writes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateStore = exports.StateStore = void 0;
// import Database from 'better-sqlite3'; // Moved to dynamic
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
// =============== STATE STORE CLASS ===============
class StateStore extends events_1.EventEmitter {
    static getInstance(dbPath = './optimus_state.db') {
        if (!StateStore.instance) {
            StateStore.instance = new StateStore(dbPath);
        }
        return StateStore.instance;
    }
    constructor(dbPath = './optimus_state.db') {
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
                const fullPath = path_1.default.resolve(dbPath);
                this.db = new Database(fullPath);
                this.db.pragma('journal_mode = WAL');
                this.initSchema();
                console.log(`[StateStore] Initialized at ${fullPath}`);
            }
            catch (e) {
                console.error('[StateStore] Failed to load better-sqlite3, falling back to in-memory mock', e);
                this.initMockDB();
            }
        }
        else {
            // Client-side initialization (Mock/In-Memory)
            console.warn('[StateStore] Running in Client Mode - Using In-Memory Mock DB (State will be lost on refresh)');
            this.initMockDB();
        }
        // Load initial state
        this.agentState = this.loadAgentState();
    }
    initMockDB() {
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
            prepare: (sql) => {
                // Very basic mock handler
                return {
                    run: (...args) => { return { lastInsertRowid: Date.now() }; },
                    get: (...args) => { return null; },
                    all: (...args) => { return []; }
                };
            }
        };
    }
    initSchema() {
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
    loadAgentState() {
        const stmt = this.db.prepare('SELECT value FROM agent_state WHERE key = ?');
        const row = stmt.get('current_state');
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
    getAgentState() {
        return { ...this.agentState };
    }
    updateAgentState(patch) {
        this.agentState = { ...this.agentState, ...patch };
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agent_state (key, value, updated_at) 
      VALUES (?, ?, strftime('%s', 'now'))
    `);
        stmt.run('current_state', JSON.stringify(this.agentState));
        this.emit('state_changed', { type: 'agent_state_changed', state: this.agentState });
    }
    // =============== CHECKPOINTS (VERSIONING) ===============
    async saveCheckpoint(state, name) {
        const stmt = this.db.prepare(`
      INSERT INTO checkpoints (name, state_json, timestamp)
      VALUES (?, ?, strftime('%s', 'now'))
    `);
        stmt.run(name, JSON.stringify(state));
        this.log('info', `Checkpoint saved: ${name}`);
    }
    getCheckpoints(limit = 20) {
        const stmt = this.db.prepare(`
      SELECT * FROM checkpoints 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
        return stmt.all(limit);
    }
    async restoreCheckpoint(id) {
        const stmt = this.db.prepare('SELECT state_json FROM checkpoints WHERE id = ?');
        const row = stmt.get(id);
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
    addMessage(msg) {
        const stmt = this.db.prepare(`
      INSERT INTO messages (role, content, metadata)
      VALUES (?, ?, ?)
    `);
        const result = stmt.run(msg.role, msg.content, msg.metadata ? JSON.stringify(msg.metadata) : null);
        const message = {
            id: result.lastInsertRowid,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(),
            metadata: msg.metadata
        };
        this.emit('state_changed', { type: 'message_added', message });
        return message;
    }
    getMessages(limit = 100) {
        const stmt = this.db.prepare(`
      SELECT * FROM messages 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
        const rows = stmt.all(limit);
        return rows.map(row => ({
            id: row.id,
            role: row.role,
            content: row.content,
            timestamp: new Date(row.timestamp * 1000),
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined
        })).reverse();
    }
    clearMessages() {
        this.db.prepare('DELETE FROM messages').run();
    }
    // =============== PLANS ===============
    // Requested by User: Plan Tab Accessor
    getActivePlan() {
        if (this.isClient) {
            // Mock data for client
            return null;
        }
        try {
            const stmt = this.db.prepare("SELECT * FROM plans WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
            const row = stmt.get();
            if (!row)
                return null;
            return {
                id: row.id,
                goal: row.goal,
                steps: JSON.parse(row.steps),
                status: row.status,
                createdAt: new Date(row.created_at * 1000),
                completedAt: row.completed_at ? new Date(row.completed_at * 1000) : undefined
            };
        }
        catch (e) {
            console.error('Error fetching active plan:', e);
            return null;
        }
    }
    savePlan(plan) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO plans (id, goal, steps, status, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(plan.id, plan.goal, JSON.stringify(plan.steps), plan.status, Math.floor(plan.createdAt.getTime() / 1000), plan.completedAt ? Math.floor(plan.completedAt.getTime() / 1000) : null);
        this.emit('state_changed', { type: 'plan_updated', plan });
    }
    getPlan(id) {
        const stmt = this.db.prepare('SELECT * FROM plans WHERE id = ?');
        const row = stmt.get(id);
        if (!row)
            return null;
        return {
            id: row.id,
            goal: row.goal,
            steps: JSON.parse(row.steps),
            status: row.status,
            createdAt: new Date(row.created_at * 1000),
            completedAt: row.completed_at ? new Date(row.completed_at * 1000) : undefined
        };
    }
    updatePlanStep(planId, stepIndex, update) {
        const plan = this.getPlan(planId);
        if (!plan)
            return;
        plan.steps[stepIndex] = { ...plan.steps[stepIndex], ...update };
        this.savePlan(plan);
    }
    // =============== MEMORY ===============
    setMemory(key, value) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memory (key, value, type, updated_at)
      VALUES (?, ?, ?, strftime('%s', 'now'))
    `);
        const type = typeof value;
        const serialized = type === 'object' ? JSON.stringify(value) : String(value);
        stmt.run(key, serialized, type);
        this.emit('state_changed', { type: 'memory_updated', key, value });
    }
    getMemory(key) {
        const stmt = this.db.prepare('SELECT value, type FROM memory WHERE key = ?');
        const row = stmt.get(key);
        if (!row)
            return null;
        if (row.type === 'object') {
            return JSON.parse(row.value);
        }
        return row.value;
    }
    getAllMemory() {
        const stmt = this.db.prepare('SELECT key, value, type FROM memory');
        const rows = stmt.all();
        const result = {};
        for (const row of rows) {
            result[row.key] = row.type === 'object' ? JSON.parse(row.value) : row.value;
        }
        return result;
    }
    deleteMemory(key) {
        this.db.prepare('DELETE FROM memory WHERE key = ?').run(key);
    }
    // =============== LOGS ===============
    log(level, message, context) {
        const stmt = this.db.prepare(`
      INSERT INTO logs (level, message, context)
      VALUES (?, ?, ?)
    `);
        stmt.run(level, message, context ? JSON.stringify(context) : null);
    }
    getLogs(limit = 100, level) {
        let sql = 'SELECT * FROM logs';
        const params = [];
        if (level) {
            sql += ' WHERE level = ?';
            params.push(level);
        }
        sql += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(limit);
        return this.db.prepare(sql).all(...params);
    }
    // =============== UTILITIES ===============
    subscribe(callback) {
        this.on('state_changed', callback);
        return () => this.off('state_changed', callback);
    }
    close() {
        this.db.close();
    }
    vacuum() {
        this.db.exec('VACUUM');
    }
    getStats() {
        return {
            messages: this.db.prepare('SELECT COUNT(*) as count FROM messages').get().count,
            plans: this.db.prepare('SELECT COUNT(*) as count FROM plans').get().count,
            memoryKeys: this.db.prepare('SELECT COUNT(*) as count FROM memory').get().count
        };
    }
    getDatabase() {
        return this.db;
    }
}
exports.StateStore = StateStore;
// =============== EXPORT INSTANCE ===============
function getStateStore(dbPath) {
    return StateStore.getInstance(dbPath);
}
exports.getStateStore = getStateStore;
