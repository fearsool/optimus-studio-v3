
// import Database from 'better-sqlite3'; // REMOVED to avoid static import error
import path from 'path';
import fs from 'fs';
import { Database as MockDatabase } from '../../lib/db/BetterSqlite3Stub';

let Database: any;
try {
    Database = require('better-sqlite3');
} catch (e) {
    console.warn("⚠️ Native 'better-sqlite3' not found. Falling back to Pure JS Stub.");
    Database = MockDatabase;
}

/**
 * 🛡️ STATE STORE (v1.0 Compliance)
 * =================================
 * Persistent state management with versioning and rollback.
 * Uses SQLite as the single source of truth.
 */

interface StateRecord {
    id: number;
    version: number;
    execution_id: string; // UUID of the session
    state_json: string;
    message: string;
    created_at: string;
}

export class StateStore {
    private db: any;
    private static instance: StateStore;
    private currentExecutionId: string;

    private constructor() {
        // Ensure DB directory exists
        const dbPath = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }

        const dbName = process.env.STATE_DB_NAME || 'optimus_state.db';
        this.db = new Database(path.join(dbPath, dbName));

        // Optimize for concurrency
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('busy_timeout = 5000');

        this.currentExecutionId = crypto.randomUUID();
        this.init();
    }

    public static getInstance(): StateStore {
        if (!StateStore.instance) {
            StateStore.instance = new StateStore();
        }
        return StateStore.instance;
    }

    private init() {
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

    public getDatabase(): any {
        return this.db;
    }

    /**
     * Save a new state checkpoint
     */
    public saveCheckpoint(state: any, message: string = 'Auto-Save'): number {
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
    public addMedicalRecord(filePath: string, diagnosisId: string, actionType: string, resultStatus: string, message: string) {
        const stmt = this.db.prepare(`
            INSERT INTO medical_records (file_path, diagnosis_id, action_type, result_status, message)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(filePath, diagnosisId, actionType, resultStatus, message);
        console.log(`🧠 [Memory] Medical record added for ${path.basename(filePath)}: ${resultStatus}`);
    }

    /**
     * Medical Record: Get history for a file
     */
    public getMedicalHistory(filePath: string): any[] {
        const stmt = this.db.prepare('SELECT * FROM medical_records WHERE file_path = ? ORDER BY created_at DESC LIMIT 5');
        return stmt.all(filePath);
    }

    /**
     * Get the latest state
     */
    public getLatestState(): any | null {
        const stmt = this.db.prepare('SELECT state_json FROM checkpoints ORDER BY version DESC LIMIT 1');
        const row = stmt.get() as { state_json: string } | undefined;

        if (row) {
            return JSON.parse(row.state_json);
        }
        return null;
    }

    /**
     * Rollback to a specific version
     */
    public rollback(version: number): any | null {
        const stmt = this.db.prepare('SELECT state_json FROM checkpoints WHERE version = ?');
        const row = stmt.get(version) as { state_json: string } | undefined;

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
    public getHistory(limit: number = 10): StateRecord[] {
        const stmt = this.db.prepare('SELECT * FROM checkpoints ORDER BY version DESC LIMIT ?');
        return stmt.all(limit) as StateRecord[];
    }

    private getNextVersion(): number {
        const stmt = this.db.prepare('SELECT MAX(version) as max_ver FROM checkpoints');
        const row = stmt.get() as { max_ver: number };
        return (row.max_ver || 0) + 1;
    }

    // --- WhatsApp Helper Methods ---
    public async getRecentWhatsAppMessages(limit: number): Promise<any[]> {
        // In a real implementation this might fetch from a separate DB or API
        // For now we check our local table
        try {
            const stmt = this.db.prepare('SELECT * FROM whatsapp_messages ORDER BY timestamp DESC LIMIT ?');
            return stmt.all(limit).map((row: any) => ({
                text: row.text,
                isFromAgent: row.is_from_agent === 1,
                timestamp: row.timestamp
            }));
        } catch (e) {
            return []; // Table might not exist or be empty
        }
    }

    // --- Memory Manager Helper Methods ---
    public storeMemoryReference(data: any) {
        // Store short term memory references or cache
        // Implementation for MemoryManager
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO memory_references (id, data, expires_at)
            VALUES (?, ?, datetime('now', '+1 day'))
        `);
        stmt.run(data.id, JSON.stringify(data));
    }

    public getExpiredMemories(): any[] {
        const stmt = this.db.prepare('SELECT * FROM memory_references WHERE expires_at < datetime(\'now\')');
        const rows = stmt.all() as any[];
        return rows.map(r => JSON.parse(r.data));
    }

    public deleteMemoryReference(id: string) {
        const stmt = this.db.prepare('DELETE FROM memory_references WHERE id = ?');
        stmt.run(id);
    }
    public storeIntent(result: any) {
        // Mock implementation
        console.log(`[StateStore] Storing intent: ${result.intent}`);
    }

    /**
     * Get the active plan from the latest state
     */
    public getActivePlan(): any | null {
        const state = this.getLatestState();
        return state?.currentPlan || null;
    }
}
