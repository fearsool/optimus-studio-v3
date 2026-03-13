/**
 * 🔒 OPTIMUS FAILSAFE
 * ===================
 * Güvenlik önlem sistemi
 * 
 * KORUMALAR:
 * - Loop detection
 * - API rate limiting
 * - Memory protection
 * - Latency monitoring
 */

import { FailSafeConfig, FailSafeStatus } from '../core/optimusTypes';

// ============================================
// FAILSAFE THRESHOLDS
// ============================================

const DEFAULT_THRESHOLDS: FailSafeConfig = {
    maxApiCallsPerMinute: 60,
    maxDecisionsPerMinute: 30,
    maxLoopIterations: 100,
    latencyThresholdMs: 5000,
    memoryThresholdMb: 512,
    enabled: true
};

// ============================================
// FAILSAFE CLASS
// ============================================

class OptimusFailSafe {
    private config: FailSafeConfig;
    private status: FailSafeStatus = { isTriggered: false };

    // Counters
    private apiCallCount: number = 0;
    private decisionCount: number = 0;
    private loopCounter: Map<string, number> = new Map();
    private lastResetTime: Date = new Date();

    // History
    private triggerHistory: Array<{ reason: string; timestamp: Date }> = [];

    constructor(config: Partial<FailSafeConfig> = {}) {
        this.config = { ...DEFAULT_THRESHOLDS, ...config };
        this.startResetTimer();
    }

    /**
     * Check all safety conditions
     */
    check(): FailSafeStatus {
        if (!this.config.enabled) {
            return { isTriggered: false };
        }

        // Check API rate
        if (this.apiCallCount >= this.config.maxApiCallsPerMinute) {
            return this.trigger('API rate limit exceeded');
        }

        // Check decision rate
        if (this.decisionCount >= this.config.maxDecisionsPerMinute) {
            return this.trigger('Decision rate limit exceeded');
        }

        // Check memory (if available)
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const memUsage = process.memoryUsage();
            const memMb = memUsage.heapUsed / 1024 / 1024;
            if (memMb > this.config.memoryThresholdMb) {
                return this.trigger(`Memory threshold exceeded: ${memMb.toFixed(2)}MB`);
            }
        }

        return this.status;
    }

    /**
     * Trigger failsafe
     */
    trigger(reason: string): FailSafeStatus {
        this.status = {
            isTriggered: true,
            reason,
            triggeredAt: new Date(),
            recoveryEta: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        };

        this.triggerHistory.push({ reason, timestamp: new Date() });
        console.error(`🛡️ [FailSafe] TRIGGERED: ${reason}`);

        return this.status;
    }

    /**
     * Reset failsafe
     */
    reset(): void {
        this.status = { isTriggered: false };
        this.apiCallCount = 0;
        this.decisionCount = 0;
        this.loopCounter.clear();
        console.log('✅ [FailSafe] Reset');
    }

    /**
     * Record API call
     */
    recordApiCall(): boolean {
        this.apiCallCount++;
        return this.apiCallCount < this.config.maxApiCallsPerMinute;
    }

    /**
     * Record decision
     */
    recordDecision(): boolean {
        this.decisionCount++;
        return this.decisionCount < this.config.maxDecisionsPerMinute;
    }

    /**
     * Check and record loop iteration
     */
    checkLoop(loopId: string): boolean {
        const count = (this.loopCounter.get(loopId) || 0) + 1;
        this.loopCounter.set(loopId, count);

        if (count >= this.config.maxLoopIterations) {
            this.trigger(`Loop detected: ${loopId} (${count} iterations)`);
            return false;
        }

        return true;
    }

    /**
     * Check latency
     */
    checkLatency(latencyMs: number): boolean {
        if (latencyMs > this.config.latencyThresholdMs) {
            console.warn(`⚠️ [FailSafe] High latency: ${latencyMs}ms`);
            return false;
        }
        return true;
    }

    /**
     * Start periodic reset timer
     */
    private startResetTimer(): void {
        setInterval(() => {
            this.apiCallCount = 0;
            this.decisionCount = 0;
            this.lastResetTime = new Date();
        }, 60000); // Reset counters every minute
    }

    /**
     * Get current status
     */
    getStatus(): FailSafeStatus {
        return { ...this.status };
    }

    /**
     * Get current counters
     */
    getCounters(): { api: number; decisions: number; loops: number } {
        return {
            api: this.apiCallCount,
            decisions: this.decisionCount,
            loops: this.loopCounter.size
        };
    }

    /**
     * Get trigger history
     */
    getTriggerHistory(): Array<{ reason: string; timestamp: Date }> {
        return [...this.triggerHistory];
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<FailSafeConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get configuration
     */
    getConfig(): FailSafeConfig {
        return { ...this.config };
    }

    /**
     * Check if safe to proceed
     */
    isSafe(): boolean {
        return !this.status.isTriggered;
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const failSafe = new OptimusFailSafe();
export default failSafe;
