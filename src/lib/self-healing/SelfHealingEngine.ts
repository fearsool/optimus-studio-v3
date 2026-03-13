
import { EventBus } from '../../core/EventBus';
import { StateStore } from '../../agent/state/StateStore';
// import Database from 'better-sqlite3'; // Static import removed
let Database: any;
try { Database = require('better-sqlite3'); } catch { Database = require('../../lib/db/BetterSqlite3Stub').Database; }

export class SelfHealingEngine {
    private eventBus: EventBus;
    private db: any;
    private isMonitoring: boolean = false;

    // Health thresholds
    private readonly HEALTH_THRESHOLDS = {
        // memoryUsage: 0.85, // Removed to avoid missing property
        memoryUsageRatio: 0.85,
        dbLatency: 100,    // ms
        errorRate: 0.1,    // 10%
    };

    constructor() {
        this.eventBus = EventBus.getInstance();
        // Access the raw better-sqlite3 instance from StateStore
        this.db = StateStore.getInstance().getDatabase();

        this.initializeHealingTables();
        this.setupEventListeners();
    }

    // Helper to match user's runQuery style with better-sqlite3
    private async runQuery(sql: string, params: any[] = []): Promise<any[]> {
        try {
            const stmt = this.db.prepare(sql);
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                return stmt.all(...params) as any[];
            } else {
                const res = stmt.run(...params);
                // Wrap result in array or object if needed, but for void return it's fine
                return [res];
            }
        } catch (e) {
            console.error("Query Failed:", sql, e);
            throw e;
        }
    }

    private initializeHealingTables(): void {
        const queries = [
            `CREATE TABLE IF NOT EXISTS system_health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component TEXT NOT NULL,
        status TEXT NOT NULL,
        metric_name TEXT,
        metric_value REAL,
        threshold REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

            `CREATE TABLE IF NOT EXISTS healing_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issue_id INTEGER,
        action_type TEXT NOT NULL,
        parameters TEXT,
        status TEXT DEFAULT 'pending',
        result TEXT,
        executed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

            `CREATE TABLE IF NOT EXISTS recovery_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issue_type TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        success BOOLEAN,
        duration_ms INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
        ];

        for (const query of queries) {
            this.db.exec(query);
        }
    }

    private setupEventListeners(): void {
        // Listen for system errors
        this.eventBus.on('system:error', (data: any) => {
            // EventBus passes { data, source, ... }
            this.handleSystemError(data.error || data);
        });

        // Listen for agent errors
        this.eventBus.on('agent:error', (data: any) => {
            this.handleAgentError(data.error || data);
        });
    }

    async startMonitoring(): Promise<void> {
        this.isMonitoring = true;
        console.log('🔧 Self-Healing Engine started');

        // Periodic health check
        setInterval(() => {
            this.performHealthChecks();
        }, 30000); // Every 30s
    }

    private async performHealthChecks(): Promise<void> {
        const checks = [
            this.checkDatabaseHealth(),
            this.checkMemoryHealth(),
            // this.checkAPIConnectivity(), // Skip external calls for now
            this.checkAgentHeartbeat()
        ];

        const results = await Promise.allSettled(checks);

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Health Check ${index} failed:`, result.reason);
            }
        });
    }

    private async checkDatabaseHealth(): Promise<void> {
        try {
            // 1. Connection test
            const startTime = Date.now();
            await this.runQuery('SELECT 1');
            const latency = Date.now() - startTime;

            // 2. Transaction count check (mock table if not exists)
            // Skipped complex query to avoid errors if table missing

            if (latency > this.HEALTH_THRESHOLDS.dbLatency) {
                await this.logHealthIssue('database', 'high_latency', latency, this.HEALTH_THRESHOLDS.dbLatency);
                await this.healDatabaseLatency();
            }

        } catch (error) {
            await this.handleDatabaseFailure(error as Error);
        }
    }

    private async checkMemoryHealth(): Promise<void> {
        const memoryUsage = process.memoryUsage();
        const heapUsedRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;

        if (heapUsedRatio > this.HEALTH_THRESHOLDS.memoryUsageRatio) {
            await this.logHealthIssue('memory', 'high_usage', heapUsedRatio, this.HEALTH_THRESHOLDS.memoryUsageRatio);
            await this.performMemoryCleanup();
        }
    }

    private async healDatabaseLatency(): Promise<void> {
        console.log('🔧 Healing database latency...');
        try {
            this.db.pragma('shrink_memory');
            this.db.pragma('wal_checkpoint(TRUNCATE)');

            await this.logHealingAction('database_latency', 'optimization', {
                actions: ['shrink_memory', 'wal_checkpoint']
            }, true);
        } catch (error) {
            console.error("Heal DB failed", error);
        }
    }

    private async performMemoryCleanup(): Promise<void> {
        console.log('🧹 Performing memory cleanup...');
        try {
            if (global.gc) {
                global.gc();
            }
            // Simple cache clear simulation
            await this.logHealingAction('memory_cleanup', 'garbage_collection', { forcedGC: true }, true);
        } catch (error) {
            console.error('Memory cleanup error:', error);
        }
    }

    private async handleDatabaseFailure(error: Error): Promise<void> {
        console.error('🔴 Database failure:', error);
        await this.logHealthIssue('database', 'connection_failure', 0, 0);
    }

    private async logHealthIssue(
        component: string,
        issueType: string,
        metricValue: number,
        threshold: number
    ): Promise<void> {
        await this.runQuery(
            `INSERT INTO system_health (component, status, metric_name, metric_value, threshold)
       VALUES (?, ?, ?, ?, ?)`,
            [component, 'degraded', issueType, metricValue, threshold]
        );
        // Event emission could go here
    }

    private async logHealingAction(
        issueType: string,
        actionType: string,
        parameters: any,
        success: boolean
    ): Promise<void> {
        await this.runQuery(
            `INSERT INTO recovery_history (issue_type, action_taken, success, duration_ms)
       VALUES (?, ?, ?, ?)`,
            [issueType, actionType, success ? 1 : 0, 0]
        );
    }

    private async checkAgentHeartbeat(): Promise<void> {
        try {
            const heartbeat = await this.runQuery(`
          SELECT * FROM agent_heartbeat 
          ORDER BY timestamp DESC 
          LIMIT 1
        `);

            if (heartbeat.length === 0) return;

            const lastBeat = new Date(heartbeat[0].timestamp); // Assumes generic date string or needs parsing
            const now = new Date();
            const diffMinutes = (now.getTime() - lastBeat.getTime()) / (1000 * 60);

            if (diffMinutes > 5) {
                await this.logHealthIssue('agent', 'stale_heartbeat', diffMinutes, 5);
            }
        } catch (e) {
            // Table might not exist yet
        }
    }

    private async handleSystemError(error: any): Promise<void> {
        // Simply log for now
        console.error("SelfHealing detected system error:", error);
    }

    private async handleAgentError(error: any): Promise<void> {
        console.error("SelfHealing detected agent error:", error);
        // Restart logic would go here
    }
}

// Export initialization function
export function initSelfHealingEngine(): SelfHealingEngine {
    const engine = new SelfHealingEngine();
    engine.startMonitoring().catch(console.error);
    return engine;
}
