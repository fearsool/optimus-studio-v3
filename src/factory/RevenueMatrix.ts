import { RevenueProjection, ScalingStrategy, SalesData, SalesChannel } from '../types';
import { SalesAutomationEngine } from './SalesAutomationEngine';

export class RevenueMatrix {
    private salesEngine: SalesAutomationEngine;

    constructor() {
        // Stub initialization if SalesAutomationEngine needs args, assuming no args or simple init
        this.salesEngine = new SalesAutomationEngine();
    }

    // GELİR PROJEKSİYONU
    calculateProjection(currentSales: SalesData): RevenueProjection {
        const growthRate = 1.15; // Aylık %15 büyüme

        const months = [];
        let monthlyRevenue = currentSales.total;

        for (let i = 1; i <= 12; i++) {
            // Growth calc
            monthlyRevenue = monthlyRevenue * growthRate;

            months.push({
                name: `Ay ${i}`,
                productSales: Math.round(monthlyRevenue * 0.6),
                affiliate: Math.round(monthlyRevenue * 0.2),
                custom: Math.round(monthlyRevenue * 0.1),
                consulting: Math.round(monthlyRevenue * 0.05),
                crypto: Math.round(monthlyRevenue * 0.05),
                total: Math.round(monthlyRevenue)
            });
        }

        const totalYearly = months.reduce((sum, m) => sum + m.total, 0);

        return {
            months,
            totalYearly,
            passivePercentage: 85 // %85 pasif gelir hedefi
        };
    }

    // OTOMATİK BÜYÜME STRATEJİSİ
    async autoScaleBusiness(revenue: number): Promise<ScalingStrategy> {
        const strategy: ScalingStrategy = {
            actions: [],
            investment: 0,
            expectedROI: 0
        };

        if (revenue > 10000) {
            // 10k+ Gelir: Agresif Büyüme
            strategy.actions = [
                'Google Ads bütçesini %50 artır',
                'Yeni 5 ürün geliştir',
                'Influencer marketing başlat',
                'Kripto portföyünü çeşitlendir'
            ];
            strategy.investment = revenue * 0.4;
            strategy.expectedROI = 300; // %300

        } else if (revenue > 5000) {
            // 5k+ Gelir: Optimizasyon
            strategy.actions = [
                'Dönüşüm oranlarını optimize et',
                'Email marketing otomasyonunu geliştir',
                'Affiliate komisyonlarını %35\'e çıkar',
                'SEO çalışmalarını artır'
            ];
            strategy.investment = revenue * 0.3;
            strategy.expectedROI = 250;

        } else {
            // Başlangıç: Trafik Odaklı
            strategy.actions = [
                'Organik içerik üretimini 2 katına çıkar',
                'Sosyal medya etkileşimini artır',
                'Ücretsiz araçlar (lead magnet) yayınla',
                'Topluluk oluştur'
            ];
            strategy.investment = revenue * 0.5; // Agresif yatırım
            strategy.expectedROI = 200;
        }

        // Stratejiyi uygula
        await this.executeStrategy(strategy);

        return strategy;
    }

    private async executeStrategy(strategy: ScalingStrategy): Promise<void> {
        console.log('🚀 Büyüme stratejisi uygulanıyor:', strategy);
        // SalesEngine üzerinden aksiyonları tetikle (Stub)
        // strategy.actions.forEach(action => this.salesEngine.triggerAction(action));
    }
}
