"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.failSafe = void 0;
// ============================================
// FAILSAFE THRESHOLDS
// ============================================
const DEFAULT_THRESHOLDS = {
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
    constructor(config = {}) {
        this.status = { isTriggered: false };
        // Counters
        this.apiCallCount = 0;
        this.decisionCount = 0;
        this.loopCounter = new Map();
        this.lastResetTime = new Date();
        // History
        this.triggerHistory = [];
        this.config = { ...DEFAULT_THRESHOLDS, ...config };
        this.startResetTimer();
    }
    /**
     * Check all safety conditions
     */
    check() {
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
    trigger(reason) {
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
    reset() {
        this.status = { isTriggered: false };
        this.apiCallCount = 0;
        this.decisionCount = 0;
        this.loopCounter.clear();
        console.log('✅ [FailSafe] Reset');
    }
    /**
     * Record API call
     */
    recordApiCall() {
        this.apiCallCount++;
        return this.apiCallCount < this.config.maxApiCallsPerMinute;
    }
    /**
     * Record decision
     */
    recordDecision() {
        this.decisionCount++;
        return this.decisionCount < this.config.maxDecisionsPerMinute;
    }
    /**
     * Check and record loop iteration
     */
    checkLoop(loopId) {
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
    checkLatency(latencyMs) {
        if (latencyMs > this.config.latencyThresholdMs) {
            console.warn(`⚠️ [FailSafe] High latency: ${latencyMs}ms`);
            return false;
        }
        return true;
    }
    /**
     * Start periodic reset timer
     */
    startResetTimer() {
        setInterval(() => {
            this.apiCallCount = 0;
            this.decisionCount = 0;
            this.lastResetTime = new Date();
        }, 60000); // Reset counters every minute
    }
    /**
     * Get current status
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Get current counters
     */
    getCounters() {
        return {
            api: this.apiCallCount,
            decisions: this.decisionCount,
            loops: this.loopCounter.size
        };
    }
    /**
     * Get trigger history
     */
    getTriggerHistory() {
        return [...this.triggerHistory];
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Check if safe to proceed
     */
    isSafe() {
        return !this.status.isTriggered;
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.failSafe = new OptimusFailSafe();
exports.default = exports.failSafe;
