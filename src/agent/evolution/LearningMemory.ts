
// src/agent/evolution/LearningMemory.ts
import * as crypto from 'crypto';

export interface LearningRecord {
    id: string;
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    context: any;
    firstOccurred: Date;
    lastOccurred: Date;
    count: number;
    fixed: boolean;
    fixAttempts: any[];
    learnedSolution: any | null;
}


export class LearningMemory {
    private db = {
        async saveLearningError(_rec: any) { /* no-op */ },
        async getSimilarErrors(_opts: any) { return []; }
    };
    private memoryCache = new Map<string, LearningRecord>();

    constructor() {
        // In-memory only — no external DB dependency
    }

    public async init(): Promise<void> {
        // No-op: in-memory mode
    }

    async recordError(error: Error, context: any): Promise<void> {
        const errorHash = this.hashError(error);
        if (this.memoryCache.has(errorHash)) {
            const existing = this.memoryCache.get(errorHash)!;
            existing.count++;
            existing.lastOccurred = new Date();
            return;
        }
        const learningRecord: LearningRecord = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            errorType: error.name || error.constructor.name,
            errorMessage: error.message,
            stackTrace: error.stack,
            context: context,
            firstOccurred: new Date(),
            lastOccurred: new Date(),
            count: 1,
            fixed: false,
            fixAttempts: [],
            learnedSolution: null
        };
        this.memoryCache.set(errorHash, learningRecord);
    }

    async getSimilarErrors(currentError: Error): Promise<LearningRecord[]> {
        const snippet = currentError.message.substring(0, 50);
        return Array.from(this.memoryCache.values()).filter(r =>
            r.errorType === currentError.name || r.errorMessage.startsWith(snippet)
        );
    }

    async learnFromSuccess(error: Error, solution: string, successRate: number): Promise<void> {
        const errorHash = this.hashError(error);
        const record = this.memoryCache.get(errorHash);
        if (record) {
            record.fixed = true;
            record.learnedSolution = {
                solution,
                successRate,
                lastApplied: new Date(),
                applicationCount: (record.learnedSolution?.applicationCount || 0) + 1
            };
            this.memoryCache.set(errorHash, record);
        }
    }

    private hashError(error: Error): string {
        return require('crypto')
            .createHash('md5')
            .update(`${error.name}:${error.message}`)
            .digest('hex');
    }
}
