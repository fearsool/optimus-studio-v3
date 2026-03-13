/**
 * 📜 OPTIMUS POLICY ENGINE
 * ========================
 * Kural motoru - "Yapmalı mı?" sorusunu yanıtlar
 * 
 * Authority = "yapabilir mi?" (yetki kontrolü)
 * Policy = "yapmalı mı?" (iş kuralları)
 * 
 * Policy zinciri Decision Engine'den sonra çalışır
 */

import {
    Policy,
    PolicyEvaluationResult,
    ActionType,
    ResolvedIntent,
    Decision
} from '../core/optimusTypes';
import { optimusCore } from '../core/optimusCore';
import { policySet, FACTORY_POLICIES } from './optimusPolicySet';

// ============================================
// POLICY ENGINE CLASS
// ============================================

class OptimusPolicyEngine {
    private policies: Policy[] = [];
    private evaluationHistory: PolicyEvaluationResult[] = [];

    constructor() {
        // Load default policies
        this.loadPolicies(FACTORY_POLICIES);
    }

    /**
     * Load policies into engine
     */
    loadPolicies(policies: Policy[]): void {
        this.policies = [...this.policies, ...policies];
        // Sort by priority (higher priority = earlier evaluation)
        this.policies.sort((a, b) => b.priority - a.priority);
        console.log(`[PolicyEngine] Loaded ${policies.length} policies`);
    }

    /**
     * Evaluate all policies against a decision
     */
    evaluate(decision: Decision): PolicyEvaluationResult {
        for (const policy of this.policies) {
            if (!policy.enabled) continue;

            const matches = this.evaluateCondition(policy, decision);

            if (matches) {
                const result: PolicyEvaluationResult = {
                    policyId: policy.id,
                    matched: true,
                    action: policy.action,
                    reason: policy.reason
                };

                this.trackEvaluation(result);
                console.log(`[PolicyEngine] Policy matched: ${policy.rule}`);

                return result;
            }
        }

        // No policy matched - allow action
        const result: PolicyEvaluationResult = {
            policyId: 'none',
            matched: false,
            action: decision.action,
            reason: 'No policy restriction'
        };

        this.trackEvaluation(result);
        return result;
    }

    /**
     * Evaluate a single policy condition
     */
    private evaluateCondition(policy: Policy, decision: Decision): boolean {
        try {
            if (typeof policy.condition === 'function') {
                return policy.condition({
                    decision,
                    intent: decision.intent,
                    mode: optimusCore.getMode(),
                    status: optimusCore.getStatus(),
                    timestamp: new Date()
                });
            }

            // String-based condition (for simple rules)
            if (typeof policy.condition === 'string') {
                return this.evaluateStringCondition(policy.condition, decision);
            }

            return false;
        } catch (error) {
            console.error(`[PolicyEngine] Error evaluating policy ${policy.id}:`, error);
            return false;
        }
    }

    /**
     * Evaluate string-based condition
     */
    private evaluateStringCondition(condition: string, decision: Decision): boolean {
        // Simple pattern matching for common conditions
        const context = {
            action: decision.intent.action,
            confidence: decision.confidence,
            risk: decision.riskLevel,
            mode: optimusCore.getMode(),
            hour: new Date().getHours()
        };

        // Replace placeholders and evaluate
        let evalStr = condition;

        // Common conditions
        if (condition.includes('isPeakHours()')) {
            const isPeak = context.hour >= 9 && context.hour <= 18;
            evalStr = evalStr.replace('isPeakHours()', String(isPeak));
        }

        if (condition.includes('isCriticalAction()')) {
            const isCritical = ['STOP', 'DELETE', 'CRISIS'].some(a => context.action.includes(a));
            evalStr = evalStr.replace('isCriticalAction()', String(isCritical));
        }

        if (condition.includes('isLowConfidence()')) {
            evalStr = evalStr.replace('isLowConfidence()', String(context.confidence < 0.5));
        }

        if (condition.includes('isCrisisMode()')) {
            evalStr = evalStr.replace('isCrisisMode()', String(context.mode === 'CRISIS'));
        }

        // For now, handle simple true/false strings
        return evalStr.toLowerCase() === 'true';
    }

    /**
     * Track evaluation result
     */
    private trackEvaluation(result: PolicyEvaluationResult): void {
        this.evaluationHistory.push(result);

        // Keep last 50 evaluations
        if (this.evaluationHistory.length > 50) {
            this.evaluationHistory = this.evaluationHistory.slice(-50);
        }
    }

    /**
     * Add a new policy
     */
    addPolicy(policy: Policy): void {
        this.policies.push(policy);
        this.policies.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Remove a policy
     */
    removePolicy(policyId: string): boolean {
        const index = this.policies.findIndex(p => p.id === policyId);
        if (index !== -1) {
            this.policies.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Enable/disable a policy
     */
    setEnabled(policyId: string, enabled: boolean): boolean {
        const policy = this.policies.find(p => p.id === policyId);
        if (policy) {
            policy.enabled = enabled;
            return true;
        }
        return false;
    }

    /**
     * Get all policies
     */
    getPolicies(): Policy[] {
        return [...this.policies];
    }

    /**
     * Get enabled policies
     */
    getEnabledPolicies(): Policy[] {
        return this.policies.filter(p => p.enabled);
    }

    /**
     * Get evaluation history
     */
    getEvaluationHistory(): PolicyEvaluationResult[] {
        return [...this.evaluationHistory];
    }

    /**
     * Clear evaluation history
     */
    clearHistory(): void {
        this.evaluationHistory = [];
    }

    /**
     * Check if action is allowed by policies
     */
    isAllowed(decision: Decision): boolean {
        const result = this.evaluate(decision);
        return result.action !== 'BLOCK';
    }

    /**
     * Get policy stats
     */
    getStats(): { total: number; enabled: number; evaluations: number } {
        return {
            total: this.policies.length,
            enabled: this.policies.filter(p => p.enabled).length,
            evaluations: this.evaluationHistory.length
        };
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const policyEngine = new OptimusPolicyEngine();
export default policyEngine;
