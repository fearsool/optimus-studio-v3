"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateValidator = exports.TemplateValidator = void 0;
const feedbackService_1 = require("../feedbackService");
/**
 * 🔍 TEMPLATE VALIDATOR - MOD 2
 *
 * Template satılabilirlik ve teknik geçerlilik kontrolü.
 * Field feedback skorları dahil edilir.
 */
class TemplateValidator {
    constructor() {
        // Scoring weights
        this.WEIGHTS = {
            hasNodes: 15,
            hasDescription: 10,
            hasMasterGoal: 10,
            hasRequiredApis: 10,
            complexityBonus: 5, // Her node için +1 (max 5)
            refineLevelBonus: {
                'ore': 0,
                'processed': 10,
                'refined': 20
            },
            businessOutcomeBonus: 10,
            fieldScoreMultiplier: 10 // MOD 2: fieldScore * 10
        };
    }
    /**
     * Check if a template meets sellability criteria
     * MOD 2: Field feedback skorları dahil
     */
    isSellable(template) {
        var _a, _b, _c, _d, _e, _f;
        let score = 0;
        const reasons = [];
        // 1. Has nodes?
        if (((_a = template.blueprint) === null || _a === void 0 ? void 0 : _a.nodes) && template.blueprint.nodes.length > 0) {
            score += this.WEIGHTS.hasNodes;
        }
        else {
            reasons.push('Node tanımı eksik');
        }
        // 2. Has description?
        if (template.description && template.description.length > 20) {
            score += this.WEIGHTS.hasDescription;
        }
        else {
            reasons.push('Açıklama yetersiz');
        }
        // 3. Has master goal?
        if ((_b = template.blueprint) === null || _b === void 0 ? void 0 : _b.masterGoal) {
            score += this.WEIGHTS.hasMasterGoal;
        }
        else {
            reasons.push('Ana hedef tanımlı değil');
        }
        // 4. Has required APIs documented?
        if (template.requiredApis && template.requiredApis.length > 0) {
            score += this.WEIGHTS.hasRequiredApis;
        }
        // 5. Complexity bonus (more nodes = more tested)
        const nodeCount = ((_d = (_c = template.blueprint) === null || _c === void 0 ? void 0 : _c.nodes) === null || _d === void 0 ? void 0 : _d.length) || 0;
        score += Math.min(nodeCount, this.WEIGHTS.complexityBonus);
        // 6. Refine level bonus
        const refineLevel = template.refineLevel || 'ore';
        score += this.WEIGHTS.refineLevelBonus[refineLevel] || 0;
        // 7. Business outcome defined?
        if (((_e = template.businessOutcome) === null || _e === void 0 ? void 0 : _e.problem) && ((_f = template.businessOutcome) === null || _f === void 0 ? void 0 : _f.solution)) {
            score += this.WEIGHTS.businessOutcomeBonus;
        }
        else {
            reasons.push('İş sonucu tanımlanmamış');
        }
        // 8. MOD 2: Field Feedback Score
        let fieldScore = 0;
        try {
            const performance = this.getFieldPerformance(template.id);
            if (performance) {
                fieldScore = performance.fieldScore;
                score += fieldScore * this.WEIGHTS.fieldScoreMultiplier;
                if (fieldScore > 0.5) {
                    reasons.push(`✅ Sahadan pozitif geri bildirim: +${(fieldScore * 10).toFixed(1)} puan`);
                }
                else if (fieldScore < -0.3) {
                    reasons.push(`⚠️ Sahadan negatif geri bildirim: ${(fieldScore * 10).toFixed(1)} puan`);
                }
            }
        }
        catch (_g) {
            // Field score unavailable, continue without
        }
        // Final score clamped to 0-100
        score = Math.max(0, Math.min(100, score));
        return {
            sellable: score >= 50 && reasons.filter(r => !r.startsWith('✅')).length <= 2,
            score,
            fieldScore,
            reasons
        };
    }
    /**
     * Validate technical integrity of template
     */
    validate(template) {
        var _a, _b;
        const issues = [];
        const blockingReasons = [];
        // Required fields
        if (!template.id) {
            blockingReasons.push('ID eksik');
        }
        if (!template.name) {
            blockingReasons.push('İsim eksik');
        }
        if (!template.blueprint) {
            blockingReasons.push('Blueprint eksik');
        }
        // Node validation
        if ((_a = template.blueprint) === null || _a === void 0 ? void 0 : _a.nodes) {
            template.blueprint.nodes.forEach((node, idx) => {
                if (!node.id)
                    issues.push(`Node ${idx}: ID eksik`);
                if (!node.type)
                    issues.push(`Node ${idx}: Type eksik`);
                if (!node.connections)
                    issues.push(`Node ${idx}: Connections tanımsız`);
            });
        }
        // Blocking reasons check
        if ((_b = template.blockingReasons) === null || _b === void 0 ? void 0 : _b.some(br => !br.resolved)) {
            template.blockingReasons
                .filter(br => !br.resolved)
                .forEach(br => blockingReasons.push(br.reason));
        }
        const score = 100 - (issues.length * 5) - (blockingReasons.length * 20);
        return {
            isValid: blockingReasons.length === 0,
            issues,
            blockingReasons,
            score: Math.max(0, score)
        };
    }
    /**
     * Get field performance data for a template
     * MOD 2: Sahadan gelen veriler
     */
    getFieldPerformance(templateId) {
        try {
            const cache = feedbackService_1.feedbackService.performanceCache;
            return cache.get(templateId) || null;
        }
        catch (_a) {
            return null;
        }
    }
}
exports.TemplateValidator = TemplateValidator;
exports.templateValidator = new TemplateValidator();
