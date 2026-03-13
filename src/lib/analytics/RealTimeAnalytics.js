"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAnalytics = void 0;
class RealTimeAnalytics {
    constructor() {
        this.metrics = {
            videosProduced: 0,
            automationsPackaged: 0,
            avgCTR: 0,
            hourlyRevenue: 0,
            errorRate: 0
        };
    }
    trackProduction(type) {
        if (type === 'video')
            this.metrics.videosProduced++;
        else
            this.metrics.automationsPackaged++;
        console.log(`[Analytics] Tracked ${type} production. Total:`, this.metrics);
    }
    reportError(module) {
        this.metrics.errorRate += 0.05;
        console.warn(`[Analytics] Error reported in ${module}. Error rate now:`, this.metrics.errorRate);
    }
    getStats() {
        return { ...this.metrics };
    }
}
exports.RealTimeAnalytics = RealTimeAnalytics;
