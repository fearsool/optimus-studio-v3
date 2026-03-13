
import { StateStore } from '../state/StateStore';
// import Database from 'better-sqlite3';
let Database: any;
try { Database = require('better-sqlite3'); } catch { Database = require('../../lib/db/BetterSqlite3Stub').Database; }

export class HeartbeatService {
    private static instance: HeartbeatService;
    private db: any;
    private interval: NodeJS.Timeout | null = null;

    private constructor(private agentId: string = 'optimus_agent') {
        this.db = StateStore.getInstance().getDatabase();
        this.init();
    }

    public static getInstance(): HeartbeatService {
        if (!HeartbeatService.instance) {
            HeartbeatService.instance = new HeartbeatService();
        }
        return HeartbeatService.instance;
    }

    private init(): void {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS agent_heartbeat (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT NOT NULL,
                status TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                metrics TEXT
            )
        `);
    }

    public async start(intervalMs: number = 30000): Promise<void> {
        console.log('❤️ Heartbeat başlatılıyor...');

        await this.beat();

        this.interval = setInterval(async () => {
            await this.beat();
        }, intervalMs);
    }

    public async beat(metrics?: any): Promise<void> {
        try {
            const stmt = this.db.prepare(
                'INSERT INTO agent_heartbeat (agent_id, status, metrics) VALUES (?, ?, ?)'
            );
            stmt.run(this.agentId, 'alive', metrics ? JSON.stringify(metrics) : null);

            this.cleanup();
        } catch (error) {
            console.error('Heartbeat hatası:', error);
        }
    }

    private cleanup(): void {
        try {
            this.db.prepare("DELETE FROM agent_heartbeat WHERE timestamp < datetime('now', '-1 day')").run();
        } catch (e) {
            // Ignore cleanup errors
        }
    }

    public async stop(): Promise<void> {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    public getStatus(): { online: boolean; lastBeat: string | null } {
        try {
            const result = this.db.prepare('SELECT * FROM agent_heartbeat ORDER BY timestamp DESC LIMIT 1').get() as any;

            if (!result) {
                return { online: false, lastBeat: null };
            }

            const lastBeat = new Date(result.timestamp);
            const now = new Date();
            const diffMinutes = (now.getTime() - lastBeat.getTime()) / (1000 * 60);

            return {
                online: diffMinutes < 5,
                lastBeat: result.timestamp
            };
        } catch (e) {
            return { online: false, lastBeat: null };
        }
    }
}
