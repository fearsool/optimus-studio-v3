"use strict";
/**
 * ⚡ OPTIMUS DECISION ENGINE
 * ==========================
 * Otonom karar motoru
 *
 * AKIŞ: Olay → Risk → Değer → Aksiyon
 *
 * Her karar şu zincirden geçer:
 * 1. Risk Evaluator
 * 2. Priority Resolver
 * 3. Policy Engine (yapmalı mı?)
 * 4. Authority Matrix (yapabilir mi?)
 * 5. FailSafe (güvenli mi?)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionEngine = void 0;
const uuid_1 = require("uuid");
const optimusCore_1 = require("../core/optimusCore");
const optimusRiskEvaluator_1 = __importDefault(require("./optimusRiskEvaluator"));
const optimusPriorityResolver_1 = __importDefault(require("./optimusPriorityResolver"));
const DEFAULT_CONFIG = {
    autoExecuteThreshold: 0.5, // Daha cesur otonom kararlar
    riskToleranceLevel: 'HIGH', // Daha fazla risk alabilir
    maxPendingDecisions: 20, // Daha geniş kuyruk
    decisionTimeoutMs: 15000 // Daha hızlı timeout
};
// ============================================
// ACTION MAPPINGS
// ============================================
const INTENT_TO_ACTION = {
    // Production
    'START_PRODUCTION': 'EXECUTE',
    'STOP_PRODUCTION': 'BLOCK',
    'CREATE_PRODUCT': 'EXECUTE',
    // Analysis
    'CHECK_STATUS': 'EXECUTE',
    'GET_REPORT': 'EXECUTE',
    // Hunter (Otonom Araştırma)
    'START_HUNTER': 'EXECUTE',
    'STOP_HUNTER': 'EXECUTE',
    'RUN_HUNT': 'EXECUTE',
    'HUNTER_STATUS': 'EXECUTE',
    'VIEW_PROBLEMS': 'EXECUTE',
    'APPROVE_TEMPLATE': 'EXECUTE',
    'GET_METRICS': 'EXECUTE',
    // Crisis
    'ACTIVATE_CRISIS': 'ESCALATE',
    'DEACTIVATE_CRISIS': 'EXECUTE',
    // Mode changes
    'SET_MODE_SILENT': 'EXECUTE',
    'SET_MODE_ADVISOR': 'EXECUTE',
    'SET_MODE_OPERATOR': 'EXECUTE',
    // Strategic
    'OPTIMIZE': 'EXECUTE',
    'SCALE_UP': 'EXECUTE',
    // AI & Conversation
    'AI_TASK': 'ADVISE',
    'GET_HELP': 'ADVISE',
    'EXPLAIN': 'ADVISE',
    'UNKNOWN': 'ADVISE' // Her şeyi AI'ya sor
};
// ============================================
// RISK LEVEL ORDERING
// ============================================
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
function riskLevelIndex(level) {
    return RISK_LEVELS.indexOf(level);
}
// ============================================
// DECISION ENGINE CLASS
// ============================================
class OptimusDecisionEngine {
    constructor(config = {}) {
        this.pendingDecisions = new Map();
        this.decisionHistory = [];
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Make a decision based on intent
     */
    async decide(intent) {
        const startTime = Date.now();
        // Check pending limit
        if (this.pendingDecisions.size >= this.config.maxPendingDecisions) {
            return this.createBlockedDecision(intent, 'Too many pending decisions');
        }
        try {
            // Step 1: Assess risk
            const riskAssessment = await optimusRiskEvaluator_1.default.evaluate(intent);
            // Step 2: Determine priority
            const priority = optimusPriorityResolver_1.default.resolve(intent, riskAssessment);
            // Step 3: Determine action
            const action = this.determineAction(intent, riskAssessment);
            // Step 4: Calculate confidence
            const confidence = this.calculateConfidence(intent, riskAssessment);
            // Step 5: Generate reason
            const reason = this.generateReason(intent, riskAssessment, action);
            const decision = {
                id: (0, uuid_1.v4)(),
                intent,
                action,
                reason,
                confidence,
                riskLevel: riskAssessment.level,
                priority,
                params: {
                    riskFactors: riskAssessment.factors,
                    mitigations: riskAssessment.mitigations,
                    processingTimeMs: Date.now() - startTime
                },
                timestamp: new Date()
            };
            // Track decision
            this.trackDecision(decision);
            // Increment core counter
            optimusCore_1.optimusCore.incrementDecisions();
            return decision;
        }
        catch (error) {
            console.error('[DecisionEngine] Error:', error);
            return this.createBlockedDecision(intent, error.message);
        }
    }
    /**
     * Determine appropriate action
     */
    determineAction(intent, risk) {
        // High-risk actions get blocked or escalated
        if (risk.level === 'CRITICAL') {
            return 'ESCALATE';
        }
        if (risk.level === 'HIGH' && riskLevelIndex(risk.level) > riskLevelIndex(this.config.riskToleranceLevel)) {
            return 'DEFER';
        }
        // Low confidence = defer (but not for production intents)
        const isProductionIntent = ['CREATE', 'PRODUCE', 'GENERATE', 'START', 'RUN', 'FACTORY'].some(keyword => intent.action.toUpperCase().includes(keyword));
        if (intent.confidence < 0.4 && !isProductionIntent) {
            return 'DEFER';
        }
        // Map intent to action
        const mappedAction = INTENT_TO_ACTION[intent.action];
        if (mappedAction) {
            return mappedAction;
        }
        // Production intents should EXECUTE even if not explicitly mapped
        if (isProductionIntent) {
            console.log(`[DecisionEngine] Production intent detected: ${intent.action} → EXECUTE`);
            return 'EXECUTE';
        }
        return 'DEFER';
    }
    /**
     * Calculate overall confidence
     */
    calculateConfidence(intent, risk) {
        // Start with intent confidence
        let confidence = intent.confidence;
        // Reduce confidence based on risk
        const riskPenalty = {
            'LOW': 0,
            'MEDIUM': 0.1,
            'HIGH': 0.25,
            'CRITICAL': 0.5
        };
        confidence -= riskPenalty[risk.level];
        // Clamp between 0 and 1
        return Math.max(0, Math.min(1, confidence));
    }
    /**
     * Generate human-readable reason
     */
    generateReason(intent, risk, action) {
        const parts = [];
        parts.push(`Intent: ${intent.action}`);
        parts.push(`Risk: ${risk.level}`);
        if (risk.factors.length > 0) {
            parts.push(`Factors: ${risk.factors.slice(0, 2).join(', ')}`);
        }
        if (action === 'DEFER' || action === 'ESCALATE') {
            parts.push(`Action ${action}: Human approval recommended`);
        }
        return parts.join(' | ');
    }
    /**
     * Create a blocked decision
     */
    createBlockedDecision(intent, reason) {
        return {
            id: (0, uuid_1.v4)(),
            intent,
            action: 'BLOCK',
            reason: `Blocked: ${reason}`,
            confidence: 0,
            riskLevel: 'HIGH',
            priority: 'P1',
            params: { error: reason },
            timestamp: new Date()
        };
    }
    /**
     * Track decision in history
     */
    trackDecision(decision) {
        this.decisionHistory.push(decision);
        // Keep last 100 decisions
        if (this.decisionHistory.length > 100) {
            this.decisionHistory = this.decisionHistory.slice(-100);
        }
        // Track pending if needs approval
        if (decision.action === 'DEFER' || decision.action === 'ESCALATE') {
            this.pendingDecisions.set(decision.id, decision);
        }
    }
    /**
     * Check if decision can auto-execute
     */
    canAutoExecute(decision) {
        // Check confidence threshold
        if (decision.confidence < this.config.autoExecuteThreshold) {
            return false;
        }
        // Check risk tolerance
        if (riskLevelIndex(decision.riskLevel) > riskLevelIndex(this.config.riskToleranceLevel)) {
            return false;
        }
        // Check action type
        if (decision.action === 'ESCALATE' || decision.action === 'DEFER') {
            return false;
        }
        return true;
    }
    /**
     * Approve a pending decision
     */
    approveDecision(decisionId) {
        const decision = this.pendingDecisions.get(decisionId);
        if (!decision)
            return null;
        decision.action = 'EXECUTE';
        decision.params.approvedAt = new Date();
        decision.params.approvedBy = 'human';
        this.pendingDecisions.delete(decisionId);
        return decision;
    }
    /**
     * Reject a pending decision
     */
    rejectDecision(decisionId, reason) {
        const decision = this.pendingDecisions.get(decisionId);
        if (!decision)
            return null;
        decision.action = 'BLOCK';
        decision.reason = reason || 'Rejected by human';
        decision.params.rejectedAt = new Date();
        this.pendingDecisions.delete(decisionId);
        return decision;
    }
    /**
     * Get pending decisions
     */
    getPendingDecisions() {
        return Array.from(this.pendingDecisions.values());
    }
    /**
     * Get decision history
     */
    getHistory(limit) {
        if (limit) {
            return this.decisionHistory.slice(-limit);
        }
        return [...this.decisionHistory];
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get current config
     */
    getConfig() {
        return { ...this.config };
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.decisionEngine = new OptimusDecisionEngine();
exports.default = exports.decisionEngine;
