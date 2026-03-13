"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackService = exports.FeedbackType = void 0;
const uuid_1 = require("uuid");
/**
 * FEEDBACK TYPES
 * Satış ve ürün performans verisi
 */
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["SALE"] = "SALE";
    FeedbackType["REFUND"] = "REFUND";
    FeedbackType["ABANDON"] = "ABANDON";
    FeedbackType["VIEW"] = "VIEW";
    FeedbackType["USER_RATING"] = "RATING";
    // MOD 2: Field feedback (sahadan gelen veriler)
    FeedbackType["FIELD_CONVERSION"] = "FIELD_CONVERSION";
    FeedbackType["FIELD_ERROR"] = "FIELD_ERROR";
    FeedbackType["FIELD_USAGE"] = "FIELD_USAGE"; // Kullanım metriği
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
/**
 * FEEDBACK SERVICE
 * Öğrenen fabrika için veri toplayıcı
 */
class FeedbackService {
    constructor() {
        // In-memory storage for MVP (Production: Supabase)
        this.events = [];
        this.performanceCache = new Map();
        // Load initial mock data for demo
        this.seedMockData();
    }
    /**
     * Log a new feedback event
     */
    async logEvent(event) {
        const fullEvent = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
            ...event
        };
        this.events.push(fullEvent);
        this.updatePerformance(fullEvent.product_id);
        console.log(`[Feedback] Logged: ${event.type} for ${event.product_id}`);
    }
    /**
     * Get aggregate confirmation for Nemotron context
     * This makes Nemotron "smart" about what sells
     */
    getGlobalContext() {
        const topPerformers = this.getTopPerformers(3);
        const revenue = this.getTotalRevenue();
        return `
MARKET FEEDBACK SUMMARY:
- Total Revenue: $${revenue.toFixed(2)}
- Top Selling Products: ${topPerformers.map(p => p.productId).join(', ')}
- Global Refund Rate: ${(this.getGlobalRefundRate() * 100).toFixed(1)}%

LEARNINGS:
${topPerformers.map(p => `- ${p.productId}: High conversion (${(p.conversionRate * 100).toFixed(1)}%). Segments: Agency.`).join('\n')}
`;
    }
    /**
     * Get specific product context
     */
    getProductContext(productId) {
        const perf = this.performanceCache.get(productId);
        if (!perf)
            return "No sales data available.";
        return `
PRODUCT PERFORMANCE (${productId}):
- Sales: ${perf.totalSales} ($${perf.totalRevenue})
- Refund Rate: ${(perf.refundRate * 100).toFixed(1)}%
- Market Fit Score: ${perf.marketFitScore}/100
- Objections: ${perf.topObjections.join(', ')}
`;
    }
    // --- Private Helpers ---
    updatePerformance(productId) {
        const productEvents = this.events.filter(e => e.product_id === productId);
        const sales = productEvents.filter(e => e.type === FeedbackType.SALE);
        const refunds = productEvents.filter(e => e.type === FeedbackType.REFUND);
        const views = productEvents.filter(e => e.type === FeedbackType.VIEW);
        // MOD 2: Field events
        const fieldConversions = productEvents.filter(e => e.type === FeedbackType.FIELD_CONVERSION).length;
        const fieldErrors = productEvents.filter(e => e.type === FeedbackType.FIELD_ERROR).length;
        const fieldUsage = productEvents.filter(e => e.type === FeedbackType.FIELD_USAGE).length;
        const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
        const refundRate = sales.length > 0 ? refunds.length / sales.length : 0;
        const conversionRate = views.length > 0 ? sales.length / views.length : 0;
        // Simple Market Fit Formula
        let score = 50;
        score += conversionRate * 100; // +Conversion
        score -= refundRate * 200; // -Refunds
        score += Math.min(sales.length * 2, 30); // +Volume (capped)
        // MOD 2: Field Score Adjustment
        // +0.2 per conversion (cap: +1.0), -0.3 per error (cap: -1.0), +0.05 per usage (cap: +0.3)
        let fieldScore = 0;
        fieldScore += Math.min(fieldConversions * 0.2, 1.0); // Conversion bonus
        fieldScore -= Math.min(fieldErrors * 0.3, 1.0); // Error penalty
        fieldScore += Math.min(fieldUsage * 0.05, 0.3); // Usage bonus
        // Apply field score to market fit (scaled)
        score += fieldScore * 10; // fieldScore -1 to +1.3 → -10 to +13 points
        this.performanceCache.set(productId, {
            productId,
            totalSales: sales.length,
            totalRevenue,
            refundRate,
            conversionRate,
            marketFitScore: Math.max(0, Math.min(100, score)),
            topObjections: refunds.map(r => r.reason || 'Unknown').slice(0, 3),
            // MOD 2 fields
            fieldConversions,
            fieldErrors,
            fieldUsage,
            fieldScore
        });
    }
    getTopPerformers(limit) {
        return Array.from(this.performanceCache.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, limit);
    }
    getTotalRevenue() {
        return this.events
            .filter(e => e.type === FeedbackType.SALE)
            .reduce((sum, e) => sum + (e.amount || 0), 0);
    }
    getGlobalRefundRate() {
        const totalSales = this.events.filter(e => e.type === FeedbackType.SALE).length;
        const totalRefunds = this.events.filter(e => e.type === FeedbackType.REFUND).length;
        return totalSales > 0 ? totalRefunds / totalSales : 0;
    }
    seedMockData() {
        // Seed some data so the system isn't "stupid" on day 1
        this.logEvent({ product_id: 'instagram-caption', type: FeedbackType.SALE, amount: 9, customer_segment: 'Influencer' });
        this.logEvent({ product_id: 'instagram-caption', type: FeedbackType.SALE, amount: 9, customer_segment: 'Agency' });
        this.logEvent({ product_id: 'blog-post', type: FeedbackType.VIEW });
        this.logEvent({ product_id: 'blog-post', type: FeedbackType.ABANDON, reason: 'Too expensive' });
    }
}
exports.feedbackService = new FeedbackService();
exports.default = exports.feedbackService;
