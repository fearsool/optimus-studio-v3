"use strict";
/**
 * 🎯 OPTIMUS RISK EVALUATOR
 * =========================
 * Risk skorlama modülü
 *
 * DEĞERLENDIRME FAKTÖRLERI:
 * - Intent tipi (system/strategic/natural)
 * - Confidence skoru
 * - Potansiyel etki (financial, destructive)
 * - Sistem durumu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskEvaluator = void 0;
const optimusCore_1 = require("../core/optimusCore");
const RISK_FACTORS = [
    // Low confidence = higher risk
    {
        name: 'low_confidence',
        weight: 0.25,
        evaluate: (intent) => {
            if (intent.confidence >= 0.8)
                return 0;
            if (intent.confidence >= 0.6)
                return 30;
            if (intent.confidence >= 0.4)
                return 60;
            return 100;
        }
    },
    // Financial impact
    {
        name: 'financial_impact',
        weight: 0.20,
        evaluate: (intent) => {
            const financialIntents = ['CREATE_PRODUCT', 'SET_PRICING', 'REFUND', 'PURCHASE'];
            if (financialIntents.includes(intent.action))
                return 70;
            return 0;
        }
    },
    // Destructive actions
    {
        name: 'destructive_action',
        weight: 0.20,
        evaluate: (intent) => {
            const destructiveKeywords = ['DELETE', 'REMOVE', 'CLEAR', 'RESET', 'STOP'];
            if (destructiveKeywords.some(k => intent.action.includes(k)))
                return 80;
            return 0;
        }
    },
    // Unknown intent
    {
        name: 'unknown_intent',
        weight: 0.15,
        evaluate: (intent) => {
            if (intent.action === 'UNKNOWN')
                return 90;
            return 0;
        }
    },
    // System stress
    {
        name: 'system_stress',
        weight: 0.10,
        evaluate: () => {
            const status = optimusCore_1.optimusCore.getStatus();
            if (status.health === 'CRITICAL')
                return 100;
            if (status.health === 'DEGRADED')
                return 50;
            return 0;
        }
    },
    // Crisis mode active
    {
        name: 'crisis_mode',
        weight: 0.10,
        evaluate: () => {
            const mode = optimusCore_1.optimusCore.getMode();
            if (mode === 'CRISIS')
                return 80;
            return 0;
        }
    }
];
const MITIGATIONS = [
    {
        condition: (intent) => intent.type === 'SYSTEM',
        action: 'Log action for audit',
        reduction: 10
    },
    {
        condition: (_, score) => score > 60,
        action: 'Require human approval',
        reduction: 20
    },
    {
        condition: (intent) => intent.action.includes('STOP'),
        action: 'Enable rollback mechanism',
        reduction: 15
    },
    {
        condition: () => optimusCore_1.optimusCore.getMode() === 'CRISIS',
        action: 'Apply crisis protocols',
        reduction: 25
    }
];
// ============================================
// RISK EVALUATOR CLASS
// ============================================
class OptimusRiskEvaluator {
    /**
     * Evaluate risk for an intent
     */
    async evaluate(intent) {
        const factors = [];
        let totalScore = 0;
        let totalWeight = 0;
        // Evaluate each factor
        for (const factor of RISK_FACTORS) {
            const score = factor.evaluate(intent);
            const weightedScore = score * factor.weight;
            totalScore += weightedScore;
            totalWeight += factor.weight;
            // Track significant factors
            if (score > 30) {
                factors.push(`${factor.name}: ${score}`);
            }
        }
        // Normalize score (0-100)
        let normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        // Apply mitigations
        const mitigations = [];
        for (const mitigation of MITIGATIONS) {
            if (mitigation.condition(intent, normalizedScore)) {
                mitigations.push(mitigation.action);
                normalizedScore = Math.max(0, normalizedScore - mitigation.reduction);
            }
        }
        // Determine risk level
        const level = this.scoreToLevel(normalizedScore);
        return {
            level,
            score: Math.round(normalizedScore),
            factors,
            mitigations
        };
    }
    /**
     * Convert score to risk level
     */
    scoreToLevel(score) {
        if (score >= 80)
            return 'CRITICAL';
        if (score >= 60)
            return 'HIGH';
        if (score >= 30)
            return 'MEDIUM';
        return 'LOW';
    }
    /**
     * Quick check if intent is high-risk
     */
    isHighRisk(intent) {
        // Quick heuristics without full evaluation
        const highRiskActions = [
            'DELETE', 'REMOVE', 'STOP', 'CRISIS',
            'EMERGENCY', 'KILL', 'RESET', 'CLEAR'
        ];
        if (highRiskActions.some(a => intent.action.includes(a))) {
            return true;
        }
        if (intent.confidence < 0.5) {
            return true;
        }
        return false;
    }
    /**
     * Get risk summary for display
     */
    getSummary(assessment) {
        const emoji = {
            'LOW': '🟢',
            'MEDIUM': '🟡',
            'HIGH': '🟠',
            'CRITICAL': '🔴'
        };
        return `${emoji[assessment.level]} Risk: ${assessment.level} (Score: ${assessment.score})`;
    }
}
// ============================================
// SINGLETON EXPORT
// ============================================
exports.riskEvaluator = new OptimusRiskEvaluator();
exports.default = exports.riskEvaluator;
