/**
 * 📊 OPTIMUS INTELLIGENCE METRICS
 * ================================
 * Zekâ ölçüm sistemi
 * 
 * "Ölçülmeyen zekâ optimize edilemez"
 * 
 * METRIKLER:
 * - Doğru karar oranı
 * - İnsan override sayısı
 * - Gereksiz aksiyon sayısı
 * - FailSafe tetiklenme sıklığı
 * - Ortalama yanıt süresi
 */

import { IntelligenceMetrics, Decision } from '../core/optimusTypes';

// ============================================
// METRICS STORAGE
// ============================================

interface MetricDataPoint {
    value: number;
    timestamp: Date;
}

interface DecisionOutcome {
    decisionId: string;
    wasCorrect: boolean;
    wasOverridden: boolean;
    wasUnnecessary: boolean;
    responseTimeMs: number;
    timestamp: Date;
}

// ============================================
// INTELLIGENCE METRICS CLASS
// ============================================

class OptimusIntelligenceMetrics {
    private outcomes: DecisionOutcome[] = [];
    private failSafeTriggers: Date[] = [];
    private speechEvents: Array<{ shouldHaveSpoken: boolean; didSpeak: boolean; timestamp: Date }> = [];
    private metricsHistory: Array<IntelligenceMetrics & { timestamp: Date }> = [];

    /**
     * Record a decision outcome
     */
    recordOutcome(outcome: DecisionOutcome): void {
        this.outcomes.push(outcome);

        // Keep last 1000 outcomes
        if (this.outcomes.length > 1000) {
            this.outcomes = this.outcomes.slice(-1000);
        }
    }

    /**
     * Record human override
     */
    recordOverride(decisionId: string): void {
        const outcome = this.outcomes.find(o => o.decisionId === decisionId);
        if (outcome) {
            outcome.wasOverridden = true;
        } else {
            this.outcomes.push({
                decisionId,
                wasCorrect: false,
                wasOverridden: true,
                wasUnnecessary: false,
                responseTimeMs: 0,
                timestamp: new Date()
            });
        }
    }

    /**
     * Record failsafe trigger
     */
    recordFailSafeTrigger(): void {
        this.failSafeTriggers.push(new Date());

        // Keep last 100 triggers
        if (this.failSafeTriggers.length > 100) {
            this.failSafeTriggers = this.failSafeTriggers.slice(-100);
        }
    }

    /**
     * Record speech event
     */
    recordSpeechEvent(shouldHaveSpoken: boolean, didSpeak: boolean): void {
        this.speechEvents.push({
            shouldHaveSpoken,
            didSpeak,
            timestamp: new Date()
        });

        // Keep last 500 events
        if (this.speechEvents.length > 500) {
            this.speechEvents = this.speechEvents.slice(-500);
        }
    }

    /**
     * Calculate current metrics
     */
    calculate(): IntelligenceMetrics {
        const now = new Date();

        // Only consider recent outcomes (last 24 hours)
        const recentOutcomes = this.outcomes.filter(
            o => now.getTime() - o.timestamp.getTime() < 24 * 60 * 60 * 1000
        );

        // Correct decision rate
        const correctCount = recentOutcomes.filter(o => o.wasCorrect).length;
        const correctDecisionRate = recentOutcomes.length > 0
            ? correctCount / recentOutcomes.length
            : 1;

        // Human override count
        const humanOverrideCount = recentOutcomes.filter(o => o.wasOverridden).length;

        // Unnecessary action count
        const unnecessaryActionCount = recentOutcomes.filter(o => o.wasUnnecessary).length;

        // False speech rate (spoke when shouldn't have)
        const recentSpeech = this.speechEvents.filter(
            s => now.getTime() - s.timestamp.getTime() < 24 * 60 * 60 * 1000
        );
        const falseSpeech = recentSpeech.filter(s => !s.shouldHaveSpoken && s.didSpeak).length;
        const falseSpeechRate = recentSpeech.length > 0
            ? falseSpeech / recentSpeech.length
            : 0;

        // FailSafe trigger count (last 24h)
        const recentFailSafe = this.failSafeTriggers.filter(
            t => now.getTime() - t.getTime() < 24 * 60 * 60 * 1000
        );
        const failSafeTriggerCount = recentFailSafe.length;

        // Average response time
        const responseTimes = recentOutcomes.map(o => o.responseTimeMs).filter(t => t > 0);
        const averageResponseTimeMs = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;

        const metrics: IntelligenceMetrics = {
            correctDecisionRate,
            humanOverrideCount,
            unnecessaryActionCount,
            falseSpeechRate,
            failSafeTriggerCount,
            averageResponseTimeMs,
            lastUpdated: now
        };

        // Store in history
        this.metricsHistory.push({ ...metrics, timestamp: now });
        if (this.metricsHistory.length > 100) {
            this.metricsHistory = this.metricsHistory.slice(-100);
        }

        return metrics;
    }

    /**
     * Get current metrics
     */
    getMetrics(): IntelligenceMetrics {
        return this.calculate();
    }

    /**
     * Get metrics summary for display
     */
    getSummary(): string {
        const m = this.calculate();
        return `
📊 OPTIMUS Intelligence Metrics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Doğru Karar Oranı: ${(m.correctDecisionRate * 100).toFixed(1)}%
👤 İnsan Override: ${m.humanOverrideCount}
⚠️ Gereksiz Aksiyon: ${m.unnecessaryActionCount}
🗣️ Yanlış Konuşma Oranı: ${(m.falseSpeechRate * 100).toFixed(1)}%
🛡️ FailSafe Tetikleme: ${m.failSafeTriggerCount}
⏱️ Ort. Yanıt Süresi: ${m.averageResponseTimeMs.toFixed(0)}ms
        `.trim();
    }

    /**
     * Get health indicator
     */
    getHealthIndicator(): 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' {
        const m = this.calculate();

        if (m.correctDecisionRate >= 0.9 && m.failSafeTriggerCount === 0) {
            return 'EXCELLENT';
        }
        if (m.correctDecisionRate >= 0.7 && m.failSafeTriggerCount <= 2) {
            return 'GOOD';
        }
        if (m.correctDecisionRate >= 0.5 || m.failSafeTriggerCount <= 5) {
            return 'WARNING';
        }
        return 'CRITICAL';
    }

    /**
     * Get metrics history
     */
    getHistory(): typeof this.metricsHistory {
        return [...this.metricsHistory];
    }

    /**
     * Get trend (improving/declining)
     */
    getTrend(): 'IMPROVING' | 'STABLE' | 'DECLINING' {
        if (this.metricsHistory.length < 2) return 'STABLE';

        const recent = this.metricsHistory.slice(-5);
        const older = this.metricsHistory.slice(-10, -5);

        if (recent.length === 0 || older.length === 0) return 'STABLE';

        const recentAvg = recent.reduce((a, b) => a + b.correctDecisionRate, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b.correctDecisionRate, 0) / older.length;

        if (recentAvg > olderAvg + 0.05) return 'IMPROVING';
        if (recentAvg < olderAvg - 0.05) return 'DECLINING';
        return 'STABLE';
    }

    /**
     * Reset all metrics
     */
    reset(): void {
        this.outcomes = [];
        this.failSafeTriggers = [];
        this.speechEvents = [];
        this.metricsHistory = [];
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const intelligenceMetrics = new OptimusIntelligenceMetrics();
export default intelligenceMetrics;
