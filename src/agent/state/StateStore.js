"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStore = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class StateStore {
    constructor() {
        // Ensure DB directory exists
        const dbPath = path_1.default.join(process.cwd(), 'data');
        if (!fs_1.default.existsSync(dbPath)) {
            fs_1.default.mkdirSync(dbPath, { recursive: true });
        }
        this.db = new better_sqlite3_1.default(path_1.default.join(dbPath, 'optimus_state.db'));
        this.currentExecutionId = crypto.randomUUID();
        this.init();
    }
    static getInstance() {
        if (!StateStore.instance) {
            StateStore.instance = new StateStore();
        }
        return StateStore.instance;
    }
    init() {
        // Create checkpoins table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        execution_id TEXT NOT NULL,
        state_json TEXT NOT NULL,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create key-value store for lightweight config
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create vector memory table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        embedding TEXT NOT NULL, 
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create medical records table for Doctor/Surgeon memory
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL,
        diagnosis_id TEXT,
        action_type TEXT NOT NULL,
        result_status TEXT NOT NULL, -- 'SUCCESS', 'FAILED', 'ROLLEDBACK'
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create whatsapp messages table for temporary communication storage
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT,
        text TEXT,
        is_from_agent BOOLEAN,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create memory references table for expiration management
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory_references (
        id TEXT PRIMARY KEY,
        data TEXT,
        expires_at DATETIME
      )
    `);
    }
    getDatabase() {
        return this.db;
    }
    /**
     * Save a new state checkpoint
     */
    saveCheckpoint(state, message = 'Auto-Save') {
        const version = this.getNextVersion();
        const stmt = this.db.prepare(`
      INSERT INTO checkpoints (version, execution_id, state_json, message)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(version, this.currentExecutionId, JSON.stringify(state), message);
        console.log(`💾 [StateStore] Checkpoint saved: v${version} - ${message}`);
        return version;
    }
    /**
     * Medical Record: Add new entry
     */
    addMedicalRecord(filePath, diagnosisId, actionType, resultStatus, message) {
        const stmt = this.db.prepare(`
            INSERT INTO medical_records (file_path, diagnosis_id, action_type, result_status, message)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(filePath, diagnosisId, actionType, resultStatus, message);
        console.log(`🧠 [Memory] Medical record added for ${path_1.default.basename(filePath)}: ${resultStatus}`);
    }
    /**
     * Medical Record: Get history for a file
     */
    getMedicalHistory(filePath) {
        const stmt = this.db.prepare('SELECT * FROM medical_records WHERE file_path = ? ORDER BY created_at DESC LIMIT 5');
        return stmt.all(filePath);
    }
    /**
     * Get the latest state
     */
    getLatestState() {
        const stmt = this.db.prepare('SELECT state_json FROM checkpoints ORDER BY version DESC LIMIT 1');
        const row = stmt.get();
        if (row) {
            return JSON.parse(row.state_json);
        }
        return null;
    }
    /**
     * Rollback to a specific version
     */
    rollback(version) {
        const stmt = this.db.prepare('SELECT state_json FROM checkpoints WHERE version = ?');
        const row = stmt.get(version);
        if (row) {
            console.warn(`🔄 [StateStore] ROLLING BACK to version ${version}`);
            // We save this rollback as a new checkpoint to preserve history of the rollback action itself
            const state = JSON.parse(row.state_json);
            this.saveCheckpoint(state, `Rollback to v${version}`);
            return state;
        }
        throw new Error(`State version ${version} not found.`);
    }
    /**
     * Get history of changes
     */
    getHistory(limit = 10) {
        const stmt = this.db.prepare('SELECT * FROM checkpoints ORDER BY version DESC LIMIT ?');
        return stmt.all(limit);
    }
    getNextVersion() {
        const stmt = this.db.prepare('SELECT MAX(version) as max_ver FROM checkpoints');
        const row = stmt.get();
        return (row.max_ver || 0) + 1;
    }
    // --- WhatsApp Helper Methods ---
    async getRecentWhatsAppMessages(limit) {
        // In a real implementation this might fetch from a separate DB or API
        // For now we check our local table
        try {
            const stmt = this.db.prepare('SELECT * FROM whatsapp_messages ORDER BY timestamp DESC LIMIT ?');
            return stmt.all(limit).map((row) => ({
                text: row.text,
                isFromAgent: row.is_from_agent === 1,
                timestamp: row.timestamp
            }));
        }
        catch (e) {
            return []; // Table might not exist or be empty
        }
    }
    // --- Memory Manager Helper Methods ---
    storeMemoryReference(data) {
        // Store short term memory references or cache
        // Implementation for MemoryManager
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO memory_references (id, data, expires_at)
            VALUES (?, ?, datetime('now', '+1 day'))
        `);
        stmt.run(data.id, JSON.stringify(data));
    }
    getExpiredMemories() {
        const stmt = this.db.prepare('SELECT * FROM memory_references WHERE expires_at < datetime(\'now\')');
        const rows = stmt.all();
        return rows.map(r => JSON.parse(r.data));
    }
    deleteMemoryReference(id) {
        const stmt = this.db.prepare('DELETE FROM memory_references WHERE id = ?');
        stmt.run(id);
    }
    storeIntent(result) {
        // Mock implementation
        console.log(`[StateStore] Storing intent: ${result.intent}`);
    }
    /**
     * Get the active plan from the latest state
     */
    getActivePlan() {
        const state = this.getLatestState();
        return (state === null || state === void 0 ? void 0 : state.currentPlan) || null;
    }
}
exports.StateStore = StateStore;
