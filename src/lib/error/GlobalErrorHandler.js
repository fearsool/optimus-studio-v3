"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorHandler = void 0;
const StateStore_1 = require("../../state/StateStore");
class GlobalErrorHandler {
    constructor() {
        this.stateStore = StateStore_1.StateStore.getInstance();
    }
    static getInstance() {
        if (!GlobalErrorHandler.instance) {
            GlobalErrorHandler.instance = new GlobalErrorHandler();
        }
        return GlobalErrorHandler.instance;
    }
    // FIX: Catch unhandled errors
    init() {
        if (typeof process !== 'undefined') {
            process.on('uncaughtException', (error) => {
                this.logError(error, 'uncaughtException');
                this.recoverFromCrash();
            });
            process.on('unhandledRejection', (reason, promise) => {
                this.logError(reason, 'unhandledRejection');
            });
        }
    }
    logError(error, type) {
        console.error(`[${type}]`, error);
        this.stateStore.log('error', `Global Error: ${error.message}`, { stack: error.stack, type });
    }
    // FIX: Auto-recovery mechanism
    async recoverFromCrash() {
        console.log('🔄 Attempting auto-recovery...');
        // 1. Rollback to last stable state (using Checkpoints)
        const checkpoints = this.stateStore.getCheckpoints(1);
        if (checkpoints && checkpoints.length > 0) {
            await this.stateStore.restoreCheckpoint(checkpoints[0].id);
            console.log('Normalized to last checkpoint.');
        }
        // 2. Restart critical services (Simulated)
        // await this.restartServices(['ai', 'database', 'workflow']);
        // 3. Send alert
        // await this.sendRecoveryAlert();
    }
}
exports.GlobalErrorHandler = GlobalErrorHandler;
