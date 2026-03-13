"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factoryDecisionEngine = exports.FactoryDecisionEngine = void 0;
const nemotronService_1 = require("./nemotronService");
const uuid_1 = require("uuid");
// Internal Simple Semaphore to replace crashing async-sema library
class SimpleSemaphore {
    constructor(initial) {
        this.tasks = [];
        this.count = initial;
    }
    async acquire() {
        if (this.count > 0) {
            this.count--;
            return;
        }
        return new Promise(resolve => {
            this.tasks.push(() => {
                this.count--;
                resolve();
            });
        });
    }
    release() {
        this.count++;
        if (this.tasks.length > 0 && this.count > 0) {
            const next = this.tasks.shift();
            if (next)
                next();
        }
    }
}
// ============================================
// FACTORY DECISION ENGINE CLASS
// ============================================
class FactoryDecisionEngine {
    constructor() {
        // Max 2 concurrent Nemotron calls to prevent UI freeze
        this.semaphore = new SimpleSemaphore(2);
        // In-memory audit log (should be persisted to Supabase/File in production)
        this.auditLogs = [];
    }
    /**
     * Execute a factory decision with full safety & logging
     */
    async execute(taskType, context, summary) {
        const startTime = Date.now();
        let nemotronResult = null;
        let fallbackUsed = false;
        // 1. Concurrency Control
        await this.semaphore.acquire();
        try {
            // 2. Call Nemotron
            const result = await nemotronService_1.nemotronService.executeTask({
                task_type: taskType,
                input: context,
                context_summary: summary
            });
            nemotronResult = result.result;
            fallbackUsed = result.fallback_used;
            // 3. Schema Validation
            if (!this.validateSchema(nemotronResult)) {
                console.warn('[DecisionEngine] Invalid schema, forcing retry/fallback');
                throw new Error('Invalid decision format from Nemotron');
            }
            // 4. Map to Action
            const initialDecision = {
                action: nemotronResult.decision || nemotronResult.verdict || 'ESCALATE', // Mapping variants
                reason: nemotronResult.reason || 'No reason provided',
                confidence: result.confidence * 100, // Convert 0-1 to 0-100
                params: nemotronResult
            };
            // 5. Apply Safety Rules & Execute
            const finalDecision = await this.applyDecisionLogic(initialDecision);
            // 6. Audit Logging
            this.logDecision({
                taskType,
                inputContext: context,
                nemotronOutput: nemotronResult,
                appliedAction: finalDecision.action,
                confidence: finalDecision.confidence,
                fallbackUsed: fallbackUsed,
                executionTimeMs: Date.now() - startTime
            });
            return finalDecision;
        }
        catch (e) {
            console.error(`[DecisionEngine] Critical Failure: ${e.message}`);
            // FALLBACK SAFEGUARD
            const fallbackDecision = {
                action: 'ESCALATE',
                reason: `System error: ${e.message}`,
                confidence: 0
            };
            this.logDecision({
                taskType,
                inputContext: context,
                nemotronOutput: null,
                appliedAction: 'ESCALATE',
                confidence: 0,
                fallbackUsed: true,
                executionTimeMs: Date.now() - startTime
            });
            return fallbackDecision;
        }
        finally {
            this.semaphore.release();
        }
    }
    /**
     * Validate stricter schema for automated decisions
     */
    validateSchema(result) {
        // Flexible validation to handle different task outputs, but enforce core requirements
        if (!result)
            return false;
        // Check for decision indicator fields
        const hasDecision = result.decision || result.verdict || result.action;
        const hasReason = result.reason;
        return !!(hasDecision && hasReason);
    }
    /**
     * Apply logic: Confidence checks, Action routing
     */
    async applyDecisionLogic(decision) {
        // 🔴 Rule 1: Confidence Check
        if (decision.confidence < 40) {
            console.log('[DecisionEngine] Low confidence (<40%), ESCALATING');
            return { ...decision, action: 'ESCALATE', reason: `Low confidence (${decision.confidence}%): ${decision.reason}` };
        }
        // 🔴 Rule 2: Action Mapping & Side Effects
        switch (decision.action) {
            case 'PRODUCE':
                await this.handleProduce(decision.params);
                break;
            case 'REVISE':
                await this.handleRevise(decision.params);
                break;
            case 'STOP':
                await this.handleStop(decision.params);
                break;
            case 'SKIP':
                // Do nothing, just log
                break;
            // ESCALATE is default return
        }
        return decision;
    }
    // --- ACTION HANDLERS (Placeholder for now, connected to Factory Service usually) ---
    async handleProduce(params) {
        console.log('🏭 [ACTION] PRODUCING...', params);
        // Trigger factoryService.runProductionCycle() via event or direct call
    }
    async handleRevise(params) {
        console.log('📝 [ACTION] REVISING...', params);
    }
    async handleStop(params = {}) {
        console.log('🛑 [ACTION] STOPPING production line.', params);
    }
    /**
     * Log decision to reliable storage
     */
    logDecision(entry) {
        const log = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
            ...entry
        };
        this.auditLogs.unshift(log); // Keep newest first
        // Limit log size in memory
        if (this.auditLogs.length > 100) {
            this.auditLogs.pop();
        }
        console.log(`[AuditLog] Decision Logged: ${log.appliedAction} (Conf: ${log.confidence.toFixed(1)}%)`);
    }
    /**
     * Get recent logs for debugging
     */
    getAuditLogs() {
        return this.auditLogs;
    }
}
exports.FactoryDecisionEngine = FactoryDecisionEngine;
exports.factoryDecisionEngine = new FactoryDecisionEngine();
exports.default = exports.factoryDecisionEngine;
