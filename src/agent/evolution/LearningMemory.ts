
// src/agent/evolution/LearningMemory.ts
import { StateStore } from '../state/StateStore';
// import Database from 'better-sqlite3';
let Database: any;
try { Database = require('better-sqlite3'); } catch { Database = require('../../lib/db/BetterSqlite3Stub').Database; }
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
    private db: any;
    private memoryCache = new Map<string, LearningRecord>();

    constructor() {
        this.db = new Database('sqlite');
        // Auto-init for production, but allow manual await for tests
        this.init().catch(console.error);
    }

    public async init(): Promise<void> {
        if ((this.db as any).isConnected) return;
        await this.db.connect();
    }

    async recordError(error: Error, context: any): Promise<void> {
        const errorHash = this.hashError(error);

        // Check cache first
        if (this.memoryCache.has(errorHash)) {
            const existing = this.memoryCache.get(errorHash)!;
            existing.count++;
            existing.lastOccurred = new Date();
            await this.db.saveLearningError(existing);
            return;
        }

        // Check database if not in cache
        const similar = await this.db.getSimilarErrors({
            errorType: error.name,
            messageSnippet: error.message.substring(0, 50)
        });

        const exactMatch = similar.find(r => r.errorMessage === error.message);

        if (exactMatch) {
            exactMatch.count++;
            exactMatch.lastOccurred = new Date();
            this.memoryCache.set(errorHash, exactMatch);
            await this.db.saveLearningError(exactMatch);
            return;
        }

        // Create new record
        const learningRecord: LearningRecord = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)} `,
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
        await this.db.saveLearningError(learningRecord);
        console.log(`🧠 Learning Memory: New error recorded - ${error.message} `);
    }

    async getSimilarErrors(currentError: Error): Promise<LearningRecord[]> {
        return this.db.getSimilarErrors({
            errorType: currentError.name || currentError.constructor.name,
            messageSnippet: currentError.message.substring(0, 50)
        });
    }

    async learnFromSuccess(
        error: Error,
        solution: string,
        successRate: number
    ): Promise<void> {
        const errorHash = this.hashError(error);
        let record = this.memoryCache.get(errorHash);

        if (!record) {
            const similar = await this.getSimilarErrors(error);
            record = similar.find(r => r.errorMessage === error.message);
        }

        if (record) {
            record.fixed = true;
            record.learnedSolution = {
                solution,
                successRate,
                lastApplied: new Date(),
                applicationCount: (record.learnedSolution?.applicationCount || 0) + 1
            };

            this.memoryCache.set(errorHash, record);
            await this.db.saveLearningError(record);
            console.log(`🧠 Learning Memory: Learned solution for ${error.message}`);
        }
    }

    private hashError(error: Error): string {
        return crypto
            .createHash('md5')
            .update(`${error.name}:${error.message} `)
            .digest('hex');
    }
}
