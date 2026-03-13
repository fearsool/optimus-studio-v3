import { StateStore } from '../../state/StateStore';

export class GlobalErrorHandler {
    private static instance: GlobalErrorHandler;
    private stateStore = StateStore.getInstance();

    public static getInstance(): GlobalErrorHandler {
        if (!GlobalErrorHandler.instance) {
            GlobalErrorHandler.instance = new GlobalErrorHandler();
        }
        return GlobalErrorHandler.instance;
    }

    // FIX: Catch unhandled errors
    public init() {
        if (typeof process !== 'undefined') {
            process.on('uncaughtException', (error) => {
                this.logError(error, 'uncaughtException');
                this.recoverFromCrash();
            });

            process.on('unhandledRejection', (reason, promise) => {
                this.logError(reason as Error, 'unhandledRejection');
            });
        }
    }

    private logError(error: Error, type: string) {
        console.error(`[${type}]`, error);
        this.stateStore.log('error', `Global Error: ${error.message}`, { stack: error.stack, type });
    }

    // FIX: Auto-recovery mechanism
    private async recoverFromCrash(): Promise<void> {
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
