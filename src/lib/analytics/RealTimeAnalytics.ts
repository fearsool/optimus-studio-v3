export interface FactoryMetrics {
    videosProduced: number;
    automationsPackaged: number;
    avgCTR: number;
    hourlyRevenue: number;
    errorRate: number;
}

export class RealTimeAnalytics {
    private metrics: FactoryMetrics = {
        videosProduced: 0,
        automationsPackaged: 0,
        avgCTR: 0,
        hourlyRevenue: 0,
        errorRate: 0
    };

    trackProduction(type: 'video' | 'automation') {
        if (type === 'video') this.metrics.videosProduced++;
        else this.metrics.automationsPackaged++;
        console.log(`[Analytics] Tracked ${type} production. Total:`, this.metrics);
    }

    reportError(module: string) {
        this.metrics.errorRate += 0.05;
        console.warn(`[Analytics] Error reported in ${module}. Error rate now:`, this.metrics.errorRate);
    }

    getStats(): FactoryMetrics {
        return { ...this.metrics };
    }
}
