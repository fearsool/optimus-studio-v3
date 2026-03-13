import { AutomationTemplate } from './store';
import { feedbackService, ProductPerformance } from '../feedbackService';

export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    blockingReasons?: string[];
    score: number;
    fieldScore?: number; // MOD 2: Saha geri bildirimi skoru
}

export interface SellabilityResult {
    sellable: boolean;
    score: number;        // 0-100
    fieldScore: number;   // MOD 2: -1 to +1.3
    reasons: string[];
}

/**
 * 🔍 TEMPLATE VALIDATOR - MOD 2
 * 
 * Template satılabilirlik ve teknik geçerlilik kontrolü.
 * Field feedback skorları dahil edilir.
 */
export class TemplateValidator {

    // Scoring weights
    private readonly WEIGHTS = {
        hasNodes: 15,
        hasDescription: 10,
        hasMasterGoal: 10,
        hasRequiredApis: 10,
        complexityBonus: 5,        // Her node için +1 (max 5)
        refineLevelBonus: {
            'ore': 0,
            'processed': 10,
            'refined': 20
        },
        businessOutcomeBonus: 10,
        fieldScoreMultiplier: 10   // MOD 2: fieldScore * 10
    };

    /**
     * Check if a template meets sellability criteria
     * MOD 2: Field feedback skorları dahil
     */
    isSellable(template: AutomationTemplate): SellabilityResult {
        let score = 0;
        const reasons: string[] = [];

        // 1. Has nodes?
        if (template.blueprint?.nodes && template.blueprint.nodes.length > 0) {
            score += this.WEIGHTS.hasNodes;
        } else {
            reasons.push('Node tanımı eksik');
        }

        // 2. Has description?
        if (template.description && template.description.length > 20) {
            score += this.WEIGHTS.hasDescription;
        } else {
            reasons.push('Açıklama yetersiz');
        }

        // 3. Has master goal?
        if (template.blueprint?.masterGoal) {
            score += this.WEIGHTS.hasMasterGoal;
        } else {
            reasons.push('Ana hedef tanımlı değil');
        }

        // 4. Has required APIs documented?
        if (template.requiredApis && template.requiredApis.length > 0) {
            score += this.WEIGHTS.hasRequiredApis;
        }

        // 5. Complexity bonus (more nodes = more tested)
        const nodeCount = template.blueprint?.nodes?.length || 0;
        score += Math.min(nodeCount, this.WEIGHTS.complexityBonus);

        // 6. Refine level bonus
        const refineLevel = template.refineLevel || 'ore';
        score += this.WEIGHTS.refineLevelBonus[refineLevel] || 0;

        // 7. Business outcome defined?
        if (template.businessOutcome?.problem && template.businessOutcome?.solution) {
            score += this.WEIGHTS.businessOutcomeBonus;
        } else {
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
                } else if (fieldScore < -0.3) {
                    reasons.push(`⚠️ Sahadan negatif geri bildirim: ${(fieldScore * 10).toFixed(1)} puan`);
                }
            }
        } catch {
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
    validate(template: AutomationTemplate): ValidationResult {
        const issues: string[] = [];
        const blockingReasons: string[] = [];

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
        if (template.blueprint?.nodes) {
            template.blueprint.nodes.forEach((node, idx) => {
                if (!node.id) issues.push(`Node ${idx}: ID eksik`);
                if (!node.type) issues.push(`Node ${idx}: Type eksik`);
                if (!node.connections) issues.push(`Node ${idx}: Connections tanımsız`);
            });
        }

        // Blocking reasons check
        if (template.blockingReasons?.some(br => !br.resolved)) {
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
    private getFieldPerformance(templateId: string): ProductPerformance | null {
        try {
            const cache = (feedbackService as any).performanceCache as Map<string, ProductPerformance>;
            return cache.get(templateId) || null;
        } catch {
            return null;
        }
    }
}

export const templateValidator = new TemplateValidator();

