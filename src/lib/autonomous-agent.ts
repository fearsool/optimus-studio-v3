import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

interface AgentMemory {
    timestamp: string;
    action: string;
    success: boolean;
    result: any;
    error?: string;
}

export class AutonomousAgent extends EventEmitter {
    private memory: AgentMemory[] = [];
    private isRunning: boolean = false;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private readonly MEMORY_FILE = path.join(process.cwd(), '.agent-memory.json');

    constructor() {
        super();
        // this.loadMemory(); // Disable load memory for now to prevent IO blocking on init
        this.startHealthMonitoring();
    }

    private loadMemory() {
        try {
            if (fs.existsSync(this.MEMORY_FILE)) {
                const data = fs.readFileSync(this.MEMORY_FILE, 'utf-8');
                this.memory = JSON.parse(data);
            }
        } catch (error) {
            console.warn('Could not load agent memory:', error);
        }
    }

    private saveMemory() {
        try {
            fs.writeFileSync(
                this.MEMORY_FILE,
                JSON.stringify(this.memory.slice(-100), null, 2),
                'utf-8'
            );
        } catch (error) {
            console.error('Could not save agent memory:', error);
        }
    }

    public async start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.emit('start', { timestamp: new Date().toISOString() });

        console.log('🚀 Autonomous Agent Started');

        // Start continuous monitoring
        this.healthCheckInterval = setInterval(async () => {
            const health = await this.checkHealth();

            if (!health.healthy) {
                await this.autoFix(health.issues);
            }
        }, 60000); // Check every minute
    }

    public async stop() {
        this.isRunning = false;

        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.emit('stop', { timestamp: new Date().toISOString() });
        console.log('🛑 Autonomous Agent Stopped');
    }

    private async checkHealth(): Promise<{ healthy: boolean; issues: any[] }> {
        try {
            // Run TypeScript check
            await execAsync('npx tsc --noEmit --skipLibCheck');
            return { healthy: true, issues: [] };
        } catch (error: any) {
            const issues = await this.analyzeError(error);
            return { healthy: false, issues };
        }
    }

    private async analyzeError(error: any): Promise<any[]> {
        const issues = [];

        if (error.message.includes('TS1259') || error.message.includes('TS1192')) {
            issues.push({
                type: 'TypeScript Import',
                description: error.message,
                fix: 'Update tsconfig.json and import statements'
            });
        }

        return issues;
    }

    private async autoFix(issues: any[]): Promise<void> {
        console.log('🔧 Starting auto-fix for', issues.length, 'issues');

        for (const issue of issues) {
            try {
                // Basic fix logic placeholder
                this.recordMemory({
                    action: `FIX_${issue.type}`,
                    success: true,
                    result: issue
                });

            } catch (error: any) {
                this.recordMemory({
                    action: `FIX_${issue.type}`,
                    success: false,
                    error: error.message,
                    result: issue
                });
            }
        }
    }

    private recordMemory(record: Omit<AgentMemory, 'timestamp'>): void {
        const memoryRecord: AgentMemory = {
            timestamp: new Date().toISOString(),
            ...record
        };

        this.memory.push(memoryRecord);
        // this.saveMemory(); // Prevent frequent writes for now

        this.emit('memory_recorded', memoryRecord);
    }

    private startHealthMonitoring(): void {
        // Minimal health monitoring init
    }
}

// Singleton instance
export const autonomousAgent = new AutonomousAgent();
